/**
 * 🧪 RETRY SYSTEM TEST
 * 
 * Tests the per-service retry functionality:
 * 1. Start scan and let some services fail
 * 2. Test retry eligibility checks
 * 3. Retry specific services
 * 4. Verify retry limits and safety
 */

const API_BASE = 'http://localhost:8080/api';

/**
 * 🔍 Test Complete Retry Workflow
 */
const testRetryWorkflow = async () => {
  console.log('🧪 Testing Complete Retry Workflow...\n');
  
  try {
    // 1. Start a new scan
    console.log('📨 Starting new scan...');
    const startResponse = await fetch(`${API_BASE}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://example.com',
        keywords: ['test', 'retry']
      })
    });
    
    const startData = await startResponse.json();
    console.log('✅ Scan started:', JSON.stringify(startData, null, 2));
    
    if (!startData.success || !startData.scanId) {
      throw new Error('Failed to start scan');
    }
    
    const scanId = startData.scanId;
    console.log(`🆔 Scan ID: ${scanId}\n`);
    
    // 2. Wait for scan to complete
    console.log('⏱️ Waiting for scan to complete...');
    let scanCompleted = false;
    let pollCount = 0;
    
    while (!scanCompleted && pollCount < 30) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      pollCount++;
      
      const statusResponse = await fetch(`${API_BASE}/scan/${scanId}`);
      const statusData = await statusResponse.json();
      
      if (statusData.success && statusData.data) {
        const status = statusData.data.status;
        const progress = statusData.data.progress;
        
        console.log(`   Poll ${pollCount}: ${status} (${progress.percentage}%)`);
        
        if (['completed', 'partial', 'failed'].includes(status)) {
          scanCompleted = true;
          console.log(`\\n✅ Scan completed with status: ${status}`);
          
          // Show service results
          if (statusData.data.services) {
            console.log('📋 Service Results:');
            Object.entries(statusData.data.services).forEach(([name, service]) => {
              const icon = service.status === 'success' ? '✅' : '❌';
              console.log(`   ${icon} ${name}: ${service.status}${service.score ? ` (${service.score})` : ''}`);
            });
          }
        }
      }
    }
    
    // 3. Check retry status
    console.log('\\n🔍 Checking retry status...');
    const retryStatusResponse = await fetch(`${API_BASE}/scan/${scanId}/retry/status`);
    const retryStatusData = await retryStatusResponse.json();
    
    if (retryStatusData.success) {
      console.log('📊 Retry Status:', JSON.stringify(retryStatusData.data, null, 2));
      
      const { retryableServices, failedServices } = retryStatusData.data;
      
      if (retryableServices.length > 0) {
        // 4. Test retry of specific services
        console.log(`\\n🔄 Retrying specific services: ${retryableServices.slice(0, 2).join(', ')}`);
        
        const retryResponse = await fetch(`${API_BASE}/scan/${scanId}/retry`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            services: retryableServices.slice(0, 2) // Retry first 2 retryable services
          })
        });
        
        const retryData = await retryResponse.json();
        console.log('🔄 Retry response:', JSON.stringify(retryData, null, 2));
        
        if (retryData.success) {
          // 5. Monitor retry progress
          console.log('\\n📊 Monitoring retry progress...');
          let retryCompleted = false;
          let retryPollCount = 0;
          
          while (!retryCompleted && retryPollCount < 20) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            retryPollCount++;
            
            const retryStatusResponse = await fetch(`${API_BASE}/scan/${scanId}`);
            const retryStatusData = await retryStatusResponse.json();
            
            if (retryStatusData.success && retryStatusData.data) {
              const status = retryStatusData.data.status;
              const progress = retryStatusData.data.progress;
              
              console.log(`   Retry Poll ${retryPollCount}: ${status} (${progress.percentage}%)`);
              
              if (['completed', 'partial', 'failed'].includes(status)) {
                retryCompleted = true;
                console.log(`\\n✅ Retry completed with status: ${status}`);
                
                // Show updated service results
                if (retryStatusData.data.services) {
                  console.log('📋 Updated Service Results:');
                  Object.entries(retryStatusData.data.services).forEach(([name, service]) => {
                    const icon = service.status === 'success' ? '✅' : '❌';
                    const retryInfo = service.retry ? ` (attempts: ${service.retry?.attempts || 'N/A'})` : '';
                    console.log(`   ${icon} ${name}: ${service.status}${retryInfo}`);
                  });
                }
              }
            }
          }
        }
        
        // 6. Test retry all failed services
        console.log('\\n🔄 Testing retry all failed services...');
        const retryAllResponse = await fetch(`${API_BASE}/scan/${scanId}/retry`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}) // Empty body = retry all failed
        });
        
        const retryAllData = await retryAllResponse.json();
        console.log('🔄 Retry all response:', JSON.stringify(retryAllData, null, 2));
        
      } else {
        console.log('ℹ️ No services are retryable');
        
        // Test retry when no services are retryable
        const noRetryResponse = await fetch(`${API_BASE}/scan/${scanId}/retry`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        const noRetryData = await noRetryResponse.json();
        console.log('🔄 No retry response:', JSON.stringify(noRetryData, null, 2));
      }
    } else {
      console.log('❌ Failed to get retry status:', retryStatusData.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
};

/**
 * 🛡️ Test Error Scenarios
 */
const testErrorScenarios = async () => {
  console.log('\\n🧪 Testing Error Scenarios...');
  
  try {
    // Test invalid scan ID
    console.log('📨 Testing invalid scan ID...');
    const invalidResponse = await fetch(`${API_BASE}/scan/invalid-scan-id/retry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const invalidData = await invalidResponse.json();
    if (!invalidData.success) {
      console.log('✅ Invalid scan ID correctly rejected');
    } else {
      console.log('⚠️ Invalid scan ID should have been rejected');
    }
    
    // Test invalid service names
    console.log('📨 Testing invalid service names...');
    const invalidServicesResponse = await fetch(`${API_BASE}/scan/test/retry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        services: ['invalidService', 'anotherInvalid']
      })
    });
    
    const invalidServicesData = await invalidServicesResponse.json();
    if (!invalidServicesData.success) {
      console.log('✅ Invalid service names correctly rejected');
    } else {
      console.log('⚠️ Invalid service names should have been rejected');
    }
    
    console.log('✅ Error scenario tests completed!');
    
  } catch (error) {
    console.error('❌ Error scenario test failed:', error.message);
  }
};

/**
 * 🚀 Run All Retry Tests
 */
const runRetryTests = async () => {
  console.log('🧪 Starting Retry System Tests...');
  console.log('=' .repeat(50));
  
  await testRetryWorkflow();
  await testErrorScenarios();
  
  console.log('\\n' + '='.repeat(50));
  console.log('🏁 All retry tests completed!');
};

// Run tests
runRetryTests();