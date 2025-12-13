/**
 * 🔒 LOCKED API RESPONSE CONTRACT
 * 
 * This file defines the strict backend API response schema that MUST NOT be changed
 * without proper versioning. The frontend depends on this exact structure.
 * 
 * Version: 1.0
 * Last Modified: December 13, 2025
 * 
 * ⚠️ WARNING: Changing this contract will break frontend functionality
 */

/**
 * Service status enumeration
 */
export const SERVICE_STATUS = {
  SUCCESS: 'success',
  FAILED: 'failed',
  PENDING: 'pending'
};

/**
 * Overall scan status enumeration
 */
export const SCAN_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  PARTIAL: 'partial'
};

/**
 * Issue severity levels
 */
export const ISSUE_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Environment types
 */
export const ENVIRONMENT = {
  PRODUCTION: 'production',
  STAGING: 'staging',
  DEV: 'dev'
};

/**
 * Service names that must always be present in the services object
 */
export const SERVICE_NAMES = {
  ACCESSIBILITY: 'accessibility',
  DUPLICATE_CONTENT: 'duplicateContent',
  BACKLINKS: 'backlinks',
  SCHEMA: 'schema',
  MULTI_LANGUAGE: 'multiLanguage',
  RANK_TRACKER: 'rankTracker'
};

/**
 * Creates a normalized service result structure
 * @param {string} status - Service execution status
 * @param {number|null} score - Service score (0-100)
 * @param {object|null} data - Service-specific data
 * @param {array} issues - Array of issues found
 * @param {object|null} error - Error information if service failed
 * @param {number|null} executionTimeMs - Execution time in milliseconds
 */
export const createServiceResult = ({
  status = SERVICE_STATUS.PENDING,
  score = null,
  data = null,
  issues = [],
  error = null,
  executionTimeMs = null
}) => ({
  status,
  score,
  data,
  issues: issues || [],
  error,
  executionTimeMs
});

/**
 * Creates a normalized error object
 * @param {string} code - Error code (e.g., "ACCESSIBILITY_ERROR")
 * @param {string} message - Human-readable error message
 * @param {boolean} retryable - Whether the operation can be retried
 */
export const createServiceError = (code, message, retryable = true) => ({
  code,
  message,
  retryable
});

/**
 * Creates a normalized issue object
 * @param {string} type - Issue type identifier
 * @param {string} severity - Issue severity level
 * @param {string} message - Issue description
 * @param {string} recommendation - Suggested fix
 */
export const createIssue = (type, severity, message, recommendation) => ({
  type,
  severity,
  message,
  recommendation
});

/**
 * Creates progress information
 * @param {number} completedServices - Number of completed services
 * @param {number} totalServices - Total number of services
 */
export const createProgress = (completedServices, totalServices) => ({
  completedServices,
  totalServices,
  percentage: totalServices > 0 ? Math.round((completedServices / totalServices) * 100) : 0
});

/**
 * Creates meta information
 */
export const createMeta = () => ({
  version: "1.0",
  backend: "seo-health-checker",
  environment: process.env.NODE_ENV === 'production' ? ENVIRONMENT.PRODUCTION : ENVIRONMENT.DEV
});

/**
 * 🔒 LOCKED RESPONSE SCHEMA BUILDER
 * 
 * This function builds the standardized API response that the frontend expects.
 * Every field must always be present with the correct type.
 * 
 * @param {object} params - Response parameters
 * @param {string} params.status - Overall scan status
 * @param {string} params.scanId - Unique scan identifier
 * @param {string} params.url - Scanned URL
 * @param {string} params.startedAt - ISO timestamp when scan started
 * @param {string|null} params.completedAt - ISO timestamp when scan completed
 * @param {object} params.services - Service results keyed by service name
 * @returns {object} Standardized API response
 */
export const buildScanResponse = ({
  status = SCAN_STATUS.PENDING,
  scanId,
  url,
  startedAt,
  completedAt = null,
  services = {}
}) => {
  // Ensure all required services are present with default values
  const normalizedServices = {};
  
  Object.values(SERVICE_NAMES).forEach(serviceName => {
    normalizedServices[serviceName] = services[serviceName] || createServiceResult({});
  });

  // Calculate progress
  const completedServices = Object.values(normalizedServices)
    .filter(service => service.status === SERVICE_STATUS.SUCCESS || service.status === SERVICE_STATUS.FAILED)
    .length;
  const totalServices = Object.keys(normalizedServices).length;

  return {
    status,
    scanId,
    url,
    startedAt,
    completedAt,
    progress: createProgress(completedServices, totalServices),
    services: normalizedServices,
    meta: createMeta()
  };
};

/**
 * 🔧 SERVICE RESULT NORMALIZER
 * 
 * Converts raw service responses to the standardized format.
 * Handles errors gracefully and ensures consistent structure.
 * 
 * @param {string} serviceName - Name of the service
 * @param {object|Error} rawResult - Raw service result or error
 * @param {number} executionTimeMs - Service execution time
 * @returns {object} Normalized service result
 */
export const normalizeServiceResult = (serviceName, rawResult, executionTimeMs = null) => {
  try {
    // Handle error cases
    if (rawResult instanceof Error) {
      return createServiceResult({
        status: SERVICE_STATUS.FAILED,
        error: createServiceError(
          `${serviceName.toUpperCase()}_ERROR`,
          rawResult.message,
          true
        ),
        executionTimeMs
      });
    }

    // Handle service reporting an error status
    if (rawResult && rawResult.status === 'error') {
      return createServiceResult({
        status: SERVICE_STATUS.FAILED,
        error: createServiceError(
          `${serviceName.toUpperCase()}_ERROR`,
          rawResult.error || 'Service returned error status',
          true
        ),
        executionTimeMs
      });
    }

    // Handle successful service response
    if (rawResult && rawResult.status === 'success') {
      const issues = [];
      
      // Convert service-specific issues to standardized format
      if (rawResult.issues && Array.isArray(rawResult.issues)) {
        rawResult.issues.forEach(issue => {
          if (issue && typeof issue === 'object') {
            issues.push(createIssue(
              issue.type || 'unknown',
              issue.severity || ISSUE_SEVERITY.MEDIUM,
              issue.message || issue.description || 'Issue detected',
              issue.recommendation || 'Review and fix this issue'
            ));
          }
        });
      }

      return createServiceResult({
        status: SERVICE_STATUS.SUCCESS,
        score: typeof rawResult.score === 'number' ? rawResult.score : null,
        data: rawResult.data || rawResult,
        issues,
        executionTimeMs
      });
    }

    // Handle unexpected response format
    return createServiceResult({
      status: SERVICE_STATUS.FAILED,
      error: createServiceError(
        `${serviceName.toUpperCase()}_FORMAT_ERROR`,
        'Service returned unexpected response format',
        true
      ),
      executionTimeMs
    });

  } catch (error) {
    // Defensive programming - catch any normalization errors
    console.error(`Error normalizing ${serviceName} result:`, error);
    return createServiceResult({
      status: SERVICE_STATUS.FAILED,
      error: createServiceError(
        `${serviceName.toUpperCase()}_NORMALIZATION_ERROR`,
        'Failed to process service response',
        true
      ),
      executionTimeMs
    });
  }
};

/**
 * 🚀 EXAMPLE MOCK RESPONSE
 * 
 * This shows exactly what the API will return for every request.
 * Use this for frontend development and testing.
 */
export const createMockScanResponse = (scanId = 'scan_example', url = 'https://example.com') => {
  const startedAt = new Date().toISOString();
  const completedAt = new Date(Date.now() + 30000).toISOString(); // 30 seconds later

  const services = {
    [SERVICE_NAMES.ACCESSIBILITY]: createServiceResult({
      status: SERVICE_STATUS.SUCCESS,
      score: 85,
      data: { totalChecks: 15, passedChecks: 13 },
      issues: [
        createIssue('missing-alt-text', ISSUE_SEVERITY.MEDIUM, '2 images missing alt text', 'Add descriptive alt text to all images'),
      ],
      executionTimeMs: 1250
    }),
    [SERVICE_NAMES.DUPLICATE_CONTENT]: createServiceResult({
      status: SERVICE_STATUS.SUCCESS,
      score: 95,
      data: { duplicatePercentage: 5, uniqueContent: 95 },
      issues: [],
      executionTimeMs: 890
    }),
    [SERVICE_NAMES.BACKLINKS]: createServiceResult({
      status: SERVICE_STATUS.FAILED,
      error: createServiceError('BACKLINKS_API_ERROR', 'External API temporarily unavailable', true),
      executionTimeMs: 2100
    })
  };

  return buildScanResponse({
    status: SCAN_STATUS.PARTIAL,
    scanId,
    url,
    startedAt,
    completedAt,
    services
  });
};