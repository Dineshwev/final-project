import cron from 'node-cron';
import seoService from './seoServiceNew.js';
import { refreshAll } from './rankTrackerService.js';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

class SchedulerService {
    constructor() {
        // Schedule task with customizable cron (default midnight daily)
        const cronExpr = process.env.RANK_REFRESH_CRON || '0 0 * * *';
        this.scheduledTask = cron.schedule(cronExpr, async () => {
            console.log('Running scheduled daily tasks at', new Date().toISOString());
            this.processDueScans();
            // Optional jitter (in minutes) to spread load
            const jitterMin = Math.max(0, parseInt(process.env.RANK_REFRESH_JITTER_MINUTES||'0')||0);
            if (jitterMin > 0) {
                const delay = Math.floor(Math.random() * jitterMin * 60 * 1000);
                console.log(`Applying rank refresh jitter: ${Math.round(delay/60000)} min`);
                await sleep(delay);
            }
            await this.processRankRefresh();
        }, { scheduled: false });
    }

    /**
     * Start the scheduler
     */
    start() {
        this.scheduledTask.start();
        console.log('Scan scheduler started');
    }

    /**
     * Stop the scheduler
     */
    stop() {
        this.scheduledTask.stop();
        console.log('Scan scheduler stopped');
    }

    /**
     * Process all URLs that are due for scanning
     */
    async processDueScans() {
        try {
            // Import the DB module
            const db = await import('../db/init.js');
            
            // Get URLs from scans where the last scan was more than 7 days ago
            db.all(`
                SELECT url, MAX(completed_at) as last_scan
                FROM scans
                WHERE status = 'completed'
                GROUP BY url
                HAVING last_scan <= datetime('now', '-7 days')
            `, [], async (err, rows) => {
                if (err) {
                    console.error('Error fetching URLs due for scanning:', err);
                    return;
                }

                console.log(`Found ${rows.length} URLs due for scanning`);
                
                // Process each URL
                for (const row of rows) {
                    try {
                        console.log(`Processing scheduled scan for ${row.url}`);
                        
                        // Start a new scan
                        db.run(`
                            INSERT INTO scans (url, status)
                            VALUES (?, 'pending')
                        `, [row.url], function(err) {
                            if (err) {
                                console.error(`Error creating scheduled scan for ${row.url}:`, err);
                                return;
                            }
                            
                            const scanId = this.lastID;
                            console.log(`Created scheduled scan #${scanId} for ${row.url}`);
                            
                            // Perform the scan asynchronously
                            seoService.analyzeSite(row.url)
                                .then(scanResult => {
                                    // Update scan status to completed
                                    db.run(`
                                        UPDATE scans 
                                        SET status = 'completed', completed_at = datetime('now')
                                        WHERE id = ?
                                    `, [scanId]);
                                    
                                    // Store scan results
                                    db.run(`
                                        INSERT INTO scan_results (
                                            scan_id, 
                                            performance_score, 
                                            seo_score, 
                                            accessibility_score,
                                            best_practices_score,
                                            meta_data,
                                            issues
                                        ) VALUES (?, ?, ?, ?, ?, ?, ?)
                                    `, [
                                        scanId,
                                        scanResult.performance || 0,
                                        scanResult.seo || 0,
                                        scanResult.accessibility || 0,
                                        scanResult.bestPractices || 0,
                                        JSON.stringify(scanResult.metadata || {}),
                                        JSON.stringify(scanResult.issues || [])
                                    ]);
                                    
                                    console.log(`Scheduled scan completed for ${row.url}`);
                                })
                                .catch(error => {
                                    console.error(`Error processing scheduled scan for ${row.url}:`, error);
                                    
                                    // Update scan status to error
                                    db.run(`
                                        UPDATE scans 
                                        SET status = 'error', error = ?, completed_at = datetime('now')
                                        WHERE id = ?
                                    `, [error.message, scanId]);
                                });
                        });
                    } catch (error) {
                        console.error(`Error processing scheduled scan for ${row.url}:`, error);
                    }
                }
            });
        } catch (error) {
            console.error('Error in processDueScans:', error);
        }
    }

    async processRankRefresh() {
        try {
            console.log('Starting scheduled rank refresh');
            const results = await refreshAll({});
            console.log(`Rank refresh completed for ${results.length} keywords.`);
        } catch (e) {
            console.error('Error in processRankRefresh:', e.message);
        }
    }

    /**
     * Method to manually schedule a URL for scanning
     * @param {string} url - The URL to schedule
     * @returns {Promise<object>} The scan result
     */
    async scheduleUrl(url) {
        try {
            const db = await import('../db/init.js');
            
            // Start a new scan
            return new Promise((resolve, reject) => {
                db.run(`
                    INSERT INTO scans (url, status)
                    VALUES (?, 'pending')
                `, [url], function(err) {
                    if (err) {
                        console.error(`Error creating scheduled scan for ${url}:`, err);
                        return reject(err);
                    }
                    
                    const scanId = this.lastID;
                    console.log(`Created scheduled scan #${scanId} for ${url}`);
                    
                    // Perform the scan
                    seoService.analyzeSite(url)
                        .then(scanResult => {
                            // Update scan status to completed
                            db.run(`
                                UPDATE scans 
                                SET status = 'completed', completed_at = datetime('now')
                                WHERE id = ?
                            `, [scanId]);
                            
                            // Store scan results
                            db.run(`
                                INSERT INTO scan_results (
                                    scan_id, 
                                    performance_score, 
                                    seo_score, 
                                    accessibility_score,
                                    best_practices_score,
                                    meta_data,
                                    issues
                                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                            `, [
                                scanId,
                                scanResult.performance || 0,
                                scanResult.seo || 0,
                                scanResult.accessibility || 0,
                                scanResult.bestPractices || 0,
                                JSON.stringify(scanResult.metadata || {}),
                                JSON.stringify(scanResult.issues || [])
                            ]);
                            
                            console.log(`Scheduled scan completed for ${url}`);
                            resolve(scanResult);
                        })
                        .catch(error => {
                            console.error(`Error processing scheduled scan for ${url}:`, error);
                            
                            // Update scan status to error
                            db.run(`
                                UPDATE scans 
                                SET status = 'error', error = ?, completed_at = datetime('now')
                                WHERE id = ?
                            `, [error.message, scanId]);
                            
                            reject(error);
                        });
                });
            });
        } catch (error) {
            console.error(`Error scheduling scan for ${url}:`, error);
            throw error;
        }
    }
}

export default new SchedulerService();