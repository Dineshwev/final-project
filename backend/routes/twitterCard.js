import express from "express";
import { generateTwitterCardReport } from "../services/twitterCardValidator.js";

const router = express.Router();

/**
 * POST /api/twitter-card/validate
 * Validate Twitter Card meta tags for a given URL
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
    const validationReport = await generateTwitterCardReport(url);

    return res.json({
      success: true,
      data: validationReport,
    });
  } catch (error) {
    console.error("Twitter Card Validator Error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error during validation",
      message: error.message,
    });
  }
});

/**
 * GET /api/twitter-card/health
 * Health check endpoint
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "Twitter Card Validator",
    status: "operational",
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/twitter-card/card-types
 * Get supported Twitter Card types and their requirements
 */
router.get("/card-types", (req, res) => {
  res.json({
    success: true,
    data: {
      summary: {
        description: "Standard Twitter Card with small image",
        required: ["twitter:card", "twitter:title", "twitter:description"],
        optional: ["twitter:image", "twitter:site", "twitter:creator"],
        imageSpecs: "Minimum 144x144px, Maximum 4096x4096px, Aspect ratio 1:1",
      },
      summary_large_image: {
        description: "Large image Twitter Card",
        required: [
          "twitter:card",
          "twitter:title",
          "twitter:description",
          "twitter:image",
        ],
        optional: ["twitter:site", "twitter:creator", "twitter:image:alt"],
        imageSpecs:
          "Minimum 300x157px, Maximum 4096x4096px, Aspect ratio 2:1, Max 5MB",
      },
      app: {
        description: "Mobile app download card",
        required: [
          "twitter:card",
          "twitter:title",
          "twitter:description",
          "twitter:app:id:iphone",
          "twitter:app:id:ipad",
          "twitter:app:id:googleplay",
        ],
        optional: [
          "twitter:site",
          "twitter:app:name:iphone",
          "twitter:app:name:ipad",
          "twitter:app:name:googleplay",
        ],
      },
      player: {
        description: "Video/audio player card",
        required: [
          "twitter:card",
          "twitter:title",
          "twitter:description",
          "twitter:player",
          "twitter:player:width",
          "twitter:player:height",
        ],
        optional: ["twitter:site", "twitter:image", "twitter:player:stream"],
        imageSpecs: "Recommended for preview",
      },
    },
  });
});

export default router;
