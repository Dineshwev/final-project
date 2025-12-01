/**
 * @file backlinks.js
 * @description Routes for backlink analysis functionality
 */

import express from 'express';
import backlinkController from '../controllers/backlinkController.js';
import { validateUrl } from '../middleware/validators.js';

const router = express.Router();

/**
 * @route   GET /api/backlinks
 * @desc    Get backlink summary for a URL
 * @access  Public
 */
router.get('/', validateUrl, backlinkController.getBacklinkSummary);

/**
 * @route   GET /api/backlinks/detailed
 * @desc    Get detailed backlink data for a URL
 * @access  Public
 */
router.get('/detailed', validateUrl, backlinkController.getDetailedBacklinks);

/**
 * @route   GET /api/backlinks/domains
 * @desc    Get domain metrics for a URL's backlinks
 * @access  Public
 */
router.get('/domains', validateUrl, backlinkController.getDomainMetrics);

export default router;