const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const { CLS, FID, LCP } = require('web-vitals');

/**
 * Run Lighthouse audit
 */
async function runLighthouse(url, options = {}) {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless']
  });

  try {
    const results = await lighthouse(url, {
      port: chrome.port,
      output: 'json',
      logLevel: 'info',
      ...options
    });

    return {
      performance: results.lhr.categories.performance.score * 100,
      metrics: {
        fcp: results.lhr.audits['first-contentful-paint'].numericValue,
        si: results.lhr.audits['speed-index'].numericValue,
        lcp: results.lhr.audits['largest-contentful-paint'].numericValue,
        tti: results.lhr.audits['interactive'].numericValue,
        tbt: results.lhr.audits['total-blocking-time'].numericValue,
        cls: results.lhr.audits['cumulative-layout-shift'].numericValue
      },
      diagnostics: results.lhr.audits.diagnostics.details.items[0],
      opportunities: Object.values(results.lhr.audits)
        .filter(audit => audit.details && audit.details.type === 'opportunity')
        .map(audit => ({
          title: audit.title,
          description: audit.description,
          score: audit.score,
          numericValue: audit.numericValue
        }))
    };
  } finally {
    await chrome.kill();
  }
}

/**
 * Collect Web Vitals metrics
 */
function collectWebVitals(url) {
  return new Promise((resolve) => {
    const metrics = {};
    let metricsCollected = 0;

    const onMetric = ({ name, value }) => {
      metrics[name] = value;
      metricsCollected++;

      if (metricsCollected === 3) {
        resolve(metrics);
      }
    };

    CLS(onMetric);
    FID(onMetric);
    LCP(onMetric);
  });
}

/**
 * Get performance score
 */
function calculatePerformanceScore(metrics) {
  const weights = {
    lcp: 0.25,
    fid: 0.25,
    cls: 0.25,
    ttfb: 0.15,
    fcp: 0.10
  };

  let score = 0;

  // LCP scoring (Largest Contentful Paint)
  if (metrics.lcp <= 2500) score += weights.lcp;
  else if (metrics.lcp <= 4000) score += weights.lcp * 0.5;

  // FID scoring (First Input Delay)
  if (metrics.fid <= 100) score += weights.fid;
  else if (metrics.fid <= 300) score += weights.fid * 0.5;

  // CLS scoring (Cumulative Layout Shift)
  if (metrics.cls <= 0.1) score += weights.cls;
  else if (metrics.cls <= 0.25) score += weights.cls * 0.5;

  // TTFB scoring (Time to First Byte)
  if (metrics.ttfb <= 600) score += weights.ttfb;
  else if (metrics.ttfb <= 1000) score += weights.ttfb * 0.5;

  // FCP scoring (First Contentful Paint)
  if (metrics.fcp <= 1800) score += weights.fcp;
  else if (metrics.fcp <= 3000) score += weights.fcp * 0.5;

  return Math.round(score * 100);
}

/**
 * Get performance suggestions based on metrics
 */
function getPerformanceSuggestions(metrics) {
  const suggestions = [];

  if (metrics.lcp > 2500) {
    suggestions.push({
      metric: 'LCP',
      title: 'Improve Largest Contentful Paint',
      description: 'Consider optimizing images, reducing server response time, or implementing lazy loading.'
    });
  }

  if (metrics.fid > 100) {
    suggestions.push({
      metric: 'FID',
      title: 'Improve First Input Delay',
      description: 'Minimize main thread work, reduce JavaScript execution time, and break up long tasks.'
    });
  }

  if (metrics.cls > 0.1) {
    suggestions.push({
      metric: 'CLS',
      title: 'Improve Cumulative Layout Shift',
      description: 'Set explicit dimensions for images and videos, avoid inserting content above existing content.'
    });
  }

  if (metrics.ttfb > 600) {
    suggestions.push({
      metric: 'TTFB',
      title: 'Improve Time to First Byte',
      description: 'Optimize server response time, implement caching, or consider using a CDN.'
    });
  }

  return suggestions;
}

module.exports = {
  runLighthouse,
  collectWebVitals,
  calculatePerformanceScore,
  getPerformanceSuggestions
};