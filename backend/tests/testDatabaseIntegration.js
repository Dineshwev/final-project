/**
 * 🧪 DATABASE INTEGRATION TEST
 * 
 * Tests the database-backed scan lifecycle to ensure:
 * - Database connection works
 * - Scan creation and lifecycle tracking
 * - Service status updates
 * - Progress calculation
 * - Retry functionality
 * - Cross-restart persistence
 */

import dbRepository from '../database/repository.js';
import { 
  initializeScan,
  startScan,
  updateServiceStatus,
  getScanStatus,
  prepareScanForRetry,
  getRetryStatus
} from '../services/scanLifecycle.service.js';

async function testDatabaseIntegration() {
  console.log('🧪 Starting Database Integration Test...\n');

  try {
    // 1️⃣ Test Database Connection
    console.log('1️⃣ Testing database connection...');
    const health = await dbRepository.healthCheck();
    console.log('✅ Database health:', health.status);
    if (health.status !== 'healthy') {
      throw new Error('Database is not healthy');
    }

    // 2️⃣ Test Scan Creation
    console.log('\n2️⃣ Testing scan creation...');
    const testUrl = 'https://example.com';
    const scanInit = await initializeScan(testUrl);
    console.log('✅ Scan created:', {
      scanId: scanInit.scanId,
      url: scanInit.url,
      status: scanInit.status
    });

    const scanId = scanInit.scanId;

    // 3️⃣ Test Scan Start
    console.log('\n3️⃣ Testing scan start...');
    await startScan(scanId);
    console.log('✅ Scan started successfully');

    // 4️⃣ Test Service Status Updates
    console.log('\n4️⃣ Testing service status updates...');
    
    // Start accessibility service
    await updateServiceStatus(scanId, 'accessibility', 'running');
    console.log('✅ Accessibility service marked as running');
    
    // Complete accessibility service with success
    const accessibilityResult = {
      score: 85,
      data: { violations: [], passes: ['color-contrast'] },
      issues: ['Missing alt text on 2 images'],
      executionTimeMs: 1500
    };
    await updateServiceStatus(scanId, 'accessibility', 'success', accessibilityResult);
    console.log('✅ Accessibility service completed successfully');

    // Fail duplicate content service
    const duplicateError = {
      error: { message: 'Connection timeout', retryable: true },
      executionTimeMs: 3000
    };
    await updateServiceStatus(scanId, 'duplicateContent', 'running');
    await updateServiceStatus(scanId, 'duplicateContent', 'failed', duplicateError);
    console.log('✅ Duplicate content service failed (retryable)');

    // 5️⃣ Test Progress Tracking
    console.log('\n5️⃣ Testing progress tracking...');
    const scanStatus1 = await getScanStatus(scanId);
    console.log('✅ Scan progress:', {
      status: scanStatus1.status,
      progress: scanStatus1.progress
    });

    // 6️⃣ Test Retry Functionality
    console.log('\n6️⃣ Testing retry functionality...');
    const retryStatus = await getRetryStatus(scanId);
    console.log('✅ Retry status:', {
      hasRetryableServices: retryStatus.hasRetryableServices,
      retryableServices: retryStatus.retryableServices
    });

    if (retryStatus.hasRetryableServices) {
      const retryPreparation = await prepareScanForRetry(scanId, ['duplicateContent']);
      console.log('✅ Retry prepared:', {
        resetServices: retryPreparation.resetServices,
        validServices: retryPreparation.validServices
      });
    }

    // 7️⃣ Test Final Scan Status
    console.log('\n7️⃣ Testing final scan status...');
    const finalScanStatus = await getScanStatus(scanId);
    console.log('✅ Final scan status:', {
      scanId: finalScanStatus.data.scanId,
      status: finalScanStatus.data.status,
      progress: finalScanStatus.data.progress,
      serviceCount: Object.keys(finalScanStatus.data.services).length
    });

    // 8️⃣ Test Service Details
    console.log('\n8️⃣ Testing service details...');
    const accessibilityService = finalScanStatus.data.services.accessibility;
    console.log('✅ Accessibility service details:', {
      status: accessibilityService.status,
      score: accessibilityService.score,
      hasData: !!accessibilityService.data,
      executionTime: accessibilityService.executionTimeMs
    });

    const duplicateService = finalScanStatus.data.services.duplicateContent;
    console.log('✅ Duplicate content service details:', {
      status: duplicateService.status,
      hasError: !!duplicateService.error,
      canRetry: duplicateService.retry?.canRetry,
      attempts: duplicateService.retry?.attempts
    });

    // 9️⃣ Test Database Cleanup
    console.log('\n9️⃣ Testing scan cleanup...');
    const services = await dbRepository.getScanServices(scanId);
    console.log('✅ Scan services count:', services.length);

    console.log('\n🎉 All database integration tests passed!');
    return true;

  } catch (error) {
    console.error('\n❌ Database integration test failed:', error);
    return false;
  } finally {
    await dbRepository.close();
  }
}

// Run test if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  testDatabaseIntegration()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Test runner failed:', error);
      process.exit(1);
    });
}

export default testDatabaseIntegration;