import axios from 'axios';
import { analyzeSecurityHeaders, SECURITY_HEADERS } from '../utils/securityHeadersAnalyzer.js';

/**
 * Analyze website security including headers and SSL
 */
export const analyzeWebsiteSecurity = async (url) => {
    try {
        // Make a request to get headers
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'SEO Health Checker Bot/1.0 (+https://seo-health-checker.com/bot)'
            },
            timeout: parseInt(process.env.TIMEOUT_MS) || 30000,
            validateStatus: function (status) {
                return status >= 200 && status < 500; // Accept all responses except server errors
            }
        });

        // Analyze security headers
        const headerAnalysis = analyzeSecurityHeaders(response.headers);

        // Check SSL/HTTPS
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';

        // Combine results
        const securityResults = {
            score: headerAnalysis.score,
            summary: {
                ...headerAnalysis.summary,
                https: isHttps,
            },
            headers: {
                analyzed: headerAnalysis.headers,
                raw: response.headers,
            },
            categories: headerAnalysis.categories,
            ssl: {
                enabled: isHttps,
                valid: isHttps, // In production, you might want to add actual SSL certificate validation
                score: isHttps ? 100 : 0
            },
            recommendations: [
                ...headerAnalysis.recommendations,
                ...((!isHttps) ? [{
                    type: 'security_ssl',
                    severity: 'high',
                    message: 'Enable HTTPS to secure data transmission',
                    implementationTip: 'Obtain an SSL certificate and configure your web server to use HTTPS. Free certificates are available from Let\'s Encrypt.',
                    moreInfo: 'https://developers.google.com/search/docs/advanced/security/https',
                    category: 'security'
                }] : [])
            ]
        };

        // Adjust overall score based on SSL
        if (!isHttps) {
            securityResults.score = Math.max(0, securityResults.score - 30);
        }

        return securityResults;
    } catch (error) {
        throw new Error(`Failed to analyze security: ${error.message}`);
    }
};

// Default export
export default {
    analyzeWebsiteSecurity
};