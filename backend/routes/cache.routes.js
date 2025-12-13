/**
 * 🚀 CACHE ROUTES
 * 
 * Routes for cache management and monitoring.
 * Includes cleanup and statistics endpoints.
 * 
 * Version: 1.0
 * Last Modified: December 13, 2025
 */

import express from 'express';
import { 
  getCacheStatsEndpoint,
  cleanupCacheEndpoint,
  invalidateCacheEndpoint
} from '../controllers/cache.controller.js';

const router = express.Router();

// 📊 Cache Statistics - GET /api/cache/stats
router.get('/stats', getCacheStatsEndpoint);

// 🧹 Cleanup Expired Cache - POST /api/cache/cleanup
router.post('/cleanup', cleanupCacheEndpoint);

// ❌ Invalidate Cache Entry - DELETE /api/cache/invalidate
router.delete('/invalidate', invalidateCacheEndpoint);

export default router;