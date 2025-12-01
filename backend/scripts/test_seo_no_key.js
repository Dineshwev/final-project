// Test script: force no API key and call runLighthouseAnalysis
process.env.PAGESPEED_API_KEY = '';
process.env.PAGE_SPEED_INSIGHTS_API_KEY = '';

import seoService from '../services/seoServiceNew.js';

(async () => {
  try {
    const url = 'https://example.com';
    console.log('Calling runLighthouseAnalysis with no API key (should use mock)...');
    const res = await seoService.runLighthouseAnalysis(url, null, { $: null });
    console.log('\n--- Result (truncated) ---');
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error('Test failed:', e);
    process.exit(1);
  }
})();
