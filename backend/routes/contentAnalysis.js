import express from 'express';
import { query, body } from 'express-validator';
import { validate } from '../middleware/validators.js';
import { analyzeContent } from '../controllers/contentAnalysisController.js';

const router = express.Router();

/**
 * @route GET /api/content-analysis?url=https://example.com
 * @desc  Analyze content quality of a page
 * @access Public (could be secured later)
 */
router.get('/content-analysis', [
  query('url').isURL().withMessage('Valid URL required'),
  validate
], analyzeContent);

/**
 * @route POST /api/content-analysis
 * @desc  Analyze content quality (URL in body)
 * @access Public
 */
router.post('/content-analysis', [
  body('url').isURL().withMessage('Valid URL required'),
  validate
], analyzeContent);

export default router;
