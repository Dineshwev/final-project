// src/hooks/useScanResults.ts
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ScanResultsService, { ScanResultsData } from '../services/scanResultsService';

interface UseScanResultsOptions {
  serviceName?: string;
  autoFetch?: boolean;
}

interface UseScanResultsReturn {
  scanResults: ScanResultsData | null;
  serviceData: any | null;
  hasServiceData: boolean;
  serviceStatus: string;
  loading: boolean;
  error: string | null;
  refreshResults: () => void;
}

export const useScanResults = (options: UseScanResultsOptions = {}): UseScanResultsReturn => {
  const { serviceName, autoFetch = true } = options;
  const location = useLocation();
  
  const [scanResults, setScanResults] = useState<ScanResultsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get scan ID from URL params or localStorage
  const getScanId = (): string | null => {
    const urlParams = new URLSearchParams(location.search);
    const scanFromUrl = urlParams.get('scanId');
    
    if (scanFromUrl) {
      return scanFromUrl;
    }

    return ScanResultsService.getLastScanId();
  };

  const fetchResults = async () => {
    const scanId = getScanId();
    
    if (!scanId) {
      setError('No scan ID available. Please run a scan first.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await ScanResultsService.getScanResults(scanId);
      
      if (results) {
        setScanResults(results);
        setError(null);
      } else {
        setError('Failed to load scan results. The scan may not exist or may have expired.');
      }
    } catch (err) {
      console.error('Error fetching scan results:', err);
      setError('Failed to load scan results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshResults = () => {
    const scanId = getScanId();
    if (scanId) {
      ScanResultsService.clearCache(scanId);
    }
    fetchResults();
  };

  useEffect(() => {
    if (autoFetch) {
      fetchResults();
    }
  }, [location.search, autoFetch]);

  // Get service-specific data
  const serviceData = serviceName 
    ? ScanResultsService.getServiceData(scanResults, serviceName)
    : null;

  const hasServiceData = serviceName 
    ? ScanResultsService.hasServiceData(scanResults, serviceName)
    : false;

  const serviceStatus = serviceName 
    ? ScanResultsService.getServiceStatus(scanResults, serviceName)
    : 'No service specified';

  return {
    scanResults,
    serviceData,
    hasServiceData,
    serviceStatus,
    loading,
    error,
    refreshResults
  };
};

export default useScanResults;