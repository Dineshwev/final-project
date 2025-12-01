/**
 * Validate and normalize URLs for scanning
 */
export const validateAndNormalizeUrl = (url) => {
  try {
    // Basic string validation
    if (!url || typeof url !== 'string') {
      throw new Error('URL must be a non-empty string');
    }

    // Trim whitespace
    url = url.trim();

    // Add protocol if missing
    if (!url.match(/^https?:\/\//)) {
      url = 'https://' + url;
    }

    // Create URL object to validate format
    const urlObj = new URL(url);
    
    // Check for valid protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('URL must use HTTP or HTTPS protocol');
    }

    // Check for valid hostname
    if (!urlObj.hostname || urlObj.hostname.length === 0) {
      throw new Error('URL must have a valid hostname');
    }

    // Return normalized URL
    return normalizeUrl(urlObj.href);
  } catch (error) {
    throw new Error(`Invalid URL: ${error.message}`);
  }
};

/**
 * Normalize URLs for consistent comparison
 */
export const normalizeUrl = (url) => {
  try {
    // Create URL object
    const urlObj = new URL(url);
    
    // Convert to lowercase
    let normalized = urlObj.href.toLowerCase();
    
    // Remove trailing slash if present (except for root)
    if (normalized.endsWith('/') && normalized !== urlObj.origin + '/') {
      normalized = normalized.slice(0, -1);
    }
    
    // Remove default ports
    normalized = normalized
      .replace(':80/', '/')
      .replace(':443/', '/');
    
    return normalized;
  } catch (error) {
    // If URL is invalid, return original
    return url;
  }
};

/**
 * Check if a URL appears to be accessible/valid for scanning
 */
export const isValidScanUrl = (url) => {
  try {
    const urlObj = new URL(url);
    
    // Check for common development/local URLs that might not be accessible
    const hostname = urlObj.hostname.toLowerCase();
    
    // Allow common domains
    if (hostname.includes('localhost') || 
        hostname.includes('127.0.0.1') || 
        hostname.includes('.local') ||
        hostname === 'replit.com' ||
        hostname.endsWith('.replit.com') ||
        hostname.endsWith('.repl.co')) {
      return {
        valid: false,
        reason: 'Local or development URLs may not be accessible for public scanning'
      };
    }
    
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      reason: 'Invalid URL format'
    };
  }
};