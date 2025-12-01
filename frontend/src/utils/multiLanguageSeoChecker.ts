// src/utils/multiLanguageSeoChecker.ts

/**
 * Multi-Language SEO Checker
 * Validates hreflang tags, language declarations, and international SEO elements
 */

export interface HreflangTag {
  language: string;
  url: string;
  isValid: boolean;
  errors: string[];
}

export interface LanguageDeclaration {
  htmlLang: string | null;
  contentLanguageHeader: string | null;
  metaLanguage: string | null;
  isConsistent: boolean;
  conflicts: string[];
}

export interface LanguageDetectionResult {
  detectedLanguage: string;
  confidence: number;
  declaredLanguage: string | null;
  matches: boolean;
}

export interface URLStructureAnalysis {
  type: "subdomain" | "subdirectory" | "ccTLD" | "parameter" | "unknown";
  example: string;
  isGoodPractice: boolean;
  recommendation: string;
}

export interface RTLAnalysis {
  isRTLLanguage: boolean;
  hasDirAttribute: boolean;
  hasCSSDirection: boolean;
  issues: string[];
}

export interface InternationalSEOReport {
  url: string;
  timestamp: string;
  overallScore: number;
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  hreflangTags: HreflangTag[];
  languageDeclaration: LanguageDeclaration;
  languageDetection: LanguageDetectionResult;
  urlStructure: URLStructureAnalysis;
  rtlAnalysis: RTLAnalysis;
  characterEncoding: {
    isUTF8: boolean;
    declaration: string | null;
    issues: string[];
  };
  issues: {
    critical: IssueItem[];
    high: IssueItem[];
    medium: IssueItem[];
    low: IssueItem[];
  };
  recommendations: string[];
  summary: {
    totalIssues: number;
    hreflangTagsCount: number;
    languagesDetected: number;
    hasXDefault: boolean;
    hasSelfReference: boolean;
    bidirectionalLinksValid: boolean;
  };
}

export interface IssueItem {
  type: string;
  message: string;
  impact: string;
  fix: string;
}

/**
 * ISO 639-1 language codes
 */
const VALID_LANGUAGE_CODES = new Set([
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

/**
 * RTL languages
 */
const RTL_LANGUAGES = new Set(["ar", "he", "fa", "ur", "yi"]);

/**
 * Language detection patterns (simplified - in production, use a proper library)
 */
const LANGUAGE_PATTERNS: Record<string, RegExp> = {
  en: /\b(the|is|are|was|were|have|has|had|will|would|could|should|may|might|can|do|does|did)\b/gi,
  es: /\b(el|la|los|las|un|una|es|son|está|están|del|al|por|para|con|sin|sobre)\b/gi,
  fr: /\b(le|la|les|un|une|est|sont|dans|sur|avec|pour|par|de|du|des|et)\b/gi,
  de: /\b(der|die|das|den|dem|des|ein|eine|ist|sind|und|oder|aber|mit|von|zu)\b/gi,
  it: /\b(il|lo|la|i|gli|le|un|una|è|sono|di|da|in|con|su|per|tra|fra)\b/gi,
  pt: /\b(o|a|os|as|um|uma|é|são|está|estão|de|da|do|em|para|por|com)\b/gi,
  hi: /[\u0900-\u097F]/g, // Devanagari script
  ar: /[\u0600-\u06FF]/g, // Arabic script
  zh: /[\u4E00-\u9FFF]/g, // Chinese characters
  ja: /[\u3040-\u309F\u30A0-\u30FF]/g, // Hiragana and Katakana
};

/**
 * Parse hreflang tags from HTML
 */
export function parseHreflangTags(html: string): HreflangTag[] {
  const tags: HreflangTag[] = [];
  const hreflangRegex =
    /<link[^>]*rel=["']alternate["'][^>]*hreflang=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  const hreflangRegex2 =
    /<link[^>]*hreflang=["']([^"']+)["'][^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["'][^>]*>/gi;

  let match;

  // First pattern
  while ((match = hreflangRegex.exec(html)) !== null) {
    const language = match[1];
    const url = match[2];
    const errors: string[] = [];

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

  // Second pattern (hreflang before rel)
  while ((match = hreflangRegex2.exec(html)) !== null) {
    const language = match[1];
    const url = match[2];

    // Check if not already added
    if (!tags.find((t) => t.language === language && t.url === url)) {
      const errors: string[] = [];

      if (!validateLanguageCode(language)) {
        errors.push(`Invalid language code: ${language}`);
      }

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

  return tags;
}

/**
 * Validate language code (ISO 639-1 format)
 */
export function validateLanguageCode(code: string): boolean {
  // Remove any leading/trailing whitespace
  code = code.trim().toLowerCase();

  // x-default is valid
  if (code === "x-default") return true;

  // Check basic ISO 639-1 (2 letters)
  const parts = code.split("-");
  const languageCode = parts[0];

  if (!VALID_LANGUAGE_CODES.has(languageCode)) {
    return false;
  }

  // If has region code, validate format (e.g., en-US, es-MX)
  if (parts.length > 1) {
    const regionCode = parts[1];
    // Region code should be 2 uppercase letters or 3 digits
    if (!/^[A-Z]{2}$|^\d{3}$/.test(regionCode.toUpperCase())) {
      return false;
    }
  }

  return true;
}

/**
 * Detect content language from text
 */
export function detectContentLanguage(text: string): LanguageDetectionResult {
  // Remove HTML tags
  const cleanText = text.replace(/<[^>]*>/g, " ");

  // Count matches for each language
  const scores: Record<string, number> = {};

  for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    const matches = cleanText.match(pattern);
    scores[lang] = matches ? matches.length : 0;
  }

  // Find language with highest score
  let maxScore = 0;
  let detectedLang = "en"; // default

  for (const [lang, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedLang = lang;
    }
  }

  // Calculate confidence (0-1)
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
 * Check bidirectional links
 */
export function checkBidirectionalLinks(
  tags: HreflangTag[]
): Map<string, boolean> {
  const linkMap = new Map<string, Set<string>>();
  const results = new Map<string, boolean>();

  // Build link map
  for (const tag of tags) {
    if (!linkMap.has(tag.url)) {
      linkMap.set(tag.url, new Set());
    }
    linkMap.get(tag.url)!.add(tag.language);
  }

  // Check bidirectional linking
  linkMap.forEach((languages, url) => {
    languages.forEach((lang) => {
      // Find all tags with this language
      const matchingTags = tags.filter((t) => t.language === lang);

      // Check if all other URLs are referenced
      let allLinked = true;
      for (const otherTag of tags) {
        if (otherTag.url !== url) {
          const hasReturn = matchingTags.some((t) => t.url === otherTag.url);
          if (!hasReturn) {
            allLinked = false;
            break;
          }
        }
      }

      results.set(`${url}-${lang}`, allLinked);
    });
  });

  return results;
}

/**
 * Extract language declarations from HTML
 */
export function extractLanguageDeclarations(html: string): LanguageDeclaration {
  // HTML lang attribute
  const htmlLangMatch = html.match(/<html[^>]*lang=["']([^"']+)["']/i);
  const htmlLang = htmlLangMatch ? htmlLangMatch[1] : null;

  // Meta language tag
  const metaLangMatch = html.match(
    /<meta[^>]*name=["']language["'][^>]*content=["']([^"']+)["']/i
  );
  const metaLanguage = metaLangMatch ? metaLangMatch[1] : null;

  // Check consistency
  const declarations = [htmlLang, metaLanguage].filter(Boolean);
  const isConsistent =
    declarations.length === 0 || new Set(declarations).size === 1;

  const conflicts: string[] = [];
  if (!isConsistent) {
    conflicts.push(
      `Inconsistent language declarations: ${declarations.join(", ")}`
    );
  }

  return {
    htmlLang,
    contentLanguageHeader: null, // Will be filled from HTTP headers
    metaLanguage,
    isConsistent,
    conflicts,
  };
}

/**
 * Analyze URL structure
 */
export function analyzeURLStructure(
  url: string,
  hreflangTags: HreflangTag[]
): URLStructureAnalysis {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathname = urlObj.pathname;

    // Check for ccTLD
    const tldMatch = hostname.match(/\.([a-z]{2})$/i);
    if (
      tldMatch &&
      tldMatch[1] !== "com" &&
      tldMatch[1] !== "net" &&
      tldMatch[1] !== "org"
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
    if (pathParts.length > 0 && pathParts[0].length === 2) {
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
export function analyzeRTL(
  html: string,
  declaredLang: string | null
): RTLAnalysis {
  const langCode = declaredLang ? declaredLang.split("-")[0].toLowerCase() : "";
  const isRTLLanguage = RTL_LANGUAGES.has(langCode);

  const hasDirAttribute = /\bdir=["']rtl["']/i.test(html);
  const hasCSSDirection = /direction:\s*rtl/i.test(html);

  const issues: string[] = [];

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
export function checkCharacterEncoding(html: string): {
  isUTF8: boolean;
  declaration: string | null;
  issues: string[];
} {
  const charsetMatch = html.match(/<meta[^>]*charset=["']?([^"'\s>]+)/i);
  const declaration = charsetMatch ? charsetMatch[1].toUpperCase() : null;

  const isUTF8 = declaration === "UTF-8";
  const issues: string[] = [];

  if (!declaration) {
    issues.push("No character encoding declaration found");
  } else if (!isUTF8) {
    issues.push(
      `Non-UTF-8 encoding detected: ${declaration}. UTF-8 is recommended for multilingual sites.`
    );
  }

  return {
    isUTF8,
    declaration,
    issues,
  };
}

/**
 * Calculate overall score
 */
export function calculateInternationalSEOScore(
  report: Partial<InternationalSEOReport>
): number {
  let score = 100;

  // Deduct for issues
  if (report.issues) {
    score -= report.issues.critical.length * 15;
    score -= report.issues.high.length * 10;
    score -= report.issues.medium.length * 5;
    score -= report.issues.low.length * 2;
  }

  // Bonus for good practices
  if (report.summary?.hasXDefault) score += 5;
  if (report.summary?.hasSelfReference) score += 5;
  if (report.summary?.bidirectionalLinksValid) score += 10;
  if (report.characterEncoding?.isUTF8) score += 5;

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate grade from score
 */
export function calculateGrade(
  score: number
): "A+" | "A" | "B" | "C" | "D" | "F" {
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
function isValidURL(urlString: string): boolean {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Main function to check multi-language SEO
 */
export async function checkMultiLanguageSEO(
  url: string,
  html: string
): Promise<InternationalSEOReport> {
  const hreflangTags = parseHreflangTags(html);
  const languageDeclaration = extractLanguageDeclarations(html);
  const urlStructure = analyzeURLStructure(url, hreflangTags);
  const characterEncoding = checkCharacterEncoding(html);
  const rtlAnalysis = analyzeRTL(html, languageDeclaration.htmlLang);

  // Detect content language
  const languageDetection = detectContentLanguage(html);
  languageDetection.declaredLanguage = languageDeclaration.htmlLang;
  languageDetection.matches =
    languageDetection.detectedLanguage ===
    languageDeclaration.htmlLang?.split("-")[0];

  // Collect issues
  const issues: InternationalSEOReport["issues"] = {
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
  const hasSelfReference = hreflangTags.some((t) => t.url === url);
  if (!hasSelfReference && hreflangTags.length > 0) {
    issues.high.push({
      type: "missing-self-reference",
      message: "Page does not reference itself in hreflang tags",
      impact: "Each page must reference itself with its own language code",
      fix: `Add <link rel="alternate" hreflang="[lang]" href="${url}" />`,
    });
  }

  // Check bidirectional links
  const bidirectionalLinks = checkBidirectionalLinks(hreflangTags);
  const bidirectionalLinksValid = Array.from(bidirectionalLinks.values()).every(
    (v) => v
  );

  if (!bidirectionalLinksValid) {
    issues.high.push({
      type: "broken-bidirectional-links",
      message: "Bidirectional hreflang linking is incomplete",
      impact: "Language versions must reference each other bidirectionally",
      fix: "Ensure all language versions reference each other in hreflang tags",
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
      fix: "Ensure HTML lang attribute and meta tags match",
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

  // Generate recommendations
  const recommendations: string[] = [];

  if (hreflangTags.length === 0) {
    recommendations.push(
      "Add hreflang tags to indicate language versions of your content"
    );
  }

  if (!hasXDefault) {
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

  recommendations.push(
    "Ensure all language versions have consistent content structure"
  );
  recommendations.push("Consider using geo-targeting in Google Search Console");
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
    languagesDetected: new Set(hreflangTags.map((t) => t.language)).size,
    hasXDefault,
    hasSelfReference,
    bidirectionalLinksValid,
  };

  const report: InternationalSEOReport = {
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
}

export default checkMultiLanguageSEO;
