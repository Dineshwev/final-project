/**
 * Multi-Language SEO Service
 * Backend service for analyzing international SEO elements
 */

import axios from "axios";

/**
 * Check Multi-Language SEO for a given URL
 */
async function checkMultiLanguageSEO(url) {
  try {
    // Validate URL
    const urlObj = new URL(url);

    // Fetch the webpage
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 10000,
      maxRedirects: 5,
    });

    const html = response.data;
    const headers = response.headers;

    // Parse hreflang tags
    const hreflangTags = parseHreflangTags(html);

    // Extract language declarations
    const languageDeclaration = extractLanguageDeclarations(html, headers);

    // Detect content language
    const languageDetection = detectContentLanguage(html);
    languageDetection.declaredLanguage = languageDeclaration.htmlLang;
    languageDetection.matches =
      languageDetection.detectedLanguage ===
      languageDeclaration.htmlLang?.split("-")[0];

    // Analyze URL structure
    const urlStructure = analyzeURLStructure(url, hreflangTags);

    // Check character encoding
    const characterEncoding = checkCharacterEncoding(html, headers);

    // Analyze RTL support
    const rtlAnalysis = analyzeRTL(html, languageDeclaration.htmlLang);

    // Collect issues
    const issues = {
      critical: [],
      high: [],
      medium: [],
      low: [],
    };

    // Check for x-default
    const hasXDefault = hreflangTags.some((t) => t.language === "x-default");
    if (!hasXDefault && hreflangTags.length > 0) {
      issues.high.push({
        type: "missing-x-default",
        message: "Missing x-default hreflang tag",
        impact:
          "Search engines may not know which version to show to users without a matching language",
        fix: 'Add <link rel="alternate" hreflang="x-default" href="[default-url]" />',
      });
    }

    // Check for self-reference
    const hasSelfReference = hreflangTags.some(
      (t) => normalizeURL(t.url) === normalizeURL(url)
    );
    if (!hasSelfReference && hreflangTags.length > 0) {
      issues.high.push({
        type: "missing-self-reference",
        message: "Page does not reference itself in hreflang tags",
        impact: "Each page must reference itself with its own language code",
        fix: `Add <link rel="alternate" hreflang="[lang]" href="${url}" />`,
      });
    }

    // Check bidirectional links
    const bidirectionalResults = checkBidirectionalLinks(hreflangTags);
    const bidirectionalLinksValid = bidirectionalResults.every(
      (r) => r.isValid
    );

    if (!bidirectionalLinksValid) {
      const brokenLinks = bidirectionalResults.filter((r) => !r.isValid);
      issues.high.push({
        type: "broken-bidirectional-links",
        message: "Bidirectional hreflang linking is incomplete",
        impact: `${brokenLinks.length} language versions missing return links`,
        fix: "Ensure all language versions reference each other bidirectionally",
      });
    }

    // Add invalid hreflang tags
    hreflangTags.forEach((tag) => {
      if (!tag.isValid) {
        issues.critical.push({
          type: "invalid-hreflang",
          message: `Invalid hreflang tag: ${tag.language}`,
          impact: tag.errors.join("; "),
          fix: "Use valid ISO 639-1 language codes and proper URLs",
        });
      }
    });

    // Language declaration issues
    if (!languageDeclaration.isConsistent) {
      issues.medium.push({
        type: "inconsistent-language-declaration",
        message: "Language declarations are inconsistent",
        impact: languageDeclaration.conflicts.join("; "),
        fix: "Ensure HTML lang attribute, meta tags, and HTTP headers match",
      });
    }

    // Language detection mismatch
    if (!languageDetection.matches && languageDetection.confidence > 0.5) {
      issues.medium.push({
        type: "language-mismatch",
        message: `Declared language (${languageDetection.declaredLanguage}) doesn't match detected language (${languageDetection.detectedLanguage})`,
        impact: "Content language may not match declared language",
        fix: "Ensure HTML lang attribute matches actual content language",
      });
    }

    // Character encoding issues
    characterEncoding.issues.forEach((issue) => {
      issues.high.push({
        type: "encoding-issue",
        message: issue,
        impact: "May cause display issues with special characters",
        fix: 'Add <meta charset="UTF-8"> in <head>',
      });
    });

    // RTL issues
    rtlAnalysis.issues.forEach((issue) => {
      issues.medium.push({
        type: "rtl-issue",
        message: issue,
        impact: "RTL languages may not display correctly",
        fix: 'Add dir="rtl" attribute to <html> tag',
      });
    });

    // URL structure issues
    if (!urlStructure.isGoodPractice) {
      issues.low.push({
        type: "url-structure",
        message: `URL structure (${urlStructure.type}) is not optimal`,
        impact: urlStructure.recommendation,
        fix: "Consider using subdirectories for language versions",
      });
    }

    // Check for duplicate content
    if (hreflangTags.length > 0) {
      const canonicalTag = html.match(
        /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i
      );
      if (!canonicalTag) {
        issues.medium.push({
          type: "missing-canonical",
          message: "No canonical tag found",
          impact: "May cause duplicate content issues across language versions",
          fix: "Add canonical tag to each language version pointing to itself",
        });
      }
    }

    // Generate recommendations
    const recommendations = [];

    if (hreflangTags.length === 0) {
      recommendations.push(
        "Add hreflang tags to indicate language versions of your content"
      );
    } else {
      recommendations.push(`✓ Found ${hreflangTags.length} hreflang tags`);
    }

    if (!hasXDefault && hreflangTags.length > 0) {
      recommendations.push(
        "Add an x-default hreflang tag for users without matching language preference"
      );
    }

    if (characterEncoding.isUTF8) {
      recommendations.push(
        "✓ Using UTF-8 encoding - good for multilingual support"
      );
    }

    if (urlStructure.type === "subdirectory") {
      recommendations.push(
        "✓ Using subdirectory structure - recommended for most multilingual sites"
      );
    }

    if (languageDeclaration.isConsistent) {
      recommendations.push(
        "✓ Language declarations are consistent across HTML and headers"
      );
    }

    recommendations.push(
      "Ensure all language versions have consistent content structure"
    );
    recommendations.push(
      "Consider using geo-targeting in Google Search Console"
    );
    recommendations.push(
      "Test your international pages using Google's International Targeting Report"
    );

    // Build summary
    const summary = {
      totalIssues: Object.values(issues).reduce(
        (sum, arr) => sum + arr.length,
        0
      ),
      hreflangTagsCount: hreflangTags.length,
      languagesDetected: new Set(
        hreflangTags.map((t) => t.language.split("-")[0])
      ).size,
      hasXDefault,
      hasSelfReference,
      bidirectionalLinksValid,
    };

    // Build report
    const report = {
      url,
      timestamp: new Date().toISOString(),
      overallScore: 0,
      grade: "F",
      hreflangTags,
      languageDeclaration,
      languageDetection,
      urlStructure,
      rtlAnalysis,
      characterEncoding,
      issues,
      recommendations,
      summary,
    };

    // Calculate score and grade
    report.overallScore = calculateInternationalSEOScore(report);
    report.grade = calculateGrade(report.overallScore);

    return report;
  } catch (error) {
    console.error("Error checking multi-language SEO:", error);
    throw new Error(`Failed to analyze ${url}: ${error.message}`);
  }
}

/**
 * Parse hreflang tags from HTML
 */
function parseHreflangTags(html) {
  const tags = [];
  const patterns = [
    /<link[^>]*rel=["']alternate["'][^>]*hreflang=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*>/gi,
    /<link[^>]*hreflang=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*rel=["']alternate["'][^>]*>/gi,
    /<link[^>]*href=["']([^"']+)["'][^>]*hreflang=["']([^"']+)["'][^>]*rel=["']alternate["'][^>]*>/gi,
  ];

  patterns.forEach((pattern, index) => {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      let language, url;

      if (index === 0 || index === 1) {
        language = match[1];
        url = match[2];
      } else {
        url = match[1];
        language = match[2];
      }

      // Check if not already added
      if (!tags.find((t) => t.language === language && t.url === url)) {
        const errors = [];

        // Validate language code
        if (!validateLanguageCode(language)) {
          errors.push(`Invalid language code: ${language}`);
        }

        // Validate URL
        if (!isValidURL(url)) {
          errors.push(`Invalid URL: ${url}`);
        }

        tags.push({
          language,
          url,
          isValid: errors.length === 0,
          errors,
        });
      }
    }
  });

  return tags;
}

/**
 * Validate language code (ISO 639-1 format)
 */
function validateLanguageCode(code) {
  const validCodes = new Set([
    "en",
    "es",
    "fr",
    "de",
    "it",
    "pt",
    "nl",
    "ru",
    "zh",
    "ja",
    "ko",
    "ar",
    "hi",
    "bn",
    "pa",
    "te",
    "mr",
    "ta",
    "ur",
    "gu",
    "kn",
    "ml",
    "or",
    "pl",
    "uk",
    "ro",
    "el",
    "hu",
    "cs",
    "sv",
    "no",
    "da",
    "fi",
    "sk",
    "bg",
    "hr",
    "sr",
    "sl",
    "lt",
    "lv",
    "et",
    "tr",
    "he",
    "id",
    "ms",
    "th",
    "vi",
    "fa",
    "sw",
    "am",
    "km",
    "lo",
    "my",
    "ka",
    "hy",
    "az",
  ]);

  code = code.trim().toLowerCase();

  // x-default is valid
  if (code === "x-default") return true;

  // Check basic ISO 639-1 (2 letters)
  const parts = code.split("-");
  const languageCode = parts[0];

  if (!validCodes.has(languageCode)) {
    return false;
  }

  // If has region code, validate format
  if (parts.length > 1) {
    const regionCode = parts[1];
    if (!/^[A-Z]{2}$|^\d{3}$/i.test(regionCode)) {
      return false;
    }
  }

  return true;
}

/**
 * Detect content language from text
 */
function detectContentLanguage(html) {
  const cleanText = html.replace(/<[^>]*>/g, " ").substring(0, 50000);

  const patterns = {
    en: /\b(the|is|are|was|were|have|has|had|will|would|could|should|may|might|can|do|does|did|and|or|but|not|with|from|about)\b/gi,
    es: /\b(el|la|los|las|un|una|es|son|está|están|del|al|por|para|con|sin|sobre|como|más|pero|todo|todos)\b/gi,
    fr: /\b(le|la|les|un|une|est|sont|dans|sur|avec|pour|par|de|du|des|et|mais|ou|qui|que|ne|pas)\b/gi,
    de: /\b(der|die|das|den|dem|des|ein|eine|ist|sind|und|oder|aber|mit|von|zu|im|am|für|auf|nicht)\b/gi,
    it: /\b(il|lo|la|i|gli|le|un|una|è|sono|di|da|in|con|su|per|tra|fra|come|più|ma|non|che)\b/gi,
    pt: /\b(o|a|os|as|um|uma|é|são|está|estão|de|da|do|em|para|por|com|como|mais|mas|não|que)\b/gi,
    hi: /[\u0900-\u097F]/g,
    ar: /[\u0600-\u06FF]/g,
    zh: /[\u4E00-\u9FFF]/g,
    ja: /[\u3040-\u309F\u30A0-\u30FF]/g,
  };

  const scores = {};

  for (const [lang, pattern] of Object.entries(patterns)) {
    const matches = cleanText.match(pattern);
    scores[lang] = matches ? matches.length : 0;
  }

  let maxScore = 0;
  let detectedLang = "en";

  for (const [lang, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedLang = lang;
    }
  }

  const totalMatches = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = totalMatches > 0 ? maxScore / totalMatches : 0;

  return {
    detectedLanguage: detectedLang,
    confidence: Math.round(confidence * 100) / 100,
    declaredLanguage: null,
    matches: false,
  };
}

/**
 * Extract language declarations from HTML
 */
function extractLanguageDeclarations(html, headers) {
  const htmlLangMatch = html.match(/<html[^>]*lang=["']([^"']+)["']/i);
  const htmlLang = htmlLangMatch ? htmlLangMatch[1] : null;

  const metaLangMatch = html.match(
    /<meta[^>]*name=["']language["'][^>]*content=["']([^"']+)["']/i
  );
  const metaLanguage = metaLangMatch ? metaLangMatch[1] : null;

  const contentLanguageHeader = headers["content-language"] || null;

  const declarations = [htmlLang, metaLanguage, contentLanguageHeader].filter(
    Boolean
  );
  const isConsistent =
    declarations.length === 0 ||
    new Set(declarations.map((d) => d.split("-")[0].toLowerCase())).size === 1;

  const conflicts = [];
  if (!isConsistent) {
    conflicts.push(
      `Inconsistent language declarations: ${declarations.join(", ")}`
    );
  }

  return {
    htmlLang,
    contentLanguageHeader,
    metaLanguage,
    isConsistent,
    conflicts,
  };
}

/**
 * Analyze URL structure
 */
function analyzeURLStructure(url, hreflangTags) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathname = urlObj.pathname;

    // Check for ccTLD
    const tldMatch = hostname.match(/\.([a-z]{2})$/i);
    if (
      tldMatch &&
      !["com", "net", "org", "edu", "gov"].includes(tldMatch[1])
    ) {
      return {
        type: "ccTLD",
        example: hostname,
        isGoodPractice: true,
        recommendation:
          "ccTLD structure is good for geo-targeting but requires separate domains.",
      };
    }

    // Check for subdomain
    const parts = hostname.split(".");
    if (parts.length > 2 && parts[0] !== "www") {
      return {
        type: "subdomain",
        example: hostname,
        isGoodPractice: true,
        recommendation:
          "Subdomain structure is acceptable but may split domain authority.",
      };
    }

    // Check for subdirectory
    const pathParts = pathname.split("/").filter(Boolean);
    if (
      pathParts.length > 0 &&
      pathParts[0].length === 2 &&
      /^[a-z]{2}$/i.test(pathParts[0])
    ) {
      return {
        type: "subdirectory",
        example: `${hostname}/${pathParts[0]}/`,
        isGoodPractice: true,
        recommendation:
          "Subdirectory structure is recommended for most multilingual sites.",
      };
    }

    // Check for URL parameter
    if (
      urlObj.searchParams.has("lang") ||
      urlObj.searchParams.has("language")
    ) {
      return {
        type: "parameter",
        example: url,
        isGoodPractice: false,
        recommendation:
          "URL parameters are not recommended. Use subdirectories instead.",
      };
    }

    return {
      type: "unknown",
      example: url,
      isGoodPractice: false,
      recommendation:
        "Could not determine URL structure. Consider using subdirectories (e.g., /en/, /fr/).",
    };
  } catch {
    return {
      type: "unknown",
      example: url,
      isGoodPractice: false,
      recommendation: "Invalid URL format.",
    };
  }
}

/**
 * Analyze RTL support
 */
function analyzeRTL(html, declaredLang) {
  const rtlLanguages = new Set(["ar", "he", "fa", "ur", "yi"]);
  const langCode = declaredLang ? declaredLang.split("-")[0].toLowerCase() : "";
  const isRTLLanguage = rtlLanguages.has(langCode);

  const hasDirAttribute = /\bdir=["']rtl["']/i.test(html);
  const hasCSSDirection = /direction:\s*rtl/i.test(html);

  const issues = [];

  if (isRTLLanguage && !hasDirAttribute) {
    issues.push('RTL language detected but no dir="rtl" attribute found');
  }

  if (isRTLLanguage && !hasCSSDirection) {
    issues.push("Consider adding CSS direction: rtl for proper RTL support");
  }

  if (!isRTLLanguage && hasDirAttribute) {
    issues.push('dir="rtl" attribute found but language is not RTL');
  }

  return {
    isRTLLanguage,
    hasDirAttribute,
    hasCSSDirection,
    issues,
  };
}

/**
 * Check character encoding
 */
function checkCharacterEncoding(html, headers) {
  const charsetMatch = html.match(/<meta[^>]*charset=["']?([^"'\s>]+)/i);
  const declaration = charsetMatch ? charsetMatch[1].toUpperCase() : null;

  const contentType = headers["content-type"] || "";
  const headerCharset = contentType.match(/charset=([^;]+)/i);
  const headerDeclaration = headerCharset
    ? headerCharset[1].toUpperCase()
    : null;

  const isUTF8 = declaration === "UTF-8" || headerDeclaration === "UTF-8";
  const issues = [];

  if (!declaration && !headerDeclaration) {
    issues.push("No character encoding declaration found");
  } else if (!isUTF8) {
    issues.push(
      `Non-UTF-8 encoding detected: ${
        declaration || headerDeclaration
      }. UTF-8 is recommended for multilingual sites.`
    );
  }

  if (declaration && headerDeclaration && declaration !== headerDeclaration) {
    issues.push(
      `Character encoding mismatch: HTML declares ${declaration} but HTTP header declares ${headerDeclaration}`
    );
  }

  return {
    isUTF8,
    declaration: declaration || headerDeclaration,
    issues,
  };
}

/**
 * Check bidirectional links
 */
function checkBidirectionalLinks(tags) {
  const results = [];
  const urlMap = new Map();

  // Build URL to languages map
  tags.forEach((tag) => {
    if (!urlMap.has(tag.url)) {
      urlMap.set(tag.url, []);
    }
    urlMap.get(tag.url).push(tag.language);
  });

  // Check each tag
  tags.forEach((sourceTag) => {
    // Get the URL this tag points to
    const targetURL = sourceTag.url;
    const targetLanguages = urlMap.get(targetURL) || [];

    // Check if target URL has a return link
    const hasReturnLink = tags.some(
      (tag) => tag.url === sourceTag.url && tag.language === sourceTag.language
    );

    results.push({
      sourceLanguage: sourceTag.language,
      targetURL,
      isValid: hasReturnLink || sourceTag.language === "x-default",
      missingReturnLinks: hasReturnLink ? [] : [sourceTag.language],
    });
  });

  return results;
}

/**
 * Calculate international SEO score
 */
function calculateInternationalSEOScore(report) {
  let score = 100;

  // Deduct for issues
  score -= report.issues.critical.length * 15;
  score -= report.issues.high.length * 10;
  score -= report.issues.medium.length * 5;
  score -= report.issues.low.length * 2;

  // Bonus for good practices
  if (report.summary.hasXDefault) score += 5;
  if (report.summary.hasSelfReference) score += 5;
  if (report.summary.bidirectionalLinksValid) score += 10;
  if (report.characterEncoding.isUTF8) score += 5;

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate grade from score
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
 * Helper to validate URL
 */
function isValidURL(urlString) {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalize URL for comparison
 */
function normalizeURL(urlString) {
  try {
    const url = new URL(urlString);
    // Remove trailing slash and convert to lowercase
    let normalized = url.href.toLowerCase();
    if (normalized.endsWith("/")) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    return urlString.toLowerCase();
  }
}

export default {
  checkMultiLanguageSEO,
};
