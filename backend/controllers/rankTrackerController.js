import { addKeyword, deleteKeyword, listKeywords, getHistory, getAlerts, markAlertSeen, refreshKeyword, refreshAll } from '../services/rankTrackerService.js';
import { promisify } from 'util';
import db from '../db/init.js';

export async function addKeywordHandler(req, res) {
  try {
    const { url, keyword } = req.body || {};
    if (!url || !keyword) return res.status(400).json({ status: 'error', message: 'url and keyword required' });
    const row = await addKeyword(url, keyword);
    return res.json({ status: 'success', data: row });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: e.message });
  }
}

export async function listKeywordsHandler(req, res) {
  try {
    const { page, pageSize, search } = req.query;
    const data = await listKeywords({ page, pageSize, search });
    return res.json({ status: 'success', ...data });
  } catch (e) { return res.status(500).json({ status: 'error', message: e.message }); }
}

export async function deleteKeywordHandler(req, res) {
  try {
    const { id } = req.params;
    await deleteKeyword(id);
    return res.json({ status: 'success' });
  } catch (e) { return res.status(500).json({ status: 'error', message: e.message }); }
}

export async function historyHandler(req, res) {
  try {
    const { id } = req.params;
    const { page, pageSize, from, to } = req.query;
    const data = await getHistory(id, { page, pageSize, from, to });
    return res.json({ status: 'success', ...data });
  } catch (e) { return res.status(500).json({ status: 'error', message: e.message }); }
}

export async function alertsHandler(req, res) {
  try {
    const rows = await getAlerts();
    return res.json({ status: 'success', data: rows });
  } catch (e) { return res.status(500).json({ status: 'error', message: e.message }); }
}

export async function markAlertHandler(req, res) {
  try {
    const { id } = req.params;
    await markAlertSeen(id);
    return res.json({ status: 'success' });
  } catch (e) { return res.status(500).json({ status: 'error', message: e.message }); }
}

export async function refreshOneHandler(req, res) {
  try {
    const { id } = req.params;
    // fetch keyword row
    const get = promisify(db.get).bind(db);
    const row = await get('SELECT * FROM rank_keywords WHERE id=?', [id]);
    if (!row) return res.status(404).json({ status: 'error', message: 'keyword not found' });
    const data = await refreshKeyword(row, {});
    return res.json({ status: 'success', data });
  } catch (e) { return res.status(500).json({ status: 'error', message: e.message }); }
}

export async function refreshAllHandler(req, res) {
  try {
    const data = await refreshAll({});
    return res.json({ status: 'success', data });
  } catch (e) { return res.status(500).json({ status: 'error', message: e.message }); }
}

// CSV exports
export async function exportHistoryCsvHandler(req, res) {
  try {
    const { id } = req.params;
    const { from, to } = req.query;
    const data = await getHistory(id, { page: 1, pageSize: 100000, from, to });
    const rows = data.items || [];
    const header = 'id,keyword_id,position,fetched_at\n';
    const body = rows.map(r => [r.id, r.keyword_id, r.position ?? '', r.fetched_at].join(',')).join('\n');
    const csv = header + body + '\n';
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="rank-history-${id}.csv"`);
    return res.status(200).send(csv);
  } catch (e) { return res.status(500).json({ status: 'error', message: e.message }); }
}

export async function exportAlertsCsvHandler(req, res) {
  try {
    const rows = await getAlerts(100000);
    const header = 'id,keyword_id,keyword,url,old_position,new_position,delta,created_at\n';
    const body = rows.map(r => [r.id, r.keyword_id, quoteCsv(r.keyword), quoteCsv(r.url), r.old_position ?? '', r.new_position ?? '', r.delta, r.created_at].join(',')).join('\n');
    const csv = header + body + '\n';
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="rank-alerts.csv"');
    return res.status(200).send(csv);
  } catch (e) { return res.status(500).json({ status: 'error', message: e.message }); }
}

function quoteCsv(val) {
  if (val == null) return '';
  const s = String(val);
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export default { addKeywordHandler, listKeywordsHandler, deleteKeywordHandler, historyHandler, alertsHandler, markAlertHandler, refreshOneHandler, refreshAllHandler, exportHistoryCsvHandler, exportAlertsCsvHandler };
