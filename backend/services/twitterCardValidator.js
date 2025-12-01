import axios from "axios";
import * as cheerio from "cheerio";
import sizeOf from "image-size";

/**
 * Fetch HTML content from a URL
 * @param {string} url - The URL to fetch
 * @returns {Promise<string>} HTML content
 */
export async function fetchHTML(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 30000,
      maxRedirects: 5,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch URL: ${error.message}`);
  }
}

/**
 * Parse Twitter Card and Open Graph meta tags from HTML
 * @param {string} html - HTML content
 * @returns {Object} Object with twitter and og tags
 */
export function parseTwitterTags(html) {
  const $ = cheerio.load(html);
  const twitterTags = {};
  const ogTags = {};

  // Parse Twitter Card tags
  $('meta[name^="twitter:"]').each((_, element) => {
    const name = $(element).attr("name");
    const content = $(element).attr("content");
    if (name && content) {
      const key = name.replace("twitter:", "");
      twitterTags[key] = content.trim();
    }
  });

  // Parse Open Graph tags (for fallback)
  $('meta[property^="og:"]').each((_, element) => {
    const property = $(element).attr("property");
    const content = $(element).attr("content");
    if (property && content) {
      const key = property.replace("og:", "");
      ogTags[key] = content.trim();
    }
  });

  return { twitterTags, ogTags };
}

/**
 * Get card type requirements
 * @param {string} cardType - Twitter card type
 * @returns {Object} Required and optional tags
 */
function getCardTypeRequirements(cardType) {
  const requirements = {
    summary: {
      required: ["card", "title", "description"],
      optional: ["image", "site", "creator"],
      imageRequired: false,
    },
    summary_large_image: {
      required: ["card", "title", "description", "image"],
      optional: ["site", "creator", "image:alt"],
      imageRequired: true,
    },
    app: {
      required: [
        "card",
        "title",
        "description",
        "app:id:iphone",
        "app:id:ipad",
        "app:id:googleplay",
      ],
      optional: [
        "site",
        "app:name:iphone",
        "app:name:ipad",
        "app:name:googleplay",
        "app:url:iphone",
        "app:url:ipad",
        "app:url:googleplay",
      ],
      imageRequired: false,
    },
    player: {
      required: [
        "card",
        "title",
        "description",
        "player",
        "player:width",
        "player:height",
      ],
      optional: ["site", "image", "player:stream"],
      imageRequired: false,
    },
  };

  return requirements[cardType] || requirements.summary;
}

/**
 * Validate Twitter Card type and required tags
 * @param {Object} twitterTags - Twitter meta tags
 * @param {Object} ogTags - Open Graph tags (for fallback)
 * @returns {Object} Validation result
 */
export function validateCardType(twitterTags, ogTags) {
  const errors = [];
  const warnings = [];
  const recommendations = [];
  const fallbacks = {};

  // Check if card type exists
  const cardType = twitterTags.card;
  if (!cardType) {
    errors.push("twitter:card meta tag is missing (required)");
    return {
      isValid: false,
      cardType: "unknown",
      errors,
      warnings,
      recommendations,
      fallbacks,
    };
  }

  // Validate card type
  const validCardTypes = ["summary", "summary_large_image", "app", "player"];
  if (!validCardTypes.includes(cardType)) {
    errors.push(
      `Invalid card type: "${cardType}". Valid types: ${validCardTypes.join(
        ", "
      )}`
    );
    return {
      isValid: false,
      cardType,
      errors,
      warnings,
      recommendations,
      fallbacks,
    };
  }

  const requirements = getCardTypeRequirements(cardType);

  // Check required tags with fallback support
  requirements.required.forEach((tag) => {
    const hasTwitterTag = twitterTags[tag] && twitterTags[tag].trim() !== "";

    // Check for fallback to OG tags (only for title, description, image)
    if (!hasTwitterTag && ["title", "description", "image"].includes(tag)) {
      const ogTag = ogTags[tag];
      if (ogTag && ogTag.trim() !== "") {
        fallbacks[tag] = ogTag;
        warnings.push(
          `twitter:${tag} is missing but falling back to og:${tag}`
        );
      } else {
        errors.push(
          `twitter:${tag} is required but missing (no fallback available)`
        );
      }
    } else if (!hasTwitterTag) {
      errors.push(`twitter:${tag} is required but missing`);
    }
  });

  // Validate content length for title and description
  const title = twitterTags.title || ogTags.title;
  const description = twitterTags.description || ogTags.description;

  if (title) {
    if (title.length > 70) {
      warnings.push(
        `Title is ${title.length} characters. Twitter recommends max 70 characters for better display`
      );
    }
    if (title.length < 10) {
      warnings.push("Title is too short. Consider making it more descriptive");
    }
  }

  if (description) {
    if (description.length > 200) {
      warnings.push(
        `Description is ${description.length} characters. Twitter recommends max 200 characters`
      );
    }
    if (description.length < 50) {
      warnings.push(
        "Description is short. Consider adding more details for better context"
      );
    }
  }

  // Check for @username format in creator and site
  if (twitterTags.site && !twitterTags.site.startsWith("@")) {
    warnings.push("twitter:site should start with @ (e.g., @username)");
  }
  if (twitterTags.creator && !twitterTags.creator.startsWith("@")) {
    warnings.push("twitter:creator should start with @ (e.g., @username)");
  }

  // Recommendations
  if (!twitterTags.site) {
    recommendations.push(
      "Add twitter:site tag to attribute content to a Twitter account"
    );
  }
  if (!twitterTags.creator) {
    recommendations.push(
      "Add twitter:creator tag to attribute content to the author"
    );
  }
  if (twitterTags.image && !twitterTags["image:alt"]) {
    recommendations.push(
      "Add twitter:image:alt tag for accessibility (alt text for images)"
    );
  }

  return {
    isValid: errors.length === 0,
    cardType,
    errors,
    warnings,
    recommendations,
    fallbacks,
  };
}

/**
 * Validate image specifications
 * @param {string} imageUrl - Image URL to validate
 * @param {string} cardType - Twitter card type
 * @returns {Promise<Object>} Image validation result
 */
export async function validateImageSpecs(imageUrl, cardType) {
  if (!imageUrl) {
    return {
      valid: false,
      message: "No image URL provided",
    };
  }

  try {
    // Fetch image
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 15000,
      maxRedirects: 5,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const imageBuffer = Buffer.from(response.data);
    const fileSize = imageBuffer.length;
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

    // Get image dimensions
    const dimensions = sizeOf(imageBuffer);
    const { width, height, type } = dimensions;

    const result = {
      valid: true,
      width,
      height,
      format: type,
      fileSize,
      fileSizeMB,
      errors: [],
      warnings: [],
    };

    // Validate file size (Twitter limit: 5MB for images)
    if (fileSize > 5 * 1024 * 1024) {
      result.valid = false;
      result.errors.push(
        `Image file size is ${fileSizeMB}MB. Twitter Card images must be under 5MB`
      );
    }

    // Validate dimensions based on card type
    if (cardType === "summary") {
      // Summary card: min 144x144, max 4096x4096, aspect ratio 1:1
      if (width < 144 || height < 144) {
        result.valid = false;
        result.errors.push(
          `Image dimensions ${width}x${height}px are too small. Minimum: 144x144px for summary card`
        );
      }
      if (width > 4096 || height > 4096) {
        result.warnings.push(
          `Image dimensions ${width}x${height}px exceed recommended maximum of 4096x4096px`
        );
      }
      const aspectRatio = width / height;
      if (Math.abs(aspectRatio - 1) > 0.1) {
        result.warnings.push(
          `Image aspect ratio is ${aspectRatio.toFixed(
            2
          )}:1. Summary cards work best with 1:1 (square) images`
        );
      }
    } else if (cardType === "summary_large_image") {
      // Large image card: min 300x157, max 4096x4096, aspect ratio 2:1
      if (width < 300 || height < 157) {
        result.valid = false;
        result.errors.push(
          `Image dimensions ${width}x${height}px are too small. Minimum: 300x157px for summary_large_image card`
        );
      }
      if (width > 4096 || height > 4096) {
        result.warnings.push(
          `Image dimensions ${width}x${height}px exceed recommended maximum of 4096x4096px`
        );
      }
      const aspectRatio = width / height;
      if (Math.abs(aspectRatio - 2) > 0.2) {
        result.warnings.push(
          `Image aspect ratio is ${aspectRatio.toFixed(
            2
          )}:1. Summary Large Image cards work best with 2:1 aspect ratio`
        );
      }
    }

    // Validate image format
    const validFormats = ["jpg", "jpeg", "png", "webp", "gif"];
    if (!validFormats.includes(type.toLowerCase())) {
      result.warnings.push(
        `Image format "${type}" may not be optimal. Recommended: JPG, PNG, WEBP`
      );
    }

    result.message = result.valid
      ? `Image validation passed: ${width}x${height}px, ${fileSizeMB}MB`
      : "Image validation failed";

    return result;
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      message: `Failed to validate image: ${error.message}`,
    };
  }
}

/**
 * Generate Twitter Card validation report
 * @param {string} url - URL to validate
 * @returns {Promise<Object>} Complete validation report
 */
export async function generateTwitterCardReport(url) {
  try {
    // Fetch and parse HTML
    const html = await fetchHTML(url);
    const { twitterTags, ogTags } = parseTwitterTags(html);

    // Validate card type and required tags
    const typeValidation = validateCardType(twitterTags, ogTags);

    // Validate image if present
    let imageValidation = null;
    const imageUrl = twitterTags.image || ogTags.image;
    if (imageUrl) {
      imageValidation = await validateImageSpecs(
        imageUrl,
        typeValidation.cardType
      );
    } else if (typeValidation.cardType === "summary_large_image") {
      typeValidation.errors.push(
        "Image is required for summary_large_image card type"
      );
    }

    // Combine all errors, warnings, and recommendations
    const allErrors = [
      ...typeValidation.errors,
      ...(imageValidation?.errors || []),
    ];
    const allWarnings = [
      ...typeValidation.warnings,
      ...(imageValidation?.warnings || []),
    ];
    const allRecommendations = [...typeValidation.recommendations];

    // Generate summary
    const summary = {
      totalTags: Object.keys(twitterTags).length,
      cardType: typeValidation.cardType,
      hasFallbacks: Object.keys(typeValidation.fallbacks).length > 0,
      errorsCount: allErrors.length,
      warningsCount: allWarnings.length,
    };

    // Twitter Card Validator preview URL
    const previewUrl = `https://cards-dev.twitter.com/validator?url=${encodeURIComponent(
      url
    )}`;

    return {
      isValid: allErrors.length === 0,
      url,
      cardType: typeValidation.cardType,
      errors: allErrors,
      warnings: allWarnings,
      recommendations: allRecommendations,
      twitterTags,
      ogTags,
      fallbacks: typeValidation.fallbacks,
      imageValidation,
      previewUrl,
      summary,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Twitter Card validation failed: ${error.message}`);
  }
}
