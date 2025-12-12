import axios from "axios";

const API_BASE_URL = "https://zp9kzmug2t.ap-southeast-2.awsapprunner.com/api/toxic-backlinks";

// Interfaces
export interface BacklinkMetrics {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface DomainAuthority {
  indexed: boolean;
  https: boolean;
  age: string | null;
  dns: boolean;
  score: number;
}

export interface SpamSignals {
  spamKeywords: string[];
  suspiciousAnchor: boolean;
  foreignLanguage: boolean;
  tooManyLinks: boolean;
  lowQualityContent: boolean;
  score: number;
}

export interface BlacklistResults {
  safeBrowsing: boolean;
  publicBlacklists: boolean;
  score: number;
}

export interface BacklinkDetails {
  domainAuthority: DomainAuthority;
  spamSignals: SpamSignals;
  blacklists: BlacklistResults;
}

export interface ToxicBacklink {
  url: string;
  domain: string;
  anchorText: string;
  toxicityScore: number;
  category: "safe" | "suspicious" | "toxic";
  recommendation: "Keep" | "Review" | "Disavow";
  reasons: string[];
  metrics: BacklinkMetrics;
  details: BacklinkDetails;
}

export interface AnalysisSummary {
  total: number;
  safe: number;
  suspicious: number;
  toxic: number;
  averageScore: number;
  toDisavow: number;
}

export interface AnalysisReport {
  success: boolean;
  siteUrl: string;
  analyzedAt: string;
  summary: AnalysisSummary;
  results: ToxicBacklink[];
  message?: string;
}

export interface DisavowFileResponse {
  success: boolean;
  content: string;
  count: number;
  error?: string;
}

export interface CategoryInfo {
  color: string;
  range: string;
  description: string;
  action: string;
}

export interface ToxicityInfo {
  success: boolean;
  info: {
    categories: {
      safe: CategoryInfo;
      suspicious: CategoryInfo;
      toxic: CategoryInfo;
    };
    scoringFactors: {
      domainAuthority: { weight: string; factors: string[] };
      spamSignals: { weight: string; factors: string[] };
      blacklists: { weight: string; factors: string[] };
    };
    disavowFile: {
      format: string;
      upload: string;
      note: string;
    };
  };
}

/**
 * Get Google OAuth URL for GSC authentication
 */
export async function getGSCAuthUrl(): Promise<{
  success: boolean;
  authUrl?: string;
  error?: string;
}> {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth-url`);
    return response.data;
  } catch (error: any) {
    console.error("Error getting auth URL:", error);
    return {
      success: false,
      error:
        error.response?.data?.error ||
        error.message ||
        "Failed to get auth URL",
    };
  }
}

/**
 * Analyze toxic backlinks for a site
 */
export async function analyzeToxicBacklinks(
  siteUrl: string,
  accessToken: string,
  maxBacklinks: number = 100
): Promise<AnalysisReport> {
  try {
    const response = await axios.post(`${API_BASE_URL}/analyze`, {
      siteUrl,
      accessToken,
      maxBacklinks,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error analyzing backlinks:", error);
    throw new Error(
      error.response?.data?.error ||
        error.message ||
        "Failed to analyze backlinks"
    );
  }
}

/**
 * Check a single backlink for toxicity
 */
export async function checkSingleBacklink(
  url: string,
  anchorText: string = ""
): Promise<ToxicBacklink & { success: boolean; error?: string }> {
  try {
    const response = await axios.post(`${API_BASE_URL}/check-single`, {
      url,
      anchorText,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error checking backlink:", error);
    throw new Error(
      error.response?.data?.error || error.message || "Failed to check backlink"
    );
  }
}

/**
 * Generate disavow file content
 */
export async function generateDisavowFile(
  toxicLinks: ToxicBacklink[]
): Promise<DisavowFileResponse> {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate-disavow`, {
      toxicLinks,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error generating disavow file:", error);
    return {
      success: false,
      content: "",
      count: 0,
      error:
        error.response?.data?.error ||
        error.message ||
        "Failed to generate disavow file",
    };
  }
}

/**
 * Get toxicity scoring information
 */
export async function getToxicityInfo(): Promise<ToxicityInfo> {
  try {
    const response = await axios.get(`${API_BASE_URL}/info`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching toxicity info:", error);
    throw new Error(
      error.response?.data?.error ||
        error.message ||
        "Failed to fetch toxicity info"
    );
  }
}

/**
 * Download disavow file
 */
export function downloadDisavowFile(
  content: string,
  filename: string = "disavow.txt"
): void {
  const blob = new Blob([content], { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Export analysis report as JSON
 */
export function exportReportAsJSON(
  report: AnalysisReport,
  filename: string = "backlink-analysis.json"
): void {
  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: "application/json",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Get color for toxicity score
 */
export function getToxicityColor(score: number): string {
  if (score >= 70) return "text-red-600";
  if (score >= 40) return "text-yellow-600";
  return "text-green-600";
}

/**
 * Get background color for toxicity score
 */
export function getToxicityBgColor(score: number): string {
  if (score >= 70) return "bg-red-100";
  if (score >= 40) return "bg-yellow-100";
  return "bg-green-100";
}

/**
 * Get category badge color
 */
export function getCategoryColor(category: string): string {
  switch (category) {
    case "toxic":
      return "bg-red-100 text-red-800 border-red-300";
    case "suspicious":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "safe":
      return "bg-green-100 text-green-800 border-green-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
}

/**
 * Get recommendation badge color
 */
export function getRecommendationColor(recommendation: string): string {
  switch (recommendation) {
    case "Disavow":
      return "bg-red-600 text-white";
    case "Review":
      return "bg-yellow-600 text-white";
    case "Keep":
      return "bg-green-600 text-white";
    default:
      return "bg-gray-600 text-white";
  }
}

/**
 * Format large numbers
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

/**
 * Truncate URL for display
 */
export function truncateUrl(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength - 3) + "...";
}

const toxicBacklinkService = {
  getGSCAuthUrl,
  analyzeToxicBacklinks,
  checkSingleBacklink,
  generateDisavowFile,
  getToxicityInfo,
  downloadDisavowFile,
  exportReportAsJSON,
  getToxicityColor,
  getToxicityBgColor,
  getCategoryColor,
  getRecommendationColor,
  formatNumber,
  truncateUrl,
};

export default toxicBacklinkService;
