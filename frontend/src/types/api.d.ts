// src/types/api.d.ts
declare module '../services/api.js' {
  interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: any;
  }

  interface ScanOptions {
    depth?: number;
    checkSecurity?: boolean;
    checkSeo?: boolean;
    checkPerformance?: boolean;
    checkAccessibility?: boolean;
    includeScreenshots?: boolean;
  }

  interface ScanResult {
    id: string;
    url: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    startedAt: string;
    completedAt?: string;
    results?: any;
  }

  interface HistoryItem {
    id: string;
    url: string;
    timestamp: string;
    status: string;
    score?: number;
  }

  interface ApiService {
    getCurrentUser(): Promise<ApiResponse>;
    updateUserProfile(data: any): Promise<ApiResponse>;
    scanWebsite(url: string, options?: ScanOptions): Promise<ApiResponse<ScanResult>>;
    submitScan(url: string, options?: ScanOptions): Promise<ApiResponse<ScanResult>>;
    getScanStatus(scanId: string): Promise<ApiResponse>;
    getScanResults(scanId: string): Promise<ApiResponse>;
    getScanHistory(page?: number, limit?: number): Promise<ApiResponse<HistoryItem[]>>;
    deleteScan(scanId: string): Promise<ApiResponse>;
    getBacklinks(domain: string): Promise<ApiResponse>;
    exportReport(scanId: string, format?: 'pdf' | 'csv'): Promise<ApiResponse>;
    exportPDF(scanId: string): Promise<ApiResponse>;
    exportCSV(scanId: string): Promise<ApiResponse>;
    checkConnection(): Promise<{ success: boolean; error?: any }>;
    checkServerStatus(): Promise<{ status: 'connected' | 'error'; data?: any; error?: any }>;
  }

  const apiService: ApiService;
  export default apiService;
}

declare module '../config/firebase.js' {
  import { Auth } from 'firebase/auth';
  import { Analytics } from 'firebase/analytics';
  import { FirebaseApp } from 'firebase/app';

  export const app: FirebaseApp;
  export const auth: Auth;
  export const analytics: Analytics;
}