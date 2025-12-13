// src/pages/Results.tsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaDownload,
  FaArrowLeft,
  FaChartBar,
  FaShieldAlt,
  FaCode,
  FaMobileAlt,
  FaSearch,
} from "../components/Icons";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "https://bc-worker-env.eba-k8rrjwx.ap-southeast-2.elasticbeanstalk.com/api";

// Define interfaces for the result data
interface SeoIssue {
  id: string;
  type: "error" | "warning" | "info";
  title: string;
  description: string;
  impact: number; // 0-100
  recommendation: string;
}

interface PageMetrics {
  loadTime: number;
  pageSize: number;
  requests: number;
  mobileScore: number;
  desktopScore: number;
}

interface SecurityCheck {
  name: string;
  status: "pass" | "fail" | "warning";
  details: string;
}

interface KeywordData {
  keyword: string;
  frequency: number;
  competition: number;
  relevance: number;
}

interface ScanResultData {
  id: string;
  url: string;
  timestamp: string;
  score: number;
  seoIssues: SeoIssue[];
  metrics: PageMetrics;
  securityChecks: SecurityCheck[];
  keywords: KeywordData[];
}

const ResultsPage: React.FC = () => {
  const { scanId } = useParams<{ scanId: string }>();
  const [results, setResults] = useState<ScanResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingCSV, setDownloadingCSV] = useState(false);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;
    let pollCount = 0;
    const MAX_POLLS = 60; // Stop polling after 2 minutes (60 * 2 seconds)

    const fetchResults = async () => {
      if (!scanId) {
        setError("No scan ID provided");
        setLoading(false);
        return;
      }

      try {
        // Use direct fetch like Scan.tsx - no apiService wrapper
        const rRes = await fetch(`${API_BASE}/scan/${scanId}/results`);
        const rData = await rRes.json();

        console.log("Scan results response:", rData);

        if (rData.status === "success" && rData.data) {
          const result = rData.data;
          console.log("Raw scan results data:", result);

          // Add safety guard for invalid payload
          if (!result) {
            console.error("Invalid scan result payload", rData);
            setError("Invalid scan result data received");
            setLoading(false);
            return;
          }

          // Check if scan is still pending (for compatibility with old polling logic)
          if (
            result.status === "pending" ||
            result.status === "in-progress"
          ) {
            setError(null);
            pollCount++;

            if (pollCount >= MAX_POLLS) {
              setError("Scan is taking too long. Please check back later.");
              setLoading(false);
              return;
            }

            // Poll every 2 seconds for results
            pollInterval = setTimeout(fetchResults, 2000);
            return;
          }

          // Map backend response exactly as received
          const transformedData: ScanResultData = {
            id: result.id,
            url: result.url,
            timestamp: result.timestamp,
            score: result.score,
            seoIssues: result.seoIssues,
            metrics: result.metrics,
            securityChecks: result.securityChecks,
            keywords: result.keywords || [],
          };

          console.log("Transformed results:", transformedData);
          setResults(transformedData);
          setError(null);
          setLoading(false);
        } else if (rData.status === "error") {
          setError(rData.message || "Scan not found");
          setLoading(false);
        } else {
          setError(
            "Scan not found. It may have been deleted or never existed."
          );
          setLoading(false);
        }
      } catch (err) {
        console.error("Results fetch error:", err);
        setError(
          "An error occurred while fetching scan results. Please try again."
        );
        setLoading(false);
      }
    };

    fetchResults();

    // Cleanup function to clear the polling interval
    return () => {
      if (pollInterval) {
        clearTimeout(pollInterval);
      }
    };
  }, [scanId]);

  const handleExport = async (format: "pdf" | "csv") => {
    if (!scanId) return;

    if (format === "pdf") setDownloadingPDF(true);
    if (format === "csv") setDownloadingCSV(true);

    try {
      // Use direct fetch for export as well
      const response = await fetch(`${API_BASE}/export/${scanId}/${format}`);

      if (response.ok) {
        // Get the blob from the response
        const blob = await response.blob();

        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob);

        // Create a link element
        const link = document.createElement("a");
        link.href = url;
        link.download = `seo-report-${scanId}.${format}`;

        // Append to the document, click it, and remove it
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Release the URL
        window.URL.revokeObjectURL(url);
      } else {
        alert("Failed to export report");
      }
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export report");
    } finally {
      setDownloadingPDF(false);
      setDownloadingCSV(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Analyzing Your Website
              </h2>
              <p className="text-gray-600 text-center">
                Please wait while we scan your website for SEO, performance, and
                security issues...
              </p>
              <div className="mt-6 w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full animate-pulse"
                  style={{ width: "60%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-red-800 mb-2">
                  Failed to load scan results
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  {error || "The scan could not be found or has expired."}
                </p>
                <div className="flex gap-3">
                  <Link
                    to="/"
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                  >
                    <FaArrowLeft className="mr-2" />
                    Back to Dashboard
                  </Link>
                  <Link
                    to="/history"
                    className="inline-flex items-center px-4 py-2 bg-white text-red-700 text-sm font-medium rounded-md border border-red-300 hover:bg-red-50 transition-colors"
                  >
                    View History
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats from results data
  const seoIssues = results.seoIssues;
  const securityChecks = results.securityChecks;

  // Calculate stats
  const issueStats = {
    errors: seoIssues.filter((issue) => issue.type === "error").length,
    warnings: seoIssues.filter((issue) => issue.type === "warning").length,
    info: seoIssues.filter((issue) => issue.type === "info").length,
  };

  const securityStats = {
    pass: securityChecks.filter((check) => check.status === "pass").length,
    fail: securityChecks.filter((check) => check.status === "fail").length,
    warning: securityChecks.filter((check) => check.status === "warning")
      .length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 py-8 shadow-2xl">
        <div className="container mx-auto px-4">
          <Link
            to="/history"
            className="inline-flex items-center text-white/90 hover:text-white mb-4 font-medium transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Back to History
          </Link>
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                SEO Analysis Report
              </h1>
              <p className="text-white/90 text-lg font-medium mb-1">
                {results.url}
              </p>
              <p className="text-sm text-white/70">
                Analyzed on {new Date(results.timestamp).toLocaleString()}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleExport("pdf")}
                disabled={downloadingPDF}
                className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-bold text-white bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/30 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingPDF ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Downloading...
                  </>
                ) : (
                  <>
                    <FaDownload className="mr-2" /> Export PDF
                  </>
                )}
              </button>
              <button
                onClick={() => handleExport("csv")}
                disabled={downloadingCSV}
                className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-bold text-white bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/30 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingCSV ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Downloading...
                  </>
                ) : (
                  <>
                    <FaDownload className="mr-2" /> Export CSV
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* SEO Score Meter - Large Circular */}
        <div className="bg-slate-800/50 backdrop-blur-xl shadow-2xl rounded-2xl p-8 mb-8 border border-white/10">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Circular Score Meter */}
            <div className="flex-shrink-0 relative">
              <svg className="transform -rotate-90" width="200" height="200">
                {/* Background circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="12"
                  fill="none"
                />
                {/* Progress circle with gradient */}
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  stroke={
                    results.score >= 90
                      ? "url(#gradientGreen)"
                      : results.score >= 70
                      ? "url(#gradientYellow)"
                      : "url(#gradientRed)"
                  }
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 90}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 90 * (1 - results.score / 100)
                  }`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient
                    id="gradientGreen"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                  <linearGradient
                    id="gradientYellow"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                  <linearGradient
                    id="gradientRed"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#f87171" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-bold text-white">
                  {results.score}
                </span>
                <span className="text-sm font-semibold text-slate-400">
                  SEO SCORE
                </span>
              </div>
            </div>

            {/* Score Info */}
            <div className="flex-grow text-center lg:text-left">
              <h2 className="text-3xl font-bold text-white mb-3">
                {results.score >= 90
                  ? "Outstanding Performance! 🎉"
                  : results.score >= 70
                  ? "Good Progress! 👍"
                  : "Needs Optimization 🔧"}
              </h2>
              <p className="text-slate-300 text-lg mb-6">
                {results.score >= 90
                  ? "Your website is exceptionally well-optimized for search engines. Keep up the excellent work!"
                  : results.score >= 70
                  ? "Your site is performing well, but there's room for improvement in several key areas."
                  : "Several critical issues need attention to improve your search engine visibility."}
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                <span className="text-sm font-semibold text-blue-300">
                  Health Rating:
                </span>
                <span
                  className={`text-lg font-bold ${
                    results.score >= 90
                      ? "text-emerald-400"
                      : results.score >= 70
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}
                >
                  {results.score >= 90
                    ? "Excellent"
                    : results.score >= 70
                    ? "Good"
                    : "Poor"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Page Speed Card */}
          <div className="group bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <FaChartBar className="w-6 h-6 text-white" />
              </div>
              <span
                className={`text-2xl font-bold ${
                  results.metrics.loadTime < 2
                    ? "text-emerald-400"
                    : results.metrics.loadTime < 3
                    ? "text-amber-400"
                    : "text-red-400"
                }`}
              >
                {results.metrics.loadTime}s
              </span>
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Page Speed</h3>
            <p className="text-slate-400 text-sm">Load time performance</p>
          </div>

          {/* Mobile Usability Card */}
          <div className="group bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <FaMobileAlt className="w-6 h-6 text-white" />
              </div>
              <span
                className={`text-2xl font-bold ${
                  results.metrics.mobileScore >= 90
                    ? "text-emerald-400"
                    : results.metrics.mobileScore >= 70
                    ? "text-amber-400"
                    : "text-red-400"
                }`}
              >
                {results.metrics.mobileScore}
              </span>
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Mobile Score</h3>
            <p className="text-slate-400 text-sm">Mobile optimization</p>
          </div>

          {/* Backlinks Card */}
          <div className="group bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-emerald-500/50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <FaShieldAlt className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-emerald-400">
                {securityStats.pass}
              </span>
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Security</h3>
            <p className="text-slate-400 text-sm">Checks passed</p>
          </div>

          {/* Keywords Card */}
          <div className="group bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-cyan-500/50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg">
                <FaCode className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-cyan-400">
                {seoIssues.length}
              </span>
            </div>
            <h3 className="text-white font-bold text-lg mb-1">SEO Issues</h3>
            <p className="text-slate-400 text-sm">Items to review</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-2 mb-8">
          <nav className="flex space-x-2" aria-label="Tabs">
            {[
              { id: "overview", name: "Overview", icon: <FaChartBar /> },
              { id: "seo", name: "SEO Issues", icon: <FaSearch /> },
              { id: "performance", name: "Performance", icon: <FaMobileAlt /> },
              { id: "security", name: "Security", icon: <FaShieldAlt /> },
              { id: "keywords", name: "Keywords", icon: <FaCode /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                flex items-center whitespace-nowrap py-3 px-6 rounded-xl font-semibold text-sm transition-all
                ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 text-white shadow-lg"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }
              `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-slate-800/50 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-white/10">
          {activeTab === "overview" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Overview</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* SEO Issues */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">SEO Issues</h3>
                  <div className="flex justify-between">
                    <div className="flex items-center text-red-600">
                      <FaExclamationTriangle className="mr-1" />
                      <span>{issueStats.errors} Errors</span>
                    </div>
                    <div className="flex items-center text-yellow-600">
                      <FaExclamationTriangle className="mr-1" />
                      <span>{issueStats.warnings} Warnings</span>
                    </div>
                    <div className="flex items-center text-blue-600">
                      <FaInfoCircle className="mr-1" />
                      <span>{issueStats.info} Info</span>
                    </div>
                  </div>
                </div>

                {/* Performance */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Performance
                  </h3>
                  <div className="flex justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Load Time</div>
                      <div className="font-medium">
                        {results.metrics.loadTime}s
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Page Size</div>
                      <div className="font-medium">
                        {(results.metrics.pageSize / 1024).toFixed(2)} KB
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Requests</div>
                      <div className="font-medium">
                        {results.metrics.requests}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Security</h3>
                  <div className="flex justify-between">
                    <div className="flex items-center text-green-600">
                      <FaCheckCircle className="mr-1" />
                      <span>{securityStats.pass} Passed</span>
                    </div>
                    <div className="flex items-center text-red-600">
                      <FaExclamationTriangle className="mr-1" />
                      <span>{securityStats.fail} Failed</span>
                    </div>
                    <div className="flex items-center text-yellow-600">
                      <FaExclamationTriangle className="mr-1" />
                      <span>{securityStats.warning} Warnings</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Issues */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">
                    Top Issues to Address
                  </h3>
                  <ul className="divide-y divide-gray-200">
                    {results.seoIssues
                      .filter((issue) => issue.type === "error")
                      .slice(0, 3)
                      .map((issue) => (
                        <li key={issue.id} className="py-3">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {issue.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                {issue.description}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                  </ul>
                  <div className="mt-3">
                    <button
                      onClick={() => setActiveTab("seo")}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View all issues →
                    </button>
                  </div>
                </div>

                {/* Mobile vs Desktop Scores */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">
                    Performance Scores
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          Mobile
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {results.metrics.mobileScore}/100
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            results.metrics.mobileScore >= 90
                              ? "bg-green-500"
                              : results.metrics.mobileScore >= 70
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${results.metrics.mobileScore}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          Desktop
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {results.metrics.desktopScore}/100
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            results.metrics.desktopScore >= 90
                              ? "bg-green-500"
                              : results.metrics.desktopScore >= 70
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${results.metrics.desktopScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={() => setActiveTab("performance")}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View performance details →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "seo" && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                SEO Issues & Recommendations
              </h2>

              <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 p-6 rounded-xl border-2 border-red-500/30 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <FaExclamationTriangle className="w-6 h-6 text-red-400" />
                    <span className="text-4xl font-bold text-red-400">
                      {issueStats.errors}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-red-300">
                    Critical Errors
                  </div>
                  <p className="text-xs text-red-400/70 mt-1">
                    High priority fixes
                  </p>
                </div>
                <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 p-6 rounded-xl border-2 border-amber-500/30 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <FaExclamationTriangle className="w-6 h-6 text-amber-400" />
                    <span className="text-4xl font-bold text-amber-400">
                      {issueStats.warnings}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-amber-300">
                    Warnings
                  </div>
                  <p className="text-xs text-amber-400/70 mt-1">
                    Medium priority items
                  </p>
                </div>
                <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 p-6 rounded-xl border-2 border-emerald-500/30 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <FaCheckCircle className="w-6 h-6 text-emerald-400" />
                    <span className="text-4xl font-bold text-emerald-400">
                      {issueStats.info}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-emerald-300">
                    Good Practices
                  </div>
                  <p className="text-xs text-emerald-400/70 mt-1">
                    Informational items
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {results.seoIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`border-l-4 p-6 rounded-r-xl backdrop-blur-sm transition-all hover:scale-[1.02] ${
                      issue.type === "error"
                        ? "border-red-500 bg-gradient-to-r from-red-900/20 to-transparent"
                        : issue.type === "warning"
                        ? "border-amber-500 bg-gradient-to-r from-amber-900/20 to-transparent"
                        : "border-emerald-500 bg-gradient-to-r from-emerald-900/20 to-transparent"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                      <h3
                        className={`font-bold text-lg flex items-center gap-2 ${
                          issue.type === "error"
                            ? "text-red-300"
                            : issue.type === "warning"
                            ? "text-amber-300"
                            : "text-emerald-300"
                        }`}
                      >
                        {issue.type === "error" ? (
                          <FaExclamationTriangle className="w-5 h-5" />
                        ) : issue.type === "warning" ? (
                          <FaExclamationTriangle className="w-5 h-5" />
                        ) : (
                          <FaInfoCircle className="w-5 h-5" />
                        )}
                        {issue.title}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${
                          issue.impact > 70
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : issue.impact > 40
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        <span>Impact: {issue.impact}/100</span>
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                      {issue.description}
                    </p>
                    <div className="bg-slate-700/50 p-4 rounded-lg border border-white/10">
                      <div className="flex items-start gap-2">
                        <FaInfoCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-blue-300">
                            Recommendation:{" "}
                          </span>
                          <span className="text-slate-300">
                            {issue.recommendation}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "performance" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Performance</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Mobile Score
                  </h3>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-800 text-xl font-bold mr-4">
                      {results.metrics.mobileScore}
                    </div>
                    <div className="flex-grow">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div
                          className={`h-2.5 rounded-full ${
                            results.metrics.mobileScore >= 90
                              ? "bg-green-500"
                              : results.metrics.mobileScore >= 70
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${results.metrics.mobileScore}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {results.metrics.mobileScore >= 90
                          ? "Excellent mobile performance"
                          : results.metrics.mobileScore >= 70
                          ? "Good mobile performance with room for improvement"
                          : "Poor mobile performance, needs significant optimization"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Desktop Score
                  </h3>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-800 text-xl font-bold mr-4">
                      {results.metrics.desktopScore}
                    </div>
                    <div className="flex-grow">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div
                          className={`h-2.5 rounded-full ${
                            results.metrics.desktopScore >= 90
                              ? "bg-green-500"
                              : results.metrics.desktopScore >= 70
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${results.metrics.desktopScore}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {results.metrics.desktopScore >= 90
                          ? "Excellent desktop performance"
                          : results.metrics.desktopScore >= 70
                          ? "Good desktop performance with room for improvement"
                          : "Poor desktop performance, needs significant optimization"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
                <div className="px-4 py-5 sm:px-6 bg-gray-50">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Performance Metrics
                  </h3>
                </div>
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Page Load Time
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {results.metrics.loadTime} seconds
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Page Size
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {(results.metrics.pageSize / 1024).toFixed(2)} KB
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Total Requests
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {results.metrics.requests}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaInfoCircle className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Performance Recommendation
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        {results.metrics.loadTime > 3
                          ? "Your page load time is too slow. Consider optimizing images, using a CDN, and minifying CSS/JavaScript files."
                          : "Your page loads quickly! Continue to monitor performance as you add new features."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Security</h2>

              <div className="mb-4 grid grid-cols-3 gap-4 text-center">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">
                    {securityStats.pass}
                  </div>
                  <div className="text-sm text-green-700">Passed</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-red-700">
                    {securityStats.fail}
                  </div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-700">
                    {securityStats.warning}
                  </div>
                  <div className="text-sm text-yellow-700">Warnings</div>
                </div>
              </div>

              <div className="space-y-4">
                {results.securityChecks.map((check, index) => (
                  <div
                    key={index}
                    className={`border-l-4 p-4 rounded-r-lg ${
                      check.status === "pass"
                        ? "border-green-500 bg-green-50"
                        : check.status === "fail"
                        ? "border-red-500 bg-red-50"
                        : "border-yellow-500 bg-yellow-50"
                    }`}
                  >
                    <div className="flex justify-between">
                      <h3
                        className={`font-medium ${
                          check.status === "pass"
                            ? "text-green-800"
                            : check.status === "fail"
                            ? "text-red-800"
                            : "text-yellow-800"
                        }`}
                      >
                        {check.name}
                      </h3>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          check.status === "pass"
                            ? "bg-green-100 text-green-800"
                            : check.status === "fail"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {check.status.charAt(0).toUpperCase() +
                          check.status.slice(1)}
                      </span>
                    </div>
                    <p
                      className={`mt-1 text-sm ${
                        check.status === "pass"
                          ? "text-green-700"
                          : check.status === "fail"
                          ? "text-red-700"
                          : "text-yellow-700"
                      }`}
                    >
                      {check.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "keywords" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Keywords</h2>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Keyword
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Frequency
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Competition
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Relevance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.keywords.map((keyword, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {keyword.keyword}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {keyword.frequency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${
                                keyword.competition < 30
                                  ? "bg-green-500"
                                  : keyword.competition < 70
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${keyword.competition}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {keyword.competition}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="h-2.5 rounded-full bg-blue-500"
                              style={{ width: `${keyword.relevance}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {keyword.relevance}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaInfoCircle className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Keyword Optimization Tips
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>
                          Focus on keywords with high relevance but low
                          competition
                        </li>
                        <li>
                          Include keywords naturally in your page titles,
                          headers, and content
                        </li>
                        <li>
                          Consider long-tail variations of your primary keywords
                        </li>
                        <li>
                          Use keywords in image alt text and meta descriptions
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
