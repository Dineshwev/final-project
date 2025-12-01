import axios from 'axios';
import { load as loadCheerio } from 'cheerio';
let puppeteerLib = null;
let stealthPlugin = null;
async function getPuppeteer(useStealth = false) {
  if (!puppeteerLib) {
    try {
      if (useStealth) {
        const puppeteerExtra = await import('puppeteer-extra');
        const stealth = await import('puppeteer-extra-plugin-stealth');
        puppeteerExtra.default.use(stealth.default());
        puppeteerLib = puppeteerExtra;
        stealthPlugin = stealth;
      } else {
        const puppeteer = await import('puppeteer');
        puppeteerLib = { default: puppeteer.default };
      }
    } catch (e) {
      // Fallback to regular puppeteer if stealth not available
      const puppeteer = await import('puppeteer');
      puppeteerLib = { default: puppeteer.default };
    }
  }
  return puppeteerLib;
}

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

export async function fetchHtml(url, opts = {}) {
  // Use a browser-like User-Agent to reduce 403/anti-bot blocks
  const headers = {
    'User-Agent': opts.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    ...(opts.headers || {})
  };
  if (opts.cookieHeader) headers['Cookie'] = opts.cookieHeader;
  try {
    const resp = await axiosGetWithRetries(url, { timeout: opts.timeoutMs || 15000, headers, proxy: buildAxiosProxy(opts.proxy) }, opts.maxRetries || 2);
    return resp.data;
  } catch (e) {
    // Retry with alternate UA (Safari) once
    const altHeaders = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      'Accept-Language': 'en-US,en;q=0.9',
      ...(opts.headers || {})
    };
    if (opts.cookieHeader) altHeaders['Cookie'] = opts.cookieHeader;
    const resp2 = await axiosGetWithRetries(url, { timeout: opts.timeoutMs || 15000, headers: altHeaders, proxy: buildAxiosProxy(opts.proxy) }, opts.maxRetries || 2);
    return resp2.data;
  }
}

async function fetchHtmlHeadless(url, opts = {}) {
  try {
    const useStealth = !!opts.useStealth;
    const puppeteer = await getPuppeteer(useStealth);
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
    await page.setUserAgent(opts.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36');
    if (opts.headers) await page.setExtraHTTPHeaders(opts.headers);
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

export function extractStructuredData(html) {
  const $ = loadCheerio(html);
  const jsonLd = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const txt = $(el).contents().text();
      const data = JSON.parse(txt);
      if (Array.isArray(data)) jsonLd.push(...data); else jsonLd.push(data);
    } catch {}
  });

  // Microdata
  const microdata = [];
  $('[itemscope]').each((_, el) => {
    const $el = $(el);
    const type = $el.attr('itemtype') || null;
    const item = { type, properties: {} };
    $el.find('[itemprop]').each((__, prop) => {
      const name = $(prop).attr('itemprop');
      const val = $(prop).attr('content') || $(prop).text().trim();
      if (!item.properties[name]) item.properties[name] = [];
      item.properties[name].push(val);
    });
    microdata.push(item);
  });

  // RDFa (basic)
  const rdfa = [];
  $('[typeof]').each((_, el) => {
    const $el = $(el);
    const type = $el.attr('typeof');
    const vocab = $el.attr('vocab') || null;
    const about = $el.attr('about') || $el.attr('resource') || null;
    rdfa.push({ type, vocab, about });
  });

  return { jsonLd, microdata, rdfa };
}

// Minimal validators for common types
const requiredByType = {
  'Article': ['headline', 'datePublished'],
  'NewsArticle': ['headline', 'datePublished'],
  'BlogPosting': ['headline', 'datePublished'],
  'Product': ['name'],
  'FAQPage': ['mainEntity'],
  'Organization': ['name'],
  'BreadcrumbList': ['itemListElement']
};

export function validateSchemas(sd) {
  const issues = [];
  const suggestions = [];
  const detections = [];

  const checkRequired = (type, obj, path) => {
    const req = requiredByType[type];
    if (!req) return;
    req.forEach(field => {
      const ok = obj && Object.prototype.hasOwnProperty.call(obj, field);
      if (!ok) issues.push({ type, path, message: `Missing required field: ${field}` });
    });
  };

  // JSON-LD
  sd.jsonLd.forEach((obj, i) => {
    const type = Array.isArray(obj['@type']) ? obj['@type'][0] : obj['@type'];
    detections.push({ format: 'json-ld', type, index: i });
    if (type) checkRequired(type, obj, `json-ld[${i}]`);
  });

  // Microdata
  sd.microdata.forEach((m, i) => {
    let type = m.type ? m.type.split('/').pop() : null;
    detections.push({ format: 'microdata', type, index: i });
    if (type) checkRequired(type, m.properties, `microdata[${i}]`);
  });

  // RDFa (no strict validation here)
  sd.rdfa.forEach((r, i) => {
    const type = r.type ? r.type.split(':').pop() : null;
    detections.push({ format: 'rdfa', type, index: i });
  });

  // Suggest opportunities if none detected
  if (sd.jsonLd.length === 0 && sd.microdata.length === 0 && sd.rdfa.length === 0) {
    suggestions.push('No schema markup detected. Consider adding Article, Product, FAQPage, Organization, and BreadcrumbList where appropriate.');
  }

  return { detections, issues, suggestions };
}

export function buildSnippetPreviews(sd) {
  const previews = [];
  sd.jsonLd.forEach((obj) => {
    const type = Array.isArray(obj['@type']) ? obj['@type'][0] : obj['@type'];
    if (!type) return;
    if (type === 'Article' || type === 'BlogPosting' || type === 'NewsArticle') {
      previews.push({ type, title: obj.headline, date: obj.datePublished, author: obj.author?.name || obj.author });
    } else if (type === 'Product') {
      const price = obj.offers?.price || obj.offers?.[0]?.price;
      previews.push({ type, title: obj.name, rating: obj.aggregateRating?.ratingValue, price });
    } else if (type === 'FAQPage') {
      const count = Array.isArray(obj.mainEntity) ? obj.mainEntity.length : 0;
      previews.push({ type, title: 'FAQ', count });
    }
  });
  return previews;
}

export async function validateUrl(url, opts = {}) {
  const { useHeadless = false } = opts;
  try {
    let html;
    try {
      html = await fetchHtml(url, opts);
    } catch (e1) {
      if (useHeadless) {
        html = await fetchHtmlHeadless(url, opts);
      } else {
        throw e1;
      }
    }
    const sd = extractStructuredData(html);
    if ((sd.jsonLd.length === 0 && sd.microdata.length === 0 && sd.rdfa.length === 0) && useHeadless === false) {
      // If nothing detected and not using headless, optionally attempt headless as a best-effort
      try {
        const headlessHtml = await fetchHtmlHeadless(url, opts);
        const sd2 = extractStructuredData(headlessHtml);
        if (sd2.jsonLd.length || sd2.microdata.length || sd2.rdfa.length) {
          const validation2 = validateSchemas(sd2);
          const previews2 = buildSnippetPreviews(sd2);
          return { structuredData: sd2, validation: validation2, previews: previews2 };
        }
      } catch {}
    }
    const validation = validateSchemas(sd);
    const previews = buildSnippetPreviews(sd);
    return { structuredData: sd, validation, previews };
  } catch (e) {
    const status = e?.response?.status;
    const suggestions = [];
    if (status === 403) {
      suggestions.push('The site returned 403 Forbidden. Some sites block bots. Try enabling Headless (render JS) or validate with the raw HTML.');
    } else {
      suggestions.push('Could not fetch the page. Ensure the URL is reachable and not blocking automated requests.');
    }
    if (String(e.message || '').includes('Headless fetch failed')) {
      suggestions.push('Headless fetch failed. Install puppeteer or disable headless mode.');
    }
    return {
      structuredData: { jsonLd: [], microdata: [], rdfa: [] },
      validation: { detections: [], issues: [], suggestions },
      previews: []
    };
  }
}

export default { validateUrl };
