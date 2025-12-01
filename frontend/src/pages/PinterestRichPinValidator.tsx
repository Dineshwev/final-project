import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Download,
  Loader,
  Tag,
  Code,
  Info,
} from "lucide-react";
import {
  validateRichPin,
  getRichPinTypes,
  exportAsJSON,
  getValidationColor,
  getValidationBgColor,
  getValidationBorderColor,
  getScorePercentage,
  getScoreColor,
  getTagTypeIcon,
  getRichPinTypeEmoji,
  type ValidationReport,
  type RichPinType,
} from "../services/pinterestRichPinService";

const PinterestRichPinValidator: React.FC = () => {
  const [url, setUrl] = useState("");
  const [selectedPinType, setSelectedPinType] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationReport | null>(null);
  const [error, setError] = useState("");
  const [richPinTypes, setRichPinTypes] = useState<RichPinType[]>([]);

  // Fetch available Rich Pin types on mount
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await getRichPinTypes();
        setRichPinTypes(response.types);
      } catch (err) {
        console.error("Failed to fetch Rich Pin types:", err);
      }
    };
    fetchTypes();
  }, []);

  const handleValidate = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const report = await validateRichPin(url, selectedPinType || undefined);
      setResult(report);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Validation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (result) {
      exportAsJSON(result);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Tag className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Pinterest Rich Pins Validator
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Validate your Rich Pin meta tags for Article, Product, Recipe, and
            App pins. Ensure optimal Pinterest integration with schema.org
            structured data.
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="space-y-6">
            {/* URL Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL to Validate
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all outline-none"
                onKeyPress={(e) => e.key === "Enter" && handleValidate()}
              />
            </div>

            {/* Pin Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rich Pin Type (Optional - Auto-detect)
              </label>
              <select
                value={selectedPinType}
                onChange={(e) => setSelectedPinType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all outline-none"
              >
                <option value="">Auto-detect</option>
                {richPinTypes.map((type) => (
                  <option key={type.type} value={type.type}>
                    {getRichPinTypeEmoji(type.type)} {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Validate Button */}
            <button
              onClick={handleValidate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Validate Rich Pin
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
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-2">
                  Validation Error
                </h3>
                <p className="text-red-700 mb-3">{error}</p>
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <h4 className="font-semibold text-red-900 text-sm mb-2">
                    💡 Troubleshooting Tips:
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Ensure the URL is correct and publicly accessible</li>
                    <li>
                      • Try a different website if the current one blocks
                      automated requests
                    </li>
                    <li>
                      • Check if the page exists by opening it in your browser
                    </li>
                    <li>
                      • Some websites (like Amazon, social media) may block
                      validation tools
                    </li>
                    <li>
                      • Test with simple blog posts or article pages for best
                      results
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Validation Status Banner */}
            {result.success && result.isValid !== undefined && (
              <div
                className={`${getValidationBgColor(
                  result.isValid
                )} border-2 ${getValidationBorderColor(
                  result.isValid
                )} rounded-2xl p-6`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {result.isValid ? (
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    ) : (
                      <XCircle className="w-12 h-12 text-red-600" />
                    )}
                    <div>
                      <h2
                        className={`text-2xl font-bold ${getValidationColor(
                          result.isValid
                        )}`}
                      >
                        {result.isValid ? "Valid Rich Pin" : "Invalid Rich Pin"}
                      </h2>
                      <p className="text-gray-700 mt-1">
                        {getRichPinTypeEmoji(result.pinTypeKey || "")}{" "}
                        {result.pinType}
                      </p>
                    </div>
                  </div>

                  {result.summary && (
                    <div className="text-right">
                      <div
                        className={`text-5xl font-bold ${getScoreColor(
                          getScorePercentage(result.summary)
                        )}`}
                      >
                        {getScorePercentage(result.summary)}%
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Overall Score
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Summary Stats */}
            {result.summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-md border-2 border-green-100">
                  <div className="text-3xl font-bold text-green-600">
                    {result.summary.requiredTagsFound}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Required Tags
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    of {result.summary.requiredTagsTotal}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border-2 border-blue-100">
                  <div className="text-3xl font-bold text-blue-600">
                    {result.summary.recommendedTagsFound}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Recommended Tags
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    of {result.summary.recommendedTagsTotal}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border-2 border-red-100">
                  <div className="text-3xl font-bold text-red-600">
                    {result.errors?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Errors</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border-2 border-yellow-100">
                  <div className="text-3xl font-bold text-yellow-600">
                    {result.warnings?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Warnings</div>
                </div>
              </div>
            )}

            {/* Errors */}
            {result.errors && result.errors.length > 0 && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <h3 className="text-xl font-bold text-red-900">
                    Errors ({result.errors.length})
                  </h3>
                </div>
                <ul className="space-y-2">
                  {result.errors.map((err, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-red-700"
                    >
                      <span className="text-red-600 font-bold">•</span>
                      <span>{err}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {result.warnings && result.warnings.length > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  <h3 className="text-xl font-bold text-yellow-900">
                    Warnings ({result.warnings.length})
                  </h3>
                </div>
                <ul className="space-y-2">
                  {result.warnings.map((warn, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-yellow-700"
                    >
                      <span className="text-yellow-600 font-bold">•</span>
                      <span>{warn}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Found Tags */}
            {result.foundTags && result.foundTags.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-bold text-gray-900">
                    Found Tags ({result.foundTags.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {result.foundTags.map((tag, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <span className="text-2xl">
                        {getTagTypeIcon(tag.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-sm font-semibold text-purple-600">
                            {tag.tag}
                          </code>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              tag.type === "required"
                                ? "bg-red-100 text-red-700"
                                : tag.type === "recommended"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {tag.type}
                          </span>
                          {tag.source && (
                            <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                              {tag.source}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 break-all">
                          {tag.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Tags */}
            {result.missingTags && result.missingTags.length > 0 && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <h3 className="text-xl font-bold text-red-900">
                    Missing Required Tags ({result.missingTags.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {result.missingTags.map((tag, idx) => (
                    <code
                      key={idx}
                      className="px-3 py-2 bg-white rounded border border-red-300 text-red-700 text-sm"
                    >
                      {tag}
                    </code>
                  ))}
                </div>
              </div>
            )}

            {/* Schema Info */}
            {result.schemaInfo && (
              <div
                className={`rounded-xl p-6 ${
                  result.schemaInfo.hasSchema
                    ? "bg-green-50 border-2 border-green-200"
                    : "bg-yellow-50 border-2 border-yellow-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Code
                    className={`w-6 h-6 ${
                      result.schemaInfo.hasSchema
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  />
                  <h3
                    className={`text-xl font-bold ${
                      result.schemaInfo.hasSchema
                        ? "text-green-900"
                        : "text-yellow-900"
                    }`}
                  >
                    Schema.org Structured Data
                  </h3>
                </div>
                <p
                  className={
                    result.schemaInfo.hasSchema
                      ? "text-green-700"
                      : "text-yellow-700"
                  }
                >
                  {result.schemaInfo.hasSchema ? (
                    <>✓ Found {result.schemaInfo.schemaType} structured data</>
                  ) : (
                    <>⚠ No structured data found - recommended for Pinterest</>
                  )}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                <Download className="w-5 h-5" />
                Export Report
              </button>
              <a
                href={result.validationURL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                Test in Pinterest Validator
              </a>
            </div>

            {/* Info about Pinterest Validator */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Next Steps
                  </h4>
                  <p className="text-blue-700 text-sm">
                    After fixing any issues, use Pinterest's official Rich Pins
                    Validator to verify your implementation and apply for Rich
                    Pins. The validation process can take up to 24 hours.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Rich Pin Types Guide */}
        {!result && richPinTypes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {richPinTypes.map((type) => (
              <div
                key={type.type}
                className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-100 hover:border-red-200 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">
                    {getRichPinTypeEmoji(type.type)}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900">
                    {type.name}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">{type.description}</p>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-semibold text-red-600">
                      Required:
                    </span>{" "}
                    {type.requiredTags.length} tags
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-blue-600">
                      Recommended:
                    </span>{" "}
                    {type.recommendedTags.length} tags
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PinterestRichPinValidator;
