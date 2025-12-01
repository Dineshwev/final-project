/**
 * Test script for security headers analysis
 * Run with: node tests/testSecurityHeaders.js
 */

import { analyzeWebsiteSecurity } from '../services/securityService.js';

// URLs to test
const testUrls = [
  'https://www.google.com',
  'https://www.github.com',
  'http://example.com'
];

async function runTests() {
  console.log('Testing Security Headers Analysis');
  console.log('================================\n');

  for (const url of testUrls) {
    console.log(`Analyzing ${url}...`);
    
    try {
      const result = await analyzeWebsiteSecurity(url);
      
      // Display summary
      console.log(`\nSummary for ${url}:`);
      console.log(`Overall score: ${result.score}`);
      console.log(`Headers present: ${result.summary.present}/${result.summary.total}`);
      console.log(`Missing headers: ${result.summary.missing}`);
      console.log(`HTTPS enabled: ${result.ssl.enabled ? 'Yes' : 'No'}`);
      
      // Display security categories
      console.log('\nSecurity categories:');
      Object.entries(result.categories).forEach(([category, data]) => {
        console.log(`- ${category}: Score ${data.score}`);
      });
      
      // Display recommendations
      console.log('\nRecommendations:');
      if (result.recommendations.length === 0) {
        console.log('- No recommendations (perfect score)');
      } else {
        result.recommendations.forEach((rec, i) => {
          console.log(`${i + 1}. ${rec.message}`);
          if (rec.implementationTip) {
            console.log(`   Implementation: ${rec.implementationTip}`);
          }
        });
      }
      
      console.log('\n---------------------------------\n');
    } catch (error) {
      console.error(`Error analyzing ${url}:`, error);
    }
  }
}

// Run the tests
runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});