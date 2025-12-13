/**
 * 🧪 POLLING INTEGRATION TEST
 * 
 * Tests the complete polling workflow:
 * 1. Start async scan
 * 2. Poll for status updates
 * 3. Verify progress tracking
 * 4. Get final results
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:8080/api';

/**
 * 🔍 Test Async Scan and Polling Workflow
 */
const testPollingWorkflow = async () => {
  console.log('🧪 Testing Async Scan and Polling Workflow...\n');
  
  try {
    // 1. Start a new scan
    console.log('📨 Starting new scan...');
    const startResponse = await fetch(`${API_BASE}/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://example.com',
        keywords: ['test', 'seo']
      })
    });
    
    const startData = await startResponse.json();
    console.log('✅ Start response:', JSON.stringify(startData, null, 2));
    
    if (!startData.success || !startData.scanId) {
      throw new Error('Failed to start scan');
    }
    
    const scanId = startData.scanId;
    console.log(`🆔 Scan ID: ${scanId}`);
    console.log(`📊 Initial Status: ${startData.status}\n`);
    
    // 2. Poll for status updates
    console.log('🔄 Starting polling...');
    let pollCount = 0;
    const maxPolls = 20;
    let currentStatus = startData.status;
    
    while (pollCount < maxPolls) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      pollCount++;
      
      console.log(`📡 Poll #${pollCount}: Checking status...`);
      
      const statusResponse = await fetch(`${API_BASE}/scan/${scanId}`);
      const statusData = await statusResponse.json();
      
      if (statusData.success && statusData.data) {
        const scanData = statusData.data;
        currentStatus = scanData.status;
        const progress = scanData.progress;
        
        console.log(`   Status: ${currentStatus}`);
        console.log(`   Progress: ${progress.completedServices}/${progress.totalServices} (${progress.percentage}%)`);
        
        // Check if scan is complete
        if (['completed', 'partial', 'failed'].includes(currentStatus)) {
          console.log(`\\n🏁 Scan completed with status: ${currentStatus}`);
          
          // Show final results summary
          if (scanData.services) {
            const serviceStatuses = Object.entries(scanData.services).map(([name, service]) => ({
              name,
              status: service.status,
              score: service.score
            }));
            
            console.log('📋 Final Service Results:');
            serviceStatuses.forEach(({ name, status, score }) => {
              const icon = status === 'success' ? '✅' : status === 'failed' ? '❌' : '⏸️';
              console.log(`   ${icon} ${name}: ${status} ${score !== null ? `(Score: ${score})` : ''}`);
            });
          }
          
          break;
        }
        
        console.log(''); // Empty line for readability
      } else {
        console.log('❌ Failed to get status:', statusData.error || 'Unknown error');
        break;
      }
    }
    
    if (pollCount >= maxPolls) {
      console.log('⏰ Polling timeout - scan is taking too long');
    }
    
    // 3. Test the legacy results endpoint for compatibility
    console.log('\\n🔄 Testing legacy results endpoint...');
    const resultsResponse = await fetch(`${API_BASE}/scan/${scanId}/results`);
    const resultsData = await resultsResponse.json();
    
    if (resultsData.success) {
      console.log('✅ Legacy endpoint works - results available');
    } else {
      console.log('⚠️ Legacy endpoint response:', resultsData.error);
    }
    
    // 4. Test progress endpoint
    console.log('\\n📊 Testing progress endpoint...');
    const progressResponse = await fetch(`${API_BASE}/scan/${scanId}/progress`);
    const progressData = await progressResponse.json();
    
    if (progressData.success) {
      console.log('✅ Progress endpoint works:', JSON.stringify(progressData.data, null, 2));
    } else {
      console.log('⚠️ Progress endpoint response:', progressData.error);
    }
    
    console.log('\\n🎉 Polling workflow test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
};

/**
 * 🔍 Test Error Handling
 */
const testErrorHandling = async () => {
  console.log('\\n🧪 Testing Error Handling...');
  
  try {
    // Test invalid scan ID
    console.log('📨 Testing invalid scan ID...');
    const invalidResponse = await fetch(`${API_BASE}/scan/invalid-scan-id`);
    const invalidData = await invalidResponse.json();
    
    if (invalidResponse.status === 404 && !invalidData.success) {
      console.log('✅ Invalid scan ID correctly returns 404');
    } else {
      console.log('⚠️ Unexpected response for invalid ID:', invalidData);
    }
    
    // Test malformed scan ID
    console.log('📨 Testing malformed scan ID...');
    const malformedResponse = await fetch(`${API_BASE}/scan/`);
    
    if (malformedResponse.status === 404) {
      console.log('✅ Malformed scan ID correctly returns 404');
    } else {
      console.log('⚠️ Unexpected response for malformed ID');
    }
    
    console.log('✅ Error handling tests completed!');
    
  } catch (error) {
    console.error('❌ Error handling test failed:', error.message);
  }
};

/**
 * 🚀 Run All Tests
 */
const runPollingTests = async () => {
  console.log('🧪 Starting Polling Integration Tests...');
  console.log('=' .repeat(50));
  
  await testPollingWorkflow();
  await testErrorHandling();
  
  console.log('\\n' + '='.repeat(50));
  console.log('🏁 All polling tests completed!');
};

// Run tests
runPollingTests();