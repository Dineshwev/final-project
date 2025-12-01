/**
 * @file historyController.js
 * @description Controller for scan history operations
 */

import db from '../db/init.js';
import { promisify } from 'util';

// Convert callback-based DB methods to Promise-based
const dbAll = promisify(db.all).bind(db);
const dbGet = promisify(db.get).bind(db);
const dbRun = promisify(db.run).bind(db);

class HistoryController {
    /**
     * Get scan history for a specific URL
     * 
     * @param {object} req - Express request object
     * @param {object} res - Express response object
     */
    async getScanHistory(req, res) {
        try {
            const { url } = req.params;
            
            if (!url) {
                return res.status(400).json({ 
                    status: 'error',
                    message: 'URL parameter is required' 
                });
            }

            const decodedUrl = decodeURIComponent(url);
            
            // Get all scans for the URL, ordered by scan date descending
            const rows = await dbAll(`
                SELECT 
                    s.id AS scan_id,
                    s.url,
                    s.status,
                    s.created_at,
                    s.completed_at,
                    r.performance_score,
                    r.seo_score,
                    r.accessibility_score,
                    r.best_practices_score,
                    r.meta_data,
                    r.issues
                FROM scans s
                LEFT JOIN scan_results r ON s.id = r.scan_id
                WHERE s.url = ?
                ORDER BY s.completed_at DESC
            `, [decodedUrl]);
            
            // Process the results to parse JSON strings
            const processedScans = rows.map(scan => {
                let result = {
                    scanId: scan.scan_id,
                    status: scan.status,
                    createdAt: scan.created_at,
                    completedAt: scan.completed_at
                };
                
                // Only include these fields if the scan has results
                if (scan.performance_score !== null) {
                    result.scores = {
                        performance: scan.performance_score,
                        seo: scan.seo_score,
                        accessibility: scan.accessibility_score,
                        bestPractices: scan.best_practices_score
                    };
                    
                    try {
                        // Parse JSON fields if they exist
                        if (scan.meta_data) {
                            result.metadata = JSON.parse(scan.meta_data);
                        }
                        
                        if (scan.issues) {
                            result.issues = JSON.parse(scan.issues);
                        }
                    } catch (e) {
                        console.error('Error parsing JSON from scan results:', e);
                    }
                }
                
                return result;
            });
            
            return res.status(200).json({
                status: 'success',
                url: decodedUrl,
                totalScans: processedScans.length,
                scans: processedScans
            });
        } catch (error) {
            console.error('Error in getScanHistory:', error);
            return res.status(500).json({ 
                status: 'error',
                message: 'Failed to fetch scan history',
                details: error.message 
            });
        }
    }
    
    /**
     * Get all recent scans across all URLs
     * 
     * @param {object} req - Express request object
     * @param {object} res - Express response object
     */
    async getRecentScans(req, res) {
        try {
            // Get pagination parameters with defaults
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            
            // Get total count for pagination
            const countResult = await dbGet(`
                SELECT COUNT(*) as total FROM scans
                WHERE status = 'completed'
            `);
            
            const totalScans = countResult.total;
            const totalPages = Math.ceil(totalScans / limit);
            
            // Get paginated recent scans
            const rows = await dbAll(`
                SELECT 
                    s.id AS scan_id,
                    s.url,
                    s.status,
                    s.created_at,
                    s.completed_at,
                    r.performance_score,
                    r.seo_score,
                    r.accessibility_score,
                    r.best_practices_score
                FROM scans s
                LEFT JOIN scan_results r ON s.id = r.scan_id
                WHERE s.status = 'completed'
                ORDER BY s.completed_at DESC
                LIMIT ? OFFSET ?
            `, [limit, offset]);
            
            return res.status(200).json({
                status: 'success',
                pagination: {
                    total: totalScans,
                    page,
                    limit,
                    totalPages
                },
                scans: rows.map(scan => ({
                    scanId: scan.scan_id,
                    url: scan.url,
                    completedAt: scan.completed_at,
                    scores: {
                        performance: scan.performance_score,
                        seo: scan.seo_score,
                        accessibility: scan.accessibility_score,
                        bestPractices: scan.best_practices_score
                    }
                }))
            });
        } catch (error) {
            console.error('Error in getRecentScans:', error);
            return res.status(500).json({ 
                status: 'error',
                message: 'Failed to fetch recent scans',
                details: error.message 
            });
        }
    }
    
    /**
     * Get scan details by ID
     * 
     * @param {object} req - Express request object
     * @param {object} res - Express response object
     */
    async getScanById(req, res) {
        try {
            const { id } = req.params;
            
            if (!id) {
                return res.status(400).json({ 
                    status: 'error',
                    message: 'Scan ID parameter is required' 
                });
            }
            
            // Get scan details
            const scan = await dbGet(`
                SELECT 
                    s.id AS scan_id,
                    s.url,
                    s.status,
                    s.created_at,
                    s.completed_at,
                    s.error,
                    r.performance_score,
                    r.seo_score,
                    r.accessibility_score,
                    r.best_practices_score,
                    r.meta_data,
                    r.issues
                FROM scans s
                LEFT JOIN scan_results r ON s.id = r.scan_id
                WHERE s.id = ?
            `, [id]);
            
            if (!scan) {
                return res.status(404).json({ 
                    status: 'error',
                    message: 'Scan not found' 
                });
            }
            
            // Process the result to parse JSON strings
            let result = {
                scanId: scan.scan_id,
                url: scan.url,
                status: scan.status,
                createdAt: scan.created_at,
                completedAt: scan.completed_at
            };
            
            // Include error if present
            if (scan.error) {
                result.error = scan.error;
            }
            
            // Only include these fields if the scan has results
            if (scan.performance_score !== null) {
                result.scores = {
                    performance: scan.performance_score,
                    seo: scan.seo_score,
                    accessibility: scan.accessibility_score,
                    bestPractices: scan.best_practices_score
                };
                
                try {
                    // Parse JSON fields if they exist
                    if (scan.meta_data) {
                        result.metadata = JSON.parse(scan.meta_data);
                    }
                    
                    if (scan.issues) {
                        result.issues = JSON.parse(scan.issues);
                    }
                } catch (e) {
                    console.error('Error parsing JSON from scan results:', e);
                }
            }
            
            return res.status(200).json({
                status: 'success',
                scan: result
            });
        } catch (error) {
            console.error('Error in getScanById:', error);
            return res.status(500).json({ 
                status: 'error',
                message: 'Failed to fetch scan details',
                details: error.message 
            });
        }
    }
    
    /**
     * Delete a scan by ID
     * 
     * @param {object} req - Express request object
     * @param {object} res - Express response object
     */
    async deleteScan(req, res) {
        try {
            const { id } = req.params;
            
            if (!id) {
                return res.status(400).json({ 
                    status: 'error',
                    message: 'Scan ID parameter is required' 
                });
            }
            
            // Check if scan exists
            const scan = await dbGet(`
                SELECT id FROM scans WHERE id = ?
            `, [id]);
            
            if (!scan) {
                return res.status(404).json({ 
                    status: 'error',
                    message: 'Scan not found' 
                });
            }
            
            // Delete scan results first (due to foreign key constraint)
            await dbRun(`
                DELETE FROM scan_results WHERE scan_id = ?
            `, [id]);
            
            // Delete scan
            await dbRun(`
                DELETE FROM scans WHERE id = ?
            `, [id]);
            
            return res.status(200).json({
                status: 'success',
                message: 'Scan deleted successfully'
            });
        } catch (error) {
            console.error('Error in deleteScan:', error);
            return res.status(500).json({ 
                status: 'error',
                message: 'Failed to delete scan',
                details: error.message 
            });
        }
    }
    
    /**
     * Get score trends for a specific URL
     * 
     * @param {object} req - Express request object
     * @param {object} res - Express response object
     */
    async getScoreTrends(req, res) {
        try {
            const { url } = req.params;
            
            if (!url) {
                return res.status(400).json({ 
                    status: 'error',
                    message: 'URL parameter is required' 
                });
            }

            const decodedUrl = decodeURIComponent(url);
            
            // Get the historical scores for trend analysis
            const rows = await dbAll(`
                SELECT 
                    s.completed_at,
                    r.performance_score,
                    r.seo_score,
                    r.accessibility_score,
                    r.best_practices_score
                FROM scans s
                JOIN scan_results r ON s.id = r.scan_id
                WHERE s.url = ? AND s.status = 'completed'
                ORDER BY s.completed_at ASC
            `, [decodedUrl]);
            
            if (rows.length === 0) {
                return res.status(404).json({
                    status: 'error',
                    message: 'No historical data found for this URL'
                });
            }
            
            // Format data for trend analysis
            const trends = {
                dates: rows.map(row => row.completed_at),
                performance: rows.map(row => row.performance_score),
                seo: rows.map(row => row.seo_score),
                accessibility: rows.map(row => row.accessibility_score),
                bestPractices: rows.map(row => row.best_practices_score)
            };
            
            // Calculate improvements/regressions
            const latest = rows[rows.length - 1];
            const earliest = rows[0];
            
            const changes = {
                performance: latest.performance_score - earliest.performance_score,
                seo: latest.seo_score - earliest.seo_score,
                accessibility: latest.accessibility_score - earliest.accessibility_score,
                bestPractices: latest.best_practices_score - earliest.best_practices_score
            };
            
            return res.status(200).json({
                status: 'success',
                url: decodedUrl,
                dataPoints: rows.length,
                trends,
                changes
            });
        } catch (error) {
            console.error('Error in getScoreTrends:', error);
            return res.status(500).json({ 
                status: 'error',
                message: 'Failed to fetch score trends',
                details: error.message 
            });
        }
    }
}

export default new HistoryController();