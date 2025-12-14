/**
 * Simple scan service for Home Page integration
 * 
 * This is a simplified version that directly calls the /api/basic-scan endpoint
 * without the complex scan-modes architecture.
 */

export interface SimpleScanResult {
  title?: string;
  metaDescription?: string;
  h1Count?: number;
  httpsStatus?: boolean;
  score?: number;
  url?: string;
}

export interface SimpleScanResponse {
  success: boolean;
  data?: SimpleScanResult;
  message?: string;
}

/**
 * Execute a basic website scan using the /api/basic-scan endpoint
 * 
 * @param url - Website URL to scan
 * @returns Promise with scan results
 */
export async function executeSimpleBasicScan(url: string): Promise<SimpleScanResult> {
  try {
    // Validate URL
    if (!url || typeof url !== 'string') {
      throw new Error('Valid URL is required for scan');
    }

    // Try to construct URL to validate format
    try {
      new URL(url);
    } catch {
      throw new Error('Please enter a valid website URL (e.g., https://example.com)');
    }

    // Prepare scan request
    const response = await fetch('/api/basic-scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url.trim()
      }),
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      if (response.status === 408 || response.status === 504) {
        throw new Error('Scan timed out. Please try again with a faster website.');
      }
      if (response.status >= 500) {
        throw new Error('Server error. Please try again in a moment.');
      }
      throw new Error('Unable to scan website. Please check the URL and try again.');
    }

    const result: SimpleScanResponse = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.message || 'Scan failed. Please try again.');
    }

    return result.data;

  } catch (error: any) {
    // Handle timeout errors
    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      throw new Error('Scan timed out. Please try again with a faster website.');
    }

    // Handle network errors
    if (error.name === 'TypeError' && error.message?.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }

    // Re-throw our custom errors
    if (error.message?.startsWith('Valid URL') || 
        error.message?.startsWith('Please enter') ||
        error.message?.includes('Server error') ||
        error.message?.includes('Scan timed out') ||
        error.message?.includes('Scan failed')) {
      throw error;
    }

    // Generic fallback
    throw new Error('Unable to analyze website. Please try again.');
  }
}