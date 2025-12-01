/**
 * @file backlinkService.js
 * @description Service for backlink analysis functionality
 * 
 * Note: This is a mock implementation. In production, this would integrate 
 * with a real backlink API (e.g., Ahrefs, Moz, etc.)
 */

import { normalizeUrl } from '../utils/urlUtils.js';

// Cache for backlink data
const backlinksCache = new Map();

class BacklinkService {
    /**
     * Get a summary of backlinks for a URL
     * @param {string} url - The URL to analyze
     * @returns {Object} Backlink summary data
     */
    async getBacklinkSummary(url) {
        const normalizedUrl = normalizeUrl(url);
        
        // Check cache first
        if (backlinksCache.has(normalizedUrl)) {
            const cachedData = backlinksCache.get(normalizedUrl);
            
            // If data is less than 24 hours old, return from cache
            if ((Date.now() - cachedData.timestamp) < 24 * 60 * 60 * 1000) {
                return {
                    ...cachedData.data,
                    source: 'cache'
                };
            }
        }
        
        // Generate fresh data
        const data = this._generateBacklinkData(normalizedUrl);
        
        // Cache the result
        backlinksCache.set(normalizedUrl, {
            data,
            timestamp: Date.now()
        });
        
        return {
            ...data,
            source: 'fresh'
        };
    }
    
    /**
     * Get detailed backlink data
     * @param {string} url - The URL to analyze
     * @returns {Object} Detailed backlink data
     */
    async getDetailedBacklinks(url) {
        const normalizedUrl = normalizeUrl(url);
        const summary = await this.getBacklinkSummary(normalizedUrl);
        
        // Generate detailed backlink list
        const backlinks = this._generateDetailedBacklinks(normalizedUrl, summary.referring_domains);
        
        return {
            summary,
            backlinks
        };
    }
    
    /**
     * Get referring domain metrics
     * @param {string} url - The URL to analyze
     * @returns {Object} Domain metrics
     */
    async getDomainMetrics(url) {
        const normalizedUrl = normalizeUrl(url);
        const summary = await this.getBacklinkSummary(normalizedUrl);
        
        // Generate domain authority distribution
        const domains = this._generateReferringDomains(summary.referring_domains);
        
        return {
            total_domains: summary.referring_domains,
            domain_distribution: {
                high_authority: domains.filter(d => d.authority > 70).length,
                medium_authority: domains.filter(d => d.authority >= 40 && d.authority <= 70).length,
                low_authority: domains.filter(d => d.authority < 40).length
            },
            domains: domains.slice(0, 10) // Return only top 10 domains
        };
    }
    
    /**
     * Generate mock backlink data
     * @private
     * @param {string} url - The URL to analyze
     * @returns {Object} Mock backlink data
     */
    _generateBacklinkData(url) {
        // Generate consistent pseudo-random numbers based on URL
        const seed = this._hashString(url);
        const totalBacklinks = this._seededRandom(seed, 100, 10000);
        const referringDomains = Math.min(this._seededRandom(seed + 1, 10, 1000), totalBacklinks);
        
        return {
            url,
            total_backlinks: totalBacklinks,
            referring_domains: referringDomains,
            dofollow_links: Math.floor(totalBacklinks * 0.7),
            nofollow_links: Math.floor(totalBacklinks * 0.3),
            top_anchor_texts: [
                {
                    text: "click here",
                    count: this._seededRandom(seed + 2, 10, 100)
                },
                {
                    text: "read more",
                    count: this._seededRandom(seed + 3, 5, 80)
                },
                {
                    text: url,
                    count: this._seededRandom(seed + 4, 5, 60)
                },
                {
                    text: "website",
                    count: this._seededRandom(seed + 5, 5, 40)
                }
            ],
            domain_rating: this._seededRandom(seed + 6, 10, 90),
            first_seen: new Date(Date.now() - this._seededRandom(seed + 7, 1000000, 31536000000)).toISOString(),
            analyzed_at: new Date().toISOString()
        };
    }
    
    /**
     * Generate detailed backlink data
     * @private
     * @param {string} url - The URL to analyze
     * @param {number} domainCount - Number of referring domains
     * @returns {Array} List of backlinks
     */
    _generateDetailedBacklinks(url, domainCount) {
        const backlinks = [];
        const seed = this._hashString(url);
        
        const domains = this._generateReferringDomains(domainCount);
        
        // For each domain, generate 1-5 backlinks
        domains.forEach((domain, index) => {
            const linkCount = this._seededRandom(seed + index, 1, 5);
            
            for (let i = 0; i < linkCount; i++) {
                backlinks.push({
                    source_url: `https://${domain.name}/${this._randomPath(seed + index + i)}`,
                    target_url: url,
                    anchor_text: this._getRandomAnchorText(seed + index + i, url),
                    first_seen: new Date(Date.now() - this._seededRandom(seed + index + i, 100000, 15000000)).toISOString(),
                    last_checked: new Date(Date.now() - this._seededRandom(seed + index + i + 100, 0, 1000000)).toISOString(),
                    is_dofollow: this._seededRandom(seed + index + i + 200, 0, 100) > 30, // 70% dofollow
                    domain_authority: domain.authority
                });
            }
        });
        
        return backlinks;
    }
    
    /**
     * Generate referring domains
     * @private
     * @param {number} count - Number of domains to generate
     * @returns {Array} List of domains
     */
    _generateReferringDomains(count) {
        const domains = [];
        const topLevelDomains = ['.com', '.org', '.net', '.io', '.co', '.edu', '.gov'];
        
        for (let i = 0; i < count; i++) {
            const nameLength = Math.floor(Math.random() * 10) + 5;
            let name = '';
            
            // Generate random domain name
            for (let j = 0; j < nameLength; j++) {
                name += String.fromCharCode(97 + Math.floor(Math.random() * 26));
            }
            
            const tld = topLevelDomains[Math.floor(Math.random() * topLevelDomains.length)];
            
            domains.push({
                name: name + tld,
                authority: Math.floor(Math.random() * 100),
                backlink_count: Math.floor(Math.random() * 10) + 1
            });
        }
        
        // Sort by authority (descending)
        return domains.sort((a, b) => b.authority - a.authority);
    }
    
    /**
     * Generate a simple hash from a string
     * @private
     * @param {string} str - String to hash
     * @returns {number} Hash value
     */
    _hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }
    
    /**
     * Generate a seeded random number
     * @private
     * @param {number} seed - Seed value
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random number
     */
    _seededRandom(seed, min, max) {
        const rnd = (seed * 9301 + 49297) % 233280;
        const random = rnd / 233280;
        return Math.floor(min + random * (max - min));
    }
    
    /**
     * Generate a random path for URLs
     * @private
     * @param {number} seed - Seed value
     * @returns {string} Random path
     */
    _randomPath(seed) {
        const paths = [
            'blog/article',
            'news/latest',
            'products/item',
            'services/offering',
            'about/team',
            'resources/guides',
            'category/subcategory'
        ];
        
        const pathIndex = seed % paths.length;
        const idNumber = this._seededRandom(seed, 1000, 9999);
        
        return `${paths[pathIndex]}-${idNumber}`;
    }
    
    /**
     * Get a random anchor text
     * @private
     * @param {number} seed - Seed value
     * @param {string} url - URL for context
     * @returns {string} Anchor text
     */
    _getRandomAnchorText(seed, url) {
        const anchorTexts = [
            'click here',
            'read more',
            'learn more',
            'check this out',
            'visit website',
            'more information',
            url,
            'this link',
            'view details',
            'source'
        ];
        
        return anchorTexts[seed % anchorTexts.length];
    }
}

// Create and export a singleton instance
const backlinkService = new BacklinkService();
export default backlinkService;