
/**
 * 📊 OBSERVABILITY & MONITORING SERVICE
 * 
 * Central logging and metrics collection system for production observability.
 * Provides fail-safe, non-blocking structured logging with comprehensive metrics.
 * 
 * Features:
 * - Structured JSON logging
 * - Non-blocking async operations
 * - Fail-safe error handling
 * - Performance metrics tracking
 * - Cost analysis data
 * - Cache effectiveness monitoring
 * 
 * Version: 1.0
 * Last Modified: December 13, 2025
 */

import dbRepository from '../database/repository.js';

/**
 * 📋 LOG LEVELS
 */
export const LogLevel = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  DEBUG: 'debug'
};

/**
 * 🎯 EVENT TYPES FOR STRUCTURED LOGGING
 */
export const EventType = {
  SCAN_STARTED: 'scan_started',
  SCAN_COMPLETED: 'scan_completed',
  SCAN_FAILED: 'scan_failed',
  SERVICE_STARTED: 'service_started',
  SERVICE_COMPLETED: 'service_completed',
  SERVICE_FAILED: 'service_failed',
  SERVICE_RETRY: 'service_retry',
  CACHE_HIT: 'cache_hit',
  CACHE_MISS: 'cache_miss',
  CACHE_WRITE: 'cache_write',
  PLAN_ENFORCEMENT: 'plan_enforcement',
  PERFORMANCE_METRIC: 'performance_metric'
};

/**
 * 📝 STRUCTURED LOGGER
 * Creates consistent JSON logs for observability
 */
class StructuredLogger {
  /**
   * 📊 LOG STRUCTURED EVENT
   * Creates standardized JSON log entry
   */
  static log(level, event, data = {}) {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        event,
        ...data,
        environment: process.env.NODE_ENV || 'development'
      };

      // Remove sensitive data before logging
      const sanitized = this.sanitizeLogData(logEntry);
      
      // Output structured JSON
      console.log(JSON.stringify(sanitized));
      
    } catch (error) {
      // Fail-safe: If logging fails, don't break the application
      console.error('Logging error (non-blocking):', error.message);
    }
  }

  /**
   * 🧹 SANITIZE LOG DATA
   * Removes sensitive information from logs
   */
  static sanitizeLogData(data) {
    const sanitized = { ...data };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'auth', 'key', 'secret'];
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    // Truncate very long URLs to prevent log bloat
    if (sanitized.url && sanitized.url.length > 200) {
      sanitized.url = sanitized.url.substring(0, 197) + '...';
    }
    
    return sanitized;
  }

  /**
   * 📈 LOG SCAN METRIC
   * Records scan-level metrics for analytics
   */
  static async logScanMetric(scanContext) {
    try {
      this.log(LogLevel.INFO, EventType.PERFORMANCE_METRIC, {
        type: 'scan_metric',
        scanId: scanContext.scanId,
        userType: scanContext.userType,
        plan: scanContext.plan,
        url: scanContext.url,
        status: scanContext.status,
        cached: scanContext.cached || false,
        totalExecutionTime: scanContext.totalExecutionTime,
        servicesExecuted: scanContext.servicesExecuted || 0,
        servicesFailed: scanContext.servicesFailed || 0
      });

      // Store in database (non-blocking)
      setImmediate(async () => {
        try {
          await dbRepository.insertScanMetric(scanContext);
        } catch (error) {
          console.error('Scan metric storage failed (non-blocking):', error.message);
        }
      });

    } catch (error) {
      // Fail-safe: Never throw from logging
      console.error('Scan metric logging failed (non-blocking):', error.message);
    }
  }

  /**
   * 🔧 LOG SERVICE METRIC  
   * Records service-level metrics for performance analysis
   */
  static async logServiceMetric(scanId, serviceContext) {
    try {
      this.log(LogLevel.INFO, EventType.PERFORMANCE_METRIC, {
        type: 'service_metric',
        scanId,
        service: serviceContext.serviceName,
        status: serviceContext.status,
        executionTime: serviceContext.executionTime,
        retryAttempts: serviceContext.retryAttempts || 0,
        errorCode: serviceContext.errorCode || null
      });

      // Store in database (non-blocking)
      setImmediate(async () => {
        try {
          await dbRepository.insertServiceMetric(scanId, serviceContext);
        } catch (error) {
          console.error('Service metric storage failed (non-blocking):', error.message);
        }
      });

    } catch (error) {
      // Fail-safe: Never throw from logging
      console.error('Service metric logging failed (non-blocking):', error.message);
    }
  }
}

/**
 * 🎯 CONVENIENCE LOGGING METHODS
 */

/**
 * 🚀 LOG SCAN STARTED
 */
export const logScanStarted = (scanId, userContext, url) => {
  StructuredLogger.log(LogLevel.INFO, EventType.SCAN_STARTED, {
    scanId,
    userType: userContext?.type || 'GUEST',
    plan: userContext?.plan || 'GUEST',
    url: url,
    timestamp: new Date().toISOString()
  });
};

/**
 * ✅ LOG SCAN COMPLETED
 */
export const logScanCompleted = async (scanContext) => {
  StructuredLogger.log(LogLevel.INFO, EventType.SCAN_COMPLETED, {
    scanId: scanContext.scanId,
    userType: scanContext.userType,
    plan: scanContext.plan,
    url: scanContext.url,
    status: scanContext.status,
    totalExecutionTime: scanContext.totalExecutionTime,
    cached: scanContext.cached || false,
    servicesExecuted: scanContext.servicesExecuted,
    servicesFailed: scanContext.servicesFailed
  });
  
  await StructuredLogger.logScanMetric(scanContext);
};

/**
 * ❌ LOG SCAN FAILED
 */
export const logScanFailed = async (scanId, userContext, url, error) => {
  StructuredLogger.log(LogLevel.ERROR, EventType.SCAN_FAILED, {
    scanId,
    userType: userContext?.type || 'GUEST', 
    plan: userContext?.plan || 'GUEST',
    url: url,
    error: error.message,
    stack: error.stack
  });
};

/**
 * 🔧 LOG SERVICE STARTED
 */
export const logServiceStarted = (scanId, serviceName) => {
  StructuredLogger.log(LogLevel.INFO, EventType.SERVICE_STARTED, {
    scanId,
    service: serviceName,
    startTime: new Date().toISOString()
  });
};

/**
 * ✅ LOG SERVICE COMPLETED
 */
export const logServiceCompleted = async (scanId, serviceName, executionTime, result = null) => {
  StructuredLogger.log(LogLevel.INFO, EventType.SERVICE_COMPLETED, {
    scanId,
    service: serviceName,
    executionTime,
    success: true,
    hasResult: !!result
  });
  
  await StructuredLogger.logServiceMetric(scanId, {
    serviceName,
    status: 'success',
    executionTime,
    retryAttempts: 0
  });
};

/**
 * ❌ LOG SERVICE FAILED
 */
export const logServiceFailed = async (scanId, serviceName, executionTime, error, retryAttempts = 0) => {
  StructuredLogger.log(LogLevel.ERROR, EventType.SERVICE_FAILED, {
    scanId,
    service: serviceName,
    executionTime,
    error: error.message,
    retryAttempts
  });
  
  await StructuredLogger.logServiceMetric(scanId, {
    serviceName,
    status: 'failed',
    executionTime,
    retryAttempts,
    errorCode: error.code || 'UNKNOWN_ERROR',
    errorMessage: error.message
  });
};

/**
 * 🔄 LOG SERVICE RETRY
 */
export const logServiceRetry = (scanId, serviceName, retryAttempt, reason) => {
  StructuredLogger.log(LogLevel.WARN, EventType.SERVICE_RETRY, {
    scanId,
    service: serviceName,
    retryAttempt,
    reason: reason
  });
};

/**
 * 📦 LOG CACHE HIT
 */
export const logCacheHit = (scanId, cacheKey, userType) => {
  StructuredLogger.log(LogLevel.INFO, EventType.CACHE_HIT, {
    scanId,
    cacheKey,
    userType,
    costSaved: true
  });
};

/**
 * 💨 LOG CACHE MISS
 */
export const logCacheMiss = (cacheKey, userType) => {
  StructuredLogger.log(LogLevel.INFO, EventType.CACHE_MISS, {
    cacheKey,
    userType,
    freshScanRequired: true
  });
};

/**
 * 💾 LOG CACHE WRITE
 */
export const logCacheWrite = (scanId, cacheKey, ttlHours) => {
  StructuredLogger.log(LogLevel.INFO, EventType.CACHE_WRITE, {
    scanId,
    cacheKey,
    ttlHours
  });
};

/**
 * 🛡️ LOG PLAN ENFORCEMENT
 */
export const logPlanEnforcement = (userContext, action, allowed) => {
  StructuredLogger.log(allowed ? LogLevel.INFO : LogLevel.WARN, EventType.PLAN_ENFORCEMENT, {
    userType: userContext?.type || 'GUEST',
    plan: userContext?.plan || 'GUEST',
    action,
    allowed,
    usage: userContext?.usage
  });
};

/**
 * 📊 METRICS AGGREGATION UTILITIES
 */

/**
 * ⏱️ EXECUTION TIME TRACKER
 * Utility for tracking execution times
 */
export class ExecutionTimer {
  constructor() {
    this.startTime = Date.now();
  }

  elapsed() {
    return Date.now() - this.startTime;
  }

  stop() {
    const elapsed = this.elapsed();
    this.startTime = null;
    return elapsed;
  }
}

/**
 * 📈 CREATE SCAN CONTEXT
 * Helper to build scan context for metrics
 */
export const createScanContext = (scanId, userContext, url, status, startTime, options = {}) => {
  return {
    scanId,
    userType: userContext?.type || 'GUEST',
    plan: userContext?.plan || 'GUEST', 
    url,
    status,
    totalExecutionTime: startTime ? Date.now() - startTime : null,
    cached: options.cached || false,
    servicesExecuted: options.servicesExecuted || 0,
    servicesFailed: options.servicesFailed || 0,
    timestamp: new Date().toISOString()
  };
};

export default StructuredLogger;