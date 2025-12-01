/**
 * Load environment variables from .env file and provide secure access to them
 */

class EnvironmentConfig {
  constructor() {
    this.variables = {};
    this.loadFromMeta();
  }

  // Load environment variables from meta tags in HTML
  loadFromMeta() {
    const metaTags = document.querySelectorAll('meta[name^="env-"]');
    metaTags.forEach(tag => {
      const key = tag.getAttribute('name').replace('env-', '').toUpperCase();
      const value = tag.getAttribute('content');
      this.variables[key] = value;
    });
  }

  // Get a variable with validation
  get(key) {
    const value = this.variables[key.toUpperCase()];
    if (!value && value !== '') {
      console.warn(`Environment variable ${key} not found`);
      return null;
    }
    return value;
  }
  
  // Get Firebase configuration
  getFirebaseConfig() {
    return {
      apiKey: this.get('FIREBASE_API_KEY'),
      authDomain: this.get('FIREBASE_AUTH_DOMAIN'),
      projectId: this.get('FIREBASE_PROJECT_ID'),
      storageBucket: this.get('FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: this.get('FIREBASE_MESSAGING_SENDER_ID'),
      appId: this.get('FIREBASE_APP_ID'),
      measurementId: this.get('FIREBASE_MEASUREMENT_ID')
    };
  }
}

// Create and export singleton instance
const envConfig = new EnvironmentConfig();
export default envConfig;