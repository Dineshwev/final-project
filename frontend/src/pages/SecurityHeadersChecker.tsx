// src/pages/SecurityHeadersChecker.tsx

import React, { useState } from "react";
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import type {
  SecurityReport,
  SecurityHeader,
} from "../utils/securityHeadersChecker";
import { getRiskColor } from "../utils/securityHeadersChecker";

const SecurityHeadersChecker: React.FC = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<SecurityReport | null>(null);

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "https://inrpws5mww.ap-southeast-2.awsapprunner.com/api";

  const handleCheck = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL (including http:// or https://)");
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      // Build API URL - handle if API_BASE_URL already includes /api
      const apiUrl = API_BASE_URL.endsWith("/api")
        ? `${API_BASE_URL}/security-headers?url=${encodeURIComponent(url)}`
        : `${API_BASE_URL}/api/security-headers?url=${encodeURIComponent(url)}`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check security headers");
      }

      if (data.success && data.data) {
        setReport(data.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to check security headers"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSampleUrl = (sampleUrl: string) => {
    setUrl(sampleUrl);
  };

  const scorePercentage = report ? report.overallScore : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <ShieldCheckIcon className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            HTTP Security Headers Checker
          </h1>
          <p className="text-lg text-gray-600">
            Analyze your website's security headers and get actionable
            recommendations
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Website URL
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleCheck()}
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleCheck}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {loading ? "Checking..." : "Check Headers"}
                </button>
              </div>
            </div>

            {/* Sample URLs */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-500">Try:</span>
              {[
                "https://github.com",
                "https://google.com",
                "https://example.com",
              ].map((sample) => (
                <button
                  key={sample}
                  onClick={() => handleSampleUrl(sample)}
                  className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Report Display */}
        {report && (
          <div className="space-y-6">
            {/* Overall Score Card */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2">
                    {report.overallScore}
                  </div>
                  <div className="text-blue-100">Overall Score</div>
                  <div className="mt-2 w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white rounded-full h-2 transition-all duration-500"
                      style={{ width: `${scorePercentage}%` }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className="text-6xl font-bold mb-2"
                    style={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
                  >
                    {report.grade}
                  </div>
                  <div className="text-blue-100">Security Grade</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold mb-2">
                    {report.summary.present} / {report.headers.length}
                  </div>
                  <div className="text-blue-100">Headers Present</div>
                  <div className="mt-2 text-sm">
                    <div className="text-red-200">
                      ⚠ {report.summary.missing} Missing
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
                <div className="text-2xl font-bold text-red-600">
                  {report.summary.critical}
                </div>
                <div className="text-sm text-gray-600">Critical Issues</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
                <div className="text-2xl font-bold text-orange-600">
                  {report.summary.high}
                </div>
                <div className="text-sm text-gray-600">High Priority</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
                <div className="text-2xl font-bold text-yellow-600">
                  {report.summary.medium}
                </div>
                <div className="text-sm text-gray-600">Medium Priority</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-lime-500">
                <div className="text-2xl font-bold text-lime-600">
                  {report.summary.low}
                </div>
                <div className="text-sm text-gray-600">Low Priority</div>
              </div>
            </div>

            {/* Additional Security Checks */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Additional Security Checks
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  {report.additionalChecks.httpsEnforced ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircleIcon className="w-6 h-6 text-red-600" />
                  )}
                  <div>
                    <div className="font-semibold">HTTPS</div>
                    <div className="text-sm text-gray-600">
                      {report.additionalChecks.httpsEnforced
                        ? "Enabled"
                        : "Not enforced"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  {report.additionalChecks.sslValid ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircleIcon className="w-6 h-6 text-red-600" />
                  )}
                  <div>
                    <div className="font-semibold">SSL Certificate</div>
                    <div className="text-sm text-gray-600">
                      {report.additionalChecks.sslDetails || "Valid"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  {!report.additionalChecks.mixedContent.detected ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  ) : (
                    <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
                  )}
                  <div>
                    <div className="font-semibold">Mixed Content</div>
                    <div className="text-sm text-gray-600">
                      {report.additionalChecks.mixedContent.detected
                        ? `${report.additionalChecks.mixedContent.count} HTTP resources`
                        : "None detected"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Headers Detailed List */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Security Headers Analysis
              </h2>
              <div className="space-y-4">
                {report.headers.map((header, index) => (
                  <HeaderCard key={index} header={header} />
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {report.recommendations.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  🎯 Priority Recommendations
                </h2>
                <div className="space-y-4">
                  {report.recommendations.map((rec, index) => (
                    <RecommendationCard key={index} recommendation={rec} />
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

// Header Card Component
const HeaderCard: React.FC<{ header: SecurityHeader }> = ({ header }) => {
  const riskColor = getRiskColor(header.riskLevel);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div
        className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {header.present ? (
              <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-gray-900">{header.name}</h3>
                <span
                  className="px-2 py-0.5 text-xs font-medium rounded-full text-white"
                  style={{ backgroundColor: riskColor }}
                >
                  {header.riskLevel}
                </span>
              </div>
              <p className="text-sm text-gray-600">{header.description}</p>
              {header.present && header.value && (
                <div className="mt-2 p-2 bg-white rounded border text-xs font-mono text-gray-700 overflow-x-auto">
                  {header.value}
                </div>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold text-gray-900">
              {header.score}/{header.maxScore}
            </div>
            <div className="text-xs text-gray-500">points</div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-4 bg-white border-t space-y-3">
          {!header.present && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <div className="font-medium text-red-900 mb-1">⚠️ Impact</div>
              <p className="text-sm text-red-800">{header.impact}</p>
            </div>
          )}

          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="font-medium text-blue-900 mb-1">
              ✅ Recommended Value
            </div>
            <code className="text-sm text-blue-800 break-all">
              {header.recommendedValue}
            </code>
          </div>

          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <div className="font-medium text-green-900 mb-1">
              💡 Implementation
            </div>
            <code className="text-sm text-green-800 break-all block font-mono">
              {header.implementationExample}
            </code>
          </div>
        </div>
      )}
    </div>
  );
};

// Recommendation Card Component
const RecommendationCard: React.FC<{ recommendation: any }> = ({
  recommendation,
}) => {
  const priorityColors = {
    Critical: "bg-red-100 border-red-300 text-red-900",
    High: "bg-orange-100 border-orange-300 text-orange-900",
    Medium: "bg-yellow-100 border-yellow-300 text-yellow-900",
    Low: "bg-lime-100 border-lime-300 text-lime-900",
  };

  return (
    <div
      className={`p-4 border-2 rounded-lg ${
        priorityColors[recommendation.priority as keyof typeof priorityColors]
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <span className="text-xs font-semibold uppercase">
            {recommendation.priority} Priority
          </span>
          <h3 className="text-lg font-bold mt-1">{recommendation.header}</h3>
        </div>
      </div>

      <p className="mb-3 font-medium">{recommendation.action}</p>

      <div className="bg-white/50 p-3 rounded border">
        <div className="text-xs font-semibold mb-1">Implementation:</div>
        <code className="text-sm font-mono break-all">
          {recommendation.implementation}
        </code>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {recommendation.resources.map((resource: string, i: number) => (
          <a
            key={i}
            href={resource}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 bg-white rounded hover:underline"
          >
            📚 Learn more
          </a>
        ))}
      </div>
    </div>
  );
};

export default SecurityHeadersChecker;
