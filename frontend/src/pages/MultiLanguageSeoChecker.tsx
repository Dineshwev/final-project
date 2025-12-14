/**
 * Multi-Language SEO Checker Component
 * Analyzes hreflang tags, language declarations, and international SEO elements from scan results
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import useScanResults from "../hooks/useScanResults";
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

const MultiLanguageSeoChecker: React.FC = () => {
  const { scanResults, serviceData, hasServiceData, serviceStatus, loading, error: scanError } = useScanResults({ serviceName: 'multiLanguage' });
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  // Get multi-language data from scan results
  const multiLanguageData = serviceData;
  const hasMultiLanguageData = hasServiceData;

  // Set error from scan service
  React.useEffect(() => {
    if (scanError) {
      setError(scanError);
    } else if (!hasMultiLanguageData && !loading) {
      setError(serviceStatus);
    } else {
      setError(null);
    }
  }, [scanError, hasMultiLanguageData, loading, serviceStatus]);

  const sampleUrls = [
    "https://www.wikipedia.org",
    "https://www.airbnb.com",
    "https://www.google.com",
  ];

  const redirectToScan = () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }
    // Redirect to scan page to run a new scan
    window.location.href = `/scan?url=${encodeURIComponent(url)}`;
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
        return "text-green-600 bg-green-100";
      case "B":
        return "text-blue-600 bg-blue-100";
      case "C":
        return "text-yellow-600 bg-yellow-100";
      case "D":
      case "F":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case "high":
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      case "medium":
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case "low":
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const redirectToSample = (sampleUrl: string) => {
    setUrl(sampleUrl);
    redirectToScan();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
            <GlobeAltIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Multi-Language SEO Checker
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Analyze your website's international SEO implementation, hreflang
            tags, language declarations, and global optimization strategies.
          </p>
        </div>

        {/* URL Input Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="max-w-4xl mx-auto">
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

            {!hasMultiLanguageData && (
              <form onSubmit={(e) => { e.preventDefault(); redirectToScan(); }} className="space-y-6">
                <div className="relative">
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL to Analyze
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
                      className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-r-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                      <GlobeAltIcon className="h-5 w-5 mr-2" />
                      Analyze
                    </button>
                  </div>
                </div>

                {/* Sample URLs */}
                <div>
                  <p className="text-sm text-gray-600 mb-3">Try these examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {sampleUrls.map((sampleUrl, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => redirectToSample(sampleUrl)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                      >
                        {sampleUrl}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div className="flex">
              <XCircleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-center">
              <ArrowPathIcon className="h-8 w-8 text-indigo-600 animate-spin mr-3" />
              <span className="text-lg text-gray-600">Loading scan results...</span>
            </div>
          </div>
        )}

        {multiLanguageData && (
          <div className="space-y-8">
            {/* Overview Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Analysis Overview
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Overall Score:</span>
                      <span className="text-3xl font-bold text-indigo-600">
                        {multiLanguageData.score || 0}/100
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Grade:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(
                          multiLanguageData.grade || "N/A"
                        )}`}
                      >
                        {multiLanguageData.grade || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Languages Detected:</span>
                      <span className="font-medium">
                        {multiLanguageData.languagesDetected || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {multiLanguageData.hreflangTags?.length || 0}
                      </div>
                      <div className="text-sm text-green-800">Hreflang Tags</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {multiLanguageData.issues?.length || 0}
                      </div>
                      <div className="text-sm text-blue-800">Total Issues</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hreflang Analysis */}
            {multiLanguageData.hreflangTags && multiLanguageData.hreflangTags.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <button
                  onClick={() => toggleSection("hreflang")}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h2 className="text-2xl font-bold text-gray-900">
                    Hreflang Tags Analysis
                  </h2>
                  {expandedSections.has("hreflang") ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>

                {expandedSections.has("hreflang") && (
                  <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Language
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            URL
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {multiLanguageData.hreflangTags.map((tag: any, index: number) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {tag.language}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <a
                                href={tag.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-500 truncate block max-w-xs"
                              >
                                {tag.url}
                              </a>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {tag.isValid ? (
                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircleIcon className="h-5 w-5 text-red-500" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Issues Section */}
            {multiLanguageData.issues && multiLanguageData.issues.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <button
                  onClick={() => toggleSection("issues")}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h2 className="text-2xl font-bold text-gray-900">
                    Issues & Recommendations
                  </h2>
                  {expandedSections.has("issues") ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>

                {expandedSections.has("issues") && (
                  <div className="mt-6 space-y-4">
                    {multiLanguageData.issues.map((issue: any, index: number) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start space-x-3">
                          {getSeverityIcon(issue.severity)}
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              {issue.title || issue.type}
                            </h3>
                            <p className="text-gray-600 mt-1">
                              {issue.message}
                            </p>
                            {issue.recommendation && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800">
                                  <strong>Recommendation:</strong> {issue.recommendation}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Language Detection */}
            {multiLanguageData.languageDetection && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Language Detection
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Detected Language
                    </h3>
                    <p className="text-2xl font-bold text-indigo-600">
                      {multiLanguageData.languageDetection.detectedLanguage || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Confidence: {Math.round((multiLanguageData.languageDetection.confidence || 0) * 100)}%
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Declared Language
                    </h3>
                    <p className="text-2xl font-bold text-purple-600">
                      {multiLanguageData.languageDetection.declaredLanguage || "None"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Match: {multiLanguageData.languageDetection.matches ? "✓" : "✗"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {multiLanguageData.recommendations && multiLanguageData.recommendations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Recommendations
                </h2>
                <div className="space-y-3">
                  {multiLanguageData.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                      <p className="text-gray-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiLanguageSeoChecker;