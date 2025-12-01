import express from "express";
import {
  generateAuditReport,
  validateProfile,
  getPlatformInfo,
} from "../services/socialPresenceValidator.js";

const router = express.Router();

/**
 * POST /api/social-presence/audit
 * Generate complete social media presence audit report
 */
router.post("/audit", async (req, res) => {
  try {
    const { profiles } = req.body;

    // Validate input
    if (!profiles || typeof profiles !== "object") {
      return res.status(400).json({
        success: false,
        error: "Profiles object is required",
      });
    }

    // Generate audit report
    const report = await generateAuditReport(profiles);

    return res.json(report);
  } catch (error) {
    console.error("Social Presence Audit Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to generate audit report",
      message: error.message,
    });
  }
});

/**
 * POST /api/social-presence/validate
 * Validate a single social profile
 */
router.post("/validate", async (req, res) => {
  try {
    const { url, platform } = req.body;

    if (!url || !platform) {
      return res.status(400).json({
        success: false,
        error: "URL and platform are required",
      });
    }

    const result = await validateProfile(url, platform);

    return res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Profile Validation Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to validate profile",
      message: error.message,
    });
  }
});

/**
 * GET /api/social-presence/platforms
 * Get supported platforms and their URL patterns
 */
router.get("/platforms", (req, res) => {
  try {
    const platforms = getPlatformInfo();

    const platformList = Object.entries(platforms).map(([key, value]) => ({
      id: key,
      name: value.name,
      pattern: value.pattern.toString(),
      icon: value.icon,
      color: value.color,
      example: getExampleUrl(key),
    }));

    return res.json({
      success: true,
      platforms: platformList,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to get platform information",
    });
  }
});

/**
 * GET /api/social-presence/health
 * Health check endpoint
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "Social Media Presence Validator",
    status: "operational",
    supportedPlatforms: [
      "Facebook",
      "Twitter/X",
      "Instagram",
      "LinkedIn",
      "YouTube",
      "Pinterest",
    ],
    timestamp: new Date().toISOString(),
  });
});

/**
 * Helper function to generate example URLs
 */
function getExampleUrl(platform) {
  const examples = {
    facebook: "https://facebook.com/username",
    twitter: "https://twitter.com/username",
    instagram: "https://instagram.com/username",
    linkedin: "https://linkedin.com/company/company-name",
    youtube: "https://youtube.com/@channelname",
    pinterest: "https://pinterest.com/username",
  };
  return examples[platform] || "";
}

export default router;
