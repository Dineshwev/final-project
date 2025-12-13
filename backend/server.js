// Express Server for AWS Elastic Beanstalk
// Clean production server for SEO Health Checker API

import app from './app.js';

// Force port configuration for Elastic Beanstalk
const PORT = process.env.PORT || 8080;

console.log('🚀 Starting SEO Health Checker API...');
console.log('🔧 PORT:', PORT);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);

// Add error logging
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

process.on("uncaughtException", err => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

// Start server
// Start server
app.listen(PORT, () => {
  console.log(`✅ SEO Health Checker API is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Scan API: http://localhost:${PORT}/api/scan`);
});