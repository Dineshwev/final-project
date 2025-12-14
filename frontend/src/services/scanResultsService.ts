// src/services/scanResultsService.ts
import apiService from './api';

export interface ScanResultsData {
  scanId: string;
  url: string;
  status: string;
  services: {
    duplicateContent?: any;
    accessibility?: any;
    backlinks?: any;
    schema?: any;
    multiLanguage?: any;
    rankTracker?: any;
    [key: string]: any;
  };
}

export class ScanResultsService {
  private static cache = new Map<string, ScanResultsData>();
  private static cacheExpiry = new Map<string, number>();
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get scan results by scan ID with caching
   */
  static async getScanResults(scanId: string): Promise<ScanResultsData | null> {
    // Check cache first
    const cached = this.cache.get(scanId);
    const expiry = this.cacheExpiry.get(scanId);
    
    if (cached && expiry && Date.now() < expiry) {
      return cached;
    }

    try {
      const response = await apiService.getScanResults(scanId);
      
      if (response.success && response.data) {
        // Map from response.data.data.results (backend structure)
        const results = response.data.data?.results || response.data.services || {};
        
        const scanData: ScanResultsData = {
          scanId: response.data.data?.scanId || response.data.scanId,
          url: response.data.data?.url || response.data.url,
          status: response.data.data?.status || response.data.status,
          services: results
        };

        // Debug: Console log to confirm keys exist
        console.log('Scan Results Services:', scanData.services);
        console.log('Available service keys:', Object.keys(scanData.services));

        // Cache the result
        this.cache.set(scanId, scanData);
        this.cacheExpiry.set(scanId, Date.now() + this.CACHE_DURATION);
        
        return scanData;
      }
    } catch (error) {
      console.error('Failed to fetch scan results:', error);
    }

    return null;
  }

  /**
   * Get specific service data from scan results
   */
  static getServiceData(scanResults: ScanResultsData | null, serviceName: string): any | null {
    if (!scanResults || !scanResults.services) {
      return null;
    }
    
    return scanResults.services[serviceName] || null;
  }

  /**
   * Check if a service has data available
   */
  static hasServiceData(scanResults: ScanResultsData | null, serviceName: string): boolean {
    const serviceData = this.getServiceData(scanResults, serviceName);
    return serviceData && serviceData.status !== 'error' && serviceData.status !== 'pending';
  }

  /**
   * Get service status message
   */
  static getServiceStatus(scanResults: ScanResultsData | null, serviceName: string): string {
    const serviceData = this.getServiceData(scanResults, serviceName);
    
    if (!serviceData) {
      return 'No scan data available. Please run a scan first.';
    }
    
    if (serviceData.status === 'error') {
      return serviceData.error || 'Service temporarily unavailable. Please try again.';
    }
    
    if (serviceData.status === 'pending') {
      return 'Analysis in progress. Please wait for scan completion.';
    }
    
    return 'Data available';
  }

  /**
   * Clear cache for a specific scan
   */
  static clearCache(scanId: string): void {
    this.cache.delete(scanId);
    this.cacheExpiry.delete(scanId);
  }

  /**
   * Clear all cache
   */
  static clearAllCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * Get the most recent scan ID from URL params or localStorage
   */
  static getLastScanId(): string | null {
    // Try URL params first
    const urlParams = new URLSearchParams(window.location.search);
    const scanFromUrl = urlParams.get('scanId');
    
    if (scanFromUrl) {
      return scanFromUrl;
    }

    // Fallback to localStorage
    return localStorage.getItem('lastScanId');
  }

  /**
   * Save scan ID to localStorage
   */
  static saveLastScanId(scanId: string): void {
    localStorage.setItem('lastScanId', scanId);
  }
}

export default ScanResultsService;