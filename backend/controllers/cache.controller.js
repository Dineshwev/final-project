/**
 * 🚀 CACHE CONTROLLER
 * 
 * Provides endpoints for cache management and monitoring.
 * Admin-only endpoints for production cache maintenance.
 * 
 * Version: 1.0
 * Last Modified: December 13, 2025
 */

import { 
  getCacheStats,
  cleanupExpiredCache,
  invalidateCache
} from '../services/cache.service.js';

/**
 * 📊 GET CACHE STATISTICS
 * Returns cache usage statistics for monitoring
 * 
 * GET /api/cache/stats
 */
export const getCacheStatsEndpoint = async (req, res) => {
  try {
    const stats = await getCacheStats();
    
    res.json({
      success: true,
      data: {
        cache: stats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('🚨 Cache stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cache statistics',
      code: 'CACHE_STATS_ERROR'
    });
  }
};

/**
 * 🧹 CLEANUP EXPIRED CACHE ENTRIES
 * Removes expired cache entries and returns count of cleaned entries
 * 
 * POST /api/cache/cleanup
 */
export const cleanupCacheEndpoint = async (req, res) => {
  try {
    const deletedCount = await cleanupExpiredCache();
    
    res.json({
      success: true,
      data: {
        message: `Successfully cleaned up ${deletedCount} expired cache entries`,
        deletedCount,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('🚨 Cache cleanup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup cache',
      code: 'CACHE_CLEANUP_ERROR'
    });
  }
};

/**
 * ❌ INVALIDATE SPECIFIC CACHE ENTRY
 * Removes cache entry for specific URL and services
 * 
 * DELETE /api/cache/invalidate
 * Body: { url: string, services?: string[] }
 */
export const invalidateCacheEndpoint = async (req, res) => {
  try {
    const { url, services = [] } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required',
        code: 'MISSING_URL'
      });
    }
    
    const success = await invalidateCache(url, services);
    
    if (success) {
      res.json({
        success: true,
        data: {
          message: `Successfully invalidated cache for ${url}`,
          url,
          services,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Cache entry not found or already expired',
        code: 'CACHE_NOT_FOUND'
      });
    }
  } catch (error) {
    console.error('🚨 Cache invalidation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to invalidate cache',
      code: 'CACHE_INVALIDATION_ERROR'
    });
  }
};