import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Download,
  Loader,
  ExternalLink,
  Eye,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  runAccessibilityAudit,
  exportAsJSON,
  getScoreBgGradient,
  getImpactColor,
  getImpactBgColor,
  getImpactIcon,
  getWCAGLevelColor,
  truncateHTML,
  type AuditResult,
  type Violation,
} from "../services/accessibilityService";

const AccessibilityChecker: React.FC = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");
  const [expandedViolations, setExpandedViolations] = useState<Set<string>>(
    new Set()
  );
  const [activeTab, setActiveTab] = useState<"all" | "A" | "AA" | "AAA">("all");

  const handleAudit = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const auditResult = await runAccessibilityAudit(url);
      setResult(auditResult);

      if (!auditResult.success) {
        setError(auditResult.error || "Audit failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audit failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleViolation = (violationId: string) => {
    const newExpanded = new Set(expandedViolations);
    if (newExpanded.has(violationId)) {
      newExpanded.delete(violationId);
    } else {
      newExpanded.add(violationId);
    }
    setExpandedViolations(newExpanded);
  };

  const handleExport = () => {
    if (result?.report) {
      exportAsJSON(result.report);
    }
  };

  const renderViolation = (violation: Violation, index: number) => {
    const isExpanded = expandedViolations.has(violation.id + index);

    return (
      <div
        key={`${violation.id}-${index}`}
        className={`border-2 rounded-xl p-5 ${getImpactBgColor(
          violation.impact
        )}`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <span className="text-2xl">{getImpactIcon(violation.impact)}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h4 className={`font-bold ${getImpactColor(violation.impact)}`}>
                  {violation.help}
                </h4>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    violation.impact === "critical"
                      ? "bg-red-200 text-red-800"
                      : violation.impact === "serious"
                      ? "bg-orange-200 text-orange-800"
                      : violation.impact === "moderate"
                      ? "bg-yellow-200 text-yellow-800"
                      : "bg-blue-200 text-blue-800"
                  }`}
                >
                  {violation.impact.toUpperCase()}
                </span>
                {violation.wcagLevel.map((level) => (
                  <span
                    key={level}
                    className={`text-xs px-2 py-1 rounded ${getWCAGLevelColor(
                      level.split(".")[0]
                    )}`}
                  >
                    WCAG {level}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-700 mb-2">
                {violation.description}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600">
                  {violation.affectedElements} element
                  {violation.affectedElements !== 1 ? "s" : ""} affected
                </span>
                <a
                  href={violation.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  Learn more <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
          <button
            onClick={() => toggleViolation(violation.id + index)}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 space-y-4"
          >
            {violation.nodes.map((node, nodeIndex) => (
              <div
                key={nodeIndex}
                className="bg-white rounded-lg p-4 border border-gray-200"
              >
                <div className="mb-3">
                  <span className="text-xs font-semibold text-gray-600 uppercase">
                    Element {nodeIndex + 1}
                  </span>
                  <div className="mt-2">
                    <code className="text-xs bg-gray-100 p-2 rounded block overflow-x-auto">
                      {truncateHTML(node.html, 150)}
                    </code>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    <strong>Target:</strong> {node.target.join(" > ")}
                  </div>
                </div>

                {node.failureSummary && (
                  <div className="mb-3">
                    <span className="text-xs font-semibold text-red-700">
                      Issue:
                    </span>
                    <p className="text-sm text-gray-700 mt-1">
                      {node.failureSummary}
                    </p>
                  </div>
                )}

                {node.fixes.any.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-green-700">
                      How to fix:
                    </span>
                    <ul className="mt-1 space-y-1">
                      {node.fixes.any.map((fix, fixIndex) => (
                        <li key={fixIndex} className="text-sm text-gray-700">
                          • {fix.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Eye className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            WCAG Accessibility Checker
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Test your website against WCAG 2.1 guidelines (Level A, AA, AAA).
            Powered by axe-core automated testing.
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                onKeyPress={(e) => e.key === "Enter" && handleAudit()}
              />
            </div>

            <button
              onClick={handleAudit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Scanning... (this may take 30-60 seconds)
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Run Accessibility Audit
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8"
          >
            <div className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Audit Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {result?.success && result.report && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Score Banner */}
            <div
              className={`bg-gradient-to-r ${getScoreBgGradient(
                result.report.overallScore
              )} rounded-2xl p-8 text-white shadow-xl`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    Accessibility Score
                  </h2>
                  <p className="text-white/90">
                    Based on {result.report.summary.totalRules} automated checks
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-7xl font-bold">
                    {result.report.overallScore}
                  </div>
                  <div className="text-xl opacity-90">out of 100</div>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-md border-2 border-green-100">
                <div className="text-3xl font-bold text-green-600">
                  {result.report.summary.passedRules}
                </div>
                <div className="text-sm text-gray-600 mt-1">Passed Rules</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border-2 border-red-100">
                <div className="text-3xl font-bold text-red-600">
                  {result.report.summary.failedRules}
                </div>
                <div className="text-sm text-gray-600 mt-1">Failed Rules</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border-2 border-orange-100">
                <div className="text-3xl font-bold text-orange-600">
                  {result.report.summary.totalAffectedElements}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Affected Elements
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border-2 border-blue-100">
                <div className="text-3xl font-bold text-blue-600">
                  {result.report.totalIssues}
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Issues</div>
              </div>
            </div>

            {/* Impact Summary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Issues by Severity
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-3xl mb-1">🔴</div>
                  <div className="text-2xl font-bold text-red-700">
                    {result.report.impactCounts.critical}
                  </div>
                  <div className="text-sm text-gray-600">Critical</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl mb-1">🟠</div>
                  <div className="text-2xl font-bold text-orange-700">
                    {result.report.impactCounts.serious}
                  </div>
                  <div className="text-sm text-gray-600">Serious</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-3xl mb-1">🟡</div>
                  <div className="text-2xl font-bold text-yellow-700">
                    {result.report.impactCounts.moderate}
                  </div>
                  <div className="text-sm text-gray-600">Moderate</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl mb-1">🔵</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {result.report.impactCounts.minor}
                  </div>
                  <div className="text-sm text-gray-600">Minor</div>
                </div>
              </div>
            </div>

            {/* WCAG Level Tabs */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    activeTab === "all"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Issues ({result.report.totalIssues})
                </button>
                <button
                  onClick={() => setActiveTab("A")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    activeTab === "A"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Level A ({result.report.levelA.violationCount}) - Score:{" "}
                  {result.report.levelA.score}%
                </button>
                <button
                  onClick={() => setActiveTab("AA")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    activeTab === "AA"
                      ? "bg-purple-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Level AA ({result.report.levelAA.violationCount}) - Score:{" "}
                  {result.report.levelAA.score}%
                </button>
                <button
                  onClick={() => setActiveTab("AAA")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    activeTab === "AAA"
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Level AAA ({result.report.levelAAA.violationCount}) - Score:{" "}
                  {result.report.levelAAA.score}%
                </button>
              </div>

              <div className="space-y-4">
                {activeTab === "all" && (
                  <>
                    {result.report.criticalIssues.length > 0 && (
                      <>
                        <h4 className="font-bold text-lg text-red-700 mb-3">
                          Critical Issues ({result.report.criticalIssues.length}
                          )
                        </h4>
                        {result.report.criticalIssues.map((v, i) =>
                          renderViolation(v, i)
                        )}
                      </>
                    )}
                    {result.report.seriousIssues.length > 0 && (
                      <>
                        <h4 className="font-bold text-lg text-orange-700 mb-3 mt-6">
                          Serious Issues ({result.report.seriousIssues.length})
                        </h4>
                        {result.report.seriousIssues.map((v, i) =>
                          renderViolation(v, i)
                        )}
                      </>
                    )}
                    {result.report.moderateIssues.length > 0 && (
                      <>
                        <h4 className="font-bold text-lg text-yellow-700 mb-3 mt-6">
                          Moderate Issues ({result.report.moderateIssues.length}
                          )
                        </h4>
                        {result.report.moderateIssues.map((v, i) =>
                          renderViolation(v, i)
                        )}
                      </>
                    )}
                    {result.report.minorIssues.length > 0 && (
                      <>
                        <h4 className="font-bold text-lg text-blue-700 mb-3 mt-6">
                          Minor Issues ({result.report.minorIssues.length})
                        </h4>
                        {result.report.minorIssues.map((v, i) =>
                          renderViolation(v, i)
                        )}
                      </>
                    )}
                  </>
                )}
                {activeTab === "A" &&
                  result.report.levelA.violations.map((v, i) =>
                    renderViolation(v, i)
                  )}
                {activeTab === "AA" &&
                  result.report.levelAA.violations.map((v, i) =>
                    renderViolation(v, i)
                  )}
                {activeTab === "AAA" &&
                  result.report.levelAAA.violations.map((v, i) =>
                    renderViolation(v, i)
                  )}
              </div>
            </div>

            {/* Export Button */}
            <div className="flex gap-4">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                <Download className="w-5 h-5" />
                Export Report (JSON)
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    About This Report
                  </h4>
                  <p className="text-blue-700 text-sm mb-2">
                    This automated scan tests against WCAG 2.1 Level A, AA, and
                    AAA success criteria using axe-core engine. While automated
                    testing catches many issues, manual testing is still
                    required for complete accessibility compliance.
                  </p>
                  <p className="text-blue-700 text-sm">
                    Powered by{" "}
                    <strong>
                      {result.report.testEngine.name} v
                      {result.report.testEngine.version}
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AccessibilityChecker;
