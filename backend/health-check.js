#!/usr/bin/env node

// Simple health check script for AWS App Runner deployment verification
// This file helps verify the server starts correctly

import http from 'http';

const PORT = process.env.PORT || 3002;
const healthCheckUrl = `http://localhost:${PORT}/health`;

console.log('🔍 Starting health check verification...');
console.log(`📍 Checking: ${healthCheckUrl}`);

// Wait a bit for server to start
setTimeout(() => {
  const req = http.get(healthCheckUrl, (res) => {
    console.log(`✅ Health check response: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📄 Response body:`, data);
      if (res.statusCode === 200) {
        console.log('🎉 Server is healthy and ready!');
        process.exit(0);
      } else {
        console.error('❌ Health check failed');
        process.exit(1);
      }
    });
  });
  
  req.on('error', (err) => {
    console.error(`❌ Health check error:`, err.message);
    process.exit(1);
  });
  
  req.setTimeout(5000, () => {
    console.error('⏰ Health check timeout');
    req.destroy();
    process.exit(1);
  });
}, 2000);