/**
 * 💰 PLAN CONFIGURATION & ENFORCEMENT
 * 
 * Centralized plan definitions and limits for freemium model
 * Controls daily scans, service access, retries, and downloads
 * 
 * Version: 1.0
 * Last Modified: December 13, 2025
 */

/**
 * 📦 PLAN DEFINITIONS (CENTRALIZED)
 * Single source of truth for all plan limits and features
 */
export const PLANS = {
  GUEST: {
    name: 'Guest',
    dailyScans: 1,
    services: ['accessibility'], // Basic service only
    retries: 0,
    downloads: false,
    priority: 0
  },
  FREE: {
    name: 'Free',
    dailyScans: 2,
    services: ['accessibility', 'duplicateContent'],
    retries: 1,
    downloads: false,
    priority: 1
  },
  PRO: {
    name: 'Professional',
    dailyScans: 50,
    services: 'ALL', // All services available
    retries: 2,
    downloads: true,
    priority: 2
  }
};

/**
 * 🛠️ ALL AVAILABLE SERVICES
 * Complete list of services for validation
 */
export const ALL_SERVICES = [
  'accessibility',
  'duplicateContent',
  'backlinks',
  'schema',
  'multiLanguage',
  'rankTracker'
];

/**
 * ⚖️ PLAN ENFORCEMENT UTILITIES
 */

/**
 * Get plan configuration by plan type
 */
export function getPlanConfig(planType) {
  const plan = PLANS[planType?.toUpperCase()];
  if (!plan) {
    return PLANS.GUEST; // Default fallback
  }
  return plan;
}

/**
 * Check if service is allowed for plan
 */
export function isServiceAllowed(planType, serviceName) {
  const plan = getPlanConfig(planType);
  
  if (plan.services === 'ALL') {
    return true;
  }
  
  if (Array.isArray(plan.services)) {
    return plan.services.includes(serviceName);
  }
  
  return false;
}

/**
 * Get allowed services for plan
 */
export function getAllowedServices(planType) {
  const plan = getPlanConfig(planType);
  
  if (plan.services === 'ALL') {
    return [...ALL_SERVICES];
  }
  
  if (Array.isArray(plan.services)) {
    return [...plan.services];
  }
  
  return [];
}

/**
 * Get restricted services for plan
 */
export function getRestrictedServices(planType) {
  const allowedServices = getAllowedServices(planType);
  return ALL_SERVICES.filter(service => !allowedServices.includes(service));
}

/**
 * Check if user has reached daily scan limit
 */
export function hasReachedScanLimit(planType, currentUsage) {
  const plan = getPlanConfig(planType);
  return currentUsage >= plan.dailyScans;
}

/**
 * Check if user has reached retry limit
 */
export function hasReachedRetryLimit(planType, currentRetries) {
  const plan = getPlanConfig(planType);
  return currentRetries >= plan.retries;
}

/**
 * Check if downloads are allowed
 */
export function areDownloadsAllowed(planType) {
  const plan = getPlanConfig(planType);
  return plan.downloads;
}

/**
 * 🚫 PLAN RESTRICTION ERRORS
 * Standardized error responses for plan restrictions
 */
export const PLAN_ERRORS = {
  DAILY_LIMIT_REACHED: {
    code: 'DAILY_LIMIT_REACHED',
    message: 'Daily scan limit reached. Upgrade to continue scanning.',
    upgradeRequired: true
  },
  SERVICE_RESTRICTED: {
    code: 'SERVICE_RESTRICTED',
    message: 'This service requires a premium plan.',
    upgradeRequired: true
  },
  RETRY_LIMIT_REACHED: {
    code: 'RETRY_LIMIT_REACHED', 
    message: 'Retry limit reached for your plan.',
    upgradeRequired: true
  },
  DOWNLOADS_RESTRICTED: {
    code: 'DOWNLOADS_RESTRICTED',
    message: 'Downloads require a premium plan.',
    upgradeRequired: true
  },
  PLAN_NOT_FOUND: {
    code: 'PLAN_NOT_FOUND',
    message: 'Invalid user plan detected.',
    upgradeRequired: false
  }
};

/**
 * Create standardized plan restriction error
 */
export function createPlanError(errorType, additionalData = {}) {
  const baseError = PLAN_ERRORS[errorType];
  if (!baseError) {
    return PLAN_ERRORS.PLAN_NOT_FOUND;
  }
  
  return {
    ...baseError,
    ...additionalData,
    timestamp: new Date().toISOString()
  };
}

/**
 * 📈 USAGE CALCULATION
 */

/**
 * Calculate remaining usage for plan
 */
export function calculateRemainingUsage(planType, currentUsage) {
  const plan = getPlanConfig(planType);
  return {
    scans: Math.max(0, plan.dailyScans - currentUsage.scans),
    retries: Math.max(0, plan.retries - currentUsage.retries),
    downloads: plan.downloads ? Infinity : 0
  };
}

/**
 * Get usage summary for plan
 */
export function getUsageSummary(planType, currentUsage) {
  const plan = getPlanConfig(planType);
  const remaining = calculateRemainingUsage(planType, currentUsage);
  
  return {
    plan: {
      name: plan.name,
      type: planType
    },
    limits: {
      dailyScans: plan.dailyScans,
      retries: plan.retries,
      downloads: plan.downloads
    },
    current: currentUsage,
    remaining,
    allowedServices: getAllowedServices(planType),
    restrictedServices: getRestrictedServices(planType)
  };
}