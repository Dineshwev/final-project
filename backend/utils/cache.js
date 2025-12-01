const NodeCache = require('node-cache');

// Initialize cache with 1 hour standard TTL
const cache = new NodeCache({ stdTTL: 3600 });

/**
 * Cache middleware for Express routes
 * @param {number} duration - Cache duration in seconds (optional)
 */
const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    const key = `__express__${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      res.send(cachedResponse);
      return;
    }

    res.sendResponse = res.send;
    res.send = (body) => {
      cache.set(key, body, duration);
      res.sendResponse(body);
    };
    next();
  };
};

/**
 * Get cached value with key
 */
const getCached = (key) => {
  return cache.get(key);
};

/**
 * Set cache value with key and optional TTL
 */
const setCached = (key, value, ttl = 3600) => {
  return cache.set(key, value, ttl);
};

/**
 * Delete cached value with key
 */
const deleteCached = (key) => {
  return cache.del(key);
};

/**
 * Clear entire cache
 */
const clearCache = () => {
  return cache.flushAll();
};

/**
 * Get cache statistics
 */
const getCacheStats = () => {
  return cache.getStats();
};

module.exports = {
  cacheMiddleware,
  getCached,
  setCached,
  deleteCached,
  clearCache,
  getCacheStats
};