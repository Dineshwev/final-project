import express from "express";
import {
  analyzeDuplicateContent,
  generateDiff,
  detectDuplicates,
  extractMainContent,
  calculateSimilarity,
} from "../services/duplicateContentDetector.js";

const router = express.Router();

/**
 * POST /api/duplicate-content/analyze
 * Analyze a website for duplicate content
 */
router.post("/analyze", async (req, res) => {
  try {
    const {
      url,
      maxPages = 50,
      exactThreshold = 0.95,
      nearThreshold = 0.8,
    } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL is required",
      });
    }

    // Validate URL
    try {
      new URL(url);
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: "Invalid URL format",
      });
    }

    console.log(`Starting duplicate content analysis for: ${url}`);

    // Run analysis
    const report = await analyzeDuplicateContent(url, {
      maxPages,
      exactThreshold,
      nearThreshold,
    });

    res.json(report);
  } catch (error) {
    console.error("Error in duplicate content analysis:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze duplicate content",
    });
  }
});

/**
 * POST /api/duplicate-content/compare
 * Compare two specific pages for similarity
 */
router.post("/compare", async (req, res) => {
  try {
    const { url1, url2 } = req.body;

    if (!url1 || !url2) {
      return res.status(400).json({
        success: false,
        error: "Both url1 and url2 are required",
      });
    }

    // Validate URLs
    try {
      new URL(url1);
      new URL(url2);
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: "Invalid URL format",
      });
    }

    // Fetch and compare pages
    const puppeteer = (await import("puppeteer")).default;
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page1 = await browser.newPage();
      const page2 = await browser.newPage();

      await page1.goto(url1, { timeout: 30000, waitUntil: "networkidle2" });
      await page2.goto(url2, { timeout: 30000, waitUntil: "networkidle2" });

      const html1 = await page1.content();
      const html2 = await page2.content();

      const title1 = await page1.title();
      const title2 = await page2.title();

      await page1.close();
      await page2.close();

      // Extract content
      const content1 = extractMainContent(html1);
      const content2 = extractMainContent(html2);

      // Calculate similarity
      const similarity = calculateSimilarity(content1, content2);

      // Generate diff
      const diff = generateDiff(content1, content2);

      res.json({
        success: true,
        comparison: {
          page1: {
            url: url1,
            title: title1,
            wordCount: content1.split(/\s+/).length,
          },
          page2: {
            url: url2,
            title: title2,
            wordCount: content2.split(/\s+/).length,
          },
          similarity,
          diff,
          verdict:
            similarity >= 0.95
              ? "Exact Duplicate"
              : similarity >= 0.8
              ? "Near Duplicate"
              : similarity >= 0.6
              ? "Similar"
              : "Unique",
        },
      });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error("Error comparing pages:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to compare pages",
    });
  }
});

/**
 * POST /api/duplicate-content/diff
 * Get detailed diff between two pages from a previous analysis
 */
router.post("/diff", async (req, res) => {
  try {
    const { text1, text2 } = req.body;

    if (!text1 || !text2) {
      return res.status(400).json({
        success: false,
        error: "Both text1 and text2 are required",
      });
    }

    const diff = generateDiff(text1, text2);

    res.json({
      success: true,
      diff,
    });
  } catch (error) {
    console.error("Error generating diff:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate diff",
    });
  }
});

/**
 * GET /api/duplicate-content/info
 * Get information about duplicate content detection
 */
router.get("/info", (req, res) => {
  res.json({
    success: true,
    info: {
      description:
        "Duplicate content detector using web crawling and TF-IDF similarity analysis",
      features: [
        "Automated website crawling",
        "Main content extraction (removes boilerplate)",
        "TF-IDF based similarity calculation",
        "Exact duplicate detection (MD5 hashing)",
        "Near-duplicate detection (80%+ similarity)",
        "Duplicate clustering",
        "Network graph visualization data",
        "Text diff generation",
      ],
      thresholds: {
        exact: {
          value: 0.95,
          description:
            "Pages with ≥95% similarity are considered exact duplicates",
        },
        near: {
          value: 0.8,
          description:
            "Pages with ≥80% similarity are considered near duplicates",
        },
        similar: {
          value: 0.6,
          description: "Pages with ≥60% similarity are considered similar",
        },
      },
      preprocessing: [
        "HTML tag removal",
        "Boilerplate removal (headers, footers, navigation)",
        "Text lowercasing",
        "Stop word removal",
        "Whitespace normalization",
        "Special character handling",
      ],
      algorithms: {
        hashing: "MD5 for exact duplicate detection",
        similarity: "Cosine similarity with TF-IDF vectors",
        tokenization: "Natural.js word tokenizer",
        clustering: "Connected component analysis",
      },
      recommendations: {
        exactDuplicates: "Use canonical tags or 301 redirects",
        nearDuplicates: "Differentiate content or use rel=canonical",
        largeClusters: "Consider content consolidation",
        highPercentage: "Conduct comprehensive content audit",
      },
    },
  });
});

/**
 * GET /api/duplicate-content/health
 * Health check endpoint
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "Duplicate Content Detector",
    status: "operational",
    features: {
      crawling: "Puppeteer-based web crawling",
      contentExtraction: "Boilerplate removal",
      similarity: "TF-IDF cosine similarity",
      hashing: "MD5 exact duplicate detection",
      clustering: "Graph-based clustering",
    },
    dependencies: {
      puppeteer: "Web crawling and rendering",
      natural: "TF-IDF and tokenization",
      stopword: "Stop word filtering",
    },
  });
});

export default router;
