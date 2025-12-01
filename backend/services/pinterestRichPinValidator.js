import axios from "axios";
import * as cheerio from "cheerio";

// Pinterest Rich Pin type definitions
const RICH_PIN_TYPES = {
  article: {
    name: "Article Rich Pin",
    description: "For blog posts, news articles, and editorial content",
    requiredTags: ["og:title", "og:description", "og:image", "article:author"],
    recommendedTags: ["article:published_time", "og:site_name", "og:url"],
    schemaType: "Article",
  },
  product: {
    name: "Product Rich Pin",
    description: "For e-commerce products with pricing and availability",
    requiredTags: [
      "og:title",
      "og:description",
      "og:image",
      "product:price:amount",
      "product:price:currency",
    ],
    recommendedTags: ["product:availability", "og:url", "product:brand"],
    schemaType: "Product",
  },
  recipe: {
    name: "Recipe Rich Pin",
    description: "For cooking recipes with ingredients and instructions",
    requiredTags: ["og:title", "og:image"],
    recommendedTags: [
      "og:description",
      "recipe:author",
      "og:url",
      "og:site_name",
    ],
    schemaType: "Recipe",
    allowSchemaOnly: true, // Recipe can use only schema.org data
  },
  app: {
    name: "App Rich Pin",
    description: "For mobile applications",
    requiredTags: ["og:title", "og:description", "og:image"],
    recommendedTags: [
      "al:ios:app_name",
      "al:ios:app_store_id",
      "al:android:app_name",
      "al:android:package",
    ],
    schemaType: "SoftwareApplication",
  },
};

// Pinterest Rich Pins Validator URL
export const PINTEREST_VALIDATOR_URL =
  "https://developers.pinterest.com/tools/url-debugger/";

/**
 * Fetch HTML content from a URL
 * @param {string} url - The URL to fetch
 * @returns {Promise<string>} HTML content
 */
export async function fetchHTML(url) {
  if (!url || !url.trim()) {
    throw new Error("URL is required");
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (error) {
    throw new Error("Invalid URL format");
  }

  try {
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      maxRedirects: 5,
      validateStatus: (status) => status < 500, // Accept 4xx errors to handle them gracefully
    });

    // Handle non-200 responses
    if (response.status === 404) {
      throw new Error(
        "Page not found (404). Please verify the URL is correct and accessible."
      );
    } else if (response.status === 403) {
      throw new Error(
        "Access forbidden (403). The website may be blocking automated requests. Try testing with a publicly accessible URL."
      );
    } else if (response.status >= 400) {
      throw new Error(
        `HTTP ${response.status}: Unable to access the page. The website may be blocking requests or the page may not exist.`
      );
    }

    return response.data;
  } catch (error) {
    // Re-throw our custom errors
    if (
      error.message.includes("HTTP") ||
      error.message.includes("Page not found") ||
      error.message.includes("Access forbidden")
    ) {
      throw error;
    }

    if (error.code === "ECONNABORTED") {
      throw new Error(
        "Request timeout - page took too long to respond (30 seconds)"
      );
    } else if (error.code === "ENOTFOUND") {
      throw new Error(
        "Domain not found. Please check the URL and ensure it's a valid website."
      );
    } else if (error.code === "ECONNREFUSED") {
      throw new Error(
        "Connection refused. The server is not accepting connections."
      );
    } else {
      throw new Error(`Failed to fetch URL: ${error.message}`);
    }
  }
}

/**
 * Parse meta tags from HTML
 * @param {string} html - HTML content
 * @returns {Object} Extracted meta tags
 */
export function parseMetaTags(html) {
  const $ = cheerio.load(html);
  const tags = {};

  // Extract Open Graph tags
  $(
    'meta[property^="og:"], meta[property^="article:"], meta[property^="product:"], meta[property^="recipe:"], meta[property^="al:"]'
  ).each((i, elem) => {
    const property = $(elem).attr("property");
    const content = $(elem).attr("content");
    if (property && content) {
      tags[property] = content;
    }
  });

  // Extract standard meta tags as fallback
  $('meta[name="description"], meta[name="author"]').each((i, elem) => {
    const name = $(elem).attr("name");
    const content = $(elem).attr("content");
    if (name && content) {
      tags[`meta:${name}`] = content;
    }
  });

  // Extract title
  const title = $("title").first().text().trim();
  if (title && !tags["og:title"]) {
    tags["meta:title"] = title;
  }

  return tags;
}

/**
 * Parse schema.org structured data from HTML
 * @param {string} html - HTML content
 * @returns {Array} Array of schema.org objects
 */
export function parseSchemaOrg(html) {
  const $ = cheerio.load(html);
  const schemas = [];

  // Extract JSON-LD scripts
  $('script[type="application/ld+json"]').each((i, elem) => {
    try {
      const content = $(elem).html();
      const data = JSON.parse(content);

      // Handle both single objects and arrays
      if (Array.isArray(data)) {
        schemas.push(...data);
      } else {
        schemas.push(data);
      }
    } catch (error) {
      // Skip invalid JSON
      console.error("Invalid JSON-LD:", error.message);
    }
  });

  // Extract microdata (basic support)
  $("[itemscope][itemtype]").each((i, elem) => {
    const itemType = $(elem).attr("itemtype");
    const schemaType = itemType?.split("/").pop();

    if (schemaType) {
      const schemaData = {
        "@type": schemaType,
        "@context": "https://schema.org",
      };

      // Extract itemprop values
      $(elem)
        .find("[itemprop]")
        .each((j, prop) => {
          const propName = $(prop).attr("itemprop");
          const propValue = $(prop).attr("content") || $(prop).text().trim();
          if (propName && propValue) {
            schemaData[propName] = propValue;
          }
        });

      schemas.push(schemaData);
    }
  });

  return schemas;
}

/**
 * Detect Rich Pin type from tags and schema
 * @param {Object} tags - Extracted meta tags
 * @param {Array} schemas - Extracted schema.org data
 * @returns {string|null} Detected pin type
 */
export function detectRichPinType(tags, schemas) {
  const detectedTypes = [];

  // Check for Article
  if (tags["article:author"] || tags["article:published_time"]) {
    detectedTypes.push("article");
  }

  // Check for Product
  if (
    tags["product:price:amount"] ||
    tags["product:price:currency"] ||
    tags["product:availability"]
  ) {
    detectedTypes.push("product");
  }

  // Check for Recipe
  if (tags["recipe:author"] || tags["recipe:prep_time"]) {
    detectedTypes.push("recipe");
  }

  // Check for App
  if (tags["al:ios:app_name"] || tags["al:android:app_name"]) {
    detectedTypes.push("app");
  }

  // Check schema.org types
  schemas.forEach((schema) => {
    const schemaType = schema["@type"];
    if (
      schemaType === "Article" ||
      schemaType === "NewsArticle" ||
      schemaType === "BlogPosting"
    ) {
      if (!detectedTypes.includes("article")) detectedTypes.push("article");
    } else if (schemaType === "Product") {
      if (!detectedTypes.includes("product")) detectedTypes.push("product");
    } else if (schemaType === "Recipe") {
      if (!detectedTypes.includes("recipe")) detectedTypes.push("recipe");
    } else if (
      schemaType === "SoftwareApplication" ||
      schemaType === "MobileApplication"
    ) {
      if (!detectedTypes.includes("app")) detectedTypes.push("app");
    }
  });

  // Return the first detected type, or null if none found
  return detectedTypes.length > 0 ? detectedTypes[0] : null;
}

/**
 * Validate Rich Pin requirements
 * @param {string} type - Rich Pin type (article, product, recipe, app)
 * @param {Object} tags - Extracted meta tags
 * @param {Array} schemas - Extracted schema.org data
 * @returns {Object} Validation result
 */
export function validateRichPin(type, tags, schemas = []) {
  if (!RICH_PIN_TYPES[type]) {
    throw new Error(
      `Invalid Rich Pin type. Supported types: ${Object.keys(
        RICH_PIN_TYPES
      ).join(", ")}`
    );
  }

  const pinType = RICH_PIN_TYPES[type];
  const errors = [];
  const warnings = [];
  const foundTags = [];
  const missingTags = [];

  // Find relevant schema
  const relevantSchema = schemas.find(
    (schema) => schema["@type"] === pinType.schemaType
  );

  // Check required tags
  pinType.requiredTags.forEach((requiredTag) => {
    const tagValue = tags[requiredTag];

    if (tagValue) {
      foundTags.push({
        tag: requiredTag,
        value: tagValue,
        type: "required",
      });
    } else {
      // Check if schema.org can satisfy the requirement for Recipe
      if (type === "recipe" && relevantSchema) {
        const schemaField = requiredTag
          .replace("og:", "")
          .replace("recipe:", "");
        if (relevantSchema[schemaField]) {
          foundTags.push({
            tag: requiredTag,
            value: relevantSchema[schemaField],
            type: "required",
            source: "schema.org",
          });
          return;
        }
      }

      missingTags.push(requiredTag);
      errors.push(`Missing required tag: ${requiredTag}`);
    }
  });

  // Check recommended tags
  pinType.recommendedTags.forEach((recommendedTag) => {
    const tagValue = tags[recommendedTag];

    if (tagValue) {
      foundTags.push({
        tag: recommendedTag,
        value: tagValue,
        type: "recommended",
      });
    } else {
      warnings.push(`Missing recommended tag: ${recommendedTag}`);
    }
  });

  // Validate image dimensions (og:image should be at least 600x600px for Pinterest)
  if (tags["og:image"]) {
    const imageWidth = tags["og:image:width"];
    const imageHeight = tags["og:image:height"];

    if (imageWidth && imageHeight) {
      if (parseInt(imageWidth) < 600 || parseInt(imageHeight) < 600) {
        warnings.push(
          `Image dimensions (${imageWidth}x${imageHeight}) below Pinterest recommended 600x600px`
        );
      }
    } else {
      warnings.push(
        "Image dimensions not specified - Pinterest recommends at least 600x600px"
      );
    }
  }

  // Type-specific validations
  if (type === "product") {
    // Validate price format
    const priceAmount = tags["product:price:amount"];
    if (priceAmount && isNaN(parseFloat(priceAmount))) {
      errors.push(`Invalid price format: ${priceAmount}`);
    }

    // Validate currency code
    const currency = tags["product:price:currency"];
    if (currency && currency.length !== 3) {
      warnings.push(
        `Currency code should be ISO 4217 format (3 letters): ${currency}`
      );
    }

    // Validate availability
    const availability = tags["product:availability"];
    const validAvailability = [
      "in stock",
      "out of stock",
      "preorder",
      "available for order",
      "discontinued",
    ];
    if (
      availability &&
      !validAvailability.includes(availability.toLowerCase())
    ) {
      warnings.push(
        `Non-standard availability value: ${availability}. Recommended: ${validAvailability.join(
          ", "
        )}`
      );
    }
  }

  // Check for schema.org data
  const schemaInfo = {
    hasSchema: relevantSchema !== undefined,
    schemaType: relevantSchema?.["@type"] || null,
  };

  if (relevantSchema) {
    foundTags.push({
      tag: "schema.org",
      value: pinType.schemaType,
      type: "structured-data",
    });
  } else {
    warnings.push(
      `No schema.org ${pinType.schemaType} structured data found - recommended for better Pinterest integration`
    );
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    pinType: pinType.name,
    pinTypeKey: type,
    description: pinType.description,
    errors,
    warnings,
    foundTags,
    missingTags,
    schemaInfo,
    summary: {
      requiredTagsFound: pinType.requiredTags.length - missingTags.length,
      requiredTagsTotal: pinType.requiredTags.length,
      recommendedTagsFound: foundTags.filter((t) => t.type === "recommended")
        .length,
      recommendedTagsTotal: pinType.recommendedTags.length,
    },
  };
}

/**
 * Generate complete Pinterest Rich Pin validation report
 * @param {string} url - URL to validate
 * @param {string} pinType - Optional: Specify pin type, or auto-detect
 * @returns {Promise<Object>} Complete validation report
 */
export async function generateRichPinReport(url, pinType = null) {
  try {
    // Fetch HTML
    const html = await fetchHTML(url);

    // Parse meta tags and schema
    const tags = parseMetaTags(html);
    const schemas = parseSchemaOrg(html);

    // Auto-detect pin type if not specified
    let detectedType = pinType;
    if (!detectedType) {
      detectedType = detectRichPinType(tags, schemas);
    }

    // If still no type detected, check if at least basic OG tags exist
    if (!detectedType) {
      if (tags["og:title"] && tags["og:image"]) {
        // Default to article if basic OG tags present
        detectedType = "article";
      } else {
        return {
          success: false,
          url,
          error: "Could not detect Rich Pin type and no type specified",
          suggestion:
            "Ensure your page has Open Graph tags or specify a Rich Pin type manually",
          availableTypes: Object.keys(RICH_PIN_TYPES).map((key) => ({
            type: key,
            name: RICH_PIN_TYPES[key].name,
            description: RICH_PIN_TYPES[key].description,
          })),
          validationURL: PINTEREST_VALIDATOR_URL,
        };
      }
    }

    // Validate
    const validation = validateRichPin(detectedType, tags, schemas);

    return {
      success: true,
      url,
      ...validation,
      validationURL: PINTEREST_VALIDATOR_URL,
      allTags: tags,
      schemas: schemas.map((s) => ({
        type: s["@type"],
        context: s["@context"],
      })),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      url,
      error: error.message,
      validationURL: PINTEREST_VALIDATOR_URL,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get available Rich Pin types and their requirements
 * @returns {Object} Rich Pin types information
 */
export function getRichPinTypes() {
  return Object.keys(RICH_PIN_TYPES).map((key) => ({
    type: key,
    name: RICH_PIN_TYPES[key].name,
    description: RICH_PIN_TYPES[key].description,
    requiredTags: RICH_PIN_TYPES[key].requiredTags,
    recommendedTags: RICH_PIN_TYPES[key].recommendedTags,
    schemaType: RICH_PIN_TYPES[key].schemaType,
  }));
}

export default {
  fetchHTML,
  parseMetaTags,
  parseSchemaOrg,
  detectRichPinType,
  validateRichPin,
  generateRichPinReport,
  getRichPinTypes,
  RICH_PIN_TYPES,
  PINTEREST_VALIDATOR_URL,
};
