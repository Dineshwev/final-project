/**
 * sslHelpers.js
 * Utility functions for SSL certificate handling and display
 */

/**
 * Calculate days remaining until certificate expiration
 * 
 * @param {string|Date} expirationDate - Certificate expiration date as string or Date object
 * @returns {number|null} Days until expiration (negative if expired) or null if invalid date
 */
export const calculateDaysUntilExpiration = (expirationDate) => {
  if (!expirationDate) return null;
  
  try {
    // Convert to Date object if string
    const expDate = expirationDate instanceof Date 
      ? expirationDate 
      : new Date(expirationDate);
    
    // Check if date is valid
    if (isNaN(expDate.getTime())) {
      return null;
    }
    
    const now = new Date();
    
    // Calculate difference in days
    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    console.error('Error calculating days until expiration:', error);
    return null;
  }
};

/**
 * Get appropriate Tailwind CSS color class based on SSL grade
 * 
 * @param {string} grade - SSL grade (A+, A, A-, B+, B, etc.)
 * @returns {object} Object with text and background color classes
 */
export const getSSLGradeColor = (grade) => {
  if (!grade) {
    return { text: 'text-gray-500', bg: 'bg-gray-100' };
  }
  
  const normalizedGrade = grade.toUpperCase();
  
  // A grades (excellent)
  if (normalizedGrade.startsWith('A')) {
    return { text: 'text-green-800', bg: 'bg-green-100' };
  }
  
  // B grades (good)
  if (normalizedGrade.startsWith('B')) {
    return { text: 'text-blue-800', bg: 'bg-blue-100' };
  }
  
  // C grades (acceptable)
  if (normalizedGrade.startsWith('C')) {
    return { text: 'text-yellow-800', bg: 'bg-yellow-100' };
  }
  
  // D grades (poor)
  if (normalizedGrade.startsWith('D')) {
    return { text: 'text-orange-800', bg: 'bg-orange-100' };
  }
  
  // E and F grades (bad/failing)
  return { text: 'text-red-800', bg: 'bg-red-100' };
};

/**
 * Format certificate date to a human-readable string
 * 
 * @param {string|Date} dateString - Date to format
 * @param {boolean} includeTime - Whether to include time in the output
 * @returns {string} Formatted date string or 'Invalid date' if parsing fails
 */
export const formatCertificateDate = (dateString, includeTime = false) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Options for date formatting
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...(includeTime && {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      })
    };
    
    return date.toLocaleDateString(undefined, options);
  } catch (error) {
    console.error('Error formatting certificate date:', error);
    return 'Invalid date';
  }
};

/**
 * Validate if a string is a valid domain name
 * 
 * @param {string} domain - Domain to validate
 * @returns {boolean} True if domain is valid, false otherwise
 */
export const validateDomain = (domain) => {
  if (!domain) return false;
  
  try {
    // First clean the domain to remove protocols and trailing slashes
    const cleanedDomain = cleanDomain(domain);
    
    // Regular expression for validating domain names
    // Allows for domains with IDNs, subdomains, and multiple TLDs
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    
    // Allow IP addresses as valid "domains"
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/;
    
    return domainRegex.test(cleanedDomain) || ipRegex.test(cleanedDomain);
  } catch (error) {
    console.error('Error validating domain:', error);
    return false;
  }
};

/**
 * Clean domain by removing protocol, www prefix, trailing paths and slashes
 * 
 * @param {string} domain - Domain to clean
 * @returns {string} Cleaned domain name
 */
export const cleanDomain = (domain) => {
  if (!domain) return '';
  
  try {
    // Convert to string if not already
    let cleanedDomain = String(domain).trim();
    
    // Remove protocol
    cleanedDomain = cleanedDomain.replace(/^(https?:\/\/)?(www\.)?/i, '');
    
    // Remove everything after first slash
    cleanedDomain = cleanedDomain.split('/')[0];
    
    // Remove port number if present
    cleanedDomain = cleanedDomain.split(':')[0];
    
    return cleanedDomain;
  } catch (error) {
    console.error('Error cleaning domain:', error);
    return domain;
  }
};

/**
 * Get appropriate status icon/emoji for SSL status
 * 
 * @param {string} status - SSL certificate status
 * @returns {string} Status icon or emoji
 */
export const getSSLStatusIcon = (status) => {
  if (!status) return '❔';
  
  // Normalize the status to lowercase for easier comparison
  const normalizedStatus = status.toLowerCase();
  
  // Define icon mappings
  const statusIcons = {
    'valid': '✅',
    'expired': '⚠️',
    'revoked': '❌',
    'self-signed': '⚠️',
    'untrusted': '⚠️',
    'error': '❌',
    'insecure': '⚠️',
    'secure': '✅',
    'mixed': '⚠️',
    'pending': '⏳',
    'checking': '⏳',
    'unknown': '❔'
  };
  
  // Return appropriate icon or default to question mark
  return statusIcons[normalizedStatus] || '❔';
};

/**
 * Calculate overall security score (0-100) based on SSL analysis results
 * 
 * @param {Object} results - SSL analysis results
 * @returns {number} Security score from 0-100
 */
export const calculateSecurityScore = (results) => {
  if (!results) return 0;
  
  try {
    let score = 0;
    let maxScore = 0;
    
    // Base scoring weights
    const weights = {
      grade: 30,             // SSL Labs grade
      protocol: 20,          // Protocol versions
      keySize: 15,           // Key size
      securityHeaders: 15,   // Security headers
      certificateValid: 10,  // Certificate validity
      daysUntilExpiry: 5,    // Days until expiration
      vulnerabilities: 5     // Known vulnerabilities
    };
    
    // Grade scoring (A+ = 30, A = 28, A- = 26, etc.)
    if (results.grade) {
      maxScore += weights.grade;
      const grades = ['F', 'E-', 'E', 'E+', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'];
      const gradeIndex = grades.indexOf(results.grade);
      
      if (gradeIndex !== -1) {
        // Convert to scale of 0-30
        score += Math.round((gradeIndex / (grades.length - 1)) * weights.grade);
      }
    }
    
    // Protocol version scoring
    if (results.protocol) {
      maxScore += weights.protocol;
      
      const protocolRanks = {
        'TLS 1.3': 1.0,
        'TLS 1.2': 0.8,
        'TLS 1.1': 0.4,
        'TLS 1.0': 0.2,
        'SSL 3.0': 0.0,
        'SSL 2.0': 0.0
      };
      
      const protocolVersion = Object.keys(protocolRanks).find(p => 
        results.protocol.toUpperCase().includes(p)
      );
      
      if (protocolVersion) {
        score += Math.round(protocolRanks[protocolVersion] * weights.protocol);
      }
    }
    
    // Key size scoring
    if (results.keySize) {
      maxScore += weights.keySize;
      
      const keySize = typeof results.keySize === 'number' 
        ? results.keySize 
        : parseInt(results.keySize);
        
      if (!isNaN(keySize)) {
        // Score based on key size (2048 = 80%, 4096 = 100%, etc.)
        if (keySize >= 4096) {
          score += weights.keySize;
        } else if (keySize >= 3072) {
          score += Math.round(0.9 * weights.keySize);
        } else if (keySize >= 2048) {
          score += Math.round(0.8 * weights.keySize);
        } else if (keySize >= 1024) {
          score += Math.round(0.5 * weights.keySize);
        }
      }
    }
    
    // Security headers scoring
    if (results.securityHeaders) {
      maxScore += weights.securityHeaders;
      
      const importantHeaders = [
        'Strict-Transport-Security',
        'Content-Security-Policy',
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection',
        'Referrer-Policy'
      ];
      
      const presentHeaders = Object.keys(results.securityHeaders);
      
      // Calculate score based on presence of important headers
      const headerScore = importantHeaders.reduce((total, header) => {
        return total + (presentHeaders.includes(header) ? 1 : 0);
      }, 0);
      
      score += Math.round((headerScore / importantHeaders.length) * weights.securityHeaders);
    }
    
    // Certificate validity scoring
    if (results.valid !== undefined) {
      maxScore += weights.certificateValid;
      
      if (results.valid === true) {
        score += weights.certificateValid;
      }
    }
    
    // Days until expiry scoring
    if (results.expiration) {
      maxScore += weights.daysUntilExpiry;
      
      const daysLeft = calculateDaysUntilExpiration(results.expiration);
      
      if (daysLeft !== null) {
        // Score based on days left (90+ days = 100%, 60+ days = 80%, etc.)
        if (daysLeft >= 90) {
          score += weights.daysUntilExpiry;
        } else if (daysLeft >= 60) {
          score += Math.round(0.8 * weights.daysUntilExpiry);
        } else if (daysLeft >= 30) {
          score += Math.round(0.6 * weights.daysUntilExpiry);
        } else if (daysLeft >= 14) {
          score += Math.round(0.4 * weights.daysUntilExpiry);
        } else if (daysLeft >= 0) {
          score += Math.round(0.2 * weights.daysUntilExpiry);
        }
      }
    }
    
    // Vulnerabilities scoring (inverse - more vulnerabilities = lower score)
    if (results.vulnerabilities) {
      maxScore += weights.vulnerabilities;
      
      const vulnCount = Array.isArray(results.vulnerabilities) 
        ? results.vulnerabilities.length 
        : 0;
      
      // Deduct points for vulnerabilities
      if (vulnCount === 0) {
        score += weights.vulnerabilities;
      } else if (vulnCount <= 1) {
        score += Math.round(0.5 * weights.vulnerabilities);
      }
      // No points for 2+ vulnerabilities
    }
    
    // Calculate final percentage score
    if (maxScore === 0) return 0;
    const finalScore = Math.round((score / maxScore) * 100);
    
    // Clamp score between 0-100
    return Math.max(0, Math.min(100, finalScore));
    
  } catch (error) {
    console.error('Error calculating security score:', error);
    return 0;
  }
};

/**
 * Categorize vulnerabilities by severity level
 * 
 * @param {Array} vulnerabilities - Array of vulnerability objects
 * @returns {Object} Categorized vulnerabilities by severity
 */
export const categorizeVulnerabilities = (vulnerabilities) => {
  if (!vulnerabilities || !Array.isArray(vulnerabilities)) {
    return {
      critical: [],
      high: [],
      medium: [],
      low: [],
      info: []
    };
  }
  
  try {
    // Initialize categories
    const categorized = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      info: []
    };
    
    // Process each vulnerability
    vulnerabilities.forEach(vuln => {
      // Normalize severity value
      let severity = vuln.severity ? vuln.severity.toLowerCase() : 'info';
      
      // Map CVSS scores to severity levels if provided
      if (vuln.cvssScore !== undefined) {
        const score = parseFloat(vuln.cvssScore);
        if (!isNaN(score)) {
          if (score >= 9.0) severity = 'critical';
          else if (score >= 7.0) severity = 'high';
          else if (score >= 4.0) severity = 'medium';
          else if (score >= 0.1) severity = 'low';
          else severity = 'info';
        }
      }
      
      // Map common severity terms
      if (severity.includes('critical')) severity = 'critical';
      else if (severity.includes('high')) severity = 'high';
      else if (severity.includes('medium') || severity.includes('moderate')) severity = 'medium';
      else if (severity.includes('low')) severity = 'low';
      else severity = 'info';
      
      // Add to appropriate category
      if (categorized[severity]) {
        categorized[severity].push(vuln);
      } else {
        categorized.info.push(vuln);
      }
    });
    
    return categorized;
  } catch (error) {
    console.error('Error categorizing vulnerabilities:', error);
    return {
      critical: [],
      high: [],
      medium: [],
      low: [],
      info: []
    };
  }
};

/**
 * Check if an SSL certificate is trusted (not self-signed or from an untrusted CA)
 * 
 * @param {Object} certInfo - Certificate information
 * @returns {boolean} True if the certificate is trusted
 */
export const isCertificateTrusted = (certInfo) => {
  if (!certInfo) return false;
  
  // Check for explicit trust information if available
  if (certInfo.trusted !== undefined) {
    return !!certInfo.trusted;
  }
  
  // Check if self-signed
  if (certInfo.selfSigned === true) {
    return false;
  }
  
  // Check if issuer is the same as subject (another way to detect self-signed)
  if (certInfo.issuer && 
      certInfo.subject && 
      JSON.stringify(certInfo.issuer) === JSON.stringify(certInfo.subject)) {
    return false;
  }
  
  // Check for trusted CA issuers (incomplete list, just common ones)
  const trustedCAs = [
    'let\'s encrypt',
    'digicert',
    'sectigo',
    'comodo',
    'globalsign',
    'godaddy',
    'amazon',
    'entrust',
    'verisign',
    'thawte',
    'rapidssl',
    'geotrust'
  ];
  
  if (certInfo.issuer && certInfo.issuer.toLowerCase) {
    const issuerLower = certInfo.issuer.toLowerCase();
    return trustedCAs.some(ca => issuerLower.includes(ca));
  }
  
  // Default to trusted if no negative indicators
  return true;
};

/**
 * Get description for a specific SSL grade
 * 
 * @param {string} grade - SSL grade (A+, A, A-, B+, B, etc.)
 * @returns {string} Human-readable description of the grade
 */
export const getSSLGradeDescription = (grade) => {
  if (!grade) return 'No grade available';
  
  const gradeMap = {
    'A+': 'Exceptional - Exceptional configuration with perfect security settings and future-proof encryption',
    'A': 'Excellent - Excellent configuration with strong security settings and protocols',
    'A-': 'Very Good - Very good configuration with minor improvements possible',
    'B+': 'Good+ - Good configuration but with some recommended improvements',
    'B': 'Good - Reasonably secure configuration but with several improvements recommended',
    'B-': 'Above Average - Above average configuration but with significant improvements needed',
    'C+': 'Average+ - Average configuration with many recommended security improvements',
    'C': 'Average - Average configuration with multiple security improvements needed',
    'C-': 'Below Average - Below average configuration with significant security concerns',
    'D+': 'Poor+ - Poor configuration with many security issues that need addressing',
    'D': 'Poor - Poor configuration with critical security improvements needed',
    'D-': 'Very Poor - Very poor configuration with numerous critical security concerns',
    'E+': 'Bad+ - Bad configuration with serious security vulnerabilities',
    'E': 'Bad - Bad configuration with severe security vulnerabilities',
    'E-': 'Very Bad - Very bad configuration with critical security vulnerabilities',
    'F': 'Failing - Failing configuration with major security vulnerabilities'
  };
  
  return gradeMap[grade] || `Grade ${grade} - No specific description available`;
};

/**
 * Parse and format certificate chain information
 * 
 * @param {Array} certChain - Certificate chain array
 * @returns {Array} Formatted certificate chain with extracted key details
 */
export const formatCertificateChain = (certChain) => {
  if (!certChain || !Array.isArray(certChain)) return [];
  
  try {
    return certChain.map((cert, index) => {
      return {
        position: index,
        subject: cert.subject || 'Unknown',
        issuer: cert.issuer || 'Unknown',
        validFrom: formatCertificateDate(cert.validFrom || cert.notBefore),
        validTo: formatCertificateDate(cert.validTo || cert.notAfter),
        daysRemaining: calculateDaysUntilExpiration(cert.validTo || cert.notAfter),
        serialNumber: cert.serialNumber || 'Unknown',
        fingerprint: cert.fingerprint || cert.thumbprint || 'Unknown',
        keySize: cert.keySize || cert.publicKeySize || 'Unknown',
        signatureAlgorithm: cert.signatureAlgorithm || 'Unknown'
      };
    });
  } catch (error) {
    console.error('Error formatting certificate chain:', error);
    return [];
  }
};

/**
 * Generate a human-readable security summary based on SSL results
 * 
 * @param {Object} results - SSL analysis results
 * @returns {Object} Summary with status, issues array, and recommendations array
 */
export const generateSecuritySummary = (results) => {
  if (!results) {
    return {
      status: 'unknown',
      issues: ['No SSL data available'],
      recommendations: ['Complete an SSL scan to view recommendations']
    };
  }
  
  try {
    const issues = [];
    const recommendations = [];
    let status = 'secure'; // Start with secure and downgrade if issues found
    
    // Check certificate validity
    if (results.valid === false) {
      issues.push('Invalid SSL certificate');
      recommendations.push('Install a valid SSL certificate from a trusted provider');
      status = 'critical';
    }
    
    // Check expiration
    const daysLeft = calculateDaysUntilExpiration(results.expiration);
    if (daysLeft !== null) {
      if (daysLeft < 0) {
        issues.push('SSL certificate has expired');
        recommendations.push('Renew your SSL certificate immediately');
        status = 'critical';
      } else if (daysLeft < 30) {
        issues.push(`SSL certificate expires in ${daysLeft} days`);
        recommendations.push('Renew your SSL certificate soon');
        status = status === 'secure' ? 'warning' : status;
      }
    }
    
    // Check grade
    if (results.grade) {
      const grade = results.grade.charAt(0);
      if (grade === 'F' || grade === 'E') {
        issues.push(`Poor SSL grade: ${results.grade}`);
        recommendations.push('Upgrade your SSL configuration to improve security grade');
        status = status === 'critical' ? 'critical' : 'danger';
      } else if (grade === 'D' || grade === 'C') {
        issues.push(`Below average SSL grade: ${results.grade}`);
        recommendations.push('Improve SSL configuration to achieve grade B or higher');
        status = status === 'secure' ? 'warning' : status;
      } else if (grade === 'B') {
        recommendations.push('Consider improvements to achieve grade A');
      }
    }
    
    // Check protocol version
    if (results.protocol) {
      const protocol = results.protocol.toUpperCase();
      if (protocol.includes('SSL 2.0') || protocol.includes('SSL 3.0')) {
        issues.push('Outdated SSL protocol version detected');
        recommendations.push('Update to TLS 1.2 or higher');
        status = status === 'critical' ? 'critical' : 'danger';
      } else if (protocol.includes('TLS 1.0') || protocol.includes('TLS 1.1')) {
        issues.push('Outdated TLS protocol version detected');
        recommendations.push('Update to TLS 1.2 or TLS 1.3');
        status = status === 'secure' ? 'warning' : status;
      }
    }
    
    // Check key size
    if (results.keySize) {
      const keySize = typeof results.keySize === 'number' 
        ? results.keySize 
        : parseInt(results.keySize);
        
      if (!isNaN(keySize) && keySize < 2048) {
        issues.push('Weak key size detected');
        recommendations.push('Use a key size of at least 2048 bits');
        status = status === 'secure' ? 'warning' : status;
      }
    }
    
    // Check for important security headers
    if (results.securityHeaders) {
      const headers = results.securityHeaders;
      const importantHeaders = {
        'Strict-Transport-Security': 'Implement HTTP Strict Transport Security (HSTS)',
        'Content-Security-Policy': 'Add Content Security Policy header',
        'X-Content-Type-Options': 'Add X-Content-Type-Options: nosniff header',
        'X-Frame-Options': 'Add X-Frame-Options header to prevent clickjacking'
      };
      
      for (const [header, recommendation] of Object.entries(importantHeaders)) {
        if (!headers[header]) {
          issues.push(`Missing ${header} header`);
          recommendations.push(recommendation);
        }
      }
      
      if (issues.length > 0) {
        status = status === 'secure' ? 'warning' : status;
      }
    }
    
    // Check vulnerabilities
    if (results.vulnerabilities && results.vulnerabilities.length > 0) {
      const categorized = categorizeVulnerabilities(results.vulnerabilities);
      
      if (categorized.critical.length > 0) {
        issues.push(`${categorized.critical.length} critical vulnerabilities detected`);
        status = 'critical';
      }
      
      if (categorized.high.length > 0) {
        issues.push(`${categorized.high.length} high severity vulnerabilities detected`);
        status = status === 'critical' ? 'critical' : 'danger';
      }
      
      if (categorized.medium.length > 0 || categorized.low.length > 0) {
        const count = categorized.medium.length + categorized.low.length;
        issues.push(`${count} medium/low severity vulnerabilities detected`);
        status = status === 'secure' ? 'warning' : status;
      }
      
      recommendations.push('Address identified vulnerabilities to improve security');
    }
    
    // If no issues but valid certificate
    if (issues.length === 0 && results.valid === true) {
      issues.push('No immediate SSL issues detected');
    }
    
    // If no specific recommendations
    if (recommendations.length === 0) {
      if (results.grade !== 'A+') {
        recommendations.push('Follow best practices to maintain excellent SSL security');
      } else {
        recommendations.push('Maintain current excellent SSL configuration');
      }
    }
    
    return {
      status,
      issues,
      recommendations
    };
  } catch (error) {
    console.error('Error generating security summary:', error);
    return {
      status: 'error',
      issues: ['Error analyzing SSL data'],
      recommendations: ['Try scanning again or contact support']
    };
  }
};

// COPILOT: Additional helper functions you might need

/**
 * Compare two SSL results and highlight differences
 * 
 * @param {Object} resultsA - First SSL analysis results
 * @param {Object} resultsB - Second SSL analysis results
 * @returns {Object} Differences with highlighting of better/worse values
 */
export const compareSSLResults = (resultsA, resultsB) => {
  if (!resultsA || !resultsB) return {};
  
  const differences = {};
  
  // Define comparison fields and their comparison logic
  const comparisonFields = [
    {
      field: 'grade',
      label: 'SSL Grade',
      compare: (a, b) => {
        const grades = ['F', 'E-', 'E', 'E+', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'];
        return grades.indexOf(a) - grades.indexOf(b);
      }
    },
    {
      field: 'protocol',
      label: 'Protocol Version',
      compare: (a, b) => {
        const ranks = { 'TLS 1.3': 5, 'TLS 1.2': 4, 'TLS 1.1': 2, 'TLS 1.0': 1, 'SSL 3.0': 0, 'SSL 2.0': -1 };
        const rankA = ranks[a] || -2;
        const rankB = ranks[b] || -2;
        return rankA - rankB;
      }
    },
    {
      field: 'keySize',
      label: 'Key Size',
      compare: (a, b) => parseInt(a) - parseInt(b)
    },
    {
      field: 'valid',
      label: 'Certificate Valid',
      compare: (a, b) => (a === b) ? 0 : (a ? 1 : -1)
    }
  ];
  
  // Compare each field
  comparisonFields.forEach(({ field, label, compare }) => {
    if (resultsA[field] !== undefined && resultsB[field] !== undefined) {
      const comparisonResult = compare(resultsA[field], resultsB[field]);
      
      differences[field] = {
        label,
        valueA: resultsA[field],
        valueB: resultsB[field],
        difference: comparisonResult,
        better: comparisonResult > 0 ? 'A' : comparisonResult < 0 ? 'B' : null
      };
    }
  });
  
  return differences;
};

/**
 * Parse certificate details from PEM format
 * 
 * @param {string} pemCertificate - Certificate in PEM format
 * @returns {Object|null} Parsed certificate details or null if invalid
 */
export const parsePEMCertificate = (pemCertificate) => {
  if (!pemCertificate) return null;
  
  try {
    // Note: This is a placeholder. In a real implementation,
    // you would use a library like forge or a backend API
    // to parse the certificate details from PEM format
    
    // Mock implementation for demonstration
    const lines = pemCertificate.split('\n');
    const subjectLine = lines.find(l => l.includes('Subject:'));
    const issuerLine = lines.find(l => l.includes('Issuer:'));
    const validFromLine = lines.find(l => l.includes('Not Before:'));
    const validToLine = lines.find(l => l.includes('Not After:'));
    
    return {
      subject: subjectLine ? subjectLine.split('Subject:')[1].trim() : 'Unknown',
      issuer: issuerLine ? issuerLine.split('Issuer:')[1].trim() : 'Unknown',
      validFrom: validFromLine ? new Date(validFromLine.split('Not Before:')[1].trim()) : null,
      validTo: validToLine ? new Date(validToLine.split('Not After:')[1].trim()) : null,
      raw: pemCertificate
    };
  } catch (error) {
    console.error('Error parsing PEM certificate:', error);
    return null;
  }
};

/**
 * Format security headers for display
 * 
 * @param {Object} headers - Security headers object
 * @returns {Array} Formatted headers with name, value, and description
 */
export const formatSecurityHeaders = (headers) => {
  if (!headers || typeof headers !== 'object') return [];
  
  // Define header descriptions
  const headerDescriptions = {
    'Strict-Transport-Security': 'Forces browsers to use HTTPS for the site',
    'Content-Security-Policy': 'Controls resources the browser is allowed to load',
    'X-Content-Type-Options': 'Prevents browsers from MIME-sniffing a response',
    'X-Frame-Options': 'Protects against clickjacking by controlling framing',
    'X-XSS-Protection': 'Enables cross-site scripting filters in browsers',
    'Referrer-Policy': 'Controls information sent in the Referer header',
    'Permissions-Policy': 'Controls browser features and APIs that can be used',
    'Cross-Origin-Embedder-Policy': 'Controls resource embedding across origins',
    'Cross-Origin-Opener-Policy': 'Controls cross-origin window interactions',
    'Cross-Origin-Resource-Policy': 'Controls cross-origin resource loading'
  };
  
  return Object.entries(headers).map(([name, value]) => ({
    name,
    value,
    description: headerDescriptions[name] || 'Security header'
  }));
};

/**
 * Get color class based on remaining certificate days
 * 
 * @param {number} daysRemaining - Days remaining until expiration
 * @returns {object} Object with text and background color classes
 */
export const getExpirationColorClass = (daysRemaining) => {
  if (daysRemaining === null || daysRemaining === undefined) {
    return { text: 'text-gray-500', bg: 'bg-gray-100' };
  }
  
  if (daysRemaining < 0) {
    return { text: 'text-red-800', bg: 'bg-red-100' }; // Expired
  }
  
  if (daysRemaining < 7) {
    return { text: 'text-red-800', bg: 'bg-red-100' }; // Imminent expiration
  }
  
  if (daysRemaining < 30) {
    return { text: 'text-orange-800', bg: 'bg-orange-100' }; // Expiring soon
  }
  
  if (daysRemaining < 90) {
    return { text: 'text-yellow-800', bg: 'bg-yellow-100' }; // Moderate time left
  }
  
  return { text: 'text-green-800', bg: 'bg-green-100' }; // Plenty of time
};

/**
 * Format expiration time remaining in human-readable format
 * 
 * @param {number} daysRemaining - Days remaining until expiration
 * @returns {string} Human-readable time description
 */
export const formatExpirationTime = (daysRemaining) => {
  if (daysRemaining === null || daysRemaining === undefined) {
    return 'Unknown';
  }
  
  if (daysRemaining < 0) {
    return `Expired ${Math.abs(daysRemaining)} days ago`;
  }
  
  if (daysRemaining === 0) {
    return 'Expires today';
  }
  
  if (daysRemaining === 1) {
    return 'Expires tomorrow';
  }
  
  if (daysRemaining < 30) {
    return `Expires in ${daysRemaining} days`;
  }
  
  const months = Math.floor(daysRemaining / 30);
  const remainingDays = daysRemaining % 30;
  
  if (months === 1) {
    return remainingDays > 0 
      ? `Expires in 1 month, ${remainingDays} days` 
      : 'Expires in 1 month';
  }
  
  return remainingDays > 0 
    ? `Expires in ${months} months, ${remainingDays} days` 
    : `Expires in ${months} months`;
};