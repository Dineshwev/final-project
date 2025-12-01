import express from 'express';
import { analyzeSite } from '../controllers/seoController.js';
import { validateUrl } from '../middleware/validators.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/seo/analyze
 * @desc    Analyze a website URL and return SEO health report
 * @access  Public
 */
router.get('/analyze', validateUrl, verifyToken, analyzeSite);

export default router;