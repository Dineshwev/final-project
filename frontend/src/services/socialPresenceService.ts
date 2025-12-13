// src/services/socialPresenceService.ts
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://bc-worker-env.eba-k8rrjwx.ap-southeast-2.elasticbeanstalk.com/api";

export interface ProfileInfo {
  name: string | null;
  description: string | null;
  followers: string | null;
  verified: boolean;
  profileImage: string | null;
  error?: string;
}

export interface ProfileResult {
  platform: string;
  url: string;
  status: "active" | "invalid" | "not_found";
  isValid: boolean;
  exists: boolean;
  statusCode?: number;
  error: string | null;
  username: string | null;
  info: ProfileInfo | null;
}

export interface MissingPlatform {
  platform: string;
  name: string;
  color: string;
}

export interface AuditSummary {
  totalPlatforms: number;
  providedProfiles: number;
  activeProfiles: number;
  invalidProfiles: number;
  notFoundProfiles: number;
  missingPlatforms: number;
}

export interface AuditReport {
  success: boolean;
  score: number;
  summary: AuditSummary;
  profiles: ProfileResult[];
  missingPlatforms: MissingPlatform[];
  recommendations: string[];
  timestamp: string;
}

export interface Platform {
  id: string;
  name: string;
  pattern: string;
  icon: string;
  color: string;
  example: string;
}

/**
 * Generate social media presence audit report
 */
export const generateAudit = async (profiles: {
  [key: string]: string;
}): Promise<AuditReport> => {
  try {
    const response = await axios.post<AuditReport>(
      `${API_BASE_URL}/social-presence/audit`,
      { profiles },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 second timeout for multiple profile checks
      }
    );

    if (!response.data.success) {
      throw new Error("Audit generation failed");
    }

    return response.data;
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
 * Validate a single profile
 */
export const validateProfile = async (
  url: string,
  platform: string
): Promise<ProfileResult> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/social-presence/validate`,
      { url, platform },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    if (!response.data.success) {
      throw new Error("Profile validation failed");
    }

    return response.data.result;
  } catch (error: any) {
    throw new Error(error.message || "Validation failed");
  }
};

/**
 * Get supported platforms
 */
export const getPlatforms = async (): Promise<Platform[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/social-presence/platforms`,
      {
        timeout: 5000,
      }
    );

    if (!response.data.success) {
      throw new Error("Failed to fetch platforms");
    }

    return response.data.platforms;
  } catch (error) {
    console.error("Failed to fetch platforms:", error);
    return [];
  }
};

/**
 * Export audit report as JSON
 */
export const exportAsJSON = (data: AuditReport, filename?: string): void => {
  const name =
    filename ||
    `social-presence-audit-${new Date().toISOString().split("T")[0]}.json`;
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
 * Get score color based on value
 */
export const getScoreColor = (score: number): string => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
};

/**
 * Get score background color
 */
export const getScoreBgColor = (score: number): string => {
  if (score >= 80) return "from-green-500 to-emerald-500";
  if (score >= 60) return "from-yellow-500 to-amber-500";
  if (score >= 40) return "from-orange-500 to-red-500";
  return "from-red-500 to-rose-500";
};

/**
 * Get status badge color
 */
export const getStatusColor = (
  status: "active" | "invalid" | "not_found"
): { bg: string; text: string; border: string } => {
  switch (status) {
    case "active":
      return {
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-200",
      };
    case "invalid":
      return {
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-200",
      };
    case "not_found":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        border: "border-yellow-200",
      };
  }
};

/**
 * Save audit to localStorage history
 */
export const saveToHistory = (data: AuditReport): void => {
  try {
    const history = JSON.parse(
      localStorage.getItem("social_presence_history") || "[]"
    );

    history.unshift({
      score: data.score,
      timestamp: data.timestamp,
      summary: data.summary,
    });

    // Keep only last 20 audits
    if (history.length > 20) {
      history.splice(20);
    }

    localStorage.setItem("social_presence_history", JSON.stringify(history));
  } catch (error) {
    console.error("Failed to save to history:", error);
  }
};

/**
 * Get audit history from localStorage
 */
export const getHistory = (): any[] => {
  try {
    return JSON.parse(localStorage.getItem("social_presence_history") || "[]");
  } catch (error) {
    console.error("Failed to load history:", error);
    return [];
  }
};
