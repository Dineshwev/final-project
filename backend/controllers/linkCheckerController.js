import { runLinkCheck, saveLinkCheck, getLinkCheck, listLinkChecks } from '../services/linkCheckerService.js';

// In-memory progress map { id: { completed, total, status } }
const progressMap = new Map();
let nextId = 1;

export const startLinkCheck = async (req, res) => {
  try {
  const { url, concurrency = 6, delay = 100, depth = 0, maxPages = 5, headless = false, userAgent, headers, cookieHeader, proxy, respectRobots = false, useStealth = false, maxRetries = 2, timeoutMs = 15000 } = req.body || {};
    if (!url) return res.status(400).json({ status: 'error', message: 'url is required' });

    const jobId = String(nextId++);
    progressMap.set(jobId, { completed: 0, total: 1, status: 'running' });

    // Run async, don't block request
    setImmediate(async () => {
      try {
        let headersObj = headers;
        if (typeof headers === 'string') {
          try { headersObj = JSON.parse(headers); } catch {}
        }
        const data = await runLinkCheck(url, {
          concurrency,
          delay,
          depth,
          maxPages,
          useHeadless: headless,
          userAgent,
          headers: headersObj,
          cookieHeader,
          proxy,
          respectRobots,
          useStealth,
          maxRetries,
          timeoutMs,
          onProgress: ({ completed, total }) => {
            const p = progressMap.get(jobId);
            if (p) progressMap.set(jobId, { ...p, completed, total });
          }
        });
        // If service returned a warning (e.g. fetch failed) treat as completed with empty dataset
        const savedId = await saveLinkCheck(url, data);
        progressMap.set(jobId, { ...progressMap.get(jobId), status: 'completed', savedId, warning: data.warning || null });
      } catch (e) {
        progressMap.set(jobId, { ...progressMap.get(jobId), status: 'error', error: e.message });
      }
    });

    return res.status(202).json({ status: 'accepted', jobId });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: e.message });
  }
};

export const getLinkCheckStatus = async (req, res) => {
  const { id } = req.params;
  const p = progressMap.get(id);
  if (!p) return res.status(404).json({ status: 'error', message: 'job not found' });
  const pct = p.total ? Math.round((p.completed / p.total) * 100) : 0;
  return res.json({ status: 'ok', job: { ...p, progress: pct } });
};

export const getSavedLinkCheck = async (req, res) => {
  const { id } = req.params;
  const row = await getLinkCheck(id);
  if (!row) return res.status(404).json({ status: 'error', message: 'result not found' });
  return res.json({ status: 'success', data: row });
};

export const listSavedLinkChecks = async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;
  const rows = await listLinkChecks(limit, offset);
  return res.json({ status: 'success', data: rows });
};

export default { startLinkCheck, getLinkCheckStatus, getSavedLinkCheck, listSavedLinkChecks };
