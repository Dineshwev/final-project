/**
 * 🎯 ASYNC SCAN ORCHESTRATOR WITH LIFECYCLE MANAGEMENT (DATABASE-BACKED)
 * 
 * Central orchestrator that manages scan execution using the database-backed lifecycle state machine.
 * Supports concurrent scans, real-time progress tracking, and partial success handling.
 * Maintains backward compatibility with the locked API contract.
 * 
 * Version: 3.0 (Database Integration)
 * Last Modified: December 13, 2025
 */

import { analyzeDuplicateContent } from './duplicateContent.service.js';
import { analyzeAccessibility } from './accessibility.service.js';
import { analyzeBacklinks } from './backlinks.service.js';
import { analyzeSchema } from './schema.service.js';
import { analyzeMultiLanguage } from './multiLanguage.service.js';
import { analyzeRankTracker } from './rankTracker.service.js';

import { 
  initializeScan,
  startScan,
  updateServiceStatus,
  getScanStatus,
  prepareScanForRetry,
  getRetryStatus,
  ScanStatus
} from './scanLifecycle.service.js';

import { 
  isServiceAllowed,
  getAllowedServices,
  getRestrictedServices,
  createPlanError
} from './planEnforcement.service.js';

import {
  getCachedScan,
  cacheScanResult
} from './cache.service.js';

import {
  logScanStarted,
  logScanCompleted,
  logScanFailed,
  logServiceStarted,
  logServiceCompleted,
  logServiceFailed,
  logServiceRetry,
  logCacheHit,
  logCacheMiss,
  logCacheWrite,
  ExecutionTimer,
  createScanContext
} from './observability.service.js';

import securityService from './security.service.js';
import timeoutService from './timeout.service.js';

import { SERVICE_NAMES } from '../utils/responseContract.js';

/**
 * 🎯 SERVICE EXECUTION MAPPING
 * Maps service names to their execution functions
 */
const SERVICE_FUNCTIONS = {
  [SERVICE_NAMES.DUPLICATE_CONTENT]: analyzeDuplicateContent,
  [SERVICE_NAMES.ACCESSIBILITY]: analyzeAccessibility,
  [SERVICE_NAMES.BACKLINKS]: analyzeBacklinks,
  [SERVICE_NAMES.SCHEMA]: analyzeSchema,
  [SERVICE_NAMES.MULTI_LANGUAGE]: analyzeMultiLanguage,
  [SERVICE_NAMES.RANK_TRACKER]: analyzeRankTracker
};

/**
 * ⚡ HARDENED SERVICE EXECUTOR WITH ISOLATION
 * Executes a single service with proper security, timeouts, and error isolation
 */
const executeServiceWithLifecycle = async (scanId, serviceName, serviceFunction, url, keywords) => {
  const timer = new ExecutionTimer();
  
  try {
    // 📊 Log service started
    logServiceStarted(scanId, serviceName);
    
    // Mark service as running (async)
    await updateServiceStatus(scanId, serviceName, "running");
    
    console.log(`📊 Executing ${serviceName} for scan ${scanId}`);
    
    // Execute service with timeout and error isolation
    const serviceResult = await timeoutService.executeService(
      () => serviceFunction(url, keywords),
      serviceName,
      { timer, scanId }
    );
    
    if (serviceResult.success) {
      // Mark service as successful (async)
      await updateServiceStatus(scanId, serviceName, "success", serviceResult.data);
      
      // 📊 Log service completion
      await logServiceCompleted(scanId, serviceName, serviceResult.executionTime, serviceResult.data);
      
      return {
        status: 'success',
        data: serviceResult.data,
        executionTime: serviceResult.executionTime
      };
    } else {
      // Handle service failure
      await updateServiceStatus(scanId, serviceName, "failed", null, serviceResult.error);
      
      // 📊 Log service failure
      await logServiceFailed(scanId, serviceName, serviceResult.executionTime, new Error(serviceResult.error), 0);
      
      return {
        status: 'failed',
        error: serviceResult.error,
        executionTime: serviceResult.executionTime,
        timedOut: serviceResult.timedOut
      };
    }
  } catch (error) {
    const executionTime = timer.stop();
    
    // Ensure service failure is recorded
    try {
      await updateServiceStatus(scanId, serviceName, "failed", null, error.message);
      await logServiceFailed(scanId, serviceName, executionTime, error, 0);
    } catch (dbError) {
      console.error(`Failed to update service status for ${serviceName}:`, dbError);
    }
    
    return {
      status: 'failed',
      error: error.message,
      executionTime,
      isolated: true // Service failure was isolated
    };
  }
};
    await logServiceCompleted(scanId, serviceName, executionTime, result);
    
    console.log(`✅ ${serviceName} completed successfully for scan ${scanId} (${executionTime}ms)`);
    
  } catch (error) {
    const executionTime = timer.stop();
    
    // Mark service as failed (async)
    await updateServiceStatus(scanId, serviceName, "failed", error);
    
    // 📊 Log service failure
    await logServiceFailed(scanId, serviceName, executionTime, error);
    
    console.error(`❌ ${serviceName} failed for scan ${scanId}:`, error.message);
  }
};

/**
 * 🚀 HARDENED ASYNC SCAN ORCHESTRATOR
 * 
 * Starts a scan asynchronously with comprehensive security, timeout controls, and failure containment.
 * Validates input, enforces plan restrictions, implements caching, and ensures scan isolation.
 * Returns immediately with scan ID for polling.
 * 
 * @param {Object} params - Scan parameters
 * @param {string} params.url - The URL to analyze
 * @param {string[]} [params.keywords] - Optional keywords for rank analysis
 * @param {string} [params.scanId] - Optional scan ID (auto-generated if not provided)
 * @param {Object} [params.userContext] - User context for plan enforcement
 * @param {boolean} [params.bypassCache] - Force fresh scan (for retries)
 * @returns {Object} Initial scan response with scanId for polling
 */
export const startAsyncScan = async ({ url, keywords = [], scanId = null, userContext = null, bypassCache = false }) => {
  const scanTimer = new ExecutionTimer();
  const planType = userContext?.type || 'GUEST';
  const finalScanId = scanId || `scan_${Date.now()}`;
  
  try {
    console.log(`🚀 Starting hardened SEO scan for: ${url} (Plan: ${planType})`);
    
    // 🔒 SECURITY: Validate URL before processing
    const urlValidation = securityService.validateUrl(url);
    if (!urlValidation.isValid) {
      console.error(`❌ URL validation failed: ${urlValidation.error}`);
      throw new Error(`Invalid URL: ${urlValidation.error}`);
    }
    
    // Use sanitized URL for all processing
    const sanitizedUrl = urlValidation.sanitizedUrl;
    
    // 📊 Log scan started
    logScanStarted(finalScanId, userContext, sanitizedUrl);
    
    // Determine which services would be enabled for this plan
    const { allowedServices } = getServicesForPlan(userContext);
    
    // 🚀 CACHE LOOKUP (unless bypassing cache for retries)
    if (!bypassCache) {
      const cachedResult = await getCachedScan(sanitizedUrl, allowedServices, planType);
      
      if (cachedResult) {
        // 📊 Log cache hit
        logCacheHit(cachedResult.id, cachedResult.cacheKey, planType);
        
        console.log(`✅ Cache hit! Returning cached scan ${cachedResult.id}`);
        
        // Return cached result formatted for API contract
        return {
          scanId: cachedResult.id,
          url: cachedResult.url,
          status: cachedResult.status,
          startedAt: cachedResult.started_at,
          completedAt: cachedResult.completed_at,
          fromCache: true,
          cacheKey: cachedResult.cacheKey,
          cachedAt: cachedResult.cachedAt,
          plan: {
            type: planType,
            allowedServices: allowedServices.length,
            restrictedServices: getRestrictedServices(userContext).length
          }
        };
      } else {
        // 📊 Log cache miss
        logCacheMiss(sanitizedUrl + '|' + allowedServices.join(','), planType);
      }
    }
    
    // 🆕 FRESH SCAN - No cache hit or cache bypassed
    console.log('💨 Cache miss or bypassed - creating fresh scan');
    
    // Initialize scan with lifecycle management (async)
    const scanInit = await initializeScan(sanitizedUrl);
    const actualScanId = scanId || scanInit.scanId;
    
    // Start the scan (transition to RUNNING state) (async)
    await startScan(actualScanId);
    
    // Determine which services to execute based on plan
    const { restrictedServices } = getServicesForPlan(userContext);
    
    // 🔒 EXECUTE SCAN WITH GLOBAL TIMEOUT AND ISOLATION
    const scanExecution = async () => {
      try {
        // Execute allowed services concurrently in the background
        const servicePromises = allowedServices.map(serviceName => {
          const serviceFunction = SERVICE_FUNCTIONS[serviceName];
          return executeServiceWithLifecycle(
            actualScanId,
            serviceName,
            serviceFunction,
            sanitizedUrl,
            keywords
          );
        });
        
        // Mark restricted services as failed with plan restriction error
        const restrictionPromises = restrictedServices.map(serviceName => 
          markServiceAsRestricted(actualScanId, serviceName, userContext?.type || 'GUEST')
        );
        
        // Execute all operations with Promise.allSettled for isolation
        const allPromises = [...servicePromises, ...restrictionPromises];
        
        // Wait for all services to complete (or fail individually)
        const results = await Promise.allSettled(allPromises);
        
        // Process results and determine final scan status
        const successCount = results.filter(r => r.status === 'fulfilled' && r.value?.status === 'success').length;
        const failureCount = results.filter(r => r.status === 'rejected' || r.value?.status === 'failed').length;
        
        const finalStatus = successCount > 0 ? 'completed' : 'failed';
        
        console.log(`📊 Scan ${actualScanId} completed: ${successCount} success, ${failureCount} failed`);
        
        return { status: finalStatus, successCount, failureCount };
        
      } catch (error) {
        console.error(`❌ Scan execution failed for ${actualScanId}:`, error);
        throw error;
      }
    };
    
    // Execute scan with global timeout
    timeoutService.executeScan(scanExecution, actualScanId, 120000)
      .then(async (scanResult) => {
        const scanContext = createScanContext(actualScanId, userContext, sanitizedUrl, scanResult.status, scanTimer.elapsed());
        
        if (scanResult.success) {
          await logScanCompleted(scanContext);
        } else {
          await logScanFailed(actualScanId, userContext, sanitizedUrl, new Error('Scan timeout or failure'));
        }
      })
      .catch(async (error) => {
        console.error(`❌ Scan ${actualScanId} failed:`, error);
        await logScanFailed(actualScanId, userContext, sanitizedUrl, error);
      });
    
    // Return scan info immediately for polling
    return {
      scanId: actualScanId,
      url: sanitizedUrl,
      status: "running",
      startedAt: new Date().toISOString(),
      fromCache: false,
      plan: {
        type: planType,
        allowedServices: allowedServices.length,
        restrictedServices: restrictedServices.length
      }
    };
    
  } catch (error) {
    const executionTime = scanTimer.stop();
    
    // 📊 Log scan failure
    await logScanFailed(finalScanId, userContext, url, error);
    
    console.error(`❌ Scan startup failed:`, error.message);
    
    // Return error response that doesn't break the API contract
    throw {
      scanId: finalScanId,
      error: error.message,
      status: "failed",
      executionTime,
      securityRejected: error.message.includes('Invalid URL')
    };
  }
};
    
    // Fire and forget - let services execute in background
    Promise.allSettled(allPromises).then(async () => {
      const totalExecutionTime = scanTimer.stop();
      
      console.log(`🎯 All services processed for scan ${finalScanId} (${allowedServices.length} executed, ${restrictedServices.length} restricted)`);
      
      // 📊 Log scan completion with metrics
      const scanContext = createScanContext(
        finalScanId, 
        userContext, 
        url, 
        'completed',
        scanTimer.startTime,
        {
          servicesExecuted: allowedServices.length,
          servicesFailed: restrictedServices.length,
          cached: false
        }
      );
      await logScanCompleted(scanContext);
      
      // 💾 CACHE THE RESULT after scan completion
      try {
        const cacheSuccess = await cacheScanResult(finalScanId, url, allowedServices, planType);
        if (cacheSuccess) {
          // 📊 Log cache write
          const ttlHours = { GUEST: 6, FREE: 12, PRO: 24 };
          logCacheWrite(finalScanId, url + '|' + allowedServices.join(','), ttlHours[planType]);
        }
      } catch (error) {
        console.error('🚨 Cache write failed:', error.message);
        // Don't fail the scan if caching fails
      }
    }).catch(async (error) => {
      console.error(`🚨 Error in service execution for scan ${finalScanId}:`, error);
      
      // 📊 Log scan failure
      await logScanFailed(finalScanId, userContext, url, error);
    });
    
    // Return immediate response with scan details for polling
    return {
      scanId: finalScanId,
      url,
      status: ScanStatus.RUNNING,
      startedAt: scanInit.startedAt,
      fromCache: false,
      plan: {
        type: planType,
        allowedServices: allowedServices.length,
        restrictedServices: restrictedServices.length
      }
    };
  } catch (error) {
    console.error('🚨 Failed to start async scan:', error);
    
    // 📊 Log scan startup failure
    await logScanFailed(scanId || 'unknown', userContext, url, error);
    
    throw error;
  }
};

/**
 * 🎯 PLAN-BASED SERVICE FILTERING
 */

/**
 * Get allowed and restricted services based on user plan
 */
function getServicesForPlan(userContext) {
  const planType = userContext?.type || 'GUEST';
  
  const allowedServices = getAllowedServices(planType);
  const restrictedServices = getRestrictedServices(planType);
  
  // Filter to only include services we actually have functions for
  const availableServices = Object.keys(SERVICE_FUNCTIONS);
  
  return {
    allowedServices: allowedServices.filter(service => availableServices.includes(service)),
    restrictedServices: restrictedServices.filter(service => availableServices.includes(service))
  };
}

/**
 * Mark a service as restricted due to plan limitations
 */
async function markServiceAsRestricted(scanId, serviceName, planType) {
  try {
    const restrictionError = createPlanError('SERVICE_RESTRICTED', {
      serviceName,
      planType,
      message: `Service '${serviceName}' requires a premium plan. Current plan: ${planType}`
    });
    
    await updateServiceStatus(scanId, serviceName, 'failed', {
      error: {
        ...restrictionError,
        retryable: false // Plan restrictions are not retryable
      },
      executionTimeMs: 0
    });
    
    console.log(`🚫 Service ${serviceName} restricted for plan ${planType} in scan ${scanId}`);
    
  } catch (error) {
    console.error(`❌ Error marking service ${serviceName} as restricted:`, error);
  }
}

/**
 * 🔍 GET SCAN RESULTS (POLLING ENDPOINT)
 * 
 * Returns current scan state including partial results.
 * Supports real-time progress tracking.
 */
export const getScanResults = async (scanId) => {
  try {
    const scanStatus = await getScanStatus(scanId);
    
    if (!scanStatus) {
      return null;
    }
    
    return scanStatus;
    
  } catch (error) {
    console.error(`🚨 Error retrieving scan results for ${scanId}:`, error);
    throw error;
  }
};

/**
 * 🔒 BACKWARD COMPATIBLE SYNC SCAN
 * 
 * Maintains compatibility with existing frontend by waiting for all services
 * to complete before returning. Uses lifecycle management internally.
 * 
 * @param {Object} params - Scan parameters  
 * @param {string} params.url - The URL to analyze
 * @param {string[]} [params.keywords] - Optional keywords for rank analysis
 * @param {string} [params.scanId] - Optional scan ID (auto-generated if not provided)
 * @returns {Promise<Object>} Complete scan response matching locked contract
 */
export const runFullSeoScan = async ({ url, keywords = [], scanId = null }) => {
  try {
    console.log(`🔄 Running sync SEO scan for: ${url} (backward compatibility mode)`);
    
    // Start async scan
    const asyncResponse = await startAsyncScan({ url, keywords, scanId });
    const finalScanId = asyncResponse.scanId;
    
    // Poll until scan is complete
    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(async () => {
        try {
          const results = await getScanResults(finalScanId);
          
          if (!results) {
            clearInterval(pollInterval);
            reject(new Error('Scan not found'));
            return;
          }
          
          // Check if scan is complete
          if ([ScanStatus.COMPLETED, ScanStatus.PARTIAL, ScanStatus.FAILED].includes(results.status)) {
            clearInterval(pollInterval);
            resolve(results);
          }
          
        } catch (error) {
          clearInterval(pollInterval);
          reject(error);
        }
      }, 500); // Poll every 500ms
      
      // Timeout after 60 seconds
      setTimeout(() => {
        clearInterval(pollInterval);
        reject(new Error('Scan timeout'));
      }, 60000);
    });
    
  } catch (error) {
    console.error('🚨 Sync scan failed:', error);
    throw error;
  }
};

/**
 * 📊 GET SCAN PROGRESS
 * Lightweight endpoint to get just progress information
 */
export const getScanProgress = async (scanId) => {
  try {
    const scanStatus = await getScanStatus(scanId);
    
    if (!scanStatus) {
      return null;
    }
    
    return {
      scanId,
      status: scanStatus.status,
      progress: scanStatus.progress
    };
    
  } catch (error) {
    console.error(`🚨 Error retrieving scan progress for ${scanId}:`, error);
    throw error;
  }
};

/**
 * 🔁 RETRY ORCHESTRATOR
 * 
 * Retries failed services for a specific scan without affecting successful services.
 * Supports both selective and full failed service retry.
 * 
 * @param {string} scanId - The scan ID to retry services for
 * @param {string[]} [servicesToRetry] - Optional array of specific services to retry
 * @param {string} url - URL being scanned (for service execution)
 * @param {string[]} [keywords] - Optional keywords for rank analysis
 * @returns {Promise<Object>} Retry operation result
 */
export const retryFailedServices = async (scanId, servicesToRetry = null, url = null, keywords = []) => {
  try {
    console.log(`🔄 Starting retry for scan ${scanId}${servicesToRetry ? ` (services: ${servicesToRetry.join(', ')})` : ' (all failed services)'}`);
    
    // 📊 Log retry attempt
    if (servicesToRetry) {
      servicesToRetry.forEach(serviceName => {
        logServiceRetry(scanId, serviceName, 1, 'Manual retry requested');
      });
    }
    
    // Get current scan status to extract URL if not provided
    const currentScanStatus = getScanStatus(scanId);
    if (!currentScanStatus) {
      throw new Error(`Scan ${scanId} not found`);
    }
    
    const scanUrl = url || currentScanStatus.url;
    if (!scanUrl) {
      throw new Error('URL required for service retry');
    }

    // Prepare scan for retry (async)
    const retryPreparation = await prepareScanForRetry(scanId, servicesToRetry);
    const { resetServices } = retryPreparation;

    if (resetServices.length === 0) {
      return {
        success: false,
        error: 'No services were eligible for retry',
        scanId,
        retriedServices: []
      };
    }

    console.log(`🔄 Retrying ${resetServices.length} services for scan ${scanId}: ${resetServices.join(', ')}`);

    // Execute only the reset services concurrently
    const retryPromises = resetServices.map(serviceName => {
      const serviceFunction = SERVICE_FUNCTIONS[serviceName];
      if (!serviceFunction) {
        console.error(`❌ No service function found for ${serviceName}`);
        return Promise.resolve();
      }

      return executeServiceWithLifecycle(
        scanId,
        serviceName,
        serviceFunction,
        scanUrl,
        keywords
      );
    });

    // Execute all retry operations concurrently
    await Promise.allSettled(retryPromises);

    console.log(`🎯 Retry execution completed for scan ${scanId}`);

    return {
      success: true,
      scanId,
      retriedServices: resetServices,
      totalRetriedServices: resetServices.length,
      message: `Successfully initiated retry for ${resetServices.length} services`
    };

  } catch (error) {
    console.error(`🚨 Retry failed for scan ${scanId}:`, error);
    
    return {
      success: false,
      error: error.message,
      scanId,
      retriedServices: []
    };
  }
};

/**
 * 📋 GET RETRY INFORMATION
 * 
 * Returns information about which services can be retried for a given scan.
 * 
 * @param {string} scanId - The scan ID to check retry status for
 * @returns {Promise<Object>} Retry status information
 */
export const getRetryInformation = async (scanId) => {
  try {
    const retryStatus = await getRetryStatus(scanId);
    
    if (!retryStatus) {
      return null;
    }

    return retryStatus;

  } catch (error) {
    console.error(`🚨 Error retrieving retry information for ${scanId}:`, error);
    throw error;
  }
};