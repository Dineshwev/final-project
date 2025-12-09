const API_BASE_URL = "http://irpwi5mww.ap-southeast-2.awsapprunner.com/api";

// WCAG Level Information
export interface WCAGLevel {
  name: string;
  description: string;
  examples: string[];
}

// Impact Level Information
export interface ImpactLevel {
  description: string;
  color: string;
}

// Violation Node
export interface ViolationNode {
  html: string;
  target: string[];
  failureSummary: string;
  impact: string;
  fixes: {
    any: Array<{ id: string; message: string; data: any }>;
    all: Array<{ id: string; message: string; data: any }>;
    none: Array<{ id: string; message: string; data: any }>;
  };
}

// Violation
export interface Violation {
  id: string;
  impact: string;
  description: string;
  help: string;
  helpUrl: string;
  wcagLevel: string[];
  tags: string[];
  nodes: ViolationNode[];
  affectedElements: number;
}

// Pass
export interface Pass {
  id: string;
  description: string;
  help: string;
  helpUrl: string;
  wcagLevel: string[];
  tags: string[];
  passedElements: number;
}

// Level Report
export interface LevelReport {
  score: number;
  violations: Violation[];
  passes: Pass[];
  violationCount: number;
  passCount: number;
}

// Audit Report
export interface AuditReport {
  overallScore: number;
  baseScore: number;
  impactDeduction: number;
  summary: {
    totalRules: number;
    passedRules: number;
    failedRules: number;
    totalViolations: number;
    totalAffectedElements: number;
    incompleteChecks: number;
    inapplicableRules: number;
  };
  levelA: LevelReport;
  levelAA: LevelReport;
  levelAAA: LevelReport;
  criticalIssues: Violation[];
  seriousIssues: Violation[];
  moderateIssues: Violation[];
  minorIssues: Violation[];
  impactCounts: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
  totalIssues: number;
  testEngine: {
    name: string;
    version: string;
  };
  timestamp: string;
  url: string;
}

// Audit Result
export interface AuditResult {
  success: boolean;
  report?: AuditReport;
  error?: string;
  timestamp: string;
}

/**
 * Run accessibility audit
 */
export async function runAccessibilityAudit(
  url: string,
  options = {}
): Promise<AuditResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/accessibility/audit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, options }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(
      `Failed to run accessibility audit: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Get WCAG information
 */
export async function getWCAGInfo() {
  try {
    const response = await fetch(`${API_BASE_URL}/accessibility/wcag-info`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(
      `Failed to fetch WCAG info: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Export report as JSON
 */
export function exportAsJSON(report: AuditReport): void {
  const dataStr = JSON.stringify(report, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `accessibility-audit-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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
 * Get background gradient for score
 */
export function getScoreBgGradient(score: number): string {
  if (score >= 90) return "from-green-500 to-emerald-600";
  if (score >= 70) return "from-yellow-500 to-orange-500";
  if (score >= 50) return "from-orange-500 to-red-500";
  return "from-red-500 to-rose-600";
}

/**
 * Get color for impact level
 */
export function getImpactColor(impact: string): string {
  switch (impact) {
    case "critical":
      return "text-red-700";
    case "serious":
      return "text-orange-700";
    case "moderate":
      return "text-yellow-700";
    case "minor":
      return "text-blue-700";
    default:
      return "text-gray-700";
  }
}

/**
 * Get background color for impact level
 */
export function getImpactBgColor(impact: string): string {
  switch (impact) {
    case "critical":
      return "bg-red-50 border-red-200";
    case "serious":
      return "bg-orange-50 border-orange-200";
    case "moderate":
      return "bg-yellow-50 border-yellow-200";
    case "minor":
      return "bg-blue-50 border-blue-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
}

/**
 * Get icon for impact level
 */
export function getImpactIcon(impact: string): string {
  switch (impact) {
    case "critical":
      return "🔴";
    case "serious":
      return "🟠";
    case "moderate":
      return "🟡";
    case "minor":
      return "🔵";
    default:
      return "⚪";
  }
}

/**
 * Get WCAG level badge color
 */
export function getWCAGLevelColor(level: string): string {
  switch (level) {
    case "A":
      return "bg-blue-100 text-blue-800";
    case "AA":
      return "bg-purple-100 text-purple-800";
    case "AAA":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * Format WCAG criterion for display
 */
export function formatWCAGCriterion(criteria: string[]): string {
  if (criteria.length === 0) return "N/A";
  return criteria.join(", ");
}

/**
 * Truncate HTML snippet
 */
export function truncateHTML(html: string, maxLength: number = 100): string {
  if (html.length <= maxLength) return html;
  return html.substring(0, maxLength) + "...";
}
