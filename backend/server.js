// Express Server for AWS Elastic Beanstalk
// Clean production server for SEO Health Checker API

import app from './app.js';
import { cleanupExpiredCache } from './services/cache.service.js';

// Force port configuration for Elastic Beanstalk
const PORT = process.env.PORT || 8080;

console.log('🚀 Starting SEO Health Checker API...');
console.log('🔧 PORT:', PORT);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);

// 🧹 AUTOMATIC CACHE CLEANUP
// Run cache cleanup every 30 minutes to prevent memory bloat
const CACHE_CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 minutes

setInterval(async () => {
  try {
    const deletedCount = await cleanupExpiredCache();
    if (deletedCount > 0) {
      console.log(`🧹 Automatic cache cleanup: removed ${deletedCount} expired entries`);
    }
  } catch (error) {
    console.error('🚨 Automatic cache cleanup failed:', error.message);
  }
}, CACHE_CLEANUP_INTERVAL);

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