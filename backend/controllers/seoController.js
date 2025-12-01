import seoService from '../services/seoServiceNew.js';
import securityService from '../services/securityService.js';
import recommendationService from '../services/recommendationService.js';

// Extract methods from seoService
const { 
  fetchWebsite, 
  analyzeMetadata,
  analyzeHeadings,
  analyzeImages,
  analyzeLinks,
  analyzeRobotsTxt,
  analyzeSitemap,
  analyzeDomainInfo,
  analyzeSafeBrowsing,
  runPageSpeedInsightsAnalysis
} = seoService;

// Extract methods from other services
const { analyzeWebsiteSecurity } = securityService || {};
const { generateRecommendations } = recommendationService || {};

/**
 * Controller for analyzing a website's SEO health
 */
export const analyzeSite = async (req, res, next) => {
  try {
    const { url } = req.query;
    console.log(`Analyzing site: ${url}`);
    
    // Initialize results object
    const results = {
      url: url,
      analyzedAt: new Date().toISOString(),
      metadata: null,
      headings: null,
      images: null,
      links: null,
      security: null,
      robotsTxt: null,
      sitemap: null,
      domainInfo: null,
      safeBrowsing: null,
      lighthouse: null,
      recommendations: [],
      error: null
    };
    
    try {
      // Step 1: Fetch and parse the website content
      const { html, $ } = await fetchWebsite(url);
      
      // Step 2: Parallel analysis of different aspects
      const [
        metadataResults,
        headingsResults,
        imagesResults,
        linksResults,
        securityResults,
        robotsTxtResults,
        sitemapResults,
        domainInfoResults,
        safeBrowsingResults,
        lighthouseResults
      ] = await Promise.allSettled([
        analyzeMetadata(url, $),
        analyzeHeadings($),
        analyzeImages($),
        analyzeLinks(url, $),
        analyzeWebsiteSecurity(url),
        analyzeRobotsTxt(url),
        analyzeSitemap(url),
        analyzeDomainInfo(url, req.user?.uid),
        analyzeSafeBrowsing(url, req.user?.uid),
        runPageSpeedInsightsAnalysis(url, req.user?.uid)
      ]);
      
      // Assign results, handling any individual failures
      results.metadata = metadataResults.status === 'fulfilled' ? metadataResults.value : { error: 'Failed to analyze metadata' };
      results.headings = headingsResults.status === 'fulfilled' ? headingsResults.value : { error: 'Failed to analyze headings' };
      results.images = imagesResults.status === 'fulfilled' ? imagesResults.value : { error: 'Failed to analyze images' };
      results.links = linksResults.status === 'fulfilled' ? linksResults.value : { error: 'Failed to analyze links' };
      results.security = securityResults.status === 'fulfilled' ? securityResults.value : { error: 'Failed to analyze security' };
      results.robotsTxt = robotsTxtResults.status === 'fulfilled' ? robotsTxtResults.value : { error: 'Failed to analyze robots.txt' };
      results.sitemap = sitemapResults.status === 'fulfilled' ? sitemapResults.value : { error: 'Failed to analyze sitemap' };
      results.domainInfo = domainInfoResults.status === 'fulfilled' ? domainInfoResults.value : { error: 'Failed to analyze domain information' };
      results.safeBrowsing = safeBrowsingResults.status === 'fulfilled' ? safeBrowsingResults.value : { error: 'Failed to check website safety' };
      results.lighthouse = lighthouseResults.status === 'fulfilled' ? lighthouseResults.value : { error: 'Failed to run Lighthouse analysis' };
      
      // Generate recommendations based on the analysis
      results.recommendations = generateRecommendations(results);
      
      // Import schedulerService dynamically
      const schedulerModule = await import('../services/schedulerService.js');
      const schedulerService = schedulerModule.default;
      
      // Schedule the next scan
      await schedulerService.scheduleUrl(url);
      
      // Return the full analysis
      res.status(200).json({
        status: 'success',
        data: results,
        nextScan: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      });
      
    } catch (error) {
      // If there's an error in the analysis process
      console.error('Analysis error:', error);
      results.error = error.message || 'Unknown error occurred during analysis';
      
      res.status(500).json({
        status: 'error',
        message: 'Error analyzing website',
        data: results
      });
    }
  } catch (error) {
    // Pass error to error handling middleware
    next(error);
  }
};