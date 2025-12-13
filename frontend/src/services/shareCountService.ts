// src/services/shareCountService.ts
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://bc-worker-env.eba-k8rrjwx.ap-southeast-2.elasticbeanstalk.com/api";

export interface ShareCounts {
  facebook: number;
  pinterest: number;
  linkedin: number;
  totalShares: number;
  lastUpdated: string;
  url: string;
}

export interface TrendData {
  change: number;
  percentage: number;
  direction: "up" | "down" | "neutral";
}

export interface Trends {
  facebook: TrendData;
  pinterest: TrendData;
  linkedin: TrendData;
  totalShares: TrendData;
}

export interface DisplayValues {
  facebook: string;
  pinterest: string;
  linkedin: string;
  totalShares: string;
}

export interface ShareCountReport {
  success: boolean;
  url: string;
  counts: ShareCounts;
  trends: Trends;
  displayValues: DisplayValues;
  lastUpdated: string;
  cached: boolean;
}

export interface Platform {
  name: string;
  metric: string;
  description: string;
  icon: string;
}

export interface ShareButton {
  platform: string;
  url: string;
}

export interface PlatformsResponse {
  success: boolean;
  platforms: Platform[];
  shareButtons: ShareButton[];
}

/**
 * Get social share counts for a URL
 */
export const getShareCounts = async (
  url: string
): Promise<ShareCountReport> => {
  try {
    const response = await axios.post<ShareCountReport>(
      `${API_BASE_URL}/share-counts/analyze`,
      { url },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 15000, // 15 second timeout
      }
    );

    if (!response.data.success) {
      throw new Error("Failed to fetch share counts");
    }

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status === 429) {
          throw new Error(
            "Rate limit exceeded. Please try again later (SharedCount API limit: 500 requests/day)"
          );
        }
        throw new Error(
          error.response.data?.error || `Server error: ${error.response.status}`
        );
      } else if (error.request) {
        throw new Error(
          "Unable to connect to share count service. Please check if the server is running."
        );
      }
    }
    throw new Error(error.message || "An unexpected error occurred");
  }
};

/**
 * Get supported platforms and share button URLs
 */
export const getPlatforms = async (): Promise<PlatformsResponse> => {
  try {
    const response = await axios.get<PlatformsResponse>(
      `${API_BASE_URL}/share-counts/platforms`,
      {
        timeout: 5000,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to fetch platforms:", error);
    return {
      success: false,
      platforms: [],
      shareButtons: [],
    };
  }
};

/**
 * Clear cache for a specific URL
 */
export const clearShareCountCache = async (url: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/share-counts/cache`, {
      data: { url },
      timeout: 5000,
    });
  } catch (error) {
    console.error("Failed to clear cache:", error);
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = async (): Promise<any> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/share-counts/cache/stats`,
      {
        timeout: 5000,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get cache stats:", error);
    return null;
  }
};

/**
 * Format number with K/M suffixes
 */
export const formatCount = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

/**
 * Get trend icon and color
 */
export const getTrendStyle = (
  direction: "up" | "down" | "neutral"
): { icon: string; color: string } => {
  switch (direction) {
    case "up":
      return { icon: "↑", color: "text-green-600" };
    case "down":
      return { icon: "↓", color: "text-red-600" };
    default:
      return { icon: "→", color: "text-gray-600" };
  }
};

/**
 * Generate share URL for a platform
 */
export const generateShareUrl = (
  platform: string,
  url: string,
  text?: string,
  image?: string
): string => {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text || "");
  const encodedImage = encodeURIComponent(image || "");

  const shareUrls: { [key: string]: string } = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedText}`,
  };

  return shareUrls[platform.toLowerCase()] || "";
};

/**
 * Open share dialog
 */
export const shareOnPlatform = (
  platform: string,
  url: string,
  text?: string,
  image?: string
): void => {
  const shareUrl = generateShareUrl(platform, url, text, image);
  if (shareUrl) {
    window.open(
      shareUrl,
      "share",
      "width=600,height=400,toolbar=0,status=0,location=0"
    );
  }
};

/**
 * Export share count report as JSON
 */
export const exportAsJSON = (
  data: ShareCountReport,
  filename?: string
): void => {
  const name =
    filename || `share-counts-${new Date().toISOString().split("T")[0]}.json`;
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
 * Save share counts to localStorage history
 */
export const saveToHistory = (data: ShareCountReport): void => {
  try {
    const history = JSON.parse(
      localStorage.getItem("share_count_history") || "[]"
    );

    history.unshift({
      url: data.url,
      counts: data.counts,
      totalShares: data.counts.totalShares,
      lastUpdated: data.lastUpdated,
    });

    // Keep only last 50 entries
    if (history.length > 50) {
      history.splice(50);
    }

    localStorage.setItem("share_count_history", JSON.stringify(history));
  } catch (error) {
    console.error("Failed to save to history:", error);
  }
};

/**
 * Get share count history from localStorage
 */
export const getHistory = (): any[] => {
  try {
    return JSON.parse(localStorage.getItem("share_count_history") || "[]");
  } catch (error) {
    console.error("Failed to load history:", error);
    return [];
  }
};
