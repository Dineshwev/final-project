// src/utils/securityHeadersChecker.ts

/**
 * Security header configuration and scoring
 */
export interface SecurityHeader {
  name: string;
  present: boolean;
  value: string | null;
  riskLevel: "Critical" | "High" | "Medium" | "Low";
  score: number;
  maxScore: number;
  description: string;
  recommendedValue: string;
  impact: string;
  implementationExample: string;
}

export interface SecurityReport {
  url: string;
  timestamp: string;
  overallScore: number;
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  headers: SecurityHeader[];
  recommendations: Recommendation[];
  additionalChecks: {
    mixedContent: MixedContentCheck;
    httpsEnforced: boolean;
    sslValid: boolean;
    sslDetails?: string;
  };
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    present: number;
    missing: number;
  };
}

export interface Recommendation {
  priority: "Critical" | "High" | "Medium" | "Low";
  header: string;
  action: string;
  implementation: string;
  resources: string[];
}

export interface MixedContentCheck {
  detected: boolean;
  httpResources: string[];
  count: number;
}

/**
 * Security header definitions with scoring and recommendations
 */
export const SECURITY_HEADERS_CONFIG = {
  "strict-transport-security": {
    name: "Strict-Transport-Security",
    riskLevel: "Critical" as const,
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
    riskLevel: "Critical" as const,
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
    riskLevel: "High" as const,
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
    riskLevel: "High" as const,
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
    riskLevel: "Medium" as const,
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
    riskLevel: "Medium" as const,
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
    riskLevel: "Low" as const,
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
    riskLevel: "Medium" as const,
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
    riskLevel: "Medium" as const,
    maxScore: 5,
    description: "Isolates your browsing context from cross-origin windows.",
    recommendedValue: "same-origin",
    impact:
      "Prevents other sites from gaining references to your window, enhancing security.",
    implementationExample: "Cross-Origin-Opener-Policy: same-origin",
  },
  "cross-origin-resource-policy": {
    name: "Cross-Origin-Resource-Policy",
    riskLevel: "Medium" as const,
    maxScore: 5,
    description: "Controls which origins can load your resources.",
    recommendedValue: "same-origin",
    impact:
      "Prevents other sites from loading your resources, protecting against side-channel attacks.",
    implementationExample: "Cross-Origin-Resource-Policy: same-origin",
  },
};

/**
 * Calculate grade based on score
 */
export function calculateGrade(score: number): SecurityReport["grade"] {
  if (score >= 95) return "A+";
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  if (score >= 30) return "D";
  return "F";
}

/**
 * Get color for risk level
 */
export function getRiskColor(riskLevel: SecurityHeader["riskLevel"]): string {
  switch (riskLevel) {
    case "Critical":
      return "#dc2626"; // red-600
    case "High":
      return "#f97316"; // orange-500
    case "Medium":
      return "#eab308"; // yellow-500
    case "Low":
      return "#84cc16"; // lime-500
  }
}

/**
 * Get color for grade
 */
export function getGradeColor(grade: SecurityReport["grade"]): string {
  switch (grade) {
    case "A+":
      return "#22c55e"; // green-500
    case "A":
      return "#84cc16"; // lime-500
    case "B":
      return "#eab308"; // yellow-500
    case "C":
      return "#f97316"; // orange-500
    case "D":
      return "#ef4444"; // red-500
    case "F":
      return "#dc2626"; // red-600
  }
}

/**
 * Analyze security headers from response
 */
export function analyzeHeaders(
  headers: Record<string, string>
): SecurityHeader[] {
  const analyzedHeaders: SecurityHeader[] = [];

  // Normalize header names to lowercase
  const normalizedHeaders: Record<string, string> = {};
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
 * Generate recommendations based on missing/weak headers
 */
export function generateRecommendations(
  headers: SecurityHeader[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

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
 * Calculate overall security score
 */
export function calculateSecurityScore(headers: SecurityHeader[]): number {
  const totalScore = headers.reduce((sum, header) => sum + header.score, 0);
  const maxPossibleScore = headers.reduce(
    (sum, header) => sum + header.maxScore,
    0
  );

  return Math.round((totalScore / maxPossibleScore) * 100);
}

/**
 * Generate summary statistics
 */
export function generateSummary(headers: SecurityHeader[]) {
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
 * Check for mixed content (HTTP resources on HTTPS page)
 */
export function checkMixedContent(
  html: string,
  isHttps: boolean
): MixedContentCheck {
  if (!isHttps) {
    return { detected: false, httpResources: [], count: 0 };
  }

  const httpResources: string[] = [];

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
        const url = match.match(/http:\/\/[^"')]+/)?.[0];
        if (url && !httpResources.includes(url)) {
          httpResources.push(url);
        }
      });
    }
  });

  return {
    detected: httpResources.length > 0,
    httpResources,
    count: httpResources.length,
  };
}

/**
 * Mock function for checking security headers
 * In production, this would make an actual HTTP request
 */
export async function checkSecurityHeaders(
  url: string
): Promise<SecurityReport> {
  // Validate URL
  try {
    new URL(url);
  } catch {
    throw new Error("Invalid URL provided");
  }

  const parsedUrl = new URL(url);
  const isHttps = parsedUrl.protocol === "https:";

  // This is a mock implementation
  // In production, you'd make an actual request through your backend
  const mockHeaders: Record<string, string> = {
    // Add some example headers for testing
    "strict-transport-security": "max-age=31536000; includeSubDomains",
    "x-content-type-options": "nosniff",
  };

  const analyzedHeaders = analyzeHeaders(mockHeaders);
  const recommendations = generateRecommendations(analyzedHeaders);
  const score = calculateSecurityScore(analyzedHeaders);
  const grade = calculateGrade(score);
  const summary = generateSummary(analyzedHeaders);

  // Mock mixed content check
  const mixedContent: MixedContentCheck = {
    detected: false,
    httpResources: [],
    count: 0,
  };

  return {
    url,
    timestamp: new Date().toISOString(),
    overallScore: score,
    grade,
    headers: analyzedHeaders,
    recommendations,
    additionalChecks: {
      mixedContent,
      httpsEnforced: isHttps,
      sslValid: isHttps, // In production, verify SSL certificate
    },
    summary,
  };
}

export default checkSecurityHeaders;
