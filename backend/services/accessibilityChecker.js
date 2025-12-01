import puppeteer from "puppeteer";
import { AxePuppeteer } from "@axe-core/puppeteer";

// WCAG Level mappings for axe-core tags
const WCAG_LEVELS = {
  A: ["wcag2a", "wcag21a"],
  AA: ["wcag2aa", "wcag21aa"],
  AAA: ["wcag2aaa", "wcag21aaa"],
};

// Impact severity weights for scoring
const IMPACT_WEIGHTS = {
  critical: 10,
  serious: 7,
  moderate: 4,
  minor: 2,
};

/**
 * Run accessibility scan using Puppeteer and axe-core
 * @param {string} url - URL to scan
 * @param {Object} options - Scan options
 * @returns {Promise<Object>} Scan results
 */
export async function runAccessibilityScan(url, options = {}) {
  if (!url || !url.trim()) {
    throw new Error("URL is required");
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (error) {
    throw new Error("Invalid URL format");
  }

  let browser;
  try {
    // Launch Puppeteer browser
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-web-security",
      ],
    });

    const page = await browser.newPage();

    // Set viewport for consistent testing
    await page.setViewport({
      width: options.width || 1920,
      height: options.height || 1080,
    });

    // Navigate to URL with timeout
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: options.timeout || 60000,
    });

    // Wait for page to be fully loaded
    await page.waitForTimeout(2000);

    // Run axe-core accessibility scan
    const axeBuilder = new AxePuppeteer(page);

    // Configure axe-core options
    if (options.rules) {
      axeBuilder.options({
        rules: options.rules,
      });
    }

    // Run scan with WCAG 2.1 rules
    axeBuilder.withTags([
      "wcag2a",
      "wcag2aa",
      "wcag2aaa",
      "wcag21a",
      "wcag21aa",
      "wcag21aaa",
    ]);

    const results = await axeBuilder.analyze();

    return {
      success: true,
      url,
      results,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    if (error.name === "TimeoutError") {
      throw new Error(
        `Timeout loading page: ${url}. Page took too long to load.`
      );
    }
    throw new Error(`Failed to scan URL: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Categorize violations by WCAG level (A, AA, AAA)
 * @param {Array} violations - Array of violation objects from axe-core
 * @returns {Object} Violations categorized by level
 */
export function categorizeByLevel(violations) {
  const categorized = {
    A: [],
    AA: [],
    AAA: [],
    unknown: [],
  };

  violations.forEach((violation) => {
    const tags = violation.tags || [];
    let assigned = false;

    // Check for WCAG 2.1 AAA first (most specific)
    if (tags.includes("wcag2aaa") || tags.includes("wcag21aaa")) {
      categorized.AAA.push(violation);
      assigned = true;
    }
    // Then check for AA
    else if (tags.includes("wcag2aa") || tags.includes("wcag21aa")) {
      categorized.AA.push(violation);
      assigned = true;
    }
    // Then check for A
    else if (tags.includes("wcag2a") || tags.includes("wcag21a")) {
      categorized.A.push(violation);
      assigned = true;
    }

    // If no WCAG level tag found, add to unknown
    if (!assigned) {
      categorized.unknown.push(violation);
    }
  });

  return categorized;
}

/**
 * Categorize passes by WCAG level
 * @param {Array} passes - Array of pass objects from axe-core
 * @returns {Object} Passes categorized by level
 */
export function categorizePassesByLevel(passes) {
  const categorized = {
    A: [],
    AA: [],
    AAA: [],
    unknown: [],
  };

  passes.forEach((pass) => {
    const tags = pass.tags || [];

    if (tags.includes("wcag2aaa") || tags.includes("wcag21aaa")) {
      categorized.AAA.push(pass);
    } else if (tags.includes("wcag2aa") || tags.includes("wcag21aa")) {
      categorized.AA.push(pass);
    } else if (tags.includes("wcag2a") || tags.includes("wcag21a")) {
      categorized.A.push(pass);
    } else {
      categorized.unknown.push(pass);
    }
  });

  return categorized;
}

/**
 * Calculate accessibility score based on violations and passes
 * @param {Array} violations - Violations from axe-core
 * @param {Array} passes - Passes from axe-core
 * @returns {Object} Score breakdown
 */
export function calculateScore(violations, passes) {
  // Count unique rules tested
  const totalRules = new Set([
    ...violations.map((v) => v.id),
    ...passes.map((p) => p.id),
  ]).size;

  const passedRules = passes.length;
  const failedRules = violations.length;

  // Basic pass rate
  const baseScore = totalRules > 0 ? (passedRules / totalRules) * 100 : 0;

  // Calculate weighted deduction based on impact severity
  let impactDeduction = 0;
  violations.forEach((violation) => {
    const weight = IMPACT_WEIGHTS[violation.impact] || 1;
    const nodeCount = violation.nodes?.length || 1;
    impactDeduction += weight * nodeCount;
  });

  // Normalize deduction (max 50 points can be deducted for severity)
  const maxDeduction = 50;
  const normalizedDeduction = Math.min(
    (impactDeduction / (totalRules * 10)) * maxDeduction,
    maxDeduction
  );

  // Final score
  const finalScore = Math.max(0, Math.round(baseScore - normalizedDeduction));

  return {
    overallScore: finalScore,
    baseScore: Math.round(baseScore),
    impactDeduction: Math.round(normalizedDeduction),
    totalRules,
    passedRules,
    failedRules,
    details: {
      critical: violations.filter((v) => v.impact === "critical").length,
      serious: violations.filter((v) => v.impact === "serious").length,
      moderate: violations.filter((v) => v.impact === "moderate").length,
      minor: violations.filter((v) => v.impact === "minor").length,
    },
  };
}

/**
 * Calculate score for a specific WCAG level
 * @param {Array} violations - Violations for this level
 * @param {Array} passes - Passes for this level
 * @returns {number} Score 0-100
 */
function calculateLevelScore(violations, passes) {
  const totalChecks = violations.length + passes.length;
  if (totalChecks === 0) return 100;

  const baseScore = (passes.length / totalChecks) * 100;

  // Apply impact-based deduction
  let impactDeduction = 0;
  violations.forEach((violation) => {
    const weight = IMPACT_WEIGHTS[violation.impact] || 1;
    const nodeCount = violation.nodes?.length || 1;
    impactDeduction += weight * nodeCount * 0.5; // Reduced weight for level-specific scores
  });

  const normalizedDeduction = Math.min(
    (impactDeduction / totalChecks) * 30,
    30
  );
  return Math.max(0, Math.round(baseScore - normalizedDeduction));
}

/**
 * Extract WCAG criterion from tags
 * @param {Array} tags - Tags from violation/pass
 * @returns {Array} WCAG criteria (e.g., ['1.1.1', '4.1.2'])
 */
function extractWCAGCriteria(tags) {
  const criteria = [];
  tags.forEach((tag) => {
    // Match patterns like 'wcag111', 'wcag412', etc.
    const match = tag.match(/wcag(\d)(\d)(\d)/);
    if (match) {
      criteria.push(`${match[1]}.${match[2]}.${match[3]}`);
    }
  });
  return [...new Set(criteria)]; // Remove duplicates
}

/**
 * Generate detailed accessibility report
 * @param {Object} axeResults - Results from axe-core
 * @returns {Object} Detailed report
 */
export function generateDetailedReport(axeResults) {
  const {
    violations = [],
    passes = [],
    incomplete = [],
    inapplicable = [],
  } = axeResults;

  // Categorize by WCAG level
  const violationsByLevel = categorizeByLevel(violations);
  const passesByLevel = categorizePassesByLevel(passes);

  // Calculate overall score
  const overallScoreData = calculateScore(violations, passes);

  // Calculate level-specific scores
  const levelScores = {
    A: calculateLevelScore(violationsByLevel.A, passesByLevel.A),
    AA: calculateLevelScore(violationsByLevel.AA, passesByLevel.AA),
    AAA: calculateLevelScore(violationsByLevel.AAA, passesByLevel.AAA),
  };

  // Group violations by impact
  const violationsByImpact = {
    critical: violations.filter((v) => v.impact === "critical"),
    serious: violations.filter((v) => v.impact === "serious"),
    moderate: violations.filter((v) => v.impact === "moderate"),
    minor: violations.filter((v) => v.impact === "minor"),
  };

  // Count total affected elements
  let totalAffectedElements = 0;
  violations.forEach((v) => {
    totalAffectedElements += v.nodes?.length || 0;
  });

  // Format violations with detailed information
  const formatViolations = (violationList) => {
    return violationList.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      wcagLevel: extractWCAGCriteria(violation.tags),
      tags: violation.tags,
      nodes: violation.nodes.map((node) => ({
        html: node.html,
        target: node.target,
        failureSummary: node.failureSummary,
        impact: node.impact,
        fixes: {
          any: node.any.map((check) => ({
            id: check.id,
            message: check.message,
            data: check.data,
          })),
          all: node.all.map((check) => ({
            id: check.id,
            message: check.message,
            data: check.data,
          })),
          none: node.none.map((check) => ({
            id: check.id,
            message: check.message,
            data: check.data,
          })),
        },
      })),
      affectedElements: violation.nodes?.length || 0,
    }));
  };

  // Format passes with basic info
  const formatPasses = (passList) => {
    return passList.map((pass) => ({
      id: pass.id,
      description: pass.description,
      help: pass.help,
      helpUrl: pass.helpUrl,
      wcagLevel: extractWCAGCriteria(pass.tags),
      tags: pass.tags,
      passedElements: pass.nodes?.length || 0,
    }));
  };

  // Build report structure
  const report = {
    // Overall metrics
    overallScore: overallScoreData.overallScore,
    baseScore: overallScoreData.baseScore,
    impactDeduction: overallScoreData.impactDeduction,

    // Summary statistics
    summary: {
      totalRules: overallScoreData.totalRules,
      passedRules: overallScoreData.passedRules,
      failedRules: overallScoreData.failedRules,
      totalViolations: violations.length,
      totalAffectedElements,
      incompleteChecks: incomplete.length,
      inapplicableRules: inapplicable.length,
    },

    // WCAG level breakdown
    levelA: {
      score: levelScores.A,
      violations: formatViolations(violationsByLevel.A),
      passes: formatPasses(passesByLevel.A),
      violationCount: violationsByLevel.A.length,
      passCount: passesByLevel.A.length,
    },
    levelAA: {
      score: levelScores.AA,
      violations: formatViolations(violationsByLevel.AA),
      passes: formatPasses(passesByLevel.AA),
      violationCount: violationsByLevel.AA.length,
      passCount: passesByLevel.AA.length,
    },
    levelAAA: {
      score: levelScores.AAA,
      violations: formatViolations(violationsByLevel.AAA),
      passes: formatPasses(passesByLevel.AAA),
      violationCount: violationsByLevel.AAA.length,
      passCount: passesByLevel.AAA.length,
    },

    // Impact-based grouping
    criticalIssues: formatViolations(violationsByImpact.critical),
    seriousIssues: formatViolations(violationsByImpact.serious),
    moderateIssues: formatViolations(violationsByImpact.moderate),
    minorIssues: formatViolations(violationsByImpact.minor),

    // Impact counts
    impactCounts: {
      critical: violationsByImpact.critical.length,
      serious: violationsByImpact.serious.length,
      moderate: violationsByImpact.moderate.length,
      minor: violationsByImpact.minor.length,
    },

    // Total issues by severity
    totalIssues: violations.length,

    // Incomplete and inapplicable
    incompleteChecks: incomplete.map((item) => ({
      id: item.id,
      description: item.description,
      help: item.help,
      nodes: item.nodes?.length || 0,
    })),

    // Metadata
    testEngine: {
      name: axeResults.testEngine?.name || "axe-core",
      version: axeResults.testEngine?.version || "unknown",
    },
    testRunner: {
      name: axeResults.testRunner?.name || "@axe-core/puppeteer",
    },
    timestamp: new Date().toISOString(),
    url: axeResults.url,
  };

  return report;
}

/**
 * Complete accessibility audit
 * @param {string} url - URL to audit
 * @param {Object} options - Audit options
 * @returns {Promise<Object>} Complete audit report
 */
export async function performAccessibilityAudit(url, options = {}) {
  try {
    // Run scan
    const scanResult = await runAccessibilityScan(url, options);

    if (!scanResult.success) {
      throw new Error("Scan failed");
    }

    // Generate detailed report
    const report = generateDetailedReport(scanResult.results);

    return {
      success: true,
      report,
      timestamp: scanResult.timestamp,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

export default {
  runAccessibilityScan,
  categorizeByLevel,
  categorizePassesByLevel,
  calculateScore,
  generateDetailedReport,
  performAccessibilityAudit,
};
