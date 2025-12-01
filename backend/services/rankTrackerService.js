import axios from 'axios';
import { promisify } from 'util';
import db from '../db/init.js';
import { load as loadCheerio } from 'cheerio';
import { HttpsProxyAgent } from 'https-proxy-agent';

const dbRun = promisify(db.run).bind(db);
const dbGet = promisify(db.get).bind(db);
const dbAll = promisify(db.all).bind(db);

// Basic delay helper
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Proxy rotation (optional): comma-separated list of proxy URLs in env RANK_PROXIES
// Example: http://user:pass@host1:port,http://host2:port
const PROXIES = (process.env.RANK_PROXIES || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
let proxyIndex = 0;
function getNextProxyAgent() {
  if (!PROXIES.length) return undefined;
  const url = PROXIES[proxyIndex % PROXIES.length];
  proxyIndex++;
  try {
    return new HttpsProxyAgent(url);
  } catch {
    return undefined;
  }
}

/*
 Smart HTML SERP position fetcher
 --------------------------------
 1. Random delay (1–5s) before each attempt.
 2. Rotating User-Agents.
 3. Fetch https://www.google.com/search?q=<keyword>&num=20
 4. Parse organic result URLs (anchors with /url?q= ) using Cheerio.
 5. Normalize URLs (strip protocol, leading www, trailing slash, remove query/hash) before comparing.
 6. Retry up to 2 attempts if blocked or network error.
 7. Returns rank (1-based) or null if not found.
 8. Never throws; returns null on persistent failure.
 NOTE: For production use an official API to respect Google ToS.
*/
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_3_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
];

function normalizeForCompare(raw) {
  try {
    const u = new URL(raw);
    let host = u.hostname.toLowerCase();
    if (host.startsWith('www.')) host = host.slice(4);
    let path = u.pathname.replace(/\/$/, '').toLowerCase();
    return host + path;
  } catch { return raw.toLowerCase(); }
}

export async function fetchPosition(keyword, targetUrl) {
  const maxAttempts = 2;
  const targetNorm = normalizeForCompare(targetUrl);
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Random human-like delay (1–5s)
    const delayMs = 1000 + Math.floor(Math.random() * 4000);
    await sleep(delayMs);
    const ua = USER_AGENTS[(Math.floor(Math.random() * USER_AGENTS.length))];
    const q = encodeURIComponent(keyword);
    const serpUrl = `https://www.google.com/search?q=${q}&num=20&hl=en`;
    let html = '';
    try {
      const resp = await axios.get(serpUrl, {
        timeout: 12000,
        headers: { 'User-Agent': ua, 'Accept-Language': 'en-US,en;q=0.9' },
        // Use rotating proxy agent if configured
        httpAgent: getNextProxyAgent(),
        httpsAgent: getNextProxyAgent()
      });
      html = resp.data || '';
      // Basic block detection phrases
      if (resp.status !== 200 || /detected unusual traffic|sorry/i.test(html)) {
        if (attempt === maxAttempts) return null; // blocked persistent
        continue; // retry
      }
    } catch (e) {
      if (attempt === maxAttempts) return null;
      continue; // retry on network error
    }
    // Parse organic results
    try {
      const $ = loadCheerio(html);
      // Collect anchors with /url?q=
      const links = [];
      $('a').each((_, el) => {
        const href = $(el).attr('href') || '';
        if (!href.startsWith('/url?')) return;
        const m = /\/url\?q=([^&]+)&/.exec(href);
        if (!m) return;
        let dest = decodeURIComponent(m[1]);
        // Filter out unwanted google internal URLs
        if (/google\./i.test(dest) && !/\/maps|\/news|\/shopping/.test(dest)) return;
        links.push(dest);
      });
      let rank = 1;
      for (const link of links) {
        const norm = normalizeForCompare(link);
        if (norm.startsWith(targetNorm)) {
          return rank;
        }
        rank++;
      }
      return null; // not found in first page sample
    } catch {
      if (attempt === maxAttempts) return null;
    }
  }
  return null;
}

function normalizeUrl(u) { // legacy helper kept for compatibility
  try { const url = new URL(u); url.hash=''; url.search=''; return url.origin + url.pathname.replace(/\/$/,''); } catch { return u; }
}

export async function addKeyword(url, keyword) {
  await dbRun(`INSERT OR IGNORE INTO rank_keywords (url, keyword, last_position) VALUES (?,?,NULL)`, [url, keyword]);
  const row = await dbGet(`SELECT * FROM rank_keywords WHERE url=? AND keyword=?`, [url, keyword]);
  return row;
}

export async function deleteKeyword(id) {
  await dbRun(`DELETE FROM rank_keywords WHERE id=?`, [id]);
}

export async function listKeywords(opts={}) {
  const page = Math.max(1, parseInt(opts.page)||1);
  const pageSize = Math.min(200, Math.max(1, parseInt(opts.pageSize)||20));
  const offset = (page-1)*pageSize;
  const search = (opts.search||'').trim();
  let where = 'WHERE active=1';
  const params = [];
  if (search) {
    where += ' AND (keyword LIKE ? OR url LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  const totalRow = await dbGet(`SELECT COUNT(*) as cnt FROM rank_keywords ${where}`, params);
  const rows = await dbAll(`SELECT * FROM rank_keywords ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, pageSize, offset]);
  return { items: rows, total: totalRow?.cnt||0, page, pageSize };
}

export async function getHistory(keywordId, opts={}) {
  const page = Math.max(1, parseInt(opts.page)||1);
  const pageSize = Math.min(500, Math.max(1, parseInt(opts.pageSize)||50));
  const offset = (page-1)*pageSize;
  const from = opts.from ? new Date(opts.from) : null;
  const to = opts.to ? new Date(opts.to) : null;
  let where = 'WHERE keyword_id=?';
  const params = [keywordId];
  if (from && !isNaN(+from)) { where += ' AND datetime(fetched_at) >= datetime(?)'; params.push(from.toISOString()); }
  if (to && !isNaN(+to)) { where += ' AND datetime(fetched_at) <= datetime(?)'; params.push(to.toISOString()); }
  const totalRow = await dbGet(`SELECT COUNT(*) as cnt FROM rank_history ${where}`, params);
  const rows = await dbAll(`SELECT * FROM rank_history ${where} ORDER BY fetched_at DESC LIMIT ? OFFSET ?`, [...params, pageSize, offset]);
  return { items: rows, total: totalRow?.cnt||0, page, pageSize };
}

export async function getAlerts(limit=20) {
  const rows = await dbAll(`SELECT ra.*, rk.keyword, rk.url FROM rank_alerts ra JOIN rank_keywords rk ON rk.id=ra.keyword_id WHERE ra.seen=0 ORDER BY ra.created_at DESC LIMIT ?`, [limit]);
  return rows;
}

export async function markAlertSeen(id) {
  await dbRun(`UPDATE rank_alerts SET seen=1 WHERE id=?`, [id]);
}

async function savePosition(keywordId, position) {
  await dbRun(`INSERT INTO rank_history (keyword_id, position) VALUES (?, ?)`, [keywordId, position]);
  await dbRun(`UPDATE rank_keywords SET last_position=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`, [position, keywordId]);
}

async function createAlert(keywordId, oldPos, newPos) {
  const delta = oldPos == null ? 0 : (oldPos - newPos); // positive delta = improved rank (lower number)
  // Alert only if absolute delta >= 5 and newPos not null
  if (newPos != null && oldPos != null && Math.abs(delta) >= 5) {
    await dbRun(`INSERT INTO rank_alerts (keyword_id, old_position, new_position, delta) VALUES (?,?,?,?)`, [keywordId, oldPos, newPos, delta]);
  }
}

export async function refreshKeyword(keywordRow, opts={}) {
  // Use new fetchPosition (ignores opts except potential future expansion)
  const pos = await fetchPosition(keywordRow.keyword, keywordRow.url);
  const oldPos = keywordRow.last_position;
  if (pos != null) {
    await savePosition(keywordRow.id, pos);
    await createAlert(keywordRow.id, oldPos, pos);
  }
  return { id: keywordRow.id, keyword: keywordRow.keyword, url: keywordRow.url, position: pos };
}

export async function refreshAll(opts={}) {
  const rows = await listKeywords({ page: 1, pageSize: 100000 });
  const items = Array.isArray(rows.items) ? rows.items : rows; // support both shapes
  const concurrency = Math.max(1, Math.min(parseInt(process.env.RANK_MAX_CONCURRENCY||'2')||2, 5));

  const results = [];
  let idx = 0;
  async function worker() {
    while (true) {
      const i = idx++;
      if (i >= items.length) break;
      const row = items[i];
      try {
        const r = await refreshKeyword(row, opts);
        results.push(r);
      } catch {
        results.push({ id: row.id, keyword: row.keyword, url: row.url, position: null, error: true });
      }
      // small stagger between tasks to reduce burstiness
      await sleep(500 + Math.random()*750);
    }
  }
  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return results;
}

export default {
  addKeyword, deleteKeyword, listKeywords, getHistory, getAlerts, markAlertSeen, refreshKeyword, refreshAll
};
