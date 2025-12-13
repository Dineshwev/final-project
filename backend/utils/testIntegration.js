/**
 * 🧪 INTEGRATION TEST FOR SCAN LIFECYCLE ENDPOINTS
 * 
 * Tests the complete scan lifecycle through HTTP endpoints:
 * - Starting a scan
 * - Polling scan status
 * - Getting progress updates
 * - Retrieving final results
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

/**
 * 🚀 Test Starting a Scan
 */
const testStartScan = async () => {
  console.log('\n🚀 Testing scan start...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/scan`, {
      url: 'https://github.com'
    });
    
    if (!response.data.success) {
      throw new Error('Scan start failed');
    }
    
    const { scanId, status, url } = response.data;
    console.log(`✅ Scan started: ${scanId}`);
    console.log(`📍 URL: ${url}`);
    console.log(`📊 Status: ${status}`);
    
    return scanId;
    
  } catch (error) {
    console.error('❌ Scan start failed:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 🔍 Test Getting Scan Status
 */
const testGetScanStatus = async (scanId) => {
  console.log(`\n🔍 Testing scan status for ${scanId}...`);
  
  try {
    const response = await axios.get(`${BASE_URL}/api/scan/${scanId}`);
    
    if (!response.data.success) {
      throw new Error('Failed to get scan status');
    }
    
    const scanData = response.data.data;
    console.log(`📊 Status: ${scanData.status}`);
    console.log(`📈 Progress: ${scanData.progress.percentage}% (${scanData.progress.completedServices}/${scanData.progress.totalServices})`);
    
    return scanData;
    
  } catch (error) {
    console.error('❌ Get scan status failed:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 📊 Test Getting Scan Progress
 */
const testGetScanProgress = async (scanId) => {
  console.log(`\n📊 Testing scan progress for ${scanId}...`);
  
  try {
    const response = await axios.get(`${BASE_URL}/api/scan/${scanId}/progress`);
    
    if (!response.data.success) {
      throw new Error('Failed to get scan progress');
    }
    
    const progressData = response.data.data;
    console.log(`📈 Progress: ${progressData.progress.percentage}%`);
    console.log(`📊 Status: ${progressData.status}`);
    
    return progressData;
    
  } catch (error) {
    console.error('❌ Get scan progress failed:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 📋 Test Getting Full Results
 */
const testGetScanResults = async (scanId) => {
  console.log(`\n📋 Testing scan results for ${scanId}...`);
  
  try {
    const response = await axios.get(`${BASE_URL}/api/scan/${scanId}/results`);
    
    if (!response.data.success) {
      throw new Error('Failed to get scan results');
    }
    
    const scanData = response.data.data;
    console.log(`📊 Status: ${scanData.status}`);
    console.log(`📈 Progress: ${scanData.progress.percentage}%`);
    
    // Check services
    const services = Object.keys(scanData.services);
    console.log(`🔧 Services (${services.length}):`, services.join(', '));
    
    // Check successful services
    const successfulServices = Object.entries(scanData.services)
      .filter(([name, service]) => service.status === 'success');
    console.log(`✅ Successful services: ${successfulServices.length}`);
    
    // Check failed services
    const failedServices = Object.entries(scanData.services)
      .filter(([name, service]) => service.status === 'failed');
    if (failedServices.length > 0) {
      console.log(`❌ Failed services: ${failedServices.length}`);
    }
    
    return scanData;
    
  } catch (error) {
    console.error('❌ Get scan results failed:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * ⏱️ Poll Scan Until Complete
 */
const pollScanUntilComplete = async (scanId, maxAttempts = 30) => {
  console.log(`\n⏱️ Polling scan ${scanId} until complete...`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const scanData = await testGetScanStatus(scanId);
      
      console.log(`📊 Attempt ${attempt}: ${scanData.status} (${scanData.progress.percentage}%)`);
      
      // Check if scan is complete
      if (['completed', 'partial', 'failed'].includes(scanData.status)) {
        console.log(`🏁 Scan completed with status: ${scanData.status}`);
        return scanData;
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Poll attempt ${attempt} failed:`, error.message);
    }
  }
  
  throw new Error('Scan did not complete within expected time');
};

/**
 * 🧪 Run Full Integration Test
 */
const runIntegrationTest = async () => {
  console.log('🧪 Starting Scan Lifecycle Integration Test...');
  
  try {
    // Test health check first
    console.log('\n❤️ Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Server is healthy:', healthResponse.data.message);
    
    // Start a scan
    const scanId = await testStartScan();
    
    // Get initial status
    await testGetScanStatus(scanId);
    
    // Get initial progress
    await testGetScanProgress(scanId);
    
    // Poll until complete
    const finalScanData = await pollScanUntilComplete(scanId);
    
    // Get final results
    await testGetScanResults(scanId);
    
    console.log('\n🎉 Integration test completed successfully! ✅');
    
    // Summary
    console.log('\n📊 Final Summary:');
    console.log(`   Scan ID: ${scanId}`);
    console.log(`   Status: ${finalScanData.status}`);
    console.log(`   Progress: ${finalScanData.progress.percentage}%`);
    console.log(`   Services: ${finalScanData.progress.totalServices}`);
    console.log(`   Completed: ${finalScanData.progress.completedServices}`);
    
  } catch (error) {
    console.error('\n❌ Integration test failed:', error.message);
    process.exit(1);
  }
};

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runIntegrationTest();
}

export { runIntegrationTest };