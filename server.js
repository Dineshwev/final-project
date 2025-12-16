// Express Server for AWS Elastic Beanstalk
// Production-ready server with Puppeteer support for AWS Linux

import express from 'express';
import cors from 'cors';

// Force port configuration for Elastic Beanstalk
const PORT = process.env.PORT || 8080;

console.log('🚀 Starting SEO Health Checker API...');
console.log('🔧 PORT:', PORT);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);

// Add full error logging
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

process.on("uncaughtException", err => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

// Create Express app
const app = express();

// Add CORS support for all origins
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Puppeteer configuration for AWS Linux
const getPuppeteerConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    return {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ],
      executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium-browser'
    };
  }
  
  return {
    headless: 'new'
  };
};

// Helper function to extract URL from scanId
function generateUrlFromScanId(scanId) {
  // Extract timestamp from scanId and generate a consistent URL
  if (scanId.includes('fixed-scan')) {
    const timestamp = scanId.split('-').pop();
    const domain = parseInt(timestamp) % 2 === 0 ? 'example.com' : 'testsite.org';
    return `https://${domain}`;
  }
  return 'https://example.com';
}

// Helper function to generate dynamic scan data based on scanId
function generateDynamicScanData(scanId) {
  const url = generateUrlFromScanId(scanId);
  const timestamp = Date.now();
  
  // Generate some variation based on scanId
  const variation = parseInt(scanId.split('-').pop() || '0') % 100;
  
  const seoIssues = [
    {
      id: 'issue-0',
      type: 'warning',
      title: 'Technical SEO',
      description: 'Add canonical tags to blog pages',
      impact: 50 + (variation % 30),
      recommendation: 'Implement canonical tags on all blog pages'
    },
    {
      id: 'issue-1', 
      type: 'info',
      title: 'Content',
      description: 'Increase content length on product pages',
      impact: 30 + (variation % 20),
      recommendation: 'Add more detailed product descriptions'
    },
    {
      id: 'issue-2',
      type: 'error',
      title: 'Performance', 
      description: 'Optimize large images',
      impact: 80 - (variation % 25),
      recommendation: 'Compress and optimize images'
    }
  ];
  
  // Add random issues based on URL
  if (url.includes('testsite')) {
    seoIssues.push({
      id: 'issue-3',
      type: 'warning',
      title: 'Meta Tags',
      description: 'Missing meta description on some pages',
      impact: 40,
      recommendation: 'Add meta descriptions to all pages'
    });
  }
  
  return {
    id: scanId,
    url: url,
    timestamp: new Date().toISOString(),
    score: Math.max(20, 100 - (variation % 50)), // Score between 20-100
    seoIssues: seoIssues,
    keywords: [],
    metrics: {
      loadTime: 1.5 + (variation % 30) / 10, // Load time 1.5-4.5s
      pageSize: 2048 + (variation * 50), // Page size variation
      requests: 25 + (variation % 20), // Request count
      mobileScore: Math.max(30, 85 - (variation % 40)), 
      desktopScore: Math.max(40, 90 - (variation % 35))
    },
    securityChecks: [
      {
        name: 'HTTPS Enabled',
        status: url.startsWith('https') ? 'passed' : 'failed'
      },
      {
        name: 'Security Headers', 
        status: variation % 3 === 0 ? 'passed' : 'warning'
      }
    ]
  };
}

// Health check route for Elastic Beanstalk
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'SEO Health Checker API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'SEO Health Checker API - AWS Elastic Beanstalk',
    version: '1.0.0',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// API Status endpoint
app.get("/api/status", (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API server running on AWS Elastic Beanstalk with Express!',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    puppeteerConfig: getPuppeteerConfig()
  });
});

// Mock auth login endpoint
app.post("/api/auth/login", (req, res) => {
  try {
    const userData = req.body || {};
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: 'mock-user-123',
        email: userData.email || 'user@example.com',
        name: 'Mock User',
        verified: true
      },
      token: 'mock-jwt-token-' + Date.now()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid request data'
    });
  }
});

// Scan endpoint GET
app.get("/api/scan", (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      scanId: 'mock-scan-123',
      status: 'ready',
      message: 'Scan service available'
    }
  });
});

// Scan endpoint POST
app.post("/api/scan", (req, res) => {
  try {
    const scanData = req.body || {};
    res.status(200).json({
      success: true,
      data: {
        scanId: 'fixed-scan-' + Date.now(),
        status: 'initiated',
        message: 'Scan started successfully',
        url: scanData.url || 'unknown'
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid JSON in request body'
    });
  }
});

// Basic scan endpoint - Health check
app.get("/api/basic-scan", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Basic scan endpoint is available",
    endpoint: "POST /api/basic-scan"
  });
});

// Basic scan endpoint - Simplified for home page quick scans
app.post("/api/basic-scan", (req, res) => {
  try {
    const { url } = req.body || {};
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Valid URL is required for basic scan'
      });
    }

    // Simple URL validation
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid website URL (e.g., https://example.com)'
      });
    }

    // Return mock scan result as requested
    res.status(200).json({
      status: "success",
      url,
      score: 85,
      checks: {
        title: "ok",
        meta: "ok",
        links: "ok"
      }
    });

  } catch (error) {
    console.error('Basic scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during scan. Please try again.'
    });
  }
});

// Scan results endpoint - Dynamic data based on scanId
app.get("/api/scan/:scanId/results", (req, res) => {
  const scanId = req.params.scanId;
  console.log(`📊 Scan results request for scanId: ${scanId}`);
  
  // Generate dynamic scan data based on scanId
  const mockScanData = generateDynamicScanData(scanId);
  
  res.status(200).json({
    status: 'success',
    data: mockScanData
  });
});

// PDF export endpoint
app.get("/api/export/:scanId/pdf", (req, res) => {
  const scanId = req.params.scanId;
  console.log(`📄 PDF export request for scanId: ${scanId}`);
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="scan-report-${scanId}.pdf"`);
  res.status(200).send('Mock PDF content - PDF generation not implemented yet');
});

// CSV export endpoint  
app.get("/api/export/:scanId/csv", (req, res) => {
  const scanId = req.params.scanId;
  console.log(`📊 CSV export request for scanId: ${scanId}`);
  
  const csvContent = `URL,Score,Issues,Load Time\n"${generateUrlFromScanId(scanId)}",85,3,2.3s`;
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="scan-report-${scanId}.csv"`);
  res.status(200).send(csvContent);
});

// Alerts unread count endpoint
app.get("/api/alerts/unread-count", (req, res) => {
  const userId = req.query.userId || 'anonymous';
  console.log(`🔔 Alerts unread count request for user: ${userId}`);
  res.status(200).json({
    success: true,
    count: 2
  });
});

// User API keys endpoint
app.get("/api/user/api-keys", (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      apiKey: 'mock-key-123',
      isActive: true
    }
  });
});

// History recent endpoint
app.get("/api/history/recent", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  res.status(200).json({
    success: true,
    data: {
      scans: [
        {
          id: 'scan_123',
          url: 'https://example.com',
          timestamp: '2024-01-15T10:30:00Z',
          score: 85,
          issues_found: 3,
          status: 'completed'
        },
        {
          id: 'scan_122', 
          url: 'https://testsite.com',
          timestamp: '2024-01-14T15:20:00Z',
          score: 82,
          issues_found: 5,
          status: 'completed'
        }
      ],
      total: 2,
      timestamp: new Date().toISOString()
    }
  });
});

// Get alerts endpoint
app.get("/api/get-alerts", (req, res) => {
  console.log('🚨 GET-ALERTS endpoint accessed');
  res.status(200).json({
    alerts: [
      {
        id: 1,
        type: 'broken_link',
        severity: 'high',
        message: 'Broken internal link detected: /old-page-url',
        url: 'https://example.com/contact',
        detected_at: '2024-01-15T10:30:00Z',
        status: 'active'
      },
      {
        id: 2,
        type: 'missing_meta',
        severity: 'medium', 
        message: 'Missing meta description on homepage',
        url: 'https://example.com',
        detected_at: '2024-01-15T09:15:00Z',
        status: 'active'
      }
    ],
    success: true,
    count: 2,
    unreadCount: 2,
    timestamp: new Date().toISOString()
  });
});

// General alerts endpoint
app.get("/api/alerts", (req, res) => {
  res.status(200).json({
    success: true,
    data: []
  });
});

// Catch-all for undefined API routes
app.all("/api/*", (req, res) => {
  console.log(`🔧 Generic API handler for: ${req.path}`);
  res.status(200).json({
    status: 'ok',
    message: 'API endpoint available',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    data: []
  });
});

// 404 handler for non-API routes
app.all("*", (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /',
      'GET /health', 
      'GET /api/status',
      'GET /api/alerts/unread-count',
      'GET /api/history/recent',
      'GET /api/user/api-keys',
      'GET /api/scan',
      'POST /api/scan',
      'GET /api/scan/:scanId/results',
      'GET /api/export/:scanId/pdf',
      'GET /api/export/:scanId/csv'
    ]
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Express Error:', error);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server with error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log("🚀 SEO Health Checker API running on port " + PORT);
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`🔧 API status: http://0.0.0.0:${PORT}/api/status`);
  console.log(`📋 Available API endpoints:`);
  console.log(`   ✅ GET /api/alerts/unread-count`);
  console.log(`   ✅ GET /api/history/recent`);
  console.log(`   ✅ GET /api/user/api-keys`);
  console.log(`   ✅ GET /api/scan`);
  console.log(`   ✅ POST /api/scan`);
  console.log(`   ✅ GET /api/scan/:scanId/results`);
  console.log(`   ✅ GET /api/export/:scanId/pdf`);
  console.log(`   ✅ GET /api/export/:scanId/csv`);
  console.log(`🚀 AWS Elastic Beanstalk server ready!`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('📴 Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('📴 Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📴 Received SIGINT, shutting down gracefully');
  server.close(() => {
    console.log('📴 Server closed');
    process.exit(0);
  });
});