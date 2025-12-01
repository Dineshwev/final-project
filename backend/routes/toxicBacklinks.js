import express from "express";
import { google } from "googleapis";
import {
  analyzeToxicBacklinks,
  generateDisavowFile,
  checkDomainAuthority,
  checkSpamSignals,
  crossCheckBlacklists,
} from "../services/toxicBacklinkDetector.js";

const router = express.Router();

// Store OAuth2 clients temporarily (in production, use proper session management)
const oauthClients = new Map();

/**
 * POST /api/toxic-backlinks/analyze
 * Analyze backlinks for toxicity/spam
 */
router.post("/analyze", async (req, res) => {
  try {
    const { siteUrl, accessToken, maxBacklinks = 100 } = req.body;

    if (!siteUrl) {
      return res.status(400).json({
        success: false,
        error: "Site URL is required",
      });
    }

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error:
          "Google Search Console access token required. Please authenticate first.",
      });
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({ access_token: accessToken });

    // Get Safe Browsing API key from environment
    const safeBrowsingApiKey = process.env.SAFE_BROWSING_API_KEY;

    // Run analysis
    const report = await analyzeToxicBacklinks(
      siteUrl,
      oauth2Client,
      safeBrowsingApiKey,
      { maxBacklinks }
    );

    res.json(report);
  } catch (error) {
    console.error("Error in toxic backlink analysis:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze backlinks",
    });
  }
});

/**
 * POST /api/toxic-backlinks/generate-disavow
 * Generate disavow file from toxic links
 */
router.post("/generate-disavow", async (req, res) => {
  try {
    const { toxicLinks } = req.body;

    if (!toxicLinks || !Array.isArray(toxicLinks)) {
      return res.status(400).json({
        success: false,
        error: "Toxic links array is required",
      });
    }

    const disavowContent = generateDisavowFile(toxicLinks);

    res.json({
      success: true,
      content: disavowContent,
      count: toxicLinks.length,
    });
  } catch (error) {
    console.error("Error generating disavow file:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate disavow file",
    });
  }
});

/**
 * POST /api/toxic-backlinks/check-single
 * Check a single backlink for toxicity
 */
router.post("/check-single", async (req, res) => {
  try {
    const { url, anchorText = "" } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL is required",
      });
    }

    // Extract domain
    const urlObj = new URL(url);
    const domain = urlObj.origin;

    const safeBrowsingApiKey = process.env.SAFE_BROWSING_API_KEY;

    // Run checks in parallel
    const [domainAuth, spamSigs, blacklists] = await Promise.all([
      checkDomainAuthority(domain),
      checkSpamSignals(url, domain, anchorText),
      crossCheckBlacklists(domain, safeBrowsingApiKey),
    ]);

    // Calculate toxicity
    const { calculateToxicityScore } = await import(
      "../services/toxicBacklinkDetector.js"
    );
    const toxicity = calculateToxicityScore(domainAuth, spamSigs, blacklists);

    res.json({
      success: true,
      url,
      domain,
      toxicityScore: toxicity.toxicityScore,
      category: toxicity.category,
      recommendation: toxicity.recommendation,
      reasons: toxicity.reasons,
      details: {
        domainAuthority: domainAuth,
        spamSignals: spamSigs,
        blacklists: blacklists,
      },
    });
  } catch (error) {
    console.error("Error checking single backlink:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to check backlink",
    });
  }
});

/**
 * GET /api/toxic-backlinks/auth-url
 * Get Google OAuth URL for GSC access
 */
router.get("/auth-url", (req, res) => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI ||
        "http://localhost:3002/api/toxic-backlinks/oauth-callback"
    );

    const scopes = ["https://www.googleapis.com/auth/webmasters.readonly"];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",
    });

    res.json({
      success: true,
      authUrl,
    });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate auth URL",
    });
  }
});

/**
 * GET /api/toxic-backlinks/oauth-callback
 * Handle OAuth callback from Google
 */
router.get("/oauth-callback", async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send("Authorization code not found");
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI ||
        "http://localhost:3002/api/toxic-backlinks/oauth-callback"
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Store tokens temporarily (in production, use proper session/database)
    const clientId = Date.now().toString();
    oauthClients.set(clientId, oauth2Client);

    // Redirect back to frontend with token
    res.redirect(
      `http://localhost:5173/toxic-backlinks?token=${tokens.access_token}&clientId=${clientId}`
    );
  } catch (error) {
    console.error("Error in OAuth callback:", error);
    res.status(500).send("Authentication failed");
  }
});

/**
 * GET /api/toxic-backlinks/info
 * Get information about toxicity scoring
 */
router.get("/info", (req, res) => {
  res.json({
    success: true,
    info: {
      categories: {
        safe: {
          color: "green",
          range: "0-39",
          description: "Low risk backlinks from authoritative sources",
          action: "Keep these links",
        },
        suspicious: {
          color: "yellow",
          range: "40-69",
          description: "Medium risk backlinks that need manual review",
          action: "Review manually before deciding",
        },
        toxic: {
          color: "red",
          range: "70-100",
          description: "High risk spam/toxic backlinks",
          action: "Disavow recommended",
        },
      },
      scoringFactors: {
        domainAuthority: {
          weight: "High",
          factors: [
            "Google index status",
            "HTTPS usage",
            "DNS resolution",
            "Domain age",
            "TLD quality",
          ],
        },
        spamSignals: {
          weight: "High",
          factors: [
            "Spam keywords in URL",
            "Suspicious anchor text",
            "Foreign language",
            "Too many outbound links",
            "Thin content",
          ],
        },
        blacklists: {
          weight: "Critical",
          factors: [
            "Google Safe Browsing",
            "Public spam domain lists",
            "Suspicious domain patterns",
          ],
        },
      },
      disavowFile: {
        format: "Plain text file (.txt)",
        upload: "Google Search Console > Links > Disavow links",
        note: "Use with caution - only disavow genuinely harmful links",
      },
    },
  });
});

/**
 * GET /api/toxic-backlinks/health
 * Health check endpoint
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "Toxic Backlink Detector",
    features: [
      "Google Search Console integration",
      "Domain authority checking",
      "Spam signal detection",
      "Google Safe Browsing API",
      "Toxicity scoring (0-100)",
      "Disavow file generation",
    ],
    requirements: {
      gscAuth:
        !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
      safeBrowsing: !!process.env.SAFE_BROWSING_API_KEY,
    },
  });
});

export default router;
