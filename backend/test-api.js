// Quick API test script to verify Express server is working correctly
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3002';

async function testAPI() {
  console.log('🧪 Testing Express API endpoints...\n');

  // Test health endpoint
  try {
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health endpoint:', healthData);
  } catch (error) {
    console.log('❌ Health endpoint failed:', error.message);
  }

  // Test API status
  try {
    const statusResponse = await fetch(`${BASE_URL}/api/status`);
    const statusData = await statusResponse.json();
    console.log('✅ API status:', statusData);
  } catch (error) {
    console.log('❌ API status failed:', error.message);
  }

  // Test scan results endpoint
  try {
    const scanResponse = await fetch(`${BASE_URL}/api/scan/test-scan-123/results`);
    const scanData = await scanResponse.json();
    console.log('✅ Scan results:', { 
      url: scanData.url, 
      issuesCount: scanData.seoIssues?.length,
      score: scanData.overallScore 
    });
  } catch (error) {
    console.log('❌ Scan results failed:', error.message);
  }

  console.log('\n🎯 All API tests completed!');
}

testAPI();