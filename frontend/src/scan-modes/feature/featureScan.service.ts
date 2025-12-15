/**
 * Feature Scan Service
 * 
 * Purpose: Provides focused, single-feature SEO analysis with deep specialization.
 * Optimized for rapid feedback and iterative testing of specific SEO aspects.
 * 
 * Features:
 * - Individual feature deep-dive analysis
 * - Rapid execution and feedback
 * - Specialized diagnostics per feature
 * - Targeted recommendations
 * - Configurable analysis depth
 * 
 * Use Cases:
 * - Targeted SEO optimization
 * - Specific issue investigation
 * - A/B testing for SEO changes
 * - Iterative improvement workflows
 * - Specialist consultant analysis
 */

import axios from 'axios';
import {
  FeatureScanOptions,
  FeatureScanResult,
  FeatureScanProgress,
  FeatureScanType,
  FeatureScanConfig,
  FEATURE_SCAN_CONFIG
} from './featureScan.types';

interface FeatureScanError {
  code: string;
  message: string;
  category: 'validation' | 'network' | 'timeout' | 'server' | 'feature' | 'unknown';
  resolution?: string;
  details?: any;
}

class FeatureScanService {
  private readonly baseURL: string;
  private readonly featureTimeouts: typeof FEATURE_SCAN_CONFIG.FEATURE_TIMEOUTS;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL || 'https://bc-worker-env.eba-k8rrjwx.ap-southeast-2.elasticbeanstalk.com/api';
    this.featureTimeouts = FEATURE_SCAN_CONFIG.FEATURE_TIMEOUTS;
  }

  /**
   * Execute a focused feature-specific scan
   * 
   * @param options - Feature scan configuration options
   * @returns Promise resolving to feature-specific results
   * @throws FeatureScanError on validation or execution failures
   */
  public async executeScan(options: FeatureScanOptions): Promise<FeatureScanResult> {
    try {
      // Validate feature scan parameters
      this.validateScanOptions(options);

      // Prepare feature-specific payload
      const scanPayload = this.prepareScanPayload(options);

      // Execute the feature scan
      const response = await this.makeApiRequest(`/tools/${options.feature}`, {
        method: 'POST',
        data: scanPayload,
        timeout: options.timeout || this.featureTimeouts[options.feature]
      });

      if (!response.data?.success) {
        throw this.createScanError(
          'FEATURE_SCAN_FAILED',
          response.data?.error || `${options.feature} analysis failed`,
          'server'
        );
      }

      return this.processFeatureScanResult(options.feature, response.data.data);

    } catch (error: any) {
      if (error.code && error.category) {
        throw error;
      }
      throw this.handleApiError(error, options.feature);
    }
  }

  /**
   * Execute multiple feature scans concurrently
   * 
   * @param url - Target URL to scan
   * @param features - Array of features to analyze
   * @param globalConfig - Shared configuration for all features
   * @returns Promise resolving to map of feature results
   */
  public async executeMultipleScans(
    url: string,
    features: FeatureScanType[],
    globalConfig: Partial<FeatureScanConfig> = {}
  ): Promise<Map<FeatureScanType, FeatureScanResult | FeatureScanError>> {
    try {
      this.validateMultipleScanRequest(url, features);

      // Create scan promises for each feature
      const scanPromises = features.map(async (feature) => {
        try {
          const result = await this.executeScan({
            url,
            feature,
            config: globalConfig,
            includeDiagnostics: true
          });
          return { feature, result, success: true };
        } catch (error) {
          return { feature, result: error as FeatureScanError, success: false };
        }
      });

      // Execute all scans concurrently
      const results = await Promise.all(scanPromises);

      // Build result map
      const resultMap = new Map<FeatureScanType, FeatureScanResult | FeatureScanError>();
      results.forEach(({ feature, result }) => {
        resultMap.set(feature, result);
      });

      return resultMap;

    } catch (error: any) {
      throw this.handleApiError(error, 'multiple');
    }
  }

  /**
   * Get the current progress of a running feature scan
   * 
   * @param scanId - Unique identifier for the feature scan
   * @returns Promise resolving to current scan progress
   */
  public async getScanProgress(scanId: string): Promise<FeatureScanProgress> {
    try {
      const response = await this.makeApiRequest(`/tools/progress/${scanId}`, {
        method: 'GET',
        timeout: 10000
      });

      if (!response.data?.success) {
        throw this.createScanError(
          'PROGRESS_FETCH_FAILED',
          'Unable to fetch feature scan progress',
          'server'
        );
      }

      return this.processProgressData(response.data.data);

    } catch (error: any) {
      throw this.handleApiError(error, 'progress');
    }
  }

  /**
   * Get available configuration options for a specific feature
   * 
   * @param feature - Feature type to get configuration for
   * @returns Promise resolving to feature configuration options
   */
  public async getFeatureConfiguration(feature: FeatureScanType): Promise<FeatureScanConfig> {
    try {
      const response = await this.makeApiRequest(`/tools/${feature}/config`, {
        method: 'GET',
        timeout: 5000
      });

      if (!response.data?.success) {
        throw this.createScanError(
          'CONFIG_FETCH_FAILED',
          `Unable to fetch ${feature} configuration`,
          'server'
        );
      }

      return response.data.data;

    } catch (error: any) {
      throw this.handleApiError(error, feature);
    }
  }

  /**
   * Cancel a running feature scan
   * 
   * @param scanId - Unique identifier for the scan to cancel
   * @returns Promise resolving when cancellation is confirmed
   */
  public async cancelScan(scanId: string): Promise<void> {
    try {
      await this.makeApiRequest(`/tools/cancel/${scanId}`, {
        method: 'POST',
        timeout: 10000
      });
    } catch (error: any) {
      throw this.handleApiError(error, 'cancel');
    }
  }

  /**
   * Get historical feature scan results with filtering
   * 
   * @param filters - History filtering options
   * @returns Promise resolving to filtered scan history
   */
  public async getFeatureScanHistory(filters: {
    feature?: FeatureScanType;
    url?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  } = {}): Promise<FeatureScanResult[]> {
    try {
      const response = await this.makeApiRequest('/tools/history', {
        method: 'GET',
        params: filters,
        timeout: 15000
      });

      if (!response.data?.success) {
        throw this.createScanError(
          'HISTORY_FETCH_FAILED',
          'Unable to fetch feature scan history',
          'server'
        );
      }

      return response.data.data;

    } catch (error: any) {
      throw this.handleApiError(error, 'history');
    }
  }

  /**
   * Validate feature scan configuration options
   * 
   * @private
   * @param options - Scan options to validate
   * @throws FeatureScanError on validation failures
   */
  private validateScanOptions(options: FeatureScanOptions): void {
    // URL validation
    if (!options.url || typeof options.url !== 'string') {
      throw this.createScanError(
        'INVALID_URL',
        'Valid URL is required for feature scan',
        'validation'
      );
    }

    try {
      new URL(options.url);
    } catch {
      throw this.createScanError(
        'MALFORMED_URL',
        'Provided URL is not properly formatted',
        'validation'
      );
    }

    // Feature validation
    if (!options.feature || !FEATURE_SCAN_CONFIG.AVAILABLE_FEATURES.includes(options.feature)) {
      throw this.createScanError(
        'INVALID_FEATURE',
        `Feature must be one of: ${FEATURE_SCAN_CONFIG.AVAILABLE_FEATURES.join(', ')}`,
        'validation'
      );
    }

    // Timeout validation
    const maxTimeout = this.featureTimeouts[options.feature] * 3; // Allow 3x normal timeout
    if (options.timeout && (options.timeout < 5000 || options.timeout > maxTimeout)) {
      throw this.createScanError(
        'INVALID_TIMEOUT',
        `Timeout for ${options.feature} must be between 5 seconds and ${maxTimeout / 1000} seconds`,
        'validation'
      );
    }

    // Feature-specific configuration validation
    if (options.config) {
      this.validateFeatureConfig(options.feature, options.config);
    }
  }

  /**
   * Validate feature-specific configuration
   * 
   * @private
   * @param feature - Feature type being configured
   * @param config - Configuration object to validate
   */
  private validateFeatureConfig(feature: FeatureScanType, config: FeatureScanConfig): void {
    switch (feature) {
      case 'accessibility':
        if (config.accessibility?.wcagLevel && 
            !['A', 'AA', 'AAA'].includes(config.accessibility.wcagLevel)) {
          throw this.createScanError(
            'INVALID_WCAG_LEVEL',
            'WCAG level must be A, AA, or AAA',
            'validation'
          );
        }
        break;

      case 'rank-tracker':
        if (config.rankTracker?.keywords && 
            (!Array.isArray(config.rankTracker.keywords) || config.rankTracker.keywords.length === 0)) {
          throw this.createScanError(
            'INVALID_KEYWORDS',
            'Keywords array is required for rank tracking',
            'validation'
          );
        }
        break;

      case 'backlinks':
        if (config.backlinks?.maxBacklinks && 
            (config.backlinks.maxBacklinks < 1 || config.backlinks.maxBacklinks > 10000)) {
          throw this.createScanError(
            'INVALID_BACKLINK_LIMIT',
            'Max backlinks must be between 1 and 10,000',
            'validation'
          );
        }
        break;

      case 'duplicate-content':
        if (config.duplicateContent?.similarityThreshold && 
            (config.duplicateContent.similarityThreshold < 0.1 || 
             config.duplicateContent.similarityThreshold > 1.0)) {
          throw this.createScanError(
            'INVALID_SIMILARITY_THRESHOLD',
            'Similarity threshold must be between 0.1 and 1.0',
            'validation'
          );
        }
        break;

      case 'link-checker':
        if (config.linkChecker?.maxLinksToCheck && 
            (config.linkChecker.maxLinksToCheck < 1 || 
             config.linkChecker.maxLinksToCheck > 5000)) {
          throw this.createScanError(
            'INVALID_LINK_LIMIT',
            'Max links to check must be between 1 and 5,000',
            'validation'
          );
        }
        break;
    }
  }

  /**
   * Validate multiple scan request parameters
   * 
   * @private
   * @param url - Target URL
   * @param features - Array of features to scan
   */
  private validateMultipleScanRequest(url: string, features: FeatureScanType[]): void {
    if (!url || typeof url !== 'string') {
      throw this.createScanError(
        'INVALID_URL',
        'Valid URL is required for multiple feature scan',
        'validation'
      );
    }

    if (!Array.isArray(features) || features.length === 0) {
      throw this.createScanError(
        'NO_FEATURES',
        'At least one feature must be specified',
        'validation'
      );
    }

    if (features.length > 5) {
      throw this.createScanError(
        'TOO_MANY_FEATURES',
        'Maximum 5 features can be scanned simultaneously',
        'validation'
      );
    }

    // Check for invalid features
    const invalidFeatures = features.filter(f => !FEATURE_SCAN_CONFIG.AVAILABLE_FEATURES.includes(f));
    if (invalidFeatures.length > 0) {
      throw this.createScanError(
        'INVALID_FEATURES',
        `Invalid features: ${invalidFeatures.join(', ')}`,
        'validation'
      );
    }
  }

  /**
   * Prepare feature-specific API request payload
   * 
   * @private
   * @param options - Feature scan configuration options
   * @returns Formatted payload for API request
   */
  private prepareScanPayload(options: FeatureScanOptions): Record<string, any> {
    const basePayload: Record<string, any> = {
      url: options.url.trim(),
      feature: options.feature,
      includeDiagnostics: options.includeDiagnostics ?? false,
      timeout: options.timeout || this.featureTimeouts[options.feature]
    };

    // Add feature-specific configuration
    if (options.config) {
      const featureConfig = options.config[options.feature];
      if (featureConfig) {
        basePayload.config = featureConfig;
      }
    }

    return basePayload;
  }

  /**
   * Process and normalize feature scan result from API
   * 
   * @private
   * @param feature - Feature type that was scanned
   * @param rawResult - Raw result data from API
   * @returns Processed FeatureScanResult
   */
  private processFeatureScanResult(feature: FeatureScanType, rawResult: any): FeatureScanResult {
    return {
      scanId: rawResult.scanId || this.generateScanId(feature),
      url: rawResult.url,
      feature: feature,
      timestamp: rawResult.timestamp || new Date().toISOString(),
      status: rawResult.status || 'completed',
      data: this.normalizeFeatureData(feature, rawResult.data),
      score: this.calculateFeatureScore(feature, rawResult.data),
      recommendations: this.processFeatureRecommendations(feature, rawResult.recommendations || []),
      diagnostics: rawResult.diagnostics ? this.processDiagnostics(rawResult.diagnostics) : undefined,
      metadata: {
        duration: rawResult.metadata?.duration || 0,
        checksPerformed: this.getChecksPerformed(feature, rawResult.data),
        issuesFound: this.countIssuesFound(feature, rawResult.data)
      }
    };
  }

  /**
   * Normalize feature-specific data into standardized format
   * 
   * @private
   * @param feature - Feature type
   * @param rawData - Raw data from API
   * @returns Normalized feature data
   */
  private normalizeFeatureData(feature: FeatureScanType, rawData: any): FeatureScanResult['data'] {
    switch (feature) {
      case 'schema':
        return this.normalizeSchemaData(rawData);
      case 'accessibility':
        return this.normalizeAccessibilityData(rawData);
      case 'backlinks':
        return this.normalizeBacklinksData(rawData);
      case 'duplicate-content':
        return this.normalizeDuplicateContentData(rawData);
      case 'multi-language':
        return this.normalizeMultiLanguageData(rawData);
      case 'link-checker':
        return this.normalizeLinkCheckerData(rawData);
      case 'rank-tracker':
        return this.normalizeRankTrackerData(rawData);
      case 'security-headers':
        return this.normalizeSecurityHeadersData(rawData);
      case 'performance':
        return this.normalizePerformanceData(rawData);
      case 'content-analysis':
        return this.normalizeContentAnalysisData(rawData);
      default:
        return rawData || {};
    }
  }

  /**
   * Calculate feature-specific score
   * 
   * @private
   * @param feature - Feature type
   * @param data - Feature data
   * @returns Score (0-100)
   */
  private calculateFeatureScore(feature: FeatureScanType, data: any): number {
    if (!data) return 0;

    switch (feature) {
      case 'schema':
        return this.calculateSchemaScore(data);
      case 'accessibility':
        return this.calculateAccessibilityScore(data);
      case 'backlinks':
        return this.calculateBacklinksScore(data);
      case 'duplicate-content':
        return this.calculateDuplicateContentScore(data);
      case 'multi-language':
        return this.calculateMultiLanguageScore(data);
      case 'link-checker':
        return this.calculateLinkCheckerScore(data);
      case 'rank-tracker':
        return this.calculateRankTrackerScore(data);
      case 'security-headers':
        return this.calculateSecurityScore(data);
      case 'performance':
        return this.calculatePerformanceScore(data);
      case 'content-analysis':
        return this.calculateContentScore(data);
      default:
        return data.score || 50;
    }
  }

  // Feature-specific data normalization methods
  private normalizeSchemaData(data: any) {
    return {
      detections: data.detections || [],
      coverage: {
        recommended: data.coverage?.recommended || [],
        implemented: data.coverage?.implemented || [],
        missing: data.coverage?.missing || [],
        coverageScore: data.coverage?.coverageScore || 0
      },
      validation: {
        googleValid: data.validation?.googleValid || false,
        structuredDataErrors: data.validation?.structuredDataErrors || 0,
        implementationIssues: data.validation?.implementationIssues || []
      }
    };
  }

  private normalizeAccessibilityData(data: any) {
    return {
      compliance: {
        level: data.compliance?.level || 'none',
        violations: data.compliance?.violations || [],
        passedRules: data.compliance?.passedRules || 0,
        totalRules: data.compliance?.totalRules || 0
      },
      features: {
        altText: data.features?.altText || { score: 0, missing: 0, total: 0 },
        colorContrast: data.features?.colorContrast || { score: 0, failures: 0, total: 0 },
        keyboardNav: data.features?.keyboardNav || { score: 0, issues: [] },
        landmarks: data.features?.landmarks || { score: 0, present: [], missing: [] }
      }
    };
  }

  private normalizeBacklinksData(data: any) {
    return {
      profile: {
        totalBacklinks: data.profile?.totalBacklinks || 0,
        uniqueDomains: data.profile?.uniqueDomains || 0,
        domainRating: data.profile?.domainRating || 0,
        urlRating: data.profile?.urlRating || 0
      },
      quality: {
        highQuality: data.quality?.highQuality || { count: 0, percentage: 0 },
        mediumQuality: data.quality?.mediumQuality || { count: 0, percentage: 0 },
        lowQuality: data.quality?.lowQuality || { count: 0, percentage: 0 },
        toxic: data.quality?.toxic || { count: 0, percentage: 0 }
      },
      recentBacklinks: data.recentBacklinks || []
    };
  }

  private normalizeDuplicateContentData(data: any) {
    return {
      summary: {
        duplicatePages: data.summary?.duplicatePages || 0,
        similarPages: data.summary?.similarPages || 0,
        uniquePages: data.summary?.uniquePages || 0,
        overallSimilarity: data.summary?.overallSimilarity || 0
      },
      internal: data.internal || [],
      external: data.external || []
    };
  }

  private normalizeMultiLanguageData(data: any) {
    return {
      implementation: {
        detectedLanguages: data.implementation?.detectedLanguages || [],
        hasHreflang: data.implementation?.hasHreflang || false,
        hasLanguageDeclaration: data.implementation?.hasLanguageDeclaration || false,
        implementationScore: data.implementation?.implementationScore || 0
      },
      hreflang: {
        totalImplementations: data.hreflang?.totalImplementations || 0,
        validImplementations: data.hreflang?.validImplementations || 0,
        errors: data.hreflang?.errors || [],
        missingAlternatives: data.hreflang?.missingAlternatives || []
      },
      localization: {
        languageSpecificContent: data.localization?.languageSpecificContent || 0,
        translationQuality: data.localization?.translationQuality || 0,
        culturalAdaptation: data.localization?.culturalAdaptation || 0
      }
    };
  }

  private normalizeLinkCheckerData(data: any) {
    return {
      summary: {
        totalLinks: data.summary?.totalLinks || 0,
        workingLinks: data.summary?.workingLinks || 0,
        brokenLinks: data.summary?.brokenLinks || 0,
        redirectLinks: data.summary?.redirectLinks || 0,
        warningLinks: data.summary?.warningLinks || 0
      },
      brokenLinks: data.brokenLinks || [],
      redirectChains: data.redirectChains || []
    };
  }

  private normalizeRankTrackerData(data: any) {
    return {
      rankings: data.rankings || [],
      summary: {
        totalKeywords: data.summary?.totalKeywords || 0,
        averagePosition: data.summary?.averagePosition || 0,
        topRankings: data.summary?.topRankings || 0,
        improvementOpportunities: data.summary?.improvementOpportunities || 0
      },
      competitors: data.competitors || []
    };
  }

  private normalizeSecurityHeadersData(data: any) {
    return {
      headers: {
        contentSecurityPolicy: data.headers?.contentSecurityPolicy || 
          { present: false, value: '', issues: [], score: 0 },
        strictTransportSecurity: data.headers?.strictTransportSecurity || 
          { present: false, maxAge: 0, includeSubDomains: false, preload: false, score: 0 },
        xFrameOptions: data.headers?.xFrameOptions || 
          { present: false, value: '', isSecure: false, score: 0 },
        xContentTypeOptions: data.headers?.xContentTypeOptions || 
          { present: false, isNosniff: false, score: 0 }
      },
      securityScore: data.securityScore || 0,
      recommendations: data.recommendations || []
    };
  }

  private normalizePerformanceData(data: any) {
    return {
      coreWebVitals: {
        lcp: data.coreWebVitals?.lcp || { value: 0, rating: 'poor' },
        fid: data.coreWebVitals?.fid || { value: 0, rating: 'poor' },
        cls: data.coreWebVitals?.cls || { value: 0, rating: 'poor' }
      },
      metrics: {
        firstContentfulPaint: data.metrics?.firstContentfulPaint || 0,
        timeToInteractive: data.metrics?.timeToInteractive || 0,
        speedIndex: data.metrics?.speedIndex || 0,
        totalBlockingTime: data.metrics?.totalBlockingTime || 0
      },
      opportunities: data.opportunities || [],
      resources: {
        totalSize: data.resources?.totalSize || 0,
        images: data.resources?.images || { size: 0, optimizable: 0 },
        css: data.resources?.css || { size: 0, unused: 0 },
        javascript: data.resources?.javascript || { size: 0, unused: 0 }
      }
    };
  }

  private normalizeContentAnalysisData(data: any) {
    return {
      quality: {
        wordCount: data.quality?.wordCount || 0,
        readabilityScore: data.quality?.readabilityScore || 0,
        readingLevel: data.quality?.readingLevel || '',
        sentenceComplexity: data.quality?.sentenceComplexity || 0
      },
      keywords: {
        density: data.keywords?.density || {},
        prominence: data.keywords?.prominence || {},
        naturalness: data.keywords?.naturalness || 0,
        keywordStuffing: data.keywords?.keywordStuffing || false
      },
      structure: {
        headingStructure: data.structure?.headingStructure || { proper: false, issues: [] },
        paragraphLength: data.structure?.paragraphLength || { average: 0, optimal: 0 },
        listUsage: data.structure?.listUsage || { count: 0, effectiveness: 0 },
        imageToTextRatio: data.structure?.imageToTextRatio || 0
      },
      optimization: {
        titleOptimization: data.optimization?.titleOptimization || 0,
        metaOptimization: data.optimization?.metaOptimization || 0,
        contentOptimization: data.optimization?.contentOptimization || 0,
        internalLinking: data.optimization?.internalLinking || 0
      }
    };
  }

  // Feature-specific scoring methods
  private calculateSchemaScore(data: any): number {
    let score = 0;
    
    // Coverage scoring (60%)
    const coverageScore = data.coverage?.coverageScore || 0;
    score += coverageScore * 0.6;
    
    // Validation scoring (40%)
    const validSchemas = data.detections?.filter((d: any) => d.isValid).length || 0;
    const totalSchemas = data.detections?.length || 1;
    score += (validSchemas / totalSchemas) * 40;
    
    return Math.min(100, Math.round(score));
  }

  private calculateAccessibilityScore(data: any): number {
    let score = 0;
    
    // WCAG compliance level
    const level = data.compliance?.level || 'none';
    switch (level) {
      case 'AAA': score += 40; break;
      case 'AA': score += 30; break;
      case 'A': score += 20; break;
      default: score += 0;
    }
    
    // Features scoring
    const features = data.features || {};
    score += (features.altText?.score || 0) * 0.15;
    score += (features.colorContrast?.score || 0) * 0.15;
    score += (features.keyboardNav?.score || 0) * 0.15;
    score += (features.landmarks?.score || 0) * 0.15;
    
    return Math.min(100, Math.round(score));
  }

  private calculateBacklinksScore(data: any): number {
    let score = 0;
    
    // Domain authority (40%)
    score += (data.profile?.domainRating || 0) * 0.4;
    
    // Quality distribution (60%)
    const quality = data.quality || {};
    const totalBacklinks = data.profile?.totalBacklinks || 1;
    
    const highQualityRatio = (quality.highQuality?.count || 0) / totalBacklinks;
    const toxicRatio = (quality.toxic?.count || 0) / totalBacklinks;
    
    score += highQualityRatio * 40;
    score -= toxicRatio * 20;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private calculateDuplicateContentScore(data: any): number {
    const summary = data.summary || {};
    const totalPages = summary.uniquePages + summary.duplicatePages + summary.similarPages || 1;
    
    const uniqueRatio = summary.uniquePages / totalPages;
    return Math.round(uniqueRatio * 100);
  }

  private calculateMultiLanguageScore(data: any): number {
    let score = 0;
    
    // Implementation scoring (50%)
    score += (data.implementation?.implementationScore || 0) * 0.5;
    
    // Hreflang accuracy (30%)
    const hreflang = data.hreflang || {};
    const hreflangAccuracy = hreflang.totalImplementations > 0 ? 
      (hreflang.validImplementations / hreflang.totalImplementations) * 30 : 0;
    score += hreflangAccuracy;
    
    // Localization quality (20%)
    const localization = data.localization || {};
    const avgLocalization = (
      (localization.languageSpecificContent || 0) +
      (localization.translationQuality || 0) +
      (localization.culturalAdaptation || 0)
    ) / 3;
    score += (avgLocalization / 100) * 20;
    
    return Math.min(100, Math.round(score));
  }

  private calculateLinkCheckerScore(data: any): number {
    const summary = data.summary || {};
    const totalLinks = summary.totalLinks || 1;
    const workingLinks = summary.workingLinks || 0;
    
    return Math.round((workingLinks / totalLinks) * 100);
  }

  private calculateRankTrackerScore(data: any): number {
    const summary = data.summary || {};
    const averagePosition = summary.averagePosition || 100;
    
    // Convert position to score (position 1 = 100, position 100+ = 0)
    return Math.max(0, Math.round(100 - averagePosition));
  }

  private calculateSecurityScore(data: any): number {
    return data.securityScore || 0;
  }

  private calculatePerformanceScore(data: any): number {
    const vitals = data.coreWebVitals || {};
    let score = 0;
    
    // LCP scoring
    const lcpValue = vitals.lcp?.value || 10;
    if (lcpValue <= 2.5) score += 35;
    else if (lcpValue <= 4.0) score += 20;
    else score += 5;
    
    // FID scoring
    const fidValue = vitals.fid?.value || 1000;
    if (fidValue <= 100) score += 35;
    else if (fidValue <= 300) score += 20;
    else score += 5;
    
    // CLS scoring
    const clsValue = vitals.cls?.value || 1;
    if (clsValue <= 0.1) score += 30;
    else if (clsValue <= 0.25) score += 15;
    else score += 5;
    
    return Math.min(100, score);
  }

  private calculateContentScore(data: any): number {
    let score = 0;
    
    // Quality metrics (40%)
    score += (data.quality?.readabilityScore || 0) * 0.25;
    if (data.quality?.wordCount >= 300) score += 15;
    
    // Structure (30%)
    if (data.structure?.headingStructure?.proper) score += 15;
    score += Math.min(15, (data.structure?.listUsage?.effectiveness || 0));
    
    // Optimization (30%)
    const avgOptimization = (
      (data.optimization?.titleOptimization || 0) +
      (data.optimization?.metaOptimization || 0) +
      (data.optimization?.contentOptimization || 0)
    ) / 3;
    score += (avgOptimization / 100) * 30;
    
    return Math.min(100, Math.round(score));
  }

  /**
   * Process feature-specific recommendations
   */
  private processFeatureRecommendations(
    feature: FeatureScanType, 
    recommendations: any[]
  ): FeatureScanResult['recommendations'] {
    return recommendations.map((rec, index) => ({
      id: rec.id || `${feature}_rec_${index}`,
      priority: rec.priority || 'medium',
      category: rec.category || feature,
      title: rec.title || 'Optimization Opportunity',
      description: rec.description || '',
      impact: rec.impact || '',
      implementation: {
        difficulty: rec.implementation?.difficulty || 'medium',
        timeEstimate: rec.implementation?.timeEstimate || '',
        steps: rec.implementation?.steps || [],
        codeExample: rec.implementation?.codeExample
      },
      successCriteria: rec.successCriteria || [],
      expectedImprovement: rec.expectedImprovement || ''
    }));
  }

  /**
   * Process diagnostic information
   */
  private processDiagnostics(diagnostics: any) {
    return {
      execution: {
        startTime: diagnostics.execution?.startTime || '',
        endTime: diagnostics.execution?.endTime || '',
        duration: diagnostics.execution?.duration || 0,
        retries: diagnostics.execution?.retries || 0,
        errors: diagnostics.execution?.errors || []
      },
      featureSpecific: diagnostics.featureSpecific || {},
      performance: {
        apiCalls: diagnostics.performance?.apiCalls || 0,
        dataProcessed: diagnostics.performance?.dataProcessed || 0,
        memoryUsage: diagnostics.performance?.memoryUsage || 0,
        cpuTime: diagnostics.performance?.cpuTime || 0
      }
    };
  }

  /**
   * Process progress data for feature scans
   */
  private processProgressData(progressData: any): FeatureScanProgress {
    return {
      scanId: progressData.scanId,
      feature: progressData.feature,
      phase: progressData.phase || 'initializing',
      progress: progressData.progress || 0,
      currentOperation: progressData.currentOperation || '',
      estimatedTimeRemaining: progressData.estimatedTimeRemaining,
      details: progressData.details
    };
  }

  /**
   * Get list of checks performed for a feature
   */
  private getChecksPerformed(feature: FeatureScanType, data: any): string[] {
    const baseChecks = [`${feature}-analysis`];
    
    switch (feature) {
      case 'accessibility':
        return [...baseChecks, 'wcag-compliance', 'color-contrast', 'keyboard-navigation'];
      case 'schema':
        return [...baseChecks, 'schema-detection', 'validation', 'coverage-analysis'];
      case 'performance':
        return [...baseChecks, 'core-web-vitals', 'resource-analysis', 'optimization-opportunities'];
      default:
        return baseChecks;
    }
  }

  /**
   * Count issues found in feature analysis
   */
  private countIssuesFound(feature: FeatureScanType, data: any): number {
    if (!data) return 0;
    
    switch (feature) {
      case 'accessibility':
        return (data.compliance?.violations?.length || 0);
      case 'link-checker':
        return (data.summary?.brokenLinks || 0);
      case 'duplicate-content':
        return (data.summary?.duplicatePages || 0) + (data.summary?.similarPages || 0);
      case 'security-headers':
        return data.headers ? Object.values(data.headers).filter((h: any) => !h.present).length : 0;
      default:
        return data.issuesFound || 0;
    }
  }

  /**
   * Generate unique scan ID for feature scans
   */
  private generateScanId(feature: FeatureScanType): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${feature}_${timestamp}_${random}`;
  }

  /**
   * Make HTTP request with feature-specific error handling
   */
  private async makeApiRequest(endpoint: string, options: any) {
    const config = {
      url: `${this.baseURL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        'X-Scan-Mode': 'feature'
      },
      ...options
    };

    return await axios(config);
  }

  /**
   * Create standardized FeatureScanError
   */
  private createScanError(
    code: string,
    message: string,
    category: FeatureScanError['category'],
    resolution?: string,
    details?: any
  ): FeatureScanError {
    return {
      code,
      message,
      category,
      resolution,
      details
    };
  }

  /**
   * Handle and normalize API errors with feature context
   */
  private handleApiError(error: any, feature: FeatureScanType | string): FeatureScanError {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 400) {
        return this.createScanError(
          'INVALID_REQUEST',
          data?.message || `Invalid ${feature} scan request parameters`,
          'validation'
        );
      } else if (status === 401) {
        return this.createScanError(
          'UNAUTHORIZED',
          `Authentication required for ${feature} analysis`,
          'server'
        );
      } else if (status === 404) {
        return this.createScanError(
          'FEATURE_NOT_FOUND',
          `${feature} analysis feature is not available`,
          'feature'
        );
      } else if (status === 429) {
        return this.createScanError(
          'RATE_LIMIT',
          `${feature} analysis rate limit exceeded`,
          'server',
          'Wait before retrying this feature'
        );
      } else if (status >= 500) {
        return this.createScanError(
          'SERVER_ERROR',
          `${feature} analysis service temporarily unavailable`,
          'server',
          'Try again in a few moments'
        );
      }
    } else if (error.request) {
      return this.createScanError(
        'NETWORK_ERROR',
        `Unable to connect to ${feature} analysis service`,
        'network',
        'Check your internet connection'
      );
    }

    return this.createScanError(
      'UNKNOWN_ERROR',
      error.message || `An unexpected error occurred during ${feature} analysis`,
      'unknown',
      'Please contact support if the issue persists'
    );
  }
}

// Export singleton instance
export const featureScanService = new FeatureScanService();

/**
 * Public API Functions
 * Clean interface for consuming components
 */

/**
 * Execute a focused feature-specific scan
 * 
 * @param url - Website URL to analyze
 * @param feature - Specific feature to analyze
 * @param config - Optional feature configuration
 * @returns Promise resolving to feature-specific results
 */
export async function executeFeatureScan(
  url: string,
  feature: FeatureScanType,
  config: Partial<FeatureScanConfig> = {}
): Promise<FeatureScanResult> {
  return featureScanService.executeScan({
    url,
    feature,
    config,
    includeDiagnostics: false
  });
}

/**
 * Execute multiple features simultaneously
 * 
 * @param url - Website URL to analyze
 * @param features - Array of features to analyze
 * @param config - Shared configuration for all features
 * @returns Promise resolving to map of feature results
 */
export async function executeMultipleFeatureScans(
  url: string,
  features: FeatureScanType[],
  config: Partial<FeatureScanConfig> = {}
): Promise<Map<FeatureScanType, FeatureScanResult | FeatureScanError>> {
  return featureScanService.executeMultipleScans(url, features, config);
}

/**
 * Monitor feature scan progress
 * 
 * @param scanId - Scan identifier to monitor
 * @returns Promise resolving to current progress
 */
export async function getFeatureScanProgress(scanId: string): Promise<FeatureScanProgress> {
  return featureScanService.getScanProgress(scanId);
}

/**
 * Get configuration options for a specific feature
 * 
 * @param feature - Feature to get configuration for
 * @returns Promise resolving to feature configuration
 */
export async function getFeatureConfiguration(feature: FeatureScanType): Promise<FeatureScanConfig> {
  return featureScanService.getFeatureConfiguration(feature);
}

/**
 * Cancel running feature scan
 * 
 * @param scanId - Scan identifier to cancel
 * @returns Promise resolving when cancelled
 */
export async function cancelFeatureScan(scanId: string): Promise<void> {
  return featureScanService.cancelScan(scanId);
}

/**
 * Get historical feature scan results
 * 
 * @param filters - Optional filtering criteria
 * @returns Promise resolving to filtered scan history
 */
export async function getFeatureScanHistory(filters: {
  feature?: FeatureScanType;
  url?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
} = {}): Promise<FeatureScanResult[]> {
  return featureScanService.getFeatureScanHistory(filters);
}

export default featureScanService;