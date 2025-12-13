/**
 * 📊 MONITORING & OBSERVABILITY CONTROLLER
 * 
 * API endpoints for retrieving metrics, performance data, and system diagnostics.
 * Provides comprehensive insights for production monitoring and cost analysis.
 * 
 * Features:
 * - System performance metrics
 * - Service-level analytics  
 * - Error analysis and trends
 * - Cost optimization insights
 * - Cache effectiveness monitoring
 * 
 * Version: 1.0
 * Last Modified: December 13, 2025
 */

import dbRepository from '../database/repository.js';
import { getCacheStats } from '../services/cache.service.js';

/**
 * 📈 GET SYSTEM METRICS
 * Returns comprehensive system performance metrics
 * 
 * GET /api/monitoring/metrics?timeRange=24h
 */
export const getSystemMetrics = async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    
    // Validate timeRange
    const validRanges = ['1h', '24h', '7d'];
    if (!validRanges.includes(timeRange)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid time range. Use: 1h, 24h, 7d',
        code: 'INVALID_TIME_RANGE'
      });
    }

    // Get metrics from database
    const metrics = await dbRepository.getMetricsStats(timeRange);
    const cacheStats = await getCacheStats();
    
    res.json({
      success: true,
      data: {
        timeRange,
        systemMetrics: {
          totalScans: parseInt(metrics?.total_scans || 0),
          completedScans: parseInt(metrics?.completed_scans || 0), 
          failedScans: parseInt(metrics?.failed_scans || 0),
          cachedScans: parseInt(metrics?.cached_scans || 0),
          averageExecutionTime: Math.round(metrics?.avg_execution_time || 0),
          cacheHitRate: Math.round((metrics?.cache_hit_rate || 0) * 100) / 100
        },
        userDistribution: {
          guestScans: parseInt(metrics?.guest_scans || 0),
          freeScans: parseInt(metrics?.free_scans || 0),
          proScans: parseInt(metrics?.pro_scans || 0)
        },
        cacheMetrics: {
          totalEntries: cacheStats.total_entries || 0,
          validEntries: cacheStats.valid_entries || 0,
          expiredEntries: cacheStats.expired_entries || 0
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('🚨 System metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system metrics',
      code: 'METRICS_ERROR'
    });
  }
};

/**
 * 🔧 GET SERVICE PERFORMANCE
 * Returns detailed performance metrics for each service
 * 
 * GET /api/monitoring/services?timeRange=24h
 */
export const getServicePerformance = async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    
    // Validate timeRange
    const validRanges = ['1h', '24h', '7d'];
    if (!validRanges.includes(timeRange)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid time range. Use: 1h, 24h, 7d',
        code: 'INVALID_TIME_RANGE'
      });
    }

    const serviceMetrics = await dbRepository.getServicePerformance(timeRange);
    
    res.json({
      success: true,
      data: {
        timeRange,
        services: serviceMetrics.map(service => ({
          serviceName: service.service_name,
          totalExecutions: parseInt(service.total_executions),
          successfulExecutions: parseInt(service.successful_executions),
          failedExecutions: parseInt(service.failed_executions),
          successRate: Math.round(service.success_rate * 100) / 100,
          averageExecutionTime: Math.round(service.avg_execution_time || 0),
          maxExecutionTime: parseInt(service.max_execution_time || 0),
          minExecutionTime: parseInt(service.min_execution_time || 0),
          totalRetries: parseInt(service.total_retries || 0)
        })),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('🚨 Service performance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve service performance',
      code: 'SERVICE_PERFORMANCE_ERROR'
    });
  }
};

/**
 * 🚨 GET ERROR ANALYSIS
 * Returns detailed error analysis and troubleshooting data
 * 
 * GET /api/monitoring/errors?timeRange=24h
 */
export const getErrorAnalysis = async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    
    const errorData = await dbRepository.getErrorAnalysis(timeRange);
    
    res.json({
      success: true,
      data: {
        timeRange,
        errors: errorData.map(error => ({
          errorCode: error.error_code,
          serviceName: error.service_name,
          errorCount: parseInt(error.error_count),
          averageRetries: Math.round(error.avg_retries * 100) / 100
        })),
        summary: {
          totalUniqueErrors: errorData.length,
          totalErrorOccurrences: errorData.reduce((sum, error) => sum + parseInt(error.error_count), 0)
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('🚨 Error analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve error analysis',
      code: 'ERROR_ANALYSIS_ERROR'
    });
  }
};

/**
 * 💰 GET COST ANALYSIS
 * Returns cost optimization insights and API usage patterns
 * 
 * GET /api/monitoring/costs?timeRange=24h
 */
export const getCostAnalysis = async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    
    const metrics = await dbRepository.getMetricsStats(timeRange);
    const serviceMetrics = await dbRepository.getServicePerformance(timeRange);
    const cacheStats = await getCacheStats();
    
    // Calculate cost savings
    const totalScans = parseInt(metrics?.total_scans || 0);
    const cachedScans = parseInt(metrics?.cached_scans || 0);
    const freshScans = totalScans - cachedScans;
    
    const estimatedApiCostPerScan = 0.05; // $0.05 per scan assumption
    const costSaved = cachedScans * estimatedApiCostPerScan;
    const totalApiCost = freshScans * estimatedApiCostPerScan;
    const savingsRate = totalScans > 0 ? (cachedScans / totalScans) * 100 : 0;
    
    res.json({
      success: true,
      data: {
        timeRange,
        costMetrics: {
          totalScans,
          freshScans,
          cachedScans,
          estimatedApiCost: Math.round(totalApiCost * 100) / 100,
          estimatedSavings: Math.round(costSaved * 100) / 100,
          savingsRate: Math.round(savingsRate * 100) / 100
        },
        serviceEfficiency: serviceMetrics.map(service => ({
          serviceName: service.service_name,
          averageExecutionTime: Math.round(service.avg_execution_time || 0),
          successRate: Math.round(service.success_rate * 100) / 100,
          retryRate: service.total_executions > 0 
            ? Math.round((service.total_retries / service.total_executions) * 100) / 100 
            : 0
        })),
        cacheEffectiveness: {
          hitRate: Math.round(((metrics?.cache_hit_rate || 0)) * 100) / 100,
          validEntries: cacheStats.valid_entries || 0,
          storageEfficiency: cacheStats.total_entries > 0 
            ? Math.round((cacheStats.valid_entries / cacheStats.total_entries) * 100) 
            : 0
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('🚨 Cost analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cost analysis',
      code: 'COST_ANALYSIS_ERROR'
    });
  }
};

/**
 * 🏥 GET SYSTEM HEALTH
 * Returns overall system health and diagnostics
 * 
 * GET /api/monitoring/health
 */
export const getSystemHealth = async (req, res) => {
  try {
    // Check database health
    const dbHealth = await dbRepository.healthCheck();
    
    // Get recent metrics to assess system state
    const recentMetrics = await dbRepository.getMetricsStats('1h');
    const recentErrors = await dbRepository.getErrorAnalysis('1h');
    
    // Calculate health scores
    const completionRate = recentMetrics?.total_scans > 0 
      ? (recentMetrics.completed_scans / recentMetrics.total_scans) * 100 
      : 100;
    
    const errorRate = recentMetrics?.total_scans > 0 
      ? (recentMetrics.failed_scans / recentMetrics.total_scans) * 100 
      : 0;
    
    const avgResponseTime = recentMetrics?.avg_execution_time || 0;
    
    // Determine overall health status
    let healthStatus = 'healthy';
    let healthScore = 100;
    
    if (errorRate > 10) {
      healthStatus = 'unhealthy';
      healthScore -= 30;
    } else if (errorRate > 5) {
      healthStatus = 'degraded';
      healthScore -= 15;
    }
    
    if (avgResponseTime > 10000) { // 10 seconds
      healthStatus = healthStatus === 'healthy' ? 'degraded' : 'unhealthy';
      healthScore -= 20;
    }
    
    if (completionRate < 80) {
      healthStatus = 'unhealthy';
      healthScore -= 25;
    }
    
    res.json({
      success: true,
      data: {
        status: healthStatus,
        healthScore: Math.max(0, healthScore),
        components: {
          database: {
            status: dbHealth.status,
            mode: dbHealth.mode || 'postgresql'
          },
          scanProcessing: {
            status: completionRate > 90 ? 'healthy' : completionRate > 80 ? 'degraded' : 'unhealthy',
            completionRate: Math.round(completionRate * 100) / 100,
            errorRate: Math.round(errorRate * 100) / 100
          },
          performance: {
            status: avgResponseTime < 5000 ? 'healthy' : avgResponseTime < 10000 ? 'degraded' : 'unhealthy',
            averageResponseTime: Math.round(avgResponseTime)
          },
          cache: {
            status: 'healthy', // Cache failures don't affect core functionality
            hitRate: Math.round((recentMetrics?.cache_hit_rate || 0) * 100) / 100
          }
        },
        recentActivity: {
          totalScans: parseInt(recentMetrics?.total_scans || 0),
          uniqueErrors: recentErrors.length,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('🚨 System health error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system health',
      code: 'HEALTH_CHECK_ERROR'
    });
  }
};