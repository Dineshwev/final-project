/**
 * Multi-Language SEO Routes
 * API endpoints for international SEO analysis
 */

import express from "express";
import multiLanguageSeoController from "../controllers/multiLanguageSeoController.js";

const router = express.Router();

/**
 * @route GET /api/multi-language-seo
 * @desc Check multi-language SEO for a URL
 * @access Public
 * @param {string} url - URL to analyze (query parameter)
 */
router.get("/", multiLanguageSeoController.checkMultiLanguageSEO);

export default router;
