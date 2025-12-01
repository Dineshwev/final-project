import express from "express";
import {
  generateRichPinReport,
  getRichPinTypes,
  PINTEREST_VALIDATOR_URL,
} from "../services/pinterestRichPinValidator.js";

const router = express.Router();

/**
 * POST /api/pinterest-rich-pin/validate
 * Validate Pinterest Rich Pin meta tags for a URL
 */
router.post("/validate", async (req, res) => {
  try {
    const { url, pinType } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL is required",
      });
    }

    const report = await generateRichPinReport(url, pinType);

    res.json(report);
  } catch (error) {
    console.error("Pinterest Rich Pin validation error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

/**
 * GET /api/pinterest-rich-pin/types
 * Get available Rich Pin types and their requirements
 */
router.get("/types", (req, res) => {
  try {
    const types = getRichPinTypes();

    res.json({
      success: true,
      types,
      validationURL: PINTEREST_VALIDATOR_URL,
    });
  } catch (error) {
    console.error("Get Rich Pin types error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

/**
 * GET /api/pinterest-rich-pin/health
 * Health check endpoint
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "Pinterest Rich Pin Validator",
    status: "operational",
    timestamp: new Date().toISOString(),
  });
});

export default router;
