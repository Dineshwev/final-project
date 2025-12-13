// Schema Markup Analysis Service
// Supports both mock (safe) and real schema validation

import axios from 'axios';
import * as cheerio from 'cheerio';

// 🔒 PRODUCTION SAFETY TOGGLE
const USE_REAL = false; // Default to mock for safety

/**
 * REAL SCHEMA VALIDATION (lightweight)
 * Extracts and validates JSON-LD structured data
 */
const performRealSchemaAnalysis = async (url) => {
  try {
    console.log(`🔍 Performing REAL schema validation for: ${url}`);
    
    // Fetch HTML content
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'SEO-Schema-Analyzer/1.0'
      }
    });
    
    const $ = cheerio.load(response.data);
    const schemas = [];
    const errors = [];
    const warnings = [];
    
    let totalSchemasFound = 0;
    let validSchemas = 0;
    let invalidSchemas = 0;
    
    // Extract JSON-LD scripts
    $('script[type="application/ld+json"]').each((i, element) => {
      totalSchemasFound++;
      const scriptContent = $(element).html();
      
      if (!scriptContent || scriptContent.trim() === '') {
        invalidSchemas++;
        errors.push({
          type: 'Unknown',
          field: 'content',
          message: 'Empty schema script block'
        });
        return;
      }
      
      try {
        // Parse JSON safely
        const schemaData = JSON.parse(scriptContent);
        
        // Handle array of schemas
        const schemaArray = Array.isArray(schemaData) ? schemaData : [schemaData];
        
        schemaArray.forEach(schema => {
          const schemaType = schema['@type'] || 'Unknown';
          let isValid = true;
          let schemaWarnings = 0;
          
          // Check for required properties
          if (!schema['@context']) {
            isValid = false;
            errors.push({
              type: schemaType,
              field: '@context',
              message: 'Missing required @context property'
            });
          }
          
          if (!schema['@type']) {
            isValid = false;
            errors.push({
              type: 'Unknown',
              field: '@type',
              message: 'Missing required @type property'
            });
          }
          
          // Check for common schema types and their requirements
          if (schemaType === 'Organization') {
            if (!schema.name) {
              schemaWarnings++;
              warnings.push({
                type: schemaType,
                field: 'name',
                message: 'Organization name is recommended'
              });
            }
            if (!schema.url) {
              schemaWarnings++;
              warnings.push({
                type: schemaType,
                field: 'url',
                message: 'Organization URL is recommended'
              });
            }
          }
          
          if (schemaType === 'Article') {
            if (!schema.headline) {
              isValid = false;
              errors.push({
                type: schemaType,
                field: 'headline',
                message: 'Article headline is required'
              });
            }
            if (!schema.datePublished) {
              isValid = false;
              errors.push({
                type: schemaType,
                field: 'datePublished',
                message: 'Missing required property'
              });
            }
            if (!schema.author) {
              schemaWarnings++;
              warnings.push({
                type: schemaType,
                field: 'author',
                message: 'Author information is recommended'
              });
            }
          }
          
          if (schemaType === 'WebSite') {
            if (!schema.url) {
              schemaWarnings++;
              warnings.push({
                type: schemaType,
                field: 'url',
                message: 'Website URL is recommended'
              });
            }
          }
          
          // Check for unsupported or unknown schema types
          const supportedTypes = ['Organization', 'WebSite', 'Article', 'Person', 'LocalBusiness', 
                                'Product', 'Review', 'BreadcrumbList', 'FAQ', 'HowTo'];
          if (!supportedTypes.includes(schemaType)) {
            schemaWarnings++;
            warnings.push({
              type: schemaType,
              field: '@type',
              message: `Schema type '${schemaType}' may not be commonly supported`
            });
          }
          
          schemas.push({
            type: schemaType,
            valid: isValid,
            warnings: schemaWarnings
          });
          
          if (isValid) {
            validSchemas++;
          } else {
            invalidSchemas++;
          }
        });
        
      } catch (parseError) {
        invalidSchemas++;
        errors.push({
          type: 'Unknown',
          field: 'JSON',
          message: 'Invalid JSON structure in schema markup'
        });
      }
    });
    
    // Calculate schema score (0-100)
    const errorPenalty = errors.length * 20;
    const warningPenalty = warnings.length * 5;
    const validBonus = validSchemas * 10;
    const schemaScore = Math.max(Math.min(100 - errorPenalty - warningPenalty + validBonus, 100), 0);
    
    // Determine compliance status
    let complianceStatus = 'Good';
    if (errors.length > 2 || schemaScore < 50) {
      complianceStatus = 'Critical';
    } else if (errors.length > 0 || warnings.length > 3) {
      complianceStatus = 'Needs Fix';
    }
    
    return {
      status: 'real',
      url,
      valid: errors.length === 0,
      score: Math.round(schemaScore),
      schemas,
      errors,
      summary: {
        totalSchemas: totalSchemasFound,
        validSchemas,
        errorCount: errors.length,
        warningCount: warnings.length
      },
      complianceStatus
    };
    
  } catch (error) {
    console.error('Real schema analysis failed:', error.message);
    // FALLBACK: Return mock data with error indication
    const mockResult = generateMockSchemaAnalysis(url);
    mockResult.status = 'mock-fallback';
    return mockResult;
  }
};

/**
 * MOCK FALLBACK (production-safe)
 * Generate mock schema analysis data
 * @param {string} url - The URL to analyze
 * @returns {Object} Mock schema analysis results
 */
const generateMockSchemaAnalysis = (url) => {
  console.log(`🎭 Using MOCK schema analysis for: ${url}`);
  return {
    status: 'mock',
    url,
    valid: true,
    score: 82,
    schemas: [
      {
        type: 'Organization',
        valid: true,
        warnings: 0
      },
      {
        type: 'WebSite',
        valid: true,
        warnings: 0
      },
      {
        type: 'Article',
        valid: false,
        warnings: 2
      }
    ],
    errors: [
      {
        type: 'Article',
        field: 'datePublished',
        message: 'Missing required property'
      }
    ],
    summary: {
      totalSchemas: 3,
      validSchemas: 2,
      errorCount: 1,
      warningCount: 2
    }
  };
};

/**
 * Analyze schema markup for a given URL
 * @param {string} url - The URL to analyze
 * @returns {Promise<Object>} Schema analysis results
 */
export const analyzeSchema = async (url) => {
  // Safety toggle: Use real analysis only when explicitly enabled
  if (USE_REAL) {
    return await performRealSchemaAnalysis(url);
  }
  
  // Default: Return mock data (production-safe)
  return generateMockSchemaAnalysis(url);
};
