/**
 * Google My Business API Service
 * Provides integration with Google My Business API v4.9
 *
 * @requires googleapis
 * @requires dotenv
 */

import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

// Rate limiting configuration (1500 requests per day)
const RATE_LIMIT = {
  maxRequests: 1500,
  resetInterval: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  requests: [],
};

/**
 * Check if rate limit has been exceeded
 * @private
 * @returns {boolean} True if within rate limit, false otherwise
 */
function checkRateLimit() {
  const now = Date.now();

  // Remove requests older than 24 hours
  RATE_LIMIT.requests = RATE_LIMIT.requests.filter(
    (timestamp) => now - timestamp < RATE_LIMIT.resetInterval
  );

  // Check if we've exceeded the limit
  if (RATE_LIMIT.requests.length >= RATE_LIMIT.maxRequests) {
    return false;
  }

  // Add current request timestamp
  RATE_LIMIT.requests.push(now);
  return true;
}

/**
 * Create OAuth2 client for Google My Business API
 * @private
 * @returns {Object} OAuth2 client instance
 */
function createOAuth2Client() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || "http://localhost:3002/api/gmb/callback"
  );

  // Set credentials if refresh token is available
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
  }

  return oauth2Client;
}

/**
 * Authenticate with Google My Business API using OAuth2
 *
 * @async
 * @param {string} [code] - Authorization code from OAuth2 flow (optional for refresh token flow)
 * @returns {Promise<Object>} Authentication result with access token and auth URL
 * @throws {Error} If authentication fails
 *
 * @example
 * // Step 1: Get authorization URL
 * const { authUrl } = await authenticateGMB();
 * console.log('Visit this URL to authorize:', authUrl);
 *
 * // Step 2: After user authorizes, exchange code for tokens
 * const { tokens } = await authenticateGMB(authorizationCode);
 * console.log('Refresh Token:', tokens.refresh_token);
 */
export async function authenticateGMB(code = null) {
  try {
    const oauth2Client = createOAuth2Client();

    // If no code provided, return authorization URL
    if (!code) {
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
          "https://www.googleapis.com/auth/business.manage",
          "https://www.googleapis.com/auth/plus.business.manage",
        ],
        prompt: "consent", // Force consent screen to get refresh token
      });

      return {
        success: true,
        authUrl,
        message: "Visit the authUrl to authorize the application",
      };
    }

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    return {
      success: true,
      tokens,
      message:
        "Authentication successful. Save the refresh_token in your .env file",
    };
  } catch (error) {
    console.error("GMB Authentication Error:", error.message);
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

/**
 * Get business information from Google My Business
 *
 * @async
 * @param {string} accountId - GMB account ID
 * @param {string} locationId - GMB location ID
 * @returns {Promise<Object>} Business information including name, address, phone, categories, hours
 * @throws {Error} If API request fails or rate limit exceeded
 *
 * @example
 * const businessInfo = await getBusinessInfo('1234567890', '0987654321');
 * console.log(businessInfo);
 * // {
 * //   success: true,
 * //   data: {
 * //     name: "My Business Name",
 * //     address: { ... },
 * //     phoneNumber: "+1-234-567-8900",
 * //     categories: [...],
 * //     regularHours: { ... }
 * //   }
 * // }
 */
export async function getBusinessInfo(accountId, locationId) {
  try {
    // Check rate limit
    if (!checkRateLimit()) {
      throw new Error("Rate limit exceeded. Maximum 1500 requests per day.");
    }

    // Validate input
    if (!accountId || !locationId) {
      throw new Error("accountId and locationId are required");
    }

    const oauth2Client = createOAuth2Client();
    const mybusiness = google.mybusinessbusinessinformation("v1");

    const locationName = `accounts/${accountId}/locations/${locationId}`;

    const response = await mybusiness.accounts.locations.get({
      auth: oauth2Client,
      name: locationName,
      readMask:
        "name,title,phoneNumbers,storefrontAddress,websiteUri,regularHours,categories,profile,metadata",
    });

    const location = response.data;

    return {
      success: true,
      data: {
        name: location.title || location.name,
        locationName: location.name,
        storeCode: location.storeCode,
        address: {
          streetAddress: location.storefrontAddress?.addressLines?.join(", "),
          locality: location.storefrontAddress?.locality,
          region: location.storefrontAddress?.administrativeArea,
          postalCode: location.storefrontAddress?.postalCode,
          country: location.storefrontAddress?.regionCode,
        },
        phoneNumber: location.phoneNumbers?.primaryPhone,
        website: location.websiteUri,
        categories: {
          primary: location.categories?.primaryCategory?.displayName,
          additional:
            location.categories?.additionalCategories?.map(
              (cat) => cat.displayName
            ) || [],
        },
        regularHours: location.regularHours?.periods || [],
        profile: {
          description: location.profile?.description,
        },
        metadata: location.metadata,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Get Business Info Error:", error.message);
    return {
      success: false,
      error: error.message,
      details: error.response?.data || null,
    };
  }
}

/**
 * Get business reviews from Google My Business
 *
 * @async
 * @param {string} accountId - GMB account ID
 * @param {string} locationId - GMB location ID
 * @param {number} [pageSize=50] - Number of reviews to fetch (max 50)
 * @returns {Promise<Object>} Business reviews with ratings, comments, and reviewer info
 * @throws {Error} If API request fails or rate limit exceeded
 *
 * @example
 * const reviews = await getBusinessReviews('1234567890', '0987654321', 10);
 * console.log(reviews);
 * // {
 * //   success: true,
 * //   data: {
 * //     reviews: [...],
 * //     averageRating: 4.5,
 * //     totalReviews: 150
 * //   }
 * // }
 */
export async function getBusinessReviews(accountId, locationId, pageSize = 50) {
  try {
    // Check rate limit
    if (!checkRateLimit()) {
      throw new Error("Rate limit exceeded. Maximum 1500 requests per day.");
    }

    // Validate input
    if (!accountId || !locationId) {
      throw new Error("accountId and locationId are required");
    }

    if (pageSize > 50) {
      pageSize = 50; // API maximum
    }

    const oauth2Client = createOAuth2Client();
    const mybusiness = google.mybusinessaccountmanagement("v1");

    const parent = `accounts/${accountId}/locations/${locationId}`;

    // Note: Reviews API requires special permissions
    const response = await mybusiness.accounts.locations.reviews.list({
      auth: oauth2Client,
      parent: parent,
      pageSize: pageSize,
    });

    const reviews = response.data.reviews || [];

    // Calculate statistics
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + (review.starRating || 0), 0) /
          totalReviews
        : 0;

    return {
      success: true,
      data: {
        reviews: reviews.map((review) => ({
          reviewId: review.reviewId,
          reviewer: {
            displayName: review.reviewer?.displayName || "Anonymous",
            profilePhotoUrl: review.reviewer?.profilePhotoUrl,
            isAnonymous: review.reviewer?.isAnonymous || false,
          },
          starRating: review.starRating,
          comment: review.comment,
          createTime: review.createTime,
          updateTime: review.updateTime,
          reviewReply: review.reviewReply
            ? {
                comment: review.reviewReply.comment,
                updateTime: review.reviewReply.updateTime,
              }
            : null,
        })),
        averageRating: parseFloat(averageRating.toFixed(2)),
        totalReviews,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Get Business Reviews Error:", error.message);
    return {
      success: false,
      error: error.message,
      details: error.response?.data || null,
      note: "Reviews API requires special permissions. Ensure your account has access to the My Business Reviews API.",
    };
  }
}

/**
 * Get business insights and analytics from Google My Business
 *
 * @async
 * @param {string} accountId - GMB account ID
 * @param {string} locationId - GMB location ID
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise<Object>} Business insights including views, searches, and actions data
 * @throws {Error} If API request fails or rate limit exceeded
 *
 * @example
 * const insights = await getBusinessInsights(
 *   '1234567890',
 *   '0987654321',
 *   '2025-01-01',
 *   '2025-01-31'
 * );
 * console.log(insights);
 * // {
 * //   success: true,
 * //   data: {
 * //     searchViews: { total: 1500, ... },
 * //     mapViews: { total: 800, ... },
 * //     actions: { websiteClicks: 250, ... }
 * //   }
 * // }
 */
export async function getBusinessInsights(
  accountId,
  locationId,
  startDate,
  endDate
) {
  try {
    // Check rate limit
    if (!checkRateLimit()) {
      throw new Error("Rate limit exceeded. Maximum 1500 requests per day.");
    }

    // Validate input
    if (!accountId || !locationId || !startDate || !endDate) {
      throw new Error(
        "accountId, locationId, startDate, and endDate are required"
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      throw new Error("Dates must be in YYYY-MM-DD format");
    }

    const oauth2Client = createOAuth2Client();
    const mybusiness = google.mybusinessaccountmanagement("v1");

    const locationName = `accounts/${accountId}/locations/${locationId}`;

    // Request insights for different metrics
    const metricsToFetch = [
      "QUERIES_DIRECT",
      "QUERIES_INDIRECT",
      "VIEWS_MAPS",
      "VIEWS_SEARCH",
      "ACTIONS_WEBSITE",
      "ACTIONS_PHONE",
      "ACTIONS_DRIVING_DIRECTIONS",
    ];

    const insights = {
      locationName,
      dateRange: {
        startDate,
        endDate,
      },
      searchViews: {
        direct: 0,
        indirect: 0,
        total: 0,
      },
      mapViews: 0,
      searchImpressions: 0,
      actions: {
        websiteClicks: 0,
        phoneClicks: 0,
        directionsRequests: 0,
        total: 0,
      },
    };

    // Note: The Insights API has been deprecated and replaced with Business Profile Performance API
    // This is a simplified version. In production, you would need to use the new API endpoints

    try {
      const response = await mybusiness.accounts.locations.reportInsights({
        auth: oauth2Client,
        name: locationName,
        requestBody: {
          locationNames: [locationName],
          basicRequest: {
            metricRequests: metricsToFetch.map((metric) => ({ metric })),
            timeRange: {
              startTime: `${startDate}T00:00:00Z`,
              endTime: `${endDate}T23:59:59Z`,
            },
          },
        },
      });

      // Process insights data
      const locationMetrics =
        response.data.locationMetrics?.[0]?.metricValues || [];

      locationMetrics.forEach((metricValue) => {
        const metric = metricValue.metric;
        const value = parseInt(metricValue.totalValue?.value || 0);

        switch (metric) {
          case "QUERIES_DIRECT":
            insights.searchViews.direct = value;
            break;
          case "QUERIES_INDIRECT":
            insights.searchViews.indirect = value;
            break;
          case "VIEWS_MAPS":
            insights.mapViews = value;
            break;
          case "VIEWS_SEARCH":
            insights.searchImpressions = value;
            break;
          case "ACTIONS_WEBSITE":
            insights.actions.websiteClicks = value;
            break;
          case "ACTIONS_PHONE":
            insights.actions.phoneClicks = value;
            break;
          case "ACTIONS_DRIVING_DIRECTIONS":
            insights.actions.directionsRequests = value;
            break;
        }
      });

      insights.searchViews.total =
        insights.searchViews.direct + insights.searchViews.indirect;
      insights.actions.total =
        insights.actions.websiteClicks +
        insights.actions.phoneClicks +
        insights.actions.directionsRequests;
    } catch (apiError) {
      console.warn("Insights API call failed:", apiError.message);
      insights.note =
        "Insights API has been deprecated. Consider migrating to Business Profile Performance API.";
    }

    return {
      success: true,
      data: insights,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Get Business Insights Error:", error.message);
    return {
      success: false,
      error: error.message,
      details: error.response?.data || null,
      note: "The Insights API has been deprecated. Use the Business Profile Performance API instead.",
    };
  }
}

/**
 * Update business information on Google My Business
 *
 * @async
 * @param {string} accountId - GMB account ID
 * @param {string} locationId - GMB location ID
 * @param {Object} data - Business data to update
 * @param {string} [data.title] - Business name
 * @param {string} [data.phoneNumber] - Primary phone number
 * @param {string} [data.websiteUri] - Website URL
 * @param {string} [data.description] - Business description
 * @param {Object} [data.regularHours] - Business hours
 * @returns {Promise<Object>} Update result
 * @throws {Error} If API request fails or rate limit exceeded
 *
 * @example
 * const result = await updateBusinessInfo('1234567890', '0987654321', {
 *   title: 'New Business Name',
 *   phoneNumber: '+1-234-567-8900',
 *   websiteUri: 'https://newwebsite.com',
 *   description: 'Updated business description'
 * });
 * console.log(result);
 */
export async function updateBusinessInfo(accountId, locationId, data) {
  try {
    // Check rate limit
    if (!checkRateLimit()) {
      throw new Error("Rate limit exceeded. Maximum 1500 requests per day.");
    }

    // Validate input
    if (!accountId || !locationId || !data || Object.keys(data).length === 0) {
      throw new Error("accountId, locationId, and data are required");
    }

    const oauth2Client = createOAuth2Client();
    const mybusiness = google.mybusinessbusinessinformation("v1");

    const locationName = `accounts/${accountId}/locations/${locationId}`;

    // Prepare update data
    const updateData = {};
    const updateMask = [];

    if (data.title) {
      updateData.title = data.title;
      updateMask.push("title");
    }

    if (data.phoneNumber) {
      updateData.phoneNumbers = {
        primaryPhone: data.phoneNumber,
      };
      updateMask.push("phoneNumbers.primaryPhone");
    }

    if (data.websiteUri) {
      updateData.websiteUri = data.websiteUri;
      updateMask.push("websiteUri");
    }

    if (data.description) {
      updateData.profile = {
        description: data.description,
      };
      updateMask.push("profile.description");
    }

    if (data.regularHours) {
      updateData.regularHours = data.regularHours;
      updateMask.push("regularHours");
    }

    if (updateMask.length === 0) {
      throw new Error("No valid fields to update");
    }

    const response = await mybusiness.accounts.locations.patch({
      auth: oauth2Client,
      name: locationName,
      updateMask: updateMask.join(","),
      requestBody: updateData,
    });

    return {
      success: true,
      data: {
        locationName: response.data.name,
        updatedFields: updateMask,
        message: "Business information updated successfully",
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Update Business Info Error:", error.message);
    return {
      success: false,
      error: error.message,
      details: error.response?.data || null,
    };
  }
}

/**
 * Get rate limit status
 *
 * @returns {Object} Current rate limit status
 *
 * @example
 * const status = getRateLimitStatus();
 * console.log(status);
 * // {
 * //   requestsUsed: 45,
 * //   requestsRemaining: 1455,
 * //   maxRequests: 1500,
 * //   resetTime: '2025-11-15T00:00:00.000Z'
 * // }
 */
export function getRateLimitStatus() {
  const now = Date.now();

  // Remove old requests
  RATE_LIMIT.requests = RATE_LIMIT.requests.filter(
    (timestamp) => now - timestamp < RATE_LIMIT.resetInterval
  );

  const requestsUsed = RATE_LIMIT.requests.length;
  const requestsRemaining = RATE_LIMIT.maxRequests - requestsUsed;
  const oldestRequest = RATE_LIMIT.requests[0];
  const resetTime = oldestRequest
    ? new Date(oldestRequest + RATE_LIMIT.resetInterval).toISOString()
    : new Date(now + RATE_LIMIT.resetInterval).toISOString();

  return {
    requestsUsed,
    requestsRemaining,
    maxRequests: RATE_LIMIT.maxRequests,
    resetTime,
  };
}

// Export default object with all functions
export default {
  authenticateGMB,
  getBusinessInfo,
  getBusinessReviews,
  getBusinessInsights,
  updateBusinessInfo,
  getRateLimitStatus,
};
