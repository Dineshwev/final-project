/**
 * Basic Scan Service - Simplified for Home Page Quick Scan
 * 
 * Purpose: Provides simplified SEO health checks for free users.
 * No authentication required, direct API call to /api/basic-scan.
 * 
 * Features:
 * - Title and meta description check
 * - H1 count validation
 * - HTTPS status check
 * - Basic score calculation
 * - 10 second timeout max
 * 
 * Use Cases:
 * - Home page quick website scan
 * - Free user basic analysis
 * - No login required checks
 */
import type { LegacyBasicScanResult } from './basicScan.types';
import type { FeatureScanResult } from '../feature/featureScan.types';

import axios from 'axios';
import {
  NewBasicScanOptions,
  BasicScanResult,
  BasicScanProgress,
  BasicScanError,
  BASIC_SCAN_CONFIG
} from './basicScan.types';

interface SimplifiedBasicScanResponse {
  success: boolean;
  data?: {
    url: string;
    title?: string;
    metaDescription?: string;
    h1Count?: number;
    httpsStatus?: boolean;
    score?: number;
    technicalScore?: number;
    contentScore?: number;
    userExperienceScore?: number;
  };
  error?: string;
}

class BasicScanService {
  private readonly baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL || 'https://bc-worker-env.eba-k8rrjwx.ap-southeast-2.elasticbeanstalk.com';
  }

  /**
   * Execute a basic scan for free users - simplified approach
   * 
   * @param options - Basic scan configuration options
   * @returns Promise resolving to scan result
   * @throws BasicScanError on validation or execution failures
   */
  public async executeScan(options: NewBasicScanOptions): Promise<LegacyBasicScanResult> {
    try {
      // Validate options
      this.validateScanOptions(options);

      // Prepare optimized scan payload with scanMode
      const scanPayload = this.prepareScanPayload(options);

      // Execute basic scan with 10 second timeout
      const response = await this.makeApiRequest('/api/basic-scan', {
        method: 'POST',
        data: scanPayload,
        timeout: 10000 // Fixed 10 second timeout
      });

      if (!response.data?.success) {
        throw this.createScanError(
          'SCAN_FAILED',
          'Unable to analyze website. Please try again.',
          'server'
        );
      }

      return response.data;

    } catch (error: any) {
      if (error.code && error.category) {
        throw error;
      }
      throw this.handleApiError(error);
    }
  }

  /**
   * NOTE: Progress tracking not needed for simplified basic scans
   * This method exists for compatibility but always returns completed status
   */
  public async getScanProgress(scanId: string): Promise<BasicScanProgress> {
    return {
      scanId,
      progress: 100,
      phase: 'completed',
      currentOperation: 'Analysis complete',
      estimatedTimeRemaining: 0
    };
  }

  /**
   * Cancel a running basic scan
   * 
   * @param scanId - Unique identifier for the scan to cancel
   * @returns Promise resolving when cancellation is confirmed
   */
  public async cancelScan(scanId: string): Promise<void> {
    try {
      await this.makeApiRequest(`/scan/basic/${scanId}/cancel`, {
        method: 'POST',
        timeout: 15000
      });
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Validate basic scan configuration options
   * 
   * @private
   * @param options - Scan options to validate
   * @throws BasicScanError on validation failures
   */
  private validateScanOptions(options: NewBasicScanOptions): void {
    if (!options.url || typeof options.url !== 'string') {
      throw this.createScanError(
        'INVALID_URL',
        'Valid URL is required for basic scan',
        'validation'
      );
    }

    // URL format validation
    try {
      new URL(options.url);
    } catch {
      throw this.createScanError(
        'MALFORMED_URL',
        'Provided URL is not properly formatted',
        'validation'
      );
    }

    // Timeout validation
    if (
  options.config?.timeout &&
  (options.config.timeout < 10000 || options.config.timeout > 300000)
) {

      throw this.createScanError(
        'INVALID_TIMEOUT',
        'Timeout must be between 10 seconds and 5 minutes',
        'validation'
      );
    }
  }

  /**
   * Prepare the API request payload for basic scan
   * 
   * @private
   * @param options - Scan configuration options
   * @returns Formatted payload for API request
   */
  private prepareScanPayload(options: NewBasicScanOptions): Record<string, any> {
    const config = options.config ?? {};
    return {
      url: options.url.trim(),
      mode: 'basic',
      scanMode: config.scanType || 'basic',
      options: {
        includeMobile: config.includeMobile ?? true,
        includePerformance: config.includePerformance ?? true,
        maxPages: BASIC_SCAN_CONFIG.MAX_PAGES,
        coreChecks: BASIC_SCAN_CONFIG.CORE_CHECKS,
        timeout: config.timeout ?? BASIC_SCAN_CONFIG.TIMEOUT
      }
    };
  }

  /**
   * Process and normalize the raw scan result from API
   * 
   * Process simplified basic scan result from /api/basic-scan
   * 
   * @private
   * @param rawResult - Raw result data from API
   * @returns Processed BasicScanResult
   */
  private processScanResult(rawResult: SimplifiedBasicScanResponse): LegacyBasicScanResult {
    const data = rawResult.data;
    if (!data) {
      throw this.createScanError(
        'INVALID_RESPONSE',
        'Invalid response from scan service',
        'server'
      );
    }

    // Simple inline scan - no persistent scanId needed
    const scanId = 'basic_inline_scan';

    // Calculate overall score
    const overallScore = data.score || 75;

    return {
      scanId,
      url: data.url,
      timestamp: new Date().toISOString(),
      status: 'completed',
      score: overallScore,
      results: {
        onPageSeo: {
          title: {
            present: !!data.title,
            length: data.title?.length || 0,
            isOptimal: (data.title?.length || 0) >= 30 && (data.title?.length || 0) <= 60
          },
          metaDescription: {
            present: !!data.metaDescription,
            length: data.metaDescription?.length || 0,
            isOptimal: (data.metaDescription?.length || 0) >= 120 && (data.metaDescription?.length || 0) <= 160
          },
          headers: {
            h1Count: data.h1Count || 0,
            h2Count: 0,
            h3Count: 0,
            hasProperStructure: (data.h1Count || 0) === 1
          },
          images: {
            total: 0,
            missingAlt: 0,
            altOptimizationScore: 100
          }
        },
        accessibility: {
          complianceLevel: 'A' as const,
          criticalViolations: 0,
          keyboardAccessible: true,
          screenReaderFriendly: true,
          colorContrastIssues: 0
        },
        performance: {
          coreWebVitals: {
            lcp: 2.5,
            fid: 100,
            cls: 0.1
          },
          loadSpeed: 'fast' as const,
          mobileScore: 80,
          desktopScore: 85
        },
        technicalSeo: {
          sslStatus: data.httpsStatus ? 'valid' as const : 'missing' as const,
          mobileResponsive: true,
          robotsTxtValid: true,
          sitemapValid: true,
          crawlErrors: 0
        }
      },
      recommendations: [],
      metadata: {
        scanDuration: 0,
        checksPerformed: 4,
        criticalIssuesFound: 0
      }
    };
  }

  /**
   * Calculate overall basic scan score from individual results
   * 
   * @private
   * @param results - Raw scan results
   * @returns Overall score (0-100)
   */
  private calculateOverallScore(results: any): number {
    if (!results) return 0;

    const scores = {
      onPageSeo: this.calculateOnPageScore(results.onPageSeo),
      accessibility: this.calculateAccessibilityScore(results.accessibility),
      performance: this.calculatePerformanceScore(results.performance),
      technicalSeo: this.calculateTechnicalScore(results.technicalSeo)
    };

    // Weighted average calculation
    const weights = { onPageSeo: 0.3, accessibility: 0.25, performance: 0.25, technicalSeo: 0.2 };
    
    return Math.round(
      Object.entries(scores).reduce((total, [key, score]) => {
        return total + (score * weights[key as keyof typeof weights]);
      }, 0)
    );
  }

  /**
   * Calculate on-page SEO score from basic checks
   */
  private calculateOnPageScore(onPageData: any): number {
    if (!onPageData) return 0;
    
    let score = 0;
    let maxScore = 0;

    // Title optimization
    if (onPageData.title?.present) {
      score += onPageData.title.isOptimal ? 25 : 15;
    }
    maxScore += 25;

    // Meta description
    if (onPageData.metaDescription?.present) {
      score += onPageData.metaDescription.isOptimal ? 25 : 15;
    }
    maxScore += 25;

    // Headers structure
    if (onPageData.headers?.hasProperStructure) {
      score += 25;
    }
    maxScore += 25;

    // Image optimization
    const imageScore = Math.max(0, onPageData.images?.altOptimizationScore || 0);
    score += imageScore * 0.25;
    maxScore += 25;

    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  }

  /**
   * Calculate accessibility score from basic checks
   */
  private calculateAccessibilityScore(accessibilityData: any): number {
    if (!accessibilityData) return 0;
    
    let score = 0;
    
    // Compliance level scoring
    switch (accessibilityData.complianceLevel) {
      case 'AAA': score += 40; break;
      case 'AA': score += 30; break;
      case 'A': score += 20; break;
      default: score += 0;
    }

    // Critical violations penalty
    const violations = accessibilityData.criticalViolations || 0;
    score = Math.max(0, score - (violations * 5));

    // Feature bonuses
    if (accessibilityData.keyboardAccessible) score += 20;
    if (accessibilityData.screenReaderFriendly) score += 20;
    if ((accessibilityData.colorContrastIssues || 0) === 0) score += 20;

    return Math.min(100, score);
  }

  /**
   * Calculate performance score from Core Web Vitals
   */
  private calculatePerformanceScore(performanceData: any): number {
    if (!performanceData) return 0;
    
    const vitals = performanceData.coreWebVitals || {};
    
    // Core Web Vitals scoring
    let vitalScore = 0;
    
    // LCP scoring (good: ≤2.5s, poor: >4s)
    if (vitals.lcp <= 2.5) vitalScore += 35;
    else if (vitals.lcp <= 4) vitalScore += 20;
    else vitalScore += 0;
    
    // FID scoring (good: ≤100ms, poor: >300ms)
    if (vitals.fid <= 100) vitalScore += 35;
    else if (vitals.fid <= 300) vitalScore += 20;
    else vitalScore += 0;
    
    // CLS scoring (good: ≤0.1, poor: >0.25)
    if (vitals.cls <= 0.1) vitalScore += 30;
    else if (vitals.cls <= 0.25) vitalScore += 15;
    else vitalScore += 0;

    return Math.min(100, vitalScore);
  }

  /**
   * Calculate technical SEO score from basic checks
   */
  private calculateTechnicalScore(technicalData: any): number {
    if (!technicalData) return 0;
    
    let score = 0;
    
    if (technicalData.sslStatus === 'valid') score += 25;
    if (technicalData.mobileResponsive) score += 25;
    if (technicalData.robotsTxtValid) score += 25;
    if (technicalData.sitemapValid) score += 25;
    
    // Penalty for crawl errors
    score = Math.max(0, score - ((technicalData.crawlErrors || 0) * 5));
    
    return Math.min(100, score);
  }

  /**
   * Normalize raw results into standardized format
   */
  private normalizeResults(
  rawResults: any
): LegacyBasicScanResult['results'] {

    return {
      onPageSeo: this.normalizeOnPageResults(rawResults?.onPageSeo),
      accessibility: this.normalizeAccessibilityResults(rawResults?.accessibility),
      performance: this.normalizePerformanceResults(rawResults?.performance),
      technicalSeo: this.normalizeTechnicalResults(rawResults?.technicalSeo)
    };
  }

  private normalizeOnPageResults(data: any) {
    return {
      title: {
        present: data?.title?.present || false,
        length: data?.title?.length || 0,
        isOptimal: data?.title?.isOptimal || false
      },
      metaDescription: {
        present: data?.metaDescription?.present || false,
        length: data?.metaDescription?.length || 0,
        isOptimal: data?.metaDescription?.isOptimal || false
      },
      headers: {
        h1Count: data?.headers?.h1Count || 0,
        h2Count: data?.headers?.h2Count || 0,
        h3Count: data?.headers?.h3Count || 0,
        hasProperStructure: data?.headers?.hasProperStructure || false
      },
      images: {
        total: data?.images?.total || 0,
        missingAlt: data?.images?.missingAlt || 0,
        altOptimizationScore: data?.images?.altOptimizationScore || 0
      }
    };
  }

  private normalizeAccessibilityResults(data: any) {
    return {
      complianceLevel: data?.complianceLevel || 'none',
      criticalViolations: data?.criticalViolations || 0,
      colorContrastIssues: data?.colorContrastIssues || 0,
      keyboardAccessible: data?.keyboardAccessible || false,
      screenReaderFriendly: data?.screenReaderFriendly || false
    };
  }

  private normalizePerformanceResults(data: any) {
    return {
      coreWebVitals: {
        lcp: data?.coreWebVitals?.lcp || 0,
        fid: data?.coreWebVitals?.fid || 0,
        cls: data?.coreWebVitals?.cls || 0
      },
      loadSpeed: data?.loadSpeed || 'slow',
      mobileScore: data?.mobileScore || 0,
      desktopScore: data?.desktopScore || 0
    };
  }

  private normalizeTechnicalResults(data: any) {
    return {
      sslStatus: data?.sslStatus || 'missing',
      mobileResponsive: data?.mobileResponsive || false,
      robotsTxtValid: data?.robotsTxtValid || false,
      sitemapValid: data?.sitemapValid || false,
      crawlErrors: data?.crawlErrors || 0
    };
  }

  /**
   * Process and prioritize recommendations for basic scans
   */
  private processRecommendations(recommendations: any[]): LegacyBasicScanResult['recommendations'] {
    return recommendations
      .filter(rec => ['critical', 'high'].includes(rec.priority)) // Only show high-priority items
      .slice(0, 10) // Limit to top 10 recommendations
      .map(rec => ({
        priority: rec.priority,
        category: rec.category,
        title: rec.title,
        description: rec.description,
        impact: rec.impact,
        expectedImprovement: rec.expectedImprovement || 'Minor improvement in SEO performance'
      }));
  }

  /**
   * Make HTTP request to the API with error handling - no auth required for basic scans
   */
  private async makeApiRequest(endpoint: string, options: any) {
    const config = {
      url: `${this.baseURL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'X-Scan-Mode': 'basic-free'
      },
      ...options
    };

    return await axios(config);
  }

  /**
   * Create a standardized BasicScanError
   */
  private createScanError(
    code: string,
    message: string,
    category: BasicScanError['category'],
    resolution?: string,
    details?: any
  ): BasicScanError {
    return {
      code,
      message,
      category,
      resolution,
      details
    };
  }

  /**
   * Handle and normalize API errors
   */
  private handleApiError(error: any): BasicScanError {
    if (error.response) {
      // HTTP error response
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 400) {
        return this.createScanError(
          'INVALID_REQUEST',
          data?.message || 'Invalid scan request parameters',
          'validation'
        );
      } else if (status === 401) {
        return this.createScanError(
          'UNAUTHORIZED',
          'Authentication required for basic scan',
          'server'
        );
      } else if (status === 429) {
        return this.createScanError(
          'RATE_LIMIT',
          'Too many scan requests. Please try again later.',
          'server',
          'Wait a few minutes before retrying'
        );
      } else if (status >= 500) {
        return this.createScanError(
          'SERVER_ERROR',
          'Basic scan service temporarily unavailable',
          'server',
          'Try again in a few moments'
        );
      }
    } else if (error.request) {
      // Network error
      return this.createScanError(
        'NETWORK_ERROR',
        'Unable to connect to scan service',
        'network',
        'Check your internet connection'
      );
    }

    // Unknown error
    return this.createScanError(
      'UNKNOWN_ERROR',
      error.message || 'An unexpected error occurred',
      'unknown',
      'Please contact support if the issue persists'
    );
  }
}

// Export singleton instance
export const basicScanService = new BasicScanService();

/**
 * Public API Functions
 * Clean interface for consuming components
 */

/**
 * Execute a basic SEO scan for quick health assessment
 * 
 * @param url - Website URL to scan
 * @param options - Optional scan configuration
 * @returns Promise resolving to basic scan results
 */
export async function executeBasicScan(
  url: string, 
  options?: Partial<NewBasicScanOptions>
): Promise<LegacyBasicScanResult>;
export async function executeBasicScan(
  options: NewBasicScanOptions
): Promise<LegacyBasicScanResult>;
export async function executeBasicScan(
  urlOrOptions: string | NewBasicScanOptions, 
  options: Partial<NewBasicScanOptions> = {}
): Promise<LegacyBasicScanResult> {
  // Normalize arguments to single options object
  const normalizedOptions = typeof urlOrOptions === 'string' 
    ? { url: urlOrOptions, ...options }
    : urlOrOptions;

  return basicScanService.executeScan(normalizedOptions);
}

/**
 * Monitor the progress of a running basic scan
 * 
 * @param scanId - Scan identifier to monitor
 * @returns Promise resolving to current progress
 */
export async function getBasicScanProgress(scanId: string): Promise<BasicScanProgress> {
  return basicScanService.getScanProgress(scanId);
}

/**
 * Cancel a running basic scan
 * 
 * @param scanId - Scan identifier to cancel
 * @returns Promise resolving when cancelled
 */
export async function cancelBasicScan(scanId: string): Promise<void> {
  return basicScanService.cancelScan(scanId);
}

export default basicScanService;