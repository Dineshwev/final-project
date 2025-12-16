/**
 * Basic Scan Container
 * 
 * Purpose: Provides a quick health check scan focused on immediate SEO issues.
 * Designed for rapid assessment and first-time website analysis.
 * 
 * Features:
 * - Fast 30-second health check
 * - Core SEO fundamentals
 * - Simple pass/fail indicators
 * - Immediate actionable results
 * - Mobile-friendly quick scan
 */

import React, { useState, useCallback, useEffect } from 'react';
import { 
  BasicScanOptions, 
  BasicScanResult,
  LegacyBasicScanResult,
  BasicScanProgress,
  BasicScanConfig,
  BASIC_SCAN_CONFIG
} from './basicScan.types';
import { 
  executeBasicScan
} from './basicScan.service';

interface BasicScanContainerProps {
  /** Initial URL to scan (optional) */
  initialUrl?: string;
  /** Initial scan configuration */
  initialConfig?: Partial<BasicScanConfig>;
  /** Callback when scan completes successfully */
  onScanComplete?: (result: LegacyBasicScanResult) => void;
  /** Callback when scan fails */
  onScanError?: (error: any) => void;
  /** Callback when scan progress updates */
  onProgressUpdate?: (progress: BasicScanProgress) => void;
  /** Additional CSS classes */
  className?: string;
  /** Auto-start scan when component mounts */
  autoStart?: boolean;
}

interface BasicScanState {
  // Scan execution state
  isScanning: boolean;
  
  // Results state
  result?: LegacyBasicScanResult;
  error?: any;
  
  // Configuration state
  url: string;
  config: BasicScanConfig;
  
  // UI state
  showAdvancedOptions: boolean;
  lastScanDuration?: number;
}

export const BasicScanContainer: React.FC<BasicScanContainerProps> = ({
  initialUrl = '',
  initialConfig = {},
  onScanComplete,
  onScanError,
  onProgressUpdate,
  className = '',
  autoStart = false
}) => {
  const [state, setState] = useState<BasicScanState>({
    isScanning: false,
    url: initialUrl,
    config: {
      includeMobile: true,
      includePerformance: true,
      timeout: 30000,
      ...initialConfig
    },
    showAdvancedOptions: false
  });

  // Simplified scan execution without polling

  /**
   * Execute basic scan with immediate results - no polling required
   */
  const executeScan = useCallback(async () => {
    if (!state.url.trim()) {
      setState(prev => ({
        ...prev,
        error: { 
          message: 'Please enter a valid URL to scan',
          category: 'validation'
        }
      }));
      return;
    }

    const startTime = Date.now();

    setState(prev => ({
      ...prev,
      isScanning: true,
      error: undefined,
      result: undefined
    }));

    try {
      const result = await executeBasicScan({
        url: state.url.trim(),
        config: state.config
      });

      setState(prev => ({
        ...prev,
        isScanning: false,
        result,
        lastScanDuration: Date.now() - startTime
      }));

      onScanComplete?.(result);

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isScanning: false,
        error,
        lastScanDuration: Date.now() - startTime
      }));

      onScanError?.(error);
    }
  }, [state.url, state.config, onScanComplete, onScanError]);

  /**
   * Stop the current scan
   */
  const stopScan = useCallback(() => {
    setState(prev => ({
      ...prev,
      isScanning: false
    }));
  }, []);

  /**
   * Update scan configuration
   */
  const updateConfig = useCallback((updates: Partial<BasicScanConfig>) => {
    setState(prev => ({
      ...prev,
      config: {
        ...prev.config,
        ...updates
      }
    }));
  }, []);

  /**
   * Update URL
   */
  const updateUrl = useCallback((url: string) => {
    setState(prev => ({
      ...prev,
      url,
      error: undefined
    }));
  }, []);

  /**
   * Reset scan state
   */
  const resetScan = useCallback(() => {
    setState(prev => ({
      ...prev,
      isScanning: false,
      result: undefined,
      error: undefined
    }));
  }, []);

  /**
   * Toggle advanced options visibility
   */
  const toggleAdvancedOptions = useCallback(() => {
    setState(prev => ({
      ...prev,
      showAdvancedOptions: !prev.showAdvancedOptions
    }));
  }, []);

  /**
   * Load default configuration for scan type
   */
  const loadDefaultConfig = useCallback(async (scanType?: string) => {
    try {
      // Use default config from BASIC_SCAN_CONFIG
      const defaultConfig = {
        timeout: BASIC_SCAN_CONFIG.TIMEOUT,
        includeMobile: true,
        includePerformance: true
      };
      updateConfig(defaultConfig);
    } catch (error) {
      console.warn('Failed to load default configuration:', error);
    }
  }, [updateConfig]);

  // Auto-start scan if enabled
  useEffect(() => {
    if (autoStart && state.url && !state.isScanning && !state.result) {
      executeScan();
    }
  }, [autoStart, state.url, state.isScanning, state.result, executeScan]);

  // Cleanup on unmount - no timers to clean up in simplified version
  useEffect(() => {
    return () => {
      // No cleanup needed for simplified basic scan
    };
  }, []);

  /**
   * Render scan configuration section
   */
  const renderConfiguration = () => (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 px-8 py-8 text-center border-b border-blue-100">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Start Your Free SEO Analysis</h2>
        <p className="text-gray-600 text-lg">Enter your website URL below to get instant insights</p>
      </div>
      
      <div className="p-10">
        <div className="space-y-6">
          <div className="space-y-3">
            <label htmlFor="url-input" className="block text-base font-semibold text-gray-800">
              Website URL
            </label>
            <input
              id="url-input"
              type="url"
              value={state.url}
              onChange={(e) => updateUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              disabled={state.isScanning}
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500 transition-all duration-300 text-lg placeholder-gray-400 shadow-inner"
            />
            <p className="text-sm text-gray-500 leading-relaxed">
              Enter your complete website URL (including https://) to analyze your SEO performance
            </p>
          </div>
          
          <button
            onClick={executeScan}
            disabled={state.isScanning || !state.url.trim()}
            className="w-full py-4 px-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-bold rounded-2xl hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] text-lg"
          >
            {state.isScanning ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing Your Website...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Get My Free SEO Report</span>
              </div>
            )}
          </button>
          
          <div className="text-center">
            <button
              onClick={toggleAdvancedOptions}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 hover:underline"
              type="button"
            >
              {state.showAdvancedOptions ? '🔽 Hide' : '⚙️ Show'} Advanced Options
            </button>
          </div>

          {state.showAdvancedOptions && (
            <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Advanced Configuration</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.config.includeMobile ?? false}
                      onChange={(e) => updateConfig({ includeMobile: e.target.checked })}
                      disabled={state.isScanning}
                      className="mt-1 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 w-5 h-5"
                    />
                    <div>
                      <span className="font-medium text-gray-900">Mobile Analysis</span>
                      <p className="text-sm text-gray-600 mt-1">Include mobile optimization checks</p>
                    </div>
                  </label>
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.config.includePerformance ?? false}
                      onChange={(e) => updateConfig({ includePerformance: e.target.checked })}
                      disabled={state.isScanning}
                      className="mt-1 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 w-5 h-5"
                    />
                    <div>
                      <span className="font-medium text-gray-900">Performance Metrics</span>
                      <p className="text-sm text-gray-600 mt-1">Include page speed analysis</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
              min="10"
              max="300"
              value={(state.config.timeout ?? 60000) / 1000}
              onChange={(e) => updateConfig({ timeout: parseInt(e.target.value) * 1000 })}
              disabled={state.isScanning}
              className="timeout-input"
            />
          </div>
        </div>
      )}
    </div>
  );

  /**
   * Render scan progress section
   */
  const renderProgress = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Running SEO Analysis</h2>
              <p className="text-gray-600 mt-1">Please wait while we analyze your website...</p>
            </div>
          </div>
          <button
            onClick={stopScan}
            disabled={!state.isScanning}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 font-medium"
          >
            Stop Scan
          </button>
        </div>
      </div>
      
      <div className="p-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">Scan Progress</span>
            <span className="text-sm text-gray-500">{state.isScanning ? '50%' : '0%'} Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: state.isScanning ? '50%' : '0%' }}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-gray-700 font-medium">
              {state.isScanning ? 'Analyzing website structure and content...' : 'Ready to begin analysis'}
            </span>
          </div>
          {state.lastScanDuration && (
            <span className="text-gray-500">
              Duration: {(state.lastScanDuration / 1000).toFixed(1)}s
            </span>
          )}
        </div>
      </div>
    </div>
  );

  /**
   * Render scan results section
   */
  const renderResults = () => {
    if (!state.result) return null;

    const { score, results, recommendations } = state.result;
    const scoreColor = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red';
    const scoreGradient = {
      green: 'from-green-50 to-emerald-50 border-green-100',
      yellow: 'from-yellow-50 to-amber-50 border-yellow-100', 
      red: 'from-red-50 to-rose-50 border-red-100'
    };
    const scoreIcon = {
      green: 'text-green-600',
      yellow: 'text-yellow-600',
      red: 'text-red-600'
    };

    return (
      <div className="space-y-8">
        {/* Score Summary Card */}
        <div className={`bg-white rounded-2xl shadow-lg border overflow-hidden ${scoreGradient[scoreColor]}`}>
          <div className={`bg-gradient-to-r px-8 py-6 border-b ${scoreGradient[scoreColor]}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">SEO Analysis Complete</h2>
                <p className="text-gray-600 mt-1">Your website's SEO health summary</p>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-bold ${scoreIcon[scoreColor]} mb-1`}>{score}/100</div>
                <div className="text-sm text-gray-600 font-medium">Overall Score</div>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={resetScan}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Run New Scan</span>
                </div>
              </button>
              
              <button
                onClick={() => setState(prev => ({ ...prev, activeTab: prev.activeTab === 'results' ? 'configuration' : 'results' }))}
                className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
              >
                View Details
              </button>
            </div>
            
            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results && Object.entries(results).map(([key, result]: [string, any]) => (
                <div key={key} className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</h4>
                    <div className={`w-3 h-3 rounded-full ${
                      result.status === 'pass' ? 'bg-green-500' : 
                      result.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                  <p className="text-sm text-gray-600">{result.message || 'Analysis complete'}</p>
                  {result.value && (
                    <div className="mt-2 text-lg font-semibold text-gray-800">{result.value}</div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Recommendations */}
            {recommendations && recommendations.length > 0 && (
              <div className="mt-8 bg-blue-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Recommended Improvements
                </h4>
                <div className="space-y-3">
                  {recommendations.slice(0, 5).map((rec: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="text-sm text-gray-700">
                        <div className="font-medium">{rec.title}</div>
                        <div className="text-gray-600 mt-1">{rec.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
            className="new-scan-button"
          >
            New Scan
          </button>
        </div>

        <div className="results-sections">
          <div className="result-section">
            <h4>On-Page SEO</h4>
            <div className="section-details">
              <p>Title: {results.onPageSeo.title.present ? '✓' : '✗'} Present</p>
              <p>Meta Description: {results.onPageSeo.metaDescription.present ? '✓' : '✗'} Present</p>
              <p>Headers: {results.onPageSeo.headers.hasProperStructure ? '✓' : '✗'} Structured</p>
            </div>
          </div>

          <div className="result-section">
            <h4>Technical SEO</h4>
            <div className="section-details">
              <p>SSL: {results.technicalSeo.sslStatus === 'valid' ? '✓' : '✗'} {results.technicalSeo.sslStatus}</p>
              <p>Mobile Responsive: {results.technicalSeo.mobileResponsive ? '✓' : '✗'}</p>
            </div>
          </div>

          <div className="result-section">
            <h4>Accessibility</h4>
            <div className="section-details">
              <p>Compliance Level: {results.accessibility.complianceLevel}</p>
              <p>Critical Violations: {results.accessibility.criticalViolations}</p>
            </div>
          </div>

          <div className="result-section">
            <h4>Performance</h4>
            <div className="section-details">
              <p>Load Speed: {results.performance.loadSpeed}</p>
              <p>Mobile Score: {results.performance.mobileScore}</p>
              <p>Desktop Score: {results.performance.desktopScore}</p>
            </div>
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="priority-recommendations">
            <h4>Priority Recommendations</h4>
            <div className="recommendations-list">
              {state.result.recommendations
                .filter(rec => rec.priority === 'high')
                .slice(0, 3)
                .map((rec, index) => (
                  <div key={index} className="recommendation-item">
                    <h5>{rec.title}</h5>
                    <p>{rec.description}</p>
                    <p className="expected-improvement">
                      <strong>Expected improvement:</strong> {rec.expectedImprovement}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  /**
   * Render error section
   */
  const renderError = () => {
    if (!state.error) return null;

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-red-100 overflow-hidden">
        <div className="bg-gradient-to-r from-red-50 to-rose-50 px-8 py-6 border-b border-red-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Scan Failed</h2>
              <p className="text-gray-600 mt-1">There was an issue analyzing your website</p>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          <div className="bg-red-50 rounded-xl p-6 mb-6">
            <h4 className="font-semibold text-red-800 mb-2">Error Details</h4>
            <p className="text-red-700 mb-4">{state.error.message}</p>
            {state.error.resolution && (
              <div>
                <h5 className="font-medium text-red-800 mb-2">Suggested Solution:</h5>
                <p className="text-red-600">{state.error.resolution}</p>
              </div>
            )}
          </div>
          
          <button
            onClick={resetScan}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Try Again</span>
            </div>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-8 lg:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Basic SEO Health Check
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Get a quick analysis of your website's essential SEO fundamentals in just 30 seconds
          </p>
        </div>
        
        {/* Main Content - Centered */}
        <div className="flex justify-center">
          <div className="w-full max-w-3xl">
            {!state.isScanning && !state.result && !state.error && renderConfiguration()}
            {state.isScanning && renderProgress()}
            {state.result && renderResults()}
            {state.error && renderError()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicScanContainer;