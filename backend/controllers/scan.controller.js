import { analyzeDuplicateContent } from '../services/duplicateContent.service.js';
import { analyzeAccessibility } from '../services/accessibility.service.js';
import { analyzeBacklinks } from '../services/backlinks.service.js';
import { analyzeSchema } from '../services/schema.service.js';
import { analyzeMultiLanguage } from '../services/multiLanguage.service.js';
import { analyzeRankTracker } from '../services/rankTracker.service.js';

// Temporary in-memory storage for scan results
const scanResults = new Map();

// Generate a unique scan ID
const generateScanId = () => {
  return 'scan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// POST /api/scan
export const scanWebsite = async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      });
    }

    const scanId = generateScanId();
    
    // Store initial scan data
    scanResults.set(scanId, {
      url,
      status: 'completed',
      createdAt: new Date().toISOString()
    });

    res.json({
      success: true,
      data: {
        scanId
      }
    });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// GET /api/scan/:scanId/results
export const getScanResults = async (req, res) => {
  try {
    const { scanId } = req.params;
    
    // Check if scan exists
    const scan = scanResults.get(scanId);
    if (!scan) {
      return res.status(404).json({
        success: false,
        error: 'Scan not found'
      });
    }

    const { url } = scan;

    // Call all services to get mock data
    const [duplicateContent, accessibility, backlinks, schema, multiLanguage, rankTracker] = await Promise.all([
      analyzeDuplicateContent(url),
      analyzeAccessibility(url),
      analyzeBacklinks(url),
      analyzeSchema(url),
      analyzeMultiLanguage(url),
      analyzeRankTracker(url)
    ]);

    const results = {
      scanId,
      url,
      status: 'completed',
      createdAt: scan.createdAt,
      results: {
        duplicateContent,
        accessibility,
        backlinks,
        schema,
        multiLanguage,
        rankTracker
      }
    };

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
