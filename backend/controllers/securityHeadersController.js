// backend/controllers/securityHeadersController.js

import { checkSecurityHeaders } from "../services/securityHeadersService.js";

/**
 * Check security headers for a URL
 */
export async function checkHeaders(req, res) {
  try {
    const { url } = req.query;

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

    console.log(`Checking security headers for: ${url}`);

    const result = await checkSecurityHeaders(url);

    res.json(result);
  } catch (error) {
    console.error("Security headers check error:", error);

    res.status(500).json({
      success: false,
      error: error.message || "Failed to check security headers",
    });
  }
}

export default { checkHeaders };
