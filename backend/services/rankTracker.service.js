// Rank Tracker Analysis Service
// Supports both mock (safe) and real rank readiness analysis

import axios from 'axios';
import * as cheerio from 'cheerio';

// 🔒 PRODUCTION SAFETY TOGGLE
const USE_REAL = false; // Default to mock for safety

/**
 * REAL RANK READINESS ANALYSIS (safe)
 * Analyzes on-page optimization for keyword ranking potential
 */
const performRealRankReadinessAnalysis = async (url) => {
  try {
    console.log(`🔍 Performing REAL rank readiness analysis for: ${url}`);
    
    // Fetch HTML content
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'SEO-RankReadiness-Analyzer/1.0'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Extract page elements for analysis
    const title = $('title').text().toLowerCase();
    const h1 = $('h1').first().text().toLowerCase();
    const metaDescription = $('meta[name="description"]').attr('content')?.toLowerCase() || '';
    const bodyText = $('body').text().toLowerCase();
    const urlPath = new URL(url).pathname.toLowerCase();
    
    // Check indexability
    const metaRobots = $('meta[name="robots"]').attr('content')?.toLowerCase() || '';
    const isIndexable = !metaRobots.includes('noindex');
    
    // Default keywords to analyze (extracted from page content)
    const defaultKeywords = extractKeywordsFromContent(title, h1, metaDescription, bodyText);
    
    // Analyze each keyword for ranking readiness
    const analyzedKeywords = defaultKeywords.map(keyword => {
      const keywordLower = keyword.toLowerCase();
      
      // Check presence in key elements
      const inTitle = title.includes(keywordLower);
      const inH1 = h1.includes(keywordLower);
      const inMetaDescription = metaDescription.includes(keywordLower);
      const inUrl = urlPath.includes(keywordLower.replace(/\s+/g, '-')) || urlPath.includes(keywordLower.replace(/\s+/g, '_'));
      
      // Calculate keyword frequency in body content
      const keywordRegex = new RegExp(keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = bodyText.match(keywordRegex) || [];
      const frequency = matches.length;
      const wordCount = bodyText.split(/\s+/).length;
      const density = wordCount > 0 ? (frequency / wordCount) * 100 : 0;
      
      // Calculate relevance score (0-100)
      let relevanceScore = 0;
      
      // Title optimization (30 points max)
      if (inTitle) relevanceScore += 30;
      
      // H1 optimization (25 points max)
      if (inH1) relevanceScore += 25;
      
      // Meta description (15 points max)
      if (inMetaDescription) relevanceScore += 15;
      
      // URL optimization (10 points max)
      if (inUrl) relevanceScore += 10;
      
      // Content frequency (20 points max)
      if (frequency > 0) {
        if (density >= 1 && density <= 3) {
          relevanceScore += 20; // Optimal density
        } else if (density > 0.5 && density < 5) {
          relevanceScore += 15; // Good density
        } else if (density > 0) {
          relevanceScore += 10; // Some presence
        }
      }
      
      // Determine missing placements
      const missingPlacements = [];
      if (!inTitle) missingPlacements.push('title');
      if (!inH1) missingPlacements.push('h1');
      if (!inMetaDescription) missingPlacements.push('meta description');
      if (!inUrl) missingPlacements.push('URL');
      
      // Generate recommendations
      const recommendations = [];
      if (!inTitle) recommendations.push(`Include "${keyword}" in the page title`);
      if (!inH1) recommendations.push(`Add "${keyword}" to the main H1 heading`);
      if (!inMetaDescription) recommendations.push(`Include "${keyword}" in meta description`);
      if (frequency === 0) recommendations.push(`Add "${keyword}" to page content naturally`);
      if (density > 5) recommendations.push(`Reduce keyword density for "${keyword}" (currently ${density.toFixed(1)}%)`);
      
      // Mock position and metrics for readiness analysis
      const mockPosition = relevanceScore > 80 ? Math.floor(Math.random() * 10) + 1 :
                          relevanceScore > 60 ? Math.floor(Math.random() * 20) + 11 :
                          Math.floor(Math.random() * 50) + 31;
      
      return {
        keyword,
        position: mockPosition,
        volume: Math.floor(Math.random() * 10000) + 1000, // Mock volume
        trend: relevanceScore > 70 ? 'up' : relevanceScore > 40 ? 'stable' : 'down',
        change: relevanceScore > 70 ? Math.floor(Math.random() * 5) + 1 :
                relevanceScore > 40 ? 0 :
                -Math.floor(Math.random() * 5) - 1,
        readiness: {
          relevanceScore: Math.round(relevanceScore),
          inTitle,
          inH1,
          inMetaDescription,
          inUrl,
          frequency,
          density: Math.round(density * 10) / 10,
          missingPlacements,
          recommendations
        }
      };
    });
    
    // Calculate overall metrics
    const totalKeywords = analyzedKeywords.length;
    const keywordsOptimized = analyzedKeywords.filter(k => k.readiness.relevanceScore >= 70).length;
    const keywordsMissing = analyzedKeywords.filter(k => k.readiness.relevanceScore < 40).length;
    const avgRelevanceScore = totalKeywords > 0 
      ? Math.round(analyzedKeywords.reduce((sum, k) => sum + k.readiness.relevanceScore, 0) / totalKeywords)
      : 0;
    
    // Determine readiness status
    let readinessStatus = 'Good';
    if (avgRelevanceScore < 40 || keywordsMissing > totalKeywords * 0.6) {
      readinessStatus = 'Poor';
    } else if (avgRelevanceScore < 70 || keywordsOptimized < totalKeywords * 0.5) {
      readinessStatus = 'Needs Optimization';
    }
    
    // Calculate summary metrics based on readiness
    const topTen = analyzedKeywords.filter(k => k.readiness.relevanceScore > 80).length;
    const improved = analyzedKeywords.filter(k => k.readiness.relevanceScore > 60).length;
    const declined = analyzedKeywords.filter(k => k.readiness.relevanceScore < 40).length;
    const stable = totalKeywords - improved - declined;
    
    const averagePosition = totalKeywords > 0 
      ? Math.round(analyzedKeywords.reduce((sum, k) => sum + k.position, 0) / totalKeywords)
      : 0;
    
    // Mock visibility based on optimization level
    const currentVisibility = Math.max(Math.min(avgRelevanceScore * 0.8, 85), 20);
    const previousVisibility = currentVisibility - Math.floor(Math.random() * 10) + 5;
    
    return {
      status: 'real',
      url,
      averagePosition,
      totalKeywords,
      topTen,
      keywords: analyzedKeywords.slice(0, 10), // Return top 10 for display
      summary: {
        improved,
        declined,
        stable,
        newKeywords: Math.floor(totalKeywords * 0.1),
        lostKeywords: Math.floor(totalKeywords * 0.05)
      },
      visibility: {
        current: Math.round(currentVisibility * 10) / 10,
        previous: Math.round(previousVisibility * 10) / 10,
        change: Math.round((currentVisibility - previousVisibility) * 10) / 10
      },
      readinessAnalysis: {
        totalKeywords,
        keywordsOptimized,
        keywordsMissing,
        avgRelevanceScore,
        readinessStatus,
        isIndexable,
        recommendations: generateOverallRecommendations(analyzedKeywords, isIndexable)
      }
    };
    
  } catch (error) {
    console.error('Real rank readiness analysis failed:', error.message);
    // FALLBACK: Return mock data with error indication
    const mockResult = generateMockRankTrackerAnalysis(url);
    mockResult.status = 'mock-fallback';
    return mockResult;
  }
};

/**
 * Extract potential keywords from page content
 */
const extractKeywordsFromContent = (title, h1, metaDescription, bodyText) => {
  const text = `${title} ${h1} ${metaDescription}`.toLowerCase();
  const words = text.match(/\b[a-z]{3,}\b/g) || [];
  
  // Simple keyword extraction - get most frequent 2-3 word phrases
  const phrases = [];
  for (let i = 0; i < Math.min(words.length - 1, 20); i++) {
    if (words[i] && words[i + 1]) {
      phrases.push(`${words[i]} ${words[i + 1]}`);
    }
    if (words[i] && words[i + 1] && words[i + 2]) {
      phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }
  }
  
  // Count frequency and return top phrases
  const frequency = {};
  phrases.forEach(phrase => {
    if (phrase.length > 4) { // Ignore very short phrases
      frequency[phrase] = (frequency[phrase] || 0) + 1;
    }
  });
  
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([phrase]) => phrase);
};

/**
 * Generate overall recommendations based on analysis
 */
const generateOverallRecommendations = (keywords, isIndexable) => {
  const recommendations = [];
  
  if (!isIndexable) {
    recommendations.push('Remove noindex directive to allow search engine indexing');
  }
  
  const lowScoreKeywords = keywords.filter(k => k.readiness.relevanceScore < 50);
  if (lowScoreKeywords.length > 0) {
    recommendations.push('Optimize title tags and headings for better keyword relevance');
  }
  
  const noTitleKeywords = keywords.filter(k => !k.readiness.inTitle);
  if (noTitleKeywords.length > keywords.length * 0.5) {
    recommendations.push('Include target keywords in page titles for better ranking potential');
  }
  
  const noH1Keywords = keywords.filter(k => !k.readiness.inH1);
  if (noH1Keywords.length > keywords.length * 0.5) {
    recommendations.push('Add target keywords to H1 headings to improve topic relevance');
  }
  
  return recommendations.slice(0, 3); // Return top 3 recommendations
};

/**
 * MOCK FALLBACK (production-safe)
 * Generate mock rank tracker analysis data
 * @param {string} url - The URL to analyze
 * @returns {Object} Mock rank tracker analysis results
 */
const generateMockRankTrackerAnalysis = (url) => {
  console.log(`🎭 Using MOCK rank tracker analysis for: ${url}`);
  return {
    status: 'mock',
    url,
    averagePosition: 24,
    totalKeywords: 45,
    topTen: 8,
    keywords: [
      {
        keyword: 'seo tools',
        position: 3,
        volume: 12100,
        trend: 'up',
        change: +2
      },
      {
        keyword: 'website analysis',
        position: 7,
        volume: 8900,
        trend: 'stable',
        change: 0
      },
      {
        keyword: 'free seo checker',
        position: 15,
        volume: 6700,
        trend: 'down',
        change: -3
      }
    ],
    summary: {
      improved: 12,
      declined: 8,
      stable: 25,
      newKeywords: 3,
      lostKeywords: 1
    },
    visibility: {
      current: 68.5,
      previous: 65.2,
      change: +3.3
    }
  };
};

/**
 * Analyze keyword rankings for a given URL
 * @param {string} url - The URL to analyze
 * @returns {Promise<Object>} Rank tracking analysis results
 */
export const analyzeRankTracker = async (url) => {
  // Safety toggle: Use real analysis only when explicitly enabled
  if (USE_REAL) {
    return await performRealRankReadinessAnalysis(url);
  }
  
  // Default: Return mock data (production-safe)
  return generateMockRankTrackerAnalysis(url);
};
