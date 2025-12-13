/**
 * Security Service
 * Provides input validation, sanitization, and security controls
 */

import { URL } from 'url';

class SecurityService {
  constructor() {
    this.MAX_URL_LENGTH = 2048;
    
    // Private IP ranges (RFC 1918, RFC 3927, etc.)
    this.PRIVATE_IP_RANGES = [
      /^10\./,                    // 10.0.0.0/8
      /^172\.(1[6-9]|2[0-9]|3[01])\./,  // 172.16.0.0/12
      /^192\.168\./,              // 192.168.0.0/16
      /^127\./,                   // 127.0.0.0/8 (localhost)
      /^169\.254\./,              // 169.254.0.0/16 (link-local)
      /^0\./,                     // 0.0.0.0/8
      /^224\./,                   // 224.0.0.0/8 (multicast)
      /^255\./                    // 255.0.0.0/8 (broadcast)
    ];
    
    // Forbidden hostnames
    this.FORBIDDEN_HOSTNAMES = [
      'localhost',
      '0.0.0.0',
      'metadata.google.internal',
      'metadata.amazonaws.com',
      'metadata.azure.com',
      'instance-data.ec2.internal'
    ];
    
    // Allowed protocols
    this.ALLOWED_PROTOCOLS = ['http:', 'https:'];
  }

  /**
   * Validates and sanitizes a URL for security
   * @param {string} urlString - URL to validate
   * @returns {Object} - { isValid: boolean, sanitizedUrl?: string, error?: string }
   */
  validateUrl(urlString) {
    try {
      // Basic validation
      if (!urlString || typeof urlString !== 'string') {
        return { isValid: false, error: 'URL is required and must be a string' };
      }

      // Length check
      if (urlString.length > this.MAX_URL_LENGTH) {
        return { isValid: false, error: `URL too long (max ${this.MAX_URL_LENGTH} characters)` };
      }

      // Trim whitespace and normalize
      const trimmed = urlString.trim();
      if (!trimmed) {
        return { isValid: false, error: 'URL cannot be empty' };
      }

      // Parse URL
      let parsedUrl;
      try {
        parsedUrl = new URL(trimmed);
      } catch (parseError) {
        return { isValid: false, error: 'Invalid URL format' };
      }

      // Protocol validation
      if (!this.ALLOWED_PROTOCOLS.includes(parsedUrl.protocol)) {
        return { 
          isValid: false, 
          error: `Protocol '${parsedUrl.protocol}' not allowed. Use http: or https:` 
        };
      }

      // Hostname validation
      const hostname = parsedUrl.hostname.toLowerCase();
      
      // Check forbidden hostnames
      if (this.FORBIDDEN_HOSTNAMES.includes(hostname)) {
        return { isValid: false, error: 'Access to this hostname is forbidden' };
      }

      // Check for private/internal IP addresses
      if (this.isPrivateOrLocalIP(hostname)) {
        return { isValid: false, error: 'Access to private/internal IP addresses is forbidden' };
      }

      // Port validation (reject suspicious ports)
      if (parsedUrl.port) {
        const port = parseInt(parsedUrl.port);
        if (this.isForbiddenPort(port)) {
          return { isValid: false, error: `Access to port ${port} is forbidden` };
        }
      }

      // Additional security checks
      if (this.containsSuspiciousPatterns(parsedUrl)) {
        return { isValid: false, error: 'URL contains suspicious patterns' };
      }

      // Return sanitized URL
      return { 
        isValid: true, 
        sanitizedUrl: parsedUrl.toString(),
        hostname: parsedUrl.hostname,
        protocol: parsedUrl.protocol
      };

    } catch (error) {
      return { isValid: false, error: 'URL validation failed' };
    }
  }

  /**
   * Checks if hostname is a private/internal IP address
   */
  isPrivateOrLocalIP(hostname) {
    // Check if it's an IP address
    const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    if (!ipRegex.test(hostname)) {
      return false; // Not an IP address
    }

    // Check against private IP ranges
    return this.PRIVATE_IP_RANGES.some(range => range.test(hostname));
  }

  /**
   * Checks if port is forbidden
   */
  isForbiddenPort(port) {
    const forbiddenPorts = [
      22,   // SSH
      23,   // Telnet
      25,   // SMTP
      53,   // DNS
      110,  // POP3
      143,  // IMAP
      993,  // IMAPS
      995,  // POP3S
      1433, // MSSQL
      3306, // MySQL
      3389, // RDP
      5432, // PostgreSQL
      6379, // Redis
      27017 // MongoDB
    ];
    
    return forbiddenPorts.includes(port);
  }

  /**
   * Checks for suspicious patterns in URL
   */
  containsSuspiciousPatterns(parsedUrl) {
    const fullUrl = parsedUrl.toString();
    
    const suspiciousPatterns = [
      /@/,                           // Potential credential injection
      /javascript:/i,                // JavaScript protocol
      /data:/i,                      // Data protocol
      /file:/i,                      // File protocol
      /\.\.\/+/,                     // Path traversal
      /%2e%2e%2f/i,                  // URL-encoded path traversal
      /\s/,                          // Whitespace in URL (should be encoded)
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(fullUrl));
  }

  /**
   * Sanitizes user input to prevent XSS and injection
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input;
    }

    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  }

  /**
   * Generates request fingerprint for rate limiting
   */
  generateRequestFingerprint(req) {
    const ip = this.getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'unknown';
    const forwarded = req.headers['x-forwarded-for'] || '';
    
    return {
      ip,
      userAgent: userAgent.substring(0, 100), // Limit length
      forwarded,
      timestamp: Date.now()
    };
  }

  /**
   * Extracts client IP address from request
   */
  getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
           req.headers['x-real-ip'] ||
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           '0.0.0.0';
  }

  /**
   * Validates scan request parameters
   */
  validateScanRequest(body) {
    const errors = [];

    // URL validation
    if (!body.url) {
      errors.push('URL is required');
    } else {
      const urlValidation = this.validateUrl(body.url);
      if (!urlValidation.isValid) {
        errors.push(`Invalid URL: ${urlValidation.error}`);
      }
    }

    // Force parameter validation
    if (body.force !== undefined && typeof body.force !== 'boolean') {
      errors.push('Force parameter must be boolean');
    }

    // Plan validation
    if (body.plan && !['GUEST', 'FREE', 'PRO'].includes(body.plan)) {
      errors.push('Invalid plan type');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedBody: {
        url: body.url ? this.validateUrl(body.url).sanitizedUrl : undefined,
        force: Boolean(body.force),
        plan: body.plan || 'GUEST'
      }
    };
  }
}

export default new SecurityService();