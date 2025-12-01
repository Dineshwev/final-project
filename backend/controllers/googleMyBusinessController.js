/**
 * Google My Business Controller
 * Handles HTTP requests for Google My Business API operations
 */

import * as gmbService from "../services/googleMyBusinessService.js";

/**
 * Handle OAuth2 authentication
 * GET /api/gmb/auth
 */
export async function handleAuth(req, res) {
  try {
    const { code } = req.query;

    const result = await gmbService.authenticateGMB(code);

    if (result.success && result.authUrl) {
      // Return auth URL for user to visit
      return res.status(200).json(result);
    }

    if (result.success && result.tokens) {
      // Return tokens after successful authorization
      return res.status(200).json({
        success: true,
        message: result.message,
        refreshToken: result.tokens.refresh_token,
        note: "Save this refresh token in your .env file as GOOGLE_REFRESH_TOKEN",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Authentication failed",
    });
  } catch (error) {
    console.error("Auth Controller Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get business information
 * GET /api/gmb/business/:accountId/:locationId
 */
export async function getBusinessInfo(req, res) {
  try {
    const { accountId, locationId } = req.params;

    if (!accountId || !locationId) {
      return res.status(400).json({
        success: false,
        error: "accountId and locationId are required",
      });
    }

    const result = await gmbService.getBusinessInfo(accountId, locationId);

    if (result.success) {
      return res.status(200).json(result);
    }

    return res.status(400).json(result);
  } catch (error) {
    console.error("Get Business Info Controller Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get business reviews
 * GET /api/gmb/reviews/:accountId/:locationId
 */
export async function getBusinessReviews(req, res) {
  try {
    const { accountId, locationId } = req.params;
    const { pageSize } = req.query;

    if (!accountId || !locationId) {
      return res.status(400).json({
        success: false,
        error: "accountId and locationId are required",
      });
    }

    const result = await gmbService.getBusinessReviews(
      accountId,
      locationId,
      parseInt(pageSize) || 50
    );

    if (result.success) {
      return res.status(200).json(result);
    }

    return res.status(400).json(result);
  } catch (error) {
    console.error("Get Business Reviews Controller Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get business insights
 * GET /api/gmb/insights/:accountId/:locationId
 */
export async function getBusinessInsights(req, res) {
  try {
    const { accountId, locationId } = req.params;
    const { startDate, endDate } = req.query;

    if (!accountId || !locationId) {
      return res.status(400).json({
        success: false,
        error: "accountId and locationId are required",
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error:
          "startDate and endDate query parameters are required (YYYY-MM-DD format)",
      });
    }

    const result = await gmbService.getBusinessInsights(
      accountId,
      locationId,
      startDate,
      endDate
    );

    if (result.success) {
      return res.status(200).json(result);
    }

    return res.status(400).json(result);
  } catch (error) {
    console.error("Get Business Insights Controller Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Update business information
 * PATCH /api/gmb/business/:accountId/:locationId
 */
export async function updateBusinessInfo(req, res) {
  try {
    const { accountId, locationId } = req.params;
    const data = req.body;

    if (!accountId || !locationId) {
      return res.status(400).json({
        success: false,
        error: "accountId and locationId are required",
      });
    }

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        error: "Request body with update data is required",
      });
    }

    const result = await gmbService.updateBusinessInfo(
      accountId,
      locationId,
      data
    );

    if (result.success) {
      return res.status(200).json(result);
    }

    return res.status(400).json(result);
  } catch (error) {
    console.error("Update Business Info Controller Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get rate limit status
 * GET /api/gmb/rate-limit
 */
export async function getRateLimitStatus(req, res) {
  try {
    const status = gmbService.getRateLimitStatus();
    return res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("Rate Limit Status Controller Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export default {
  handleAuth,
  getBusinessInfo,
  getBusinessReviews,
  getBusinessInsights,
  updateBusinessInfo,
  getRateLimitStatus,
};
