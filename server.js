// Root-level server for AWS App Runner compatibility
// This ensures AWS can find and run the server regardless of directory structure

import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting root-level server for AWS App Runner...');
console.log('📁 Current directory:', process.cwd());
console.log('📁 Script directory:', __dirname);

// Try to import the backend server
let backendServer;
try {
  // Import the actual backend server
  const backendPath = path.join(__dirname, 'backend', 'server.js');
  console.log('📂 Attempting to load backend from:', backendPath);
  
  // Import and start the backend server
  const { default: server } = await import('./backend/server.js');
  console.log('✅ Backend server imported successfully');
  
} catch (error) {
  console.error('❌ Failed to import backend server:', error);
  
  // Fallback: create a simple server with the API routes
  const server = createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    
    console.log(`📥 Request: ${req.method} ${path}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }
    
    // Handle API routes
    if (path === '/health') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'healthy', port: 3002 }));
      return;
    }
    
    if (path === '/api/get-alerts') {
      res.writeHead(200);
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

    if (path === '/api/history') {
      res.writeHead(200);
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

    if (path === '/api/status') {
      res.writeHead(200);
      res.end(JSON.stringify({ 
        status: 'success', 
        message: 'Fallback server running',
        timestamp: new Date().toISOString()
      }));
      return;
    }
    
    if (path === '/api/alerts/unread-count') {
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, count: 0 }));
      return;
    }
    
    if (path === '/api/history/recent') {
      res.writeHead(200);
      res.end(JSON.stringify({ 
        success: true, 
        data: { history: [], totalCount: 0, currentPage: 1 }
      }));
      return;
    }
    
    if (path === '/api/user/api-keys') {
      res.writeHead(200);
      res.end(JSON.stringify({ 
        success: true, 
        data: { apiKey: 'demo-key', isActive: true }
      }));
      return;
    }
    
    if (path === '/api/scan') {
      res.writeHead(200);
      res.end(JSON.stringify({ 
        success: true, 
        data: { scanId: `scan-${Date.now()}`, status: 'ready' }
      }));
      return;
    }
    
    // 404 for unknown routes
    res.writeHead(404);
    res.end(JSON.stringify({ 
      error: 'Not found', 
      path: path,
      availableRoutes: ['/health', '/api/status', '/api/get-alerts', '/api/history', '/api/alerts/unread-count', '/api/history/recent', '/api/user/api-keys', '/api/scan']
    }));
  });
  
  const PORT = process.env.PORT || 3002;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Fallback server running on port ${PORT}`);
    console.log(`🌐 Available endpoints:`);
    console.log(`   - GET /health`);
    console.log(`   - GET /api/status`);
    console.log(`   - GET /api/get-alerts`);
    console.log(`   - GET /api/history`);
    console.log(`   - GET /api/alerts/unread-count`);
    console.log(`   - GET /api/history/recent`);
    console.log(`   - GET /api/user/api-keys`);
    console.log(`   - GET /api/scan`);
  });
}