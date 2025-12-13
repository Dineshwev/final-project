// Accessibility Analysis Service
// Supports both mock (safe) and real accessibility analysis

import axios from 'axios';
import * as cheerio from 'cheerio';

// 🔒 PRODUCTION SAFETY TOGGLE
const USE_REAL = false; // Default to mock for safety

/**
 * REAL ACCESSIBILITY LOGIC (lightweight)
 * Performs basic accessibility checks without heavy tools
 */
const performRealAccessibilityAnalysis = async (url) => {
  try {
    console.log(`🔍 Performing REAL accessibility analysis for: ${url}`);
    
    // Fetch HTML content
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'SEO-Accessibility-Analyzer/1.0'
      }
    });
    
    const $ = cheerio.load(response.data);
    const issues = [];
    let totalElements = 0;
    let violations = 0;
    
    // Check 1: Images without alt attributes
    const imagesWithoutAlt = $('img:not([alt])').length;
    const imagesWithEmptyAlt = $('img[alt=""]').length;
    totalElements += $('img').length;
    
    if (imagesWithoutAlt > 0) {
      issues.push({
        type: 'image-alt',
        severity: 'critical',
        count: imagesWithoutAlt,
        description: 'Images must have alternate text'
      });
      violations += imagesWithoutAlt;
    }
    
    if (imagesWithEmptyAlt > 0) {
      issues.push({
        type: 'empty-alt',
        severity: 'serious',
        count: imagesWithEmptyAlt,
        description: 'Images have empty alt attributes'
      });
      violations += imagesWithEmptyAlt;
    }
    
    // Check 2: Input elements without labels
    const inputsWithoutLabels = $('input:not([aria-label]):not([aria-labelledby])').filter((i, el) => {
      const $el = $(el);
      const id = $el.attr('id');
      if (id) {
        return $(`label[for="${id}"]`).length === 0;
      }
      return $el.closest('label').length === 0;
    }).length;
    
    totalElements += $('input').length;
    
    if (inputsWithoutLabels > 0) {
      issues.push({
        type: 'input-label',
        severity: 'critical',
        count: inputsWithoutLabels,
        description: 'Input elements must have associated labels'
      });
      violations += inputsWithoutLabels;
    }
    
    // Check 3: Heading hierarchy
    const headings = $('h1, h2, h3, h4, h5, h6').toArray();
    let headingIssues = 0;
    let lastLevel = 0;
    
    headings.forEach(heading => {
      const currentLevel = parseInt(heading.name.substring(1));
      if (lastLevel > 0 && currentLevel > lastLevel + 1) {
        headingIssues++;
      }
      lastLevel = currentLevel;
    });
    
    totalElements += headings.length;
    
    if (headingIssues > 0) {
      issues.push({
        type: 'heading-order',
        severity: 'moderate',
        count: headingIssues,
        description: 'Heading levels should not be skipped'
      });
      violations += headingIssues;
    }
    
    // Check 4: HTML lang attribute
    const htmlLang = $('html').attr('lang');
    if (!htmlLang || htmlLang.trim() === '') {
      issues.push({
        type: 'html-lang',
        severity: 'serious',
        count: 1,
        description: 'HTML element must have a lang attribute'
      });
      violations += 1;
    }
    
    // Check 5: ARIA attributes presence (basic count)
    const ariaElements = $('[aria-label], [aria-labelledby], [aria-describedby], [role]').length;
    const ariaScore = Math.min(ariaElements * 2, 20); // Bonus for ARIA usage
    
    // Calculate score
    const maxViolations = Math.max(totalElements * 0.1, 10); // Allow up to 10% violations
    const violationPenalty = Math.min((violations / maxViolations) * 50, 50);
    const accessibilityScore = Math.max(100 - violationPenalty + ariaScore, 20);
    
    // Determine WCAG level
    let level = 'AAA';
    if (accessibilityScore < 90) level = 'AA';
    if (accessibilityScore < 70) level = 'A';
    if (accessibilityScore < 50) level = 'Non-compliant';
    
    const passes = Math.max(totalElements - violations, 0);
    const warnings = Math.floor(violations * 0.3); // Some violations might be warnings
    
    return {
      status: 'real',
      url,
      score: Math.round(accessibilityScore),
      level,
      issues,
      summary: {
        totalElements,
        violations,
        passes,
        warnings
      }
    };
    
  } catch (error) {
    console.error('Real accessibility analysis failed:', error.message);
    // FALLBACK: Return mock data with error indication
    const mockResult = generateMockAccessibilityAnalysis(url);
    mockResult.status = 'mock-fallback';
    return mockResult;
  }
};

/**
 * MOCK FALLBACK (production-safe)
 * Generate mock accessibility analysis data
 * @param {string} url - The URL to analyze
 * @returns {Object} Mock accessibility analysis results
 */
const generateMockAccessibilityAnalysis = (url) => {
  console.log(`🎭 Using MOCK accessibility analysis for: ${url}`);
  return {
    status: 'mock',
    url,
    score: 78,
    level: 'AA',
    issues: [
      {
        type: 'color-contrast',
        severity: 'serious',
        count: 3,
        description: 'Elements must have sufficient color contrast'
      },
      {
        type: 'image-alt',
        severity: 'critical',
        count: 1,
        description: 'Images must have alternate text'
      }
    ],
    summary: {
      totalElements: 156,
      violations: 4,
      passes: 23,
      warnings: 2
    }
  };
};

/**
 * Analyze accessibility for a given URL
 * @param {string} url - The URL to analyze
 * @returns {Promise<Object>} Accessibility analysis results
 */
export const analyzeAccessibility = async (url) => {
  // Safety toggle: Use real analysis only when explicitly enabled
  if (USE_REAL) {
    return await performRealAccessibilityAnalysis(url);
  }
  
  // Default: Return mock data (production-safe)
  return generateMockAccessibilityAnalysis(url);
};
