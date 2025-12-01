// Profile page functionality

document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyForm = document.getElementById('api-key-form');
  const profileInfoContainer = document.getElementById('profile-info');
  const apiStatusContainer = document.getElementById('api-status');
  
  // Check if page has the profile elements
  if (!apiKeyForm && !profileInfoContainer) {
    console.log('Not on profile page, skipping profile.js initialization');
    return;
  }
  
  console.log('Initializing profile page');
  
  // Load user profile and API keys
  await loadUserProfile();
  
  // Set up form submission for API keys
  if (apiKeyForm) {
    apiKeyForm.addEventListener('submit', handleApiKeyFormSubmit);
  }
  
  // Check API status
  await checkApiKeyStatus();
});

/**
 * Load user profile data
 */
async function loadUserProfile() {
  try {
    // Show loading state
    seoApi.toggleLoadingState(true, 'Loading profile...');
    
    // Get user profile from API
    const profileData = await seoApi.getUserProfile();
    
    if (!profileData) {
      console.error('Failed to load profile data');
      return;
    }
    
    // Display user info
    updateProfileDisplay(profileData);
    
    // Load API keys
    const apiKeysData = await seoApi.getApiKeys();
    
    if (apiKeysData && apiKeysData.apiKeys) {
      populateApiKeyForm(apiKeysData.apiKeys);
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    seoApi.showError('Failed to load profile: ' + error.message);
  } finally {
    // Hide loading state
    seoApi.toggleLoadingState(false);
  }
}

/**
 * Handle API key form submission
 */
async function handleApiKeyFormSubmit(event) {
  event.preventDefault();
  
  // Show loading state
  seoApi.toggleLoadingState(true, 'Saving API keys...');
  
  try {
    // Get form values
    const pageSpeedInsightsKey = document.getElementById('psi-api-key').value.trim();
    const whoApiKey = document.getElementById('whoapi-key').value.trim();
    const safeBrowsingApiKey = document.getElementById('safe-browsing-api-key').value.trim();
    
    // Prepare API key data
    const apiKeys = {
      pageSpeedInsightsKey,
      whoApiKey,
      safeBrowsingApiKey
    };
    
    // Update API keys
    const result = await seoApi.updateApiKeys({ apiKeys });
    
    if (result && result.success) {
      // Show success message
      const messageContainer = document.getElementById('api-key-message');
      if (messageContainer) {
        messageContainer.textContent = 'API keys updated successfully';
        messageContainer.className = 'success-message';
        
        // Hide message after a few seconds
        setTimeout(() => {
          messageContainer.textContent = '';
          messageContainer.className = '';
        }, 3000);
      }
      
      // Update API status display
      await checkApiKeyStatus();
    }
  } catch (error) {
    console.error('Error saving API keys:', error);
    seoApi.showError('Failed to save API keys: ' + error.message);
  } finally {
    // Hide loading state
    seoApi.toggleLoadingState(false);
  }
}

/**
 * Update profile display with user data
 */
function updateProfileDisplay(profileData) {
  const profileInfoContainer = document.getElementById('profile-info');
  
  if (!profileInfoContainer) return;
  
  // Display user information
  profileInfoContainer.innerHTML = `
    <div class="profile-header">
      <h2>${profileData.profile.displayName || 'User'}</h2>
      <p>${profileData.profile.email || ''}</p>
    </div>
  `;
}

/**
 * Populate API key form with existing values
 */
function populateApiKeyForm(apiKeys) {
  const psiInput = document.getElementById('psi-api-key');
  const whoApiInput = document.getElementById('whoapi-key');
  const safeBrowsingInput = document.getElementById('safe-browsing-api-key');
  
  if (psiInput) psiInput.value = apiKeys.pageSpeedInsightsKey || '';
  if (whoApiInput) whoApiInput.value = apiKeys.whoApiKey || '';
  if (safeBrowsingInput) safeBrowsingInput.value = apiKeys.safeBrowsingApiKey || '';
}

/**
 * Check API key status and display it
 */
async function checkApiKeyStatus() {
  const apiStatusContainer = document.getElementById('api-status');
  
  if (!apiStatusContainer) return;
  
  try {
    const statusData = await seoApi.checkApiStatus();
    
    if (statusData && statusData.status === 'ok') {
      const apis = statusData.apis;
      
      apiStatusContainer.innerHTML = `
        <h3>API Service Status</h3>
        <ul class="api-status-list">
          <li class="${apis.pageSpeedInsights ? 'available' : 'unavailable'}">
            PageSpeed Insights API: ${apis.pageSpeedInsights ? 'Available' : 'Not configured'}
          </li>
          <li class="${apis.whoApi ? 'available' : 'unavailable'}">
            WhoAPI: ${apis.whoApi ? 'Available' : 'Not configured'}
          </li>
          <li class="${apis.safeBrowsing ? 'available' : 'unavailable'}">
            Safe Browsing API: ${apis.safeBrowsing ? 'Available' : 'Not configured'}
          </li>
        </ul>
      `;
    } else {
      apiStatusContainer.innerHTML = `
        <h3>API Service Status</h3>
        <p class="error-message">Failed to check API status</p>
      `;
    }
  } catch (error) {
    console.error('Error checking API status:', error);
    apiStatusContainer.innerHTML = `
      <h3>API Service Status</h3>
      <p class="error-message">Error: ${error.message}</p>
    `;
  }
}