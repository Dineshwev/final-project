// src/services/twitterCardService.ts
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://irpwi5mww.ap-southeast-2.awsapprunner.com/api";

export interface TwitterTag {
  [key: string]: string;
}

export interface OGTag {
  [key: string]: string;
}

export interface ImageValidation {
  valid: boolean;
  width?: number;
  height?: number;
  format?: string;
  fileSize?: number;
  fileSizeMB?: string;
  errors?: string[];
  warnings?: string[];
  error?: string;
  message: string;
}

export interface ValidationSummary {
  totalTags: number;
  cardType: string;
  hasFallbacks: boolean;
  errorsCount: number;
  warningsCount: number;
}

export interface ValidationReport {
  isValid: boolean;
  url: string;
  cardType: string;
  errors: string[];
  warnings: string[];
  recommendations: string[];
  twitterTags: TwitterTag;
  ogTags: OGTag;
  fallbacks: { [key: string]: string };
  imageValidation: ImageValidation | null;
  previewUrl: string;
  summary: ValidationSummary;
  timestamp: string;
}

export interface ValidationResponse {
  success: boolean;
  data?: ValidationReport;
  error?: string;
}

export interface CardTypeInfo {
  description: string;
  required: string[];
  optional: string[];
  imageSpecs?: string;
}

export interface CardTypesResponse {
  success: boolean;
  data?: {
    [key: string]: CardTypeInfo;
  };
}

/**
 * Validate Twitter Card tags for a given URL
 */
export const validateTwitterCard = async (
  url: string
): Promise<ValidationReport> => {
  try {
    const response = await axios.post<ValidationResponse>(
      `${API_BASE_URL}/twitter-card/validate`,
      { url },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 second timeout
      }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Validation failed");
    }

    return response.data.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(
          error.response.data?.error || `Server error: ${error.response.status}`
        );
      } else if (error.request) {
        throw new Error(
          "Unable to connect to validation service. Please check if the server is running."
        );
      }
    }
    throw new Error(error.message || "An unexpected error occurred");
  }
};

/**
 * Get supported Twitter Card types and their requirements
 */
export const getCardTypes = async (): Promise<{
  [key: string]: CardTypeInfo;
}> => {
  try {
    const response = await axios.get<CardTypesResponse>(
      `${API_BASE_URL}/twitter-card/card-types`,
      {
        timeout: 5000,
      }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error("Failed to fetch card types");
    }

    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch card types:", error);
    return {};
  }
};

/**
 * Check Twitter Card Validator API health
 */
export const checkTwitterCardHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/twitter-card/health`, {
      timeout: 5000,
    });
    return response.data.success && response.data.status === "operational";
  } catch (error) {
    console.error("Twitter Card Validator health check failed:", error);
    return false;
  }
};

/**
 * Export validation report as JSON
 */
export const exportAsJSON = (
  data: ValidationReport,
  filename?: string
): void => {
  const name =
    filename ||
    `twitter-card-validation-${new Date().toISOString().split("T")[0]}.json`;
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Generate shareable text report
 */
export const generateTextReport = (data: ValidationReport): string => {
  let report = `Twitter Card Validation Report\n`;
  report += `${"=".repeat(50)}\n\n`;
  report += `URL: ${data.url}\n`;
  report += `Date: ${new Date(data.timestamp).toLocaleString()}\n`;
  report += `Card Type: ${data.cardType}\n`;
  report += `Status: ${data.isValid ? "VALID ✅" : "INVALID ❌"}\n\n`;

  report += `Summary:\n`;
  report += `- Total Twitter Tags: ${data.summary.totalTags}\n`;
  report += `- Card Type: ${data.summary.cardType}\n`;
  report += `- Has Fallbacks: ${data.summary.hasFallbacks ? "Yes" : "No"}\n`;
  report += `- Errors: ${data.summary.errorsCount}\n`;
  report += `- Warnings: ${data.summary.warningsCount}\n\n`;

  if (Object.keys(data.twitterTags).length > 0) {
    report += `Twitter Card Tags:\n`;
    for (const [key, value] of Object.entries(data.twitterTags)) {
      report += `- twitter:${key}: ${value.substring(0, 100)}${
        value.length > 100 ? "..." : ""
      }\n`;
    }
    report += `\n`;
  }

  if (Object.keys(data.fallbacks).length > 0) {
    report += `Fallback Tags (from Open Graph):\n`;
    for (const [key, value] of Object.entries(data.fallbacks)) {
      report += `- og:${key}: ${value.substring(0, 100)}${
        value.length > 100 ? "..." : ""
      }\n`;
    }
    report += `\n`;
  }

  if (data.errors.length > 0) {
    report += `Errors:\n`;
    data.errors.forEach((error, i) => {
      report += `${i + 1}. ${error}\n`;
    });
    report += `\n`;
  }

  if (data.warnings.length > 0) {
    report += `Warnings:\n`;
    data.warnings.forEach((warning, i) => {
      report += `${i + 1}. ${warning}\n`;
    });
    report += `\n`;
  }

  report += `Twitter Card Validator: ${data.previewUrl}\n\n`;
  report += `Generated by Healthy SEO - Twitter Card Validator\n`;
  return report;
};

/**
 * Save validation to localStorage history
 */
export const saveToHistory = (data: ValidationReport): void => {
  try {
    const history = JSON.parse(
      localStorage.getItem("twitter_card_validation_history") || "[]"
    );

    history.unshift({
      url: data.url,
      cardType: data.cardType,
      isValid: data.isValid,
      timestamp: data.timestamp,
      summary: data.summary,
    });

    // Keep only last 50 validations
    if (history.length > 50) {
      history.splice(50);
    }

    localStorage.setItem(
      "twitter_card_validation_history",
      JSON.stringify(history)
    );
  } catch (error) {
    console.error("Failed to save to history:", error);
  }
};

/**
 * Get validation history from localStorage
 */
export const getValidationHistory = (): any[] => {
  try {
    return JSON.parse(
      localStorage.getItem("twitter_card_validation_history") || "[]"
    );
  } catch (error) {
    console.error("Failed to load history:", error);
    return [];
  }
};
