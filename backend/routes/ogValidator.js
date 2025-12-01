import express from "express";
import { validateOpenGraphTags } from "../services/ogValidator.js";

const router = express.Router();

/**
 * POST /api/og-validator/validate
 * Validate Open Graph meta tags for a given URL
 */
router.post("/validate", async (req, res) => {
  try {
    const { url } = req.body;

    // Validate input
    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL is required",
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: "Invalid URL format",
      });
    }

    // Perform validation
    const validationReport = await validateOpenGraphTags(url);

    return res.json({
      success: true,
      data: validationReport,
    });
  } catch (error) {
    console.error("OG Validator Error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error during validation",
      message: error.message,
    });
  }
});

/**
 * GET /api/og-validator/health
 * Health check endpoint
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "Open Graph Validator",
    status: "operational",
    timestamp: new Date().toISOString(),
  });
});

export default router;
