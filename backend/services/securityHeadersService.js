// backend/services/securityHeadersService.js

import axios from "axios";
import https from "https";

/**
 * Security header configurations
 */
const SECURITY_HEADERS_CONFIG = {
  "strict-transport-security": {
    name: "Strict-Transport-Security",
    riskLevel: "Critical",
    maxScore: 15,
    description:
      "Forces browsers to use HTTPS connections only, preventing man-in-the-middle attacks.",
    recommendedValue: "max-age=31536000; includeSubDomains; preload",
    impact:
      "Without HSTS, users can be vulnerable to SSL stripping attacks where connections are downgraded to HTTP.",
    implementationExample:
      "Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
  },
  "content-security-policy": {
    name: "Content-Security-Policy",
    riskLevel: "Critical",
    maxScore: 15,
    description:
      "Prevents XSS attacks by controlling which resources can be loaded and executed.",
    recommendedValue:
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'",
    impact:
      "Missing CSP leaves your site vulnerable to cross-site scripting (XSS) and data injection attacks.",
    implementationExample:
      "Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'",
  },
  "x-frame-options": {
    name: "X-Frame-Options",
    riskLevel: "High",
    maxScore: 10,
    description:
      "Prevents clickjacking attacks by controlling whether the page can be embedded in iframes.",
    recommendedValue: "DENY or SAMEORIGIN",
    impact:
      "Without this header, attackers can embed your site in an iframe and trick users into performing actions.",
    implementationExample: "X-Frame-Options: DENY",
  },
  "x-content-type-options": {
    name: "X-Content-Type-Options",
    riskLevel: "High",
    maxScore: 10,
    description:
      "Prevents MIME type sniffing, ensuring browsers respect the declared Content-Type.",
    recommendedValue: "nosniff",
    impact:
      "Without this, browsers may incorrectly interpret files, potentially executing malicious content.",
    implementationExample: "X-Content-Type-Options: nosniff",
  },
  "referrer-policy": {
    name: "Referrer-Policy",
    riskLevel: "Medium",
    maxScore: 5,
    description:
      "Controls how much referrer information is shared when navigating away from your site.",
    recommendedValue: "strict-origin-when-cross-origin or no-referrer",
    impact:
      "Without this, sensitive information in URLs may leak to third-party sites.",
    implementationExample: "Referrer-Policy: strict-origin-when-cross-origin",
  },
  "permissions-policy": {
    name: "Permissions-Policy",
    riskLevel: "Medium",
    maxScore: 5,
    description:
      "Controls which browser features and APIs can be used on your site.",
    recommendedValue: "geolocation=(), microphone=(), camera=()",
    impact:
      "Without this, third-party scripts may access sensitive device features.",
    implementationExample:
      "Permissions-Policy: geolocation=(), microphone=(), camera=()",
  },
  "x-xss-protection": {
    name: "X-XSS-Protection",
    riskLevel: "Low",
    maxScore: 5,
    description:
      "Legacy header for XSS protection (deprecated, use CSP instead).",
    recommendedValue: "1; mode=block",
    impact:
      "Minimal impact as modern browsers have built-in XSS protection. CSP is preferred.",
    implementationExample: "X-XSS-Protection: 1; mode=block",
  },
  "cross-origin-embedder-policy": {
    name: "Cross-Origin-Embedder-Policy",
    riskLevel: "Medium",
    maxScore: 5,
    description:
      "Prevents documents from loading cross-origin resources that don't explicitly grant permission.",
    recommendedValue: "require-corp",
    impact:
      "Required for enabling powerful features like SharedArrayBuffer and high-precision timers.",
    implementationExample: "Cross-Origin-Embedder-Policy: require-corp",
  },
  "cross-origin-opener-policy": {
    name: "Cross-Origin-Opener-Policy",
    riskLevel: "Medium",
    maxScore: 5,
    description: "Isolates your browsing context from cross-origin windows.",
    recommendedValue: "same-origin",
    impact:
      "Prevents other sites from gaining references to your window, enhancing security.",
    implementationExample: "Cross-Origin-Opener-Policy: same-origin",
  },
  "cross-origin-resource-policy": {
    name: "Cross-Origin-Resource-Policy",
    riskLevel: "Medium",
    maxScore: 5,
    description: "Controls which origins can load your resources.",
    recommendedValue: "same-origin",
    impact:
      "Prevents other sites from loading your resources, protecting against side-channel attacks.",
    implementationExample: "Cross-Origin-Resource-Policy: same-origin",
  },
};

/**
 * Analyze security headers
 */
function analyzeHeaders(headers) {
  const analyzedHeaders = [];

  // Normalize header names to lowercase
  const normalizedHeaders = {};
  Object.entries(headers).forEach(([key, value]) => {
    normalizedHeaders[key.toLowerCase()] = value;
  });

  // Check each security header
  Object.entries(SECURITY_HEADERS_CONFIG).forEach(([headerKey, config]) => {
    const headerValue = normalizedHeaders[headerKey];
    const present = !!headerValue;

    analyzedHeaders.push({
      name: config.name,
      present,
      value: headerValue || null,
      riskLevel: config.riskLevel,
      score: present ? config.maxScore : 0,
      maxScore: config.maxScore,
      description: config.description,
      recommendedValue: config.recommendedValue,
      impact: config.impact,
      implementationExample: config.implementationExample,
    });
  });

  return analyzedHeaders;
}

/**
 * Generate recommendations
 */
function generateRecommendations(headers) {
  const recommendations = [];

  headers.forEach((header) => {
    if (!header.present) {
      recommendations.push({
        priority: header.riskLevel,
        header: header.name,
        action: `Implement ${header.name} header`,
        implementation: header.implementationExample,
        resources: [
          "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers",
          "https://securityheaders.com/",
          "https://owasp.org/www-project-secure-headers/",
        ],
      });
    }
  });

  // Sort by priority
  const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  recommendations.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return recommendations;
}

/**
 * Calculate security score
 */
function calculateSecurityScore(headers) {
  const totalScore = headers.reduce((sum, header) => sum + header.score, 0);
  const maxPossibleScore = headers.reduce(
    (sum, header) => sum + header.maxScore,
    0
  );

  return Math.round((totalScore / maxPossibleScore) * 100);
}

/**
 * Calculate grade
 */
function calculateGrade(score) {
  if (score >= 95) return "A+";
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  if (score >= 30) return "D";
  return "F";
}

/**
 * Generate summary
 */
function generateSummary(headers) {
  const summary = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    present: 0,
    missing: 0,
  };

  headers.forEach((header) => {
    if (header.present) {
      summary.present++;
    } else {
      summary.missing++;

      switch (header.riskLevel) {
        case "Critical":
          summary.critical++;
          break;
        case "High":
          summary.high++;
          break;
        case "Medium":
          summary.medium++;
          break;
        case "Low":
          summary.low++;
          break;
      }
    }
  });

  return summary;
}

/**
 * Check for mixed content
 */
function checkMixedContent(html, isHttps) {
  if (!isHttps) {
    return { detected: false, httpResources: [], count: 0 };
  }

  const httpResources = [];

  // Match HTTP URLs in various contexts
  const patterns = [
    /src=["']http:\/\/[^"']+["']/gi,
    /href=["']http:\/\/[^"']+["']/gi,
    /url\(["']?http:\/\/[^"')]+["']?\)/gi,
  ];

  patterns.forEach((pattern) => {
    const matches = html.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        const urlMatch = match.match(/http:\/\/[^"')]+/);
        if (urlMatch) {
          const url = urlMatch[0];
          if (!httpResources.includes(url)) {
            httpResources.push(url);
          }
        }
      });
    }
  });

  return {
    detected: httpResources.length > 0,
    httpResources: httpResources.slice(0, 10), // Limit to 10 examples
    count: httpResources.length,
  };
}

/**
 * Validate SSL certificate
 */
async function validateSSL(url) {
  const parsedUrl = new URL(url);

  if (parsedUrl.protocol !== "https:") {
    return {
      valid: false,
      reason: "URL is not HTTPS",
    };
  }

  try {
    await axios.head(url, {
      timeout: 10000,
      httpsAgent: new https.Agent({
        rejectUnauthorized: true, // Will throw if cert is invalid
      }),
    });

    return {
      valid: true,
      reason: "SSL certificate is valid",
    };
  } catch (error) {
    if (error.code === "CERT_HAS_EXPIRED") {
      return { valid: false, reason: "SSL certificate has expired" };
    } else if (error.code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE") {
      return { valid: false, reason: "Unable to verify SSL certificate" };
    } else if (error.code === "SELF_SIGNED_CERT_IN_CHAIN") {
      return { valid: false, reason: "Self-signed certificate detected" };
    }

    return {
      valid: false,
      reason: error.message || "SSL validation failed",
    };
  }
}

/**
 * Check security headers for a URL
 */
export async function checkSecurityHeaders(url) {
  try {
    // Validate URL
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === "https:";

    // Fetch the page
    const response = await axios.get(url, {
      timeout: 15000,
      maxRedirects: 5,
      validateStatus: () => true, // Accept any status code
      httpsAgent: new https.Agent({
        rejectUnauthorized: false, // Allow self-signed certs for analysis
      }),
    });

    // Analyze headers
    const analyzedHeaders = analyzeHeaders(response.headers);
    const recommendations = generateRecommendations(analyzedHeaders);
    const score = calculateSecurityScore(analyzedHeaders);
    const grade = calculateGrade(score);
    const summary = generateSummary(analyzedHeaders);

    // Check for mixed content
    const mixedContent = checkMixedContent(response.data, isHttps);

    // Validate SSL
    const sslValidation = isHttps
      ? await validateSSL(url)
      : { valid: false, reason: "Not HTTPS" };

    return {
      success: true,
      data: {
        url,
        timestamp: new Date().toISOString(),
        overallScore: score,
        grade,
        headers: analyzedHeaders,
        recommendations,
        additionalChecks: {
          mixedContent,
          httpsEnforced: isHttps,
          sslValid: sslValidation.valid,
          sslDetails: sslValidation.reason,
        },
        summary,
      },
    };
  } catch (error) {
    // Handle specific error types
    if (error.code === "ENOTFOUND") {
      throw new Error("Domain not found. Please check the URL.");
    } else if (error.code === "ETIMEDOUT" || error.code === "ECONNABORTED") {
      throw new Error(
        "Request timed out. The server took too long to respond."
      );
    } else if (error.code === "ECONNREFUSED") {
      throw new Error(
        "Connection refused. The server is not accepting connections."
      );
    } else if (error.message?.includes("Invalid URL")) {
      throw new Error("Invalid URL format. Please provide a valid URL.");
    }

    throw new Error(error.message || "Failed to check security headers");
  }
}

export default { checkSecurityHeaders };
