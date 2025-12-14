/**
 * Feature Scan Mode Types
 * 
 * Purpose: Individual feature-specific SEO analysis with deep focus.
 * Use Case: Targeted optimization, specific issue investigation, iterative testing.
 * Features: Single-service deep dive, rapid feedback, specialized analysis.
 */

export type FeatureScanType = 
  | 'schema'
  | 'accessibility'
  | 'backlinks'
  | 'duplicate-content'
  | 'multi-language'
  | 'link-checker'
  | 'rank-tracker'
  | 'security-headers'
  | 'performance'
  | 'content-analysis';

export interface FeatureScanOptions {
  /** Target URL to analyze */
  url: string;
  /** Specific feature to analyze */
  feature: FeatureScanType;
  /** Feature-specific configuration */
  config?: FeatureScanConfig;
  /** Scan timeout in milliseconds */
  timeout?: number;
  /** Include detailed diagnostics */
  includeDiagnostics?: boolean;
}

export interface FeatureScanConfig {
  /** Schema-specific options */
  schema?: {
    validateAgainstGoogle: boolean;
    includeRecommendations: boolean;
    checkImplementation: boolean;
  };
  
  /** Accessibility-specific options */
  accessibility?: {
    wcagLevel: 'A' | 'AA' | 'AAA';
    includeColorContrast: boolean;
    checkKeyboardNav: boolean;
    testScreenReaders: boolean;
  };
  
  /** Backlinks-specific options */
  backlinks?: {
    includeToxicAnalysis: boolean;
    checkDomainAuthority: boolean;
    analyzeAnchorText: boolean;
    maxBacklinks: number;
  };
  
  /** Duplicate content-specific options */
  duplicateContent?: {
    checkInternal: boolean;
    checkExternal: boolean;
    similarityThreshold: number;
    maxPagesToCheck: number;
  };
  
  /** Multi-language-specific options */
  multiLanguage?: {
    validateHreflang: boolean;
    checkLanguageDeclaration: boolean;
    analyzeContentLocalization: boolean;
  };
  
  /** Link checker-specific options */
  linkChecker?: {
    checkInternal: boolean;
    checkExternal: boolean;
    followRedirects: boolean;
    maxLinksToCheck: number;
  };
  
  /** Rank tracker-specific options */
  rankTracker?: {
    keywords: string[];
    searchEngine: 'google' | 'bing' | 'yahoo';
    location: string;
    language: string;
  };
  
  /** Security headers-specific options */
  securityHeaders?: {
    checkCSP: boolean;
    checkHSTS: boolean;
    checkXFrameOptions: boolean;
    includeRecommendations: boolean;
  };
  
  /** Performance-specific options */
  performance?: {
    includeWebVitals: boolean;
    analyzeMobile: boolean;
    checkResourceOptimization: boolean;
    auditType: 'desktop' | 'mobile' | 'both';
  };
  
  /** Content analysis-specific options */
  contentAnalysis?: {
    checkReadability: boolean;
    analyzeKeywords: boolean;
    checkStructure: boolean;
    includeRecommendations: boolean;
  };
}

export interface FeatureScanResult {
  /** Scan metadata */
  scanId: string;
  url: string;
  feature: FeatureScanType;
  timestamp: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  
  /** Feature-specific results */
  data: FeatureScanData;
  
  /** Feature score (0-100) */
  score: number;
  
  /** Feature-specific recommendations */
  recommendations: FeatureRecommendation[];
  
  /** Diagnostic information */
  diagnostics?: FeatureDiagnostics;
  
  /** Execution metadata */
  metadata: {
    duration: number;
    checksPerformed: string[];
    issuesFound: number;
  };
}

export type FeatureScanData = 
  | SchemaFeatureData
  | AccessibilityFeatureData
  | BacklinksFeatureData
  | DuplicateContentFeatureData
  | MultiLanguageFeatureData
  | LinkCheckerFeatureData
  | RankTrackerFeatureData
  | SecurityHeadersFeatureData
  | PerformanceFeatureData
  | ContentAnalysisFeatureData;

export interface SchemaFeatureData {
  /** Detected schema types */
  detections: Array<{
    type: string;
    format: 'json-ld' | 'microdata' | 'rdfa';
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>;
  
  /** Schema coverage analysis */
  coverage: {
    recommended: string[];
    implemented: string[];
    missing: string[];
    coverageScore: number;
  };
  
  /** Validation results */
  validation: {
    googleValid: boolean;
    structuredDataErrors: number;
    implementationIssues: string[];
  };
}

export interface AccessibilityFeatureData {
  /** WCAG compliance results */
  compliance: {
    level: 'A' | 'AA' | 'AAA' | 'none';
    violations: Array<{
      rule: string;
      impact: 'critical' | 'serious' | 'moderate' | 'minor';
      description: string;
      elements: number;
      helpUrl: string;
    }>;
    passedRules: number;
    totalRules: number;
  };
  
  /** Accessibility features analysis */
  features: {
    altText: { score: number; missing: number; total: number; };
    colorContrast: { score: number; failures: number; total: number; };
    keyboardNav: { score: number; issues: string[]; };
    landmarks: { score: number; present: string[]; missing: string[]; };
  };
}

export interface BacklinksFeatureData {
  /** Backlink profile overview */
  profile: {
    totalBacklinks: number;
    uniqueDomains: number;
    domainRating: number;
    urlRating: number;
  };
  
  /** Quality analysis */
  quality: {
    highQuality: { count: number; percentage: number; };
    mediumQuality: { count: number; percentage: number; };
    lowQuality: { count: number; percentage: number; };
    toxic: { count: number; percentage: number; };
  };
  
  /** Recent backlinks */
  recentBacklinks: Array<{
    sourceUrl: string;
    targetUrl: string;
    anchorText: string;
    domainRating: number;
    firstSeen: string;
    linkType: 'dofollow' | 'nofollow';
    quality: 'high' | 'medium' | 'low' | 'toxic';
  }>;
}

export interface DuplicateContentFeatureData {
  /** Content duplication summary */
  summary: {
    duplicatePages: number;
    similarPages: number;
    uniquePages: number;
    overallSimilarity: number;
  };
  
  /** Internal duplicates */
  internal: Array<{
    page1: string;
    page2: string;
    similarity: number;
    type: 'exact' | 'near-exact' | 'similar';
    conflictingElements: string[];
  }>;
  
  /** External duplicates */
  external: Array<{
    internalPage: string;
    externalSource: string;
    similarity: number;
    discoveredDate: string;
  }>;
}

export interface MultiLanguageFeatureData {
  /** Language implementation overview */
  implementation: {
    detectedLanguages: string[];
    hasHreflang: boolean;
    hasLanguageDeclaration: boolean;
    implementationScore: number;
  };
  
  /** Hreflang analysis */
  hreflang: {
    totalImplementations: number;
    validImplementations: number;
    errors: Array<{
      page: string;
      issue: string;
      severity: 'error' | 'warning';
    }>;
    missingAlternatives: string[];
  };
  
  /** Content localization */
  localization: {
    languageSpecificContent: number;
    translationQuality: number;
    culturalAdaptation: number;
  };
}

export interface LinkCheckerFeatureData {
  /** Link analysis summary */
  summary: {
    totalLinks: number;
    workingLinks: number;
    brokenLinks: number;
    redirectLinks: number;
    warningLinks: number;
  };
  
  /** Broken links details */
  brokenLinks: Array<{
    url: string;
    sourcePage: string;
    statusCode: number;
    errorType: string;
    linkText: string;
    linkType: 'internal' | 'external';
  }>;
  
  /** Redirect chains */
  redirectChains: Array<{
    originalUrl: string;
    finalUrl: string;
    redirectCount: number;
    chain: string[];
    isProblematic: boolean;
  }>;
}

export interface RankTrackerFeatureData {
  /** Current rankings */
  rankings: Array<{
    keyword: string;
    position: number | null;
    searchEngine: string;
    location: string;
    url: string;
    searchVolume?: number;
    difficulty?: number;
  }>;
  
  /** Ranking summary */
  summary: {
    totalKeywords: number;
    averagePosition: number;
    topRankings: number; // Top 10
    improvementOpportunities: number;
  };
  
  /** Competitor analysis */
  competitors?: Array<{
    domain: string;
    averagePosition: number;
    keywordsRanking: number;
    visibilityScore: number;
  }>;
}

export interface SecurityHeadersFeatureData {
  /** Security headers analysis */
  headers: {
    contentSecurityPolicy: {
      present: boolean;
      value?: string;
      issues: string[];
      score: number;
    };
    strictTransportSecurity: {
      present: boolean;
      maxAge?: number;
      includeSubDomains: boolean;
      preload: boolean;
      score: number;
    };
    xFrameOptions: {
      present: boolean;
      value?: string;
      isSecure: boolean;
      score: number;
    };
    xContentTypeOptions: {
      present: boolean;
      isNosniff: boolean;
      score: number;
    };
  };
  
  /** Overall security score */
  securityScore: number;
  
  /** Security recommendations */
  recommendations: Array<{
    header: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
    implementation: string;
  }>;
}

export interface PerformanceFeatureData {
  /** Core Web Vitals */
  coreWebVitals: {
    lcp: { value: number; rating: 'good' | 'needs-improvement' | 'poor'; };
    fid: { value: number; rating: 'good' | 'needs-improvement' | 'poor'; };
    cls: { value: number; rating: 'good' | 'needs-improvement' | 'poor'; };
  };
  
  /** Performance metrics */
  metrics: {
    firstContentfulPaint: number;
    timeToInteractive: number;
    speedIndex: number;
    totalBlockingTime: number;
  };
  
  /** Optimization opportunities */
  opportunities: Array<{
    category: string;
    title: string;
    description: string;
    potentialSavings: number;
    priority: 'high' | 'medium' | 'low';
  }>;
  
  /** Resource analysis */
  resources: {
    totalSize: number;
    images: { size: number; optimizable: number; };
    css: { size: number; unused: number; };
    javascript: { size: number; unused: number; };
  };
}

export interface ContentAnalysisFeatureData {
  /** Content quality metrics */
  quality: {
    wordCount: number;
    readabilityScore: number;
    readingLevel: string;
    sentenceComplexity: number;
  };
  
  /** Keyword analysis */
  keywords: {
    density: Record<string, number>;
    prominence: Record<string, number>;
    naturalness: number;
    keywordStuffing: boolean;
  };
  
  /** Content structure */
  structure: {
    headingStructure: { proper: boolean; issues: string[]; };
    paragraphLength: { average: number; optimal: number; };
    listUsage: { count: number; effectiveness: number; };
    imageToTextRatio: number;
  };
  
  /** Content optimization */
  optimization: {
    titleOptimization: number;
    metaOptimization: number;
    contentOptimization: number;
    internalLinking: number;
  };
}

export interface FeatureRecommendation {
  /** Recommendation metadata */
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  
  /** Recommendation content */
  title: string;
  description: string;
  impact: string;
  
  /** Implementation details */
  implementation: {
    difficulty: 'easy' | 'medium' | 'hard';
    timeEstimate: string;
    steps: string[];
    codeExample?: string;
  };
  
  /** Success measurement */
  successCriteria: string[];
  expectedImprovement: string;
}

export interface FeatureDiagnostics {
  /** Execution diagnostics */
  execution: {
    startTime: string;
    endTime: string;
    duration: number;
    retries: number;
    errors: string[];
  };
  
  /** Feature-specific diagnostics */
  featureSpecific: Record<string, any>;
  
  /** Performance metrics */
  performance: {
    apiCalls: number;
    dataProcessed: number;
    memoryUsage: number;
    cpuTime: number;
  };
}

export interface FeatureScanProgress {
  /** Progress metadata */
  scanId: string;
  feature: FeatureScanType;
  phase: 'initializing' | 'analyzing' | 'processing' | 'completed';
  progress: number;
  
  /** Current operation */
  currentOperation: string;
  estimatedTimeRemaining?: number;
  
  /** Feature-specific progress details */
  details?: Record<string, any>;
}

/**
 * Feature Scan Configuration
 * Defines available features and their capabilities
 */
export const FEATURE_SCAN_CONFIG = {
  /** Available features for scanning */
  AVAILABLE_FEATURES: [
    'schema',
    'accessibility',
    'backlinks',
    'duplicate-content',
    'multi-language',
    'link-checker',
    'rank-tracker',
    'security-headers',
    'performance',
    'content-analysis'
  ] as const,
  
  /** Default timeouts per feature (milliseconds) */
  FEATURE_TIMEOUTS: {
    'schema': 30000,
    'accessibility': 60000,
    'backlinks': 120000,
    'duplicate-content': 90000,
    'multi-language': 45000,
    'link-checker': 60000,
    'rank-tracker': 180000,
    'security-headers': 15000,
    'performance': 90000,
    'content-analysis': 75000
  },
  
  /** Feature complexity levels */
  COMPLEXITY_LEVELS: {
    'schema': 'medium',
    'accessibility': 'high',
    'backlinks': 'high',
    'duplicate-content': 'medium',
    'multi-language': 'medium',
    'link-checker': 'low',
    'rank-tracker': 'high',
    'security-headers': 'low',
    'performance': 'high',
    'content-analysis': 'medium'
  } as const,
  
  /** Feature dependencies */
  DEPENDENCIES: {
    'schema': [],
    'accessibility': [],
    'backlinks': [],
    'duplicate-content': ['content-analysis'],
    'multi-language': [],
    'link-checker': [],
    'rank-tracker': [],
    'security-headers': [],
    'performance': [],
    'content-analysis': []
  } as const
} as const;

export type FeatureScanComplexity = typeof FEATURE_SCAN_CONFIG.COMPLEXITY_LEVELS[keyof typeof FEATURE_SCAN_CONFIG.COMPLEXITY_LEVELS];