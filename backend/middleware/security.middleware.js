/**
 * Security Headers Middleware
 * Adds security headers to all responses
 */

const securityHeaders = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Prevent XSS attacks
  'X-XSS-Protection': '1; mode=block',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  
  // Prevent downloading of potentially harmful content
  'X-Download-Options': 'noopen',
  
  // Prevent HTTPS downgrade attacks
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Hide server information
  'Server': 'SEO-Tools-API'
};

/**
 * Apply security headers middleware
 */
export function applySecurityHeaders(req, res, next) {
  // Apply all security headers
  Object.entries(securityHeaders).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
  
  // Remove potentially revealing headers
  res.removeHeader('X-Powered-By');
  res.removeHeader('ETag');
  
  next();
}

/**
 * CORS middleware with security controls
 */
export function corsWithSecurity(allowedOrigins = ['http://localhost:3000']) {
  return (req, res, next) => {
    const origin = req.headers.origin;
    
    // Check if origin is allowed
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    
    next();
  };
}

/**
 * Rate limiting middleware
 */
export function rateLimitMiddleware(rateLimitService, limitType = 'GENERAL') {
  return (req, res, next) => {
    try {
      const ip = getClientIP(req);
      const key = rateLimitService.createRateLimitKey(ip);
      
      const requestData = {
        userAgent: req.headers['user-agent'],
        endpoint: req.path,
        success: false // Will be updated later
      };
      
      const result = rateLimitService.isRequestAllowed(key, limitType, requestData);
      
      // Add rate limit headers
      const headers = rateLimitService.getRateLimitHeaders(result, limitType);
      Object.entries(headers).forEach(([header, value]) => {
        res.setHeader(header, value);
      });
      
      if (!result.allowed) {
        // Apply progressive backoff for suspicious IPs
        const backoffDelay = rateLimitService.getBackoffDelay(key);
        if (backoffDelay > 0) {
          res.setHeader('Retry-After', Math.ceil(backoffDelay / 1000));
        }
        
        res.status(429).json({
          success: false,
          error: 'Too many requests',
          retryAfter: result.retryAfter,
          remaining: result.remainingRequests
        });
        return;
      }
      
      // Store rate limit info for later use
      req.rateLimit = {
        key,
        limitType,
        remaining: result.remainingRequests
      };
      
      next();
    } catch (error) {
      // Don't block request if rate limiting fails
      console.error('Rate limiting error:', error);
      next();
    }
  };
}

/**
 * Input validation middleware
 */
export function validateInput(securityService) {
  return (req, res, next) => {
    try {
      // Validate scan requests
      if (req.path.includes('/scan') && req.method === 'POST') {
        const validation = securityService.validateScanRequest(req.body);
        
        if (!validation.isValid) {
          res.status(400).json({
            success: false,
            error: 'Invalid request',
            details: validation.errors
          });
          return;
        }
        
        // Replace body with sanitized version
        req.body = validation.sanitizedBody;
      }
      
      // Add request fingerprint for monitoring
      req.fingerprint = securityService.generateRequestFingerprint(req);
      
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Request validation failed'
      });
    }
  };
}

/**
 * Error handling middleware
 */
export function errorHandler(err, req, res, next) {
  console.error('Unhandled error:', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: getClientIP(req)
  });
  
  // Don't expose internal errors in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (err.isTimeout) {
    res.status(408).json({
      success: false,
      error: 'Request timeout',
      type: 'TIMEOUT'
    });
  } else if (err.isValidation) {
    res.status(400).json({
      success: false,
      error: err.message,
      type: 'VALIDATION_ERROR'
    });
  } else if (err.isRateLimit) {
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      type: 'RATE_LIMIT'
    });
  } else {
    res.status(500).json({
      success: false,
      error: isProduction ? 'Internal server error' : err.message,
      type: 'INTERNAL_ERROR'
    });
  }
}

/**
 * Request logging middleware
 */
export function requestLogger() {
  return (req, res, next) => {
    const start = Date.now();
    const ip = getClientIP(req);
    
    // Log request start
    console.log(`${new Date().toISOString()} ${req.method} ${req.url} - ${ip}`);
    
    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      const duration = Date.now() - start;
      console.log(`${new Date().toISOString()} ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
      originalEnd.call(res, chunk, encoding);
    };
    
    next();
  };
}

/**
 * Get client IP address
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         '0.0.0.0';
}

/**
 * Timeout middleware
 */
export function timeoutMiddleware(timeoutMs = 30000) {
  return (req, res, next) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          error: 'Request timeout',
          timeout: timeoutMs
        });
      }
    }, timeoutMs);
    
    res.on('finish', () => {
      clearTimeout(timeout);
    });
    
    next();
  };
}