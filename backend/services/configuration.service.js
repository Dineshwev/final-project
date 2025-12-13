/**
 * Configuration Service
 * Manages environment variables, secrets, and startup validation
 */

class ConfigurationService {
  constructor() {
    this.requiredEnvVars = [
      'NODE_ENV',
      'PORT',
      'GEMINI_API_KEY',
      'DB_HOST',
      'DB_PORT',
      'DB_NAME',
      'DB_USER',
      'DB_PASSWORD'
    ];
    
    this.optionalEnvVars = [
      'CACHE_TTL_HOURS',
      'MAX_CONCURRENT_SCANS',
      'RATE_LIMIT_ENABLED',
      'LOG_LEVEL',
      'HEALTH_CHECK_ENABLED',
      'CORS_ORIGINS',
      'SESSION_SECRET',
      'ENCRYPTION_KEY'
    ];
    
    this.config = null;
    this.isValidated = false;
  }

  /**
   * Validate and load configuration at startup
   * @param {boolean} failFast - Whether to throw error on missing required vars
   */
  validateAndLoad(failFast = true) {
    console.log('🔧 Validating environment configuration...');
    
    const config = {};
    const missingRequired = [];
    const warnings = [];

    // Check required environment variables
    for (const envVar of this.requiredEnvVars) {
      const value = process.env[envVar];
      
      if (!value) {
        missingRequired.push(envVar);
      } else {
        config[envVar] = this.parseEnvValue(value, envVar);
      }
    }

    // Check optional environment variables
    for (const envVar of this.optionalEnvVars) {
      const value = process.env[envVar];
      if (value) {
        config[envVar] = this.parseEnvValue(value, envVar);
      } else {
        config[envVar] = this.getDefaultValue(envVar);
      }
    }

    // Validate required variables
    if (missingRequired.length > 0) {
      const message = `Missing required environment variables: ${missingRequired.join(', ')}`;
      console.error('❌', message);
      
      if (failFast) {
        throw new Error(message);
      }
    }

    // Validate configuration values
    const validationErrors = this.validateConfigValues(config);
    if (validationErrors.length > 0) {
      const message = `Configuration validation errors: ${validationErrors.join(', ')}`;
      console.error('❌', message);
      
      if (failFast) {
        throw new Error(message);
      }
    }

    // Set defaults and derived values
    this.setDerivedConfig(config);
    
    this.config = config;
    this.isValidated = true;

    console.log('✅ Environment configuration validated successfully');
    console.log(`📍 Environment: ${config.NODE_ENV}`);
    console.log(`🌐 Port: ${config.PORT}`);
    console.log(`🔒 Database: ${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`);
    
    if (warnings.length > 0) {
      console.warn('⚠️  Configuration warnings:');
      warnings.forEach(warning => console.warn('   -', warning));
    }

    return config;
  }

  /**
   * Parse environment variable value
   */
  parseEnvValue(value, envVar) {
    // Boolean values
    if (['RATE_LIMIT_ENABLED', 'HEALTH_CHECK_ENABLED'].includes(envVar)) {
      return value.toLowerCase() === 'true';
    }
    
    // Numeric values
    if (['PORT', 'DB_PORT', 'CACHE_TTL_HOURS', 'MAX_CONCURRENT_SCANS'].includes(envVar)) {
      const num = parseInt(value);
      if (isNaN(num)) {
        throw new Error(`${envVar} must be a valid number, got: ${value}`);
      }
      return num;
    }
    
    // Array values
    if (envVar === 'CORS_ORIGINS') {
      return value.split(',').map(origin => origin.trim());
    }
    
    // String values (default)
    return value.trim();
  }

  /**
   * Get default values for optional environment variables
   */
  getDefaultValue(envVar) {
    const defaults = {
      CACHE_TTL_HOURS: 12,
      MAX_CONCURRENT_SCANS: 100,
      RATE_LIMIT_ENABLED: true,
      LOG_LEVEL: 'info',
      HEALTH_CHECK_ENABLED: true,
      CORS_ORIGINS: ['http://localhost:3000', 'http://localhost:3001'],
      SESSION_SECRET: this.generateRandomSecret(32),
      ENCRYPTION_KEY: this.generateRandomSecret(16)
    };
    
    return defaults[envVar];
  }

  /**
   * Validate configuration values
   */
  validateConfigValues(config) {
    const errors = [];
    
    // Validate NODE_ENV
    if (!['development', 'production', 'test'].includes(config.NODE_ENV)) {
      errors.push('NODE_ENV must be development, production, or test');
    }
    
    // Validate PORT
    if (config.PORT < 1 || config.PORT > 65535) {
      errors.push('PORT must be between 1 and 65535');
    }
    
    // Validate database port
    if (config.DB_PORT < 1 || config.DB_PORT > 65535) {
      errors.push('DB_PORT must be between 1 and 65535');
    }
    
    // Validate API key format (basic check)
    if (config.GEMINI_API_KEY && config.GEMINI_API_KEY.length < 20) {
      errors.push('GEMINI_API_KEY appears to be invalid (too short)');
    }
    
    // Validate cache TTL
    if (config.CACHE_TTL_HOURS < 1 || config.CACHE_TTL_HOURS > 168) {
      errors.push('CACHE_TTL_HOURS must be between 1 and 168 (1 week)');
    }
    
    return errors;
  }

  /**
   * Set derived configuration values
   */
  setDerivedConfig(config) {
    // Database URL
    config.DATABASE_URL = `postgresql://${config.DB_USER}:${config.DB_PASSWORD}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`;
    
    // Is production environment
    config.IS_PRODUCTION = config.NODE_ENV === 'production';
    config.IS_DEVELOPMENT = config.NODE_ENV === 'development';
    
    // Security settings
    config.SECURE_COOKIES = config.IS_PRODUCTION;
    config.TRUST_PROXY = config.IS_PRODUCTION;
    
    // Timeouts in milliseconds
    config.SERVICE_TIMEOUT_MS = 20000;
    config.SCAN_TIMEOUT_MS = 120000;
    
    // Rate limiting configuration
    config.RATE_LIMITS = {
      SCAN_CREATION: { window: 60000, max: 10 },
      POLLING: { window: 60000, max: 60 },
      RETRY: { window: 60000, max: 5 }
    };
  }

  /**
   * Generate random secret for defaults
   */
  generateRandomSecret(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Get configuration value
   */
  get(key, defaultValue = null) {
    if (!this.isValidated) {
      throw new Error('Configuration not validated. Call validateAndLoad() first.');
    }
    
    return this.config[key] !== undefined ? this.config[key] : defaultValue;
  }

  /**
   * Check if running in production
   */
  isProduction() {
    return this.get('IS_PRODUCTION', false);
  }

  /**
   * Check if running in development
   */
  isDevelopment() {
    return this.get('IS_DEVELOPMENT', false);
  }

  /**
   * Get database configuration
   */
  getDatabaseConfig() {
    return {
      host: this.get('DB_HOST'),
      port: this.get('DB_PORT'),
      database: this.get('DB_NAME'),
      user: this.get('DB_USER'),
      password: this.get('DB_PASSWORD'),
      url: this.get('DATABASE_URL')
    };
  }

  /**
   * Get API keys (without exposing them in logs)
   */
  getApiKeys() {
    return {
      gemini: this.get('GEMINI_API_KEY'),
      // Add other API keys as needed
    };
  }

  /**
   * Get security configuration
   */
  getSecurityConfig() {
    return {
      sessionSecret: this.get('SESSION_SECRET'),
      encryptionKey: this.get('ENCRYPTION_KEY'),
      secureCookies: this.get('SECURE_COOKIES'),
      trustProxy: this.get('TRUST_PROXY'),
      rateLimitEnabled: this.get('RATE_LIMIT_ENABLED'),
      corsOrigins: this.get('CORS_ORIGINS')
    };
  }

  /**
   * Sanitize configuration for logging (remove sensitive data)
   */
  getSanitizedConfig() {
    const sanitized = { ...this.config };
    
    // Remove sensitive fields
    const sensitiveFields = [
      'GEMINI_API_KEY',
      'DB_PASSWORD',
      'SESSION_SECRET',
      'ENCRYPTION_KEY',
      'DATABASE_URL'
    ];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  /**
   * Validate specific secret format
   */
  validateSecret(secret, minLength = 16) {
    if (!secret || typeof secret !== 'string') {
      return false;
    }
    
    if (secret.length < minLength) {
      return false;
    }
    
    // Check for basic entropy (at least some variety in characters)
    const uniqueChars = new Set(secret).size;
    return uniqueChars >= Math.min(8, secret.length / 2);
  }

  /**
   * Get current configuration status
   */
  getStatus() {
    return {
      isValidated: this.isValidated,
      environment: this.get('NODE_ENV'),
      hasRequiredSecrets: this.validateSecret(this.get('GEMINI_API_KEY'), 20),
      timestamp: new Date().toISOString()
    };
  }
}

export default new ConfigurationService();