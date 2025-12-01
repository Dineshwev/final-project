import express from "express";
import {
  performAccessibilityAudit,
  runAccessibilityScan,
  generateDetailedReport,
} from "../services/accessibilityChecker.js";

const router = express.Router();

/**
 * POST /api/accessibility/audit
 * Run complete accessibility audit
 */
router.post("/audit", async (req, res) => {
  try {
    const { url, options = {} } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL is required",
      });
    }

    console.log(`Starting accessibility audit for: ${url}`);

    const result = await performAccessibilityAudit(url, options);

    res.json(result);
  } catch (error) {
    console.error("Accessibility audit error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

/**
 * POST /api/accessibility/scan
 * Run basic scan without full report
 */
router.post("/scan", async (req, res) => {
  try {
    const { url, options = {} } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL is required",
      });
    }

    const result = await runAccessibilityScan(url, options);

    res.json(result);
  } catch (error) {
    console.error("Accessibility scan error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

/**
 * GET /api/accessibility/wcag-info
 * Get WCAG level information
 */
router.get("/wcag-info", (req, res) => {
  res.json({
    success: true,
    levels: {
      A: {
        name: "Level A",
        description:
          "Essential support. Required for basic accessibility. All sites should meet Level A.",
        examples: [
          "Text alternatives for images",
          "Keyboard accessibility",
          "Proper use of headings",
        ],
      },
      AA: {
        name: "Level AA",
        description:
          "Ideal support. Required for most organizations. Recommended standard for all sites.",
        examples: [
          "Color contrast ratios",
          "Resize text up to 200%",
          "Multiple ways to find content",
        ],
      },
      AAA: {
        name: "Level AAA",
        description:
          "Specialized support. Not required for most organizations but provides maximum accessibility.",
        examples: [
          "Sign language interpretation",
          "Enhanced contrast",
          "Reading level assistance",
        ],
      },
    },
    impactLevels: {
      critical: {
        description:
          "Results in blocked content for people with disabilities. Must be fixed immediately.",
        color: "#d32f2f",
      },
      serious: {
        description:
          "Results in serious barriers for people with disabilities. Should be fixed as soon as possible.",
        color: "#f57c00",
      },
      moderate: {
        description:
          "Results in some barriers for people with disabilities. Should be fixed in near term.",
        color: "#fbc02d",
      },
      minor: {
        description:
          "Results in minor barriers for people with disabilities. Can be fixed over time.",
        color: "#689f38",
      },
    },
  });
});

/**
 * GET /api/accessibility/health
 * Health check endpoint
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "WCAG Accessibility Checker",
    status: "operational",
    capabilities: {
      axeCore: "4.8+",
      wcagVersions: ["2.0", "2.1"],
      levels: ["A", "AA", "AAA"],
      browser: "Puppeteer/Chromium",
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
