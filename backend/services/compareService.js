import { fetchWebsite, analyzeMetadata, analyzeHeadings, analyzeImages, analyzeLinks, runPageSpeedInsightsAnalysis } from './seoServiceNew.js';
import { analyzeContentQuality } from './contentAnalysisService.js';
import { extractKeywords } from '../utils/keywordExtractor.js';

const safe = async (p, fallback=null) => {
  try { return await p; } catch (e) { return fallback; }
};

const analyzeSingle = async (url, userId=null) => {
  const out = { url, performance: null, seo: null, content: null, keywords: [], errors: [] };
  try {
    const { html, $ } = await fetchWebsite(url);

    const [meta, headings, images, links, lighthouse, content] = await Promise.all([
      safe(analyzeMetadata(url, $), { issues: ['metadata_failed'] }),
      safe(analyzeHeadings($), { counts: {}, issues: ['headings_failed'] }),
      safe(analyzeImages($), { issues: ['images_failed'], totalImages: 0 }),
      safe(analyzeLinks(url, $), { issues: ['links_failed'] }),
      safe(runPageSpeedInsightsAnalysis(url, userId), null),
      safe(analyzeContentQuality(url), null)
    ]);

    // Performance score from lighthouse if available
    let perfScore = null;
    if (lighthouse && lighthouse.scores && typeof lighthouse.scores.performance === 'number') {
      perfScore = lighthouse.scores.performance;
    } else if (lighthouse && typeof lighthouse.performanceScore === 'number') {
      perfScore = lighthouse.performanceScore;
    }

    // SEO basic score as heuristic from issues
    const seoIssues = [
      ...(meta?.issues || []),
      ...(headings?.issues || []),
      ...(images?.issues || [])
    ];
    const seoScore = Math.max(0, Math.min(100, 100 - (seoIssues.length * 3))); // heuristic

    // Keywords for overlap (use content top keywords if available; else extract from text)
    let keywords = [];
    if (content?.keywordDensity?.topKeywords?.length) {
      keywords = content.keywordDensity.topKeywords.map(k => k.keyword);
    } else {
      const bodyText = $('body').text() || '';
      keywords = extractKeywords(bodyText);
    }

    out.performance = { score: perfScore, lighthouse };
    out.seo = { score: seoScore, issuesCount: seoIssues.length, breakdown: { meta: meta?.issues?.length || 0, headings: headings?.issues?.length || 0, images: images?.issues?.length || 0 } };
    out.content = content ? { readability: content.readability, structure: content.structure, score: content.score } : null;
    out.keywords = keywords;
  } catch (e) {
    out.errors.push(e.message || 'analysis_failed');
  }
  return out;
};

const compareMetrics = (results) => {
  // Normalize and compute diffs relative to the first URL (primary)
  const primary = results[0];

  const perf = results.map(r => ({ url: r.url, score: r.performance?.score ?? null }));
  const seo = results.map(r => ({ url: r.url, score: r.seo?.score ?? null, issues: r.seo?.issuesCount ?? null }));
  const readability = results.map(r => ({ url: r.url, fle: r.content?.readability?.fleschReadingEase ?? null }));

  // Rankings (higher is better for perf & readability, lower is better for issues)
  const rankDesc = (arr, key) => [...arr].sort((a,b)=> (b[key]??-Infinity)-(a[key]??-Infinity));
  const rankAsc = (arr, key) => [...arr].sort((a,b)=> (a[key]??Infinity)-(b[key]??Infinity));

  const perfRanks = rankDesc(perf, 'score');
  const seoRanks = rankDesc(seo, 'score');
  const issueRanks = rankAsc(seo, 'issues');
  const readRanks = rankDesc(readability, 'fle');

  // Diffs vs primary
  const diffLabel = (a,b) => (a==null||b==null) ? 'n/a' : (a>b ? 'better' : a<b ? 'worse' : 'equal');
  const diffs = results.map(r => ({
    url: r.url,
    performance: { score: r.performance?.score ?? null, vsPrimary: diffLabel(r.performance?.score, primary.performance?.score) },
    seo: { score: r.seo?.score ?? null, issues: r.seo?.issuesCount ?? null, vsPrimary: diffLabel(r.seo?.score, primary.seo?.score) },
    readability: { fle: r.content?.readability?.fleschReadingEase ?? null, vsPrimary: diffLabel(r.content?.readability?.fleschReadingEase, primary.content?.readability?.fleschReadingEase) }
  }));

  // Keyword overlap
  const keywordSets = results.map(r => new Set(r.keywords || []));
  const overlapAll = results.reduce((acc, r) => acc.filter(k => (r.keywords||[]).includes(k)), results[0]?.keywords || []);
  const pairwise = [];
  for (let i=0;i<results.length;i++){
    for (let j=i+1;j<results.length;j++){
      const a = keywordSets[i], b = keywordSets[j];
      const inter = [...a].filter(x => b.has(x));
      pairwise.push({ a: results[i].url, b: results[j].url, overlap: inter, overlapCount: inter.length });
    }
  }

  return { perfRanks, seoRanks, readRanks, issueRanks, diffs, overlapAll, pairwise };
};

export const compareUrls = async (urls, userId=null) => {
  const uniqueUrls = [...new Set(urls)].slice(0,3);
  if (uniqueUrls.length < 2) throw new Error('Provide at least two distinct URLs');

  const analyses = await Promise.all(uniqueUrls.map(u => analyzeSingle(u, userId)));
  const comparison = compareMetrics(analyses);

  return { analyzed: analyses, comparison };
};

export default { compareUrls };
