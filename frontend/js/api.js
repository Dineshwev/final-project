// API integration for the frontend

// Base API URL - update this to your production API URL when deployed
const API_BASE_URL = 'https://inrpws5mww.ap-southeast-2.awsapprunner.com/api';
console.log('API_BASE_URL is set to:', API_BASE_URL);

// Export functions to global scope for use in HTML script tags
window.checkApiConnection = checkApiConnection;
window.analyzeSite = analyzeSite;
window.getBacklinkSummary = getBacklinkSummary;
window.getScanHistory = getScanHistory;
window.startScan = startScan;
window.getScanReport = getScanReport;

/**
 * Check API connection and update status indicator
 */
async function checkApiConnection() {
  console.log('Checking API connection to:', `${API_BASE_URL}`);
  const statusIndicator = document.getElementById('api-connection-status');
  if (!statusIndicator) {
    console.log('Warning: Status indicator element not found in DOM');
    return;
  }
  
  try {
    console.log('Sending API test request...');
    // Add credentials and proper headers
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
        'Origin': window.location.origin
      },
      credentials: 'include',
      // Short timeout to quickly identify connection issues
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      console.log('API Connection: Success with status', response.status);
      const data = await response.json();
      console.log('API Response:', data);
      
      statusIndicator.className = 'status-indicator status-connected';
      statusIndicator.querySelector('.status-text').textContent = 'API: Connected';
      return true;
    } else {
      console.error('API Connection: Failed with status', response.status);
      statusIndicator.className = 'status-indicator status-error';
      statusIndicator.querySelector('.status-text').textContent = `API: Error (${response.status})`;
      return false;
    }
  } catch (error) {
    console.error('API Connection Error:', error.message);
    statusIndicator.className = 'status-indicator status-error';
    
    // Handle CSP errors specifically
    if (error.message.includes('Content Security Policy')) {
      statusIndicator.querySelector('.status-text').textContent = 'API: Security policy error. Please check server configuration.';
    } else {
      statusIndicator.querySelector('.status-text').textContent = `API: ${error.message}`;
    }
    
    return false;
  }
}

// Check API connection when page loads
document.addEventListener('DOMContentLoaded', () => {
  checkApiConnection();
});

/**
 * Analyze a website URL and get SEO health report
 * @param {string} url - The website URL to analyze
 * @returns {Promise<Object>} - The SEO health report
 */
async function analyzeSite(url) {
  try {
    // Check API connection first
    const isConnected = await checkApiConnection();
    if (!isConnected) {
      throw new Error('Cannot connect to API server. Please ensure the backend is running and accessible.');
    }
    
    // Show loading state
    document.dispatchEvent(new CustomEvent('api-request-start', { detail: { type: 'analyze', url } }));
    
    // Get the auth token
    const token = localStorage.getItem('authToken') || '';
    
    // Include the auth token in the request headers
    const response = await fetch(`${API_BASE_URL}/seo/analyze?url=${encodeURIComponent(url)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to analyze website (Status: ${response.status})`);
    }
    
    const data = await response.json();
    
    // Request completed successfully
    document.dispatchEvent(new CustomEvent('api-request-success', { detail: { type: 'analyze', data } }));
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    
    // Notify about the error
    document.dispatchEvent(new CustomEvent('api-request-error', { 
      detail: { type: 'analyze', error: error.message }
    }));
    
    throw error;
  } finally {
    // Always mark request as complete
    document.dispatchEvent(new CustomEvent('api-request-complete', { detail: { type: 'analyze' } }));
  }
}

/**
 * Get backlink summary for a website URL
 * @param {string} url - The website URL to get backlinks for
 * @returns {Promise<Object>} - The backlink summary data
 */
async function getBacklinkSummary(url) {
  try {
    const response = await fetch(`${API_BASE_URL}/backlinks?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch backlink data');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Get scan history for a website URL
 * @param {string} url - The website URL to get history for
 * @returns {Promise<Object>} - The scan history data
 */
async function getScanHistory(url) {
  try {
    const response = await fetch(`${API_BASE_URL}/history/${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch scan history');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Start a new scan for a website URL
 * @param {string} url - The website URL to scan
 * @returns {Promise<Object>} - The scan result data
 */
async function startScan(url) {
  try {
    // Get the auth token
    const token = localStorage.getItem('authToken') || '';
    
    const response = await fetch(`${API_BASE_URL}/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ url })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to start scan');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Get a scan report for a website URL
 * @param {string} url - The website URL to get the report for
 * @returns {Promise<Object>} - The scan report data
 */
async function getScanReport(url) {
  try {
    const response = await fetch(`${API_BASE_URL}/report/${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch scan report');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Export a scan report as PDF
 * @param {string} url - The website URL to export
 * @returns {Promise<Blob>} - The PDF file as a Blob
 */
async function exportPDF(url) {
  try {
    const response = await fetch(`${API_BASE_URL}/export/pdf/${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to export PDF');
    }
    
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Trigger a PDF download for a website URL
 * @param {string} url - The website URL to generate PDF for
 */
function downloadPDF(url) {
  exportPDF(url)
    .then(blob => {
      // Create a temporary URL for the blob
      const blobUrl = URL.createObjectURL(blob);
      
      // Create a link element
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${new URL(url).hostname}-seo-report.pdf`;
      
      // Append to the document, click it, then remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Release the blob URL
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    })
    .catch(error => {
      console.error('Download error:', error);
      alert(`Failed to download PDF: ${error.message}`);
    });
}

/**
 * Handle loading state UI changes
 * @param {HTMLElement} button - The button element to update
 * @param {boolean} isLoading - Whether loading is in progress
 * @param {string} loadingText - The text to show during loading
 * @param {string} defaultText - The default button text
 */
function toggleLoadingState(button, isLoading, loadingText = 'Loading...', defaultText = 'Submit') {
  if (isLoading) {
    button.disabled = true;
    button.innerHTML = `<div class="loading"></div> ${loadingText}`;
  } else {
    button.disabled = false;
    button.innerHTML = defaultText;
  }
}

/**
 * Display error message to the user
 * @param {string} message - The error message to display
 */
function showError(message) {
  // Check if an error container exists, create one if not
  let errorContainer = document.getElementById('error-container');
  if (!errorContainer) {
    errorContainer = document.createElement('div');
    errorContainer.id = 'error-container';
    errorContainer.className = 'alert alert-danger mt-3';
    errorContainer.style.display = 'none';
    
    // Find a good place to insert it (adjust selector as needed)
    const insertPoint = document.querySelector('.url-form') || document.body;
    insertPoint.parentNode.insertBefore(errorContainer, insertPoint.nextSibling);
  }
  
  // Update and show the error
  errorContainer.textContent = message;
  errorContainer.style.display = 'block';
  
  // Hide after 5 seconds
  setTimeout(() => {
    errorContainer.style.display = 'none';
  }, 5000);
}

/**
 * Get authenticated user's profile
 */
async function getUserProfile() {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get user profile: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting user profile:', error);
    showError('Failed to get user profile');
    return null;
  }
}

/**
 * Update user profile
 */
async function updateUserProfile(profileData) {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update user profile: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating user profile:', error);
    showError('Failed to update user profile');
    return null;
  }
}

/**
 * Get user's API keys
 */
async function getApiKeys() {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/user/api-keys`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get API keys: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting API keys:', error);
    showError('Failed to get API keys');
    return null;
  }
}

/**
 * Update user's API keys
 */
async function updateApiKeys(apiKeys) {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/user/api-keys`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(apiKeys)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update API keys: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating API keys:', error);
    showError('Failed to update API keys');
    return null;
  }
}

/**
 * Check API status including API key availability
 */
async function checkApiStatus() {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to check API status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error checking API status:', error);
    return {
      status: 'error',
      message: error.message
    };
  }
}

/**
 * Helper function to get auth token
 */
async function getAuthToken() {
  // In a real app, this would get the token from Firebase or your auth system
  // For now, we'll return a mock token or empty string
  return localStorage.getItem('authToken') || '';
}

// Export API functions
const seoApi = {
  analyzeSite,
  getBacklinkSummary,
  getScanHistory,
  startScan,
  getScanReport,
  exportPDF,
  downloadPDF,
  toggleLoadingState,
  showError,
  // User profile and API key methods
  getUserProfile,
  updateUserProfile,
  getApiKeys,
  updateApiKeys,
  checkApiStatus
};

// For script tag inclusion
window.seoApi = seoApi;