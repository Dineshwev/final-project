import axios from "axios";
import NodeCache from "node-cache";

// Cache for 24 hours (86400 seconds)
const shareCache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

const SHAREDCOUNT_API = "https://api.sharedcount.com/v1.1";
const SHAREDCOUNT_API_KEY = "f0617fde143c51bbe65d227899446d21bdbe2cdc";
const CACHE_PREFIX = "share_count_";
const TREND_PREFIX = "share_trend_";

/**
 * Get share counts for a URL from SharedCount API
 * @param {string} url - The URL to check
 * @returns {Promise<Object>} Share counts data
 */
export async function getShareCounts(url) {
  try {
    // Check cache first
    const cached = getCachedCounts(url);
    if (cached) {
      console.log(`📦 Using cached share counts for: ${url}`);
      return cached;
    }

    // Fetch from SharedCount API
    console.log(`🔍 Fetching share counts from API for: ${url}`);
    const response = await axios.get(SHAREDCOUNT_API, {
      params: {
        apikey: SHAREDCOUNT_API_KEY,
        url,
      },
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SEO-Health-Checker/1.0)",
      },
    });

    const data = response.data;
    const counts = parseResponse(data);

    // Cache the results
    cacheResults(url, counts);

    return counts;
  } catch (error) {
    if (error.response) {
      // API error responses
      if (error.response.status === 429) {
        throw new Error(
          "Rate limit exceeded. Please try again later (SharedCount API limit: 500 requests/day)"
        );
      } else if (error.response.status === 400) {
        throw new Error("Invalid URL provided");
      }
    }
    throw new Error(`Failed to fetch share counts: ${error.message}`);
  }
}

/**
 * Get share counts with retry logic and exponential backoff
 * @param {string} url - The URL to check
 * @param {number} maxRetries - Maximum number of retries
 * @returns {Promise<Object>} Share counts data
 */
export async function getShareCountsWithRetry(url, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await getShareCounts(url);
    } catch (error) {
      lastError = error;

      // Don't retry on rate limit or invalid URL
      if (
        error.message.includes("Rate limit") ||
        error.message.includes("Invalid URL")
      ) {
        throw error;
      }

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(
          `⏳ Retry attempt ${attempt}/${maxRetries} after ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Parse SharedCount API response and extract relevant counts
 * @param {Object} data - Raw API response
 * @returns {Object} Parsed share counts
 */
export function parseResponse(data) {
  const counts = {
    facebook: 0,
    pinterest: 0,
    linkedin: 0,
    totalShares: 0,
    lastUpdated: new Date().toISOString(),
    url: data.url || "",
  };

  try {
    // Facebook total engagement (likes, shares, comments)
    if (data.Facebook) {
      counts.facebook =
        (data.Facebook.share_count || 0) +
        (data.Facebook.reaction_count || 0) +
        (data.Facebook.comment_count || 0);
    }

    // Pinterest pins
    if (data.Pinterest) {
      counts.pinterest = data.Pinterest || 0;
    }

    // LinkedIn shares
    if (data.LinkedIn) {
      counts.linkedin = data.LinkedIn || 0;
    }

    // Calculate total
    counts.totalShares = counts.facebook + counts.pinterest + counts.linkedin;

    return counts;
  } catch (error) {
    console.error("Error parsing SharedCount response:", error);
    return counts;
  }
}

/**
 * Cache share count results
 * @param {string} url - The URL
 * @param {Object} counts - Share counts data
 */
export function cacheResults(url, counts) {
  const cacheKey = CACHE_PREFIX + url;
  shareCache.set(cacheKey, counts);
  console.log(`💾 Cached share counts for: ${url} (TTL: 24 hours)`);
}

/**
 * Get cached share counts
 * @param {string} url - The URL
 * @returns {Object|null} Cached counts or null
 */
export function getCachedCounts(url) {
  const cacheKey = CACHE_PREFIX + url;
  return shareCache.get(cacheKey) || null;
}

/**
 * Format numbers with K/M suffixes
 * @param {number} num - Number to format
 * @returns {string} Formatted string
 */
export function displayCounts(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

/**
 * Track trends by comparing current and previous counts
 * @param {Object} currentCounts - Current share counts
 * @param {Object} previousCounts - Previous share counts
 * @returns {Object} Trend analysis
 */
export function trackTrends(currentCounts, previousCounts) {
  if (!previousCounts) {
    return {
      facebook: { change: 0, percentage: 0, direction: "neutral" },
      pinterest: { change: 0, percentage: 0, direction: "neutral" },
      linkedin: { change: 0, percentage: 0, direction: "neutral" },
      totalShares: { change: 0, percentage: 0, direction: "neutral" },
    };
  }

  const calculateTrend = (current, previous) => {
    const change = current - previous;
    const percentage =
      previous > 0 ? ((change / previous) * 100).toFixed(1) : 0;
    const direction = change > 0 ? "up" : change < 0 ? "down" : "neutral";

    return { change, percentage, direction };
  };

  return {
    facebook: calculateTrend(currentCounts.facebook, previousCounts.facebook),
    pinterest: calculateTrend(
      currentCounts.pinterest,
      previousCounts.pinterest
    ),
    linkedin: calculateTrend(currentCounts.linkedin, previousCounts.linkedin),
    totalShares: calculateTrend(
      currentCounts.totalShares,
      previousCounts.totalShares
    ),
  };
}

/**
 * Save previous counts for trend tracking
 * @param {string} url - The URL
 * @param {Object} counts - Share counts data
 */
export function savePreviousCounts(url, counts) {
  const trendKey = TREND_PREFIX + url;
  shareCache.set(trendKey, counts, 86400 * 7); // Keep for 7 days
}

/**
 * Get previous counts for trend comparison
 * @param {string} url - The URL
 * @returns {Object|null} Previous counts or null
 */
export function getPreviousCounts(url) {
  const trendKey = TREND_PREFIX + url;
  return shareCache.get(trendKey) || null;
}

/**
 * Get complete share count report with trends
 * @param {string} url - The URL to analyze
 * @returns {Promise<Object>} Complete report
 */
export async function getShareCountReport(url) {
  try {
    // Validate URL
    try {
      new URL(url);
    } catch (error) {
      throw new Error("Invalid URL format");
    }

    // Get current counts
    const currentCounts = await getShareCountsWithRetry(url);

    // Get previous counts for trend analysis
    const previousCounts = getPreviousCounts(url);

    // Calculate trends
    const trends = trackTrends(currentCounts, previousCounts);

    // Save current as previous for next comparison
    savePreviousCounts(url, currentCounts);

    // Format display values
    const displayValues = {
      facebook: displayCounts(currentCounts.facebook),
      pinterest: displayCounts(currentCounts.pinterest),
      linkedin: displayCounts(currentCounts.linkedin),
      totalShares: displayCounts(currentCounts.totalShares),
    };

    return {
      success: true,
      url: currentCounts.url,
      counts: currentCounts,
      trends,
      displayValues,
      lastUpdated: currentCounts.lastUpdated,
      cached: getCachedCounts(url) !== null,
    };
  } catch (error) {
    throw new Error(`Share count report failed: ${error.message}`);
  }
}

/**
 * Get cache statistics
 * @returns {Object} Cache stats
 */
export function getCacheStats() {
  return {
    keys: shareCache.keys().length,
    hits: shareCache.getStats().hits,
    misses: shareCache.getStats().misses,
    ksize: shareCache.getStats().ksize,
  };
}

/**
 * Clear cache for a specific URL
 * @param {string} url - The URL to clear
 */
export function clearCache(url) {
  const cacheKey = CACHE_PREFIX + url;
  const trendKey = TREND_PREFIX + url;
  shareCache.del([cacheKey, trendKey]);
}

/**
 * Clear all cache
 */
export function clearAllCache() {
  shareCache.flushAll();
}
