/**
 * 🔄 SCAN LIFECYCLE STATE MACHINE (DATABASE-BACKED)
 * 
 * Implements comprehensive scan lifecycle management with:
 * - Database persistence as source of truth
 * - State machine with strict transitions
 * - Per-service execution tracking
 * - Progress calculation
 * - Concurrent scan support
 * - Error safety and partial success handling
 * 
 * Version: 2.0 - Database Integration
 * Last Modified: December 13, 2025
 */

import dbRepository from '../database/repository.js';
import { 
  SCAN_STATUS,
  SERVICE_STATUS,
  SERVICE_NAMES,
  buildScanResponse,
  normalizeServiceResult
} from '../utils/responseContract.js';

/**
 * 🔄 SCAN STATUS ENUM (STRICT)
 * Matches the locked API contract
 */
export const ScanStatus = {
  PENDING: "pending",
  RUNNING: "running", 
  COMPLETED: "completed",
  PARTIAL: "partial",
  FAILED: "failed"
};

/**
 * 🔄 VALID STATE TRANSITIONS (MANDATORY)
 */
const VALID_TRANSITIONS = {
  [ScanStatus.PENDING]: [ScanStatus.RUNNING, ScanStatus.FAILED],
  [ScanStatus.RUNNING]: [ScanStatus.COMPLETED, ScanStatus.PARTIAL, ScanStatus.FAILED],
  [ScanStatus.COMPLETED]: [ScanStatus.RUNNING], // Allow retry from completed (for edge cases)
  [ScanStatus.PARTIAL]: [ScanStatus.RUNNING],   // Allow retry from partial
  [ScanStatus.FAILED]: [ScanStatus.RUNNING]     // Allow retry from failed
};

/**
 * 🗃️ DATABASE-BACKED SCAN OPERATIONS
 */

/**
 * 1️⃣ INITIALIZE SCAN (DATABASE-BACKED)
 */
export const initializeScan = async (url) => {
  try {
    const scan = await dbRepository.createScan(url);
    console.log(`🚀 Initialized scan ${scan.id} for ${url} in database`);
    return {
      scanId: scan.id,
      url: scan.url,
      status: scan.status,
      startedAt: scan.started_at,
      progress: {
        completedServices: scan.progress_completed,
        totalServices: scan.progress_total,
        percentage: scan.progress_percentage
      }
    };
  } catch (error) {
    console.error(`❌ Failed to initialize scan for ${url}:`, error);
    throw error;
  }
};

/**
 * 2️⃣ START SCAN (DATABASE-BACKED)
 */
export const startScan = async (scanId) => {
  try {
    // Validate current status and transition to running
    const currentScan = await dbRepository.getScanById(scanId);
    if (!currentScan) {
      throw new Error(`Scan ${scanId} not found`);
    }

    // Validate transition
    const validTransitions = VALID_TRANSITIONS[currentScan.status];
    if (!validTransitions.includes(ScanStatus.RUNNING)) {
      throw new Error(`Invalid state transition from ${currentScan.status} to ${ScanStatus.RUNNING}`);
    }

    const updatedScan = await dbRepository.updateScanStatus(scanId, ScanStatus.RUNNING);
    console.log(`▶️ Started scan ${scanId} - status updated to running`);
    
    return updatedScan;
  } catch (error) {
    console.error(`❌ Failed to start scan ${scanId}:`, error);
    // Try to mark as failed in database
    try {
      await dbRepository.updateScanStatus(scanId, ScanStatus.FAILED);
    } catch (dbError) {
      console.error(`❌ Failed to mark scan ${scanId} as failed:`, dbError);
    }
    throw error;
  }
};

/**
 * 3️⃣ UPDATE SERVICE STATUS (DATABASE-BACKED)
 */
export const updateServiceStatus = async (scanId, serviceName, status, result = null) => {
  try {
    // First update the service status
    await dbRepository.updateServiceStatus(scanId, serviceName, status);
    
    // Then update with result data if provided
    if (result && (status === "success" || status === "failed")) {
      const resultData = {
        status,
        score: result.score || null,
        data: result.data || null,
        issues: result.issues || [],
        error: status === "failed" ? result : null,
        executionTimeMs: result.executionTimeMs || null
      };
      
      await dbRepository.updateServiceResult(scanId, serviceName, resultData);
    }

    // Get updated progress from database (automatically calculated by triggers)
    const scan = await dbRepository.getScanById(scanId);
    console.log(`📊 Scan ${scanId}: ${serviceName} → ${status} (Progress: ${scan.progress_percentage}%)`);

    return {
      scanId,
      serviceName,
      status,
      progress: {
        completedServices: scan.progress_completed,
        totalServices: scan.progress_total,
        percentage: scan.progress_percentage
      },
      scanStatus: scan.status
    };

  } catch (error) {
    console.error(`❌ Error updating service ${serviceName} for scan ${scanId}:`, error);
    throw error;
  }
};

/**
 * 🔍 GET SCAN STATUS (FOR POLLING) - DATABASE-BACKED
 */
export const getScanStatus = async (scanId) => {
  try {
    const scan = await dbRepository.getScanById(scanId);
    if (!scan) {
      return null;
    }

    const services = await dbRepository.getScanServices(scanId);
    
    // Transform database results to API contract format
    const serviceResults = {};
    services.forEach(service => {
      let serviceData = {
        status: mapServiceStatus(service.status),
        score: service.score,
        data: service.data ? JSON.parse(service.data) : null,
        issues: service.issues ? JSON.parse(service.issues) : [],
        error: service.error ? JSON.parse(service.error) : null,
        executionTimeMs: service.execution_time_ms
      };

      // Add retry metadata
      serviceData.retry = {
        attempts: service.retry_attempts,
        maxAttempts: service.max_retry_attempts,
        canRetry: service.status === 'failed' && service.retry_attempts < service.max_retry_attempts
      };

      serviceResults[service.service_name] = serviceData;
    });

    const scanResponse = buildScanResponse({
      status: scan.status,
      scanId: scan.id,
      url: scan.url,
      startedAt: scan.started_at.toISOString(),
      completedAt: scan.completed_at ? scan.completed_at.toISOString() : null,
      services: serviceResults
    });

    // Return in success envelope format to match API contract
    return {
      success: true,
      data: scanResponse
    };

  } catch (error) {
    console.error(`❌ Error getting scan status for ${scanId}:`, error);
    throw error;
  }
};

/**
 * 📋 GET ALL SCANS (FOR MONITORING) - DATABASE-BACKED
 */
export const getAllScans = async (limit = 50) => {
  try {
    return await dbRepository.getScanHistory(limit);
  } catch (error) {
    console.error(`❌ Error getting scan history:`, error);
    throw error;
  }
};

/**
 * 🧹 CLEANUP COMPLETED SCANS (DATABASE-BACKED)
 */
export const cleanupCompletedScans = async (olderThanHours = 24) => {
  try {
    const deletedCount = await dbRepository.cleanupOldScans(olderThanHours);
    if (deletedCount > 0) {
      console.log(`🧹 Cleaned up ${deletedCount} old scans from database`);
    }
    return deletedCount;
  } catch (error) {
    console.error(`❌ Error cleaning up old scans:`, error);
    throw error;
  }
};

/**
 * 🔁 RETRY FUNCTIONALITY (DATABASE-BACKED)
 */

/**
 * 5️⃣ PREPARE SCAN FOR RETRY
 */
export const prepareScanForRetry = async (scanId, servicesToRetry = null) => {
  try {
    const scan = await dbRepository.getScanById(scanId);
    if (!scan) {
      throw new Error(`Scan ${scanId} not found`);
    }

    // Get retryable services from database
    const retryableServices = await dbRepository.getRetryableServices(scanId);
    
    let targetServices = servicesToRetry;
    if (!targetServices || targetServices.length === 0) {
      // If no services specified, retry all retryable failed services
      targetServices = retryableServices.map(s => s.service_name);
    }

    if (targetServices.length === 0) {
      throw new Error('No services available for retry');
    }

    // Validate that requested services are actually retryable
    const validServices = [];
    const errors = [];

    for (const serviceName of targetServices) {
      const retryableService = retryableServices.find(s => s.service_name === serviceName);
      if (!retryableService) {
        errors.push(`Service '${serviceName}' is not eligible for retry`);
      } else {
        validServices.push(serviceName);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Retry validation failed: ${errors.join(', ')}`);
    }

    if (validServices.length === 0) {
      throw new Error('No valid services to retry');
    }

    // Reset services for retry in database (increment retry count and reset status)
    const resetServices = [];
    for (const serviceName of validServices) {
      await dbRepository.incrementRetryAttempt(scanId, serviceName);
      resetServices.push(serviceName);
    }

    // Transition scan back to running state if needed
    if ([ScanStatus.COMPLETED, ScanStatus.PARTIAL, ScanStatus.FAILED].includes(scan.status)) {
      await dbRepository.updateScanStatus(scanId, ScanStatus.RUNNING);
    }

    console.log(`🔄 Prepared scan ${scanId} for retry of services: ${resetServices.join(', ')}`);
    
    return {
      scanId,
      resetServices,
      totalRetryableServices: targetServices.length,
      validServices: resetServices.length
    };

  } catch (error) {
    console.error(`❌ Error preparing scan ${scanId} for retry:`, error);
    throw error;
  }
};

/**
 * 6️⃣ GET RETRY STATUS (DATABASE-BACKED)
 */
export const getRetryStatus = async (scanId) => {
  try {
    const scan = await dbRepository.getScanById(scanId);
    if (!scan) {
      return null;
    }

    const services = await dbRepository.getScanServices(scanId);
    const retryableServices = await dbRepository.getRetryableServices(scanId);
    
    const failedServices = services
      .filter(s => s.status === 'failed')
      .map(s => s.service_name);
    
    const retryMetadata = {};
    services.forEach(service => {
      retryMetadata[service.service_name] = {
        status: service.status,
        attempts: service.retry_attempts,
        maxAttempts: service.max_retry_attempts,
        canRetry: service.status === 'failed' && service.retry_attempts < service.max_retry_attempts
      };
    });
    
    return {
      scanId,
      hasRetryableServices: retryableServices.length > 0,
      retryableServices: retryableServices.map(s => s.service_name),
      failedServices,
      retryMetadata
    };

  } catch (error) {
    console.error(`❌ Error getting retry status for scan ${scanId}:`, error);
    throw error;
  }
};

/**
 * 🔧 UTILITY FUNCTIONS
 */

/**
 * Map database service status to API contract status
 */
function mapServiceStatus(dbStatus) {
  switch (dbStatus) {
    case 'success':
      return SERVICE_STATUS.COMPLETED;
    case 'failed':
      return SERVICE_STATUS.ERROR;
    case 'running':
      return SERVICE_STATUS.LOADING;
    case 'pending':
    default:
      return SERVICE_STATUS.PENDING;
  }
}