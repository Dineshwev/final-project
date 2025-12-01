// backend/routes/securityHeaders.js

import express from "express";
import { checkHeaders } from "../controllers/securityHeadersController.js";

const router = express.Router();

/**
 * @route   GET /api/security-headers
 * @desc    Check security headers for a URL
 * @access  Public
 * @query   url - The URL to check
 */
router.get("/", checkHeaders);

export default router;
