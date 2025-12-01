/**
 * Multi-Language SEO Checker Component
 * Analyzes hreflang tags, language declarations, and international SEO elements
 */

import React, { useState } from "react";
import {
  GlobeAltIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface HreflangTag {
  language: string;
  url: string;
  isValid: boolean;
  errors: string[];
}

interface IssueItem {
  type: string;
  message: string;
  impact: string;
  fix: string;
}

interface InternationalSEOReport {
  url: string;
  timestamp: string;
  overallScore: number;
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  hreflangTags: HreflangTag[];
  languageDeclaration: {
    htmlLang: string | null;
    contentLanguageHeader: string | null;
    metaLanguage: string | null;
    isConsistent: boolean;
    conflicts: string[];
  };
  languageDetection: {
    detectedLanguage: string;
    confidence: number;
    declaredLanguage: string | null;
    matches: boolean;
  };
  urlStructure: {
    type: string;
    example: string;
    isGoodPractice: boolean;
    recommendation: string;
  };
  rtlAnalysis: {
    isRTLLanguage: boolean;
    hasDirAttribute: boolean;
    hasCSSDirection: boolean;
    issues: string[];
  };
  characterEncoding: {
    isUTF8: boolean;
    declaration: string | null;
    issues: string[];
  };
  issues: {
    critical: IssueItem[];
    high: IssueItem[];
    medium: IssueItem[];
    low: IssueItem[];
  };
  recommendations: string[];
  summary: {
    totalIssues: number;
    hreflangTagsCount: number;
    languagesDetected: number;
    hasXDefault: boolean;
    hasSelfReference: boolean;
    bidirectionalLinksValid: boolean;
  };
}

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3002/api";

const MultiLanguageSeoChecker: React.FC = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<InternationalSEOReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  const sampleUrls = [
    "https://www.wikipedia.org",
    "https://www.airbnb.com",
    "https://www.google.com",
  ];

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      // Construct API URL
      const apiUrl = API_BASE_URL.endsWith("/api")
        ? `${API_BASE_URL}/multi-language-seo?url=${encodeURIComponent(url)}`
        : `${API_BASE_URL}/api/multi-language-seo?url=${encodeURIComponent(
            url
          )}`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze multi-language SEO");
      }

      setReport(data.data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze URL");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
      case "A":
        return "text-green-600";
      case "B":
        return "text-blue-600";
      case "C":
        return "text-yellow-600";
      case "D":
        return "text-orange-600";
      case "F":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      case "high":
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />;
      case "medium":
        return <InformationCircleIcon className="h-5 w-5 text-yellow-600" />;
      case "low":
        return <InformationCircleIcon className="h-5 w-5 text-blue-600" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <GlobeAltIcon className="h-16 w-16 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Multi-Language SEO Checker
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Analyze hreflang tags, language declarations, and international SEO
            elements
          </p>
        </div>

        {/* URL Input */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Website URL
              </label>
              <div className="flex gap-4">
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
                  placeholder="https://example.com"
                  className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3"
                />
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze"
                  )}
                </button>
              </div>
            </div>

            {/* Sample URLs */}
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Try these sample URLs:
              </p>
              <div className="flex flex-wrap gap-2">
                {sampleUrls.map((sampleUrl) => (
                  <button
                    key={sampleUrl}
                    onClick={() => setUrl(sampleUrl)}
                    className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md transition-colors"
                  >
                    {sampleUrl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2 text-red-800">
              <XCircleIcon className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Report */}
        {report && (
          <div className="space-y-6">
            {/* Score Card */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div
                    className={`text-6xl font-bold mb-2 ${getGradeColor(
                      report.grade
                    )} drop-shadow-lg`}
                  >
                    {report.grade}
                  </div>
                  <div className="text-indigo-100">Grade</div>
                </div>
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2">
                    {report.overallScore}
                  </div>
                  <div className="text-indigo-100">Overall Score</div>
                </div>
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2">
                    {report.summary.totalIssues}
                  </div>
                  <div className="text-indigo-100">Total Issues</div>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Hreflang Tags</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {report.summary.hreflangTagsCount}
                    </p>
                  </div>
                  <GlobeAltIcon className="h-12 w-12 text-indigo-600" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Languages</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {report.summary.languagesDetected}
                    </p>
                  </div>
                  <GlobeAltIcon className="h-12 w-12 text-purple-600" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Bidirectional Links</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {report.summary.bidirectionalLinksValid ? "✓" : "✗"}
                    </p>
                  </div>
                  {report.summary.bidirectionalLinksValid ? (
                    <CheckCircleIcon className="h-12 w-12 text-green-600" />
                  ) : (
                    <XCircleIcon className="h-12 w-12 text-red-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Hreflang Tags */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <button
                onClick={() => toggleSection("hreflang")}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <GlobeAltIcon className="h-6 w-6 text-indigo-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Hreflang Tags ({report.hreflangTags.length})
                  </h2>
                </div>
                {expandedSections.has("hreflang") ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {expandedSections.has("hreflang") && (
                <div className="p-6 pt-0 border-t border-gray-100">
                  {report.hreflangTags.length > 0 ? (
                    <div className="space-y-3">
                      {report.hreflangTags.map((tag, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-2 ${
                            tag.isValid
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {tag.isValid ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
                            ) : (
                              <XCircleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono font-semibold text-gray-900">
                                  {tag.language}
                                </span>
                                <span className="text-gray-400">→</span>
                                <span className="text-sm text-gray-600 truncate">
                                  {tag.url}
                                </span>
                              </div>
                              {tag.errors.length > 0 && (
                                <div className="mt-2">
                                  {tag.errors.map((err, i) => (
                                    <p key={i} className="text-sm text-red-700">
                                      • {err}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No hreflang tags found
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Language Detection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <GlobeAltIcon className="h-6 w-6 text-indigo-600" />
                Language Detection
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Detected Language
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {report.languageDetection.detectedLanguage.toUpperCase()}
                    <span className="text-sm text-gray-500 ml-2">
                      ({Math.round(report.languageDetection.confidence * 100)}%
                      confidence)
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Declared Language
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {report.languageDetection.declaredLanguage ||
                      "Not declared"}
                  </p>
                </div>
              </div>
              {!report.languageDetection.matches &&
                report.languageDetection.confidence > 0.5 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Language mismatch detected - declared and detected
                      languages don't match
                    </p>
                  </div>
                )}
            </div>

            {/* Issues */}
            {Object.entries(report.issues).map(
              ([severity, issueList]) =>
                issueList.length > 0 && (
                  <div
                    key={severity}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleSection(severity)}
                      className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {getSeverityIcon(severity)}
                        <h2 className="text-xl font-bold text-gray-900 capitalize">
                          {severity} Issues ({issueList.length})
                        </h2>
                      </div>
                      {expandedSections.has(severity) ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                      )}
                    </button>

                    {expandedSections.has(severity) && (
                      <div className="p-6 pt-0 border-t border-gray-100 space-y-4">
                        {issueList.map((issue, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border-2 ${getSeverityColor(
                              severity
                            )}`}
                          >
                            <h3 className="font-semibold mb-2">
                              {issue.message}
                            </h3>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium">Impact:</span>{" "}
                                {issue.impact}
                              </div>
                              <div>
                                <span className="font-medium">Fix:</span>{" "}
                                {issue.fix}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
            )}

            {/* Recommendations */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <InformationCircleIcon className="h-6 w-6 text-indigo-600" />
                Recommendations
              </h2>
              <ul className="space-y-2">
                {report.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Additional Checks */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* URL Structure */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  URL Structure
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Type:</span>{" "}
                    {report.urlStructure.type}
                  </div>
                  <div>
                    <span className="font-medium">Example:</span>{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {report.urlStructure.example}
                    </code>
                  </div>
                  <div
                    className={
                      report.urlStructure.isGoodPractice
                        ? "text-green-700"
                        : "text-orange-700"
                    }
                  >
                    {report.urlStructure.recommendation}
                  </div>
                </div>
              </div>

              {/* Character Encoding */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Character Encoding
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Encoding:</span>{" "}
                    {report.characterEncoding.declaration || "Not declared"}
                  </div>
                  <div
                    className={
                      report.characterEncoding.isUTF8
                        ? "text-green-700"
                        : "text-red-700"
                    }
                  >
                    {report.characterEncoding.isUTF8
                      ? "✓ UTF-8"
                      : "✗ Not UTF-8"}
                  </div>
                  {report.characterEncoding.issues.length > 0 && (
                    <div className="mt-2">
                      {report.characterEncoding.issues.map((issue, i) => (
                        <p key={i} className="text-orange-700">
                          • {issue}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiLanguageSeoChecker;
