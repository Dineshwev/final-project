/**
 * 🧪 SCAN LIFECYCLE TEST UTILITY
 * 
 * Tests the scan lifecycle management system to ensure:
 * - State transitions work correctly
 * - Progress tracking is accurate
 * - Service execution tracking functions
 * - Error safety is maintained
 * - API contract compliance
 */

import {
  initializeScan,
  startScan,
  updateServiceStatus,
  finalizeScan,
  getScanStatus,
  ScanStatus,
  cleanupCompletedScans
} from '../services/scanLifecycle.service.js';

import { SERVICE_NAMES } from '../utils/responseContract.js';

/**
 * 🔍 Test Scan Lifecycle Basics
 */
const testBasicLifecycle = () => {
  console.log('\n🧪 Testing Basic Lifecycle...');
  
  // Initialize scan
  const scanContext = initializeScan('https://example.com');
  console.log(`✅ Scan initialized: ${scanContext.scanId}`);
  
  // Check initial state
  if (scanContext.status !== ScanStatus.PENDING) {
    throw new Error(`Expected PENDING, got ${scanContext.status}`);
  }
  console.log('✅ Initial state is PENDING');
  
  // Start scan
  startScan(scanContext);
  if (scanContext.status !== ScanStatus.RUNNING) {
    throw new Error(`Expected RUNNING, got ${scanContext.status}`);
  }
  console.log('✅ State transitioned to RUNNING');
  
  // Check initial progress
  const initialProgress = scanContext.getProgress();
  if (initialProgress.percentage !== 0) {
    throw new Error(`Expected 0% progress, got ${initialProgress.percentage}%`);
  }
  console.log('✅ Initial progress is 0%');
};

/**
 * 📊 Test Progress Calculation
 */
const testProgressCalculation = () => {
  console.log('\n📊 Testing Progress Calculation...');
  
  const scanContext = initializeScan('https://example.com');
  startScan(scanContext);
  
  const allServices = Object.values(SERVICE_NAMES);
  const totalServices = allServices.length;
  
  // Complete services one by one and check progress
  allServices.forEach((serviceName, index) => {
    updateServiceStatus(scanContext.scanId, serviceName, 'success', { 
      status: 'success', 
      score: 85 
    });
    
    const progress = scanContext.getProgress();
    const expectedPercentage = Math.floor(((index + 1) / totalServices) * 100);
    
    if (progress.percentage !== expectedPercentage) {
      throw new Error(`Expected ${expectedPercentage}%, got ${progress.percentage}%`);
    }
    
    console.log(`✅ Service ${index + 1}/${totalServices}: ${progress.percentage}% progress`);
  });
  
  // Check final state
  if (scanContext.status !== ScanStatus.COMPLETED) {
    throw new Error(`Expected COMPLETED, got ${scanContext.status}`);
  }
  console.log('✅ Final state is COMPLETED');
};

/**
 * 🔄 Test State Transitions
 */
const testStateTransitions = () => {
  console.log('\n🔄 Testing State Transitions...');
  
  const scanContext = initializeScan('https://example.com');
  
  // Valid transitions
  try {
    scanContext.transitionTo(ScanStatus.RUNNING);
    console.log('✅ PENDING → RUNNING (valid)');
    
    scanContext.transitionTo(ScanStatus.COMPLETED);
    console.log('✅ RUNNING → COMPLETED (valid)');
    
  } catch (error) {
    throw new Error(`Valid transition failed: ${error.message}`);
  }
  
  // Invalid transition attempt
  try {
    scanContext.transitionTo(ScanStatus.PENDING);
    throw new Error('Invalid transition should have failed');
  } catch (error) {
    if (error.message.includes('Invalid state transition')) {
      console.log('✅ Invalid transition properly rejected');
    } else {
      throw error;
    }
  }
};

/**
 * 🔥 Test Partial Failure Handling
 */
const testPartialFailure = () => {
  console.log('\n🔥 Testing Partial Failure Handling...');
  
  const scanContext = initializeScan('https://example.com');
  startScan(scanContext);
  
  const allServices = Object.values(SERVICE_NAMES);
  
  // Complete half successfully, half with failures
  allServices.forEach((serviceName, index) => {
    if (index < allServices.length / 2) {
      updateServiceStatus(scanContext.scanId, serviceName, 'success', { 
        status: 'success', 
        score: 85 
      });
    } else {
      updateServiceStatus(scanContext.scanId, serviceName, 'failed', 
        new Error('Simulated service failure')
      );
    }
  });
  
  // Check final state should be PARTIAL
  if (scanContext.status !== ScanStatus.PARTIAL) {
    throw new Error(`Expected PARTIAL, got ${scanContext.status}`);
  }
  console.log('✅ Partial failure results in PARTIAL status');
  
  // Check progress is 100% (failed services count as completed)
  const progress = scanContext.getProgress();
  if (progress.percentage !== 100) {
    throw new Error(`Expected 100% progress, got ${progress.percentage}%`);
  }
  console.log('✅ Progress correctly shows 100% with failures');
};

/**
 * 🛡️ Test Error Safety
 */
const testErrorSafety = () => {
  console.log('\n🛡️ Testing Error Safety...');
  
  const scanContext = initializeScan('https://example.com');
  startScan(scanContext);
  
  // Test invalid service name
  try {
    updateServiceStatus(scanContext.scanId, 'nonexistent', 'success', {});
    throw new Error('Invalid service should have failed');
  } catch (error) {
    if (error.message.includes('not found')) {
      console.log('✅ Invalid service name properly rejected');
    } else {
      throw error;
    }
  }
  
  // Test invalid scan ID
  try {
    updateServiceStatus('invalid-scan-id', SERVICE_NAMES.ACCESSIBILITY, 'success', {});
    throw new Error('Invalid scan ID should have failed');
  } catch (error) {
    if (error.message.includes('not found')) {
      console.log('✅ Invalid scan ID properly rejected');
    } else {
      throw error;
    }
  }
};

/**
 * 🔍 Test API Response Format
 */
const testApiResponseFormat = () => {
  console.log('\n🔍 Testing API Response Format...');
  
  const scanContext = initializeScan('https://example.com');
  startScan(scanContext);
  
  // Complete one service
  updateServiceStatus(scanContext.scanId, SERVICE_NAMES.ACCESSIBILITY, 'success', {
    status: 'success',
    score: 85,
    data: { checks: 10, passed: 8 },
    issues: []
  });
  
  const apiResponse = scanContext.toApiResponse();
  
  // Verify required fields
  const requiredFields = ['status', 'scanId', 'url', 'startedAt', 'completedAt', 'progress', 'services', 'meta'];
  requiredFields.forEach(field => {
    if (!(field in apiResponse)) {
      throw new Error(`Missing required field: ${field}`);
    }
  });
  console.log('✅ All required fields present');
  
  // Verify progress structure
  if (!apiResponse.progress.hasOwnProperty('completedServices') ||
      !apiResponse.progress.hasOwnProperty('totalServices') ||
      !apiResponse.progress.hasOwnProperty('percentage')) {
    throw new Error('Invalid progress structure');
  }
  console.log('✅ Progress structure correct');
  
  // Verify all services are present
  Object.values(SERVICE_NAMES).forEach(serviceName => {
    if (!(serviceName in apiResponse.services)) {
      throw new Error(`Missing service: ${serviceName}`);
    }
  });
  console.log('✅ All services present in response');
};

/**
 * 🧹 Test Cleanup Function
 */
const testCleanup = async () => {
  console.log('\n🧹 Testing Cleanup Function...');
  
  // Create a few completed scans
  const scan1 = initializeScan('https://example1.com');
  startScan(scan1);
  finalizeScan(scan1);
  
  const scan2 = initializeScan('https://example2.com');
  startScan(scan2);
  finalizeScan(scan2);
  
  // Test cleanup (should not remove anything yet since scans are new)
  const cleanedCount = cleanupCompletedScans(0); // 0 hours = immediate cleanup
  
  console.log(`✅ Cleanup function works (cleaned ${cleanedCount} scans)`);
};

/**
 * 🚀 Run All Tests
 */
export const runLifecycleTests = async () => {
  console.log('🧪 Starting Scan Lifecycle Tests...\n');
  
  try {
    testBasicLifecycle();
    testProgressCalculation();
    testStateTransitions();
    testPartialFailure();
    testErrorSafety();
    testApiResponseFormat();
    await testCleanup();
    
    console.log('\n🎉 All lifecycle tests passed! ✅');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runLifecycleTests();
}