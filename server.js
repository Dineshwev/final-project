// AWS App Runner Ultra-Minimal Server - Zero External Dependencies
// Built with Node.js built-in modules only for guaranteed compatibility
// Deploy timestamp: 2025-12-12T09:49:00Z - UPDATED VERSION with proper API responses

import http from 'http';
import url from 'url';
import { createRequire } from 'module';

// Create require for JSON imports in ES modules
const require = createRequire(import.meta.url);

// Determine port from environment or default to 3002
const PORT = process.env.PORT || 3002;

console.log(`🚀 Starting ultra-minimal server on port ${PORT}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

// Create HTTP server using built-in module only
const server = http.createServer((req, res) => {
  // Parse URL and extract clean pathname
  const parsedUrl = url.parse(req.url, true);
  let cleanPath = parsedUrl.pathname;
  const query = parsedUrl.query;
  const method = req.method;

  // Aggressive path cleanup
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }
  cleanPath = cleanPath.toLowerCase();

  // Universal CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Set content type
  res.setHeader('Content-Type', 'application/json');

  // Log requests
  const timestamp = new Date().toISOString();
  console.log(`📥 ${timestamp} - ${method} ${cleanPath}`);

  try {
    // Root endpoint
    if (cleanPath === '' || cleanPath === '/') {
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'success',
        message: 'Minimal SEO API Server Running!',
        version: '1.0.0-minimal',
        port: PORT,
        timestamp: timestamp
      }));
      return;
    }

    // Health check endpoint (required by App Runner)
    if (cleanPath === '/health') {
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        port: PORT,
        timestamp: timestamp
      }));
      return;
    }

    // API status endpoint
    if (cleanPath === '/api/status') {
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'success',
        message: 'API is operational',
        version: '1.0.0-minimal',
        environment: process.env.NODE_ENV || 'development',
        port: PORT,
        timestamp: timestamp
      }));
      return;
    }

    // Mock scan endpoint GET
    if (cleanPath === '/api/scan' && method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        message: 'Scan service available (minimal mode)',
        features: ['basic-scan', 'health-check'],
        timestamp: timestamp
      }));
      return;
    }

    // Mock scan endpoint POST
    if (cleanPath === '/api/scan' && method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', () => {
        try {
          const scanData = body ? JSON.parse(body) : {};
          const scanId = 'minimal-scan-' + Date.now();
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            scanId: scanId,
            url: scanData.url || 'unknown',
            status: 'started',
            timestamp: timestamp
          }));
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            error: 'Invalid JSON in request body',
            timestamp: timestamp
          }));
        }
      });
      return;
    }

    // Mock alerts unread count endpoint
    if (cleanPath === '/api/alerts/unread-count' && method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        count: 0,
        unreadCount: 0,
        alerts: [],
        timestamp: timestamp
      }));
      return;
    }

    // Mock social platforms endpoint
    if (cleanPath === '/api/social/platforms' && method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        platforms: ['facebook', 'twitter', 'linkedin', 'instagram'],
        timestamp: timestamp
      }));
      return;
    }

    // Mock alerts endpoint
    if (cleanPath === '/api/get-alerts' && method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        alerts: [],
        total: 0,
        timestamp: timestamp
      }));
      return;
    }

    // Mock scan status endpoint
    if (cleanPath.startsWith('/api/scan/') && cleanPath.includes('/status') && method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        status: 'completed',
        progress: 100,
        timestamp: timestamp
      }));
      return;
    }

    // Mock scan results endpoint
    if (cleanPath.startsWith('/api/scan/') && cleanPath.includes('/results') && method === 'GET') {
      const scanId = cleanPath.split('/')[3];
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        scanId: scanId,
        status: 'completed',
        results: {
          title: 'Sample SEO Analysis',
          score: 85,
          issues: [
            { type: 'warning', message: 'Meta description could be longer' }
          ],
          recommendations: [
            { type: 'improvement', message: 'Add alt text to images' }
          ]
        },
        timestamp: timestamp
      }));
      return;
    }

    // Mock history recent endpoint
    if (cleanPath === '/api/history/recent' && method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        scans: [],
        total: 0,
        message: 'No recent scans available',
        timestamp: timestamp
      }));
      return;
    }

    // Mock history endpoint
    if (cleanPath === '/api/history' && method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        scans: [],
        total: 0,
        message: 'No scan history available',
        timestamp: timestamp
      }));
      return;
    }

    // Generic API endpoints
    if (cleanPath.startsWith('/api/')) {
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'ok',
        message: 'API endpoint available (minimal mode)',
        path: cleanPath,
        method: method,
        timestamp: timestamp
      }));
      return;
    }

    // 404 for all other routes
    console.log(`❌ 404 - Route not found: ${method} ${cleanPath}`);
    res.writeHead(404);
    res.end(JSON.stringify({
      status: 'error',
      message: 'Endpoint not found',
      path: cleanPath,
      method: method,
      availableEndpoints: [
        'GET /',
        'GET /health',
        'GET /api/status',
        'GET|POST /api/scan',
        'GET /api/scan/{id}/status',
        'GET /api/scan/{id}/results',
        'GET /api/alerts/unread-count',
        'GET /api/get-alerts',
        'GET /api/history',
        'GET /api/history/recent',
        'GET /api/social/platforms'
      ],
      timestamp: timestamp
    }));

  } catch (error) {
    console.error('💥 Server error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({
      status: 'error',
      message: 'Internal server error',
      timestamp: timestamp
    }));
  }
});

// Error handling
server.on('error', (err) => {
  console.error('💥 Server startup error:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📴 Received SIGINT, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log('✅ Ultra-minimal server started successfully!');
  console.log(`🌐 Server accessible at http://0.0.0.0:${PORT}`);
  console.log(`❤️  Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`📊 API status: http://0.0.0.0:${PORT}/api/status`);
  console.log(`🔧 Available endpoints:`);
  console.log(`   ✅ GET /`);
  console.log(`   ✅ GET /health`);
  console.log(`   ✅ GET /api/status`);
  console.log(`   ✅ GET /api/scan`);
  console.log(`   ✅ POST /api/scan`);
  console.log(`   ✅ GET /api/scan/{id}/status`);
  console.log(`   ✅ GET /api/scan/{id}/results`);
  console.log(`   ✅ GET /api/alerts/unread-count`);
  console.log(`   ✅ GET /api/get-alerts`);
  console.log(`   ✅ GET /api/history`);
  console.log(`   ✅ GET /api/history/recent`);
  console.log(`   ✅ GET /api/social/platforms`);
  console.log('🚀 Ready for App Runner deployment!');
});

// Export for testing (optional)
export default server;