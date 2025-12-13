/**
 * Timeout Service
 * Provides timeout management for services and scans
 */

class TimeoutService {
  constructor() {
    this.activeTimeouts = new Map();
    this.DEFAULT_SERVICE_TIMEOUT = 20000; // 20 seconds
    this.DEFAULT_SCAN_TIMEOUT = 120000;   // 2 minutes
    
    // Service-specific timeouts (in milliseconds)
    this.serviceTimeouts = {
      accessibility: 15000,    // 15 seconds
      backlinks: 25000,        // 25 seconds
      headings: 10000,         // 10 seconds
      images: 15000,           // 15 seconds
      security: 20000,         // 20 seconds
      speed: 30000,            // 30 seconds
      default: this.DEFAULT_SERVICE_TIMEOUT
    };
  }

  /**
   * Execute a function with timeout
   * @param {Function} fn - Function to execute
   * @param {number} timeoutMs - Timeout in milliseconds
   * @param {string} operation - Operation name for logging
   * @returns {Promise} - Promise that resolves with result or rejects on timeout
   */
  async executeWithTimeout(fn, timeoutMs, operation = 'operation') {
    const timeoutId = Math.random().toString(36).substring(7);
    
    return new Promise(async (resolve, reject) => {
      // Create timeout promise
      const timeoutPromise = new Promise((_, timeoutReject) => {
        const timeout = setTimeout(() => {
          this.activeTimeouts.delete(timeoutId);
          timeoutReject(new Error(`${operation} timed out after ${timeoutMs}ms`));
        }, timeoutMs);
        
        this.activeTimeouts.set(timeoutId, {
          timeout,
          operation,
          startTime: Date.now()
        });
      });

      try {
        // Race between function execution and timeout
        const result = await Promise.race([
          this.wrapFunction(fn),
          timeoutPromise
        ]);
        
        // Clear timeout if function completes first
        this.clearTimeout(timeoutId);
        resolve(result);
        
      } catch (error) {
        this.clearTimeout(timeoutId);
        
        // Enhance error with timeout information
        if (error.message.includes('timed out')) {
          error.isTimeout = true;
          error.timeoutMs = timeoutMs;
          error.operation = operation;
        }
        
        reject(error);
      }
    });
  }

  /**
   * Execute service with appropriate timeout
   * @param {Function} serviceFunction - Service to execute
   * @param {string} serviceName - Name of the service
   * @param {Object} context - Execution context
   */
  async executeService(serviceFunction, serviceName, context = {}) {
    const timeout = this.serviceTimeouts[serviceName] || this.serviceTimeouts.default;
    const operation = `service:${serviceName}`;
    
    try {
      const result = await this.executeWithTimeout(
        serviceFunction,
        timeout,
        operation
      );
      
      return {
        success: true,
        data: result,
        executionTime: context.timer ? context.timer.elapsed() : 0,
        timedOut: false
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        executionTime: context.timer ? context.timer.elapsed() : 0,
        timedOut: error.isTimeout || false,
        errorType: error.isTimeout ? 'TIMEOUT' : 'EXECUTION_ERROR'
      };
    }
  }

  /**
   * Execute scan with global timeout
   * @param {Function} scanFunction - Scan function to execute
   * @param {string} scanId - Scan identifier
   * @param {number} customTimeout - Optional custom timeout
   */
  async executeScan(scanFunction, scanId, customTimeout = null) {
    const timeout = customTimeout || this.DEFAULT_SCAN_TIMEOUT;
    const operation = `scan:${scanId}`;
    
    try {
      const result = await this.executeWithTimeout(
        scanFunction,
        timeout,
        operation
      );
      
      return {
        success: true,
        data: result,
        timedOut: false,
        status: 'completed'
      };
      
    } catch (error) {
      if (error.isTimeout) {
        // Handle scan timeout - mark as partial if some services completed
        return {
          success: false,
          error: 'Scan timed out',
          timedOut: true,
          status: 'partial',
          errorType: 'SCAN_TIMEOUT'
        };
      }
      
      return {
        success: false,
        error: error.message,
        timedOut: false,
        status: 'failed',
        errorType: 'SCAN_ERROR'
      };
    }
  }

  /**
   * Wrap function to handle graceful abort
   */
  async wrapFunction(fn) {
    // Ensure function is properly wrapped for error handling
    if (typeof fn !== 'function') {
      throw new Error('Expected function for timeout execution');
    }
    
    try {
      const result = await fn();
      return result;
    } catch (error) {
      // Normalize error for consistent handling
      throw this.normalizeError(error);
    }
  }

  /**
   * Normalize errors for consistent handling
   */
  normalizeError(error) {
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      const normalizedError = new Error('Network timeout or connection reset');
      normalizedError.originalCode = error.code;
      normalizedError.isNetworkError = true;
      return normalizedError;
    }
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      const normalizedError = new Error('Unable to connect to target');
      normalizedError.originalCode = error.code;
      normalizedError.isNetworkError = true;
      return normalizedError;
    }
    
    // Return original error if no normalization needed
    return error;
  }

  /**
   * Clear specific timeout
   */
  clearTimeout(timeoutId) {
    const timeoutData = this.activeTimeouts.get(timeoutId);
    if (timeoutData) {
      clearTimeout(timeoutData.timeout);
      this.activeTimeouts.delete(timeoutId);
    }
  }

  /**
   * Clear all timeouts for cleanup
   */
  clearAllTimeouts() {
    for (const [timeoutId, timeoutData] of this.activeTimeouts.entries()) {
      clearTimeout(timeoutData.timeout);
    }
    this.activeTimeouts.clear();
  }

  /**
   * Get active timeout information
   */
  getActiveTimeouts() {
    const now = Date.now();
    const timeouts = [];
    
    for (const [timeoutId, data] of this.activeTimeouts.entries()) {
      timeouts.push({
        id: timeoutId,
        operation: data.operation,
        startTime: data.startTime,
        elapsed: now - data.startTime
      });
    }
    
    return timeouts;
  }

  /**
   * Check if operation is currently running
   */
  isOperationActive(operation) {
    for (const [, data] of this.activeTimeouts.entries()) {
      if (data.operation === operation) {
        return true;
      }
    }
    return false;
  }

  /**
   * Create cancellable promise for complex operations
   */
  createCancellablePromise(promiseFunction, timeoutMs, operation) {
    let cancelCallback = null;
    let isResolved = false;
    
    const cancellablePromise = new Promise(async (resolve, reject) => {
      // Set up cancellation
      cancelCallback = () => {
        if (!isResolved) {
          isResolved = true;
          reject(new Error(`${operation} was cancelled`));
        }
      };
      
      try {
        const result = await this.executeWithTimeout(
          promiseFunction,
          timeoutMs,
          operation
        );
        
        if (!isResolved) {
          isResolved = true;
          resolve(result);
        }
      } catch (error) {
        if (!isResolved) {
          isResolved = true;
          reject(error);
        }
      }
    });
    
    // Attach cancel method
    cancellablePromise.cancel = () => {
      if (cancelCallback) {
        cancelCallback();
      }
    };
    
    return cancellablePromise;
  }

  /**
   * Get current statistics
   */
  getStats() {
    return {
      activeOperations: this.activeTimeouts.size,
      serviceTimeouts: this.serviceTimeouts,
      defaultServiceTimeout: this.DEFAULT_SERVICE_TIMEOUT,
      defaultScanTimeout: this.DEFAULT_SCAN_TIMEOUT
    };
  }
}

export default new TimeoutService();