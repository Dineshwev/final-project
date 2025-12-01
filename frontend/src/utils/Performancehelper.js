/**
 * Performance Helper Utilities
 * Provides utilities for analyzing, formatting, and evaluating web performance metrics
 */

/**
 * Calculate a letter grade based on performance score
 * Uses Google Lighthouse scoring system
 * 
 * @param {number} score - Performance score (0-100)
 * @returns {string} Letter grade (A+, A, B, C, D, F)
 */
export const calculatePerformanceGrade = (score) => {
  // Based on Google Lighthouse scoring
  if (score >= 97) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};

/**
 * Get threshold values for different performance metrics
 * Based on Core Web Vitals standards and best practices
 * 
 * @param {string} metric - Metric name (LCP, FID, CLS, FCP, TTI, TBT, etc.)
 * @returns {Object} Object containing good, needsImprovement, and poor thresholds
 */
export const getMetricThreshold = (metric) => {
  // Core Web Vitals thresholds based on Google's standards
  
  const thresholds = {
    // Core Web Vitals
    'LCP': { good: 2500, needsImprovement: 4000, poor: 4000 }, // ms - Good (≤2.5s), Needs Improvement (2.5-4s), Poor (>4s)
    'FID': { good: 100, needsImprovement: 300, poor: 300 },     // ms - Good (≤100ms), Needs Improvement (100-300ms), Poor (>300ms)
    'CLS': { good: 0.1, needsImprovement: 0.25, poor: 0.25 },   // unitless - Good (≤0.1), Needs Improvement (0.1-0.25), Poor (>0.25)
    'INP': { good: 200, needsImprovement: 500, poor: 500 },     // ms
    
    // Other important metrics
    'FCP': { good: 1800, needsImprovement: 3000, poor: 3000 },  // ms - Good (≤1.8s), Needs Improvement (1.8-3s), Poor (>3s)
    'TTI': { good: 3800, needsImprovement: 7300, poor: 7300 },  // ms
    'TBT': { good: 200, needsImprovement: 600, poor: 600 },     // ms
    'TTFB': { good: 800, needsImprovement: 1800, poor: 1800 },  // ms
    
    // Resource metrics
    'totalBytes': { good: 1500000, needsImprovement: 2500000, poor: 2500000 }, // bytes
    'renderBlockingTime': { good: 200, needsImprovement: 600, poor: 600 },     // ms
  };
  
  return thresholds[metric] || { good: 0, needsImprovement: 0, poor: 0 };
};

/**
 * Format metric values with appropriate units
 * 
 * @param {number} value - The raw metric value
 * @param {string} metric - Metric name for context
 * @returns {string} Formatted value with units
 */
export const formatMetricValue = (value, metric) => {
  if (value === null || value === undefined) return 'N/A';
  
  // Handle different units based on metric type
  if (['LCP', 'FCP', 'TTI', 'TTFB'].includes(metric)) {
    // Time metrics in seconds
    return value >= 1000 ? `${(value / 1000).toFixed(2)} s` : `${Math.round(value)} ms`;
  } else if (['FID', 'TBT', 'INP'].includes(metric)) {
    // Time metrics always in milliseconds
    return `${Math.round(value)} ms`;
  } else if (metric === 'CLS') {
    // Cumulative Layout Shift is unitless
    return value.toFixed(3);
  } else if (metric.includes('Bytes') || metric === 'totalBytes') {
    // Data size metrics
    if (value >= 1048576) {
      return `${(value / 1048576).toFixed(2)} MB`;
    } else if (value >= 1024) {
      return `${(value / 1024).toFixed(2)} KB`;
    } else {
      return `${Math.round(value)} bytes`;
    }
  }
  
  // Default formatting
  return `${value}`;
};

/**
 * Calculate estimated total page load time from multiple metrics
 * 
 * @param {Object} metrics - Object containing performance metrics
 * @returns {number} Estimated total page load time in milliseconds
 */
export const calculatePageLoadTime = (metrics) => {
  // Start with TTFB as base
  let totalTime = metrics.TTFB || 0;
  
  // Add rendering time (approximate using FCP and LCP)
  if (metrics.LCP) {
    totalTime = Math.max(totalTime, metrics.LCP);
  } else if (metrics.FCP) {
    // If no LCP, use FCP plus a buffer
    totalTime = Math.max(totalTime, metrics.FCP * 1.5);
  }
  
  // Account for JavaScript execution time
  if (metrics.TBT) {
    totalTime += metrics.TBT;
  }
  
  // Ensure we return at least TTI if available
  if (metrics.TTI) {
    totalTime = Math.max(totalTime, metrics.TTI);
  }
  
  return Math.round(totalTime);
};

/**
 * Identify performance bottlenecks from metrics
 * 
 * @param {Object} metrics - Object containing performance metrics
 * @returns {Array} Prioritized list of bottlenecks with metric names and severity
 */
export const identifyBottlenecks = (metrics) => {
  const bottlenecks = [];
  
  // Check each metric against its threshold
  Object.entries(metrics).forEach(([metric, value]) => {
    if (value === null || value === undefined) return;
    
    const threshold = getMetricThreshold(metric);
    
    // Skip metrics without defined thresholds
    if (!threshold || threshold.good === 0) return;
    
    let severity = 'low';
    if (value >= threshold.poor) {
      severity = 'high';
    } else if (value >= threshold.needsImprovement) {
      severity = 'medium';
    } else {
      return; // Skip good metrics
    }
    
    bottlenecks.push({
      metric,
      value,
      severity,
      impact: calculateImpact(metric, value, threshold)
    });
  });
  
  // Sort by impact (higher impact first)
  return bottlenecks.sort((a, b) => b.impact - a.impact);
};

/**
 * Helper function to calculate impact score for bottleneck prioritization
 * 
 * @private
 * @param {string} metric - Metric name
 * @param {number} value - Metric value
 * @param {Object} threshold - Metric thresholds
 * @returns {number} Impact score (higher means more severe)
 */
const calculateImpact = (metric, value, threshold) => {
  // Calculate how much the value exceeds the "good" threshold (as a percentage)
  const ratio = value / threshold.good;
  
  // Weight metrics differently based on user-perceived importance
  const weights = {
    'LCP': 1.0,   // Highest priority (Core Web Vital)
    'FID': 0.9,   // High priority (Core Web Vital)
    'CLS': 0.9,   // High priority (Core Web Vital)
    'INP': 0.85,  // High priority (Core Web Vital)
    'TTI': 0.8,   // High priority
    'TBT': 0.8,   // High priority
    'FCP': 0.7,   // Medium priority
    'TTFB': 0.6,  // Medium priority
    'totalBytes': 0.5, // Lower priority
    // Default weight for other metrics
    'default': 0.5
  };
  
  const weight = weights[metric] || weights.default;
  
  // Calculate impact score
  return (ratio - 1) * weight;
};

/**
 * Estimate overall user experience based on metrics
 * 
 * @param {Object} metrics - Object containing performance metrics
 * @returns {Object} UX rating and score
 */
export const estimateUserExperience = (metrics) => {
  let score = 0;
  let totalWeight = 0;
  
  // Core Web Vitals - highest weight
  const coreWebVitals = [
    { name: 'LCP', weight: 30 },
    { name: 'FID', weight: 25 },
    { name: 'CLS', weight: 25 },
    { name: 'INP', weight: 20 }
  ];
  
  // Secondary metrics
  const secondaryMetrics = [
    { name: 'FCP', weight: 15 },
    { name: 'TTI', weight: 15 },
    { name: 'TBT', weight: 15 },
    { name: 'TTFB', weight: 10 }
  ];
  
  // Calculate score for Core Web Vitals
  coreWebVitals.forEach(({ name, weight }) => {
    if (metrics[name] !== undefined && metrics[name] !== null) {
      const threshold = getMetricThreshold(name);
      if (!threshold) return;
      
      // Normalize to 0-100 score
      let metricScore = 100;
      
      if (metrics[name] >= threshold.poor) {
        metricScore = 0;
      } else if (metrics[name] >= threshold.needsImprovement) {
        // Linear scaling from 40 to 70 between needs improvement and good
        metricScore = 70 - ((metrics[name] - threshold.good) / 
                          (threshold.needsImprovement - threshold.good) * 30);
      } else {
        // Linear scaling from 70 to 100 below good threshold
        metricScore = 100 - ((metrics[name] / threshold.good) * 30);
      }
      
      score += metricScore * weight;
      totalWeight += weight;
    }
  });
  
  // Calculate score for secondary metrics
  secondaryMetrics.forEach(({ name, weight }) => {
    if (metrics[name] !== undefined && metrics[name] !== null) {
      const threshold = getMetricThreshold(name);
      if (!threshold) return;
      
      // Normalize to 0-100 score
      let metricScore = 100;
      
      if (metrics[name] >= threshold.poor) {
        metricScore = 0;
      } else if (metrics[name] >= threshold.needsImprovement) {
        metricScore = 70 - ((metrics[name] - threshold.good) / 
                          (threshold.needsImprovement - threshold.good) * 30);
      } else {
        metricScore = 100 - ((metrics[name] / threshold.good) * 30);
      }
      
      score += metricScore * weight;
      totalWeight += weight;
    }
  });
  
  // Normalize score
  const normalizedScore = totalWeight > 0 ? score / totalWeight : 0;
  
  // Determine rating
  let rating = 'Poor';
  if (normalizedScore >= 90) {
    rating = 'Excellent';
  } else if (normalizedScore >= 70) {
    rating = 'Good';
  } else if (normalizedScore >= 50) {
    rating = 'Fair';
  }
  
  return {
    score: Math.round(normalizedScore),
    rating
  };
};

/**
 * Compare two sets of metrics and calculate deltas
 * 
 * @param {Object} metrics1 - First set of metrics (e.g., before optimization)
 * @param {Object} metrics2 - Second set of metrics (e.g., after optimization)
 * @returns {Object} Comparison with deltas and improvement indicators
 */
export const compareMetrics = (metrics1, metrics2) => {
  const result = {
    deltas: {},
    improvements: [],
    regressions: [],
    overallImprovement: 0
  };
  
  // Collect all metric names from both objects
  const allMetrics = new Set([
    ...Object.keys(metrics1 || {}),
    ...Object.keys(metrics2 || {})
  ]);
  
  // Calculate deltas for each metric
  allMetrics.forEach(metric => {
    const value1 = metrics1?.[metric];
    const value2 = metrics2?.[metric];
    
    // Skip if either value is missing
    if (value1 === undefined || value2 === undefined) {
      result.deltas[metric] = null;
      return;
    }
    
    // Calculate raw delta
    const rawDelta = value2 - value1;
    
    // For time/size metrics, lower is better; for score metrics, higher is better
    const isImprovement = ['score', 'performance'].includes(metric.toLowerCase())
      ? rawDelta > 0  // Higher is better for scores
      : rawDelta < 0; // Lower is better for most metrics
    
    // Calculate percentage change
    const percentChange = value1 !== 0
      ? (rawDelta / Math.abs(value1)) * 100
      : 0;
    
    // Save delta info
    result.deltas[metric] = {
      before: value1,
      after: value2,
      rawDelta,
      percentChange: Math.round(percentChange * 10) / 10,
      isImprovement
    };
    
    // Add to improvements or regressions list
    if (isImprovement) {
      result.improvements.push(metric);
    } else if (rawDelta !== 0) {
      result.regressions.push(metric);
    }
  });
  
  // Calculate overall improvement score
  // Weight core web vitals more heavily
  const weights = {
    'LCP': 3,
    'FID': 3,
    'CLS': 3,
    'INP': 3,
    'FCP': 2,
    'TTI': 2,
    'TBT': 2,
    'TTFB': 2,
    'default': 1
  };
  
  let totalImprovement = 0;
  let totalWeight = 0;
  
  Object.entries(result.deltas).forEach(([metric, delta]) => {
    if (!delta || delta.rawDelta === 0) return;
    
    const weight = weights[metric] || weights.default;
    const normalizedImprovement = delta.isImprovement 
      ? Math.min(Math.abs(delta.percentChange), 100) / 100
      : -Math.min(Math.abs(delta.percentChange), 100) / 100;
    
    totalImprovement += normalizedImprovement * weight;
    totalWeight += weight;
  });
  
  result.overallImprovement = totalWeight > 0
    ? Math.round((totalImprovement / totalWeight) * 100)
    : 0;
  
  return result;
};

/**
 * Get appropriate Tailwind CSS color class based on metric value
 * 
 * @param {number} value - Metric value
 * @param {string} metric - Metric name
 * @returns {string} Tailwind color class
 */
export const getMetricColor = (value, metric) => {
  if (value === null || value === undefined) return 'text-gray-500';
  
  const threshold = getMetricThreshold(metric);
  
  // For metrics without defined thresholds
  if (!threshold || threshold.good === 0) return 'text-gray-500';
  
  // Score metrics are inverted (higher is better)
  if (['score', 'performance'].some(term => metric.toLowerCase().includes(term))) {
    if (value >= 90) return 'text-green-500';
    if (value >= 70) return 'text-green-400';
    if (value >= 50) return 'text-yellow-500';
    if (value >= 30) return 'text-orange-500';
    return 'text-red-500';
  }
  
  // Standard metrics (lower is better)
  if (value <= threshold.good) return 'text-green-500';
  if (value <= threshold.needsImprovement) return 'text-yellow-500';
  return 'text-red-500';
};