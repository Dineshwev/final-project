import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Download,
  ExternalLink,
  Search,
  FileText,
  Info,
  TrendingUp,
  Link as LinkIcon,
  BarChart3,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import {
  analyzeToxicBacklinks,
  getGSCAuthUrl,
  generateDisavowFile,
  downloadDisavowFile,
  exportReportAsJSON,
  getToxicityColor,
  getToxicityBgColor,
  getCategoryColor,
  getRecommendationColor,
  formatNumber,
  truncateUrl,
  type AnalysisReport,
  type ToxicBacklink,
} from "../services/toxicBacklinkService";

const ToxicBacklinkDetector: React.FC = () => {
  const [siteUrl, setSiteUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "safe" | "suspicious" | "toxic"
  >("all");
  const [expandedBacklink, setExpandedBacklink] = useState<string | null>(null);
  const [maxBacklinks, setMaxBacklinks] = useState(100);

  // Check for OAuth token in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      setAccessToken(token);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleConnectGSC = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getGSCAuthUrl();
      if (response.success && response.authUrl) {
        window.location.href = response.authUrl;
      } else {
        setError(response.error || "Failed to get authentication URL");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!siteUrl.trim()) {
      setError("Please enter a site URL");
      return;
    }

    if (!accessToken) {
      setError("Please connect to Google Search Console first");
      return;
    }

    try {
      setAnalyzing(true);
      setError("");
      setReport(null);

      const analysisReport = await analyzeToxicBacklinks(
        siteUrl,
        accessToken,
        maxBacklinks
      );

      if (analysisReport.success) {
        setReport(analysisReport);
      } else {
        setError(analysisReport.message || "Analysis failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to analyze backlinks");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateDisavow = async () => {
    if (!report) return;

    const toxicLinks = report.results.filter(
      (link) => link.recommendation === "Disavow"
    );

    if (toxicLinks.length === 0) {
      setError("No toxic links found to disavow");
      return;
    }

    try {
      const response = await generateDisavowFile(toxicLinks);
      if (response.success) {
        const domain = new URL(siteUrl).hostname.replace(/\./g, "-");
        const filename = `disavow-${domain}-${
          new Date().toISOString().split("T")[0]
        }.txt`;
        downloadDisavowFile(response.content, filename);
      } else {
        setError(response.error || "Failed to generate disavow file");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleExportJSON = () => {
    if (!report) return;
    const domain = new URL(siteUrl).hostname.replace(/\./g, "-");
    const filename = `backlink-analysis-${domain}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    exportReportAsJSON(report, filename);
  };

  const toggleBacklink = (url: string) => {
    setExpandedBacklink(expandedBacklink === url ? null : url);
  };

  const filteredResults =
    report?.results.filter((link) => {
      if (activeFilter === "all") return true;
      return link.category === activeFilter;
    }) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="w-10 h-10 text-red-600" />
            <h1 className="text-4xl font-bold text-gray-800">
              Toxic Backlink Detector
            </h1>
          </div>
          <p className="text-gray-600 ml-13">
            Identify spam, low-quality, and toxic backlinks that could harm your
            SEO
          </p>
        </motion.div>

        {/* Google Search Console Connection */}
        {!accessToken && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-6"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <ShieldCheck className="w-12 h-12 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Connect to Google Search Console
                </h2>
                <p className="text-gray-600 mb-4">
                  To analyze your backlinks, you need to connect your Google
                  Search Console account. This allows us to fetch backlink data
                  from GSC API.
                </p>
                <button
                  onClick={handleConnectGSC}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-5 h-5" />
                      Connect GSC Account
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Analysis Input */}
        {accessToken && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-green-600 font-semibold">
                Connected to GSC
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Site URL (verified in GSC)
                </label>
                <input
                  type="url"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Backlinks to Analyze
                </label>
                <select
                  value={maxBacklinks}
                  onChange={(e) => setMaxBacklinks(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={50}>50 backlinks</option>
                  <option value={100}>100 backlinks</option>
                  <option value={250}>250 backlinks</option>
                  <option value={500}>500 backlinks</option>
                  <option value={1000}>1000 backlinks</option>
                </select>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={analyzing || !siteUrl}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {analyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Analyzing Backlinks... (This may take a few minutes)
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Analyze Toxic Backlinks
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6 flex items-start gap-3"
          >
            <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {report && (
          <>
            {/* Summary Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6"
            >
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Backlinks</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {report.summary.total}
                    </p>
                  </div>
                  <LinkIcon className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-green-50 rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-semibold">Safe</p>
                    <p className="text-2xl font-bold text-green-700">
                      {report.summary.safe}
                    </p>
                  </div>
                  <ShieldCheck className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600 font-semibold">
                      Suspicious
                    </p>
                    <p className="text-2xl font-bold text-yellow-700">
                      {report.summary.suspicious}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                </div>
              </div>

              <div className="bg-red-50 rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-semibold">Toxic</p>
                    <p className="text-2xl font-bold text-red-700">
                      {report.summary.toxic}
                    </p>
                  </div>
                  <ShieldAlert className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-semibold">
                      Avg Score
                    </p>
                    <p className="text-2xl font-bold text-purple-700">
                      {report.summary.averageScore.toFixed(1)}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-3 mb-6"
            >
              <button
                onClick={handleGenerateDisavow}
                disabled={report.summary.toDisavow === 0}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="w-5 h-5" />
                Download Disavow File ({report.summary.toDisavow})
              </button>

              <button
                onClick={handleExportJSON}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
              >
                <FileText className="w-5 h-5" />
                Export Full Report (JSON)
              </button>
            </motion.div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                {
                  key: "all",
                  label: "All Backlinks",
                  count: report.summary.total,
                },
                { key: "safe", label: "Safe", count: report.summary.safe },
                {
                  key: "suspicious",
                  label: "Suspicious",
                  count: report.summary.suspicious,
                },
                { key: "toxic", label: "Toxic", count: report.summary.toxic },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key as any)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    activeFilter === filter.key
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            {/* Info Box */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3"
            >
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Toxicity Scoring Guide:</p>
                <ul className="space-y-1">
                  <li>
                    <strong>Safe (0-39):</strong> Low risk backlinks from
                    authoritative sources. Keep these.
                  </li>
                  <li>
                    <strong>Suspicious (40-69):</strong> Medium risk backlinks.
                    Manually review before deciding.
                  </li>
                  <li>
                    <strong>Toxic (70-100):</strong> High risk spam/toxic
                    backlinks. Disavow recommended.
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Backlinks List */}
            <div className="space-y-4">
              <AnimatePresence>
                {filteredResults.map((backlink, index) => (
                  <motion.div
                    key={backlink.url}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-lg shadow-lg overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold border ${getCategoryColor(
                                backlink.category
                              )}`}
                            >
                              {backlink.category.toUpperCase()}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${getRecommendationColor(
                                backlink.recommendation
                              )}`}
                            >
                              {backlink.recommendation}
                            </span>
                          </div>
                          <a
                            href={backlink.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2 mb-1"
                          >
                            {truncateUrl(backlink.url, 80)}
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <p className="text-sm text-gray-600">
                            <strong>Domain:</strong> {backlink.domain}
                          </p>
                          {backlink.anchorText && (
                            <p className="text-sm text-gray-600">
                              <strong>Anchor:</strong> {backlink.anchorText}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-3xl font-bold ${getToxicityColor(
                              backlink.toxicityScore
                            )}`}
                          >
                            {backlink.toxicityScore}
                          </div>
                          <div className="text-sm text-gray-600">Toxicity</div>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gray-50 rounded p-3">
                          <p className="text-xs text-gray-600">Clicks</p>
                          <p className="text-lg font-bold text-gray-800">
                            {formatNumber(backlink.metrics.clicks)}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded p-3">
                          <p className="text-xs text-gray-600">Impressions</p>
                          <p className="text-lg font-bold text-gray-800">
                            {formatNumber(backlink.metrics.impressions)}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded p-3">
                          <p className="text-xs text-gray-600">CTR</p>
                          <p className="text-lg font-bold text-gray-800">
                            {(backlink.metrics.ctr * 100).toFixed(2)}%
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded p-3">
                          <p className="text-xs text-gray-600">Position</p>
                          <p className="text-lg font-bold text-gray-800">
                            {backlink.metrics.position.toFixed(1)}
                          </p>
                        </div>
                      </div>

                      {/* Reasons */}
                      {backlink.reasons.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            Issues Detected:
                          </p>
                          <ul className="space-y-1">
                            {backlink.reasons.map((reason, idx) => (
                              <li
                                key={idx}
                                className="text-sm text-gray-600 flex items-start gap-2"
                              >
                                <span className="text-red-500">•</span>
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Expand Details Button */}
                      <button
                        onClick={() => toggleBacklink(backlink.url)}
                        className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        {expandedBacklink === backlink.url
                          ? "Hide"
                          : "Show"}{" "}
                        Technical Details
                      </button>

                      {/* Expanded Details */}
                      {expandedBacklink === backlink.url && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 pt-4 border-t border-gray-200"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Domain Authority */}
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="font-semibold text-gray-800 mb-2">
                                Domain Authority
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Score:</span>
                                  <span className="font-semibold">
                                    {backlink.details.domainAuthority.score}/100
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Indexed:</span>
                                  <span>
                                    {backlink.details.domainAuthority.indexed
                                      ? "✅"
                                      : "❌"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>HTTPS:</span>
                                  <span>
                                    {backlink.details.domainAuthority.https
                                      ? "✅"
                                      : "❌"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>DNS:</span>
                                  <span>
                                    {backlink.details.domainAuthority.dns
                                      ? "✅"
                                      : "❌"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Spam Signals */}
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="font-semibold text-gray-800 mb-2">
                                Spam Signals
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Score:</span>
                                  <span className="font-semibold text-red-600">
                                    {backlink.details.spamSignals.score}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Spam Keywords:</span>
                                  <span>
                                    {
                                      backlink.details.spamSignals.spamKeywords
                                        .length
                                    }
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Suspicious Anchor:</span>
                                  <span>
                                    {backlink.details.spamSignals
                                      .suspiciousAnchor
                                      ? "⚠️"
                                      : "✅"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Too Many Links:</span>
                                  <span>
                                    {backlink.details.spamSignals.tooManyLinks
                                      ? "⚠️"
                                      : "✅"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Blacklists */}
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="font-semibold text-gray-800 mb-2">
                                Blacklist Status
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Score:</span>
                                  <span className="font-semibold text-red-600">
                                    {backlink.details.blacklists.score}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Safe Browsing:</span>
                                  <span>
                                    {backlink.details.blacklists.safeBrowsing
                                      ? "🚫 FLAGGED"
                                      : "✅ Clean"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Public Lists:</span>
                                  <span>
                                    {backlink.details.blacklists
                                      .publicBlacklists
                                      ? "⚠️ Found"
                                      : "✅ Clean"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredResults.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No backlinks found in this category.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ToxicBacklinkDetector;
