import express from 'express';
import cors from 'cors';
import scanRoutes from './routes/scan.routes.js';
import cacheRoutes from './routes/cache.routes.js';
import monitoringRoutes from './routes/monitoring.routes.js';
import healthRoutes from './routes/health.routes.js';

// Security and middleware imports
import {
  applySecurityHeaders,
  corsWithSecurity,
  rateLimitMiddleware,
  validateInput,
  errorHandler,
  requestLogger,
  timeoutMiddleware
} from './middleware/security.middleware.js';

import configService from './services/configuration.service.js';
import securityService from './services/security.service.js';
import rateLimitService from './services/rateLimit.service.js';

// Validate configuration at startup
try {
  configService.validateAndLoad(true); // Fail fast if configuration invalid
  console.log('✅ Configuration validated successfully');
} catch (error) {
  console.error('❌ Configuration validation failed:', error.message);
  process.exit(1);
}

const app = express();

// Global error handlers for unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in production, log and continue
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // In production, gracefully shutdown
  if (configService.isProduction()) {
    setTimeout(() => process.exit(1), 1000);
  }
});

// Security middleware (applied to all routes)
app.use(applySecurityHeaders);
app.use(requestLogger());
app.use(timeoutMiddleware(30000)); // 30 second request timeout

// CORS with security controls
const corsOrigins = configService.get('CORS_ORIGINS', ['http://localhost:3000']);
app.use(corsWithSecurity(corsOrigins));

// Body parsing with size limits
app.use(express.json({ 
  limit: '1mb', // Reduced from 10mb for security
  strict: true
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '1mb' 
}));

// Rate limiting (if enabled)
if (configService.get('RATE_LIMIT_ENABLED', true)) {
  app.use('/api/scan', rateLimitMiddleware(rateLimitService, 'SCAN_CREATION'));
  app.use('/api/scan/*/poll', rateLimitMiddleware(rateLimitService, 'POLLING'));
}

// Input validation for scan requests
app.use(validateInput(securityService));

// Health and monitoring endpoints (no rate limiting)
app.use('/api', healthRoutes);

// API routes with security
app.use('/api/scan', scanRoutes);
app.use('/api/cache', cacheRoutes);
app.use('/api/monitoring', monitoringRoutes);

// 404 handler with security headers
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    timestamp: new Date().toISOString()
  });
});

// Centralized error handling
app.use(errorHandler);

export default app;