const API_BASE_URL = "https://irpwi5mww.ap-southeast-2.awsapprunner.com/api";

// Rich Pin Types
export interface RichPinType {
  type: string;
  name: string;
  description: string;
  requiredTags: string[];
  recommendedTags: string[];
  schemaType: string;
}

// Tag Information
export interface TagInfo {
  tag: string;
  value: string;
  type: "required" | "recommended" | "structured-data";
  source?: string;
}

// Schema Information
export interface SchemaInfo {
  hasSchema: boolean;
  schemaType: string | null;
}

// Validation Summary
export interface ValidationSummary {
  requiredTagsFound: number;
  requiredTagsTotal: number;
  recommendedTagsFound: number;
  recommendedTagsTotal: number;
}

// Schema Data
export interface SchemaData {
  type: string;
  context: string;
}

// Validation Report
export interface ValidationReport {
  success: boolean;
  url: string;
  isValid?: boolean;
  pinType?: string;
  pinTypeKey?: string;
  description?: string;
  errors?: string[];
  warnings?: string[];
  foundTags?: TagInfo[];
  missingTags?: string[];
  schemaInfo?: SchemaInfo;
  summary?: ValidationSummary;
  validationURL: string;
  allTags?: Record<string, string>;
  schemas?: SchemaData[];
  timestamp?: string;
  error?: string;
  suggestion?: string;
  availableTypes?: Array<{
    type: string;
    name: string;
    description: string;
  }>;
}

// Types Response
export interface RichPinTypesResponse {
  success: boolean;
  types: RichPinType[];
  validationURL: string;
}

/**
 * Validate Pinterest Rich Pin for a URL
 */
export async function validateRichPin(
  url: string,
  pinType?: string
): Promise<ValidationReport> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/pinterest-rich-pin/validate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, pinType }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(
      `Failed to validate Rich Pin: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Get available Rich Pin types
 */
export async function getRichPinTypes(): Promise<RichPinTypesResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/pinterest-rich-pin/types`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(
      `Failed to fetch Rich Pin types: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Export validation report as JSON
 */
export function exportAsJSON(report: ValidationReport): void {
  const dataStr = JSON.stringify(report, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `pinterest-rich-pin-validation-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get color for validation status
 */
export function getValidationColor(isValid: boolean): string {
  return isValid ? "text-green-600" : "text-red-600";
}

/**
 * Get background color for validation status
 */
export function getValidationBgColor(isValid: boolean): string {
  return isValid ? "bg-green-50" : "bg-red-50";
}

/**
 * Get border color for validation status
 */
export function getValidationBorderColor(isValid: boolean): string {
  return isValid ? "border-green-200" : "border-red-200";
}

/**
 * Get score percentage from summary
 */
export function getScorePercentage(summary: ValidationSummary): number {
  const requiredScore =
    (summary.requiredTagsFound / summary.requiredTagsTotal) * 70;
  const recommendedScore =
    (summary.recommendedTagsFound / summary.recommendedTagsTotal) * 30;
  return Math.round(requiredScore + recommendedScore);
}

/**
 * Get color for score
 */
export function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-600";
  if (score >= 70) return "text-yellow-600";
  if (score >= 50) return "text-orange-600";
  return "text-red-600";
}

/**
 * Get background color for score
 */
export function getScoreBgColor(score: number): string {
  if (score >= 90) return "from-green-500 to-emerald-600";
  if (score >= 70) return "from-yellow-500 to-orange-500";
  if (score >= 50) return "from-orange-500 to-red-500";
  return "from-red-500 to-rose-600";
}

/**
 * Format timestamp
 */
export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString();
}

/**
 * Get icon for tag type
 */
export function getTagTypeIcon(type: string): string {
  switch (type) {
    case "required":
      return "⚠️";
    case "recommended":
      return "💡";
    case "structured-data":
      return "🔗";
    default:
      return "📌";
  }
}

/**
 * Get Rich Pin type emoji
 */
export function getRichPinTypeEmoji(pinType: string): string {
  switch (pinType.toLowerCase()) {
    case "article":
      return "📰";
    case "product":
      return "🛍️";
    case "recipe":
      return "🍳";
    case "app":
      return "📱";
    default:
      return "📌";
  }
}
