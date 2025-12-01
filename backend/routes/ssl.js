import express from 'express';
import { checkSSLCertificate, bulkCheckSSL } from '../controllers/sslController.js';
import { validateUrl } from '../middleware/validators.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/ssl/check
 * @desc    Check SSL certificate for a single URL
 * @access  Private
 */
router.get('/check', validateUrl, verifyToken, checkSSLCertificate);

/**
 * @route   POST /api/ssl/bulk-check
 * @desc    Check SSL certificates for multiple URLs
 * @access  Private
 */
router.post('/bulk-check', verifyToken, bulkCheckSSL);

export default router;