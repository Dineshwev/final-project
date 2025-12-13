/**
 * Health Controller
 * Provides health checks and system status endpoints
 */

import dbRepository from '../database/repository.js';
import cacheService from '../services/cache.service.js';
import configService from '../services/configuration.service.js';
import rateLimitService from '../services/rateLimit.service.js';
import timeoutService from '../services/timeout.service.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class HealthController {
  constructor() {
    this.startTime = Date.now();
    this.version = this.getVersionInfo();
  }

  /**
   * Basic health check
   */
  async getHealth(req, res) {
    try {
      const health = await this.performHealthCheck();
      const statusCode = health.status === 'healthy' ? 200 : 503;
      
      res.status(statusCode).json({
        success: health.status === 'healthy',
        ...health
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Detailed readiness check
   */
  async getReadiness(req, res) {
    try {
      const readiness = await this.performReadinessCheck();
      const statusCode = readiness.ready ? 200 : 503;
      
      res.status(statusCode).json({
        success: readiness.ready,
        ...readiness
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        ready: false,
        error: 'Readiness check failed',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Liveness check for container orchestration
   */
  async getLiveness(req, res) {
    try {
      const uptime = Date.now() - this.startTime;
      const memoryUsage = process.memoryUsage();
      
      // Simple liveness check - server is alive if we can respond
      res.status(200).json({
        success: true,
        status: 'alive',
        uptime: uptime,
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024)
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        status: 'dead',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * System metrics endpoint
   */
  async getMetrics(req, res) {
    try {
      const metrics = await this.getSystemMetrics();
      
      res.status(200).json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve metrics',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck() {
    const checks = {
      database: await this.checkDatabase(),
      cache: await this.checkCache(),
      configuration: this.checkConfiguration(),
      memory: this.checkMemory(),
      services: this.checkServices()
    };

    const unhealthyChecks = Object.entries(checks)
      .filter(([, check]) => check.status !== 'healthy')
      .map(([name]) => name);

    const overallStatus = unhealthyChecks.length === 0 ? 'healthy' : 'degraded';
    const healthScore = this.calculateHealthScore(checks);

    return {
      status: overallStatus,
      healthScore,
      checks,
      uptime: Date.now() - this.startTime,
      version: this.version,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Perform readiness check
   */
  async performReadinessCheck() {
    const checks = {
      database: await this.checkDatabase(),
      cache: await this.checkCache(),
      configuration: this.checkConfiguration()
    };

    const failedChecks = Object.entries(checks)
      .filter(([, check]) => check.status === 'unhealthy')
      .map(([name]) => name);

    const ready = failedChecks.length === 0;

    return {
      ready,
      checks,
      failedChecks,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check database connectivity
   */
  async checkDatabase() {
    try {
      const result = await dbRepository.healthCheck();
      
      return {
        status: result.status === 'healthy' ? 'healthy' : 'unhealthy',
        responseTime: result.responseTime || 0,
        mode: result.mode || 'unknown',
        error: result.error || null
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        responseTime: 0
      };
    }
  }

  /**
   * Check cache service
   */
  async checkCache() {
    try {
      const stats = await cacheService.getStats();
      
      return {
        status: 'healthy',
        entries: stats.total_entries || 0,
        validEntries: stats.valid_entries || 0,
        hitRate: stats.cache_hit_rate || 0
      };
    } catch (error) {
      return {
        status: 'degraded',
        error: error.message,
        entries: 0
      };
    }
  }

  /**
   * Check configuration
   */
  checkConfiguration() {
    try {
      const configStatus = configService.getStatus();
      
      return {
        status: configStatus.isValidated ? 'healthy' : 'unhealthy',
        validated: configStatus.isValidated,
        environment: configStatus.environment,
        hasSecrets: configStatus.hasRequiredSecrets
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        validated: false
      };
    }
  }

  /**
   * Check memory usage
   */
  checkMemory() {
    try {
      const memoryUsage = process.memoryUsage();
      const memoryMB = {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      };

      // Warning if heap usage > 500MB, critical if > 1GB
      const status = memoryMB.heapUsed > 1024 ? 'unhealthy' :
                    memoryMB.heapUsed > 512 ? 'degraded' : 'healthy';

      return {
        status,
        usage: memoryMB,
        warning: memoryMB.heapUsed > 512 ? 'High memory usage' : null
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  /**
   * Check services status
   */
  checkServices() {
    try {
      const rateLimitStats = rateLimitService.getStats();
      const timeoutStats = timeoutService.getStats();

      return {
        status: 'healthy',
        rateLimit: {
          activeKeys: rateLimitStats.activeKeys,
          suspiciousIPs: rateLimitStats.suspiciousIPs
        },
        timeouts: {
          activeOperations: timeoutStats.activeOperations,
          defaultTimeout: timeoutStats.defaultServiceTimeout
        }
      };
    } catch (error) {
      return {
        status: 'degraded',
        error: error.message
      };
    }
  }

  /**
   * Calculate overall health score
   */
  calculateHealthScore(checks) {
    const totalChecks = Object.keys(checks).length;
    const healthyChecks = Object.values(checks)
      .filter(check => check.status === 'healthy').length;
    const degradedChecks = Object.values(checks)
      .filter(check => check.status === 'degraded').length;

    // Health score: healthy=100%, degraded=50%, unhealthy=0%
    return Math.round(((healthyChecks + degradedChecks * 0.5) / totalChecks) * 100);
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics() {
    const uptime = Date.now() - this.startTime;
    const memoryUsage = process.memoryUsage();

    return {
      system: {
        uptime,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid
      },
      memory: {
        rss: memoryUsage.rss,
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external
      },
      eventLoop: {
        lag: await this.getEventLoopLag()
      },
      version: this.version,
      environment: process.env.NODE_ENV
    };
  }

  /**
   * Measure event loop lag
   */
  async getEventLoopLag() {
    return new Promise((resolve) => {
      const start = Date.now();
      setImmediate(() => {
        resolve(Date.now() - start);
      });
    });
  }

  /**
   * Get version information
   */
  getVersionInfo() {
    try {
      const packagePath = join(__dirname, '../../package.json');
      const packageInfo = JSON.parse(readFileSync(packagePath, 'utf8'));
      
      return {
        name: packageInfo.name || 'seo-tools-backend',
        version: packageInfo.version || '1.0.0',
        description: packageInfo.description || 'SEO Tools Backend API'
      };
    } catch (error) {
      return {
        name: 'seo-tools-backend',
        version: '1.0.0',
        description: 'SEO Tools Backend API'
      };
    }
  }
}

export default new HealthController();