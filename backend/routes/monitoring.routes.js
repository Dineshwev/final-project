/**
 * 📊 MONITORING & OBSERVABILITY ROUTES
 * 
 * API routes for metrics, performance monitoring, and system diagnostics.
 * Provides comprehensive observability for production systems.
 * 
 * Version: 1.0
 * Last Modified: December 13, 2025
 */

import express from 'express';
import { 
  getSystemMetrics,
  getServicePerformance,
  getErrorAnalysis,
  getCostAnalysis,
  getSystemHealth
} from '../controllers/monitoring.controller.js';

const router = express.Router();

// 📈 System Metrics - GET /api/monitoring/metrics
router.get('/metrics', getSystemMetrics);

// 🔧 Service Performance - GET /api/monitoring/services  
router.get('/services', getServicePerformance);

// 🚨 Error Analysis - GET /api/monitoring/errors
router.get('/errors', getErrorAnalysis);

// 💰 Cost Analysis - GET /api/monitoring/costs
router.get('/costs', getCostAnalysis);

// 🏥 System Health - GET /api/monitoring/health
router.get('/health', getSystemHealth);

export default router;