import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lightbulb,
  CreditCard,
  Image as ImageIcon,
  Download,
  Twitter,
  ExternalLink,
  Wrench,
} from "lucide-react";
import {
  validateTwitterCard,
  exportAsJSON,
  saveToHistory,
  ValidationReport,
} from "../services/twitterCardService";

const TwitterCardValidator: React.FC = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ValidationReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const report = await validateTwitterCard(url);
      setResults(report);
      saveToHistory(report);
    } catch (err: any) {
      setError(err.message || "Validation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (results) {
      exportAsJSON(results);
    }
  };

  const getCardTypeColor = (cardType: string) => {
    const colors: { [key: string]: string } = {
      summary: "bg-blue-100 text-blue-700",
      summary_large_image: "bg-purple-100 text-purple-700",
      app: "bg-green-100 text-green-700",
      player: "bg-orange-100 text-orange-700",
    };
    return colors[cardType] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-4 rounded-2xl shadow-lg">
              <Twitter className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Twitter Card Validator
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Validate Twitter Card meta tags and ensure your content displays
            perfectly when shared on Twitter
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleValidate()}
              placeholder="Enter URL to validate (e.g., https://example.com)"
              className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 text-lg transition-all"
              disabled={loading}
            />
            <button
              onClick={handleValidate}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Search className="w-5 h-5" />
              {loading ? "Validating..." : "Validate"}
            </button>
          </div>

          {/* Card Type Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Supported Card Types
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div className="bg-white p-3 rounded-lg">
                <span className="font-semibold text-blue-600">Summary</span>
                <p className="text-gray-600">Small square image</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <span className="font-semibold text-purple-600">
                  Summary Large
                </span>
                <p className="text-gray-600">Large 2:1 image</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <span className="font-semibold text-green-600">App</span>
                <p className="text-gray-600">Mobile app card</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <span className="font-semibold text-orange-600">Player</span>
                <p className="text-gray-600">Video/audio player</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8 flex items-start gap-4"
          >
            <XCircle className="text-red-500 text-xl flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-red-800 mb-1">
                Validation Error
              </h3>
              <p className="text-red-600">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Status Banner */}
            <div
              className={`rounded-2xl shadow-xl p-8 ${
                results.isValid
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : "bg-gradient-to-r from-red-500 to-rose-500"
              }`}
            >
              <div className="flex items-center gap-6">
                {results.isValid ? (
                  <CheckCircle className="text-white text-4xl flex-shrink-0" />
                ) : (
                  <XCircle className="text-white text-4xl flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {results.isValid
                      ? "Twitter Card Valid! ✨"
                      : "Twitter Card Has Issues"}
                  </h2>
                  <p className="text-white/90 text-lg">{results.url}</p>
                </div>
                <div className="text-right">
                  <div
                    className={`inline-block px-6 py-3 rounded-xl font-bold text-lg ${getCardTypeColor(
                      results.cardType
                    )}`}
                  >
                    {results.cardType.replace("_", " ").toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-3xl font-bold text-blue-600">
                  {results.summary.totalTags}
                </div>
                <div className="text-gray-600 font-medium">Twitter Tags</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-3xl font-bold text-purple-600">
                  {results.cardType}
                </div>
                <div className="text-gray-600 font-medium">Card Type</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-3xl font-bold text-red-600">
                  {results.summary.errorsCount}
                </div>
                <div className="text-gray-600 font-medium">Errors</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-3xl font-bold text-yellow-600">
                  {results.summary.warningsCount}
                </div>
                <div className="text-gray-600 font-medium">Warnings</div>
              </div>
            </div>

            {/* Twitter Tags */}
            {Object.keys(results.twitterTags).length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                  <CreditCard className="text-blue-600 w-6 h-6" />
                  Twitter Card Tags
                </h3>
                <div className="space-y-3">
                  {Object.entries(results.twitterTags).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-mono text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-lg whitespace-nowrap">
                        twitter:{key}
                      </span>
                      <span className="text-gray-700 break-all flex-1">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback Tags */}
            {Object.keys(results.fallbacks).length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                  <AlertTriangle className="text-yellow-600 w-6 h-6" />
                  Fallback Tags (from Open Graph)
                </h3>
                <div className="space-y-3">
                  {Object.entries(results.fallbacks).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-start gap-4 p-4 bg-yellow-50 rounded-xl"
                    >
                      <span className="font-mono text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg whitespace-nowrap">
                        og:{key}
                      </span>
                      <span className="text-gray-700 break-all flex-1">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image Validation */}
            {results.imageValidation && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                  <ImageIcon className="text-purple-600 w-6 h-6" />
                  Image Validation
                </h3>
                {results.imageValidation.error ? (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <XCircle className="text-red-500 text-xl flex-shrink-0 mt-1" />
                    <div className="text-red-600">
                      {results.imageValidation.error}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div
                      className={`p-4 rounded-xl ${
                        results.imageValidation.valid
                          ? "bg-green-50 border-2 border-green-200"
                          : "bg-red-50 border-2 border-red-200"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {results.imageValidation.valid ? (
                          <CheckCircle className="text-green-500 text-xl" />
                        ) : (
                          <XCircle className="text-red-500 text-xl" />
                        )}
                        <span
                          className={`font-semibold ${
                            results.imageValidation.valid
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {results.imageValidation.message}
                        </span>
                      </div>
                      {results.imageValidation.width && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Dimensions:</span>
                            <div className="font-semibold text-gray-900">
                              {results.imageValidation.width}x
                              {results.imageValidation.height}px
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Format:</span>
                            <div className="font-semibold text-gray-900 uppercase">
                              {results.imageValidation.format}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">File Size:</span>
                            <div className="font-semibold text-gray-900">
                              {results.imageValidation.fileSizeMB} MB
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Aspect Ratio:</span>
                            <div className="font-semibold text-gray-900">
                              {results.imageValidation.width &&
                              results.imageValidation.height
                                ? (
                                    results.imageValidation.width /
                                    results.imageValidation.height
                                  ).toFixed(2)
                                : "N/A"}
                              :1
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {results.imageValidation.errors &&
                      results.imageValidation.errors.length > 0 && (
                        <div className="space-y-2">
                          {results.imageValidation.errors.map((err, idx) => (
                            <div
                              key={idx}
                              className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-start gap-3"
                            >
                              <XCircle className="text-red-500 flex-shrink-0 mt-0.5" />
                              <span className="text-red-700">{err}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    {results.imageValidation.warnings &&
                      results.imageValidation.warnings.length > 0 && (
                        <div className="space-y-2">
                          {results.imageValidation.warnings.map((warn, idx) => (
                            <div
                              key={idx}
                              className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3 flex items-start gap-3"
                            >
                              <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" />
                              <span className="text-yellow-700">{warn}</span>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}

            {/* Errors */}
            {results.errors.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                  <XCircle className="text-red-600 w-6 h-6" />
                  Errors ({results.errors.length})
                </h3>
                <div className="space-y-3">
                  {results.errors.map((error, idx) => (
                    <div
                      key={idx}
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
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                  <AlertTriangle className="text-yellow-600 w-6 h-6" />
                  Warnings ({results.warnings.length})
                </h3>
                <div className="space-y-3">
                  {results.warnings.map((warning, idx) => (
                    <div
                      key={idx}
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
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                  <Lightbulb className="text-green-600 w-6 h-6" />
                  Recommendations ({results.recommendations.length})
                </h3>
                <div className="space-y-3">
                  {results.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
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
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                <Wrench className="text-gray-600 w-6 h-6" />
                Twitter Card Preview
              </h3>
              <a
                href={results.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-6 bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl hover:from-blue-100 hover:to-sky-100 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <Twitter className="text-blue-500 w-8 h-8" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-lg mb-1">
                      Twitter Card Validator
                    </div>
                    <div className="text-gray-600 text-sm">
                      Preview how your card appears on Twitter and validate all
                      tags
                    </div>
                  </div>
                  <ExternalLink className="text-blue-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setUrl("");
                  setResults(null);
                  setError(null);
                }}
                className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Validate Again
              </button>
              <button
                onClick={handleExport}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
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

export default TwitterCardValidator;
