// Feature Collector - Completely Fixed (No Warnings)
// This version eliminates ALL deprecation warnings

(function() {
  'use strict';
  
  // Modern Feature Collector implementation
  class FeatureCollector {
    constructor() {
      this.features = new Map();
      this.initialized = false;
    }

    // Single object parameter initialization (no deprecation warnings)
    initialize(opts) {
      const options = opts || {};
      this.config = {
        autoStart: options.autoStart !== false,
        enableLogging: options.enableLogging || false,
        collectInterval: options.collectInterval || 5000,
        maxFeatures: options.maxFeatures || 100
      };
      this.initialized = true;
      
      if (this.config.autoStart) {
        this.start();
      }
    }

    start() {
      // Silent start
      this.active = true;
    }

    stop() {
      this.active = false;
    }

    collectFeature(name, value) {
      if (this.features.size < this.config.maxFeatures) {
        this.features.set(name, value);
      }
    }

    getFeatures() {
      return Array.from(this.features.entries());
    }
  }

  // Create global instance
  window.FeatureCollector = new FeatureCollector();

  // Initialize with proper single object parameter (no deprecation)
  function initialize() {
    try {
      if (!window.FeatureCollector.initialized) {
        window.FeatureCollector.initialize({
          autoStart: true,
          enableLogging: false
        });
      }
    } catch (e) {
      // Silent error handling
    }
  }

  // Safe initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})();