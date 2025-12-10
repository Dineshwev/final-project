// src/pages/OGValidator.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  validateOpenGraph,
  exportAsJSON,
  saveToHistory,
  ValidationReport,
} from "../services/ogValidatorService";
import {
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Tags,
  Image,
  Wrench,
  Download,
  Facebook,
  Linkedin,
  Twitter,
} from "lucide-react";

const OGValidator: React.FC = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ValidationReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const quickExamples = [
    { name: "GitHub", url: "https://github.com" },
    { name: "IMDb", url: "https://www.imdb.com" },
    { name: "LinkedIn", url: "https://www.linkedin.com" },
    { name: "Netflix", url: "https://www.netflix.com" },
  ];

  const handleValidate = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      setError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const data = await validateOpenGraph(url);
      setResults(data);
      saveToHistory(data);
    } catch (err: any) {
      setError(err.message || "Validation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (results) {
      exportAsJSON(results);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleValidate();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <span className="text-5xl">🔍</span>
            Open Graph Meta Tags Validator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Optimize your website for social media sharing with comprehensive OG
            tag validation and analysis
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter URL to validate (e.g., https://github.com)"
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              onClick={handleValidate}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              {loading ? "Validating..." : "Validate"}
            </button>
          </div>

          {/* Quick Examples */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600 font-semibold">
              Try examples:
            </span>
            {quickExamples.map((example) => (
              <button
                key={example.name}
                onClick={() => setUrl(example.url)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {example.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3"
          >
            <XCircle className="text-red-500 text-xl flex-shrink-0 mt-1" />
            <div>
              <strong className="text-red-700">Validation Error</strong>
              <p className="text-red-600">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <div className="inline-block w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">
              Analyzing Open Graph meta tags...
            </p>
          </motion.div>
        )}

        {/* Results */}
        {results && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Status Banner */}
            <div
              className={`rounded-2xl p-6 flex items-center gap-4 ${
                results.isValid
                  ? "bg-green-50 border-2 border-green-200"
                  : "bg-red-50 border-2 border-red-200"
              }`}
            >
              {results.isValid ? (
                <CheckCircle className="text-green-500 text-4xl flex-shrink-0" />
              ) : (
                <XCircle className="text-red-500 text-4xl flex-shrink-0" />
              )}
              <div>
                <h2
                  className={`text-2xl font-bold ${
                    results.isValid ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {results.isValid
                    ? "Valid Open Graph Tags"
                    : "Invalid Open Graph Tags"}
                </h2>
                <p
                  className={
                    results.isValid ? "text-green-600" : "text-red-600"
                  }
                >
                  {results.isValid
                    ? "All required tags are present and optimized"
                    : "Some required tags are missing or need attention"}
                </p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                <div className="text-sm text-blue-600 font-semibold mb-1 uppercase tracking-wide">
                  Total Tags
                </div>
                <div className="text-4xl font-bold text-blue-900">
                  {results.summary.totalTags}
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
                <div className="text-sm text-purple-600 font-semibold mb-1 uppercase tracking-wide">
                  Required Tags
                </div>
                <div className="text-4xl font-bold text-purple-900">
                  {results.summary.requiredTagsPresent}/
                  {results.summary.requiredTagsTotal}
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border-2 border-red-200">
                <div className="text-sm text-red-600 font-semibold mb-1 uppercase tracking-wide">
                  Errors
                </div>
                <div
                  className={`text-4xl font-bold ${
                    results.summary.errorsCount > 0
                      ? "text-red-900"
                      : "text-green-600"
                  }`}
                >
                  {results.summary.errorsCount}
                </div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-2 border-yellow-200">
                <div className="text-sm text-yellow-600 font-semibold mb-1 uppercase tracking-wide">
                  Warnings
                </div>
                <div
                  className={`text-4xl font-bold ${
                    results.summary.warningsCount > 0
                      ? "text-yellow-900"
                      : "text-green-600"
                  }`}
                >
                  {results.summary.warningsCount}
                </div>
              </div>
            </div>

            {/* Tags Section */}
            {Object.keys(results.tags).length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Tags className="text-blue-600 w-6 h-6" />
                    Open Graph Tags
                  </h3>
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold">
                    {Object.keys(results.tags).length} tags
                  </span>
                </div>
                <div className="space-y-3">
                  {Object.entries(results.tags).map(([key, value]) => {
                    const charCount = value.length;
                    let charStatus = "";
                    if (key === "title") {
                      charStatus =
                        charCount >= 60 && charCount <= 90 ? "✅" : "⚠️";
                    } else if (key === "description") {
                      charStatus =
                        charCount >= 150 && charCount <= 300 ? "✅" : "⚠️";
                    }

                    return (
                      <div
                        key={key}
                        className="bg-gray-50 rounded-xl p-4 border-l-4 border-blue-500 hover:bg-gray-100 transition-colors"
                      >
                        <div className="font-bold text-blue-600 text-sm uppercase tracking-wide mb-1">
                          og:{key}
                        </div>
                        <div className="text-gray-700 break-words">{value}</div>
                        <div className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                          <span>📏 {charCount} characters</span>
                          {charStatus && <span>{charStatus}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Image Validation */}
            {results.tags.image && results.imageValidation && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Image className="text-purple-600 w-6 h-6" />
                    Image Validation
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      results.imageValidation.valid
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {results.imageValidation.valid ? "Valid" : "Invalid"}
                  </span>
                </div>
                {results.imageValidation.valid ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 font-semibold">
                          Dimensions
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {results.imageValidation.width}×
                          {results.imageValidation.height}px
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 font-semibold">
                          Aspect Ratio
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {results.imageValidation.aspectRatio}:1
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 font-semibold">
                          Recommended Size
                        </div>
                        <div className="text-lg font-bold">
                          {results.imageValidation.isRecommendedSize
                            ? "✅ Yes"
                            : "⚠️ No"}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 font-semibold">
                          Status
                        </div>
                        <div className="text-sm text-gray-700">
                          {results.imageValidation.message}
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <img
                        src={results.tags.image}
                        alt="OG Preview"
                        className="max-w-full max-h-96 rounded-lg shadow-md mx-auto"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <XCircle className="text-red-500 text-xl flex-shrink-0 mt-1" />
                    <div className="text-red-600">
                      {results.imageValidation.error}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Errors */}
            {results.errors.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <XCircle className="text-red-600 w-6 h-6" />
                    Errors
                  </h3>
                  <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-semibold">
                    {results.errors.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {results.errors.map((error, index) => (
                    <div
                      key={index}
                      className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3"
                    >
                      <XCircle className="text-red-500 text-xl flex-shrink-0 mt-1" />
                      <div className="text-red-700">{error}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {results.warnings.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <AlertTriangle className="text-yellow-600 w-6 h-6" />
                    Warnings
                  </h3>
                  <span className="px-3 py-1 bg-yellow-600 text-white rounded-full text-sm font-semibold">
                    {results.warnings.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {results.warnings.map((warning, index) => (
                    <div
                      key={index}
                      className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 flex items-start gap-3"
                    >
                      <AlertTriangle className="text-yellow-500 text-xl flex-shrink-0 mt-1" />
                      <div className="text-yellow-700">{warning}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {results.recommendations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Lightbulb className="text-green-600 w-6 h-6" />
                    Recommendations
                  </h3>
                  <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold">
                    {results.recommendations.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {results.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-start gap-3"
                    >
                      <Lightbulb className="text-green-500 text-xl flex-shrink-0 mt-1" />
                      <div className="text-green-700">{rec}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Debug Tools */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Wrench className="text-gray-600 w-6 h-6" />
                  External Debug Tools
                </h3>
              </div>
              <div className="space-y-3">
                <a
                  href={results.debugTools.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <Facebook className="text-blue-600 w-8 h-8" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        Facebook Sharing Debugger
                      </div>
                      <div className="text-sm text-gray-600">
                        Test how your page appears on Facebook
                      </div>
                    </div>
                  </div>
                  <span className="text-blue-600 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </a>
                <a
                  href={results.debugTools.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-xl hover:from-blue-100 hover:to-indigo-200 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <Linkedin className="text-blue-700 w-8 h-8" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        LinkedIn Post Inspector
                      </div>
                      <div className="text-sm text-gray-600">
                        Preview your content on LinkedIn
                      </div>
                    </div>
                  </div>
                  <span className="text-blue-700 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </a>
                <a
                  href={results.debugTools.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-sky-50 to-blue-100 border-2 border-sky-200 rounded-xl hover:from-sky-100 hover:to-blue-200 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <Twitter className="text-sky-500 w-8 h-8" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        Twitter Card Validator
                      </div>
                      <div className="text-sm text-gray-600">
                        Validate Twitter card markup
                      </div>
                    </div>
                  </div>
                  <span className="text-sky-500 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </a>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center p-6 bg-white rounded-2xl shadow-lg">
              <button
                onClick={handleValidate}
                className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Validate Again
              </button>
              <button
                onClick={handleExport}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Export Report
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OGValidator;
