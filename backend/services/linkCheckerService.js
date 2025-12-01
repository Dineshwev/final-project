import axios from 'axios';
import * as cheerio from 'cheerio';
import robotsParser from 'robots-parser';
let puppeteerLibLC = null;
async function getPuppeteerLC(useStealth = false) {
	if (!puppeteerLibLC) {
		try {
			if (useStealth) {
				const puppeteerExtra = await import('puppeteer-extra');
				const stealth = await import('puppeteer-extra-plugin-stealth');
				puppeteerExtra.default.use(stealth.default());
				puppeteerLibLC = puppeteerExtra;
			} else {
				const puppeteer = await import('puppeteer');
				puppeteerLibLC = { default: puppeteer.default };
			}
		} catch (e) {
			const puppeteer = await import('puppeteer');
			puppeteerLibLC = { default: puppeteer.default };
		}
	}
	return puppeteerLibLC;
}
import { promisify } from 'util';
import db from '../db/init.js';

const dbRun = promisify(db.run).bind(db);
const dbGet = promisify(db.get).bind(db);
const dbAll = promisify(db.all).bind(db);

// Simple concurrency limiter (semaphore)
class Semaphore {
	constructor(limit) { this.limit = limit; this.active = 0; this.queue = []; }
	async acquire() {
		if (this.active < this.limit) { this.active++; return; }
		return new Promise(resolve => this.queue.push(resolve));
	}
	release() {
		this.active--; if (this.queue.length) { this.active++; this.queue.shift()(); }
	}
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * Extract links & images from HTML
 */
function extractResources(baseUrl, html) {
	const $ = cheerio.load(html);
	const origin = new URL(baseUrl).origin;
	const links = new Set();
	$('a[href]').each((_, el) => {
		let href = $(el).attr('href');
		if (!href || href.startsWith('#') || href.startsWith('mailto:')) return;
		try {
			const abs = new URL(href, baseUrl).href;
			links.add(abs);
		} catch {}
	});
	const images = [];
	$('img[src]').each((_, el) => {
		let src = $(el).attr('src');
		if (!src) return;
		try { images.push(new URL(src, baseUrl).href); } catch {}
	});
  // Stylesheets and canonical/preload links
  const assets = [];
  $('link[href]').each((_, el) => {
    const rel = ($(el).attr('rel') || '').toLowerCase();
    if (!rel) return;
    if (['stylesheet','preload','prefetch','canonical','icon'].includes(rel)) {
      const href = $(el).attr('href');
      if (href) { try { assets.push(new URL(href, baseUrl).href); } catch {} }
    }
  });
	// Separate internal vs external
	const internal = []; const external = [];
	[...links].forEach(l => (l.startsWith(origin) ? internal : external).push(l));
	return { internal, external, images, assets };
}

/** Redirect chain fetch */
async function fetchWithRedirectChain(url, timeoutMs = 10000) {
	const chain = [];
	try {
		const resp = await axios.get(url, { maxRedirects: 5, validateStatus: () => true, timeout: timeoutMs });
		// axios doesn't expose chain directly; approximate if final URL differs
		if (resp.request && resp.request._redirectable && resp.request._redirectable._redirectCount) {
			chain.push({ url, status: resp.status });
		}
		return { status: resp.status, finalUrl: resp.request.res.responseUrl || url, chainLength: resp.request._redirectable?._redirectCount || 0 };
	} catch (e) {
		if (e.response) {
			return { status: e.response.status, finalUrl: url, chainLength: 0, error: e.message };
		}
		return { status: 0, finalUrl: url, chainLength: 0, error: e.message };
	}
}

/** Priority scoring */
function computeFixPriority(item) {
	const { status, chainLength, type } = item;
	let score = 0;
	if (status === 404) score += 100;
	else if (status >= 500) score += 100;
	else if (status === 0) score += 80; // network error
	else if (status >= 400) score += 70;
	if (chainLength > 1) score += (chainLength - 1) * 10;
	if (type === 'image' && (status >= 400 || status === 0)) score += 80;
	if (type === 'internal' && status === 404) score += 20; // internal 404 extra weight
	return Math.min(score, 100);
}

/** Crawl & check links */
function buildAxiosProxy(proxyUrl) {
	try {
		if (!proxyUrl) return undefined;
		const u = new URL(proxyUrl);
		const auth = u.username ? { username: u.username, password: u.password } : undefined;
		return { protocol: u.protocol.replace(':',''), host: u.hostname, port: parseInt(u.port)|| (u.protocol==='https:'?443:80), auth };
	} catch { return undefined; }
}

async function axiosGetWithRetries(url, config, maxRetries = 2, baseDelay = 300) {
	let attempt = 0; let lastErr;
	while (attempt <= maxRetries) {
		try { return await axios.get(url, config); } catch (e) {
			lastErr = e; attempt++;
			if (attempt > maxRetries) break;
			const jitter = Math.floor(Math.random()*100);
			const delay = baseDelay * Math.pow(2, attempt-1) + jitter;
			await new Promise(r=>setTimeout(r, delay));
		}
	}
	throw lastErr;
}

async function fetchPageHtml(url, headers, useHeadless = false, opts = {}) {
	try {
		const resp = await axiosGetWithRetries(url, { timeout: opts.timeoutMs || 15000, headers, proxy: buildAxiosProxy(opts.proxy) }, opts.maxRetries || 2);
		return resp.data;
	} catch (e) {
		if (useHeadless) {
			try {
				const puppeteer = await getPuppeteerLC(!!opts.useStealth);
				const launchArgs = ['--no-sandbox','--disable-setuid-sandbox'];
				if (opts.proxy) launchArgs.push(`--proxy-server=${opts.proxy}`);
				const browser = await puppeteer.default.launch({ args: launchArgs });
				const page = await browser.newPage();
				if (opts.proxy) {
					try {
						const u = new URL(opts.proxy);
						if (u.username) await page.authenticate({ username: u.username, password: u.password });
					} catch {}
				}
				await page.setUserAgent(headers['User-Agent']);
				if (opts.headersExtra) await page.setExtraHTTPHeaders(opts.headersExtra);
				if (opts.cookies && Array.isArray(opts.cookies) && opts.cookies.length) {
					const cookies = opts.cookies.map(c => ({ url, name: c.name, value: c.value, domain: c.domain, path: c.path || '/', httpOnly: !!c.httpOnly, secure: !!c.secure }));
					await page.setCookie(...cookies);
				}
				await page.goto(url, { waitUntil: 'networkidle2', timeout: opts.timeoutMs || 30000 });
				const html = await page.content();
				await browser.close();
				return html;
			} catch (err) {
				throw new Error('Headless fetch failed: ' + (err.message || String(err)));
			}
		}
		throw e;
	}
}

export async function runLinkCheck(startUrl, options = {}) {
	const concurrency = options.concurrency || 6;
	const semaphore = new Semaphore(concurrency);
	const visited = new Set();
	const results = [];
		const headers = {
			'User-Agent': options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
			'Accept-Language': 'en-US,en;q=0.9',
			...(options.headers || {})
		};
		if (options.cookieHeader) headers['Cookie'] = options.cookieHeader;
	const depth = Number.isFinite(options.depth) ? options.depth : 0;
	const maxPages = options.maxPages || 10;
	const useHeadless = !!options.useHeadless;

	// Crawl queue for internal pages up to depth
	const origin = new URL(startUrl).origin;
	const queue = [{ url: startUrl, depth: 0 }];
	const allInternal = new Set();
	const allExternal = new Set();
	const allImages = new Set();
	let pagesFetched = 0;

		// robots.txt handling
		let robots;
		if (options.respectRobots) {
			try {
				const robotsUrl = new URL('/robots.txt', origin).href;
				const robotsTxt = await axiosGetWithRetries(robotsUrl, { timeout: 8000, headers }, 1);
				robots = robotsParser(robotsUrl, robotsTxt.data || '');
			} catch {}
		}

		while (queue.length && pagesFetched < maxPages) {
		const { url, depth: curDepth } = queue.shift();
		if (visited.has(url)) continue;
		visited.add(url);
			if (robots && options.respectRobots) {
				const disallowed = !robots.isAllowed(url, '*');
				if (disallowed) continue;
			}
		let html;
		try {
				html = await fetchPageHtml(url, headers, useHeadless && curDepth === 0, {
					proxy: options.proxy,
					maxRetries: options.maxRetries || 2,
					timeoutMs: options.timeoutMs || 15000,
					useStealth: options.useStealth,
					headersExtra: options.headers,
					cookies: options.cookies
				});
		} catch (e) {
			if (curDepth === 0) {
				return {
					summary: { total: 0, broken: 0, redirects: 0, imagesBroken: 0, orphanedPages: 0 },
					orphanedPages: [],
					results: [],
					warning: `Unable to fetch start URL (${e.response?.status || e.message || 'network error'})`
				};
			}
			continue;
		}
		pagesFetched++;
		const { internal, external, images } = extractResources(url, html);
		internal.forEach(u => allInternal.add(u));
		external.forEach(u => allExternal.add(u));
		images.forEach(u => allImages.add(u));
			if (curDepth < depth) {
			internal.forEach(u => { if (u.startsWith(origin) && !visited.has(u)) queue.push({ url: u, depth: curDepth + 1 }); });
		}
			if (options.respectRobots && robots) {
				const delay = robots.getCrawlDelay('*');
				if (delay) await sleep(delay * 1000);
			}
	}

	const toCheck = [
		...[...allInternal].map(u => ({ url: u, type: 'internal' })),
		...[...allExternal].map(u => ({ url: u, type: 'external' })),
		...[...allImages].map(u => ({ url: u, type: 'image' }))
	];

	let completed = 0;
		async function checkItem(item) {
		await semaphore.acquire();
		try {
			const { status, finalUrl, chainLength, error } = await fetchWithRedirectChain(item.url);
			const entry = {
				url: item.url,
				finalUrl,
				status,
				chainLength,
				type: item.type,
				error: error || null
			};
			entry.priority = computeFixPriority(entry);
			results.push(entry);
		} finally {
			completed++; semaphore.release();
			if (options.onProgress) options.onProgress({ completed, total: toCheck.length });
			if (options.delay) await sleep(options.delay);
		}
	}

	await Promise.all(toCheck.map(i => checkItem(i)));

	const broken = results.filter(r => r.status === 404 || r.status === 0 || r.status >= 500);
	const redirectChains = results.filter(r => r.chainLength > 1);
	const imagesBroken = results.filter(r => r.type === 'image' && (r.status === 404 || r.status === 0));

	// Orphaned pages heuristic: internal links with no other pages linking back (single appearance)
	const internalCounts = internal.reduce((acc, u) => { acc[u] = (acc[u]||0)+1; return acc; }, {});
	const orphaned = Object.keys(internalCounts).filter(u => internalCounts[u] === 1);

	return {
		summary: {
			total: toCheck.length,
			broken: broken.length,
			redirects: redirectChains.length,
			imagesBroken: imagesBroken.length,
			orphanedPages: orphaned.length
		},
		orphanedPages: orphaned,
		results
	};
}

export async function saveLinkCheck(startUrl, data) {
	const stmt = `INSERT INTO link_checks (url, status, completed_at, total_links, broken_count, redirects_count, images_broken, results)
							 VALUES (?, ?, datetime('now'), ?, ?, ?, ?, ?)`;
	await dbRun(stmt, [
		startUrl,
		'completed',
		data.summary.total,
		data.summary.broken,
		data.summary.redirects,
		data.summary.imagesBroken,
		JSON.stringify(data.results)
	]);
	const row = await dbGet('SELECT last_insert_rowid() as id');
	return row.id;
}

export async function getLinkCheck(id) {
	const row = await dbGet('SELECT * FROM link_checks WHERE id = ?', [id]);
	if (!row) return null;
	return {
		id: row.id,
		url: row.url,
		status: row.status,
		createdAt: row.created_at,
		completedAt: row.completed_at,
		summary: {
			total: row.total_links,
			broken: row.broken_count,
			redirects: row.redirects_count,
			imagesBroken: row.images_broken
		},
		results: JSON.parse(row.results || '[]')
	};
}

export async function listLinkChecks(limit=20, offset=0) {
	const rows = await dbAll('SELECT id, url, status, created_at, completed_at, total_links, broken_count FROM link_checks ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
	return rows.map(r => ({
		id: r.id,
		url: r.url,
		status: r.status,
		createdAt: r.created_at,
		completedAt: r.completed_at,
		totalLinks: r.total_links,
		broken: r.broken_count
	}));
}

export default { runLinkCheck, saveLinkCheck, getLinkCheck, listLinkChecks };
