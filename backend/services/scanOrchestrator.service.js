// SINGLE SCAN ORCHESTRATOR
// Central brain for all SEO analysis
// 🔒 USES LOCKED API CONTRACT - DO NOT BREAK FRONTEND COMPATIBILITY

import { analyzeDuplicateContent } from './duplicateContent.service.js';
import { analyzeAccessibility } from './accessibility.service.js';
import { analyzeBacklinks } from './backlinks.service.js';
import { analyzeSchema } from './schema.service.js';
import { analyzeMultiLanguage } from './multiLanguage.service.js';
import { analyzeRankTracker } from './rankTracker.service.js';
import { 
  buildScanResponse, 
  normalizeServiceResult,
  SCAN_STATUS,
  SERVICE_NAMES
} from '../utils/responseContract.js';

/**
 * 🔒 LOCKED API: Run full SEO scan across all analysis services
 * 
 * This function MUST return a standardized response contract that the frontend depends on.
 * Every service result is normalized to ensure consistent structure.
 * Failed services never break the response.
 * 
 * @param {Object} params - Scan parameters
 * @param {string} params.url - The URL to analyze
 * @param {string[]} [params.keywords] - Optional keywords for rank analysis
 * @param {string} [params.scanId] - Optional scan ID (auto-generated if not provided)
 * @returns {Promise<Object>} Standardized scan response matching locked contract
 */
export const runFullSeoScan = async ({ url, keywords = [], scanId = null }) => {
  const startedAt = new Date().toISOString();
  console.log(`🚀 Starting full SEO scan for: ${url} (ID: ${scanId})`);
  
  // Generate scan ID if not provided
  const finalScanId = scanId || `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const services = {};
  const serviceExecutionTimes = {};

  // Service execution helper that measures time and normalizes results
  const executeService = async (serviceName, serviceFunction, ...args) => {
    const startTime = Date.now();
    try {
      console.log(`📊 Running ${serviceName} analysis...`);
      const result = await serviceFunction(...args);
      const executionTimeMs = Date.now() - startTime;
      serviceExecutionTimes[serviceName] = executionTimeMs;
      return normalizeServiceResult(serviceName, result, executionTimeMs);
    } catch (error) {
      const executionTimeMs = Date.now() - startTime;
      serviceExecutionTimes[serviceName] = executionTimeMs;
      console.error(`${serviceName} analysis failed:`, error.message);
      return normalizeServiceResult(serviceName, error, executionTimeMs);
    }
  };

  // Execute all services with error isolation
  // Each service failure is contained and doesn't affect others
  
  // Duplicate Content Analysis
  services[SERVICE_NAMES.DUPLICATE_CONTENT] = await executeService(
    SERVICE_NAMES.DUPLICATE_CONTENT,
    analyzeDuplicateContent,
    url
  );
  
  // Accessibility Analysis
  services[SERVICE_NAMES.ACCESSIBILITY] = await executeService(
    SERVICE_NAMES.ACCESSIBILITY,
    analyzeAccessibility,
    url
  );
  
  // Backlinks Analysis
  services[SERVICE_NAMES.BACKLINKS] = await executeService(
    SERVICE_NAMES.BACKLINKS,
    analyzeBacklinks,
    url
  );
  
  // Schema Analysis
  services[SERVICE_NAMES.SCHEMA] = await executeService(
    SERVICE_NAMES.SCHEMA,
    analyzeSchema,
    url
  );
  
  // Multi-Language SEO Analysis
  services[SERVICE_NAMES.MULTI_LANGUAGE] = await executeService(
    SERVICE_NAMES.MULTI_LANGUAGE,
    analyzeMultiLanguage,
    url
  );
  
  // Rank Tracker Analysis
  services[SERVICE_NAMES.RANK_TRACKER] = await executeService(
    SERVICE_NAMES.RANK_TRACKER,
    analyzeRankTracker,
    url
  );

  const completedAt = new Date().toISOString();
  
  // Determine overall scan status
  const successfulServices = Object.values(services).filter(s => s.status === 'success');
  const failedServices = Object.values(services).filter(s => s.status === 'failed');
  const totalServices = Object.keys(services).length;

  let overallStatus;
  if (successfulServices.length === totalServices) {
    overallStatus = SCAN_STATUS.COMPLETED;
  } else if (successfulServices.length > 0) {
    overallStatus = SCAN_STATUS.PARTIAL;
  } else {
    overallStatus = SCAN_STATUS.FAILED;
  }

  console.log(`✅ SEO scan completed: ${successfulServices.length}/${totalServices} services successful`);
  
  // 🔒 RETURN LOCKED API RESPONSE CONTRACT
  return buildScanResponse({
    status: overallStatus,
    scanId: finalScanId,
    url,
    startedAt,
    completedAt,
    services
  });
};