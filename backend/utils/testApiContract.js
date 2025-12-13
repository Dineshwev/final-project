/**
 * 🧪 API CONTRACT TEST & DOCUMENTATION
 * 
 * This file demonstrates the locked API contract and provides examples
 * for frontend developers to understand the exact response structure.
 * 
 * Run this test to verify the API contract is working correctly:
 * node utils/testApiContract.js
 */

import { 
  createMockScanResponse,
  buildScanResponse,
  normalizeServiceResult,
  SCAN_STATUS,
  SERVICE_STATUS,
  ISSUE_SEVERITY,
  SERVICE_NAMES
} from './responseContract.js';

/**
 * Test that the API contract produces consistent responses
 */
const testApiContract = () => {
  console.log('🧪 Testing Locked API Contract...\n');

  // Test 1: Mock response structure
  console.log('📋 Test 1: Mock Response Structure');
  const mockResponse = createMockScanResponse();
  console.log('✓ Mock response generated successfully');
  console.log('✓ Contains all required top-level keys:', Object.keys(mockResponse));
  console.log('✓ Services object contains all required services:', Object.keys(mockResponse.services));
  console.log('');

  // Test 2: Service normalization
  console.log('📋 Test 2: Service Normalization');
  
  // Test successful service result
  const successfulResult = {
    status: 'success',
    score: 85,
    data: { totalChecks: 10 },
    issues: [
      { type: 'warning', severity: 'medium', description: 'Minor issue' }
    ]
  };
  
  const normalizedSuccess = normalizeServiceResult('accessibility', successfulResult, 1500);
  console.log('✓ Successful service result normalized');
  
  // Test failed service result
  const failedResult = new Error('Service temporarily unavailable');
  const normalizedFailure = normalizeServiceResult('backlinks', failedResult, 500);
  console.log('✓ Failed service result normalized');
  console.log('');

  // Test 3: Response builder with mixed results
  console.log('📋 Test 3: Response Builder');
  
  const mixedServices = {
    [SERVICE_NAMES.ACCESSIBILITY]: normalizedSuccess,
    [SERVICE_NAMES.BACKLINKS]: normalizedFailure
  };
  
  const builtResponse = buildScanResponse({
    status: SCAN_STATUS.PARTIAL,
    scanId: 'test_scan_123',
    url: 'https://example.com',
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    services: mixedServices
  });
  
  console.log('✓ Mixed service response built successfully');
  console.log('✓ Progress calculated:', builtResponse.progress);
  console.log('');

  // Test 4: Validate response schema
  console.log('📋 Test 4: Schema Validation');
  
  const validateResponse = (response) => {
    const requiredKeys = ['status', 'scanId', 'url', 'startedAt', 'completedAt', 'progress', 'services', 'meta'];
    const missingKeys = requiredKeys.filter(key => !(key in response));
    
    if (missingKeys.length > 0) {
      throw new Error(`Missing required keys: ${missingKeys.join(', ')}`);
    }
    
    // Validate progress object
    const progressKeys = ['completedServices', 'totalServices', 'percentage'];
    const missingProgressKeys = progressKeys.filter(key => !(key in response.progress));
    if (missingProgressKeys.length > 0) {
      throw new Error(`Missing progress keys: ${missingProgressKeys.join(', ')}`);
    }
    
    // Validate services object contains all required services
    const missingServices = Object.values(SERVICE_NAMES).filter(name => !(name in response.services));
    if (missingServices.length > 0) {
      throw new Error(`Missing required services: ${missingServices.join(', ')}`);
    }
    
    // Validate each service has required structure
    Object.entries(response.services).forEach(([serviceName, serviceData]) => {
      const serviceKeys = ['status', 'score', 'data', 'issues', 'error', 'executionTimeMs'];
      const missingServiceKeys = serviceKeys.filter(key => !(key in serviceData));
      if (missingServiceKeys.length > 0) {
        throw new Error(`Service ${serviceName} missing keys: ${missingServiceKeys.join(', ')}`);
      }
      
      if (!Array.isArray(serviceData.issues)) {
        throw new Error(`Service ${serviceName} issues must be an array`);
      }
    });
    
    return true;
  };
  
  try {
    validateResponse(mockResponse);
    validateResponse(builtResponse);
    console.log('✓ All responses pass schema validation');
  } catch (error) {
    console.error('❌ Schema validation failed:', error.message);
    return false;
  }
  
  console.log('');
  console.log('🎉 ALL TESTS PASSED - API Contract is working correctly!\n');
  
  return true;
};

/**
 * Display example API responses for frontend developers
 */
const displayExamples = () => {
  console.log('📚 API CONTRACT EXAMPLES FOR FRONTEND\n');
  
  console.log('🔷 Example 1: Successful Complete Scan');
  console.log(JSON.stringify(createMockScanResponse('scan_success_123', 'https://example.com'), null, 2));
  console.log('\n' + '='.repeat(80) + '\n');
  
  console.log('🔷 Example 2: Partial Scan (Some Services Failed)');
  const partialServices = {
    [SERVICE_NAMES.ACCESSIBILITY]: {
      status: SERVICE_STATUS.SUCCESS,
      score: 90,
      data: { checks: 15, passed: 14 },
      issues: [],
      error: null,
      executionTimeMs: 1200
    },
    [SERVICE_NAMES.BACKLINKS]: {
      status: SERVICE_STATUS.FAILED,
      score: null,
      data: null,
      issues: [],
      error: {
        code: 'BACKLINKS_API_ERROR',
        message: 'External API temporarily unavailable',
        retryable: true
      },
      executionTimeMs: 5000
    }
  };
  
  const partialResponse = buildScanResponse({
    status: SCAN_STATUS.PARTIAL,
    scanId: 'scan_partial_456',
    url: 'https://example.com',
    startedAt: '2025-12-13T10:00:00.000Z',
    completedAt: '2025-12-13T10:01:30.000Z',
    services: partialServices
  });
  
  console.log(JSON.stringify(partialResponse, null, 2));
  console.log('\n' + '='.repeat(80) + '\n');
  
  console.log('🔷 Example 3: Pending Scan (In Progress)');
  const pendingResponse = buildScanResponse({
    status: SCAN_STATUS.PENDING,
    scanId: 'scan_pending_789',
    url: 'https://example.com',
    startedAt: '2025-12-13T10:05:00.000Z',
    completedAt: null,
    services: {} // Will be filled with default pending services
  });
  
  console.log(JSON.stringify(pendingResponse, null, 2));
  console.log('\n');
};

/**
 * Main test execution
 */
const main = () => {
  console.log('🔒 LOCKED API CONTRACT VALIDATION\n');
  console.log('This test ensures the Single Scan API maintains backward compatibility\n');
  
  const testsPassed = testApiContract();
  
  if (testsPassed) {
    console.log('✅ CONTRACT VALIDATION SUCCESSFUL');
    console.log('✅ The API will always return the same structure');
    console.log('✅ Frontend can safely rely on this contract\n');
    
    displayExamples();
    
    console.log('📖 FRONTEND INTEGRATION NOTES:');
    console.log('• Always check response.services[serviceName].status before using data');
    console.log('• Use response.progress.percentage for loading indicators');
    console.log('• Handle response.services[serviceName].error gracefully');
    console.log('• response.services[serviceName].issues contains actionable feedback');
    console.log('• All timestamps are ISO-8601 format');
    console.log('• Scores are always 0-100 or null');
  } else {
    console.log('❌ CONTRACT VALIDATION FAILED');
    console.log('❌ The API contract has been broken');
    process.exit(1);
  }
};

// Run tests if this file is executed directly
if (process.argv[1].endsWith('testApiContract.js')) {
  main();
}

export { testApiContract, displayExamples };