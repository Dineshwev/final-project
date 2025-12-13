/**
 * 🧪 IN-MEMORY DATABASE MOCK
 * 
 * Provides SQLite-based mock for testing database integration
 * when PostgreSQL is not available in development environment
 */

class MockDatabaseRepository {
    constructor() {
        this.scans = new Map();
        this.services = new Map();
        this.cache = new Map(); // Add cache storage
        this.scanMetrics = new Map(); // Add scan metrics storage
        this.serviceMetrics = new Map(); // Add service metrics storage
        this.isHealthy = true;
    }

    async createScan(url) {
        const id = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const scan = {
            id,
            url,
            status: 'pending',
            started_at: new Date(),
            completed_at: null,
            progress_completed: 0,
            progress_total: 6,
            progress_percentage: 0,
            created_at: new Date(),
            updated_at: new Date()
        };

        this.scans.set(id, scan);

        // Create service records
        const serviceNames = ['accessibility', 'duplicateContent', 'backlinks', 'schema', 'multiLanguage', 'rankTracker'];
        serviceNames.forEach(serviceName => {
            const serviceId = `${id}_${serviceName}`;
            this.services.set(serviceId, {
                id: serviceId,
                scan_id: id,
                service_name: serviceName,
                status: 'pending',
                score: null,
                data: null,
                issues: null,
                error: null,
                execution_time_ms: null,
                retry_attempts: 0,
                max_retry_attempts: 2,
                started_at: null,
                completed_at: null,
                created_at: new Date(),
                updated_at: new Date()
            });
        });

        console.log(`🧪 [MOCK] Created scan ${id} in memory`);
        return scan;
    }

    async getScanById(scanId) {
        const scan = this.scans.get(scanId);
        if (!scan) return null;

        // Calculate progress from services
        const services = this.getScanServicesSync(scanId);
        const completed = services.filter(s => s.status === 'success' || s.status === 'failed').length;
        const percentage = Math.floor((completed / services.length) * 100);

        scan.progress_completed = completed;
        scan.progress_percentage = percentage;

        return scan;
    }

    async updateScanStatus(scanId, status) {
        const scan = this.scans.get(scanId);
        if (!scan) return null;

        scan.status = status;
        scan.updated_at = new Date();
        
        if (['completed', 'partial', 'failed'].includes(status) && !scan.completed_at) {
            scan.completed_at = new Date();
        }

        console.log(`🧪 [MOCK] Updated scan ${scanId} status to ${status}`);
        return scan;
    }

    getScanServicesSync(scanId) {
        const services = [];
        for (const [key, service] of this.services.entries()) {
            if (service.scan_id === scanId) {
                services.push(service);
            }
        }
        return services.sort((a, b) => a.service_name.localeCompare(b.service_name));
    }

    async getScanServices(scanId) {
        return this.getScanServicesSync(scanId);
    }

    async updateServiceStatus(scanId, serviceName, status) {
        const serviceId = `${scanId}_${serviceName}`;
        const service = this.services.get(serviceId);
        
        if (!service) return null;

        service.status = status;
        service.updated_at = new Date();
        
        if (status === 'running') {
            service.started_at = new Date();
        }

        console.log(`🧪 [MOCK] Updated service ${serviceName} status to ${status}`);
        return service;
    }

    async updateServiceResult(scanId, serviceName, resultData) {
        const serviceId = `${scanId}_${serviceName}`;
        const service = this.services.get(serviceId);
        
        if (!service) return null;

        service.status = resultData.status;
        service.score = resultData.score;
        service.data = resultData.data ? JSON.stringify(resultData.data) : null;
        service.issues = resultData.issues ? JSON.stringify(resultData.issues) : null;
        service.error = resultData.error ? JSON.stringify(resultData.error) : null;
        service.execution_time_ms = resultData.executionTimeMs;
        service.completed_at = new Date();
        service.updated_at = new Date();

        // Auto-update scan status
        const allServices = this.getScanServicesSync(scanId);
        const completed = allServices.filter(s => s.status === 'success' || s.status === 'failed').length;
        const successful = allServices.filter(s => s.status === 'success').length;

        if (completed === allServices.length) {
            const scanStatus = successful === allServices.length ? 'completed' : 
                             successful > 0 ? 'partial' : 'failed';
            await this.updateScanStatus(scanId, scanStatus);
        }

        console.log(`🧪 [MOCK] Updated service ${serviceName} result`);
        return service;
    }

    async getRetryableServices(scanId) {
        const services = this.getScanServicesSync(scanId);
        return services.filter(s => 
            s.status === 'failed' && 
            s.retry_attempts < s.max_retry_attempts
        );
    }

    async incrementRetryAttempt(scanId, serviceName) {
        const serviceId = `${scanId}_${serviceName}`;
        const service = this.services.get(serviceId);
        
        if (!service) return null;

        service.retry_attempts += 1;
        service.status = 'pending';
        service.error = null;
        service.started_at = null;
        service.completed_at = null;
        service.updated_at = new Date();

        console.log(`🧪 [MOCK] Incremented retry for ${serviceName} (${service.retry_attempts}/${service.max_retry_attempts})`);
        return service;
    }

    async getScanHistory(limit = 50) {
        const scans = Array.from(this.scans.values())
            .sort((a, b) => b.created_at - a.created_at)
            .slice(0, limit);
        
        return scans.map(scan => ({
            id: scan.id,
            url: scan.url,
            status: scan.status,
            started_at: scan.started_at,
            completed_at: scan.completed_at,
            progress_percentage: scan.progress_percentage
        }));
    }

    async cleanupOldScans(olderThanHours = 24) {
        const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
        let deletedCount = 0;

        for (const [scanId, scan] of this.scans.entries()) {
            if (scan.created_at < cutoffTime) {
                this.scans.delete(scanId);
                
                // Delete associated services
                for (const [serviceId, service] of this.services.entries()) {
                    if (service.scan_id === scanId) {
                        this.services.delete(serviceId);
                    }
                }
                
                deletedCount++;
            }
        }

        console.log(`🧪 [MOCK] Cleaned up ${deletedCount} old scans`);
        return deletedCount;
    }

    /**
     * 🚀 CACHE OPERATIONS (MOCK)
     */

    async getCacheEntry(cacheKey) {
        const entry = this.cache.get(cacheKey);
        if (entry && new Date() > entry.expires_at) {
            // Auto-cleanup expired entries
            this.cache.delete(cacheKey);
            return null;
        }
        return entry;
    }

    async setCacheEntry(cacheKey, scanId, expiresAt) {
        if (this.cache.has(cacheKey)) {
            return false; // Already exists
        }
        
        this.cache.set(cacheKey, {
            cache_key: cacheKey,
            scan_id: scanId,
            expires_at: expiresAt,
            created_at: new Date()
        });
        return true;
    }

    async removeCacheEntry(cacheKey) {
        return this.cache.delete(cacheKey);
    }

    async cleanupExpiredCache() {
        const now = new Date();
        let deletedCount = 0;
        
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expires_at) {
                this.cache.delete(key);
                deletedCount++;
            }
        }
        
        return deletedCount;
    }

    async getCacheStats() {
        const now = new Date();
        let expired = 0;
        let valid = 0;
        
        for (const entry of this.cache.values()) {
            if (now > entry.expires_at) {
                expired++;
            } else {
                valid++;
            }
        }
        
        return {
            total_entries: this.cache.size,
            expired_entries: expired,
            valid_entries: valid
        };
    }

    /**
     * 📊 METRICS & OBSERVABILITY (MOCK)
     */

    async insertScanMetric(scanContext) {
        const id = `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.scanMetrics.set(id, {
            id,
            scan_id: scanContext.scanId,
            user_type: scanContext.userType,
            plan: scanContext.plan,
            url: scanContext.url,
            status: scanContext.status,
            cached: scanContext.cached || false,
            total_execution_time_ms: scanContext.totalExecutionTime,
            services_executed: scanContext.servicesExecuted || 0,
            services_failed: scanContext.servicesFailed || 0,
            cache_hit: scanContext.cached || false,
            created_at: new Date()
        });
        return { id };
    }

    async insertServiceMetric(scanId, serviceContext) {
        const id = `service_metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.serviceMetrics.set(id, {
            id,
            scan_id: scanId,
            service_name: serviceContext.serviceName,
            status: serviceContext.status,
            execution_time_ms: serviceContext.executionTime,
            retry_attempts: serviceContext.retryAttempts || 0,
            error_code: serviceContext.errorCode || null,
            error_message: serviceContext.errorMessage || null,
            created_at: new Date()
        });
        return { id };
    }

    async getMetricsStats(timeRange = '24h') {
        const cutoff = new Date();
        const hours = timeRange === '7d' ? 168 : timeRange === '1h' ? 1 : 24;
        cutoff.setHours(cutoff.getHours() - hours);

        const recentMetrics = Array.from(this.scanMetrics.values())
            .filter(metric => metric.created_at >= cutoff);

        if (recentMetrics.length === 0) {
            return {
                total_scans: 0,
                completed_scans: 0,
                failed_scans: 0,
                cached_scans: 0,
                avg_execution_time: 0,
                guest_scans: 0,
                free_scans: 0,
                pro_scans: 0,
                cache_hit_rate: 0
            };
        }

        const totalScans = recentMetrics.length;
        const completedScans = recentMetrics.filter(m => m.status === 'completed').length;
        const failedScans = recentMetrics.filter(m => m.status === 'failed').length;
        const cachedScans = recentMetrics.filter(m => m.cached).length;
        
        const avgExecutionTime = recentMetrics
            .filter(m => m.total_execution_time_ms)
            .reduce((sum, m) => sum + m.total_execution_time_ms, 0) / totalScans;

        return {
            total_scans: totalScans,
            completed_scans: completedScans,
            failed_scans: failedScans,
            cached_scans: cachedScans,
            avg_execution_time: avgExecutionTime,
            guest_scans: recentMetrics.filter(m => m.user_type === 'GUEST').length,
            free_scans: recentMetrics.filter(m => m.user_type === 'FREE').length,
            pro_scans: recentMetrics.filter(m => m.user_type === 'PRO').length,
            cache_hit_rate: (cachedScans / totalScans) * 100
        };
    }

    async getServicePerformance(timeRange = '24h') {
        const cutoff = new Date();
        const hours = timeRange === '7d' ? 168 : timeRange === '1h' ? 1 : 24;
        cutoff.setHours(cutoff.getHours() - hours);

        const recentMetrics = Array.from(this.serviceMetrics.values())
            .filter(metric => metric.created_at >= cutoff);

        const serviceStats = {};
        
        recentMetrics.forEach(metric => {
            const serviceName = metric.service_name;
            if (!serviceStats[serviceName]) {
                serviceStats[serviceName] = {
                    service_name: serviceName,
                    total_executions: 0,
                    successful_executions: 0,
                    failed_executions: 0,
                    execution_times: [],
                    total_retries: 0
                };
            }
            
            const stats = serviceStats[serviceName];
            stats.total_executions++;
            
            if (metric.status === 'success') stats.successful_executions++;
            if (metric.status === 'failed') stats.failed_executions++;
            if (metric.execution_time_ms) stats.execution_times.push(metric.execution_time_ms);
            stats.total_retries += metric.retry_attempts;
        });

        return Object.values(serviceStats).map(stats => ({
            ...stats,
            avg_execution_time: stats.execution_times.length > 0 
                ? stats.execution_times.reduce((a, b) => a + b, 0) / stats.execution_times.length 
                : 0,
            max_execution_time: stats.execution_times.length > 0 ? Math.max(...stats.execution_times) : 0,
            min_execution_time: stats.execution_times.length > 0 ? Math.min(...stats.execution_times) : 0,
            success_rate: stats.total_executions > 0 
                ? (stats.successful_executions / stats.total_executions) * 100 
                : 0
        }));
    }

    async getErrorAnalysis(timeRange = '24h') {
        const cutoff = new Date();
        const hours = timeRange === '7d' ? 168 : timeRange === '1h' ? 1 : 24;
        cutoff.setHours(cutoff.getHours() - hours);

        const errorMetrics = Array.from(this.serviceMetrics.values())
            .filter(metric => 
                metric.created_at >= cutoff && 
                metric.status === 'failed' && 
                metric.error_code
            );

        const errorStats = {};
        
        errorMetrics.forEach(metric => {
            const key = `${metric.error_code}_${metric.service_name}`;
            if (!errorStats[key]) {
                errorStats[key] = {
                    error_code: metric.error_code,
                    service_name: metric.service_name,
                    error_count: 0,
                    retry_attempts: []
                };
            }
            
            errorStats[key].error_count++;
            errorStats[key].retry_attempts.push(metric.retry_attempts);
        });

        return Object.values(errorStats)
            .map(stats => ({
                ...stats,
                avg_retries: stats.retry_attempts.length > 0 
                    ? stats.retry_attempts.reduce((a, b) => a + b, 0) / stats.retry_attempts.length 
                    : 0
            }))
            .sort((a, b) => b.error_count - a.error_count)
            .slice(0, 20);
    }

    async healthCheck() {
        return {
            status: this.isHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date(),
            pool: {
                totalCount: 1,
                idleCount: 1,
                waitingCount: 0
            },
            mode: 'mock'
        };
    }

    async close() {
        console.log('🧪 [MOCK] Database mock closed');
    }
}

export default MockDatabaseRepository;