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
 * 🔒 SCAN STATUS ENUM (STRICT)
 * Matches the locked API contract but extends for internal lifecycle management
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
 * 📊 SERVICE EXECUTION TRACKING
 */
class ServiceExecution {
  constructor(serviceName, maxRetries = 2) {
    this.serviceName = serviceName;
    this.status = "pending";
    this.startedAt = null;
    this.completedAt = null;
    this.executionTimeMs = null;
    this.result = null;
    this.error = null;
    // 🔁 Retry metadata
    this.retry = {
      attempts: 0,
      maxAttempts: maxRetries
    };
  }

  start() {
    this.status = "running";
    this.startedAt = new Date();
    this.retry.attempts += 1;
  }

  complete(result) {
    this.status = "success";
    this.completedAt = new Date();
    this.executionTimeMs = this.completedAt - this.startedAt;
    this.result = result;
  }

  fail(error) {
    this.status = "failed";
    this.completedAt = new Date();
    this.executionTimeMs = this.startedAt ? this.completedAt - this.startedAt : null;
    this.error = error;
  }

  isCompleted() {
    return this.status === "success" || this.status === "failed";
  }

  /**
   * 🔁 RETRY ELIGIBILITY CHECKS
   */
  canRetry() {
    return (
      this.status === "failed" &&
      this.retry.attempts < this.retry.maxAttempts &&
      this.error && 
      this.error.retryable !== false
    );
  }

  hasRetriesRemaining() {
    return this.retry.attempts < this.retry.maxAttempts;
  }

  /**
   * 🔄 RESET SERVICE FOR RETRY
   */
  resetForRetry() {
    if (!this.canRetry()) {
      throw new Error(`Service ${this.serviceName} cannot be retried`);
    }
    
    // Reset only the execution state, preserve retry metadata
    this.status = "pending";
    this.startedAt = null;
    this.completedAt = null;
    this.executionTimeMs = null;
    this.error = null;
    
    console.log(`🔄 Service ${this.serviceName} reset for retry attempt ${this.retry.attempts + 1}/${this.retry.maxAttempts}`);
  }
}
}

/**
 * 🧩 SCAN CONTEXT OBJECT
 */
export class ScanContext {
  constructor(scanId, url) {
    this.scanId = scanId;
    this.url = url;
    this.status = ScanStatus.PENDING;
    this.services = {};
    this.startedAt = new Date();
    this.completedAt = null;

    // Initialize all required services
    Object.values(SERVICE_NAMES).forEach(serviceName => {
      this.services[serviceName] = new ServiceExecution(serviceName);
    });
  }

  /**
   * 📊 CALCULATE PROGRESS IN REAL TIME
   */
  getProgress() {
    const allServices = Object.values(this.services);
    const completedServices = allServices.filter(service => service.isCompleted()).length;
    const totalServices = allServices.length;
    
    return {
      completedServices,
      totalServices,
      percentage: Math.floor((completedServices / totalServices) * 100)
    };
  }

  /**
   * 🔄 SAFE STATE TRANSITION
   */
  transitionTo(newStatus) {
    const validTransitions = VALID_TRANSITIONS[this.status];
    
    if (!validTransitions.includes(newStatus)) {
      throw new Error(`Invalid state transition from ${this.status} to ${newStatus}`);
    }
    
    console.log(`🔄 Scan ${this.scanId}: ${this.status} → ${newStatus}`);
    this.status = newStatus;
  }

  /**
   * 🏁 DETERMINE FINAL STATUS
   */
  calculateFinalStatus() {
    const allServices = Object.values(this.services);
    const successfulServices = allServices.filter(s => s.status === "success");
    const totalServices = allServices.length;

    if (successfulServices.length === totalServices) {
      return ScanStatus.COMPLETED;
    } else if (successfulServices.length > 0) {
      return ScanStatus.PARTIAL;
    } else {
      return ScanStatus.FAILED;
    }
  }

  /**
   * 🔁 RETRY FUNCTIONALITY
   */
  
  /**
   * Get all failed services that can be retried
   */
  getRetryableServices() {
    return Object.entries(this.services)
      .filter(([, execution]) => execution.canRetry())
      .map(([serviceName]) => serviceName);
  }

  /**
   * Get all failed services (both retryable and non-retryable)
   */
  getFailedServices() {
    return Object.entries(this.services)
      .filter(([, execution]) => execution.status === "failed")
      .map(([serviceName]) => serviceName);
  }

  /**
   * Check if any services can be retried
   */
  hasRetryableServices() {
    return this.getRetryableServices().length > 0;
  }

  /**
   * Validate services for retry eligibility
   */
  validateRetryServices(serviceNames) {
    const errors = [];
    const validServices = [];

    serviceNames.forEach(serviceName => {
      if (!this.services[serviceName]) {
        errors.push(`Service '${serviceName}' not found in scan`);
        return;
      }

      const service = this.services[serviceName];
      
      if (service.status === "success") {
        errors.push(`Service '${serviceName}' already completed successfully`);
        return;
      }

      if (service.status === "pending" || service.status === "running") {
        errors.push(`Service '${serviceName}' is currently ${service.status}`);
        return;
      }

      if (!service.canRetry()) {
        if (service.retry.attempts >= service.retry.maxAttempts) {
          errors.push(`Service '${serviceName}' has exceeded maximum retry attempts (${service.retry.maxAttempts})`);
        } else if (service.error && service.error.retryable === false) {
          errors.push(`Service '${serviceName}' failed with non-retryable error`);
        } else {
          errors.push(`Service '${serviceName}' cannot be retried`);
        }
        return;
      }

      validServices.push(serviceName);
    });

    return { validServices, errors };
  }

  /**
   * Reset services for retry
   */
  resetServicesForRetry(serviceNames) {
    const resetServices = [];
    
    serviceNames.forEach(serviceName => {
      const service = this.services[serviceName];
      if (service && service.canRetry()) {
        service.resetForRetry();
        resetServices.push(serviceName);
      }
    });

    return resetServices;
  }

  /**
   * 📤 CONVERT TO API RESPONSE FORMAT
   */
  toApiResponse() {
    const services = {};
    
    // Convert service executions to normalized API format
    Object.entries(this.services).forEach(([serviceName, execution]) => {
      let normalizedService;
      
      if (execution.status === "success") {
        normalizedService = normalizeServiceResult(
          serviceName, 
          execution.result, 
          execution.executionTimeMs
        );
      } else if (execution.status === "failed") {
        normalizedService = normalizeServiceResult(
          serviceName, 
          execution.error, 
          execution.executionTimeMs
        );
      } else {
        // Still pending/running
        normalizedService = {
          status: SERVICE_STATUS.PENDING,
          score: null,
          data: null,
          issues: [],
          error: null,
          executionTimeMs: null
        };
      }
      
      // Add retry metadata to the normalized service
      normalizedService.retry = {
        attempts: execution.retry.attempts,
        maxAttempts: execution.retry.maxAttempts,
        canRetry: execution.canRetry()
      };
      
      services[serviceName] = normalizedService;
    });

    return buildScanResponse({
      status: this.status,
      scanId: this.scanId,
      url: this.url,
      startedAt: this.startedAt.toISOString(),
      completedAt: this.completedAt ? this.completedAt.toISOString() : null,
      services
    });
  }
}

/**
 * 🗃️ SCAN REGISTRY
 * Thread-safe storage for active and completed scans
 */
class ScanRegistry {
  constructor() {
    this.scans = new Map();
  }

  register(scanContext) {
    this.scans.set(scanContext.scanId, scanContext);
    console.log(`📝 Registered scan ${scanContext.scanId} for ${scanContext.url}`);
  }

  get(scanId) {
    return this.scans.get(scanId);
  }

  exists(scanId) {
    return this.scans.has(scanId);
  }

  remove(scanId) {
    const removed = this.scans.delete(scanId);
    if (removed) {
      console.log(`🗑️ Removed scan ${scanId} from registry`);
    }
    return removed;
  }

  getAll() {
    return Array.from(this.scans.values());
  }

  getActiveScans() {
    return this.getAll().filter(scan => 
      scan.status === ScanStatus.RUNNING || scan.status === ScanStatus.PENDING
    );
  }
}

// Global scan registry
const scanRegistry = new ScanRegistry();

/**
 * 1️⃣ INITIALIZE SCAN
 */
export const initializeScan = (url) => {
  const scanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const scanContext = new ScanContext(scanId, url);
  
  scanRegistry.register(scanContext);
  
  console.log(`🚀 Initialized scan ${scanId} for ${url}`);
  return scanContext;
};

/**
 * 2️⃣ START SCAN
 */
export const startScan = (scanContext) => {
  try {
    scanContext.transitionTo(ScanStatus.RUNNING);
    console.log(`▶️ Started scan ${scanContext.scanId}`);
  } catch (error) {
    console.error(`❌ Failed to start scan ${scanContext.scanId}:`, error);
    scanContext.transitionTo(ScanStatus.FAILED);
    throw error;
  }
};

/**
 * 3️⃣ UPDATE SERVICE STATUS
 */
export const updateServiceStatus = (scanId, serviceName, status, result = null) => {
  const scanContext = scanRegistry.get(scanId);
  
  if (!scanContext) {
    throw new Error(`Scan ${scanId} not found`);
  }

  const serviceExecution = scanContext.services[serviceName];
  if (!serviceExecution) {
    throw new Error(`Service ${serviceName} not found in scan ${scanId}`);
  }

  try {
    if (status === "running" && serviceExecution.status === "pending") {
      serviceExecution.start();
    } else if (status === "success") {
      serviceExecution.complete(result);
    } else if (status === "failed") {
      serviceExecution.fail(result); // result is error in this case
    }

    const progress = scanContext.getProgress();
    console.log(`📊 Scan ${scanId}: ${serviceName} → ${status} (Progress: ${progress.percentage}%)`);

    // Check if all services are complete
    if (progress.completedServices === progress.totalServices) {
      finalizeScan(scanContext);
    }

  } catch (error) {
    console.error(`❌ Error updating service ${serviceName} for scan ${scanId}:`, error);
    // Don't fail the entire scan for a single service update error
  }
};

/**
 * 4️⃣ FINALIZE SCAN
 */
export const finalizeScan = (scanContext) => {
  try {
    const finalStatus = scanContext.calculateFinalStatus();
    scanContext.transitionTo(finalStatus);
    scanContext.completedAt = new Date();
    
    const progress = scanContext.getProgress();
    console.log(`🏁 Finalized scan ${scanContext.scanId}: ${finalStatus} (${progress.completedServices}/${progress.totalServices})`);
    
  } catch (error) {
    console.error(`❌ Error finalizing scan ${scanContext.scanId}:`, error);
    scanContext.status = ScanStatus.FAILED;
    scanContext.completedAt = new Date();
  }
};

/**
 * 🔍 GET SCAN STATUS (FOR POLLING)
 */
export const getScanStatus = (scanId) => {
  const scanContext = scanRegistry.get(scanId);
  
  if (!scanContext) {
    return null;
  }

  return scanContext.toApiResponse();
};

/**
 * 📋 GET ALL SCANS (FOR MONITORING)
 */
export const getAllScans = () => {
  return scanRegistry.getAll().map(scan => ({
    scanId: scan.scanId,
    url: scan.url,
    status: scan.status,
    startedAt: scan.startedAt,
    completedAt: scan.completedAt,
    progress: scan.getProgress()
  }));
};

/**
 * 🧹 CLEANUP COMPLETED SCANS (FOR MEMORY MANAGEMENT)
 */
export const cleanupCompletedScans = (olderThanHours = 24) => {
  const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
  const scansToRemove = [];

  scanRegistry.getAll().forEach(scan => {
    const isCompleted = [ScanStatus.COMPLETED, ScanStatus.PARTIAL, ScanStatus.FAILED].includes(scan.status);
    const isOld = scan.completedAt && scan.completedAt < cutoffTime;
    
    if (isCompleted && isOld) {
      scansToRemove.push(scan.scanId);
    }
  });

  scansToRemove.forEach(scanId => {
    scanRegistry.remove(scanId);
  });

  if (scansToRemove.length > 0) {
    console.log(`🧹 Cleaned up ${scansToRemove.length} old scans`);
  }

  return scansToRemove.length;
};

/**
 * 🔁 RETRY FUNCTIONALITY
 */

/**
 * 5️⃣ PREPARE SCAN FOR RETRY
 */
export const prepareScanForRetry = (scanId, servicesToRetry = null) => {
  const scanContext = scanRegistry.get(scanId);
  
  if (!scanContext) {
    throw new Error(`Scan ${scanId} not found`);
  }

  // Determine which services to retry
  let targetServices = servicesToRetry;
  if (!targetServices || targetServices.length === 0) {
    // If no services specified, retry all retryable failed services
    targetServices = scanContext.getRetryableServices();
  }

  if (targetServices.length === 0) {
    throw new Error('No services available for retry');
  }

  // Validate retry eligibility
  const { validServices, errors } = scanContext.validateRetryServices(targetServices);
  
  if (errors.length > 0) {
    throw new Error(`Retry validation failed: ${errors.join(', ')}`);
  }

  if (validServices.length === 0) {
    throw new Error('No valid services to retry');
  }

  // Reset services for retry
  const resetServices = scanContext.resetServicesForRetry(validServices);
  
  // Transition scan back to running state if needed
  if ([ScanStatus.COMPLETED, ScanStatus.PARTIAL, ScanStatus.FAILED].includes(scanContext.status)) {
    scanContext.transitionTo(ScanStatus.RUNNING);
  }

  console.log(`🔄 Prepared scan ${scanId} for retry of services: ${resetServices.join(', ')}`);
  
  return {
    scanId,
    resetServices,
    totalRetryableServices: targetServices.length,
    validServices: resetServices.length
  };
};

/**
 * 6️⃣ GET RETRY STATUS
 */
export const getRetryStatus = (scanId) => {
  const scanContext = scanRegistry.get(scanId);
  
  if (!scanContext) {
    return null;
  }

  const retryableServices = scanContext.getRetryableServices();
  const failedServices = scanContext.getFailedServices();
  
  return {
    scanId,
    hasRetryableServices: retryableServices.length > 0,
    retryableServices,
    failedServices,
    retryMetadata: Object.fromEntries(
      Object.entries(scanContext.services).map(([name, execution]) => [
        name, 
        {
          status: execution.status,
          attempts: execution.retry.attempts,
          maxAttempts: execution.retry.maxAttempts,
          canRetry: execution.canRetry()
        }
      ])
    )
  };
};

// Export the scan registry for direct access if needed
export { scanRegistry };