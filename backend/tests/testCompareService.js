import assert from 'assert';
import { compareUrls } from '../services/compareService.js';

(async () => {
  try {
    const data = await compareUrls(['https://example.com','https://www.iana.org/domains/reserved']);
    assert.ok(Array.isArray(data.analyzed), 'analyzed should be array');
    assert.ok(data.analyzed.length === 2, 'should analyze 2 urls');
    assert.ok(data.comparison.diffs.length === 2, 'diffs length matches');
    console.log('Compare service basic test: PASS');
  } catch (e) {
    console.error('Compare service basic test: FAIL', e);
    process.exitCode = 1;
  }
})();
