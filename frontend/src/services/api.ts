// src/services/api.ts
import axios from "axios";

// Create an axios instance with the base URL from environment variables
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "https://irpwi5mww.ap-southeast-2.awsapprunner.com/api",
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

// Response wrapper to ensure consistent format
const wrapResponse = async (apiCall: Promise<any>) => {
  try {
    const response = await apiCall;
    return { success: true, data: response.data };
  } catch (error) {
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

  // Backlinks
  getBacklinks: async (url: string) => {
    return wrapResponse(api.get(`/backlinks`, { params: { url } }));
  },

  // Export related
  exportReport: async (scanId: string, format: "pdf" | "csv" = "pdf") => {
    return wrapResponse(
      api.get(`/export/${scanId}/${format}`, {
        responseType: "blob",
      })
    );
  },
  exportPDF: async (scanId: string) => {
    return wrapResponse(
      api.get(`/export/${scanId}/pdf`, {
        responseType: "blob",
      })
    );
  },
  exportCSV: async (scanId: string) => {
    return wrapResponse(
      api.get(`/export/${scanId}/csv`, {
        responseType: "blob",
      })
    );
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
