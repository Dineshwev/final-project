/**
 * Multi-Language SEO Controller
 * Handles API requests for international SEO analysis
 */

import multiLanguageSeoService from "../services/multiLanguageSeoService.js";

/**
 * Check multi-language SEO for a URL
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function checkMultiLanguageSEO(req, res) {
  try {
    const { url } = req.query;

    // Validate URL
    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL parameter is required",
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        success: false,
        error: "Invalid URL format",
      });
    }

    // Check multi-language SEO
    const report = await multiLanguageSeoService.checkMultiLanguageSEO(url);

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Error in checkMultiLanguageSEO controller:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze multi-language SEO",
    });
  }
}

export default {
  checkMultiLanguageSEO,
};
