import { SSLCheckerService } from '../services/sslCheckerService.js';

const sslChecker = new SSLCheckerService();

/**
 * Check SSL certificate for a given URL
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const checkSSLCertificate = async (req, res) => {
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'URL parameter is required'
            });
        }

        // Extract hostname from URL
        let hostname;
        try {
            hostname = new URL(url).hostname;
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: 'Invalid URL format'
            });
        }

        // Use the script method by default as it's more efficient
        const results = await sslChecker.checkSSLViaScript(hostname);

        res.json({
            success: true,
            results
        });

    } catch (error) {
        console.error('SSL Check Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to check SSL certificate'
        });
    }
};

/**
 * Bulk check SSL certificates for multiple URLs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const bulkCheckSSL = async (req, res) => {
    try {
        const { urls } = req.body;

        if (!Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'URLs array is required in request body'
            });
        }

        if (urls.length > 50) {
            return res.status(400).json({
                success: false,
                error: 'Maximum 50 URLs allowed per request'
            });
        }

        // Extract hostnames from URLs
        const hostnames = urls.map(url => {
            try {
                return new URL(url).hostname;
            } catch (error) {
                throw new Error(`Invalid URL format: ${url}`);
            }
        });

        const results = await sslChecker.checkSSLViaScript(hostnames);

        res.json({
            success: true,
            results
        });

    } catch (error) {
        console.error('Bulk SSL Check Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to check SSL certificates'
        });
    }
};