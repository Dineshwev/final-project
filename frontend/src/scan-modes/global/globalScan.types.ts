/**
 * Global Scan Mode Types
 * 
 * Purpose: Comprehensive, enterprise-grade SEO analysis covering all aspects.
 * Use Case: Complete SEO audits, competitive analysis, enterprise reporting.
 * Features: All SEO services, deep crawling, advanced analytics, detailed reporting.
 */

export interface GlobalScanOptions {
  /** Target URL to scan */
  url: string;
  /** Maximum pages to crawl (default: 100) */
  maxPages?: number;
  /** Include competitor analysis */
  includeCompetitorAnalysis?: boolean;
  /** Include backlink analysis */
  includeBacklinkAnalysis?: boolean;
  /** Include rank tracking setup */
  includeRankTracking?: boolean;
  /** Include social media analysis */
  includeSocialAnalysis?: boolean;
  /** Include international SEO analysis */
  includeInternationalSeo?: boolean;
  /** Custom crawl depth (default: 3) */
  crawlDepth?: number;
  /** Scan timeout in milliseconds (default: 10 minutes) */
  timeout?: number;
  /** Include PDF and document analysis */
  includeDocuments?: boolean;
  /** Enable advanced schema detection */
  advancedSchema?: boolean;
}

export interface GlobalScanResult {
  /** Unique scan identifier */
  scanId: string;
  /** Target URL that was scanned */
  url: string;
  /** Scan completion timestamp */
  timestamp: string;
  /** Overall scan status */
  status: 'pending' | 'running' | 'completed' | 'failed' | 'partially_completed';
  /** Comprehensive SEO score (0-100) */
  overallScore: number;
  /** Individual service scores */
  serviceScores: {
    onPageSeo: number;
    technicalSeo: number;
    contentQuality: number;
    accessibility: number;
    performance: number;
    backlinks: number;
    socialSignals: number;
    mobileOptimization: number;
  };
  /** Complete scan results from all services */
  results: {
    /** Advanced on-page SEO analysis */
    onPageSeo: GlobalOnPageResult;
    /** Comprehensive technical SEO */
    technicalSeo: GlobalTechnicalResult;
    /** Content quality and optimization */
    contentAnalysis: GlobalContentResult;
    /** Full accessibility audit */
    accessibility: GlobalAccessibilityResult;
    /** Complete performance analysis */
    performance: GlobalPerformanceResult;
    /** Backlink profile analysis */
    backlinks: GlobalBacklinksResult;
    /** Schema markup validation */
    schema: GlobalSchemaResult;
    /** Duplicate content detection */
    duplicateContent: GlobalDuplicateContentResult;
    /** Multi-language SEO analysis */
    multiLanguage: GlobalMultiLanguageResult;
    /** Social media optimization */
    socialMedia: GlobalSocialMediaResult;
    /** Security headers analysis */
    security: GlobalSecurityResult;
  };
  /** Comprehensive recommendations */
  recommendations: GlobalRecommendation[];
  /** Detailed scan metadata */
  metadata: {
    scanDuration: number;
    pagesAnalyzed: number;
    servicesExecuted: number;
    totalIssuesFound: number;
    crawlStatistics: GlobalCrawlStats;
  };
}

export interface GlobalOnPageResult {
  /** Complete title tag analysis */
  titleTags: {
    analyzed: number;
    optimal: number;
    missing: number;
    tooLong: number;
    tooShort: number;
    duplicates: number;
  };
  /** Meta descriptions analysis */
  metaDescriptions: {
    analyzed: number;
    optimal: number;
    missing: number;
    tooLong: number;
    tooShort: number;
    duplicates: number;
  };
  /** Header structure analysis */
  headerStructure: {
    pages: number;
    properStructure: number;
    multipleH1: number;
    missingH1: number;
    headerDistribution: Record<string, number>;
  };
  /** Image optimization analysis */
  imageOptimization: {
    totalImages: number;
    missingAlt: number;
    emptyAlt: number;
    oversized: number;
    unoptimized: number;
    webpUsage: number;
  };
  /** Internal linking analysis */
  internalLinking: {
    totalLinks: number;
    uniquePages: number;
    orphanPages: number;
    deepPages: number;
    linkDepth: Record<number, number>;
  };
}

export interface GlobalTechnicalResult {
  /** SSL and security */
  security: {
    sslValid: boolean;
    httpsRedirect: boolean;
    mixedContent: number;
    securityHeaders: number;
  };
  /** Crawlability analysis */
  crawlability: {
    robotsTxt: boolean;
    sitemapXml: boolean;
    crawlErrors: number;
    blockedResources: number;
    crawlBudgetUtilization: number;
  };
  /** URL structure analysis */
  urlStructure: {
    friendlyUrls: number;
    longUrls: number;
    duplicateUrls: number;
    dynamicUrls: number;
    canonicalIssues: number;
  };
  /** Page speed and Core Web Vitals */
  pageSpeed: {
    averageLCP: number;
    averageFID: number;
    averageCLS: number;
    mobileScore: number;
    desktopScore: number;
  };
}

export interface GlobalContentResult {
  /** Content quality metrics */
  quality: {
    averageWordCount: number;
    readabilityScore: number;
    keywordDensity: Record<string, number>;
    contentDuplication: number;
    thinContentPages: number;
  };
  /** Content structure */
  structure: {
    properlyStructured: number;
    missingHeadings: number;
    longParagraphs: number;
    listUsage: number;
    tableUsage: number;
  };
  /** Content optimization */
  optimization: {
    keywordOptimized: number;
    metaKeywords: number;
    outboundLinks: number;
    authorshipInfo: number;
    datePublished: number;
  };
}

export interface GlobalAccessibilityResult {
  /** WCAG compliance analysis */
  wcagCompliance: {
    levelA: number;
    levelAA: number;
    levelAAA: number;
    totalViolations: number;
    criticalViolations: number;
  };
  /** Accessibility features */
  features: {
    altTextCoverage: number;
    colorContrast: number;
    keyboardNavigation: number;
    screenReaderSupport: number;
    focusManagement: number;
  };
  /** Violation breakdown */
  violations: {
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    byPage: Record<string, number>;
  };
}

export interface GlobalPerformanceResult {
  /** Core Web Vitals detailed analysis */
  coreWebVitals: {
    lcp: { median: number; p75: number; p90: number; };
    fid: { median: number; p75: number; p90: number; };
    cls: { median: number; p75: number; p90: number; };
  };
  /** Performance metrics */
  metrics: {
    firstContentfulPaint: number;
    timeToInteractive: number;
    totalBlockingTime: number;
    speedIndex: number;
    cumulativeLayoutShift: number;
  };
  /** Resource analysis */
  resources: {
    totalSize: number;
    imageOptimization: number;
    cssOptimization: number;
    jsOptimization: number;
    cacheUtilization: number;
  };
}

export interface GlobalBacklinksResult {
  /** Backlink profile overview */
  overview: {
    totalBacklinks: number;
    uniqueDomains: number;
    domainAuthority: number;
    toxicBacklinks: number;
    qualityScore: number;
  };
  /** Link quality analysis */
  quality: {
    highQuality: number;
    mediumQuality: number;
    lowQuality: number;
    toxic: number;
    nofollow: number;
  };
  /** Anchor text analysis */
  anchorText: {
    branded: number;
    exact: number;
    partial: number;
    generic: number;
    naked: number;
  };
}

export interface GlobalSchemaResult {
  /** Schema implementation overview */
  overview: {
    totalSchemas: number;
    validSchemas: number;
    errorSchemas: number;
    warningSchemas: number;
    coverageScore: number;
  };
  /** Schema types detected */
  types: Record<string, {
    count: number;
    valid: number;
    errors: string[];
  }>;
  /** Implementation recommendations */
  recommendations: Array<{
    type: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
  }>;
}

export interface GlobalDuplicateContentResult {
  /** Content duplication overview */
  overview: {
    duplicatePages: number;
    similarContent: number;
    uniqueContent: number;
    duplicationScore: number;
  };
  /** Internal duplication */
  internal: Array<{
    url1: string;
    url2: string;
    similarity: number;
    type: 'exact' | 'near' | 'partial';
  }>;
  /** External duplication */
  external: Array<{
    internalUrl: string;
    externalUrl: string;
    similarity: number;
    source: string;
  }>;
}

export interface GlobalMultiLanguageResult {
  /** International SEO overview */
  overview: {
    languages: string[];
    regions: string[];
    hreflangImplementation: boolean;
    implementationScore: number;
  };
  /** Hreflang analysis */
  hreflang: {
    totalTags: number;
    validTags: number;
    errors: string[];
    missingAlternates: string[];
  };
  /** Language-specific analysis */
  languages: Record<string, {
    pages: number;
    properImplementation: boolean;
    contentLocalization: number;
  }>;
}

export interface GlobalSocialMediaResult {
  /** Social media optimization */
  optimization: {
    openGraphImplementation: number;
    twitterCardsImplementation: number;
    socialShareability: number;
    brandMentions: number;
  };
  /** Social signals */
  signals: {
    facebookShares: number;
    twitterMentions: number;
    linkedinShares: number;
    socialEngagement: number;
  };
}

export interface GlobalSecurityResult {
  /** Security headers analysis */
  headers: {
    contentSecurityPolicy: boolean;
    strictTransportSecurity: boolean;
    xFrameOptions: boolean;
    xContentTypeOptions: boolean;
    securityScore: number;
  };
  /** Security vulnerabilities */
  vulnerabilities: {
    mixedContent: number;
    insecureLinks: number;
    securityIssues: string[];
  };
}

export interface GlobalCrawlStats {
  /** Crawl execution statistics */
  duration: number;
  pagesRequested: number;
  pagesSuccessful: number;
  pagesFailed: number;
  averageResponseTime: number;
  crawlDepthReached: number;
  robotsRespected: boolean;
}

export interface GlobalRecommendation {
  /** Recommendation metadata */
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'technical' | 'on-page' | 'content' | 'accessibility' | 'performance' | 'backlinks';
  
  /** Recommendation details */
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  
  /** Implementation guidance */
  implementation: {
    steps: string[];
    resources: string[];
    timeline: string;
  };
  
  /** Affected elements */
  affectedPages?: string[];
  affectedElements?: string[];
  
  /** Success metrics */
  successMetrics: string[];
}

export interface GlobalScanProgress {
  /** Scan metadata */
  scanId: string;
  phase: 'initializing' | 'crawling' | 'analyzing' | 'processing' | 'generating_report' | 'completed';
  progress: number;
  
  /** Current operation details */
  currentService: string;
  currentOperation: string;
  servicesCompleted: number;
  totalServices: number;
  
  /** Time estimates */
  estimatedTimeRemaining: number;
  elapsedTime: number;
  
  /** Service-specific progress */
  serviceProgress: Record<string, {
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
  }>;
}

/**
 * Global Scan Configuration
 * Defines the comprehensive scope and capabilities
 */
export const GLOBAL_SCAN_CONFIG = {
  /** Default maximum pages to crawl */
  DEFAULT_MAX_PAGES: 100,
  /** Maximum allowed pages to crawl */
  MAX_PAGES_LIMIT: 1000,
  /** Default scan timeout */
  DEFAULT_TIMEOUT: 600000, // 10 minutes
  /** Maximum scan timeout */
  MAX_TIMEOUT: 1800000, // 30 minutes
  /** Default crawl depth */
  DEFAULT_CRAWL_DEPTH: 3,
  /** Maximum crawl depth */
  MAX_CRAWL_DEPTH: 5,
  /** All available services */
  AVAILABLE_SERVICES: [
    'on-page-seo',
    'technical-seo',
    'content-analysis',
    'accessibility',
    'performance',
    'backlinks',
    'schema',
    'duplicate-content',
    'multi-language',
    'social-media',
    'security'
  ] as const,
  /** Service execution order */
  SERVICE_EXECUTION_ORDER: [
    'crawling',
    'technical-seo',
    'on-page-seo',
    'content-analysis',
    'performance',
    'accessibility',
    'schema',
    'duplicate-content',
    'backlinks',
    'multi-language',
    'social-media',
    'security'
  ] as const
} as const;

export type GlobalScanService = typeof GLOBAL_SCAN_CONFIG.AVAILABLE_SERVICES[number];
export type GlobalScanPhase = typeof GLOBAL_SCAN_CONFIG.SERVICE_EXECUTION_ORDER[number];