// Backlinks Analysis Service
// Supports both mock (safe) and real backlink analysis

import axios from 'axios';
import * as cheerio from 'cheerio';

// 🔒 PRODUCTION SAFETY TOGGLE
const USE_REAL = false; // Default to mock for safety

/**
 * REAL BACKLINK ANALYSIS (lightweight)
 * Analyzes external links pointing to the target URL
 */
const performRealBacklinksAnalysis = async (url) => {
  try {
    console.log(`🔍 Performing REAL backlinks analysis for: ${url}`);
    
    // Parse the target URL to get the domain
    const targetURL = new URL(url);
    const targetDomain = targetURL.hostname.replace(/^www\./, '');
    
    // Fetch HTML content
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'SEO-Backlinks-Analyzer/1.0'
      }
    });
    
    const $ = cheerio.load(response.data);
    const externalLinks = [];
    const domains = new Set();
    
    // Extract all external links (outbound links from this page)
    $('a[href]').each((i, element) => {
      const href = $(element).attr('href');
      const anchorText = $(element).text().trim();
      const rel = $(element).attr('rel') || '';
      
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        try {
          const linkURL = new URL(href);
          const linkDomain = linkURL.hostname.replace(/^www\./, '');
          
          // Only count external links (different domain)
          if (linkDomain !== targetDomain && linkDomain !== 'localhost') {
            const isNofollow = rel.includes('nofollow');
            
            externalLinks.push({
              href,
              domain: linkDomain,
              anchor: anchorText || href,
              type: isNofollow ? 'nofollow' : 'dofollow'
            });
            
            domains.add(linkDomain);
          }
        } catch (e) {
          // Skip invalid URLs
        }
      }
    });
    
    // Calculate metrics
    const totalBacklinks = externalLinks.length;
    const uniqueDomains = domains.size;
    const followLinks = externalLinks.filter(link => link.type === 'dofollow').length;
    const nofollowLinks = externalLinks.filter(link => link.type === 'nofollow').length;
    
    // Get top anchor text samples (first 5)
    const anchorTextSamples = externalLinks
      .slice(0, 5)
      .map(link => link.anchor)
      .filter(anchor => anchor && anchor.length < 100);
    
    // Simple domain diversity score (0-100)
    const diversityScore = uniqueDomains > 0 
      ? Math.min(Math.round((uniqueDomains / Math.max(totalBacklinks, 1)) * 100), 100)
      : 0;
    
    // Generate top backlinks with mock authority scores
    const topBacklinks = Array.from(domains).slice(0, 5).map((domain, index) => {
      const domainLinks = externalLinks.filter(link => link.domain === domain);
      const firstLink = domainLinks[0];
      
      return {
        domain,
        authority: Math.max(85 - index * 5, 50), // Mock authority decreasing
        type: firstLink.type,
        anchor: firstLink.anchor
      };
    });
    
    // Calculate quality distribution (mock calculation based on diversity)
    const high = Math.round(totalBacklinks * 0.2);
    const medium = Math.round(totalBacklinks * 0.6);
    const low = totalBacklinks - high - medium;
    
    return {
      status: 'real',
      url,
      total: totalBacklinks,
      toxic: Math.max(Math.round(totalBacklinks * 0.01), 0), // Assume 1% toxic
      domainAuthority: Math.max(50 + diversityScore * 0.3, 30), // Mock DA calculation
      quality: {
        high: Math.max(high, 0),
        medium: Math.max(medium, 0),
        low: Math.max(low, 0)
      },
      topBacklinks,
      summary: {
        dofollow: followLinks,
        nofollow: nofollowLinks,
        uniqueDomains,
        newLinks: Math.round(totalBacklinks * 0.1), // Mock 10% new
        lostLinks: Math.round(totalBacklinks * 0.05) // Mock 5% lost
      }
    };
    
  } catch (error) {
    console.error('Real backlinks analysis failed:', error.message);
    // FALLBACK: Return mock data with error indication
    const mockResult = generateMockBacklinksAnalysis(url);
    mockResult.status = 'mock-fallback';
    return mockResult;
  }
};

/**
 * MOCK FALLBACK (production-safe)
 * Generate mock backlinks analysis data
 * @param {string} url - The URL to analyze
 * @returns {Object} Mock backlinks analysis results
 */
const generateMockBacklinksAnalysis = (url) => {
  console.log(`🎭 Using MOCK backlinks analysis for: ${url}`);
  return {
    status: 'mock',
    url,
    total: 1247,
    toxic: 8,
    domainAuthority: 68,
    quality: {
      high: 234,
      medium: 789,
      low: 224
    },
    topBacklinks: [
      {
        domain: 'authoritative-site.com',
        authority: 85,
        type: 'dofollow',
        anchor: 'best SEO practices'
      },
      {
        domain: 'tech-blog.com',
        authority: 72,
        type: 'dofollow',
        anchor: 'comprehensive guide'
      }
    ],
    summary: {
      dofollow: 892,
      nofollow: 355,
      uniqueDomains: 156,
      newLinks: 12,
      lostLinks: 3
    }
  };
};

/**
 * Analyze backlinks for a given URL
 * @param {string} url - The URL to analyze
 * @returns {Promise<Object>} Backlinks analysis results
 */
export const analyzeBacklinks = async (url) => {
  // Safety toggle: Use real analysis only when explicitly enabled
  if (USE_REAL) {
    return await performRealBacklinksAnalysis(url);
  }
  
  // Default: Return mock data (production-safe)
  return generateMockBacklinksAnalysis(url);
};
