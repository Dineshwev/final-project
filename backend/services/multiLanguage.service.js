// Multi-Language SEO Analysis Service
// Supports both mock (safe) and real multi-language SEO analysis

import axios from 'axios';
import * as cheerio from 'cheerio';

// 🔒 PRODUCTION SAFETY TOGGLE
const USE_REAL = false; // Default to mock for safety

/**
 * REAL MULTI-LANGUAGE SEO ANALYSIS (lightweight)
 * Analyzes hreflang implementation and language attributes
 */
const performRealMultiLanguageAnalysis = async (url) => {
  try {
    console.log(`🔍 Performing REAL multi-language analysis for: ${url}`);
    
    // Fetch HTML content
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'SEO-MultiLanguage-Analyzer/1.0'
      }
    });
    
    const $ = cheerio.load(response.data);
    const errors = [];
    const warnings = [];
    const hreflangTags = [];
    const languages = new Set();
    
    // Check HTML lang attribute
    const htmlLang = $('html').attr('lang');
    const missingLangAttribute = !htmlLang || htmlLang.trim() === '';
    
    if (missingLangAttribute) {
      warnings.push({
        type: 'missing_html_lang',
        message: 'HTML lang attribute is missing or empty'
      });
    }
    
    // Extract all hreflang link tags
    $('link[rel="alternate"][hreflang]').each((i, element) => {
      const hreflang = $(element).attr('hreflang');
      const href = $(element).attr('href');
      
      if (hreflang && href) {
        hreflangTags.push({ hreflang, href });
        
        // Extract language code (ignore x-default)
        if (hreflang !== 'x-default') {
          const langCode = hreflang.split('-')[0];
          languages.add(langCode);
        }
      }
    });
    
    const totalHreflangTags = hreflangTags.length;
    const uniqueLanguages = languages.size;
    
    // Validate hreflang format and detect issues
    const duplicateHreflangs = new Set();
    const seenHreflangs = new Set();
    let hasXDefault = false;
    let missingSelfReference = true;
    
    hreflangTags.forEach(tag => {
      const { hreflang, href } = tag;
      
      // Check for duplicates
      if (seenHreflangs.has(hreflang)) {
        duplicateHreflangs.add(hreflang);
        errors.push({
          type: 'duplicate_hreflang',
          language: hreflang,
          message: `Duplicate hreflang value: ${hreflang}`
        });
      }
      seenHreflangs.add(hreflang);
      
      // Check for x-default
      if (hreflang === 'x-default') {
        hasXDefault = true;
      }
      
      // Check for self-reference (simplified - just check if href matches current URL domain)
      try {
        const currentUrl = new URL(url);
        const hrefUrl = new URL(href);
        if (hrefUrl.hostname === currentUrl.hostname && 
            hrefUrl.pathname === currentUrl.pathname) {
          missingSelfReference = false;
        }
      } catch (e) {
        // Invalid URL in href
        errors.push({
          type: 'invalid_hreflang_url',
          language: hreflang,
          message: `Invalid URL in hreflang: ${href}`
        });
      }
      
      // Validate hreflang format (ISO 639-1 language code + optional ISO 3166-1 country)
      if (hreflang !== 'x-default') {
        const hreflangPattern = /^[a-z]{2}(-[A-Z]{2})?$/;
        if (!hreflangPattern.test(hreflang)) {
          errors.push({
            type: 'invalid_hreflang_format',
            language: hreflang,
            message: `Invalid hreflang format: ${hreflang}`
          });
        }
      }
      
      // Check for empty href
      if (!href || href.trim() === '') {
        errors.push({
          type: 'empty_hreflang_url',
          language: hreflang,
          message: 'Empty URL in hreflang tag'
        });
      }
    });
    
    // Additional warnings
    if (totalHreflangTags > 1 && !hasXDefault) {
      warnings.push({
        type: 'missing_x_default',
        message: 'Consider adding x-default hreflang for international targeting'
      });
    }
    
    if (totalHreflangTags > 0 && missingSelfReference) {
      warnings.push({
        type: 'missing_self_reference',
        message: 'Page should include hreflang reference to itself'
      });
    }
    
    // Build versions array from hreflang data
    const versions = hreflangTags.map(tag => {
      const { hreflang, href } = tag;
      let language, country;
      
      if (hreflang === 'x-default') {
        language = 'x-default';
        country = null;
      } else {
        const parts = hreflang.split('-');
        language = parts[0];
        country = parts[1] || null;
      }
      
      const hasError = errors.some(error => 
        error.language === hreflang || 
        (error.type === 'invalid_hreflang_url' && error.language === hreflang)
      );
      
      return {
        language,
        country,
        status: hasError ? 'error' : 'valid',
        url: href
      };
    });
    
    // Calculate score (0-100)
    const errorPenalty = errors.length * 15;
    const warningPenalty = warnings.length * 5;
    const languageBonus = uniqueLanguages * 5;
    const implementationBonus = totalHreflangTags > 0 ? 20 : 0;
    
    const multiLanguageScore = Math.max(
      Math.min(100 - errorPenalty - warningPenalty + languageBonus + implementationBonus, 100), 
      0
    );
    
    // Determine status
    let status = 'Good';
    if (errors.length > 3 || multiLanguageScore < 40) {
      status = 'Critical';
    } else if (errors.length > 0 || warnings.length > 2 || multiLanguageScore < 70) {
      status = 'Needs Fix';
    }
    
    const primaryLanguage = htmlLang ? htmlLang.split('-')[0] : (uniqueLanguages > 0 ? Array.from(languages)[0] : 'unknown');
    const allLanguages = htmlLang ? [htmlLang.split('-')[0], ...Array.from(languages)] : Array.from(languages);
    const uniqueAllLanguages = [...new Set(allLanguages)];
    
    return {
      status: 'real',
      url,
      languages: uniqueAllLanguages,
      primaryLanguage,
      hasHreflang: totalHreflangTags > 0,
      score: Math.round(multiLanguageScore),
      issues: [...errors, ...warnings],
      versions,
      summary: {
        totalVersions: totalHreflangTags,
        validVersions: versions.filter(v => v.status === 'valid').length,
        errors: errors.length,
        warnings: warnings.length
      },
      analysis: {
        totalHreflangTags,
        uniqueLanguages,
        missingLangAttribute,
        missingSelfReference,
        hasXDefault
      }
    };
    
  } catch (error) {
    console.error('Real multi-language analysis failed:', error.message);
    // FALLBACK: Return mock data with error indication
    const mockResult = generateMockMultiLanguageAnalysis(url);
    mockResult.status = 'mock-fallback';
    return mockResult;
  }
};

/**
 * MOCK FALLBACK (production-safe)
 * Generate mock multi-language analysis data
 * @param {string} url - The URL to analyze
 * @returns {Object} Mock multi-language analysis results
 */
const generateMockMultiLanguageAnalysis = (url) => {
  console.log(`🎭 Using MOCK multi-language analysis for: ${url}`);
  return {
    status: 'mock',
    url,
    languages: ['en', 'es', 'fr'],
    primaryLanguage: 'en',
    hasHreflang: true,
    score: 75,
    issues: [
      {
        type: 'missing_return_link',
        language: 'fr',
        message: 'French version missing return links'
      }
    ],
    versions: [
      {
        language: 'en',
        country: 'US',
        status: 'valid',
        url: url
      },
      {
        language: 'es',
        country: 'ES',
        status: 'valid',
        url: url.replace('.com', '.es')
      },
      {
        language: 'fr',
        country: 'FR',
        status: 'error',
        url: url + '/fr'
      }
    ],
    summary: {
      totalVersions: 3,
      validVersions: 2,
      errors: 1,
      warnings: 0
    }
  };
};

/**
 * Analyze multi-language SEO for a given URL
 * @param {string} url - The URL to analyze
 * @returns {Promise<Object>} Multi-language SEO analysis results
 */
export const analyzeMultiLanguage = async (url) => {
  // Safety toggle: Use real analysis only when explicitly enabled
  if (USE_REAL) {
    return await performRealMultiLanguageAnalysis(url);
  }
  
  // Default: Return mock data (production-safe)
  return generateMockMultiLanguageAnalysis(url);
};
