/**
 * Settings module for SEO Pulse
 * Handles user settings and preferences
 */

// Settings state management
const settings = {
  // User settings with defaults
  userSettings: {
    notifications: {
      email: false,
      browser: true
    },
    scanPreferences: {
      scheduledScans: false,
      scheduledInterval: 'weekly',
      thoroughScan: true
    },
    apiKeys: {
      googleAnalytics: '',
      searchConsole: ''
    }
  },
  
  // Load settings from API
  async loadSettings() {
    try {
      const loadingIndicator = document.getElementById('settings-loading');
      const settingsError = document.getElementById('settings-error');
      
      if (loadingIndicator) loadingIndicator.classList.remove('hidden');
      if (settingsError) settingsError.classList.add('hidden');
      
      // Get settings from API
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'GET',
        headers: auth.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to load settings');
      }
      
      const data = await response.json();
      this.userSettings = { ...this.userSettings, ...data };
      
      // Apply settings to form elements
      this.populateSettingsForm();
      
      if (loadingIndicator) loadingIndicator.classList.add('hidden');
      
    } catch (error) {
      console.error('Settings loading error:', error);
      
      const loadingIndicator = document.getElementById('settings-loading');
      const settingsError = document.getElementById('settings-error');
      
      if (loadingIndicator) loadingIndicator.classList.add('hidden');
      if (settingsError) {
        settingsError.classList.remove('hidden');
        settingsError.textContent = error.message || 'Failed to load settings';
      }
    }
  },
  
  // Save settings to API
  async saveSettings(formData) {
    try {
      const saveButton = document.querySelector('#settings-form button[type="submit"]');
      const saveSuccess = document.getElementById('settings-saved');
      const saveError = document.getElementById('settings-error');
      
      if (saveButton) {
        saveButton.disabled = true;
        saveButton.innerHTML = '<span class="spinner"></span> Saving...';
      }
      
      if (saveError) saveError.classList.add('hidden');
      
      // Update settings object from form data
      this.updateSettingsFromForm(formData);
      
      // Send to API
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: auth.getHeaders(),
        body: JSON.stringify(this.userSettings)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      // Show success message
      if (saveSuccess) {
        saveSuccess.classList.remove('hidden');
        setTimeout(() => {
          saveSuccess.classList.add('hidden');
        }, 3000);
      }
      
    } catch (error) {
      console.error('Settings save error:', error);
      
      const saveError = document.getElementById('settings-error');
      if (saveError) {
        saveError.classList.remove('hidden');
        saveError.textContent = error.message || 'Failed to save settings';
      }
      
    } finally {
      const saveButton = document.querySelector('#settings-form button[type="submit"]');
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = 'Save Changes';
      }
    }
  },
  
  // Update settings object from form values
  updateSettingsFromForm(formData) {
    // Notifications settings
    this.userSettings.notifications.email = formData.get('email-notifications') === 'on';
    this.userSettings.notifications.browser = formData.get('browser-notifications') === 'on';
    
    // Scan preferences
    this.userSettings.scanPreferences.scheduledScans = formData.get('scheduled-scans') === 'on';
    this.userSettings.scanPreferences.scheduledInterval = formData.get('scan-interval');
    this.userSettings.scanPreferences.thoroughScan = formData.get('thorough-scan') === 'on';
    
    // API keys
    this.userSettings.apiKeys.googleAnalytics = formData.get('ga-key');
    this.userSettings.apiKeys.searchConsole = formData.get('search-console-key');
  },
  
  // Populate form with current settings
  populateSettingsForm() {
    // Notifications checkboxes
    const emailNotifications = document.getElementById('email-notifications');
    const browserNotifications = document.getElementById('browser-notifications');
    
    if (emailNotifications) emailNotifications.checked = this.userSettings.notifications.email;
    if (browserNotifications) browserNotifications.checked = this.userSettings.notifications.browser;
    
    // Scan preferences
    const scheduledScans = document.getElementById('scheduled-scans');
    const scanInterval = document.getElementById('scan-interval');
    const thoroughScan = document.getElementById('thorough-scan');
    
    if (scheduledScans) scheduledScans.checked = this.userSettings.scanPreferences.scheduledScans;
    if (scanInterval) scanInterval.value = this.userSettings.scanPreferences.scheduledInterval;
    if (thoroughScan) thoroughScan.checked = this.userSettings.scanPreferences.thoroughScan;
    
    // API keys
    const gaKey = document.getElementById('ga-key');
    const searchConsoleKey = document.getElementById('search-console-key');
    
    if (gaKey) gaKey.value = this.userSettings.apiKeys.googleAnalytics;
    if (searchConsoleKey) searchConsoleKey.value = this.userSettings.apiKeys.searchConsole;
    
    // Toggle dependent form sections
    this.toggleDependentSections();
  },
  
  // Toggle sections that depend on checkbox states
  toggleDependentSections() {
    const scheduledScans = document.getElementById('scheduled-scans');
    const scanIntervalSection = document.getElementById('scan-interval-section');
    
    if (scheduledScans && scanIntervalSection) {
      scanIntervalSection.classList.toggle('hidden', !scheduledScans.checked);
    }
  },
  
  // Change settings tab
  changeTab(tabId) {
    // Hide all sections
    const sections = document.querySelectorAll('.settings-content > .settings-section');
    sections.forEach(section => {
      section.classList.add('hidden');
    });
    
    // Show selected section
    const selectedSection = document.getElementById(tabId);
    if (selectedSection) {
      selectedSection.classList.remove('hidden');
    }
    
    // Update nav items
    const navItems = document.querySelectorAll('.settings-nav-item');
    navItems.forEach(item => {
      item.classList.remove('active');
    });
    
    const activeNavItem = document.querySelector(`.settings-nav-item[data-tab="${tabId}"]`);
    if (activeNavItem) {
      activeNavItem.classList.add('active');
    }
  }
};

// DOM Ready - Initialize Settings
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the settings page
  if (!document.getElementById('settings-page')) return;
  
  // Check authentication
  if (!auth.isAuthenticated) {
    window.location.href = '/login.html?redirect=settings.html';
    return;
  }
  
  // Load settings data
  settings.loadSettings();
  
  // Setup settings form
  const settingsForm = document.getElementById('settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(settingsForm);
      settings.saveSettings(formData);
    });
  }
  
  // Setup scheduled scans toggle
  const scheduledScans = document.getElementById('scheduled-scans');
  if (scheduledScans) {
    scheduledScans.addEventListener('change', () => {
      settings.toggleDependentSections();
    });
  }
  
  // Setup tab navigation
  const navItems = document.querySelectorAll('.settings-nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = item.dataset.tab;
      settings.changeTab(tabId);
    });
  });
});