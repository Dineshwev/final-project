// AWS App Runner Conformant Server - Port 3002
// Using built-in Node.js modules only for App Runner deployment
// Deploy timestamp: 2025-12-10T05:10:00Z - FORCE REDEPLOY with /api/get-alerts endpoint

import http from 'http';
import url from 'url';

// Explicitly set port to 3002 for AWS App Runner
const PORT = 3002;

// Create HTTP server using built-in module
const server = http.createServer((req, res) => {
  // Parse URL and extract clean pathname (without query parameters)
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname; // Clean path without query string
  const query = parsedUrl.query;
  const method = req.method;

  // Set CORS headers for cross-origin requests
  // Allow specific origin: healthyseo.tech and AWS App Runner domains
  const allowedOrigins = [
    'https://www.healthyseo.tech',
    'https://healthyseo.tech',
    'https://inrpws5mww.ap-southeast-2.awsapprunner.com'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.healthyseo.tech');
  }
  
  // Allow specific HTTP methods
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  
  // Allow specific headers (including Authorization for tokens)
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request FIRST
  if (method === 'OPTIONS') {
    res.writeHead(204); // 204: No Content, but headers sent
    res.end();
    return;
  }

  // Set content type
  res.setHeader('Content-Type', 'application/json');

  // Log incoming requests for debugging
  console.log(`📥 ${new Date().toISOString()} - ${method} ${pathname}`);
  if (query && Object.keys(query).length > 0) {
    console.log(`📋 Query params:`, query);
  }
  console.log(`🔍 Full URL: ${req.url}`);
  console.log(`🌐 Origin: ${req.headers.origin}`);

  // Handle root path
  if (pathname === '/' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'success',
      message: 'Server running on App Runner port 3002!',
      port: PORT,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Handle health check endpoint for App Runner
  if (pathname === '/health' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'healthy',
      port: PORT,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Handle API status endpoint
  if (pathname === '/api/status' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'success',
      message: 'API server running on App Runner port 3002!',
      version: '1.0.0',
      environment: 'production',
      port: PORT
    }));
    return;
  }

  // Handle alerts unread count endpoint
  if (pathname === '/api/alerts/unread-count' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true,
      count: 0 
    }));
    return;
  }

  // Handle user API keys endpoint
  if (pathname === '/api/user/api-keys' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: {
        apiKey: 'mock-key-123',
        isActive: true
      }
    }));
    return;
  }

  // Handle history recent endpoint
  if (pathname === '/api/history/recent' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: {
        history: [],
        totalCount: 0,
        currentPage: 1
      }
    }));
    return;
  }

  // Handle scan endpoint
  if (pathname === '/api/scan' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: {
        scanId: 'mock-scan-123',
        status: 'ready',
        message: 'Scan service available'
      }
    }));
    return;
  }

  // Handle scan POST requests (need to parse body)
  if (pathname === '/api/scan' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const scanData = body ? JSON.parse(body) : {};
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          data: {
            scanId: 'mock-scan-' + Date.now(),
            status: 'initiated',
            message: 'Scan started successfully',
            url: scanData.url || 'unknown'
          }
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Invalid JSON in request body'
        }));
      }
    });
    return;
  }

  // Handle specific get-alerts endpoint (what the frontend calls)
  if (pathname === '/api/get-alerts' && method === 'GET') {
    console.log('🚨 GET-ALERTS endpoint accessed');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
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
          url: 'https://example.com/',
          detected_at: '2024-01-15T09:45:00Z',
          status: 'active'
        }
      ],
      total: 2,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Handle history endpoint (what the frontend calls)
  if (pathname === '/api/history' && method === 'GET') {
    console.log('📊 HISTORY endpoint accessed');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      scans: [
        {
          id: 'scan_123',
          url: 'https://example.com',
          date: '2024-01-15T08:00:00Z',
          score: 85,
          issues_found: 3,
          status: 'completed'
        },
        {
          id: 'scan_122', 
          url: 'https://example.com',
          date: '2024-01-14T08:00:00Z',
          score: 82,
          issues_found: 5,
          status: 'completed'
        }
      ],
      total: 2,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Handle alerts general endpoint
  if (pathname.startsWith('/api/alerts') && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: []
    }));
    return;
  }

  // Handle any other API endpoints with generic response
  if (pathname.startsWith('/api/') && method === 'GET') {
    console.log(`🔧 Generic API handler for: ${pathname}`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      message: 'API endpoint available',
      path: pathname,
      method: method,
      timestamp: new Date().toISOString(),
      data: []
    }));
    return;
  }

  // Handle test endpoint for debugging
  if (pathname === '/api/test' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'success',
      message: 'Test endpoint working!',
      timestamp: new Date().toISOString(),
      server: 'AWS App Runner',
      version: '2.0.0'
    }));
    return;
  }

  // 404 for all other routes
  console.log(`❌ 404 - Route not found: ${method} ${pathname}`);
  console.log(`🔍 Request details:`);
  console.log(`   - Method: ${method}`);
  console.log(`   - Path: ${pathname}`);
  console.log(`   - Full URL: ${req.url}`);
  console.log(`   - Headers:`, req.headers);
  console.log(`📋 Available routes:`);
  console.log(`   - GET /`);
  console.log(`   - GET /health`);
  console.log(`   - GET /api/status`);
  console.log(`   - GET /api/alerts/unread-count`);
  console.log(`   - GET /api/history/recent`);
  console.log(`   - GET /api/user/api-keys`);
  console.log(`   - GET /api/scan`);
  console.log(`   - POST /api/scan`);
  res.writeHead(404);
  res.end(JSON.stringify({
    status: 'error',
    message: 'Endpoint not found',
    path: pathname,
    method: method,
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /',
      'GET /health', 
      'GET /api/status',
      'GET /api/alerts/unread-count',
      'GET /api/history/recent',
      'GET /api/user/api-keys',
      'GET /api/scan',
      'POST /api/scan'
    ]
  }));
});

// Error handling
server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

// Start server on port 3002
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ App Runner server running on port ${PORT}`);
  console.log(`🌐 Server accessible at http://0.0.0.0:${PORT}`);
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`🔧 API status: http://0.0.0.0:${PORT}/api/status`);
  console.log(`📋 Available API endpoints:`);
  console.log(`   ✅ GET /api/alerts/unread-count`);
  console.log(`   ✅ GET /api/history/recent`);
  console.log(`   ✅ GET /api/user/api-keys`);
  console.log(`   ✅ GET /api/scan`);
  console.log(`   ✅ POST /api/scan`);
  console.log(`🚀 All API routes registered successfully!`);
});

// Graceful shutdown handling
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

export default server;