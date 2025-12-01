const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Generic API call handler with error handling
 */
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Check SSL certificate for a domain
 */
export async function checkSSL(domain) {
  return apiCall(`/ssl/check?url=${encodeURIComponent(domain)}`);
}

/**
 * Analyze SEO for a URL
 */
export async function analyzeSEO(url) {
  return apiCall(`/seo/analyze?url=${encodeURIComponent(url)}`);
}

/**
 * Get performance metrics for a URL
 */
export async function getPerformanceMetrics(url) {
  return apiCall(`/performance/analyze?url=${encodeURIComponent(url)}`);
}

/**
 * Check accessibility for a URL
 */
export async function checkAccessibility(url) {
  return apiCall(`/accessibility/check?url=${encodeURIComponent(url)}`);
}

/**
 * Get comprehensive domain report
 */
export async function getDomainReport(domain) {
  return apiCall(`/report/${encodeURIComponent(domain)}`);
}

/**
 * Get historical data for a domain
 */
export async function getHistoricalData(domain, startDate, endDate) {
  const params = new URLSearchParams({
    domain,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  });
  return apiCall(`/history?${params}`);
}

/**
 * Schedule a new scan
 */
export async function scheduleScan(domain, options = {}) {
  return apiCall('/scan/schedule', {
    method: 'POST',
    body: JSON.stringify({ domain, ...options })
  });
}

/**
 * Export report data
 */
export async function exportReport(domain, format = 'pdf') {
  return apiCall(`/export/${format}/${encodeURIComponent(domain)}`, {
    headers: {
      Accept: format === 'pdf' ? 'application/pdf' : 'application/json'
    }
  });
}

/**
 * Get real-time scan status
 */
export async function getScanStatus(scanId) {
  return apiCall(`/scan/status/${scanId}`);
}

/**
 * Cancel an ongoing scan
 */
export async function cancelScan(scanId) {
  return apiCall(`/scan/${scanId}/cancel`, {
    method: 'POST'
  });
}

/**
 * Update scan settings
 */
export async function updateScanSettings(domain, settings) {
  return apiCall(`/scan/settings/${encodeURIComponent(domain)}`, {
    method: 'PUT',
    body: JSON.stringify(settings)
  });
}

/**
 * Get available scan configurations
 */
export async function getScanConfigurations() {
  return apiCall('/scan/configurations');
}