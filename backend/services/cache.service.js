/**
 * 🚀 SMART CACHE SERVICE 
 * 
 * Plan-aware caching system that reduces redundant scans and controls API costs.
 * Implements safe caching with proper TTL, URL normalization, and cache invalidation.
 * 
 * Features:
 * - URL normalization for consistent cache keys
 * - Plan-based TTL (Guest: 6h, Free: 12h, Pro: 24h)
 * - Only caches completed/partial scans
 * - Cache stampede protection
 * - Automatic expiration cleanup
 * 
 * Version: 1.0
 * Last Modified: December 13, 2025
 */

import crypto from 'crypto';
import dbRepository from '../database/repository.js';
import { getPlanConfig } from './planEnforcement.service.js';
import { logCacheHit, logCacheMiss, logCacheWrite } from './observability.service.js';

/**
 * 🔧 URL NORMALIZATION RULES
 * Ensures consistent cache keys for equivalent URLs
 */
export function normalizeUrl(url) {
  try {
    const urlObj = new URL(url);
    
    // 1. Lowercase hostname
    urlObj.hostname = urlObj.hostname.toLowerCase();
    
    // 2. Remove trailing slash from pathname (unless root)
    if (urlObj.pathname.length > 1 && urlObj.pathname.endsWith('/')) {
      urlObj.pathname = urlObj.pathname.slice(0, -1);
    }
    
    // 3. Enforce HTTPS (configurable for development)
    if (process.env.CACHE_FORCE_HTTPS !== 'false' && urlObj.protocol === 'http:') {
      urlObj.protocol = 'https:';
    }
    
    // 4. Remove common tracking parameters (configurable)
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'mc_eid', 'mc_cid', '_ga', 'ref'
    ];
    
    if (process.env.CACHE_STRIP_QUERY !== 'false') {
      trackingParams.forEach(param => {
        urlObj.searchParams.delete(param);
      });
    }
    
    // 5. Sort remaining query parameters for consistency
    urlObj.searchParams.sort();
    
    return urlObj.toString();
  } catch (error) {
    console.error('🚨 URL normalization failed:', error.message);
    return url; // Return original URL if normalization fails
  }
}

/**
 * 🔑 CACHE KEY GENERATION
 * Creates unique cache key from normalized URL and enabled services
 */
export function generateCacheKey(url, enabledServices = []) {
  const normalizedUrl = normalizeUrl(url);
  const sortedServices = [...enabledServices].sort().join(',');
  const keyString = `${normalizedUrl}|${sortedServices}`;
  
  // Create hash for consistent, compact key
  return crypto.createHash('sha256').update(keyString).digest('hex').substring(0, 32);
}

/**
 * ⏰ TTL CALCULATION BY PLAN
 * Returns cache expiration based on user plan
 */
function getCacheTTL(planType) {
  const planConfig = getPlanConfig(planType);
  
  // TTL in hours based on plan
  const ttlHours = {
    GUEST: 6,
    FREE: 12,
    PRO: 24
  };
  
  const hours = ttlHours[planType] || ttlHours.GUEST;
  return new Date(Date.now() + (hours * 60 * 60 * 1000)); // Convert to milliseconds
}

/**
 * 🔍 CACHE LOOKUP
 * Checks if a valid cached result exists for the given URL and services
 */
export async function getCachedScan(url, enabledServices = [], planType = 'GUEST') {
  try {
    const cacheKey = generateCacheKey(url, enabledServices);
    
    console.log(`🔍 Cache lookup for key: ${cacheKey} (Plan: ${planType})`);
    
    // Look up cached entry
    const cacheEntry = await dbRepository.getCacheEntry(cacheKey);
    
    if (!cacheEntry) {
      console.log('💨 Cache miss - no entry found');
      return null;
    }
    
    // Check if cache has expired
    const now = new Date();
    if (now > cacheEntry.expires_at) {
      console.log('⏰ Cache expired, removing entry');
      await dbRepository.removeCacheEntry(cacheKey);
      return null;
    }
    
    // Get the full scan result
    const scanResult = await dbRepository.getScanById(cacheEntry.scan_id);
    
    if (!scanResult || !['completed', 'partial'].includes(scanResult.status)) {
      console.log('❌ Cached scan not in valid state, removing entry');
      await dbRepository.removeCacheEntry(cacheKey);
      return null;
    }
    
    console.log(`✅ Cache hit! Returning scan ${cacheEntry.scan_id}`);
    return {
      ...scanResult,
      fromCache: true,
      cacheKey,
      cachedAt: cacheEntry.created_at
    };
    
  } catch (error) {
    console.error('🚨 Cache lookup error:', error.message);
    return null; // Fail gracefully, proceed without cache
  }
}

/**
 * 💾 CACHE WRITE
 * Stores scan result in cache with appropriate TTL
 */
export async function cacheScanResult(scanId, url, enabledServices = [], planType = 'GUEST') {
  try {
    // Only cache completed or partial scans
    const scanResult = await dbRepository.getScanById(scanId);
    
    if (!scanResult || !['completed', 'partial'].includes(scanResult.status)) {
      console.log(`⚠️  Skipping cache write - scan ${scanId} status: ${scanResult?.status || 'not found'}`);
      return false;
    }
    
    const cacheKey = generateCacheKey(url, enabledServices);
    const expiresAt = getCacheTTL(planType);
    
    console.log(`💾 Caching scan ${scanId} with key: ${cacheKey} (expires: ${expiresAt.toISOString()})`);
    
    // Handle race condition - only insert if key doesn't exist
    const success = await dbRepository.setCacheEntry(cacheKey, scanId, expiresAt);
    
    if (success) {
      console.log(`✅ Cache entry created successfully`);
    } else {
      console.log(`ℹ️  Cache entry already exists (race condition handled)`);
    }
    
    return success;
    
  } catch (error) {
    console.error('🚨 Cache write error:', error.message);
    return false; // Fail gracefully
  }
}

/**
 * 🧹 CACHE CLEANUP
 * Removes expired cache entries (should be run periodically)
 */
export async function cleanupExpiredCache() {
  try {
    const deletedCount = await dbRepository.cleanupExpiredCache();
    if (deletedCount > 0) {
      console.log(`🧹 Cleaned up ${deletedCount} expired cache entries`);
    }
    return deletedCount;
  } catch (error) {
    console.error('🚨 Cache cleanup error:', error.message);
    return 0;
  }
}

/**
 * ❌ CACHE INVALIDATION
 * Removes cache entry for specific URL/services combination
 */
export async function invalidateCache(url, enabledServices = []) {
  try {
    const cacheKey = generateCacheKey(url, enabledServices);
    console.log(`❌ Invalidating cache for key: ${cacheKey}`);
    
    const success = await dbRepository.removeCacheEntry(cacheKey);
    return success;
  } catch (error) {
    console.error('🚨 Cache invalidation error:', error.message);
    return false;
  }
}

/**
 * 📊 CACHE STATISTICS
 * Returns cache usage statistics for monitoring
 */
export async function getCacheStats() {
  try {
    return await dbRepository.getCacheStats();
  } catch (error) {
    console.error('🚨 Cache stats error:', error.message);
    return {
      total_entries: 0,
      expired_entries: 0,
      valid_entries: 0
    };
  }
}