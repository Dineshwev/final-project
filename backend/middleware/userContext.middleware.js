/**
 * 👤 USER CONTEXT & USAGE TRACKING
 * 
 * Middleware for resolving user context and tracking usage
 * Supports guests (IP-based), free users, and paid users
 * 
 * Version: 1.0
 * Last Modified: December 13, 2025
 */

import dbRepository from '../database/repository.js';
import { getPlanConfig } from '../services/planEnforcement.service.js';

/**
 * 🔍 USER CONTEXT RESOLUTION
 * 
 * Resolves user context from request headers/auth
 * Returns standardized user context object
 */
export async function resolveUserContext(req) {
  try {
    // Extract potential user identification
    const userId = req.headers['x-user-id'] || req.user?.id;
    const ipAddress = getClientIP(req);
    
    let userContext;
    
    if (userId) {
      // Authenticated user - look up in database
      userContext = await resolveAuthenticatedUser(userId, ipAddress);
    } else {
      // Guest user - IP-based tracking
      userContext = await resolveGuestUser(ipAddress);
    }
    
    // Add usage information
    userContext.usage = await getCurrentUsage(userContext);
    
    return userContext;
    
  } catch (error) {
    console.error('❌ Error resolving user context:', error);
    // Fallback to guest with IP
    return createGuestContext(getClientIP(req));
  }
}

/**
 * Resolve authenticated user context
 */
async function resolveAuthenticatedUser(userId, ipAddress) {
  const user = await dbRepository.getUserById(userId);
  
  if (!user) {
    // User not found, create as free user
    const newUser = await dbRepository.createUser({
      id: userId,
      plan: 'FREE',
      subscriptionActive: false
    });
    
    console.log(`👤 Created new user ${userId} with FREE plan`);
    return createUserContext(newUser, ipAddress);
  }
  
  // Determine effective plan based on subscription status
  let effectivePlan = user.plan || 'FREE';
  
  if (user.plan === 'PRO' && user.subscription_expires_at) {
    const now = new Date();
    const expiresAt = new Date(user.subscription_expires_at);
    
    if (expiresAt < now || !user.subscription_active) {
      // Subscription expired, downgrade to free
      effectivePlan = 'FREE';
      console.log(`📉 User ${userId} subscription expired, using FREE plan`);
    }
  }
  
  return createUserContext({...user, effectivePlan}, ipAddress);
}

/**
 * Resolve guest user context
 */
async function resolveGuestUser(ipAddress) {
  return createGuestContext(ipAddress);
}

/**
 * Create user context object
 */
function createUserContext(user, ipAddress) {
  const planConfig = getPlanConfig(user.effectivePlan || user.plan);
  
  return {
    type: user.effectivePlan || user.plan,
    userId: user.id,
    ipAddress,
    plan: planConfig,
    isAuthenticated: true,
    subscriptionActive: user.subscription_active || false,
    subscriptionExpiresAt: user.subscription_expires_at
  };
}

/**
 * Create guest context object
 */
function createGuestContext(ipAddress) {
  const planConfig = getPlanConfig('GUEST');
  
  return {
    type: 'GUEST',
    userId: null,
    ipAddress,
    plan: planConfig,
    isAuthenticated: false,
    subscriptionActive: false,
    subscriptionExpiresAt: null
  };
}

/**
 * 📊 USAGE TRACKING
 */

/**
 * Get current usage for user context
 */
export async function getCurrentUsage(userContext) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  let usage;
  
  if (userContext.userId) {
    // Authenticated user
    usage = await dbRepository.getUsageByUser(userContext.userId, today);
  } else {
    // Guest user
    usage = await dbRepository.getUsageByIP(userContext.ipAddress, today);
  }
  
  return {
    scans: usage?.scans_used || 0,
    retries: usage?.retries_used || 0,
    downloads: usage?.downloads_used || 0,
    date: today
  };
}

/**
 * Increment usage counter
 */
export async function incrementUsage(userContext, usageType) {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    if (userContext.userId) {
      // Authenticated user
      await dbRepository.incrementUserUsage(userContext.userId, today, usageType);
    } else {
      // Guest user
      await dbRepository.incrementIPUsage(userContext.ipAddress, today, usageType);
    }
    
    console.log(`📈 Incremented ${usageType} usage for ${userContext.userId || userContext.ipAddress}`);
    
  } catch (error) {
    console.error(`❌ Error incrementing ${usageType} usage:`, error);
    // Don't throw - usage tracking shouldn't block operations
  }
}

/**
 * 🌐 UTILITY FUNCTIONS
 */

/**
 * Extract client IP address from request
 */
function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.connection?.socket?.remoteAddress ||
    '127.0.0.1'
  );
}

/**
 * 🛡️ MIDDLEWARE FUNCTION
 * Express middleware to add user context to request
 */
export const userContextMiddleware = async (req, res, next) => {
  try {
    req.userContext = await resolveUserContext(req);
    next();
  } catch (error) {
    console.error('❌ User context middleware error:', error);
    
    // Create fallback context to prevent blocking
    req.userContext = createGuestContext(getClientIP(req));
    next();
  }
};

/**
 * 🔒 PLAN ENFORCEMENT MIDDLEWARE
 * Check if user can perform action based on plan limits
 */
export const enforcePlanLimits = (action) => {
  return async (req, res, next) => {
    try {
      const userContext = req.userContext;
      
      if (!userContext) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'USER_CONTEXT_MISSING',
            message: 'User context not available'
          }
        });
      }
      
      // Check action-specific limits
      const violation = await checkPlanViolation(userContext, action);
      
      if (violation) {
        return res.status(403).json({
          success: false,
          error: violation
        });
      }
      
      next();
      
    } catch (error) {
      console.error('❌ Plan enforcement error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'PLAN_ENFORCEMENT_ERROR',
          message: 'Error checking plan limits'
        }
      });
    }
  };
};

/**
 * Check for plan violations
 */
async function checkPlanViolation(userContext, action) {
  const { plan, usage } = userContext;
  
  switch (action) {
    case 'CREATE_SCAN':
      if (usage.scans >= plan.dailyScans) {
        return {
          code: 'DAILY_LIMIT_REACHED',
          message: `Daily scan limit reached (${plan.dailyScans}). Upgrade to continue.`,
          upgradeRequired: true,
          currentUsage: usage.scans,
          limit: plan.dailyScans
        };
      }
      break;
      
    case 'RETRY_SCAN':
      if (usage.retries >= plan.retries) {
        return {
          code: 'RETRY_LIMIT_REACHED',
          message: `Retry limit reached (${plan.retries}). Upgrade for more retries.`,
          upgradeRequired: true,
          currentUsage: usage.retries,
          limit: plan.retries
        };
      }
      break;
      
    case 'DOWNLOAD_RESULTS':
      if (!plan.downloads) {
        return {
          code: 'DOWNLOADS_RESTRICTED',
          message: 'Downloads require a premium plan.',
          upgradeRequired: true
        };
      }
      break;
  }
  
  return null; // No violation
}