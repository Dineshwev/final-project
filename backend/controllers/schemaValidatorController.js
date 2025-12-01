import { validateUrl } from '../services/schemaValidatorService.js';

export const runSchemaValidation = async (req, res) => {
  try {
  const { url, headless, ua, proxy, cookieHeader, headers, stealth } = req.query;
    if (!url) return res.status(400).json({ status: 'error', message: 'url query param required' });
    let headersObj = undefined;
    if (headers) {
      try { headersObj = JSON.parse(headers); } catch {}
    }
    const data = await validateUrl(url, {
      useHeadless: headless === 'true',
      useStealth: stealth === 'true',
      userAgent: ua,
      proxy,
      cookieHeader,
      headers: headersObj
    });
    return res.json({ status: 'success', data });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: e.message });
  }
};

export default { runSchemaValidation };
