/**
 * Rate Limiting Service
 * Provides abuse protection and request throttling
 */

class RateLimitService {
  constructor() {
    // In-memory storage for rate limiting (fallback when Redis unavailable)
    this.requests = new Map();
    this.suspiciousIPs = new Map();
    this.cleanupInterval = null;
    
    // Rate limit configurations
    this.limits = {
      SCAN_CREATION: {
        windowMs: 60 * 1000,        // 1 minute
        maxRequests: 10,            // 10 requests per minute
        skipSuccessfulRequests: false
      },
      POLLING: {
        windowMs: 60 * 1000,        // 1 minute
        maxRequests: 60,            // 60 requests per minute
        skipSuccessfulRequests: true
      },
      RETRY: {
        windowMs: 60 * 1000,        // 1 minute
        maxRequests: 5,             // 5 retries per minute per user
        skipSuccessfulRequests: false
      }
    };
    
    // Abuse detection thresholds
    this.abuseThresholds = {
      RAPID_REQUESTS: 100,          // 100+ requests in a minute
      FAILURE_RATE: 0.8,            // 80% failure rate
      SUSPICIOUS_USER_AGENT: /bot|crawler|scraper/i
    };
    
    this.startCleanupTimer();
  }

  /**
   * Check if request is allowed under rate limits
   * @param {string} key - Unique identifier for rate limiting
   * @param {string} limitType - Type of limit to apply
   * @param {Object} requestData - Additional request information
   */
  isRequestAllowed(key, limitType, requestData = {}) {
    const limit = this.limits[limitType];
    if (!limit) {
      return { allowed: true, remainingRequests: Infinity };
    }

    const now = Date.now();
    const windowStart = now - limit.windowMs;
    
    // Get or create request log for this key
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const requestLog = this.requests.get(key);
    
    // Remove expired requests
    const validRequests = requestLog.filter(req => req.timestamp > windowStart);
    this.requests.set(key, validRequests);
    
    // Count relevant requests
    let relevantRequests = validRequests;
    if (limit.skipSuccessfulRequests) {
      relevantRequests = validRequests.filter(req => !req.success);
    }
    
    const requestCount = relevantRequests.length;
    const allowed = requestCount < limit.maxRequests;
    const remainingRequests = Math.max(0, limit.maxRequests - requestCount);
    
    // Add current request to log
    validRequests.push({
      timestamp: now,
      success: requestData.success,
      userAgent: requestData.userAgent,
      endpoint: requestData.endpoint
    });
    
    // Check for abuse patterns
    const abuseLevel = this.detectAbuse(key, validRequests, requestData);
    
    return {
      allowed: allowed && abuseLevel < 3, // Block if high abuse level
      remainingRequests,
      resetTime: windowStart + limit.windowMs,
      abuseLevel,
      retryAfter: allowed ? 0 : Math.ceil(limit.windowMs / 1000)
    };
  }

  /**
   * Record a completed request
   */
  recordRequest(key, limitType, success = true, requestData = {}) {
    // Update the latest request with success status
    if (this.requests.has(key)) {
      const requestLog = this.requests.get(key);
      if (requestLog.length > 0) {
        const latestRequest = requestLog[requestLog.length - 1];
        latestRequest.success = success;
      }
    }
  }

  /**
   * Detect abuse patterns
   */
  detectAbuse(key, requestLog, currentRequest) {
    const now = Date.now();
    const recentRequests = requestLog.filter(req => 
      now - req.timestamp < 60000 // Last minute
    );

    let abuseLevel = 0;

    // Check for rapid requests
    if (recentRequests.length > this.abuseThresholds.RAPID_REQUESTS) {
      abuseLevel += 2;
    }

    // Check failure rate
    const failedRequests = recentRequests.filter(req => !req.success);
    const failureRate = recentRequests.length > 0 ? 
      failedRequests.length / recentRequests.length : 0;
    
    if (failureRate > this.abuseThresholds.FAILURE_RATE && recentRequests.length > 5) {
      abuseLevel += 1;
    }

    // Check suspicious user agent
    if (currentRequest.userAgent && 
        this.abuseThresholds.SUSPICIOUS_USER_AGENT.test(currentRequest.userAgent)) {
      abuseLevel += 1;
    }

    // Track suspicious IPs
    if (abuseLevel > 0) {
      const suspiciousData = this.suspiciousIPs.get(key) || { level: 0, firstSeen: now };
      suspiciousData.level = Math.max(suspiciousData.level, abuseLevel);
      suspiciousData.lastSeen = now;
      this.suspiciousIPs.set(key, suspiciousData);
    }

    return abuseLevel;
  }

  /**
   * Check if IP is currently marked as suspicious
   */
  isSuspiciousIP(key) {
    const suspiciousData = this.suspiciousIPs.get(key);
    if (!suspiciousData) return false;

    const now = Date.now();
    const suspiciousAge = now - suspiciousData.lastSeen;
    
    // Clear suspicion after 1 hour of good behavior
    if (suspiciousAge > 60 * 60 * 1000) {
      this.suspiciousIPs.delete(key);
      return false;
    }

    return suspiciousData.level > 1;
  }

  /**
   * Apply progressive backoff for suspicious requests
   */
  getBackoffDelay(key, baseDelay = 1000) {
    const suspiciousData = this.suspiciousIPs.get(key);
    if (!suspiciousData) return 0;

    // Progressive backoff: level 1 = 1s, level 2 = 2s, level 3+ = 5s
    const multiplier = suspiciousData.level === 1 ? 1 : 
                      suspiciousData.level === 2 ? 2 : 5;
    
    return baseDelay * multiplier;
  }

  /**
   * Create rate limiting key from request
   */
  createRateLimitKey(ip, additionalData = '') {
    return `${ip}:${additionalData}`;
  }

  /**
   * Create user-specific rate limiting key
   */
  createUserRateLimitKey(userType, ip, scanId = '') {
    return `user:${userType}:${ip}:${scanId}`;
  }

  /**
   * Get rate limit information for response headers
   */
  getRateLimitHeaders(result, limitType) {
    const limit = this.limits[limitType];
    if (!limit || !result) {
      return {};
    }

    return {
      'X-RateLimit-Limit': limit.maxRequests.toString(),
      'X-RateLimit-Remaining': result.remainingRequests.toString(),
      'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
      'X-RateLimit-Window': Math.ceil(limit.windowMs / 1000).toString()
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    const expireTime = 60 * 60 * 1000; // 1 hour

    // Clean up request logs
    for (const [key, requestLog] of this.requests.entries()) {
      const validRequests = requestLog.filter(req => 
        now - req.timestamp < expireTime
      );
      
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }

    // Clean up suspicious IPs
    for (const [key, data] of this.suspiciousIPs.entries()) {
      if (now - data.lastSeen > expireTime) {
        this.suspiciousIPs.delete(key);
      }
    }
  }

  /**
   * Start periodic cleanup
   */
  startCleanupTimer() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    // Cleanup every 10 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 10 * 60 * 1000);
  }

  /**
   * Stop cleanup timer
   */
  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get current statistics
   */
  getStats() {
    return {
      activeKeys: this.requests.size,
      suspiciousIPs: this.suspiciousIPs.size,
      totalRequests: Array.from(this.requests.values()).reduce(
        (total, requests) => total + requests.length, 0
      )
    };
  }
}

export default new RateLimitService();