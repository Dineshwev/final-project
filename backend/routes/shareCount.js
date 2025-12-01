import express from "express";
import {
  getShareCountReport,
  getCacheStats,
  clearCache,
} from "../services/shareCountService.js";

const router = express.Router();

/**
 * POST /api/share-counts/analyze
 * Get social share counts for a URL
 */
router.post("/analyze", async (req, res) => {
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

    // Get share count report
    const report = await getShareCountReport(url);

    return res.json(report);
  } catch (error) {
    console.error("Share Count Error:", error);

    // Handle rate limiting specifically
    if (error.message.includes("Rate limit")) {
      return res.status(429).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: "Failed to fetch share counts",
      message: error.message,
    });
  }
});

/**
 * GET /api/share-counts/health
 * Health check endpoint
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "Social Share Count Tracker",
    status: "operational",
    api: "SharedCount.com",
    limit: "500 requests/day (free tier)",
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/share-counts/cache/stats
 * Get cache statistics
 */
router.get("/cache/stats", (req, res) => {
  try {
    const stats = getCacheStats();
    res.json({
      success: true,
      cache: stats,
      ttl: "24 hours",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get cache stats",
    });
  }
});

/**
 * DELETE /api/share-counts/cache
 * Clear cache for a specific URL
 */
router.delete("/cache", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL is required",
      });
    }

    clearCache(url);

    res.json({
      success: true,
      message: "Cache cleared for URL",
      url,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to clear cache",
    });
  }
});

/**
 * GET /api/share-counts/platforms
 * Get information about supported platforms
 */
router.get("/platforms", (req, res) => {
  res.json({
    success: true,
    platforms: [
      {
        name: "Facebook",
        metric: "Total Engagement",
        description: "Includes shares, reactions, and comments",
        icon: "facebook",
      },
      {
        name: "Pinterest",
        metric: "Pins",
        description: "Number of times content was pinned",
        icon: "pinterest",
      },
      {
        name: "LinkedIn",
        metric: "Shares",
        description: "Number of shares on LinkedIn",
        icon: "linkedin",
      },
    ],
    shareButtons: [
      {
        platform: "Facebook",
        url: "https://www.facebook.com/sharer/sharer.php?u={URL}",
      },
      {
        platform: "Twitter",
        url: "https://twitter.com/intent/tweet?url={URL}&text={TEXT}",
      },
      {
        platform: "LinkedIn",
        url: "https://www.linkedin.com/sharing/share-offsite/?url={URL}",
      },
      {
        platform: "Pinterest",
        url: "https://pinterest.com/pin/create/button/?url={URL}&media={IMAGE}&description={DESC}",
      },
    ],
  });
});

export default router;
