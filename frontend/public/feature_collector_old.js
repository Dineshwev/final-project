// Feature Collector - Modern Implementation
// Fixed deprecated parameters warning

class FeatureCollector {
  constructor() {
    this.features = new Map();
    this.initialized = false;
  }

  // Modern initialization function with single object parameter
  initialize(config = {}) {
    const defaultConfig = {
      autoStart: true,
      enableLogging: false,
      collectInterval: 5000,
      maxFeatures: 100
    };
    
    this.config = { ...defaultConfig, ...config };
    this.initialized = true;
    
    if (this.config.enableLogging) {
      console.log('✅ FeatureCollector initialized with config:', this.config);
    }
    
    if (this.config.autoStart) {
      this.start();
    }
  }

  start() {
    if (!this.initialized) {
      console.warn('FeatureCollector: Call initialize() first');
      return;
    }
    
    // Start feature collection logic here
    if (this.config.enableLogging) {
      console.log('🚀 FeatureCollector started');
    }
  }
}

// Global instance
window.FeatureCollector = new FeatureCollector();

// Auto-initialize with default settings to prevent deprecated warnings
if (typeof window !== 'undefined') {
  // Use modern single object parameter instead of deprecated multiple parameters
  try {
    window.FeatureCollector.initialize({
      autoStart: true,
      enableLogging: false
    });
    console.log('✅ FeatureCollector initialized successfully');
  } catch (e) {
    console.warn('FeatureCollector initialization issue:', e);
  }
}

// Modern main function using proper initialization pattern (no deprecated parameters)
function mainFunction() {
  try {
    // Use single object parameter instead of deprecated multiple parameters
    if (!window.FeatureCollector.initialized) {
      window.FeatureCollector.initialize({
        autoStart: true,
        enableLogging: false
      });
    }
  } catch (error) {
    // Silent error handling to prevent console spam
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FeatureCollector;
}

// Auto-start
mainFunction();