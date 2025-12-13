/**
 * 🗄️ DATABASE REPOSITORY
 * 
 * PostgreSQL data access layer for scan persistence
 * Provides transaction-safe operations for scan lifecycle management
 */

import { Pool } from 'pg';
import MockDatabaseRepository from './mockRepository.js';

class DatabaseRepository {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            database: process.env.DB_NAME || 'seotools',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        // Standard service names for validation
        this.SERVICE_NAMES = [
            'accessibility',
            'duplicateContent', 
            'backlinks',
            'schema',
            'multiLanguage',
            'rankTracker'
        ];

        this.isPostgreSQLAvailable = null;
        this.mockRepository = null;
    }

    async checkPostgreSQLAvailability() {
        if (this.isPostgreSQLAvailable !== null) {
            return this.isPostgreSQLAvailable;
        }

        try {
            const result = await this.pool.query('SELECT NOW()');
            this.isPostgreSQLAvailable = true;
            console.log('✅ PostgreSQL connected successfully');
            return true;
        } catch (error) {
            this.isPostgreSQLAvailable = false;
            this.mockRepository = new MockDatabaseRepository();
            console.log('🧪 PostgreSQL not available, using mock repository for development');
            return false;
        }
    }

    async ensureConnection() {
        const isAvailable = await this.checkPostgreSQLAvailability();
        if (!isAvailable && !this.mockRepository) {
            this.mockRepository = new MockDatabaseRepository();
        }
        return isAvailable;
    }

    /**
     * 🔄 SCAN OPERATIONS
     */

    async createScan(url) {
        const isPostgreSQL = await this.ensureConnection();
        
        if (!isPostgreSQL) {
            return await this.mockRepository.createScan(url);
        }

        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Create scan record
            const scanQuery = `
                INSERT INTO scans (url, status) 
                VALUES ($1, 'pending') 
                RETURNING id, url, status, started_at, progress_completed, progress_total, progress_percentage
            `;
            const scanResult = await client.query(scanQuery, [url]);
            const scan = scanResult.rows[0];

            // Create service records for all standard services
            const serviceQuery = `
                INSERT INTO scan_services (scan_id, service_name, status) 
                VALUES ($1, $2, 'pending')
            `;
            
            for (const serviceName of this.SERVICE_NAMES) {
                await client.query(serviceQuery, [scan.id, serviceName]);
            }

            await client.query('COMMIT');
            return scan;

        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error(`Failed to create scan: ${error.message}`);
        } finally {
            client.release();
        }
    }

    async getScanById(scanId) {
        const isPostgreSQL = await this.ensureConnection();
        
        if (!isPostgreSQL) {
            return await this.mockRepository.getScanById(scanId);
        }

        const query = `
            SELECT 
                id, url, status, started_at, completed_at,
                progress_completed, progress_total, progress_percentage,
                created_at, updated_at
            FROM scans 
            WHERE id = $1
        `;
        
        const result = await this.pool.query(query, [scanId]);
        return result.rows[0] || null;
    }

    async updateScanStatus(scanId, status) {
        const isPostgreSQL = await this.ensureConnection();
        
        if (!isPostgreSQL) {
            return await this.mockRepository.updateScanStatus(scanId, status);
        }

        const query = `
            UPDATE scans 
            SET status = $1,
                completed_at = CASE WHEN $1 IN ('completed', 'partial', 'failed') 
                                   THEN COALESCE(completed_at, NOW()) 
                                   ELSE completed_at END
            WHERE id = $2
            RETURNING id, status, completed_at
        `;
        
        const result = await this.pool.query(query, [status, scanId]);
        return result.rows[0] || null;
    }

    /**
     * 🛠️ SERVICE OPERATIONS
     */

    async getScanServices(scanId) {
        const isPostgreSQL = await this.ensureConnection();
        
        if (!isPostgreSQL) {
            return await this.mockRepository.getScanServices(scanId);
        }

        const query = `
            SELECT 
                id, scan_id, service_name, status, score, data, issues, error,
                execution_time_ms, retry_attempts, max_retry_attempts,
                started_at, completed_at, created_at, updated_at
            FROM scan_services 
            WHERE scan_id = $1 
            ORDER BY service_name
        `;
        
        const result = await this.pool.query(query, [scanId]);
        return result.rows;
    }

    async updateServiceStatus(scanId, serviceName, status) {
        const isPostgreSQL = await this.ensureConnection();
        
        if (!isPostgreSQL) {
            return await this.mockRepository.updateServiceStatus(scanId, serviceName, status);
        }

        const query = `
            UPDATE scan_services 
            SET status = $1,
                started_at = CASE WHEN $1 = 'running' THEN COALESCE(started_at, NOW()) ELSE started_at END
            WHERE scan_id = $2 AND service_name = $3
            RETURNING id, status, started_at
        `;
        
        const result = await this.pool.query(query, [status, scanId, serviceName]);
        return result.rows[0] || null;
    }

    async updateServiceResult(scanId, serviceName, resultData) {
        const isPostgreSQL = await this.ensureConnection();
        
        if (!isPostgreSQL) {
            return await this.mockRepository.updateServiceResult(scanId, serviceName, resultData);
        }

        const {
            status = 'success',
            score = null,
            data = null,
            issues = [],
            error = null,
            executionTimeMs = null
        } = resultData;

        const query = `
            UPDATE scan_services 
            SET 
                status = $1,
                score = $2,
                data = $3,
                issues = $4,
                error = $5,
                execution_time_ms = $6,
                completed_at = NOW()
            WHERE scan_id = $7 AND service_name = $8
            RETURNING id, status, score, completed_at
        `;
        
        const result = await this.pool.query(query, [
            status,
            score,
            JSON.stringify(data),
            JSON.stringify(issues),
            JSON.stringify(error),
            executionTimeMs,
            scanId,
            serviceName
        ]);
        
        return result.rows[0] || null;
    }

    /**
     * 🔄 RETRY OPERATIONS
     */

    async getRetryableServices(scanId) {
        const isPostgreSQL = await this.ensureConnection();
        
        if (!isPostgreSQL) {
            return await this.mockRepository.getRetryableServices(scanId);
        }

        const query = `
            SELECT 
                service_name, status, retry_attempts, max_retry_attempts,
                error, execution_time_ms
            FROM scan_services 
            WHERE scan_id = $1 
              AND status = 'failed' 
              AND retry_attempts < max_retry_attempts
            ORDER BY service_name
        `;
        
        const result = await this.pool.query(query, [scanId]);
        return result.rows;
    }

    async incrementRetryAttempt(scanId, serviceName) {
        const isPostgreSQL = await this.ensureConnection();
        
        if (!isPostgreSQL) {
            return await this.mockRepository.incrementRetryAttempt(scanId, serviceName);
        }

        const query = `
            UPDATE scan_services 
            SET 
                retry_attempts = retry_attempts + 1,
                status = 'pending',
                error = NULL,
                started_at = NULL,
                completed_at = NULL
            WHERE scan_id = $1 AND service_name = $2
            RETURNING id, retry_attempts, status
        `;
        
        const result = await this.pool.query(query, [scanId, serviceName]);
        return result.rows[0] || null;
    }

    /**
     * 📊 ANALYTICS & MONITORING
     */

    async getScanHistory(limit = 50) {
        const isPostgreSQL = await this.ensureConnection();
        
        if (!isPostgreSQL) {
            return await this.mockRepository.getScanHistory(limit);
        }

        const query = `
            SELECT 
                s.id, s.url, s.status, s.started_at, s.completed_at,
                s.progress_percentage,
                COUNT(ss.id) as total_services,
                COUNT(CASE WHEN ss.status = 'success' THEN 1 END) as successful_services,
                COUNT(CASE WHEN ss.status = 'failed' THEN 1 END) as failed_services
            FROM scans s
            LEFT JOIN scan_services ss ON s.id = ss.scan_id
            GROUP BY s.id, s.url, s.status, s.started_at, s.completed_at, s.progress_percentage
            ORDER BY s.created_at DESC
            LIMIT $1
        `;
        
        const result = await this.pool.query(query, [limit]);
        return result.rows;
    }

    async getServicePerformance() {
        const query = `
            SELECT 
                service_name,
                COUNT(*) as total_executions,
                COUNT(CASE WHEN status = 'success' THEN 1 END) as successes,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failures,
                AVG(execution_time_ms) as avg_execution_time,
                SUM(retry_attempts) as total_retries
            FROM scan_services
            WHERE completed_at IS NOT NULL
            GROUP BY service_name
            ORDER BY service_name
        `;
        
        const result = await this.pool.query(query);
        return result.rows;
    }

    /**
     * 👥 USER MANAGEMENT OPERATIONS
     */

    async createUser(userData) {
        const isPostgreSQL = await this.ensureConnection();
        
        if (!isPostgreSQL) {
            // Mock implementation
            const user = {
                id: userData.id || `user_${Date.now()}`,
                email: userData.email,
                plan: userData.plan || 'FREE',
                subscription_active: userData.subscriptionActive || false,
                subscription_expires_at: userData.subscriptionExpiresAt || null,
                created_at: new Date(),
                updated_at: new Date()
            };
            console.log(`🧪 [MOCK] Created user ${user.id}`);
            return user;
        }

        const query = `
            INSERT INTO users (id, email, plan, subscription_active, subscription_expires_at) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id, email, plan, subscription_active, subscription_expires_at, created_at
        `;
        
        const result = await this.pool.query(query, [
            userData.id,
            userData.email,
            userData.plan || 'FREE',
            userData.subscriptionActive || false,
            userData.subscriptionExpiresAt || null
        ]);
        
        return result.rows[0];
    }

    async getUserById(userId) {
        const isPostgreSQL = await this.ensureConnection();
        
        if (!isPostgreSQL) {
            // Mock implementation - return null (user not found)
            return null;
        }

        const query = `
            SELECT id, email, plan, subscription_active, subscription_expires_at, created_at
            FROM users 
            WHERE id = $1
        `;
        
        const result = await this.pool.query(query, [userId]);
        return result.rows[0] || null;
    }

    async updateUserPlan(userId, planData) {
        const isPostgreSQL = await this.ensureConnection();
        
        if (!isPostgreSQL) {
            console.log(`🧪 [MOCK] Updated user ${userId} plan`);
            return { id: userId, ...planData };
        }

        const query = `
            UPDATE users 
            SET plan = $1, subscription_active = $2, subscription_expires_at = $3, updated_at = NOW()
            WHERE id = $4
            RETURNING id, plan, subscription_active, subscription_expires_at
        `;
        
        const result = await this.pool.query(query, [
            planData.plan,
            planData.subscriptionActive,
            planData.subscriptionExpiresAt,
            userId
        ]);
        
        return result.rows[0] || null;
    }

    /**
     * 📊 USAGE TRACKING OPERATIONS
     */

    async getUsageByUser(userId, date) {
        const isPostgreSQL = await this.ensureConnection();
        
        if (!isPostgreSQL) {
            // Mock implementation
            return {
                scans_used: Math.floor(Math.random() * 2), // Random usage for testing
                retries_used: 0,
                downloads_used: 0
            };
        }

        const query = `
            SELECT scans_used, retries_used, downloads_used
            FROM usage_counters 
            WHERE user_id = $1 AND date = $2
        `;
        
        const result = await this.pool.query(query, [userId, date]);
        return result.rows[0] || { scans_used: 0, retries_used: 0, downloads_used: 0 };
    }

    async getUsageByIP(ipAddress, date) {
        const isPostgreSQL = await this.ensureConnection();
        
        if (!isPostgreSQL) {
            // Mock implementation
            return {
                scans_used: 0,
                retries_used: 0, 
                downloads_used: 0
            };
        }

        const query = `
            SELECT scans_used, retries_used, downloads_used
            FROM usage_counters 
            WHERE ip_address = $1 AND date = $2 AND user_id IS NULL
        `;
        
        const result = await this.pool.query(query, [ipAddress, date]);
        return result.rows[0] || { scans_used: 0, retries_used: 0, downloads_used: 0 };
    }

    async incrementUserUsage(userId, date, usageType) {
        const isPostgreSQL = await this.ensureConnection();
        
        if (!isPostgreSQL) {
            console.log(`🧪 [MOCK] Incremented ${usageType} for user ${userId}`);
            return;
        }

        const column = this.getUsageColumn(usageType);
        if (!column) {
            throw new Error(`Invalid usage type: ${usageType}`);
        }

        const query = `
            INSERT INTO usage_counters (user_id, date, ${column}) 
            VALUES ($1, $2, 1)
            ON CONFLICT (user_id, date) 
            DO UPDATE SET ${column} = usage_counters.${column} + 1, updated_at = NOW()
        `;
        
        await this.pool.query(query, [userId, date]);
    }

    async incrementIPUsage(ipAddress, date, usageType) {
        const isPostgreSQL = await this.ensureConnection();
        
        if (!isPostgreSQL) {
            console.log(`🧪 [MOCK] Incremented ${usageType} for IP ${ipAddress}`);
            return;
        }

        const column = this.getUsageColumn(usageType);
        if (!column) {
            throw new Error(`Invalid usage type: ${usageType}`);
        }

        const query = `
            INSERT INTO usage_counters (ip_address, date, ${column}) 
            VALUES ($1, $2, 1)
            ON CONFLICT (ip_address, date) WHERE user_id IS NULL
            DO UPDATE SET ${column} = usage_counters.${column} + 1, updated_at = NOW()
        `;
        
        await this.pool.query(query, [ipAddress, date]);
    }

    getUsageColumn(usageType) {
        switch (usageType) {
            case 'scan': return 'scans_used';
            case 'retry': return 'retries_used';
            case 'download': return 'downloads_used';
            default: return null;
        }
    }

    /**
     * 🧹 CLEANUP OPERATIONS
     */

    async cleanupOldScans(olderThanHours = 24) {
        const isPostgreSQL = await this.ensureConnection();
        
        if (!isPostgreSQL) {
            return await this.mockRepository.cleanupOldScans(olderThanHours);
        }

        const query = `
            DELETE FROM scans 
            WHERE created_at < NOW() - INTERVAL '${olderThanHours} hours'
            RETURNING id
        `;
        
        const result = await this.pool.query(query);
        return result.rows.length;
    }

    /**
     * 🔧 UTILITY OPERATIONS
     */

    async healthCheck() {
        const isPostgreSQL = await this.ensureConnection();
        
        if (!isPostgreSQL) {
            return await this.mockRepository.healthCheck();
        }

        try {
            const result = await this.pool.query('SELECT NOW() as current_time');
            return {
                status: 'healthy',
                timestamp: result.rows[0].current_time,
                pool: {
                    totalCount: this.pool.totalCount,
                    idleCount: this.pool.idleCount,
                    waitingCount: this.pool.waitingCount
                },
                tables: {
                    scans: true,
                    scan_services: true,
                    users: true,
                    usage_counters: true
                }
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message
            };
        }
    }

    /**
     * 🚀 CACHE OPERATIONS
     */

    async getCacheEntry(cacheKey) {
        const isPostgreSQL = await this.ensureConnection();
        
        if (!isPostgreSQL) {
            return await this.mockRepository.getCacheEntry(cacheKey);
        }

        try {
            const query = `
                SELECT cache_key, scan_id, expires_at, created_at
                FROM scan_cache 
                WHERE cache_key = $1
            `;
            const result = await this.pool.query(query, [cacheKey]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error getting cache entry:', error);
            return null;
        }
    }

    async setCacheEntry(cacheKey, scanId, expiresAt) {
        const isPostgreSQL = await this.ensureConnection();
        
        if (!isPostgreSQL) {
            return await this.mockRepository.setCacheEntry(cacheKey, scanId, expiresAt);
        }

        try {
            const query = `
                INSERT INTO scan_cache (cache_key, scan_id, expires_at) 
                VALUES ($1, $2, $3) 
                ON CONFLICT (cache_key) DO NOTHING
                RETURNING id
            `;
            const result = await this.pool.query(query, [cacheKey, scanId, expiresAt]);
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error setting cache entry:', error);
            return false;
        }
    }

    async removeCacheEntry(cacheKey) {
        const isPostgreSQL = await this.ensureConnection();
        
        if (!isPostgreSQL) {
            return await this.mockRepository.removeCacheEntry(cacheKey);
        }

        try {
            const query = `DELETE FROM scan_cache WHERE cache_key = $1`;
            const result = await this.pool.query(query, [cacheKey]);
            return result.rowCount > 0;
        } catch (error) {
            console.error('Error removing cache entry:', error);
            return false;
        }
    }

    async cleanupExpiredCache() {
        const isPostgreSQL = await this.ensureConnection();
        
        if (!isPostgreSQL) {
            return await this.mockRepository.cleanupExpiredCache();
        }

        try {
            const query = `DELETE FROM scan_cache WHERE expires_at < NOW()`;
            const result = await this.pool.query(query);
            return result.rowCount;
        } catch (error) {
            console.error('Error cleaning up cache:', error);
            return 0;
        }
    }

    async getCacheStats() {
        const isPostgreSQL = await this.ensureConnection();
        
        if (!isPostgreSQL) {
            return await this.mockRepository.getCacheStats();
        }

        try {
            const query = `
                SELECT 
                    COUNT(*) as total_entries,
                    COUNT(CASE WHEN expires_at < NOW() THEN 1 END) as expired_entries,
                    COUNT(CASE WHEN expires_at >= NOW() THEN 1 END) as valid_entries
                FROM scan_cache
            `;
            const result = await this.pool.query(query);
            return result.rows[0] || { total_entries: 0, expired_entries: 0, valid_entries: 0 };
        } catch (error) {
            console.error('Error getting cache stats:', error);
            return { total_entries: 0, expired_entries: 0, valid_entries: 0 };
        }
    }

    /**
     * 📊 METRICS & OBSERVABILITY OPERATIONS
     */

    async insertScanMetric(scanContext) {
        const isPostgreSQL = await this.ensureConnection();
        
        if (!isPostgreSQL) {
            return await this.mockRepository.insertScanMetric(scanContext);
        }

        try {
            const query = `
                INSERT INTO scan_metrics (
                    scan_id, user_type, plan, url, status, cached, 
                    total_execution_time_ms, services_executed, services_failed, cache_hit
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id
            `;
            const values = [
                scanContext.scanId,
                scanContext.userType,
                scanContext.plan,
                scanContext.url,
                scanContext.status,
                scanContext.cached || false,
                scanContext.totalExecutionTime,
                scanContext.servicesExecuted || 0,
                scanContext.servicesFailed || 0,
                scanContext.cached || false
            ];
            
            const result = await this.pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error inserting scan metric:', error);
            return null;
        }
    }

    async insertServiceMetric(scanId, serviceContext) {
        const isPostgreSQL = await this.ensureConnection();
        
        if (!isPostgreSQL) {
            return await this.mockRepository.insertServiceMetric(scanId, serviceContext);
        }

        try {
            const query = `
                INSERT INTO service_metrics (
                    scan_id, service_name, status, execution_time_ms, 
                    retry_attempts, error_code, error_message
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
            `;
            const values = [
                scanId,
                serviceContext.serviceName,
                serviceContext.status,
                serviceContext.executionTime,
                serviceContext.retryAttempts || 0,
                serviceContext.errorCode || null,
                serviceContext.errorMessage || null
            ];
            
            const result = await this.pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error inserting service metric:', error);
            return null;
        }
    }

    async getMetricsStats(timeRange = '24h') {
        const isPostgreSQL = await this.ensureConnection();
        
        if (!isPostgreSQL) {
            return await this.mockRepository.getMetricsStats(timeRange);
        }

        try {
            const hours = timeRange === '7d' ? 168 : timeRange === '1h' ? 1 : 24;
            
            const query = `
                SELECT 
                    COUNT(DISTINCT sm.scan_id) as total_scans,
                    COUNT(CASE WHEN sm.status = 'completed' THEN 1 END) as completed_scans,
                    COUNT(CASE WHEN sm.status = 'failed' THEN 1 END) as failed_scans,
                    COUNT(CASE WHEN sm.cached = true THEN 1 END) as cached_scans,
                    AVG(sm.total_execution_time_ms) as avg_execution_time,
                    COUNT(CASE WHEN sm.user_type = 'GUEST' THEN 1 END) as guest_scans,
                    COUNT(CASE WHEN sm.user_type = 'FREE' THEN 1 END) as free_scans,
                    COUNT(CASE WHEN sm.user_type = 'PRO' THEN 1 END) as pro_scans,
                    (COUNT(CASE WHEN sm.cached = true THEN 1 END)::float / COUNT(*)::float * 100) as cache_hit_rate
                FROM scan_metrics sm 
                WHERE sm.created_at >= NOW() - INTERVAL '${hours} hours'
            `;
            const result = await this.pool.query(query);
            return result.rows[0];
        } catch (error) {
            console.error('Error getting metrics stats:', error);
            return null;
        }
    }

    async getServicePerformance(timeRange = '24h') {
        const isPostgreSQL = await this.ensureConnection();
        
        if (!isPostgreSQL) {
            return await this.mockRepository.getServicePerformance(timeRange);
        }

        try {
            const hours = timeRange === '7d' ? 168 : timeRange === '1h' ? 1 : 24;
            
            const query = `
                SELECT 
                    service_name,
                    COUNT(*) as total_executions,
                    COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_executions,
                    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_executions,
                    AVG(execution_time_ms) as avg_execution_time,
                    MAX(execution_time_ms) as max_execution_time,
                    MIN(execution_time_ms) as min_execution_time,
                    SUM(retry_attempts) as total_retries,
                    (COUNT(CASE WHEN status = 'success' THEN 1 END)::float / COUNT(*)::float * 100) as success_rate
                FROM service_metrics 
                WHERE created_at >= NOW() - INTERVAL '${hours} hours'
                GROUP BY service_name
                ORDER BY avg_execution_time DESC
            `;
            const result = await this.pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error getting service performance:', error);
            return [];
        }
    }

    async getErrorAnalysis(timeRange = '24h') {
        const isPostgreSQL = await this.ensureConnection();
        
        if (!isPostgreSQL) {
            return await this.mockRepository.getErrorAnalysis(timeRange);
        }

        try {
            const hours = timeRange === '7d' ? 168 : timeRange === '1h' ? 1 : 24;
            
            const query = `
                SELECT 
                    error_code,
                    service_name,
                    COUNT(*) as error_count,
                    AVG(retry_attempts) as avg_retries
                FROM service_metrics 
                WHERE status = 'failed' 
                AND error_code IS NOT NULL
                AND created_at >= NOW() - INTERVAL '${hours} hours'
                GROUP BY error_code, service_name
                ORDER BY error_count DESC
                LIMIT 20
            `;
            const result = await this.pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error getting error analysis:', error);
            return [];
        }
    }

    async close() {
        if (this.mockRepository) {
            await this.mockRepository.close();
        }
        await this.pool.end();
    }
}

// Create singleton instance
const dbRepository = new DatabaseRepository();

export default dbRepository;