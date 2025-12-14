// src/services/api.ts
import axios from "axios";

// Create an axios instance with the base URL from environment variables
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "https://bc-worker-env.eba-k8rrjwx.ap-southeast-2.elasticbeanstalk.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response wrapper to ensure consistent format with 404 fallback
const wrapResponse = async (apiCall: Promise<any>) => {
  try {
    const response = await apiCall;
    return { success: true, data: response.data };
  } catch (error: any) {
    console.warn('API Error:', error.message);
    
    // Handle 404 errors gracefully
    if (error.response?.status === 404) {
      console.log('API endpoint not found, providing fallback response');
      return { 
        success: false, 
        error: 'Endpoint not available', 
        fallback: true,
        data: null 
      };
    }
    
    return { success: false, error };
  }
};

// Define API service functions
const apiService = {
  // User related
  getCurrentUser: async () => {
    return wrapResponse(api.get("/user/profile"));
  },
  updateUserProfile: async (data: any) => {
    return wrapResponse(api.put("/user/profile", data));
  },

  // Scan related
  scanWebsite: async (url: string, options: any = {}) => {
    return wrapResponse(api.post("/scan", { url, options }));
  },
  submitScan: async (url: string, options: any = {}) => {
    return wrapResponse(api.post("/scan", { url, options }));
  },
  getScanStatus: async (scanId: string) => {
    return wrapResponse(api.get(`/scan/${scanId}`));
  },
  getScanResults: async (scanId: string) => {
    return wrapResponse(api.get(`/scan/${scanId}/results`));
  },

  // History related
  getScanHistory: async (page = 1, limit = 10) => {
    return wrapResponse(
      api.get("/history/recent", { params: { page, limit } })
    );
  },
  deleteScan: async (scanId: string) => {
    return wrapResponse(api.delete(`/history/scan/${scanId}`));
  },

  // Backlinks - DISABLED (API not available)
  getBacklinks: async (url: string) => {
    console.log('Backlinks API not available');
    return { success: false, error: 'Feature coming soon', fallback: true, data: { total: 0, message: "Backlinks analysis coming soon" } };
  },

  // Export related - DISABLED (API not available)
  exportReport: async (scanId: string, format: "pdf" | "csv" = "pdf") => {
    console.log('Export API not available');
    return { success: false, error: 'Export feature coming soon', fallback: true, data: null };
  },
  exportPDF: async (scanId: string) => {
    console.log('PDF export API not available');
    return { success: false, error: 'PDF export coming soon', fallback: true, data: null };
  },
  exportCSV: async (scanId: string) => {
    console.log('CSV export API not available');
    return { success: false, error: 'CSV export coming soon', fallback: true, data: null };
  },

  // Individual tool endpoints
  analyzeSchema: async (url: string) => {
    return wrapResponse(api.post("/tools/schema", { url }));
  },
  analyzeAccessibility: async (url: string) => {
    return wrapResponse(api.post("/tools/accessibility", { url }));
  },
  analyzeBacklinks: async (url: string) => {
    return wrapResponse(api.post("/tools/backlinks", { url }));
  },
  analyzeLinkChecker: async (url: string) => {
    return wrapResponse(api.post("/tools/link-checker", { url }));
  },
  analyzeDuplicateContent: async (url: string) => {
    return wrapResponse(api.post("/tools/duplicate-content", { url }));
  },
  analyzeMultiLanguage: async (url: string) => {
    return wrapResponse(api.post("/tools/multi-language", { url }));
  },
  analyzeRankTracker: async (url: string, keywords: string[]) => {
    return wrapResponse(api.post("/tools/rank-tracker", { url, keywords }));
  },

  // API Keys management
  getApiKeys: async () => {
    return wrapResponse(api.get("/user/api-keys"));
  },

  saveApiKeys: async (apiKeys: any) => {
    return wrapResponse(api.put("/user/api-keys", { apiKeys }));
  },

  // Server status
  checkConnection: async () => {
    try {
      const response = await api.get("/status");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error };
    }
  },
  checkServerStatus: async () => {
    try {
      const response = await api.get("/status");
      return { status: "connected", data: response.data };
    } catch (error) {
      return { status: "error", error };
    }
  },
};

export default apiService;
