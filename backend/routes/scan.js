import express from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validators.js';
import { scanController } from '../controllers/scanController.js';

const router = express.Router();

/**
 * @route   POST /api/scan
 * @desc    Start a new website scan
 * @access  Public
 */
router.post('/scan',
    [
        body('url')
            .isURL()
            .withMessage('Please provide a valid URL'),
        validate
    ],
    scanController.startScan
);

/**
 * @route   GET /api/scan/:scanId
 * @desc    Get the status of a scan
 * @access  Public
 */
router.get('/scan/:scanId',
    [
        param('scanId')
            .isString()
            .withMessage('Invalid scan ID format'),
        validate
    ],
    scanController.getScanStatus
);

/**
 * @route   GET /api/scan/:scanId/results
 * @desc    Get the results of a completed scan
 * @access  Public
 */
router.get('/scan/:scanId/results',
    [
        param('scanId')
            .isString()
            .withMessage('Invalid scan ID format'),
        validate
    ],
    scanController.getScanResults
);

/**
 * @route   GET /api/report/:url
 * @desc    Get report for a URL
 * @access  Public
 */
router.get('/report/:url',
    [
        param('url')
            .isString()
            .withMessage('URL parameter is required'),
        validate
    ],
    scanController.getReport
);

/**
 * @route   DELETE /api/scan/:scanId
 * @desc    Cancel an ongoing scan
 * @access  Public
 */
router.delete('/scan/:scanId',
    [
        param('scanId')
            .isString()
            .withMessage('Invalid scan ID format'),
        validate
    ],
    scanController.cancelScan
);

export default router;