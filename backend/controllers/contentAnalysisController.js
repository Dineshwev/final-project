import contentAnalysisService from '../services/contentAnalysisService.js';

export const analyzeContent = async (req, res, next) => {
  try {
    const { url } = req.method === 'GET' ? req.query : req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ status: 'error', message: 'Please provide a valid url query or body parameter' });
    }

    const data = await contentAnalysisService.analyzeContentQuality(url);

    // Compute an overall content score (0-100) weighted by indicators
    let score = 0;
    // readability (40%), sentence length (20%), paragraph (20%), keyword variety (20%)
    const map = (level) => level === 'good' ? 1 : level === 'warning' ? 0.6 : 0.3;
    const ind = data.indicators;
    score = Math.round(
      100 * (
        0.4 * map(ind.readability) +
        0.2 * map(ind.sentenceLength) +
        0.2 * map(ind.paragraphLength) +
        0.2 * map(ind.keywordVariety)
      )
    );

    res.json({ status: 'success', data: { ...data, score } });
  } catch (err) {
    next(err);
  }
};

export default { analyzeContent };
