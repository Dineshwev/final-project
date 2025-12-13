/**
 * Health Routes
 * Provides health check endpoints for monitoring and orchestration
 */

import { Router } from 'express';
import healthController from '../controllers/health.controller.js';

const router = Router();

/**
 * Basic health check
 * Used by load balancers and monitoring systems
 * GET /api/health
 */
router.get('/health', healthController.getHealth.bind(healthController));

/**
 * Readiness check
 * Indicates if the service is ready to accept traffic
 * GET /api/health/ready
 */
router.get('/health/ready', healthController.getReadiness.bind(healthController));

/**
 * Liveness check
 * Indicates if the service is alive and should not be restarted
 * GET /api/health/live
 */
router.get('/health/live', healthController.getLiveness.bind(healthController));

/**
 * System metrics
 * Provides detailed system metrics for monitoring
 * GET /api/health/metrics
 */
router.get('/health/metrics', healthController.getMetrics.bind(healthController));

export default router;