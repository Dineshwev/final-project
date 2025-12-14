/**
 * Scan Modes Index
 * 
 * Clean exports for all scan mode components, services, and types.
 * This provides a single import point for the entire scan modes architecture.
 */

// Basic Scan Mode Exports
export { default as BasicScanContainer } from './basic/BasicScanContainer';

// Global Scan Mode Exports (isolated)
export { default as GlobalScanContainer } from './global/GlobalScanContainer';
export type {
  BasicScanOptions,
  BasicScanResult,
  BasicScanProgress,
  BasicScanType,
  BasicScanConfig,
  BasicScanCategory
} from './basic/basicScan.types';

export {
  executeBasicScan,
  getBasicScanProgress,
  cancelBasicScan,
  getBasicScanConfiguration,
  getBasicScanHistory,
  basicScanService
} from './basic/basicScan.service';

// Global Scan Mode Exports
export { default as GlobalScanContainer } from './global/GlobalScanContainer';
export type {
  GlobalScanOptions,
  GlobalScanResult,
  GlobalScanProgress,
  GlobalScanMode,
  GlobalScanConfig,
  GlobalScanService,
  GlobalScanInsights
} from './global/globalScan.types';

// Global scan functions are NOT exported - GlobalScanContainer is fully isolated
// No external components can trigger global scans

// Feature Scan Mode Exports
export { default as FeatureScanContainer } from './feature/FeatureScanContainer';
export type {
  FeatureScanOptions,
  FeatureScanResult,
  FeatureScanProgress,
  FeatureScanType,
  FeatureScanConfig,
  FeatureScanRecommendation
} from './feature/featureScan.types';

export {
  executeFeatureScan,
  executeMultipleFeatureScans,
  getFeatureScanProgress,
  cancelFeatureScan,
  getFeatureConfiguration,
  getFeatureScanHistory,
  featureScanService
} from './feature/featureScan.service';

// Configuration Constants
export { BASIC_SCAN_CONFIG } from './basic/basicScan.types';
export { GLOBAL_SCAN_CONFIG } from './global/globalScan.types';
export { FEATURE_SCAN_CONFIG } from './feature/featureScan.types';

/**
 * Unified Scan Mode Types
 * 
 * Common interfaces for working with all scan modes
 */

export type ScanMode = 'basic' | 'global' | 'feature';

export interface ScanModeOption {
  mode: ScanMode;
  name: string;
  description: string;
  estimatedTime: string;
  features: string[];
  recommended: boolean;
}

export interface UnifiedScanResult {
  mode: ScanMode;
  scanId: string;
  url: string;
  timestamp: string;
  status: 'completed' | 'failed' | 'cancelled';
  score: number;
  summary: string;
  recommendations: any[];
  data: any;
}

/**
 * Scan Mode Configurations
 * 
 * Pre-defined configurations for common use cases
 */
export const SCAN_MODE_OPTIONS: ScanModeOption[] = [
  {
    mode: 'basic',
    name: 'Basic Health Check',
    description: 'Quick 30-second analysis of essential SEO fundamentals',
    estimatedTime: '30 seconds',
    features: ['Technical SEO', 'Content Quality', 'User Experience'],
    recommended: true
  },
  {
    mode: 'global',
    name: 'Comprehensive Analysis',
    description: 'Complete 360-degree SEO analysis across all services',
    estimatedTime: '5-10 minutes',
    features: ['Technical', 'Content', 'Performance', 'Security', 'Accessibility', 'Mobile', 'Analytics'],
    recommended: false
  },
  {
    mode: 'feature',
    name: 'Feature-Specific Analysis',
    description: 'Focused deep-dive analysis of specific SEO features',
    estimatedTime: '1-3 minutes',
    features: ['Single Feature', 'Multiple Features', 'Custom Configuration'],
    recommended: false
  }
];

/**
 * Utility Functions
 * 
 * Helper functions for working with scan modes
 */

/**
 * Get scan mode configuration
 */
export function getScanModeConfig(mode: ScanMode): ScanModeOption | undefined {
  return SCAN_MODE_OPTIONS.find(option => option.mode === mode);
}

/**
 * Validate scan mode
 */
export function isValidScanMode(mode: string): mode is ScanMode {
  return ['basic', 'global', 'feature'].includes(mode);
}

/**
 * Get recommended scan mode for use case
 */
export function getRecommendedScanMode(useCase: 'quick-check' | 'comprehensive' | 'specific-feature'): ScanMode {
  switch (useCase) {
    case 'quick-check':
      return 'basic';
    case 'comprehensive':
      return 'global';
    case 'specific-feature':
      return 'feature';
    default:
      return 'basic';
  }
}

/**
 * Convert unified result to scan-specific format
 */
export function convertToUnifiedResult(result: BasicScanResult | GlobalScanResult | FeatureScanResult): UnifiedScanResult {
  const baseResult = {
    scanId: result.scanId,
    url: result.url,
    timestamp: result.timestamp,
    status: result.status,
    data: result
  };

  // Handle different scan result types
  if ('score' in result && 'overall' in result.score) {
    // Basic scan result
    return {
      ...baseResult,
      mode: 'basic' as const,
      score: result.score.overall,
      summary: `Basic SEO analysis completed with ${result.score.overall}/100 score`,
      recommendations: result.recommendations || []
    };
  } else if ('overallScore' in result) {
    // Global scan result
    return {
      ...baseResult,
      mode: 'global' as const,
      score: result.overallScore.total,
      summary: `Global SEO analysis completed with ${result.overallScore.total}/100 score across ${Object.keys(result.services).length} services`,
      recommendations: result.recommendations || []
    };
  } else if ('score' in result && typeof result.score === 'number') {
    // Feature scan result
    return {
      ...baseResult,
      mode: 'feature' as const,
      score: result.score,
      summary: `${result.feature} analysis completed with ${result.score}/100 score`,
      recommendations: result.recommendations || []
    };
  }

  // Fallback
  return {
    ...baseResult,
    mode: 'basic' as const,
    score: 0,
    summary: 'Scan completed',
    recommendations: []
  };
}

/**
 * Scan Mode Factory
 * 
 * Factory function to create scan mode instances
 */
export interface ScanModeFactory {
  createBasicScan: () => typeof BasicScanContainer;
  createGlobalScan: () => typeof GlobalScanContainer;
  createFeatureScan: () => typeof FeatureScanContainer;
  createScanMode: (mode: ScanMode) => React.ComponentType<any>;
}

export const scanModeFactory: ScanModeFactory = {
  createBasicScan: () => BasicScanContainer,
  createGlobalScan: () => GlobalScanContainer,
  createFeatureScan: () => FeatureScanContainer,
  
  createScanMode: (mode: ScanMode) => {
    switch (mode) {
      case 'basic':
        return BasicScanContainer;
      case 'global':
        return GlobalScanContainer;
      case 'feature':
        return FeatureScanContainer;
      default:
        throw new Error(`Unknown scan mode: ${mode}`);
    }
  }
};

/**
 * Default Export
 * 
 * Main scan modes object for convenient access
 */
const scanModes = {
  // Components
  BasicScanContainer,
  GlobalScanContainer,
  FeatureScanContainer,
  
  // Services
  basicScanService,
  // globalScanService - removed for isolation
  featureScanService,
  
  // Public APIs
  executeBasicScan,
  // executeGlobalScan - removed for isolation
  executeFeatureScan,
  executeMultipleFeatureScans,
  
  // Utilities
  SCAN_MODE_OPTIONS,
  getScanModeConfig,
  isValidScanMode,
  getRecommendedScanMode,
  convertToUnifiedResult,
  scanModeFactory
};

export default scanModes;