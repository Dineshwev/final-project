import express from 'express';
const router = express.Router();
import historyController from '../controllers/historyController.js';
import { param, query } from 'express-validator';
import { validate, validateUrlParam } from '../middleware/validators.js';

/**
 * @route GET /api/history/recent
 * @desc Get recent scans across all URLs
 * @access Public
 */
router.get('/recent', 
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    validate
  ],
  historyController.getRecentScans
);

/**
 * @route GET /api/history/scan/:id
 * @desc Get scan details by ID
 * @access Public
 */
router.get('/scan/:id',
  [
    param('id')
      .isString()
      .withMessage('Scan ID must be a string'),
    validate
  ],
  historyController.getScanById
);

/**
 * @route GET /api/history/:url
 * @desc Get scan history for a URL
 * @access Public
 */
router.get('/:url', validateUrlParam, historyController.getScanHistory);

/**
 * @route GET /api/history/trends/:url
 * @desc Get score trends for a specific URL
 * @access Public
 */
router.get('/trends/:url', validateUrlParam, historyController.getScoreTrends);

/**
 * @route DELETE /api/history/scan/:id
 * @desc Delete a scan by ID
 * @access Public
 */
router.delete('/scan/:id',
  [
    param('id')
      .isString()
      .withMessage('Scan ID must be a string'),
    validate
  ],
  historyController.deleteScan
);

export default router;