/**
 * Basic Scan Mode Types
 * 
 * Purpose: Lightweight, fast SEO health check focusing on critical issues only.
 * Use Case: Quick website health assessment, basic SEO audit for new sites.
 * Features: Essential on-page SEO, basic accessibility, core performance metrics.
 */

export type BasicScanType = 'quick' | 'full';

export interface BasicScanConfig {
  scanType?: BasicScanType;

  includeImages?: boolean;
  includeMeta?: boolean;
  includeHeaders?: boolean;
  includeLinks?: boolean;
  includeMobile?: boolean;
  includePerformance?: boolean;

  timeout?: number;
}

export interface NewBasicScanOptions {
  url: string;
  config?: BasicScanConfig;
}

export interface BasicScanCategory {
  name: string;
  score: number;
  issues: number;
}

export interface BasicScanResult {
  score: number;
  categories?: BasicScanCategory[];
}

// Legacy interfaces for backward compatibility
export interface BasicScanOptions {
  /** Target URL to scan */
  url: string;
  /** Include mobile-specific checks */
  includeMobile?: boolean;
  /** Include basic performance metrics */
  includePerformance?: boolean;
  /** Maximum scan timeout in milliseconds */
  timeout?: number;
  /** Scan mode for backend optimization */
  scanMode?: 'basic';
  /** Scan configuration */
  config?: LegacyBasicScanConfig;
  /** Include diagnostic information */
  includeDiagnostics?: boolean;
}

export interface LegacyBasicScanConfig {
  /** Include mobile-specific checks */
  includeMobile?: boolean;
  /** Include basic performance metrics */
  includePerformance?: boolean;
  /** Maximum scan timeout in milliseconds */
  timeout?: number;
}

export interface LegacyBasicScanResult {
  /** Unique scan identifier */
  scanId: string;
  /** Target URL that was scanned */
  url: string;
  /** Scan completion timestamp */
  timestamp: string;
  /** Overall scan status */
  status: 'pending' | 'running' | 'completed' | 'failed';
  /** Basic scan score (0-100) */
  score: number;
  /** Essential SEO health metrics */
  results: {
    /** Basic on-page SEO analysis */
    onPageSeo: BasicOnPageResult;
    /** Core accessibility compliance */
    accessibility: BasicAccessibilityResult;
    /** Essential performance metrics */
    performance: BasicPerformanceResult;
    /** Critical technical issues */
    technicalSeo: BasicTechnicalResult;
  };
  /** High-priority recommendations only */
  recommendations: BasicRecommendation[];
  /** Scan execution metadata */
  metadata: {
    scanDuration: number;
    checksPerformed: number;
    criticalIssuesFound: number;
  };
}

export interface BasicOnPageResult {
  /** Page title analysis */
  title: {
    present: boolean;
    length: number;
    isOptimal: boolean;
  };
  /** Meta description analysis */
  metaDescription: {
    present: boolean;
    length: number;
    isOptimal: boolean;
  };
  /** Header structure (H1-H3 only) */
  headers: {
    h1Count: number;
    h2Count: number;
    h3Count: number;
    hasProperStructure: boolean;
  };
  /** Image optimization basics */
  images: {
    total: number;
    missingAlt: number;
    altOptimizationScore: number;
  };
}

export interface BasicAccessibilityResult {
  /** WCAG compliance level achieved */
  complianceLevel: 'none' | 'A' | 'AA' | 'AAA';
  /** Critical accessibility violations */
  criticalViolations: number;
  /** Color contrast issues */
  colorContrastIssues: number;
  /** Keyboard navigation support */
  keyboardAccessible: boolean;
  /** Screen reader compatibility */
  screenReaderFriendly: boolean;
}

export interface BasicPerformanceResult {
  /** Core Web Vitals */
  coreWebVitals: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay  
    cls: number; // Cumulative Layout Shift
  };
  /** Page load speed category */
  loadSpeed: 'fast' | 'average' | 'slow';
  /** Mobile performance score */
  mobileScore: number;
  /** Desktop performance score */
  desktopScore: number;
}

export interface BasicTechnicalResult {
  /** SSL certificate status */
  sslStatus: 'valid' | 'invalid' | 'missing';
  /** Mobile responsiveness */
  mobileResponsive: boolean;
  /** Robots.txt accessibility */
  robotsTxtValid: boolean;
  /** Sitemap presence and validity */
  sitemapValid: boolean;
  /** Critical crawl errors */
  crawlErrors: number;
}

export interface BasicRecommendation {
  /** Issue priority level */
  priority: 'critical' | 'high' | 'medium';
  /** Issue category */
  category: 'on-page' | 'accessibility' | 'performance' | 'technical';
  /** Brief issue description */
  title: string;
  /** Actionable fix description */
  description: string;
  /** Estimated impact on SEO */
  impact: 'high' | 'medium' | 'low';
  /** Expected improvement description */
  expectedImprovement: string;
}

export interface BasicScanProgress {
  /** Scan identifier */
  scanId: string;
  /** Current scan phase */
  phase: 'initializing' | 'crawling' | 'analyzing' | 'generating_report' | 'completed';
  /** Progress percentage (0-100) */
  progress: number;
  /** Current operation description */
  currentOperation: string;
  /** Estimated time remaining in seconds */
  estimatedTimeRemaining?: number;
}

export interface BasicScanError {
  /** Error code identifier */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Error category */
  category: 'validation' | 'network' | 'timeout' | 'server' | 'unknown';
  /** Suggested resolution steps */
  resolution?: string;
  /** Technical error details for debugging */
  details?: any;
}

/**
 * Basic Scan Configuration
 * Defines the scope and limitations of basic scans
 */
export const BASIC_SCAN_CONFIG = {
  /** Maximum pages to crawl */
  MAX_PAGES: 5,
  /** Scan timeout in milliseconds */
  TIMEOUT: 60000, // 1 minute
  /** Maximum concurrent checks */
  MAX_CONCURRENT: 3,
  /** 🔥 Quick polling limits for basic scans */
  MAX_POLL_ATTEMPTS: 5, // Stop after 5 attempts
  POLL_INTERVAL: 2000, // Poll every 2 seconds
  /** Supported content types */
  SUPPORTED_CONTENT_TYPES: ['text/html', 'application/xhtml+xml'],
  /** Core checks performed */
  CORE_CHECKS: [
    'title-presence',
    'meta-description',
    'h1-structure',
    'image-alt-text',
    'ssl-certificate',
    'mobile-responsive'
  ] as const
} as const;

export type BasicScanCheck = typeof BASIC_SCAN_CONFIG.CORE_CHECKS[number];