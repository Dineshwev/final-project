/**
 * @file backlinkController.js
 * @description Controller for backlink analysis functionality
 */

import backlinkService from '../services/backlinkService.js';
import { normalizeUrl } from '../utils/urlUtils.js';

class BacklinkController {
    /**
     * Get a summary of backlinks for a URL
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Object} JSON response with backlink summary
     */
    async getBacklinkSummary(req, res) {
        try {
            const { url } = req.query;

            if (!url) {
                return res.status(400).json({ 
                    status: 'error',
                    message: 'URL parameter is required' 
                });
            }

            const normalizedUrl = normalizeUrl(url);
            const backlinkData = await backlinkService.getBacklinkSummary(normalizedUrl);
            
            return res.status(200).json({
                status: 'success',
                data: backlinkData
            });
        } catch (error) {
            console.error('Error in getBacklinkSummary:', error);
            return res.status(500).json({ 
                status: 'error',
                message: 'Failed to fetch backlink data',
                error: error.message 
            });
        }
    }
    
    /**
     * Get detailed backlink data for a URL
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Object} JSON response with detailed backlink data
     */
    async getDetailedBacklinks(req, res) {
        try {
            const { url } = req.query;

            if (!url) {
                return res.status(400).json({ 
                    status: 'error',
                    message: 'URL parameter is required' 
                });
            }

            const normalizedUrl = normalizeUrl(url);
            const backlinkData = await backlinkService.getDetailedBacklinks(normalizedUrl);
            
            return res.status(200).json({
                status: 'success',
                data: backlinkData
            });
        } catch (error) {
            console.error('Error in getDetailedBacklinks:', error);
            return res.status(500).json({ 
                status: 'error',
                message: 'Failed to fetch detailed backlink data',
                error: error.message 
            });
        }
    }
    
    /**
     * Get domain metrics for a URL's backlinks
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Object} JSON response with domain metrics
     */
    async getDomainMetrics(req, res) {
        try {
            const { url } = req.query;

            if (!url) {
                return res.status(400).json({ 
                    status: 'error',
                    message: 'URL parameter is required' 
                });
            }

            const normalizedUrl = normalizeUrl(url);
            const domainData = await backlinkService.getDomainMetrics(normalizedUrl);
            
            return res.status(200).json({
                status: 'success',
                data: domainData
            });
        } catch (error) {
            console.error('Error in getDomainMetrics:', error);
            return res.status(500).json({ 
                status: 'error',
                message: 'Failed to fetch domain metrics',
                error: error.message 
            });
        }
    }
}

// Create and export controller instance
const backlinkController = new BacklinkController();
export default backlinkController;