/**
 * Citation Tracker Routes
 * API endpoints for local citation tracking
 */

import express from "express";
import * as citationController from "../controllers/citationTrackerController.js";

const router = express.Router();

/**
 * @route POST /api/citations/search
 * @desc Search for business citations across multiple directories
 * @access Private (add authentication if needed)
 * @body {string} businessName - Business name
 * @body {string} phone - Business phone number
 * @body {string} city - City name
 */
router.post("/search", citationController.searchCitations);

/**
 * @route POST /api/citations/scrape
 * @desc Scrape citation data from a specific URL
 * @access Private
 * @body {string} url - URL of the listing page
 */
router.post("/scrape", citationController.scrapeCitation);

/**
 * @route POST /api/citations/compare
 * @desc Compare citations with source data
 * @access Private
 * @body {Array} citations - Array of citation objects
 * @body {Object} sourceData - Source business data (name, phone, address)
 */
router.post("/compare", citationController.compareCitations);

/**
 * @route POST /api/citations/search-and-compare
 * @desc Search for citations and compare with source data (combined operation)
 * @access Private
 * @body {string} businessName - Business name
 * @body {string} phone - Business phone number
 * @body {string} city - City name
 * @body {string} address - Business address (optional)
 */
router.post("/search-and-compare", citationController.searchAndCompare);

/**
 * @route POST /api/citations/export
 * @desc Export citation data to JSON or CSV
 * @access Private
 * @body {Object|Array} data - Citation data to export
 * @body {string} format - Export format ("json" or "csv")
 * @body {string} filename - Output filename (optional)
 */
router.post("/export", citationController.exportCitations);

/**
 * @route POST /api/citations/nap-check
 * @desc Check NAP (Name, Address, Phone) consistency across citations
 * @access Private
 * @body {Array} citations - Array of citation objects with NAP data
 * @body {Object} masterData - Master NAP data to compare against
 * @body {string} masterData.name - Business name
 * @body {string} masterData.address - Business address
 * @body {string} masterData.phone - Business phone number
 */
router.post("/nap-check", citationController.checkNAPConsistency);

export default router;
