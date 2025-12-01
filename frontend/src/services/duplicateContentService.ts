import axios from "axios";

const API_BASE_URL = "http://localhost:3002/api/duplicate-content";

// Interfaces
export interface PageInfo {
  url: string;
  title: string;
  wordCount: number;
  hash?: string;
}

export interface DuplicateCluster {
  pages: PageInfo[];
  similarityScore: number;
  type: "exact" | "near" | "cluster";
  contentSample: string;
  clusterSize: number;
}

export interface Recommendation {
  priority: "success" | "critical" | "high" | "medium";
  message: string;
  action?: string;
}

export interface AnalysisSummary {
  totalPages: number;
  uniquePages: number;
  affectedPages: number;
  duplicatePercentage: number;
  exactDuplicateClusters: number;
  nearDuplicatePairs: number;
  totalClusters: number;
}

export interface AnalysisReport {
  success: boolean;
  url: string;
  analyzedAt: string;
  summary: AnalysisSummary;
  duplicateClusters: DuplicateCluster[];
  exactDuplicates: DuplicateCluster[];
  nearDuplicates: DuplicateCluster[];
  recommendations: Recommendation[];
  pages: PageInfo[];
  error?: string;
}

export interface ComparisonResult {
  success: boolean;
  comparison: {
    page1: PageInfo;
    page2: PageInfo;
    similarity: number;
    diff: DiffInfo;
    verdict: string;
  };
  error?: string;
}

export interface DiffInfo {
  commonWords: number;
  uniqueToFirst: number;
  uniqueToSecond: number;
  totalWords: number;
  commonPercentage: string;
  uniqueWords1: string[];
  uniqueWords2: string[];
}

export interface NetworkNode {
  id: string;
  label: string;
  title: string;
  group?: string;
  value?: number;
}

export interface NetworkEdge {
  from: string;
  to: string;
  value: number;
  title: string;
  color?: string;
}

/**
 * Analyze a website for duplicate content
 */
export async function analyzeDuplicateContent(
  url: string,
  maxPages: number = 50,
  exactThreshold: number = 0.95,
  nearThreshold: number = 0.8
): Promise<AnalysisReport> {
  try {
    const response = await axios.post(`${API_BASE_URL}/analyze`, {
      url,
      maxPages,
      exactThreshold,
      nearThreshold,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error analyzing duplicate content:", error);
    throw new Error(
      error.response?.data?.error ||
        error.message ||
        "Failed to analyze duplicate content"
    );
  }
}

/**
 * Compare two specific pages
 */
export async function comparePages(
  url1: string,
  url2: string
): Promise<ComparisonResult> {
  try {
    const response = await axios.post(`${API_BASE_URL}/compare`, {
      url1,
      url2,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error comparing pages:", error);
    throw new Error(
      error.response?.data?.error || error.message || "Failed to compare pages"
    );
  }
}

/**
 * Generate diff between two texts
 */
export async function generateDiff(
  text1: string,
  text2: string
): Promise<{ success: boolean; diff: DiffInfo; error?: string }> {
  try {
    const response = await axios.post(`${API_BASE_URL}/diff`, {
      text1,
      text2,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error generating diff:", error);
    throw new Error(
      error.response?.data?.error || error.message || "Failed to generate diff"
    );
  }
}

/**
 * Get service information
 */
export async function getServiceInfo(): Promise<any> {
  try {
    const response = await axios.get(`${API_BASE_URL}/info`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching service info:", error);
    throw new Error(
      error.response?.data?.error ||
        error.message ||
        "Failed to fetch service info"
    );
  }
}

/**
 * Export analysis report as JSON
 */
export function exportAsJSON(
  report: AnalysisReport,
  filename: string = "duplicate-content-report.json"
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
 * Convert analysis report to network graph data
 */
export function convertToNetworkGraph(report: AnalysisReport): {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
} {
  const nodes: NetworkNode[] = [];
  const edges: NetworkEdge[] = [];
  const nodeMap = new Map<string, boolean>();

  // Create nodes for all pages
  report.pages.forEach((page, index) => {
    if (!nodeMap.has(page.url)) {
      nodes.push({
        id: page.url,
        label: page.title || page.url,
        title: `${page.title}\n${page.url}\n${page.wordCount} words`,
        value: page.wordCount,
        group: "unique",
      });
      nodeMap.set(page.url, true);
    }
  });

  // Add edges for duplicate clusters
  report.duplicateClusters.forEach((cluster, clusterIndex) => {
    // Update node groups for clustered pages
    cluster.pages.forEach((page) => {
      const node = nodes.find((n) => n.id === page.url);
      if (node) {
        node.group = cluster.type;
      }
    });

    // Create edges between all pages in cluster
    for (let i = 0; i < cluster.pages.length; i++) {
      for (let j = i + 1; j < cluster.pages.length; j++) {
        const page1 = cluster.pages[i];
        const page2 = cluster.pages[j];

        edges.push({
          from: page1.url,
          to: page2.url,
          value: cluster.similarityScore,
          title: `Similarity: ${(cluster.similarityScore * 100).toFixed(1)}%`,
          color:
            cluster.type === "exact"
              ? "#ef4444"
              : cluster.type === "near"
              ? "#f59e0b"
              : "#3b82f6",
        });
      }
    }
  });

  return { nodes, edges };
}

/**
 * Get similarity color based on score
 */
export function getSimilarityColor(similarity: number): string {
  if (similarity >= 0.95) return "text-red-600";
  if (similarity >= 0.8) return "text-orange-600";
  if (similarity >= 0.6) return "text-yellow-600";
  return "text-green-600";
}

/**
 * Get similarity background color
 */
export function getSimilarityBgColor(similarity: number): string {
  if (similarity >= 0.95) return "bg-red-100";
  if (similarity >= 0.8) return "bg-orange-100";
  if (similarity >= 0.6) return "bg-yellow-100";
  return "bg-green-100";
}

/**
 * Get cluster type badge color
 */
export function getClusterTypeColor(type: string): string {
  switch (type) {
    case "exact":
      return "bg-red-100 text-red-800 border-red-300";
    case "near":
      return "bg-orange-100 text-orange-800 border-orange-300";
    case "cluster":
      return "bg-blue-100 text-blue-800 border-blue-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
}

/**
 * Get priority badge color
 */
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "critical":
      return "bg-red-600 text-white";
    case "high":
      return "bg-orange-600 text-white";
    case "medium":
      return "bg-yellow-600 text-white";
    case "success":
      return "bg-green-600 text-white";
    default:
      return "bg-gray-600 text-white";
  }
}

/**
 * Truncate URL for display
 */
export function truncateUrl(url: string, maxLength: number = 60): string {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength - 3) + "...";
}

/**
 * Format number with K/M suffix
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

/**
 * Calculate estimated crawl time
 */
export function estimateCrawlTime(maxPages: number): string {
  const secondsPerPage = 3; // Approximate
  const totalSeconds = maxPages * secondsPerPage;

  if (totalSeconds < 60) return `~${totalSeconds} seconds`;

  const minutes = Math.ceil(totalSeconds / 60);
  return `~${minutes} minute${minutes > 1 ? "s" : ""}`;
}

export default {
  analyzeDuplicateContent,
  comparePages,
  generateDiff,
  getServiceInfo,
  exportAsJSON,
  convertToNetworkGraph,
  getSimilarityColor,
  getSimilarityBgColor,
  getClusterTypeColor,
  getPriorityColor,
  truncateUrl,
  formatNumber,
  estimateCrawlTime,
};
