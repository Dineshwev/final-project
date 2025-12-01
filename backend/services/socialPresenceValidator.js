import axios from "axios";
import * as cheerio from "cheerio";

// Platform URL patterns
const PLATFORM_PATTERNS = {
  facebook: {
    name: "Facebook",
    pattern: /^https?:\/\/(www\.)?(facebook|fb)\.com\/([a-zA-Z0-9._-]+)\/?$/i,
    icon: "facebook",
    color: "#1877F2",
  },
  twitter: {
    name: "Twitter/X",
    pattern: /^https?:\/\/(www\.)?(twitter|x)\.com\/([a-zA-Z0-9_]+)\/?$/i,
    icon: "twitter",
    color: "#1DA1F2",
  },
  instagram: {
    name: "Instagram",
    pattern: /^https?:\/\/(www\.)?instagram\.com\/([a-zA-Z0-9._]+)\/?$/i,
    icon: "instagram",
    color: "#E4405F",
  },
  linkedin: {
    name: "LinkedIn",
    pattern:
      /^https?:\/\/(www\.)?linkedin\.com\/(company|in)\/([a-zA-Z0-9-]+)\/?$/i,
    icon: "linkedin",
    color: "#0A66C2",
  },
  youtube: {
    name: "YouTube",
    pattern:
      /^https?:\/\/(www\.)?youtube\.com\/(@[a-zA-Z0-9_-]+|c\/[a-zA-Z0-9_-]+|channel\/[a-zA-Z0-9_-]+)\/?$/i,
    icon: "youtube",
    color: "#FF0000",
  },
  pinterest: {
    name: "Pinterest",
    pattern: /^https?:\/\/(www\.)?pinterest\.com\/([a-zA-Z0-9_]+)\/?$/i,
    icon: "pinterest",
    color: "#E60023",
  },
};

/**
 * Validate URL format for a specific platform
 * @param {string} url - The URL to validate
 * @param {string} platform - Platform name (facebook, twitter, etc.)
 * @returns {Object} Validation result
 */
export function validateURL(url, platform) {
  if (!url || !url.trim()) {
    return {
      isValid: false,
      error: "URL is required",
    };
  }

  const platformConfig = PLATFORM_PATTERNS[platform.toLowerCase()];
  if (!platformConfig) {
    return {
      isValid: false,
      error: `Unsupported platform: ${platform}`,
    };
  }

  const isValid = platformConfig.pattern.test(url);
  const match = url.match(platformConfig.pattern);
  const username = match ? match[match.length - 1] : null;

  return {
    isValid,
    platform: platformConfig.name,
    username,
    error: isValid ? null : `Invalid ${platformConfig.name} URL format`,
  };
}

/**
 * Check if a profile exists by making HTTP HEAD request
 * @param {string} url - Profile URL to check
 * @returns {Promise<Object>} Check result
 */
export async function checkProfileExists(url) {
  try {
    const response = await axios.head(url, {
      timeout: 5000,
      maxRedirects: 5,
      validateStatus: (status) => status < 500, // Don't throw on 4xx
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const exists = response.status === 200;

    return {
      exists,
      statusCode: response.status,
      accessible: exists,
      error: null,
    };
  } catch (error) {
    // If HEAD fails, try GET request as fallback
    try {
      const getResponse = await axios.get(url, {
        timeout: 5000,
        maxRedirects: 5,
        validateStatus: (status) => status < 500,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      const exists = getResponse.status === 200;

      return {
        exists,
        statusCode: getResponse.status,
        accessible: exists,
        error: null,
      };
    } catch (getError) {
      return {
        exists: false,
        statusCode: getError.response?.status || 0,
        accessible: false,
        error: getError.message,
      };
    }
  }
}

/**
 * Extract basic profile information from URL
 * @param {string} url - Profile URL
 * @param {string} platform - Platform name
 * @returns {Promise<Object>} Extracted profile info
 */
export async function extractProfileInfo(url, platform) {
  try {
    const response = await axios.get(url, {
      timeout: 8000,
      maxRedirects: 5,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const $ = cheerio.load(response.data);
    const info = {
      name: null,
      description: null,
      followers: null,
      verified: false,
      profileImage: null,
    };

    // Platform-specific extraction
    switch (platform.toLowerCase()) {
      case "facebook":
        info.name =
          $('meta[property="og:title"]').attr("content") ||
          $("title").text().split("|")[0].trim();
        info.description = $('meta[property="og:description"]').attr("content");
        info.profileImage = $('meta[property="og:image"]').attr("content");
        break;

      case "twitter":
        info.name =
          $('meta[property="og:title"]').attr("content") ||
          $('meta[name="twitter:title"]').attr("content");
        info.description =
          $('meta[property="og:description"]').attr("content") ||
          $('meta[name="twitter:description"]').attr("content");
        info.profileImage =
          $('meta[property="og:image"]').attr("content") ||
          $('meta[name="twitter:image"]').attr("content");
        break;

      case "instagram":
        info.name = $('meta[property="og:title"]').attr("content");
        info.description = $('meta[property="og:description"]').attr("content");
        info.profileImage = $('meta[property="og:image"]').attr("content");
        break;

      case "linkedin":
        info.name = $('meta[property="og:title"]').attr("content");
        info.description = $('meta[property="og:description"]').attr("content");
        info.profileImage = $('meta[property="og:image"]').attr("content");
        break;

      case "youtube":
        info.name =
          $('meta[property="og:title"]').attr("content") ||
          $("title").text().replace(" - YouTube", "");
        info.description = $('meta[property="og:description"]').attr("content");
        info.profileImage = $('meta[property="og:image"]').attr("content");
        break;

      case "pinterest":
        info.name = $('meta[property="og:title"]').attr("content");
        info.description = $('meta[property="og:description"]').attr("content");
        info.profileImage = $('meta[property="og:image"]').attr("content");
        break;
    }

    return info;
  } catch (error) {
    return {
      name: null,
      description: null,
      followers: null,
      verified: false,
      profileImage: null,
      error: error.message,
    };
  }
}

/**
 * Validate a single social profile
 * @param {string} url - Profile URL
 * @param {string} platform - Platform name
 * @returns {Promise<Object>} Complete validation result
 */
export async function validateProfile(url, platform) {
  // Validate URL format
  const urlValidation = validateURL(url, platform);
  if (!urlValidation.isValid) {
    return {
      platform,
      url,
      status: "invalid",
      isValid: false,
      exists: false,
      error: urlValidation.error,
      username: null,
      info: null,
    };
  }

  // Check if profile exists
  const existsCheck = await checkProfileExists(url);
  if (!existsCheck.exists) {
    return {
      platform,
      url,
      status: "not_found",
      isValid: true,
      exists: false,
      statusCode: existsCheck.statusCode,
      error: "Profile not found or not accessible",
      username: urlValidation.username,
      info: null,
    };
  }

  // Extract profile information
  const profileInfo = await extractProfileInfo(url, platform);

  return {
    platform,
    url,
    status: "active",
    isValid: true,
    exists: true,
    statusCode: 200,
    error: null,
    username: urlValidation.username,
    info: profileInfo,
  };
}

/**
 * Calculate presence score based on completeness
 * @param {Array} profiles - Array of profile validation results
 * @returns {number} Score from 0-100
 */
export function calculatePresenceScore(profiles) {
  const totalPlatforms = Object.keys(PLATFORM_PATTERNS).length;
  const providedProfiles = profiles.length;
  const activeProfiles = profiles.filter((p) => p.status === "active").length;

  // Score breakdown:
  // - 60% for active profiles vs total platforms
  // - 40% for valid profiles vs provided profiles

  const platformCoverage = (activeProfiles / totalPlatforms) * 60;
  const validityScore =
    providedProfiles > 0 ? (activeProfiles / providedProfiles) * 40 : 0;

  return Math.round(platformCoverage + validityScore);
}

/**
 * Generate complete audit report
 * @param {Object} profileUrls - Object with platform keys and URL values
 * @returns {Promise<Object>} Complete audit report
 */
export async function generateAuditReport(profileUrls) {
  const results = [];
  const allPlatforms = Object.keys(PLATFORM_PATTERNS);

  // Validate provided profiles
  for (const [platform, url] of Object.entries(profileUrls)) {
    if (url && url.trim()) {
      const result = await validateProfile(url, platform);
      results.push(result);
    }
  }

  // Identify missing platforms
  const providedPlatforms = results.map((r) => r.platform.toLowerCase());
  const missingPlatforms = allPlatforms.filter(
    (p) => !providedPlatforms.includes(p)
  );

  // Calculate statistics
  const activeProfiles = results.filter((r) => r.status === "active");
  const invalidProfiles = results.filter((r) => r.status === "invalid");
  const notFoundProfiles = results.filter((r) => r.status === "not_found");

  const presenceScore = calculatePresenceScore(results);

  // Generate recommendations
  const recommendations = [];
  if (missingPlatforms.length > 0) {
    recommendations.push(
      `Add profiles for ${
        missingPlatforms.length
      } missing platform(s): ${missingPlatforms.join(", ")}`
    );
  }
  if (invalidProfiles.length > 0) {
    recommendations.push(
      `Fix ${invalidProfiles.length} invalid URL(s) with correct format`
    );
  }
  if (notFoundProfiles.length > 0) {
    recommendations.push(
      `Verify ${notFoundProfiles.length} profile(s) that could not be accessed`
    );
  }
  if (presenceScore === 100) {
    recommendations.push(
      "Excellent! All major platforms are covered with active profiles"
    );
  }

  return {
    success: true,
    score: presenceScore,
    summary: {
      totalPlatforms: allPlatforms.length,
      providedProfiles: results.length,
      activeProfiles: activeProfiles.length,
      invalidProfiles: invalidProfiles.length,
      notFoundProfiles: notFoundProfiles.length,
      missingPlatforms: missingPlatforms.length,
    },
    profiles: results,
    missingPlatforms: missingPlatforms.map((p) => ({
      platform: p,
      name: PLATFORM_PATTERNS[p].name,
      color: PLATFORM_PATTERNS[p].color,
    })),
    recommendations,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get platform configuration
 * @returns {Object} Platform patterns and info
 */
export function getPlatformInfo() {
  return PLATFORM_PATTERNS;
}
