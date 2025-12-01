import compareService from '../services/compareService.js';

export const compareHandler = async (req, res, next) => {
  try {
    const { urls } = req.method === 'GET' ? req.query : req.body;
    let list = [];
    if (Array.isArray(urls)) list = urls; else if (typeof urls === 'string') list = urls.split(',');
    list = list.map(u => u.trim()).filter(Boolean);
    if (list.length < 2) {
      return res.status(400).json({ status: 'error', message: 'Please supply 2-3 URLs via urls[]= or comma list' });
    }
    if (list.length > 3) list = list.slice(0,3);

    const data = await compareService.compareUrls(list, req.user?.uid);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

export default { compareHandler };
