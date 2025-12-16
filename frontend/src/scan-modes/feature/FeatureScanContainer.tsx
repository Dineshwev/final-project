/**
 * Feature Scan Container
 * 
 * Purpose: Provides focused, single-feature SEO analysis with deep specialization.
 * Designed for rapid feedback and iterative testing of specific SEO aspects.
 * 
 * Features:
 * - Individual feature deep-dive analysis
 * - Rapid execution and feedback
 * - Specialized diagnostics per feature
 * - Targeted recommendations
 * - Configurable analysis depth
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FeatureScanResult, 
  FeatureScanType,
  FeatureScanConfig,
  FeatureScanProgress,
  FEATURE_SCAN_CONFIG
} from './featureScan.types';
import { 
  executeFeatureScan, 
  executeMultipleFeatureScans,
  getFeatureConfiguration,
  getFeatureScanHistory
} from './featureScan.service';

interface FeatureScanContainerProps {
  /** Feature key identifying the specific feature to scan */
  featureKey: string;
  /** Initial URL to scan (optional) */
  initialUrl?: string;
  /** Pre-selected feature to analyze */
  initialFeature?: FeatureScanType;
  /** Initial scan configuration */
  initialConfig?: Partial<FeatureScanConfig>;
  /** Callback when scan completes successfully */
  onScanComplete?: (result: FeatureScanResult) => void;
  /** Callback when scan fails */
  onScanError?: (error: any) => void;
  /** Callback when scan progress updates */
  onProgressUpdate?: (progress: FeatureScanProgress) => void;
  /** Additional CSS classes */
  className?: string;
  /** Auto-start scan when component mounts */
  autoStart?: boolean;
  /** Allow multiple feature selection */
  allowMultiple?: boolean;
  /** Show historical results */
  showHistory?: boolean;
}

interface FeatureScanState {
  // Scan execution state
  isScanning: boolean;
  
  // Results state
  singleResult?: FeatureScanResult;
  multipleResults?: Map<FeatureScanType, FeatureScanResult | any>;
  error?: any;
  history: FeatureScanResult[];
  
  // Configuration state
  url: string;
  selectedFeature?: FeatureScanType;
  selectedFeatures: Set<FeatureScanType>;
  config: FeatureScanConfig;
  
  // UI state
  mode: 'single' | 'multiple';
  showAdvancedOptions: boolean;
  activeTab: 'configuration' | 'results' | 'history';
  expandedSections: Set<string>;
  lastScanDuration?: number;
}

export const FeatureScanContainer: React.FC<FeatureScanContainerProps> = ({
  featureKey,
  initialUrl = '',
  initialFeature,
  initialConfig = {},
  onScanComplete,
  onScanError,
  onProgressUpdate,
  className = '',
  autoStart = false,
  allowMultiple = true,
  showHistory = false
}) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // ✅ CORRECT: Redirect unpaid users to pricing, not other scan modes
  useEffect(() => {
    // Simple check - for now, all authenticated users can access features
    // TODO: Add proper subscription system
    const isPaidUser = Boolean(currentUser);
    
    if (!isPaidUser) {
      console.log('Redirecting unpaid user to pricing page');
      navigate('/pricing');
      return;
    }
  }, [currentUser, navigate]);

  const [state, setState] = useState<FeatureScanState>({
    isScanning: false,
    url: initialUrl,
    selectedFeature: initialFeature,
    selectedFeatures: new Set(initialFeature ? [initialFeature] : []),
    config: {
      ...initialConfig
    },
    mode: 'single',
    showAdvancedOptions: false,
    activeTab: 'configuration',
    expandedSections: new Set(),
    history: []
  });

  // Simplified feature scan execution without polling

  /**
   * Execute single feature scan with immediate results
   */
  const executeSingleScan = useCallback(async () => {
    if (!state.url.trim() || !state.selectedFeature) {
      setState(prev => ({
        ...prev,
        error: { 
          message: 'Please enter a valid URL and select a feature to scan',
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
      singleResult: undefined,
      multipleResults: undefined,
      activeTab: 'results'
    }));

    try {
      const result = await executeFeatureScan(
        state.url.trim(),
        state.selectedFeature,
        state.config
      );

      setState(prev => ({
        ...prev,
        isScanning: false,
        singleResult: result,
        lastScanDuration: Date.now() - startTime,
        history: [result, ...prev.history].slice(0, 10)
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
  }, [state.url, state.selectedFeature, state.config, onScanComplete, onScanError]);

  /**
   * Execute multiple feature scans with immediate results
   */
  const executeMultipleScan = useCallback(async () => {
    if (!state.url.trim() || state.selectedFeatures.size === 0) {
      setState(prev => ({
        ...prev,
        error: { 
          message: 'Please enter a valid URL and select at least one feature to scan',
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
      singleResult: undefined,
      multipleResults: undefined,
      activeTab: 'results'
    }));

    try {
      const results = await executeMultipleFeatureScans(
        state.url.trim(),
        Array.from(state.selectedFeatures),
        state.config
      );

      setState(prev => ({
        ...prev,
        isScanning: false,
        multipleResults: results,
        lastScanDuration: Date.now() - startTime
      }));

      // Call onScanComplete for each successful result
      results.forEach((result, feature) => {
        if (result && !('code' in result)) { // Not an error
          onScanComplete?.(result as FeatureScanResult);
        }
      });

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isScanning: false,
        error,
        lastScanDuration: Date.now() - startTime
      }));

      onScanError?.(error);
    }
  }, [state.url, state.selectedFeatures, state.config, onScanComplete, onScanError]);

  /**
   * Execute scan based on current mode
   */
  const executeScan = useCallback(async () => {
    if (state.mode === 'single') {
      await executeSingleScan();
    } else {
      await executeMultipleScan();
    }
  }, [state.mode, executeSingleScan, executeMultipleScan]);

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
  const updateConfig = useCallback((updates: Partial<FeatureScanConfig>) => {
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
   * Select single feature
   */
  const selectFeature = useCallback((feature: FeatureScanType) => {
    setState(prev => ({
      ...prev,
      selectedFeature: feature,
      selectedFeatures: new Set([feature]),
      mode: 'single',
      error: undefined
    }));
  }, []);

  /**
   * Toggle multiple feature selection
   */
  const toggleFeature = useCallback((feature: FeatureScanType) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedFeatures);
      if (newSelected.has(feature)) {
        newSelected.delete(feature);
      } else {
        newSelected.add(feature);
      }
      
      return {
        ...prev,
        selectedFeatures: newSelected,
        mode: 'multiple',
        selectedFeature: newSelected.size === 1 ? Array.from(newSelected)[0] : undefined,
        error: undefined
      };
    });
  }, []);

  /**
   * Reset scan state
   */
  const resetScan = useCallback(() => {
    setState(prev => ({
      ...prev,
      isScanning: false,
      singleResult: undefined,
      multipleResults: undefined,
      error: undefined,
      activeTab: 'configuration'
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
   * Change active tab
   */
  const setActiveTab = useCallback((tab: FeatureScanState['activeTab']) => {
    setState(prev => ({
      ...prev,
      activeTab: tab
    }));
  }, []);

  /**
   * Toggle expanded section
   */
  const toggleExpandedSection = useCallback((section: string) => {
    setState(prev => {
      const newExpanded = new Set(prev.expandedSections);
      if (newExpanded.has(section)) {
        newExpanded.delete(section);
      } else {
        newExpanded.add(section);
      }
      return {
        ...prev,
        expandedSections: newExpanded
      };
    });
  }, []);

  /**
   * Load feature-specific configuration
   */
  const loadFeatureConfig = useCallback(async (feature: FeatureScanType) => {
    try {
      const config = await getFeatureConfiguration(feature);
      updateConfig(config);
    } catch (error) {
      console.warn('Failed to load feature configuration:', error);
    }
  }, [updateConfig]);

  /**
   * Load scan history
   */
  const loadHistory = useCallback(async () => {
    try {
      const history = await getFeatureScanHistory({
        url: state.url,
        feature: state.selectedFeature,
        limit: 10
      });
      setState(prev => ({
        ...prev,
        history
      }));
    } catch (error) {
      console.warn('Failed to load history:', error);
    }
  }, [state.url, state.selectedFeature]);

  // Auto-start scan if enabled
  useEffect(() => {
    if (autoStart && state.url && (state.selectedFeature || state.selectedFeatures.size > 0) && !state.isScanning && !state.singleResult && !state.multipleResults) {
      executeScan();
    }
  }, [autoStart, state.url, state.selectedFeature, state.selectedFeatures, state.isScanning, state.singleResult, state.multipleResults, executeScan]);

  // Load configuration when feature selection changes
  useEffect(() => {
    if (state.selectedFeature && state.mode === 'single') {
      loadFeatureConfig(state.selectedFeature);
    }
  }, [state.selectedFeature, state.mode, loadFeatureConfig]);

  // Cleanup on unmount - simplified for feature scans
  useEffect(() => {
    return () => {
      // No cleanup needed for simplified feature scan
    };
  }, []);

  /**
   * Render tab navigation
   */
  const renderTabNavigation = () => (
    <div className="tab-navigation">
      <button
        onClick={() => setActiveTab('configuration')}
        className={`tab-button ${state.activeTab === 'configuration' ? 'active' : ''}`}
        disabled={state.isScanning}
      >
        Configuration
      </button>
      {((state.singleResult || state.multipleResults) || state.isScanning) && (
        <button
          onClick={() => setActiveTab('results')}
          className={`tab-button ${state.activeTab === 'results' ? 'active' : ''}`}
        >
          Results
        </button>
      )}
      {showHistory && (
        <button
          onClick={() => setActiveTab('history')}
          className={`tab-button ${state.activeTab === 'history' ? 'active' : ''}`}
        >
          History
        </button>
      )}
    </div>
  );

  /**
   * Render feature selection grid
   */
  const renderFeatureSelection = () => (
    <div className="feature-selection">
      <div className="selection-mode">
        <label>Selection Mode</label>
        <div className="mode-buttons">
          <button
            onClick={() => setState(prev => ({ ...prev, mode: 'single', selectedFeatures: new Set(prev.selectedFeature ? [prev.selectedFeature] : []) }))}
            className={`mode-button ${state.mode === 'single' ? 'active' : ''}`}
            disabled={state.isScanning}
          >
            Single Feature
          </button>
          {allowMultiple && (
            <button
              onClick={() => setState(prev => ({ ...prev, mode: 'multiple' }))}
              className={`mode-button ${state.mode === 'multiple' ? 'active' : ''}`}
              disabled={state.isScanning}
            >
              Multiple Features
            </button>
          )}
        </div>
      </div>

      <div className="features-grid">
        {FEATURE_SCAN_CONFIG.AVAILABLE_FEATURES.map((feature) => (
          <div
            key={feature}
            className={`feature-card ${
              state.mode === 'single' 
                ? (state.selectedFeature === feature ? 'selected' : '') 
                : (state.selectedFeatures.has(feature) ? 'selected' : '')
            }`}
            onClick={() => {
              if (state.isScanning) return;
              if (state.mode === 'single') {
                selectFeature(feature);
              } else {
                toggleFeature(feature);
              }
            }}
          >
            <div className="feature-icon">
              {getFeatureIcon(feature)}
            </div>
            <div className="feature-info">
              <h4>{getFeatureName(feature)}</h4>
              <p>{getFeatureDescription(feature)}</p>
              <span className="feature-duration">
                ~{FEATURE_SCAN_CONFIG.FEATURE_TIMEOUTS[feature] / 1000}s
              </span>
            </div>
            {state.mode === 'multiple' && (
              <div className="feature-checkbox">
                <input
                  type="checkbox"
                  checked={state.selectedFeatures.has(feature)}
                  onChange={() => toggleFeature(feature)}
                  disabled={state.isScanning}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  /**
   * Render scan configuration section
   */
  const renderConfiguration = () => (
    <div className="feature-scan-config">
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
            disabled={state.isScanning || !state.url.trim() || (state.mode === 'single' && !state.selectedFeature) || (state.mode === 'multiple' && state.selectedFeatures.size === 0)}
            className="scan-button primary"
          >
            {state.isScanning ? 'Scanning...' : 
             state.mode === 'single' ? 'Scan Feature' : 
             `Scan ${state.selectedFeatures.size} Features`}
          </button>
        </div>
      </div>

      {renderFeatureSelection()}

      <button
        onClick={toggleAdvancedOptions}
        className="toggle-advanced"
        type="button"
      >
        {state.showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
      </button>

      {state.showAdvancedOptions && (
        <div className="advanced-options">
          <div className="config-grid">
            {/* Feature-specific configuration options will be rendered here based on selected features */}
            {state.selectedFeature && renderFeatureSpecificConfig(state.selectedFeature)}
            {state.mode === 'multiple' && state.selectedFeatures.size > 0 && (
              <div className="multiple-config">
                <label>Apply to all selected features:</label>
                <div className="global-config-options">
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={!!state.config.includeDiagnostics}
                      onChange={(e) => updateConfig({ includeDiagnostics: e.target.checked })}
                      disabled={state.isScanning}
                    />
                    <span>Include Diagnostic Information</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  /**
   * Render feature-specific configuration options
   */
  const renderFeatureSpecificConfig = (feature: FeatureScanType) => {
    switch (feature) {
      case 'accessibility':
        return (
          <div className="accessibility-config">
            <label>WCAG Level</label>
            <select
              value={state.config.accessibility?.wcagLevel || 'AA'}
              onChange={(e) => updateConfig({ 
                accessibility: { 
                  wcagLevel: e.target.value as 'A' | 'AA' | 'AAA',
                  includeColorContrast: state.config.accessibility?.includeColorContrast ?? true,
                  checkKeyboardNav: state.config.accessibility?.checkKeyboardNav ?? true,
                  testScreenReaders: state.config.accessibility?.testScreenReaders ?? true
                } 
              })}
              disabled={state.isScanning}
            >
              <option value="A">WCAG A</option>
              <option value="AA">WCAG AA</option>
              <option value="AAA">WCAG AAA</option>
            </select>
          </div>
        );
      
      case 'rank-tracker':
        return (
          <div className="rank-tracker-config">
            <label>Keywords (comma-separated)</label>
            <textarea
              value={state.config.rankTracker?.keywords?.join(', ') || ''}
              onChange={(e) => updateConfig({
                rankTracker: {
                  keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k),
                  searchEngine: state.config.rankTracker?.searchEngine ?? 'google',
                  location: state.config.rankTracker?.location ?? 'global',
                  language: state.config.rankTracker?.language ?? 'en'
                }
              })}
              placeholder="keyword1, keyword2, keyword3"
              disabled={state.isScanning}
            />
          </div>
        );
      
      case 'backlinks':
        return (
          <div className="backlinks-config">
            <label>Max Backlinks to Analyze</label>
            <input
              type="number"
              min="1"
              max="10000"
              value={state.config.backlinks?.maxBacklinks || 1000}
              onChange={(e) => updateConfig({
                backlinks: {
                  maxBacklinks: parseInt(e.target.value),
                  includeToxicAnalysis: state.config.backlinks?.includeToxicAnalysis ?? true,
                  checkDomainAuthority: state.config.backlinks?.checkDomainAuthority ?? true,
                  analyzeAnchorText: state.config.backlinks?.analyzeAnchorText ?? true
                }
              })}
              disabled={state.isScanning}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  /**
   * Render scan progress section
   */
  const renderProgress = () => (
    <div className="feature-scan-progress">
      <div className="progress-header">
        <h3>
          Running {state.mode === 'single' ? 'Feature' : 'Multi-Feature'} Analysis
        </h3>
        <button
          onClick={stopScan}
          className="stop-button"
          disabled={!state.isScanning}
        >
          Stop
        </button>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: state.isScanning ? '50%' : '0%' }}
        />
      </div>

      <div className="progress-details">
        <span className="current-phase">{state.isScanning ? 'Analyzing features...' : 'Ready to scan'}</span>
        {state.lastScanDuration && (
          <span className="scan-duration">
            {(state.lastScanDuration / 1000).toFixed(1)}s
          </span>
        )}
      </div>

      {state.mode === 'multiple' && (
        <div className="features-progress">
          <h4>Feature Progress</h4>
          <div className="features-list">
            {Array.from(state.selectedFeatures).map((feature) => (
              <div key={feature} className="feature-progress">
                <span className="feature-name">{getFeatureName(feature)}</span>
                <span className="feature-status pending">⏳ Queued</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  /**
   * Render single feature results
   */
  const renderSingleResult = () => {
    if (!state.singleResult) return null;

    const { feature, score, data, recommendations } = state.singleResult;

    return (
      <div className="single-feature-result">
        <div className="result-header">
          <h3>{getFeatureName(feature)} Analysis</h3>
          <div className="feature-score">
            <span className="score-value">{score}</span>
            <span className="score-label">Score</span>
          </div>
        </div>

        <div className="feature-data">
          {renderFeatureData(feature, data)}
        </div>

        {recommendations.length > 0 && (
          <div className="feature-recommendations">
            <h4>Recommendations</h4>
            <div className="recommendations-list">
              {recommendations.map((rec, index) => (
                <div key={index} className={`recommendation-item ${rec.priority}`}>
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
   * Render multiple feature results
   */
  const renderMultipleResults = () => {
    if (!state.multipleResults) return null;

    return (
      <div className="multiple-feature-results">
        <div className="results-overview">
          <h3>Multi-Feature Analysis Results</h3>
          <div className="results-summary">
            <span>Features Analyzed: {state.multipleResults.size}</span>
            <span>Successful: {Array.from(state.multipleResults.values()).filter(r => !r.code).length}</span>
            <span>Failed: {Array.from(state.multipleResults.values()).filter(r => r.code).length}</span>
          </div>
        </div>

        <div className="feature-results-grid">
          {Array.from(state.multipleResults.entries()).map(([feature, result]) => (
            <div key={feature} className="feature-result-card">
              <div className="feature-result-header">
                <h4>{getFeatureName(feature)}</h4>
                {result.code ? (
                  <span className="result-status error">Failed</span>
                ) : (
                  <span className="result-score">{result.score}</span>
                )}
              </div>

              {result.code ? (
                <div className="feature-error">
                  <p className="error-message">{result.message}</p>
                </div>
              ) : (
                <div 
                  className="feature-summary"
                  onClick={() => toggleExpandedSection(feature)}
                >
                  <p>{getFeatureSummary(feature, result)}</p>
                  <span className="expand-indicator">
                    {state.expandedSections.has(feature) ? '▼' : '▶'}
                  </span>
                </div>
              )}

              {state.expandedSections.has(feature) && !('code' in result) && (
                <div className="feature-details">
                  {renderFeatureData(feature, result.data)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Render scan results section
   */
  const renderResults = () => {
    if (state.isScanning) {
      return renderProgress();
    }

    if (state.singleResult) {
      return renderSingleResult();
    }

    if (state.multipleResults) {
      return renderMultipleResults();
    }

    return null;
  };

  /**
   * Render history section
   */
  const renderHistory = () => (
    <div className="feature-scan-history">
      <div className="history-header">
        <h3>Feature Scan History</h3>
        <button
          onClick={loadHistory}
          className="refresh-history"
          disabled={!state.url}
        >
          Refresh
        </button>
      </div>

      {state.history.length === 0 ? (
        <div className="no-history">
          <p>No previous feature scans found.</p>
        </div>
      ) : (
        <div className="history-list">
          {state.history.map((scan, index) => (
            <div key={`scan-${index}`} className="history-item">
              <div className="history-header">
                <span className="scan-feature">{getFeatureName(scan.feature)}</span>
                <span className="scan-date">
                  {new Date(scan.timestamp).toLocaleString()}
                </span>
                <span className="scan-score">{scan.score}</span>
              </div>
              <div className="history-summary">
                <span>Recommendations: {scan.recommendations.length}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /**
   * Render error section
   */
  const renderError = () => {
    if (!state.error) return null;

    return (
      <div className="feature-scan-error">
        <div className="error-content">
          <h3>Feature Scan Failed</h3>
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
    <div className={`feature-scan-container ${className}`}>
      <div className="feature-scan-header">
        <h2>Feature SEO Analysis</h2>
        <p>Focused analysis of specific SEO features with deep insights and recommendations</p>
      </div>

      {renderTabNavigation()}

      <div className="tab-content">
        {state.activeTab === 'configuration' && renderConfiguration()}
        {state.activeTab === 'results' && renderResults()}
        {state.activeTab === 'history' && showHistory && renderHistory()}
      </div>

      {state.error && renderError()}

      <div className="scan-actions">
        {(state.singleResult || state.multipleResults) && (
          <button
            onClick={resetScan}
            className="new-scan-button"
          >
            New Feature Scan
          </button>
        )}
      </div>
    </div>
  );
};

// Helper functions for feature information
const getFeatureIcon = (feature: FeatureScanType): string => {
  const icons: Record<FeatureScanType, string> = {
    'accessibility': '♿',
    'schema': '📋',
    'backlinks': '🔗',
    'duplicate-content': '📄',
    'multi-language': '🌐',
    'link-checker': '🔍',
    'rank-tracker': '📊',
    'security-headers': '🔒',
    'performance': '⚡',
    'content-analysis': '📝'
  };
  return icons[feature] || '🔧';
};

const getFeatureName = (feature: FeatureScanType): string => {
  const names: Record<FeatureScanType, string> = {
    'accessibility': 'Accessibility',
    'schema': 'Schema Markup',
    'backlinks': 'Backlink Analysis',
    'duplicate-content': 'Duplicate Content',
    'multi-language': 'Multi-Language SEO',
    'link-checker': 'Link Checker',
    'rank-tracker': 'Rank Tracking',
    'security-headers': 'Security Headers',
    'performance': 'Performance',
    'content-analysis': 'Content Analysis'
  };
  return names[feature] || feature;
};

const getFeatureDescription = (feature: FeatureScanType): string => {
  const descriptions: Record<FeatureScanType, string> = {
    'accessibility': 'WCAG compliance and accessibility analysis',
    'schema': 'Structured data validation and recommendations',
    'backlinks': 'Comprehensive backlink profile analysis',
    'duplicate-content': 'Find and resolve duplicate content issues',
    'multi-language': 'International SEO and hreflang analysis',
    'link-checker': 'Find and fix broken links',
    'rank-tracker': 'Track keyword rankings and positions',
    'security-headers': 'Security header implementation analysis',
    'performance': 'Core Web Vitals and performance metrics',
    'content-analysis': 'Content quality and optimization analysis'
  };
  return descriptions[feature] || 'Feature-specific SEO analysis';
};

const renderFeatureData = (feature: FeatureScanType, data: any) => {
  // This would contain feature-specific data rendering logic
  // For brevity, showing a simplified version
  return (
    <div className="feature-data-display">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

const getFeatureSummary = (feature: FeatureScanType, result: any): string => {
  // Generate a brief summary for each feature
  return `Analysis complete with score of ${result.score}. ${result.recommendations?.length || 0} recommendations found.`;
};

export default FeatureScanContainer;