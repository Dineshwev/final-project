import assert from 'assert';
import { analyzeContentQuality } from '../services/contentAnalysisService.js';

(async () => {
  const url = 'https://example.com';
  try {
    const result = await analyzeContentQuality(url);
    assert.ok(result.readability.wordCount > 0, 'Should count words');
    assert.ok(result.keywordDensity.topKeywords.length <= 15, 'Top keywords capped at 15');
    assert.ok(result.readability.fleschReadingEase <= 206.84 && result.readability.fleschReadingEase >= -50, 'Reading ease within plausible bounds');
    console.log('Content analysis basic test: PASS');
  } catch (e) {
    console.error('Content analysis basic test: FAIL', e);
    process.exitCode = 1;
  }
})();
