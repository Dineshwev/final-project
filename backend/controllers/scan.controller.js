// 🔒 LOCKED API CONTROLLER - MAINTAINS FRONTEND CONTRACT
// This controller enforces the standardized API response format
// DO NOT change response structure without versioning

import { 
  runFullSeoScan,
  startAsyncScan,
  getScanResults as getLifecycleScanResults,
  getScanProgress,
  retryFailedServices,
  getRetryInformation
} from '../services/asyncScanOrchestrator.service.js';
import { 
  buildScanResponse,
  SCAN_STATUS,
  createServiceError
} from '../utils/responseContract.js';
import { incrementUsage } from '../middleware/userContext.middleware.js';

// Temporary in-memory storage for scan results (legacy compatibility)
// 🔒 Stores standardized scan responses only
const scanResults = new Map();

// Generate a unique scan ID following the locked contract
const generateScanId = () => {
  return 'scan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export const scanWebsite = async (req, res) => {
  try {
    const { url, keywords = [] } = req.body;
    const { force } = req.query; // Add support for ?force=true to bypass cache
    const userContext = req.userContext; // Added by middleware
    
    // Validate URL is provided
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required',
        code: 'MISSING_URL'
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format',
        code: 'INVALID_URL'
      });
    }

    const scanId = generateScanId();
    const bypassCache = force === 'true'; // Allow cache bypass for forced rescans
    
    // 🚀 Start async scan with plan-aware service filtering and caching
    const asyncResponse = await startAsyncScan({ 
      url, 
      keywords, 
      scanId,
      userContext,
      bypassCache
    });

    // Track usage for plan enforcement (only for fresh scans, not cache hits)
    if (!asyncResponse.fromCache) {
      await incrementUsage(userContext, 'scan');
    }
    
    console.log(`📊 Scan ${asyncResponse.fromCache ? 'returned from cache' : 'started'} by ${userContext.type} user: ${asyncResponse.scanId} (${asyncResponse.plan?.allowedServices || 0} services)`);

    // Return immediate response with scan ID for polling
    res.json({
      success: true,
      data: {
        scanId: asyncResponse.scanId,
        status: asyncResponse.status,
        url: asyncResponse.url,
        startedAt: asyncResponse.startedAt,
        completedAt: asyncResponse.completedAt || null,
        fromCache: asyncResponse.fromCache || false,
        cachedAt: asyncResponse.cachedAt || null,
        cacheKey: asyncResponse.cacheKey || null,
        plan: asyncResponse.plan
      }
    });
  } catch (error) {
    console.error('🚨 Scan endpoint error:', error);
    
    // Return standardized error response
    res.status(500).json({
      success: false,
      error: 'Internal server error - scan failed to initialize',
      code: 'SCAN_INIT_ERROR'
    });
  }
};

// GET /api/scan/:scanId/results
// 🔒 LOCKED API ENDPOINT - Returns standardized scan response contract
export const getScanResults = async (req, res) => {
  try {
    const { scanId } = req.params;
    
    // Validate scan ID format
    if (!scanId || typeof scanId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid scan ID format',
        code: 'INVALID_SCAN_ID'
      });
    }

    // First check legacy storage for backward compatibility
    const storedScanResponse = scanResults.get(scanId);
    
    if (storedScanResponse) {
      // Return the stored scan response in locked contract format
      return res.json({
        success: true,
        data: storedScanResponse
      });
    }

    // Check lifecycle-managed scans
    const lifecycleScanResponse = await getLifecycleScanResults(scanId);
    
    if (!lifecycleScanResponse) {
      // Return standardized "not found" response using locked contract
      const notFoundResponse = buildScanResponse({
        status: SCAN_STATUS.PENDING,
        scanId,
        url: '',
        startedAt: new Date().toISOString(),
        completedAt: null,
        services: {}
      });

      return res.status(404).json({
        success: false,
        error: 'Scan not found - it may have expired or never existed',
        code: 'SCAN_NOT_FOUND',
        data: notFoundResponse
      });
    }

    // Return the lifecycle scan response in locked contract format
    res.json({
      success: true,
      data: lifecycleScanResponse
    });

  } catch (error) {
    console.error('🚨 Get results endpoint error:', error);
    
    // Return standardized error response
    res.status(500).json({
      success: false,
      error: 'Internal server error - failed to retrieve scan results',
      code: 'RESULTS_RETRIEVAL_ERROR'
    });
  }
};

// GET /api/scan/:scanId - Direct scan status endpoint (for polling)
// 🔄 NEW LIFECYCLE ENDPOINT - Supports real-time polling
export const getScanStatus = async (req, res) => {
  try {
    const { scanId } = req.params;
    
    // Validate scan ID format
    if (!scanId || typeof scanId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid scan ID format',
        code: 'INVALID_SCAN_ID'
      });
    }

    // Check lifecycle-managed scans
    const scanStatus = await getLifecycleScanResults(scanId);
    
    if (!scanStatus) {
      return res.status(404).json({
        success: false,
        error: 'Scan not found',
        code: 'SCAN_NOT_FOUND'
      });
    }

    // Return current scan status
    res.json({
      success: true,
      data: scanStatus
    });

  } catch (error) {
    console.error('🚨 Get scan status error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error - failed to retrieve scan status',
      code: 'SCAN_STATUS_ERROR'
    });
  }
};

// GET /api/scan/:scanId/progress - Lightweight progress endpoint
// 🔄 NEW LIFECYCLE ENDPOINT - Returns just progress info
export const getScanProgressEndpoint = async (req, res) => {
  try {
    const { scanId } = req.params;
    
    // Validate scan ID format
    if (!scanId || typeof scanId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid scan ID format',
        code: 'INVALID_SCAN_ID'
      });
    }

    // Get progress information
    const progressInfo = await getScanProgress(scanId);
    
    if (!progressInfo) {
      return res.status(404).json({
        success: false,
        error: 'Scan not found',
        code: 'SCAN_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: progressInfo
    });

  } catch (error) {
    console.error('🚨 Get scan progress error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error - failed to retrieve scan progress',
      code: 'SCAN_PROGRESS_ERROR'
    });
  }
};

// POST /api/scan/:scanId/retry - Retry failed services
// 🔁 NEW RETRY ENDPOINT - Retries only failed services
export const retryFailedServicesEndpoint = async (req, res) => {
  try {
    const { scanId } = req.params;
    const { services } = req.body || {};
    
    // Validate scan ID format
    if (!scanId || typeof scanId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid scan ID format',
        code: 'INVALID_SCAN_ID'
      });
    }

    // Validate services array if provided
    if (services !== undefined) {
      if (!Array.isArray(services)) {
        return res.status(400).json({
          success: false,
          error: 'Services must be an array',
          code: 'INVALID_SERVICES_FORMAT'
        });
      }
      
      if (services.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Services array cannot be empty',
          code: 'EMPTY_SERVICES_ARRAY'
        });
      }
      
      // Validate service names
      const validServiceNames = ['accessibility', 'duplicateContent', 'backlinks', 'schema', 'multiLanguage', 'rankTracker'];
      const invalidServices = services.filter(service => !validServiceNames.includes(service));
      
      if (invalidServices.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Invalid service names: ${invalidServices.join(', ')}`,
          code: 'INVALID_SERVICE_NAMES'
        });
      }
    }

    // Get current scan status to extract URL
    const currentScanStatus = await getLifecycleScanResults(scanId);
    if (!currentScanStatus) {
      return res.status(404).json({
        success: false,
        error: 'Scan not found',
        code: 'SCAN_NOT_FOUND'
      });
    }

    // Attempt to retry failed services
    const retryResult = await retryFailedServices(
      scanId, 
      services, // Can be null/undefined to retry all failed services
      currentScanStatus.data.url,
      [] // Empty keywords for now
    );

    if (!retryResult.success) {
      return res.status(400).json({
        success: false,
        error: retryResult.error,
        code: 'RETRY_FAILED'
      });
    }

    // Track retry usage for plan enforcement
    const userContext = req.userContext;
    await incrementUsage(userContext, 'retry');
    
    console.log(`🔄 Retry executed by ${userContext.type} user for scan ${scanId}`);

    // Return success response
    res.json({
      success: true,
      data: {
        scanId,
        retriedServices: retryResult.retriedServices,
        totalRetriedServices: retryResult.totalRetriedServices,
        message: retryResult.message
      }
    });

  } catch (error) {
    console.error('🚨 Retry endpoint error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error - failed to retry services',
      code: 'RETRY_INTERNAL_ERROR'
    });
  }
};

// GET /api/scan/:scanId/retry/status - Get retry information
// 🔍 NEW RETRY STATUS ENDPOINT - Returns retry eligibility info
export const getRetryStatusEndpoint = async (req, res) => {
  try {
    const { scanId } = req.params;
    
    // Validate scan ID format
    if (!scanId || typeof scanId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid scan ID format',
        code: 'INVALID_SCAN_ID'
      });
    }

    // Get retry information
    const retryInfo = await getRetryInformation(scanId);
    
    if (!retryInfo) {
      return res.status(404).json({
        success: false,
        error: 'Scan not found',
        code: 'SCAN_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: retryInfo
    });

  } catch (error) {
    console.error('🚨 Get retry status error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error - failed to retrieve retry status',
      code: 'RETRY_STATUS_ERROR'
    });
  }
};
