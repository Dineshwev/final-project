import axios from "axios";
import * as cheerio from "cheerio";
import sizeOf from "image-size";

/**
 * Fetch HTML content from a URL
 * @param {string} url - The URL to fetch
 * @returns {Promise<string>} HTML content
 */
async function fetchHTML(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 10000,
      maxRedirects: 5,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch URL: ${error.message}`);
  }
}

/**
 * Parse Open Graph meta tags from HTML
 * @param {string} html - HTML content
 * @returns {Object} Object containing all og:* tags
 */
function parseOGTags(html) {
  const $ = cheerio.load(html);
  const ogTags = {};

  // Find all meta tags with property starting with "og:"
  $('meta[property^="og:"]').each((_, element) => {
    const property = $(element).attr("property");
    const content = $(element).attr("content");

    if (property && content) {
      // Remove "og:" prefix for cleaner object keys
      const key = property.replace("og:", "");
      ogTags[key] = content.trim();
    }
  });

  return ogTags;
}

/**
 * Validate image dimensions by fetching the image
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<Object>} Object with dimensions and validation status
 */
async function validateImageDimensions(imageUrl) {
  try {
    // Fetch image as buffer
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const buffer = Buffer.from(response.data);
    const dimensions = sizeOf(buffer);

    const isRecommendedSize =
      dimensions.width === 1200 && dimensions.height === 630;
    const aspectRatio = (dimensions.width / dimensions.height).toFixed(2);
    const recommendedAspectRatio = (1200 / 630).toFixed(2);

    return {
      valid: true,
      width: dimensions.width,
      height: dimensions.height,
      aspectRatio: parseFloat(aspectRatio),
      isRecommendedSize,
      isRecommendedAspectRatio: aspectRatio === recommendedAspectRatio,
      message: isRecommendedSize
        ? "Image has recommended dimensions (1200x630px)"
        : `Image is ${dimensions.width}x${dimensions.height}px. Recommended: 1200x630px`,
    };
  } catch (error) {
    return {
      valid: false,
      error: `Failed to validate image: ${error.message}`,
      message: "Could not fetch or analyze image dimensions",
    };
  }
}

/**
 * Generate a comprehensive validation report
 * @param {Object} tags - Parsed OG tags
 * @param {string} url - Original URL being validated
 * @returns {Promise<Object>} Validation report
 */
async function generateValidationReport(tags, url) {
  const errors = [];
  const warnings = [];
  const recommendations = [];
  let isValid = true;

  // Required tags validation
  const requiredTags = ["title", "description", "image", "url"];

  requiredTags.forEach((tag) => {
    if (!tags[tag] || tags[tag].trim() === "") {
      errors.push(`Missing required tag: og:${tag}`);
      isValid = false;
    }
  });

  // Validate og:title
  if (tags.title) {
    const titleLength = tags.title.length;
    if (titleLength < 60) {
      warnings.push(
        `og:title is short (${titleLength} chars). Optimal: 60-90 characters`
      );
    } else if (titleLength > 90) {
      warnings.push(
        `og:title is long (${titleLength} chars). Optimal: 60-90 characters. May be truncated.`
      );
    } else {
      recommendations.push(`og:title length is optimal (${titleLength} chars)`);
    }
  }

  // Validate og:description
  if (tags.description) {
    const descLength = tags.description.length;
    if (descLength < 150) {
      warnings.push(
        `og:description is short (${descLength} chars). Optimal: 150-300 characters`
      );
    } else if (descLength > 300) {
      warnings.push(
        `og:description is long (${descLength} chars). Optimal: 150-300 characters. May be truncated.`
      );
    } else {
      recommendations.push(
        `og:description length is optimal (${descLength} chars)`
      );
    }
  }

  // Validate og:image
  let imageValidation = null;
  if (tags.image) {
    imageValidation = await validateImageDimensions(tags.image);

    if (!imageValidation.valid) {
      errors.push(imageValidation.error);
      isValid = false;
    } else if (!imageValidation.isRecommendedSize) {
      warnings.push(imageValidation.message);
      if (!imageValidation.isRecommendedAspectRatio) {
        warnings.push(
          `Image aspect ratio is ${imageValidation.aspectRatio}:1. Recommended: 1.91:1 (1200x630)`
        );
      }
    } else {
      recommendations.push(imageValidation.message);
    }
  }

  // Validate og:url
  if (tags.url) {
    try {
      const ogUrl = new URL(tags.url);
      const inputUrl = new URL(url);

      if (ogUrl.hostname !== inputUrl.hostname) {
        warnings.push(
          `og:url domain (${ogUrl.hostname}) differs from input URL domain (${inputUrl.hostname})`
        );
      }
    } catch (error) {
      errors.push(`og:url is not a valid URL: ${tags.url}`);
      isValid = false;
    }
  }

  // Check optional but recommended tags
  if (!tags.type) {
    warnings.push('og:type is missing. Default "website" will be assumed');
  }

  if (!tags.site_name) {
    recommendations.push(
      "Consider adding og:site_name for better brand recognition"
    );
  }

  // Check for other useful OG tags
  const optionalTags = ["locale", "video", "audio", "determiner"];
  const presentOptionalTags = optionalTags.filter((tag) => tags[tag]);

  if (presentOptionalTags.length > 0) {
    recommendations.push(
      `Additional OG tags found: ${presentOptionalTags
        .map((t) => `og:${t}`)
        .join(", ")}`
    );
  }

  // Generate Facebook Sharing Debugger URL
  const facebookDebuggerUrl = `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(
    url
  )}`;
  const linkedinInspectorUrl = `https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(
    url
  )}`;
  const twitterValidatorUrl = `https://cards-dev.twitter.com/validator`;

  return {
    isValid,
    url,
    errors,
    warnings,
    recommendations,
    tags,
    imageValidation: imageValidation || null,
    debugTools: {
      facebook: facebookDebuggerUrl,
      linkedin: linkedinInspectorUrl,
      twitter: twitterValidatorUrl,
    },
    summary: {
      totalTags: Object.keys(tags).length,
      requiredTagsPresent: requiredTags.filter((tag) => tags[tag]).length,
      requiredTagsTotal: requiredTags.length,
      errorsCount: errors.length,
      warningsCount: warnings.length,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Main validation function
 * @param {string} url - URL to validate
 * @returns {Promise<Object>} Complete validation report
 */
async function validateOpenGraphTags(url) {
  try {
    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return {
        isValid: false,
        url,
        errors: ["Invalid URL format"],
        warnings: [],
        recommendations: [],
        tags: {},
        imageValidation: null,
        debugTools: {},
        summary: {
          totalTags: 0,
          requiredTagsPresent: 0,
          requiredTagsTotal: 4,
          errorsCount: 1,
          warningsCount: 0,
        },
        timestamp: new Date().toISOString(),
      };
    }

    // Fetch HTML
    const html = await fetchHTML(url);

    // Parse OG tags
    const tags = parseOGTags(html);

    // Generate validation report
    const report = await generateValidationReport(tags, url);

    return report;
  } catch (error) {
    return {
      isValid: false,
      url,
      errors: [error.message],
      warnings: [],
      recommendations: [],
      tags: {},
      imageValidation: null,
      debugTools: {},
      summary: {
        totalTags: 0,
        requiredTagsPresent: 0,
        requiredTagsTotal: 4,
        errorsCount: 1,
        warningsCount: 0,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

export {
  fetchHTML,
  parseOGTags,
  validateImageDimensions,
  generateValidationReport,
  validateOpenGraphTags,
};
