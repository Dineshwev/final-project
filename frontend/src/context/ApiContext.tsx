// src/context/ApiContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api.js';

interface ApiKeys {
  pageSpeedInsightsKey: string;
  whoApiKey: string;
  safeBrowsingApiKey: string;
}

interface ApiContextType {
  apiStatus: 'checking' | 'connected' | 'error';
  apiError: string | null;
  apiKeys: ApiKeys;
  checkApiConnection: () => Promise<void>;
  updateApiKeys: (keys: ApiKeys) => Promise<boolean>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    pageSpeedInsightsKey: process.env.REACT_APP_PAGE_SPEED_INSIGHTS_API_KEY || '',
    whoApiKey: process.env.REACT_APP_WHOAPI_KEY || '',
    safeBrowsingApiKey: process.env.REACT_APP_SAFE_BROWSING_API_KEY || '',
  });

  const checkApiConnection = async () => {
    setApiStatus('checking');
    setApiError(null);
    
    try {
      const { success, error } = await apiService.checkConnection();
      
      if (success) {
        setApiStatus('connected');
        // Try to fetch user's custom API keys
        try {
          const response = await apiService.getApiKeys();
          if (response.success && response.data) {
            setApiKeys(prevKeys => ({
              ...prevKeys,
              ...response.data
            }));
          }
        } catch (err) {
          console.error('Failed to fetch API keys:', err);
          // Don't change connection status for this error
        }
      } else {
        setApiStatus('error');
        setApiError(error instanceof Error ? error.message : 'Unknown error');
      }
    } catch (error) {
      setApiStatus('error');
      setApiError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const updateApiKeys = async (newKeys: ApiKeys): Promise<boolean> => {
    try {
      const response = await apiService.saveApiKeys(newKeys);
      if (response.success) {
        setApiKeys(newKeys);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating API keys:', error);
      return false;
    }
  };

  // Check API connection on mount
  useEffect(() => {
    checkApiConnection();
  }, []);

  const value = {
    apiStatus,
    apiError,
    apiKeys,
    checkApiConnection,
    updateApiKeys,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

export default ApiProvider;