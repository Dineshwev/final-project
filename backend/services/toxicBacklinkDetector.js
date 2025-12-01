import axios from "axios";
import { google } from "googleapis";
import dns from "dns";
import { promisify } from "util";

const dnsResolve = promisify(dns.resolve);

// Known spam keywords for URL analysis
const SPAM_KEYWORDS = [
  // Adult content
  "porn",
  "xxx",
  "adult",
  "sex",
  "escort",
  "dating",
  // Gambling
  "casino",
  "poker",
  "betting",
  "gamble",
  "slots",
  // Pharma
  "viagra",
  "cialis",
  "pharmacy",
  "pills",
  "medication",
  // Common spam
  "payday",
  "loan",
  "credit",
  "insurance",
  "replica",
  "weight-loss",
  "diet-pills",
  "seo-service",
  "backlink",
  // Suspicious patterns
  "click-here",
  "buy-now",
  "limited-offer",
  "cheap",
];

// Public spam domain patterns (simplified - in production use comprehensive lists)
const SPAM_DOMAIN_PATTERNS = [
  /\.tk$/i,
  /\.ml$/i,
  /\.ga$/i,
  /\.cf$/i,
  /\.gq$/i,
  /\d{6,}/i, // Domains with 6+ consecutive digits
  /^[a-z]{20,}/i, // Very long random letter strings
];

/**
 * Get backlinks from Google Search Console API
 * @param {string} siteUrl - The site URL (e.g., https://example.com)
 * @param {object} auth - Google OAuth2 client
 * @param {number} rowLimit - Max number of rows to fetch (default 1000)
 * @returns {Promise<Array>} Array of backlink data
 */
export async function getBacklinks(siteUrl, auth, rowLimit = 1000) {
  try {
    console.log(`Fetching backlinks for: ${siteUrl}`);

    const searchConsole = google.searchconsole({ version: "v1", auth });

    // Query for external links (backlinks)
    const response = await searchConsole.searchanalytics.query({
      siteUrl: siteUrl,
      requestBody: {
        startDate: getDateDaysAgo(90), // Last 90 days
        endDate: getDateDaysAgo(0), // Today
        dimensions: ["page", "query"],
        dimensionFilterGroups: [
          {
            filters: [
              {
                dimension: "page",
                operator: "notContains",
                expression: siteUrl, // External links only
              },
            ],
          },
        ],
        rowLimit: rowLimit,
        startRow: 0,
      },
    });

    // Also fetch links table data
    const linksResponse =
      await searchConsole.urlTestingTools.mobileFriendlyTest.run({
        requestBody: {
          url: siteUrl,
        },
      });

    console.log(`Found ${response.data.rows?.length || 0} backlinks`);

    return response.data.rows || [];
  } catch (error) {
    console.error("Error fetching backlinks:", error.message);

    // If GSC API fails, return mock data for demo
    if (
      error.message.includes("authentication") ||
      error.message.includes("credentials")
    ) {
      throw new Error(
        "Google Search Console authentication required. Please connect your GSC account."
      );
    }

    throw error;
  }
}

/**
 * Check domain authority indicators
 * @param {string} domain - Domain to check
 * @returns {Promise<object>} Domain authority signals
 */
export async function checkDomainAuthority(domain) {
  const signals = {
    indexed: false,
    https: false,
    age: null,
    dns: false,
    score: 0,
  };

  try {
    // 1. Check HTTPS
    signals.https = domain.startsWith("https://");
    if (signals.https) signals.score += 20;

    // 2. Check DNS resolution (basic availability check)
    try {
      const cleanDomain = domain.replace(/^https?:\/\//, "").split("/")[0];
      await dnsResolve(cleanDomain, "A");
      signals.dns = true;
      signals.score += 15;
    } catch (dnsError) {
      console.log(`DNS lookup failed for ${domain}`);
    }

    // 3. Check Google index status (site:domain.com)
    try {
      const cleanDomain = domain.replace(/^https?:\/\//, "").split("/")[0];
      const searchUrl = `https://www.google.com/search?q=site:${cleanDomain}`;
      const response = await axios.get(searchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 10000,
      });

      // Check if results exist (rough check)
      if (
        response.data.includes("did not match any documents") ||
        response.data.includes("No results found")
      ) {
        signals.indexed = false;
      } else {
        signals.indexed = true;
        signals.score += 30;
      }
    } catch (error) {
      console.log(`Google index check failed for ${domain}:`, error.message);
    }

    // 4. Check domain age using WHOIS (simplified - would need proper WHOIS API)
    // For now, we'll skip this and add a placeholder
    signals.age = "Unknown";

    // 5. Additional heuristics
    const cleanDomain = domain.replace(/^https?:\/\//, "").split("/")[0];

    // Penalize very long domains
    if (cleanDomain.length > 40) {
      signals.score -= 10;
    }

    // Reward .com, .org, .net TLDs
    if (/\.(com|org|net|edu|gov)$/i.test(cleanDomain)) {
      signals.score += 10;
    }
  } catch (error) {
    console.error(
      `Error checking domain authority for ${domain}:`,
      error.message
    );
  }

  return signals;
}

/**
 * Check for spam signals on a URL/page
 * @param {string} url - URL to check
 * @param {string} domain - Domain of the URL
 * @param {string} anchorText - Anchor text used in backlink
 * @returns {Promise<object>} Spam signals
 */
export async function checkSpamSignals(url, domain, anchorText = "") {
  const signals = {
    spamKeywords: [],
    suspiciousAnchor: false,
    foreignLanguage: false,
    tooManyLinks: false,
    lowQualityContent: false,
    score: 0, // Higher = more spammy
  };

  try {
    // 1. Check for spam keywords in URL
    const urlLower = url.toLowerCase();
    SPAM_KEYWORDS.forEach((keyword) => {
      if (urlLower.includes(keyword)) {
        signals.spamKeywords.push(keyword);
        signals.score += 15;
      }
    });

    // 2. Check domain patterns
    const cleanDomain = domain.replace(/^https?:\/\//, "").split("/")[0];
    SPAM_DOMAIN_PATTERNS.forEach((pattern) => {
      if (pattern.test(cleanDomain)) {
        signals.score += 20;
      }
    });

    // 3. Check anchor text for exact match spam
    if (anchorText) {
      const anchorLower = anchorText.toLowerCase();

      // Exact match commercial keywords
      const commercialKeywords = [
        "buy",
        "cheap",
        "best",
        "review",
        "discount",
        "sale",
      ];
      const hasCommercial = commercialKeywords.some((kw) =>
        anchorLower.includes(kw)
      );

      // Over-optimized anchor (too many keywords)
      const wordCount = anchorText.split(/\s+/).length;
      if (wordCount > 8 || hasCommercial) {
        signals.suspiciousAnchor = true;
        signals.score += 10;
      }
    }

    // 4. Fetch page and analyze content
    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 15000,
        maxRedirects: 3,
      });

      const html = response.data;

      // Count outbound links
      const linkMatches = html.match(/<a[^>]*href/gi) || [];
      if (linkMatches.length > 100) {
        signals.tooManyLinks = true;
        signals.score += 15;
      }

      // Check for foreign characters (non-Latin scripts)
      // This is a rough check - in production, you'd compare with site's primary language
      const hasCyrillic = /[А-Яа-яЁё]/.test(html);
      const hasChinese = /[\u4e00-\u9fa5]/.test(html);
      const hasArabic = /[\u0600-\u06FF]/.test(html);

      if (hasCyrillic || hasChinese || hasArabic) {
        signals.foreignLanguage = true;
        signals.score += 10;
      }

      // Check content quality indicators
      const textLength = html.replace(/<[^>]*>/g, "").length;
      const scriptLength = (
        html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || []
      ).join("").length;

      // If script/text ratio is high, might be low quality
      if (scriptLength > textLength * 0.5) {
        signals.lowQualityContent = true;
        signals.score += 10;
      }

      // Check for thin content
      if (textLength < 500) {
        signals.lowQualityContent = true;
        signals.score += 10;
      }
    } catch (fetchError) {
      console.log(
        `Could not fetch page content for ${url}:`,
        fetchError.message
      );
      // If page can't be fetched, it might be suspicious
      signals.score += 5;
    }
  } catch (error) {
    console.error(`Error checking spam signals for ${url}:`, error.message);
  }

  return signals;
}

/**
 * Cross-check domain against blacklists
 * @param {string} domain - Domain to check
 * @param {string} safeBrowsingApiKey - Google Safe Browsing API key
 * @returns {Promise<object>} Blacklist check results
 */
export async function crossCheckBlacklists(domain, safeBrowsingApiKey) {
  const results = {
    safeBrowsing: false,
    publicBlacklists: false,
    score: 0,
  };

  try {
    const cleanDomain = domain.replace(/^https?:\/\//, "").split("/")[0];

    // 1. Google Safe Browsing API check
    if (safeBrowsingApiKey) {
      try {
        const safeBrowsingUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${safeBrowsingApiKey}`;

        const response = await axios.post(
          safeBrowsingUrl,
          {
            client: {
              clientId: "seo-analyzer",
              clientVersion: "1.0.0",
            },
            threatInfo: {
              threatTypes: [
                "MALWARE",
                "SOCIAL_ENGINEERING",
                "UNWANTED_SOFTWARE",
                "POTENTIALLY_HARMFUL_APPLICATION",
              ],
              platformTypes: ["ANY_PLATFORM"],
              threatEntryTypes: ["URL"],
              threatEntries: [
                { url: `http://${cleanDomain}` },
                { url: `https://${cleanDomain}` },
              ],
            },
          },
          {
            timeout: 10000,
          }
        );

        if (response.data.matches && response.data.matches.length > 0) {
          results.safeBrowsing = true;
          results.score += 50; // Major red flag
        }
      } catch (sbError) {
        console.log(
          `Safe Browsing API check failed for ${domain}:`,
          sbError.message
        );
      }
    }

    // 2. Check against public spam lists (simplified)
    // In production, you'd maintain a database of known spam domains
    // or integrate with services like Spamhaus, SURBL, etc.
    const knownSpamTLDs = [".tk", ".ml", ".ga", ".cf", ".gq"];
    if (knownSpamTLDs.some((tld) => cleanDomain.endsWith(tld))) {
      results.publicBlacklists = true;
      results.score += 25;
    }

    // Check for suspicious patterns common in spam domains
    if (
      /\d{4,}/.test(cleanDomain) || // Many numbers
      cleanDomain.length > 50 || // Very long
      (cleanDomain.match(/-/g) || []).length > 5
    ) {
      // Many hyphens
      results.publicBlacklists = true;
      results.score += 15;
    }
  } catch (error) {
    console.error(`Error checking blacklists for ${domain}:`, error.message);
  }

  return results;
}

/**
 * Calculate overall toxicity score for a backlink
 * @param {object} domainAuthority - Domain authority signals
 * @param {object} spamSignals - Spam detection signals
 * @param {object} blacklistResults - Blacklist check results
 * @returns {object} Toxicity score and breakdown
 */
export function calculateToxicityScore(
  domainAuthority,
  spamSignals,
  blacklistResults
) {
  // Start with base score of 0 (safe)
  let toxicityScore = 0;
  const reasons = [];

  // 1. Factor in domain authority (inverse - low authority = higher toxicity)
  const authorityScore = domainAuthority.score || 0;
  if (authorityScore < 20) {
    toxicityScore += 30;
    reasons.push("Very low domain authority");
  } else if (authorityScore < 40) {
    toxicityScore += 15;
    reasons.push("Low domain authority");
  }

  if (!domainAuthority.indexed) {
    toxicityScore += 20;
    reasons.push("Not indexed by Google");
  }

  if (!domainAuthority.https) {
    toxicityScore += 10;
    reasons.push("No HTTPS");
  }

  if (!domainAuthority.dns) {
    toxicityScore += 15;
    reasons.push("DNS resolution failed");
  }

  // 2. Add spam signals score directly
  toxicityScore += spamSignals.score;

  if (spamSignals.spamKeywords.length > 0) {
    reasons.push(
      `Spam keywords detected: ${spamSignals.spamKeywords.join(", ")}`
    );
  }

  if (spamSignals.suspiciousAnchor) {
    reasons.push("Suspicious anchor text pattern");
  }

  if (spamSignals.foreignLanguage) {
    reasons.push("Foreign language content");
  }

  if (spamSignals.tooManyLinks) {
    reasons.push("Excessive outbound links");
  }

  if (spamSignals.lowQualityContent) {
    reasons.push("Low quality or thin content");
  }

  // 3. Add blacklist score (highest weight)
  toxicityScore += blacklistResults.score;

  if (blacklistResults.safeBrowsing) {
    reasons.push("⚠️ FLAGGED by Google Safe Browsing");
  }

  if (blacklistResults.publicBlacklists) {
    reasons.push("Found in spam domain lists");
  }

  // Cap at 100
  toxicityScore = Math.min(100, Math.round(toxicityScore));

  // Determine recommendation
  let recommendation = "Keep";
  let category = "safe";

  if (toxicityScore >= 70) {
    recommendation = "Disavow";
    category = "toxic";
  } else if (toxicityScore >= 40) {
    recommendation = "Review";
    category = "suspicious";
  }

  return {
    toxicityScore,
    category,
    recommendation,
    reasons,
    breakdown: {
      domainAuthority: 100 - authorityScore, // Inverse
      spamSignals: spamSignals.score,
      blacklists: blacklistResults.score,
    },
  };
}

/**
 * Generate Google Search Console disavow file format
 * @param {Array} toxicLinks - Array of backlinks marked for disavow
 * @returns {string} Disavow file content
 */
export function generateDisavowFile(toxicLinks) {
  const lines = [
    "# Disavow file generated by SEO Analyzer",
    `# Generated on: ${new Date().toISOString()}`,
    `# Total links to disavow: ${toxicLinks.length}`,
    "#",
    "# Format: domain:example.com or individual URLs",
    "#",
  ];

  // Group by domain for efficiency
  const domainGroups = {};
  const individualUrls = [];

  toxicLinks.forEach((link) => {
    try {
      const url = new URL(link.url);
      const domain = url.hostname;

      if (!domainGroups[domain]) {
        domainGroups[domain] = [];
      }
      domainGroups[domain].push(link.url);
    } catch (error) {
      individualUrls.push(link.url);
    }
  });

  // Add domain-level disavows (more efficient than individual URLs)
  Object.keys(domainGroups).forEach((domain) => {
    const urls = domainGroups[domain];

    // If more than 3 toxic links from same domain, disavow entire domain
    if (urls.length >= 3) {
      lines.push(`# ${urls.length} toxic links from this domain`);
      lines.push(`domain:${domain}`);
      lines.push("");
    } else {
      // Otherwise list individual URLs
      urls.forEach((url) => {
        lines.push(url);
      });
      lines.push("");
    }
  });

  // Add individual URLs that couldn't be parsed
  if (individualUrls.length > 0) {
    lines.push("# Individual URLs");
    individualUrls.forEach((url) => {
      lines.push(url);
    });
  }

  return lines.join("\n");
}

/**
 * Perform comprehensive toxic backlink analysis
 * @param {string} siteUrl - Site URL to analyze
 * @param {object} auth - Google OAuth2 client
 * @param {string} safeBrowsingApiKey - Google Safe Browsing API key
 * @param {object} options - Analysis options
 * @returns {Promise<object>} Complete analysis report
 */
export async function analyzeToxicBacklinks(
  siteUrl,
  auth,
  safeBrowsingApiKey,
  options = {}
) {
  const { maxBacklinks = 100, includeAllCategories = true } = options;

  try {
    console.log(`Starting toxic backlink analysis for: ${siteUrl}`);

    // Step 1: Get backlinks from GSC
    const backlinks = await getBacklinks(siteUrl, auth, maxBacklinks);

    if (!backlinks || backlinks.length === 0) {
      return {
        success: false,
        message:
          "No backlinks found. Make sure the site is verified in Google Search Console.",
        results: [],
      };
    }

    console.log(`Analyzing ${backlinks.length} backlinks...`);

    // Step 2: Analyze each backlink
    const results = [];
    let processedCount = 0;

    for (const backlink of backlinks) {
      try {
        const url = backlink.keys[0]; // Page URL
        const query = backlink.keys[1] || ""; // Anchor text approximation

        // Extract domain
        const domain = new URL(url).origin;

        console.log(
          `Analyzing ${++processedCount}/${backlinks.length}: ${domain}`
        );

        // Run parallel checks
        const [domainAuth, spamSigs, blacklists] = await Promise.all([
          checkDomainAuthority(domain),
          checkSpamSignals(url, domain, query),
          crossCheckBlacklists(domain, safeBrowsingApiKey),
        ]);

        // Calculate toxicity score
        const toxicity = calculateToxicityScore(
          domainAuth,
          spamSigs,
          blacklists
        );

        // Build result object
        const result = {
          url,
          domain,
          anchorText: query,
          toxicityScore: toxicity.toxicityScore,
          category: toxicity.category,
          recommendation: toxicity.recommendation,
          reasons: toxicity.reasons,
          metrics: {
            clicks: backlink.clicks || 0,
            impressions: backlink.impressions || 0,
            ctr: backlink.ctr || 0,
            position: backlink.position || 0,
          },
          details: {
            domainAuthority: domainAuth,
            spamSignals: spamSigs,
            blacklists: blacklists,
          },
        };

        results.push(result);

        // Rate limiting - small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error analyzing backlink:`, error.message);
      }
    }

    // Step 3: Generate summary statistics
    const summary = {
      total: results.length,
      safe: results.filter((r) => r.category === "safe").length,
      suspicious: results.filter((r) => r.category === "suspicious").length,
      toxic: results.filter((r) => r.category === "toxic").length,
      averageScore:
        results.reduce((sum, r) => sum + r.toxicityScore, 0) / results.length,
      toDisavow: results.filter((r) => r.recommendation === "Disavow").length,
    };

    // Step 4: Sort by toxicity score (highest first)
    results.sort((a, b) => b.toxicityScore - a.toxicityScore);

    console.log(
      `Analysis complete: ${summary.toxic} toxic, ${summary.suspicious} suspicious, ${summary.safe} safe`
    );

    return {
      success: true,
      siteUrl,
      analyzedAt: new Date().toISOString(),
      summary,
      results: includeAllCategories
        ? results
        : results.filter((r) => r.toxicityScore >= 40),
    };
  } catch (error) {
    console.error("Error in toxic backlink analysis:", error);
    throw error;
  }
}

// Helper function to get date N days ago in YYYY-MM-DD format
function getDateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}

export default {
  getBacklinks,
  checkDomainAuthority,
  checkSpamSignals,
  crossCheckBlacklists,
  calculateToxicityScore,
  generateDisavowFile,
  analyzeToxicBacklinks,
};
