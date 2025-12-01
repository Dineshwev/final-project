import test from 'node:test';
import assert from 'node:assert/strict';
import { compareDeviceMetrics } from '../services/seoServiceNew.js';

test('compareDeviceMetrics - basic difference calculation', () => {
  const mobile = { scores: { performance: 70, accessibility: 80, bestPractices: 75, seo: 78 }, audits: {} };
  const desktop = { scores: { performance: 85, accessibility: 82, bestPractices: 78, seo: 79 }, audits: {} };
  const res = compareDeviceMetrics(mobile, desktop);

  // Ensure keys exist
  assert.ok(res.diffs.performance, 'performance diff should exist');
  assert.strictEqual(res.diffs.performance.mobile, 70);
  assert.strictEqual(res.diffs.performance.desktop, 85);

  // Implementation returns delta = mobile - desktop (may be negative). Check absolute difference is 15
  assert.strictEqual(Math.abs(res.diffs.performance.delta), 15, 'absolute difference should be 15');

  // Sign indicates which device is better (negative => desktop better)
  assert.ok(res.diffs.performance.delta < 0, 'desktop should be better (delta < 0)');
});

test('compareDeviceMetrics - handles missing/null values gracefully', () => {
  const mobile = { scores: { performance: null }, audits: null };
  const desktop = { scores: { performance: null }, audits: null };
  const res = compareDeviceMetrics(mobile, desktop);
  // No diffs should be present when scores are null
  assert.deepStrictEqual(res.diffs, {});
  assert.deepStrictEqual(Array.isArray(res.mobileIssues), true);
});

test('compareDeviceMetrics - color classification helper (derived)', () => {
  const mobile = { scores: { performance: 90 }, audits: {} };
  const desktop = { scores: { performance: 70 }, audits: {} };
  const res = compareDeviceMetrics(mobile, desktop);
  const delta = res.diffs.performance.delta;
  // delta = mobile - desktop = 20 -> mobile better
  assert.strictEqual(delta, 20);
  const classification = delta > 0 ? 'mobile-better' : delta < 0 ? 'desktop-better' : 'equal';
  assert.strictEqual(classification, 'mobile-better');
});
