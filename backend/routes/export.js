/**
 * @file export.js
 * @description Routes for exporting scan reports in various formats
 */

import express from 'express';
import { param, query } from 'express-validator';
import { validate, validateUrlParam } from '../middleware/validators.js';
import exportController from '../controllers/exportController.js';

const router = express.Router();

/**
 * @route   GET /api/export/pdf/:url
 * @desc    Export the latest scan report for a URL as PDF
 * @access  Public
 */
router.get('/pdf/:url', validateUrlParam, exportController.exportPDF);

/**
 * @route   GET /api/export/:scanId/pdf
 * @desc    Export scan report as PDF by scan ID
 * @access  Public
 */
router.get('/:scanId/pdf',
  [
    param('scanId')
      .isString()
      .withMessage('Scan ID must be a string'),
    validate
  ],
  exportController.exportPdf
);

/**
 * @route   GET /api/export/:scanId/csv
 * @desc    Export scan report as CSV
 * @access  Public
 */
router.get('/:scanId/csv',
  [
    param('scanId')
      .isString()
      .withMessage('Scan ID must be a string'),
    validate
  ],
  exportController.exportCsv
);

/**
 * @route   GET /api/export/:scanId/json
 * @desc    Export scan report as JSON
 * @access  Public
 */
router.get('/:scanId/json',
  [
    param('scanId')
      .isString()
      .withMessage('Scan ID must be a string'),
    validate
  ],
  exportController.exportJson
);

/**
 * @route   GET /api/export/trends/:url
 * @desc    Export historical trends for a URL
 * @access  Public
 */
router.get('/trends/:url',
  [
    param('url')
      .isString()
      .withMessage('URL parameter must be a string'),
    query('format')
      .optional()
      .isIn(['json', 'csv', 'pdf'])
      .withMessage('Format must be json, csv, or pdf'),
    validate
  ],
  exportController.exportTrends
);

export default router;