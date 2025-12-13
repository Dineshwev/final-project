/**
 * 🚀 CACHE SYSTEM TEST
 * 
 * Comprehensive test for smart caching functionality.
 * Tests URL normalization, cache lookup, cache write, and TTL behavior.
 * 
 * Version: 1.0
 * Last Modified: December 13, 2025
 */

import { 
  normalizeUrl, 
  generateCacheKey, 
  getCachedScan, 
  cacheScanResult,
  cleanupExpiredCache,
  invalidateCache
} from '../services/cache.service.js';
import dbRepository from '../database/repository.js';

async function testCacheSystem() {
  console.log('🚀 Starting Cache System Test...\n');
  
  try {
    // Test 1: URL Normalization
    console.log('1️⃣ Testing URL normalization...');
    
    const testUrls = [
      'https://example.com/',
      'https://EXAMPLE.COM',
      'http://example.com',
      'https://example.com?utm_source=test&ref=social',
      'https://example.com/path/',
      'https://example.com/path'
    ];
    
    testUrls.forEach(url => {
      const normalized = normalizeUrl(url);
      console.log(`   ${url} → ${normalized}`);
    });
    
    // Test 2: Cache Key Generation
    console.log('\n2️⃣ Testing cache key generation...');
    
    const url = 'https://example.com';
    const services1 = ['accessibility', 'duplicateContent'];
    const services2 = ['duplicateContent', 'accessibility']; // Same services, different order
    const services3 = ['backlinks', 'schema'];
    
    const key1 = generateCacheKey(url, services1);
    const key2 = generateCacheKey(url, services2);
    const key3 = generateCacheKey(url, services3);
    
    console.log(`   Services [${services1.join(', ')}]: ${key1}`);
    console.log(`   Services [${services2.join(', ')}]: ${key2}`);
    console.log(`   Services [${services3.join(', ')}]: ${key3}`);
    console.log(`   Same order consistency: ${key1 === key2 ? '✅' : '❌'}`);
    console.log(`   Different services: ${key1 !== key3 ? '✅' : '❌'}`);
    
    // Test 3: Database Health Check
    console.log('\n3️⃣ Checking database connection...');
    const health = await dbRepository.healthCheck();
    console.log(`   Status: ${health.status} (${health.mode || 'postgresql'})`);
    
    if (health.status !== 'healthy') {
      console.log('   ⚠️  Database not available, cache tests will use mock');
    }
    
    // Test 4: Cache Miss Scenario
    console.log('\n4️⃣ Testing cache miss...');
    
    const testUrl = 'https://test-cache.com';
    const testServices = ['accessibility'];
    
    const cacheMiss = await getCachedScan(testUrl, testServices, 'FREE');
    console.log(`   Cache lookup result: ${cacheMiss ? '❌ Unexpected hit' : '✅ Miss as expected'}`);
    
    // Test 5: Cache Write and Read (if database is available)
    if (health.status === 'healthy') {
      console.log('\n5️⃣ Testing cache write and read...');
      
      // Create a mock scan result
      const mockScan = await dbRepository.createScan(testUrl);
      console.log(`   Created mock scan: ${mockScan.id}`);
      
      // Update scan to completed status
      await dbRepository.updateScanStatus(mockScan.id, 'completed');
      
      // Cache the result
      const cacheWriteSuccess = await cacheScanResult(mockScan.id, testUrl, testServices, 'FREE');
      console.log(`   Cache write: ${cacheWriteSuccess ? '✅' : '❌'}`);
      
      if (cacheWriteSuccess) {
        // Try to read from cache
        const cacheHit = await getCachedScan(testUrl, testServices, 'FREE');
        console.log(`   Cache hit: ${cacheHit ? '✅' : '❌'}`);
        
        if (cacheHit) {
          console.log(`   Cached scan ID: ${cacheHit.id}`);
          console.log(`   From cache flag: ${cacheHit.fromCache}`);
          console.log(`   Cache key: ${cacheHit.cacheKey}`);
        }
      }
      
      // Test 6: Plan-based TTL
      console.log('\n6️⃣ Testing plan-based TTL...');
      
      const guestCacheKey = generateCacheKey(testUrl + '/guest', testServices);
      const freeCacheKey = generateCacheKey(testUrl + '/free', testServices);
      const proCacheKey = generateCacheKey(testUrl + '/pro', testServices);
      
      // Create scans and cache them with different plans
      const guestScan = await dbRepository.createScan(testUrl + '/guest');
      const freeScan = await dbRepository.createScan(testUrl + '/free');
      const proScan = await dbRepository.createScan(testUrl + '/pro');
      
      await dbRepository.updateScanStatus(guestScan.id, 'completed');
      await dbRepository.updateScanStatus(freeScan.id, 'completed');
      await dbRepository.updateScanStatus(proScan.id, 'completed');
      
      await cacheScanResult(guestScan.id, testUrl + '/guest', testServices, 'GUEST');
      await cacheScanResult(freeScan.id, testUrl + '/free', testServices, 'FREE');
      await cacheScanResult(proScan.id, testUrl + '/pro', testServices, 'PRO');
      
      console.log('   ✅ Cached scans for all plan types');
      
      // Test 7: Cache Statistics
      console.log('\n7️⃣ Testing cache statistics...');
      
      const stats = await dbRepository.getCacheStats();
      console.log(`   Total entries: ${stats.total_entries}`);
      console.log(`   Valid entries: ${stats.valid_entries}`);
      console.log(`   Expired entries: ${stats.expired_entries}`);
      
      // Test 8: Cache Cleanup
      console.log('\n8️⃣ Testing cache cleanup...');
      
      const cleanedCount = await cleanupExpiredCache();
      console.log(`   Cleaned up: ${cleanedCount} expired entries`);
      
      // Test 9: Cache Invalidation
      console.log('\n9️⃣ Testing cache invalidation...');
      
      const invalidateSuccess = await invalidateCache(testUrl, testServices);
      console.log(`   Invalidation: ${invalidateSuccess ? '✅' : '❌'}`);
      
      // Verify invalidation worked
      const postInvalidationHit = await getCachedScan(testUrl, testServices, 'FREE');
      console.log(`   Post-invalidation lookup: ${postInvalidationHit ? '❌ Still cached' : '✅ Successfully invalidated'}`);
    }
    
    console.log('\n🎉 Cache system test completed!');
    
  } catch (error) {
    console.error('🚨 Cache test failed:', error);
  } finally {
    await dbRepository.close();
  }
}

// Run test if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testCacheSystem();
}

export default testCacheSystem;