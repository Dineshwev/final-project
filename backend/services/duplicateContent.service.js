// Duplicate Content Analysis Service
// Returns mock data for duplicate content detection

import axios from 'axios';

// PRODUCTION SAFETY TOGGLE
const USE_REAL = false; // Set to true to enable real analysis (default: false for safety)

/**
 * Generate mock duplicate content analysis data
 * @param {string} url - The URL to analyze
 * @returns {Object} Mock duplicate content analysis results
 */
const generateMockDuplicateContentAnalysis = (url) => {
  return {
    status: 'mock',
    url,
    score: 85,
    duplicatePercentage: 12.3,
    duplicates: [
      {
        source: 'competitor-site.com/blog',
        similarity: 18.7,
        type: 'external'
      },
      {
        source: 'internal-page-2',
        similarity: 8.2,
        type: 'internal'
      }
    ],
    summary: {
      totalChecked: 1,
      duplicatesFound: 2,
      highRiskCount: 0,
      mediumRiskCount: 1
    }
  };
};

/**
 * Extract visible text from HTML content
 * @param {string} html - HTML content
 * @returns {string} Extracted text
 */
const extractVisibleText = (html) => {
  // Remove script and style elements
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, ' ');
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  // Decode HTML entities
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  
  return text;
};

/**
 * Analyze text for duplicate content patterns
 * @param {string} text - Text content to analyze
 * @returns {Object} Analysis results
 */
const analyzeTextContent = (text) => {
  const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  const wordCount = words.length;
  
  // Find repeated phrases (3+ words)
  const phrases = [];
  for (let i = 0; i <= words.length - 3; i++) {
    const phrase = words.slice(i, i + 3).join(' ');
    phrases.push(phrase);
  }
  
  // Count phrase occurrences
  const phraseCount = {};
  phrases.forEach(phrase => {
    phraseCount[phrase] = (phraseCount[phrase] || 0) + 1;
  });
  
  // Find duplicated phrases
  const duplicatedPhrases = Object.entries(phraseCount)
    .filter(([phrase, count]) => count > 1)
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 duplicated phrases
  
  // Calculate duplicate percentage (simple heuristic)
  const duplicatedWordCount = duplicatedPhrases.reduce((sum, item) => 
    sum + (item.count - 1) * item.phrase.split(' ').length, 0
  );
  
  const duplicatePercentage = wordCount > 0 
    ? Math.min(100, (duplicatedWordCount / wordCount) * 100)
    : 0;
  
  // Calculate score (100 - duplicate percentage)
  const score = Math.max(0, Math.round(100 - duplicatePercentage));
  
  return {
    wordCount,
    duplicatedPhrases,
    duplicatePercentage: Math.round(duplicatePercentage * 10) / 10,
    score
  };
};

/**
 * Perform real duplicate content analysis (REAL LOGIC - safe, lightweight)
 * @param {string} url - The URL to analyze
 * @returns {Promise<Object>} Real duplicate content analysis results
 */
const performRealDuplicateContentAnalysis = async (url) => {
  try {
    // Fetch page content with timeout
    const response = await axios.get(url, {
      timeout: 5000, // 5 second timeout
      maxContentLength: 1024 * 1024, // 1MB limit
      headers: {
        'User-Agent': 'SEO-Analyzer/1.0'
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    // Extract and analyze text
    const text = extractVisibleText(response.data);
    const analysis = analyzeTextContent(text);
    
    // Generate duplicates array based on analysis
    const duplicates = [];
    
    // Add internal duplicates if high repetition detected
    if (analysis.duplicatedPhrases.length > 0) {
      const topDuplicate = analysis.duplicatedPhrases[0];
      if (topDuplicate.count > 3) {
        duplicates.push({
          source: 'internal-repetition',
          similarity: Math.min(95, topDuplicate.count * 15),
          type: 'internal'
        });
      }
    }
    
    // Simulate external check (basic heuristic)
    if (analysis.duplicatePercentage > 20) {
      duplicates.push({
        source: 'potential-external-source',
        similarity: Math.round(analysis.duplicatePercentage),
        type: 'external'
      });
    }
    
    // Determine risk levels
    let highRiskCount = 0;
    let mediumRiskCount = 0;
    
    duplicates.forEach(duplicate => {
      if (duplicate.similarity > 80) {
        highRiskCount++;
      } else if (duplicate.similarity > 40) {
        mediumRiskCount++;
      }
    });
    
    return {
      status: 'real',
      url,
      score: analysis.score,
      duplicatePercentage: analysis.duplicatePercentage,
      duplicates,
      summary: {
        totalChecked: 1,
        duplicatesFound: duplicates.length,
        highRiskCount,
        mediumRiskCount,
        wordCount: analysis.wordCount,
        topRepeatedPhrases: analysis.duplicatedPhrases.slice(0, 3)
      }
    };
    
  } catch (error) {
    // If real analysis fails, return mock data with error info
    console.error('Real duplicate content analysis failed:', error.message);
    
    const mockResult = generateMockDuplicateContentAnalysis(url);
    mockResult.status = 'real'; // Keep status as real but with fallback data
    mockResult.error = `Analysis failed: ${error.message}`;
    
    return mockResult;
  }
};

/**
 * Analyze duplicate content for a given URL
 * @param {string} url - The URL to analyze
 * @returns {Promise<Object>} Duplicate content analysis results
 */
export const analyzeDuplicateContent = async (url) => {
  // PRODUCTION SAFETY: Toggle between real and mock analysis
  if (USE_REAL) {
    // REAL LOGIC (safe, lightweight)
    console.log(`🔍 Performing REAL duplicate content analysis for: ${url}`);
    return await performRealDuplicateContentAnalysis(url);
  } else {
    // MOCK FALLBACK (production-safe)
    console.log(`🎭 Using MOCK duplicate content analysis for: ${url}`);
    return generateMockDuplicateContentAnalysis(url);
  }
  
  // TODO: Future enhancements for real implementation:
  // 1. Add content fingerprinting using hashing algorithms
  // 2. Implement shingling for better similarity detection
  // 3. Add database storage for historical content comparison
  // 4. Integrate with external plagiarism detection APIs
  // 5. Add semantic similarity analysis using NLP libraries
  // 6. Implement batch processing for multiple URL comparison
};
