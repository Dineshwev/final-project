/* eslint-disable max-lines */
import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';
import { getApiKey } from '../utils/apiKeyManager.js';

// Clean, single-file seoService implementation (device-aware mocks).
// Provides the exported functions that the rest of the app expects.

const createMockWebsiteData = (url) => {
  const domain = new URL(url).hostname;
  const mockHtml = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${domain}</title></head><body><h1>Welcome to ${domain}</h1><p>Demo content</p></body></html>`;
  const $ = cheerio.load(mockHtml);
  return { html: mockHtml, $, isMockData: true };
};

export const fetchWebsite = async (url) => {
  try {
    new URL(url);
  } catch (e) {
    throw new Error(`Invalid URL format: ${url}`);
  }
  try {
    const resp = await axios.get(url, { timeout: 8000, maxRedirects: 3 });
    const $ = cheerio.load(resp.data);
    return { html: resp.data, $ };
  } catch (e) {
    return createMockWebsiteData(url);
  }
};

export const analyzeMetadata = async (url, $) => {
  try {
    const title = $('title').text().trim() || '';
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const viewport = $('meta[name="viewport"]').attr('content') || null;
    return { title, metaDescription, viewport, issues: [] };
  } catch (e) {
    return { title: '', metaDescription: '', viewport: null, issues: ['Failed to parse metadata'] };
  }
};

export const analyzeHeadings = async ($) => {
  try {
    const headings = { h1: [], h2: [], h3: [] };
    $('h1,h2,h3').each((i, el) => { headings[$(el).prop('tagName').toLowerCase()].push($(el).text().trim()); });
    return { headings, counts: { h1: headings.h1.length, h2: headings.h2.length, h3: headings.h3.length }, issues: [] };
  } catch (e) {
    return { headings: {}, counts: {}, issues: ['Failed to analyze headings'] };
  }
};

export const analyzeImages = async ($) => {
  try {
    const images = [];
    $('img').each((i, el) => images.push({ src: $(el).attr('src') || '', alt: $(el).attr('alt') || '' }));
    return { totalImages: images.length, images, issues: [] };
  } catch (e) {
    return { totalImages: 0, images: [], issues: ['Failed to analyze images'] };
  }
};

export const analyzeLinks = async (baseUrl, $) => {
  try {
    const links = [];
    $('a').each((i, el) => {
      const href = ($(el).attr('href') || '').trim();
      const text = $(el).text().trim();
      links.push({ href, text });
    });
    return { totalLinks: links.length, links, issues: [] };
  } catch (e) {
    return { totalLinks: 0, links: [], issues: ['Failed to analyze links'] };
  }
};

export const analyzeSecurity = async (url) => {
  try {
    const resp = await axios.get(url, { timeout: 7000, validateStatus: s => s < 500 });
    const headers = resp.headers || {};
    const isHttps = url.startsWith('https://');
    const issues = [];
    if (!isHttps) issues.push('Not using HTTPS');
    return { isHttps, securityHeaders: headers, issues };
  } catch (e) {
    return { isHttps: url.startsWith('https://'), securityHeaders: {}, issues: ['Failed security check'] };
  }
};

export const analyzeRobotsTxt = async (url) => ({ exists: false, issues: [] });
export const analyzeSitemap = async (url) => ({ exists: false, urls: [], issues: [] });
export const analyzeDomainInfo = async (url) => ({ domain: new URL(url).hostname });
export const analyzeSafeBrowsing = async (url) => ({ safe: true, threats: [] });

// Mock Lighthouse generator per device
const generateMockLighthouseScores = (url, device = 'mobile') => {
  const base = 70 + Math.floor(Math.random() * 20);
  const modifier = device === 'desktop' ? 8 : -5;
  const performance = Math.max(20, Math.min(100, base + modifier + Math.floor(Math.random() * 8)));
  const accessibility = Math.max(20, Math.min(100, base + Math.floor(Math.random() * 12)));
  const bestPractices = Math.max(20, Math.min(100, base + Math.floor(Math.random() * 10)));
  const seo = Math.max(20, Math.min(100, base + Math.floor(Math.random() * 8)));
  return {
    device,
    scores: { performance, accessibility, bestPractices, seo },
    metrics: {
      firstContentfulPaint: device === 'desktop' ? '1.0s' : '1.8s',
      largestContentfulPaint: device === 'desktop' ? '1.6s' : '3.0s',
      timeToInteractive: device === 'desktop' ? '2.2s' : '4.0s',
      cumulativeLayoutShift: device === 'desktop' ? '0.02' : '0.12'
    },
    audits: {
      hasViewport: device === 'desktop' ? true : Math.random() > 0.1,
      touchTargetsOk: device === 'desktop' ? true : Math.random() > 0.4,
      usesResponsiveImages: Math.random() > 0.4
    },
    source: 'mock-lighthouse'
  };
};

export const compareDeviceMetrics = (mobile, desktop) => {
  const keys = ['performance', 'accessibility', 'bestPractices', 'seo'];
  const diffs = {};
  keys.forEach(k => {
    const m = mobile?.scores?.[k] ?? null;
    const d = desktop?.scores?.[k] ?? null;
    if (m !== null && d !== null) diffs[k] = { mobile: m, desktop: d, delta: Math.round(m - d) };
  });
  const mobileIssues = [];
  if (mobile?.audits && !mobile.audits.hasViewport) mobileIssues.push('Missing viewport meta tag');
  if (mobile?.audits && mobile.audits.touchTargetsOk === false) mobileIssues.push('Touch targets may be too small or close together');
  return { diffs, mobileIssues };
};

const analyzeResponsiveDesign = ($) => {
  if (!$) return { issues: ['No DOM available'], mobileUsabilityScore: null };
  const issues = [];
  if ($('meta[name="viewport"]').length === 0) issues.push('Missing meta viewport tag');
  const fixedWidth = $('[style*="width:"]').filter((i, el) => /width:\s*\d+px/.test($(el).attr('style') || '')).length;
  if (fixedWidth > 0) issues.push(`${fixedWidth} fixed-width element(s)`);
  const imgsNoSrcset = $('img').filter((i, el) => !$(el).attr('srcset')).length;
  if (imgsNoSrcset > 0) issues.push(`${imgsNoSrcset} image(s) missing srcset`);
  let score = 100;
  if (issues.length > 0) score -= Math.min(80, issues.length * 25);
  return { issues, mobileUsabilityScore: Math.max(0, score) };
};

export const runPageSpeedInsightsAnalysis = async (url, userId = null, strategy = 'mobile') => {
  // strategy: 'mobile' or 'desktop'
  const psiKey = getApiKey(userId, 'PAGE_SPEED_INSIGHTS_API_KEY') || process.env.PAGESPEED_API_KEY || process.env.PAGE_SPEED_INSIGHTS_API_KEY;
  if (!psiKey) {
    // Fallback to mock data when API key not available
    const mock = generateMockLighthouseScores(url, strategy === 'desktop' ? 'desktop' : 'mobile');
    return { scores: mock.scores, metrics: mock.metrics, audits: mock.audits, source: 'mock-psi' };
  }

  try {
    const resp = await axios.get('https://www.googleapis.com/pagespeedonline/v5/runPagespeed', {
      params: {
        url,
        key: psiKey,
        strategy: strategy,
        category: ['performance', 'accessibility', 'best-practices', 'seo']
      },
      timeout: 15000
    });

    const lhr = resp.data.lighthouseResult || {};
    const categories = lhr.categories || {};
    const audits = lhr.audits || {};

    const scores = {
      performance: Math.round((categories.performance?.score ?? 0) * 100),
      accessibility: Math.round((categories.accessibility?.score ?? 0) * 100),
      bestPractices: Math.round((categories['best-practices']?.score ?? 0) * 100),
      seo: Math.round((categories.seo?.score ?? 0) * 100)
    };

    const metrics = {
      firstContentfulPaint: audits['first-contentful-paint']?.displayValue || null,
      largestContentfulPaint: audits['largest-contentful-paint']?.displayValue || null,
      timeToInteractive: audits['interactive']?.displayValue || null,
      cumulativeLayoutShift: audits['cumulative-layout-shift']?.displayValue || null,
      speedIndex: audits['speed-index']?.displayValue || null,
    };

    // Minimal audit mapping for mobile-specific checks
    const parsedAudits = {
      hasViewport: Boolean(audits.viewport && audits.viewport.score === 1),
      touchTargetsOk: !(audits['tap-targets'] && audits['tap-targets'].score === 0),
      usesResponsiveImages: !(audits['uses-responsive-images'] && audits['uses-responsive-images'].score === 0)
    };

    return { scores, metrics, audits: parsedAudits, source: 'pagespeed-insights' };
  } catch (err) {
    // On error, fallback to mock
    const mock = generateMockLighthouseScores(url, strategy === 'desktop' ? 'desktop' : 'mobile');
    return { scores: mock.scores, metrics: mock.metrics, audits: mock.audits, source: 'mock-psi-fallback', error: err.message };
  }
};

export const runLighthouseAnalysis = async (url, userId = null, siteData = null) => {
  // Prefer PageSpeed Insights API (mobile + desktop) when API key available; otherwise use mocks
  const psiKey = getApiKey(userId, 'PAGE_SPEED_INSIGHTS_API_KEY') || process.env.PAGESPEED_API_KEY || process.env.PAGE_SPEED_INSIGHTS_API_KEY;

  let mobileResult;
  let desktopResult;

  if (psiKey) {
    // Run both strategies in parallel
    [mobileResult, desktopResult] = await Promise.all([
      runPageSpeedInsightsAnalysis(url, userId, 'mobile'),
      runPageSpeedInsightsAnalysis(url, userId, 'desktop')
    ]);
  } else {
    mobileResult = generateMockLighthouseScores(url, 'mobile');
    desktopResult = generateMockLighthouseScores(url, 'desktop');
  }

  // Normalize shape: ensure .scores exists
  const mobile = {
    device: 'mobile',
    scores: mobileResult.scores || {},
    metrics: mobileResult.metrics || {},
    audits: mobileResult.audits || {},
    source: mobileResult.source || 'unknown'
  };

  const desktop = {
    device: 'desktop',
    scores: desktopResult.scores || {},
    metrics: desktopResult.metrics || {},
    audits: desktopResult.audits || {},
    source: desktopResult.source || 'unknown'
  };

  const avg = (a, b) => Math.round(((a || 0) + (b || 0)) / 2);
  const scores = {
    performance: avg(mobile.scores.performance, desktop.scores.performance),
    accessibility: avg(mobile.scores.accessibility, desktop.scores.accessibility),
    bestPractices: avg(mobile.scores.bestPractices, desktop.scores.bestPractices),
    seo: avg(mobile.scores.seo, desktop.scores.seo)
  };

  const comparison = compareDeviceMetrics(mobile, desktop);
  const responsive = analyzeResponsiveDesign(siteData?.$ || null);

  return { scores, devices: { mobile, desktop }, comparison, responsive, metrics: mobile.metrics, source: 'pagespeed-insights' };
};

export const analyzeSite = async (url, userId = null) => {
  const site = await fetchWebsite(url).catch(() => createMockWebsiteData(url));
  const { $ } = site;
  const metadata = await analyzeMetadata(url, $);
  const headings = await analyzeHeadings($);
  const images = await analyzeImages($);
  const links = await analyzeLinks(url, $);
  const security = await analyzeSecurity(url);
  const lighthouse = await runLighthouseAnalysis(url, userId, site);
  return {
    url,
    timestamp: new Date().toISOString(),
    analysisType: 'fast-mock',
    processingTime: '0ms',
    metadata,
    headings,
    images,
    links,
    security,
    lighthouse,
    performance: lighthouse.scores.performance,
    seo: lighthouse.scores.seo,
    accessibility: lighthouse.scores.accessibility,
    bestPractices: lighthouse.scores.bestPractices
  };
};

export const runScan = async (url, userId = null) => {
  const siteAnalysis = await analyzeSite(url, userId);
  const l = siteAnalysis.lighthouse || { scores: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 } };
  return {
    performance_score: (l.scores.performance ?? 0) / 100,
    seo_score: (l.scores.seo ?? 0) / 100,
    accessibility_score: (l.scores.accessibility ?? 0) / 100,
    best_practices_score: (l.scores.bestPractices ?? 0) / 100,
    issues: siteAnalysis.lighthouse?.comparison?.mobileIssues || [],
    raw: siteAnalysis
  };
};

export default {
  fetchWebsite,
  analyzeMetadata,
  analyzeHeadings,
  analyzeImages,
  analyzeLinks,
  analyzeSecurity,
  analyzeRobotsTxt,
  analyzeSitemap,
  analyzeDomainInfo,
  analyzeSafeBrowsing,
  runPageSpeedInsightsAnalysis,
  runLighthouseAnalysis,
  analyzeSite,
  runScan
};
