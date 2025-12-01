/**
 * Google My Business Routes
 * API endpoints for Google My Business integration
 */

import express from "express";
import * as gmbController from "../controllers/googleMyBusinessController.js";

const router = express.Router();

/**
 * @route GET /api/gmb/auth
 * @desc Handle OAuth2 authentication
 * @access Public
 * @query {string} code - Authorization code (optional, for token exchange)
 */
router.get("/auth", gmbController.handleAuth);

/**
 * @route GET /api/gmb/business/:accountId/:locationId
 * @desc Get business information
 * @access Private (requires authentication)
 * @param {string} accountId - GMB account ID
 * @param {string} locationId - GMB location ID
 */
router.get("/business/:accountId/:locationId", gmbController.getBusinessInfo);

/**
 * @route GET /api/gmb/reviews/:accountId/:locationId
 * @desc Get business reviews
 * @access Private (requires authentication)
 * @param {string} accountId - GMB account ID
 * @param {string} locationId - GMB location ID
 * @query {number} pageSize - Number of reviews to fetch (max 50)
 */
router.get("/reviews/:accountId/:locationId", gmbController.getBusinessReviews);

/**
 * @route GET /api/gmb/insights/:accountId/:locationId
 * @desc Get business insights and analytics
 * @access Private (requires authentication)
 * @param {string} accountId - GMB account ID
 * @param {string} locationId - GMB location ID
 * @query {string} startDate - Start date (YYYY-MM-DD)
 * @query {string} endDate - End date (YYYY-MM-DD)
 */
router.get(
  "/insights/:accountId/:locationId",
  gmbController.getBusinessInsights
);

/**
 * @route PATCH /api/gmb/business/:accountId/:locationId
 * @desc Update business information
 * @access Private (requires authentication)
 * @param {string} accountId - GMB account ID
 * @param {string} locationId - GMB location ID
 * @body {Object} data - Business data to update
 */
router.patch(
  "/business/:accountId/:locationId",
  gmbController.updateBusinessInfo
);

/**
 * @route GET /api/gmb/rate-limit
 * @desc Get current rate limit status
 * @access Public
 */
router.get("/rate-limit", gmbController.getRateLimitStatus);

export default router;
