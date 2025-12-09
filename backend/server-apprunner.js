// AWS App Runner Conformant Server - Port 3002
// Using built-in Node.js modules only for App Runner deployment
// Deploy timestamp: 2025-12-09T17:40:00Z - Force redeploy with all API routes

import http from 'http';
import url from 'url';

// Explicitly set port to 3002 for AWS App Runner
const PORT = 3002;

// Create HTTP server using built-in module
const server = http.createServer((req, res) => {
  // Parse URL and extract clean pathname (without query parameters)
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
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
  }
  
  // Allow specific HTTP methods
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  
  // Allow specific headers (including Authorization for tokens)
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (method === 'OPTIONS') {
    res.writeHead(204); // 204: No Content, but headers sent
    res.end();
    return;
  }

  // Set content type
  res.setHeader('Content-Type', 'application/json');

  // Log incoming requests for debugging
  console.log(`📥 ${new Date().toISOString()} - ${method} ${path}`);
  if (query && Object.keys(query).length > 0) {
    console.log(`📋 Query params:`, query);
  }
  console.log(`🔍 Full URL: ${req.url}`);
  console.log(`🌐 Origin: ${req.headers.origin}`);

  // Handle root path
  if (path === '/' && method === 'GET') {
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
  if (path === '/health' && method === 'GET') {
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
  if (path === '/api/status' && method === 'GET') {
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
  if (path === '/api/alerts/unread-count' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true,
      count: 0 
    }));
    return;
  }

  // Handle user API keys endpoint
  if (path === '/api/user/api-keys' && method === 'GET') {
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
  if (path === '/api/history/recent' && method === 'GET') {
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
  if (path === '/api/scan' && method === 'GET') {
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
  if (path === '/api/scan' && method === 'POST') {
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

  // Handle alerts general endpoint
  if (path.startsWith('/api/alerts') && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: []
    }));
    return;
  }

  // Handle any other API endpoints with generic response
  if (path.startsWith('/api/') && method === 'GET') {
    console.log(`🔧 Generic API handler for: ${path}`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      message: 'API endpoint available',
      path: path,
      method: method,
      timestamp: new Date().toISOString(),
      data: []
    }));
    return;
  }

  // Handle test endpoint for debugging
  if (path === '/api/test' && method === 'GET') {
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
  console.log(`❌ 404 - Route not found: ${method} ${path}`);
  console.log(`📋 Available routes: GET /, GET /health, GET /api/status, GET /api/alerts/unread-count, GET /api/history/recent, GET /api/user/api-keys, GET /api/scan, POST /api/scan`);
  res.writeHead(404);
  res.end(JSON.stringify({
    status: 'error',
    message: 'Endpoint not found',
    path: path,
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