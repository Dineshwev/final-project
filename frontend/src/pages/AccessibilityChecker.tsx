import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import useScanResults from "../hooks/useScanResults";
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

const AccessibilityChecker: React.FC = () => {
  const { scanResults, serviceData, hasServiceData, serviceStatus, loading, error: scanError } = useScanResults({ serviceName: 'accessibility' });
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [expandedViolations, setExpandedViolations] = useState<Set<string>>(
    new Set()
  );
  const [activeTab, setActiveTab] = useState<"all" | "A" | "AA" | "AAA">("all");

  // Get accessibility data from scan results
  const accessibilityData = serviceData;
  const hasAccessibilityData = hasServiceData;

  // Set error from scan service
  React.useEffect(() => {
    if (scanError) {
      setError(scanError);
    } else if (!hasAccessibilityData && !loading) {
      setError(serviceStatus);
    } else {
      setError("");
    }
  }, [scanError, hasAccessibilityData, loading, serviceStatus]);

  const redirectToScan = () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }
    // Redirect to scan page to run a new scan
    window.location.href = `/scan?url=${encodeURIComponent(url)}`;
  };

  const toggleViolation = (id: string) => {
    setExpandedViolations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getScoreBgGradient = (score: number) => {
    if (score >= 90) return "from-green-400 to-green-600";
    if (score >= 70) return "from-yellow-400 to-yellow-600";
    return "from-red-400 to-red-600";
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "critical": return "text-red-600";
      case "serious": return "text-red-500";
      case "moderate": return "text-yellow-600";
      case "minor": return "text-blue-600";
      default: return "text-gray-600";
    }
  };

  const getImpactBgColor = (impact: string) => {
    switch (impact) {
      case "critical": return "bg-red-50 border-red-200";
      case "serious": return "bg-red-50 border-red-200";
      case "moderate": return "bg-yellow-50 border-yellow-200";
      case "minor": return "bg-blue-50 border-blue-200";
      default: return "bg-gray-50 border-gray-200";
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "critical":
      case "serious":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "moderate":
        return <Info className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getWCAGLevelColor = (level: string) => {
    switch (level) {
      case "A": return "bg-blue-100 text-blue-800";
      case "AA": return "bg-green-100 text-green-800";
      case "AAA": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const truncateHTML = (html: string, maxLength = 100) => {
    if (html.length <= maxLength) return html;
    return html.substring(0, maxLength) + "...";
  };

  const handleExport = () => {
    if (!accessibilityData) return;
    
    const dataStr = JSON.stringify(accessibilityData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'accessibility-audit.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter violations by WCAG level
  const getFilteredViolations = () => {
    if (!accessibilityData?.issues) return [];
    
    const issues = accessibilityData.issues;
    if (activeTab === "all") return issues;
    
    return issues.filter((issue: any) => {
      const level = issue.wcagLevel || issue.level || "A";
      return level === activeTab;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
            <Eye className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Accessibility Checker
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Analyze your website's accessibility compliance with WCAG guidelines
            and identify areas for improvement.
          </p>
        </motion.div>

        {/* URL Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          {scanResults && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Showing results from scan: <strong>{scanResults.url}</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                <Link to="/scan" className="underline">Click here to run a new scan</Link>
              </p>
            </div>
          )}

          {!hasAccessibilityData && (
            <form onSubmit={(e) => { e.preventDefault(); redirectToScan(); }} className="space-y-6">
              <div>
                <label
                  htmlFor="url"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Website URL
                </label>
                <div className="flex rounded-lg shadow-sm">
                  <input
                    type="url"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 min-w-0 block w-full px-4 py-3 rounded-l-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                    placeholder="https://example.com"
                    required
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-r-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {loading ? (
                      <Loader className="animate-spin h-5 w-5 mr-2" />
                    ) : (
                      <Eye className="h-5 w-5 mr-2" />
                    )}
                    Analyze
                  </button>
                </div>
              </div>
            </form>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-8"
          >
            <div className="flex items-center justify-center">
              <Loader className="animate-spin h-8 w-8 text-indigo-600 mr-3" />
              <span className="text-lg text-gray-600">Loading accessibility analysis...</span>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {accessibilityData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Summary Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  Accessibility Report
                </h2>
                <button
                  onClick={handleExport}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Accessibility Score */}
                <div className="text-center">
                  <div
                    className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-r ${getScoreBgGradient(
                      accessibilityData.score || 0
                    )} flex items-center justify-center mb-4`}
                  >
                    <span className="text-2xl font-bold text-white">
                      {accessibilityData.score || 0}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Accessibility Score
                  </h3>
                  <p className="text-gray-600">Out of 100</p>
                </div>

                {/* Issues Count */}
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-red-600">
                      {accessibilityData.issues?.length || 0}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Issues Found
                  </h3>
                  <p className="text-gray-600">Accessibility violations</p>
                </div>

                {/* WCAG Compliance */}
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-blue-600">
                      {accessibilityData.wcagLevel || "AA"}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    WCAG Level
                  </h3>
                  <p className="text-gray-600">Compliance target</p>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  {["all", "A", "AA", "AAA"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {tab === "all" ? "All Issues" : `WCAG ${tab}`}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Violations List */}
              <div className="space-y-4">
                {getFilteredViolations().length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {activeTab === "all"
                        ? "No accessibility issues found!"
                        : `No WCAG ${activeTab} issues found!`}
                    </p>
                  </div>
                ) : (
                  getFilteredViolations().map((violation: any, index: number) => (
                    <div
                      key={`${violation.type}_${index}`}
                      className={`border rounded-lg p-4 ${getImpactBgColor(
                        violation.severity || violation.impact || "minor"
                      )}`}
                    >
                      <div
                        className="flex items-start justify-between cursor-pointer"
                        onClick={() => toggleViolation(`${violation.type}_${index}`)}
                      >
                        <div className="flex items-start space-x-3 flex-1">
                          {getImpactIcon(violation.severity || violation.impact || "minor")}
                          <div>
                            <h3
                              className={`font-semibold ${getImpactColor(
                                violation.severity || violation.impact || "minor"
                              )}`}
                            >
                              {violation.type || violation.title || "Accessibility Issue"}
                            </h3>
                            <p className="text-gray-700 mt-1">
                              {violation.description || violation.message}
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getWCAGLevelColor(
                                  violation.wcagLevel || violation.level || "A"
                                )}`}
                              >
                                WCAG {violation.wcagLevel || violation.level || "A"}
                              </span>
                              <span className="text-sm text-gray-500">
                                {violation.count || 1} instance{(violation.count || 1) > 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                        {expandedViolations.has(`${violation.type}_${index}`) ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>

                      {expandedViolations.has(`${violation.type}_${index}`) && (
                        <div className="mt-4 border-t pt-4">
                          {violation.help && (
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-900 mb-2">
                                How to fix:
                              </h4>
                              <p className="text-gray-700">{violation.help}</p>
                            </div>
                          )}
                          
                          {violation.helpUrl && (
                            <a
                              href={violation.helpUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Learn more
                            </a>
                          )}

                          {violation.elements && violation.elements.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-medium text-gray-900 mb-2">
                                Affected Elements:
                              </h4>
                              <div className="space-y-2">
                                {violation.elements.slice(0, 3).map((element: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="bg-gray-100 rounded p-2 text-sm font-mono"
                                  >
                                    {truncateHTML(element.html || element.selector || "Unknown element")}
                                  </div>
                                ))}
                                {violation.elements.length > 3 && (
                                  <p className="text-sm text-gray-500">
                                    ... and {violation.elements.length - 3} more
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AccessibilityChecker;