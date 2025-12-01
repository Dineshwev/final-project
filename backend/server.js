// Environment variables
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Log environment variables for debugging (excluding sensitive ones)
console.log("Environment loaded, NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
// Check if API keys are loaded (only log if they exist, not their values)
console.log(
  "PAGE_SPEED_INSIGHTS_API_KEY exists:",
  !!process.env.PAGE_SPEED_INSIGHTS_API_KEY
);
console.log("WHOAPI_KEY exists:", !!process.env.WHOAPI_KEY);
console.log(
  "SAFE_BROWSING_API_KEY exists:",
  !!process.env.SAFE_BROWSING_API_KEY
);

// Core modules
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

// Import routes
import seoRoutes from "./routes/seo.js";
import scanRoutes from "./routes/scan.js";
import backlinkRoutes from "./routes/backlinks.js";
import sslRoutes from "./routes/ssl.js";
import historyRoutes from "./routes/history.js";
import exportRoutes from "./routes/export.js";
import userRoutes from "./routes/user.js";
import contentAnalysisRoutes from "./routes/contentAnalysis.js";
import compareRoutes from "./routes/compare.js";
import linkCheckerRoutes from "./routes/linkChecker.js";
import schemaValidatorRoutes from "./routes/schemaValidator.js";
import rankTrackerRoutes from "./routes/rankTracker.js";
import securityHeadersRoutes from "./routes/securityHeaders.js";
import multiLanguageSeoRoutes from "./routes/multiLanguageSeo.js";
import alertRoutes from "./routes/alerts.js";
import googleMyBusinessRoutes from "./routes/googleMyBusiness.js";
import citationRoutes from "./routes/citations.js";
import ogValidatorRoutes from "./routes/ogValidator.js";
import twitterCardRoutes from "./routes/twitterCard.js";
import shareCountRoutes from "./routes/shareCount.js";
import socialPresenceRoutes from "./routes/socialPresence.js";
import pinterestRichPinRoutes from "./routes/pinterestRichPin.js";
import accessibilityRoutes from "./routes/accessibility.js";
import toxicBacklinksRoutes from "./routes/toxicBacklinks.js";
import duplicateContentRoutes from "./routes/duplicateContent.js";
import paymentRoutes from "./routes/payment.js";
import contactRoutes from "./routes/contact.js";

// Import middleware
import { verifyToken } from "./middleware/auth.js";

// Import services
import schedulerService from "./services/schedulerService.js";

//Initialize express app
const app = express();
const PORT = process.env.PORT || 3003; // Changed to 3003 to avoid conflict

// Middleware
// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/i.test(
        origin
      );
      const envAllowed = (process.env.CORS_ALLOW_ORIGINS || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      // Allow any localhost origin in development OR any localhost in general
      if (process.env.NODE_ENV === "development" || isLocalhost) {
        return callback(null, true);
      }

      // Default allowed origins (extendable via env)
      const defaultAllowed = [
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:3000",
        "http://localhost:54340",
      ];
      if (defaultAllowed.includes(origin) || envAllowed.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed: " + origin), false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Configure Helmet with custom security headers
const isDev = (process.env.NODE_ENV || "development") !== "production";
app.use(
  helmet({
    // In dev, disable COOP to avoid noisy warnings with local popups/tools
    crossOriginOpenerPolicy: isDev
      ? false
      : { policy: "same-origin-allow-popups" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'",
          "http://localhost:3003",
          "http://127.0.0.1:3003",
          "http://localhost:3002",
          "http://127.0.0.1:3002",
          "http://localhost:8081",
          "http://127.0.0.1:8081",
          "http://localhost:54340",
          "ws://localhost:54340",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https://ui-avatars.com",
          "https://cdnjs.cloudflare.com",
        ],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdnjs.cloudflare.com",
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      },
    },
  })
);
app.use(express.json());
app.use(morgan("dev"));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  // Provide a JSON response body so clients parsing JSON won't fail
  handler: (req, res /*, next */) => {
    const retryAfter = Math.ceil(limiter.windowMs / 1000) || 900; // seconds
    res.setHeader("Retry-After", String(retryAfter));
    res.status(429).json({
      status: "error",
      message: "Too many requests from this IP, please try again later",
      retryAfter,
    });
  },
});

// In development, avoid strict rate limiting to make local testing easier
if (process.env.NODE_ENV === "development") {
  console.log("Rate limiter is disabled in development mode");
} else {
  app.use("/api", limiter);
}

// Routes for API endpoints
app.use("/api/seo", seoRoutes);
app.use("/api", scanRoutes);
app.use("/api/backlinks", backlinkRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/user", userRoutes);
app.use("/api/ssl", sslRoutes);
// New Content Quality Analyzer endpoint
app.use("/api", contentAnalysisRoutes); // provides /api/content-analysis
// Competitor comparison endpoint
app.use("/api", compareRoutes); // provides /api/compare
// Link checker endpoint
app.use("/api", linkCheckerRoutes); // provides /api/link-checker
app.use("/api", schemaValidatorRoutes); // provides /api/schema-validator
app.use("/api/rank-tracker", rankTrackerRoutes);
app.use("/api/security-headers", securityHeadersRoutes); // provides /api/security-headers
app.use("/api/multi-language-seo", multiLanguageSeoRoutes); // provides /api/multi-language-seo
app.use("/api/alerts", alertRoutes); // provides /api/alerts
app.use("/api/gmb", googleMyBusinessRoutes); // provides /api/gmb (Google My Business)
app.use("/api/citations", citationRoutes); // provides /api/citations (Citation Tracker)
app.use("/api/og-validator", ogValidatorRoutes); // provides /api/og-validator (Open Graph Validator)
app.use("/api/twitter-card", twitterCardRoutes); // provides /api/twitter-card (Twitter Card Validator)
app.use("/api/share-counts", shareCountRoutes); // provides /api/share-counts (Social Share Count Tracker)
app.use("/api/payment", paymentRoutes); // provides /api/payment (PayPal Payment Processing)
app.use("/api/social-presence", socialPresenceRoutes); // provides /api/social-presence (Social Media Presence Validator)
app.use("/api/pinterest-rich-pin", pinterestRichPinRoutes); // provides /api/pinterest-rich-pin (Pinterest Rich Pins Validator)
app.use("/api/accessibility", accessibilityRoutes); // provides /api/accessibility (WCAG Accessibility Checker)
app.use("/api/toxic-backlinks", toxicBacklinksRoutes); // provides /api/toxic-backlinks (Toxic Backlink Detector)
app.use("/api/duplicate-content", duplicateContentRoutes); // provides /api/duplicate-content (Duplicate Content Detector)
app.use("/api/contact", contactRoutes); // provides /api/contact (Contact Form)

// Setup static file serving for frontend (serve built assets)
const frontendBuildPath = path.join(__dirname, "..", "frontand", "build");
app.use(express.static(frontendBuildPath));

// API root endpoint for health checks
app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to the SEO Health Checker API",
    version: "1.0.0",
    endpoints: {
      seoAnalysis: "/api/seo/analyze?url=https://example.com",
    },
  });
});

// API status endpoint (public - no auth required)
app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    timestamp: new Date().toISOString(),
    apiKeys: {
      pageSpeedInsightsApiKey: !!process.env.PAGE_SPEED_INSIGHTS_API_KEY,
      whoApiKey: !!process.env.WHOAPI_KEY,
      safeBrowsingApiKey: !!process.env.SAFE_BROWSING_API_KEY,
    },
  });
});

// Serve index.html for any non-API routes (for SPA)
app.get("*", (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.join(frontendBuildPath, "index.html"));
});

// 404 handler for API routes (must be after all route definitions)
app.use("/api/*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Start the scheduler service for automatic rescans
  schedulerService.start();
  console.log("Automatic scan scheduler initialized");
});

// Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing scheduler");
  schedulerService.stop();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing scheduler");
  schedulerService.stop();
  process.exit(0);
});

export default app;
