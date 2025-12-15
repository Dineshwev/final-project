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
  executeBasicScan, 
  getBasicScanProgress, 
  cancelBasicScan
} from './basicScan.service';

// 🔥 QUICK FIX: Use config constants for polling limits
const MAX_POLL_ATTEMPTS = BASIC_SCAN_CONFIG.MAX_POLL_ATTEMPTS;
const POLL_INTERVAL = BASIC_SCAN_CONFIG.POLL_INTERVAL;

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
  scanId?: string;
  progress: number;
  currentPhase: string;
  
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
    progress: 0,
    currentPhase: 'ready',
    url: initialUrl,
    config: {
      includeMobile: true,
      includePerformance: true,
      timeout: 30000,
      ...initialConfig
    },
    showAdvancedOptions: false
  });

  const [progressTimer, setProgressTimer] = useState<NodeJS.Timeout | null>(null);

  /**
   * Update scan progress by polling the service
   */
  const updateProgress = useCallback(async () => {
    if (!state.scanId) return;

    try {
      const progress = await getBasicScanProgress(state.scanId);
      
      setState(prev => ({
        ...prev,
        progress: progress.progress,
        currentPhase: progress.phase
      }));

      onProgressUpdate?.(progress);

      // Stop polling when scan is complete
      if (progress.progress >= 100 || progress.phase === 'completed') {
        if (progressTimer) {
          clearInterval(progressTimer);
          setProgressTimer(null);
        }
      }
    } catch (error) {
      console.warn('Failed to update progress:', error);
    }
  }, [state.scanId, progressTimer, onProgressUpdate]);

  /**
   * Start progress monitoring with timeout protection
   */
  const startProgressMonitoring = useCallback(() => {
    if (progressTimer) return;

    let pollCount = 0;
    
    const poll = async () => {
      pollCount++;
      
      // Stop polling if max attempts reached
      if (pollCount >= MAX_POLL_ATTEMPTS) {
        if (progressTimer) {
          clearInterval(progressTimer);
          setProgressTimer(null);
        }
        setState(prev => ({
          ...prev,
          error: {
            message: 'Basic scan timed out. Please try again.',
            category: 'timeout'
          },
          isScanning: false
        }));
        return;
      }
      
      await updateProgress();
    };

    const timer = setInterval(poll, POLL_INTERVAL);
    setProgressTimer(timer);
    setProgressTimer(timer);
  }, [updateProgress, progressTimer]);

  /**
   * Execute basic scan with current configuration
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
      result: undefined,
      progress: 0,
      currentPhase: 'initializing'
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
        progress: 100,
        currentPhase: 'completed',
        scanId: result.scanId,
        lastScanDuration: Date.now() - startTime
      }));

      onScanComplete?.(result);

      // Clear progress timer
      if (progressTimer) {
        clearInterval(progressTimer);
        setProgressTimer(null);
      }

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isScanning: false,
        error,
        progress: 0,
        currentPhase: 'error',
        lastScanDuration: Date.now() - startTime
      }));

      onScanError?.(error);

      // Clear progress timer
      if (progressTimer) {
        clearInterval(progressTimer);
        setProgressTimer(null);
      }
    }
  }, [state.url, state.config, onScanComplete, onScanError, progressTimer]);

  /**
   * Cancel the current scan
   */
  const cancelScan = useCallback(async () => {
    if (!state.isScanning || !state.scanId) return;

    try {
      await cancelBasicScan(state.scanId);
      
      setState(prev => ({
        ...prev,
        isScanning: false,
        progress: 0,
        currentPhase: 'cancelled'
      }));

      // Clear progress timer
      if (progressTimer) {
        clearInterval(progressTimer);
        setProgressTimer(null);
      }
    } catch (error) {
      console.warn('Failed to cancel scan:', error);
    }
  }, [state.isScanning, state.scanId, progressTimer]);

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
    if (progressTimer) {
      clearInterval(progressTimer);
      setProgressTimer(null);
    }

    setState(prev => ({
      ...prev,
      isScanning: false,
      scanId: undefined,
      progress: 0,
      currentPhase: 'ready',
      result: undefined,
      error: undefined
    }));
  }, [progressTimer]);

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

  // Start progress monitoring when scan begins
  useEffect(() => {
    if (state.isScanning && state.scanId && !progressTimer) {
      startProgressMonitoring();
    }
  }, [state.isScanning, state.scanId, progressTimer, startProgressMonitoring]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressTimer) {
        clearInterval(progressTimer);
      }
    };
  }, [progressTimer]);

  /**
   * Render scan configuration section
   */
  const renderConfiguration = () => (
    <div className="basic-scan-config">
      <div className="url-input-section">
        <label htmlFor="url-input">Website URL</label>
        <div className="input-group">
          <input
            id="url-input"
            type="url"
            value={state.url}
            onChange={(e) => updateUrl(e.target.value)}
            placeholder="https://example.com"
            disabled={state.isScanning}
            className="url-input"
          />
          <button
            onClick={executeScan}
            disabled={state.isScanning || !state.url.trim()}
            className="scan-button primary"
          >
            {state.isScanning ? 'Scanning...' : 'Quick Scan'}
          </button>
        </div>
      </div>

      <button
        onClick={toggleAdvancedOptions}
        className="toggle-advanced"
        type="button"
      >
        {state.showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
      </button>

      {state.showAdvancedOptions && (
        <div className="advanced-options">
          <div className="checkbox-group">
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={state.config.includeMobile ?? false}
                onChange={(e) => updateConfig({ includeMobile: e.target.checked })}
                disabled={state.isScanning}
              />
              <span>Include Mobile Checks</span>
            </label>
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={state.config.includePerformance ?? false}
                onChange={(e) => updateConfig({ includePerformance: e.target.checked })}
                disabled={state.isScanning}
              />
              <span>Include Performance Analysis</span>
            </label>
          </div>

          <div className="timeout-setting">
            <label htmlFor="timeout-input">Timeout (seconds)</label>
            <input
              id="timeout-input"
              type="number"
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
    <div className="basic-scan-progress">
      <div className="progress-header">
        <h3>Running Basic SEO Scan</h3>
        <button
          onClick={cancelScan}
          className="cancel-button"
          disabled={!state.isScanning}
        >
          Cancel
        </button>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${state.progress}%` }}
        />
      </div>

      <div className="progress-details">
        <span className="progress-percentage">{Math.round(state.progress)}%</span>
        <span className="current-phase">{state.currentPhase}</span>
        {state.lastScanDuration && (
          <span className="scan-duration">
            {(state.lastScanDuration / 1000).toFixed(1)}s
          </span>
        )}
      </div>
    </div>
  );

  /**
   * Render scan results section
   */
  const renderResults = () => {
    if (!state.result) return null;

    const { score, results, recommendations } = state.result;

    return (
      <div className="basic-scan-results">
        <div className="results-header">
          <h3>Basic SEO Scan Results</h3>
          <div className="overall-score">
            <span className="score-value">{score}</span>
            <span className="score-label">Overall Score</span>
          </div>
          <button
            onClick={resetScan}
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
      <div className="basic-scan-error">
        <div className="error-content">
          <h3>Scan Failed</h3>
          <p className="error-message">{state.error.message}</p>
          {state.error.resolution && (
            <p className="error-resolution">
              <strong>Solution:</strong> {state.error.resolution}
            </p>
          )}
          <div className="error-actions">
            <button
              onClick={resetScan}
              className="retry-button"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`basic-scan-container ${className}`}>
      <div className="basic-scan-header">
        <h2>Basic SEO Health Check</h2>
        <p>Quick analysis of your website's essential SEO fundamentals</p>
      </div>

      {!state.isScanning && !state.result && !state.error && renderConfiguration()}
      {state.isScanning && renderProgress()}
      {state.result && renderResults()}
      {state.error && renderError()}
    </div>
  );
};

export default BasicScanContainer;