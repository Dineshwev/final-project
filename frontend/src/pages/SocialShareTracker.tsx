import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Share2,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  RefreshCw,
  ExternalLink,
  Facebook,
  Linkedin,
  Twitter,
} from "lucide-react";
import {
  getShareCounts,
  shareOnPlatform,
  exportAsJSON,
  saveToHistory,
  getTrendStyle,
  ShareCountReport,
} from "../services/shareCountService";

const SocialShareTracker: React.FC = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ShareCountReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const report = await getShareCounts(url);
      setResults(report);
      saveToHistory(report);
    } catch (err: any) {
      setError(err.message || "Failed to fetch share counts");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (results) {
      exportAsJSON(results);
    }
  };

  const handleShare = (platform: string) => {
    if (results) {
      shareOnPlatform(platform, results.url, `Check out ${results.url}`);
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return <Facebook className="w-6 h-6" />;
      case "linkedin":
        return <Linkedin className="w-6 h-6" />;
      case "twitter":
        return <Twitter className="w-6 h-6" />;
      default:
        return <Share2 className="w-6 h-6" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    const colors: { [key: string]: string } = {
      facebook: "from-blue-600 to-blue-400",
      pinterest: "from-red-600 to-red-400",
      linkedin: "from-blue-700 to-blue-500",
    };
    return colors[platform] || "from-gray-600 to-gray-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-2xl shadow-lg">
              <Share2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Social Share Tracker
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Track social media share counts across Facebook, Pinterest, and
            LinkedIn with trend analysis
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
              onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
              placeholder="Enter URL to track (e.g., https://example.com/article)"
              className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 text-lg transition-all"
              disabled={loading}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8"
          >
            <h3 className="font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-red-600">{error}</p>
          </motion.div>
        )}

        {/* Results */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Cache Notice */}
            {results.cached && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-blue-600" />
                <div className="text-blue-700">
                  <span className="font-semibold">Cached Data:</span> Results
                  are from cache (last updated:{" "}
                  {new Date(results.lastUpdated).toLocaleString()})
                </div>
              </div>
            )}

            {/* Total Shares Banner */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/80 text-lg mb-2">
                    Total Social Shares
                  </div>
                  <div className="text-6xl font-bold">
                    {results.displayValues.totalShares}
                  </div>
                  <div className="text-white/90 mt-2">
                    {results.counts.totalShares.toLocaleString()} total
                    engagements
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getTrendIcon(results.trends.totalShares.direction)}
                  <div className="text-right">
                    <div className="text-3xl font-bold">
                      {results.trends.totalShares.percentage}%
                    </div>
                    <div className="text-white/80 text-sm">vs. last check</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Facebook */}
              <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-r ${getPlatformColor(
                      "facebook"
                    )}`}
                  >
                    {getPlatformIcon("facebook")}
                    <span className="text-white ml-2">Facebook</span>
                  </div>
                  {getTrendIcon(results.trends.facebook.direction)}
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {results.displayValues.facebook}
                </div>
                <div className="text-gray-600 mb-3">
                  {results.counts.facebook.toLocaleString()} total engagements
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div
                    className={
                      getTrendStyle(results.trends.facebook.direction).color
                    }
                  >
                    <span className="font-semibold">
                      {results.trends.facebook.change > 0 ? "+" : ""}
                      {results.trends.facebook.change}
                    </span>{" "}
                    ({results.trends.facebook.percentage}%)
                  </div>
                  <button
                    onClick={() => handleShare("facebook")}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                  >
                    <Share2 className="w-3 h-3" />
                    Share
                  </button>
                </div>
              </div>

              {/* Pinterest */}
              <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-r ${getPlatformColor(
                      "pinterest"
                    )}`}
                  >
                    <span className="text-white text-xl font-bold">P</span>
                    <span className="text-white ml-2">Pinterest</span>
                  </div>
                  {getTrendIcon(results.trends.pinterest.direction)}
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {results.displayValues.pinterest}
                </div>
                <div className="text-gray-600 mb-3">
                  {results.counts.pinterest.toLocaleString()} pins
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div
                    className={
                      getTrendStyle(results.trends.pinterest.direction).color
                    }
                  >
                    <span className="font-semibold">
                      {results.trends.pinterest.change > 0 ? "+" : ""}
                      {results.trends.pinterest.change}
                    </span>{" "}
                    ({results.trends.pinterest.percentage}%)
                  </div>
                  <button
                    onClick={() => handleShare("pinterest")}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1"
                  >
                    <Share2 className="w-3 h-3" />
                    Pin
                  </button>
                </div>
              </div>

              {/* LinkedIn */}
              <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-r ${getPlatformColor(
                      "linkedin"
                    )}`}
                  >
                    {getPlatformIcon("linkedin")}
                    <span className="text-white ml-2">LinkedIn</span>
                  </div>
                  {getTrendIcon(results.trends.linkedin.direction)}
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {results.displayValues.linkedin}
                </div>
                <div className="text-gray-600 mb-3">
                  {results.counts.linkedin.toLocaleString()} shares
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div
                    className={
                      getTrendStyle(results.trends.linkedin.direction).color
                    }
                  >
                    <span className="font-semibold">
                      {results.trends.linkedin.change > 0 ? "+" : ""}
                      {results.trends.linkedin.change}
                    </span>{" "}
                    ({results.trends.linkedin.percentage}%)
                  </div>
                  <button
                    onClick={() => handleShare("linkedin")}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                  >
                    <Share2 className="w-3 h-3" />
                    Share
                  </button>
                </div>
              </div>
            </div>

            {/* Share Buttons Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Share2 className="text-purple-600" />
                Quick Share Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => handleShare("facebook")}
                  className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
                >
                  <Facebook className="w-6 h-6 text-blue-600" />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-gray-900">Facebook</div>
                    <div className="text-sm text-gray-600">
                      Share on Facebook
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                </button>

                <button
                  onClick={() => handleShare("twitter")}
                  className="flex items-center gap-3 p-4 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors group"
                >
                  <Twitter className="w-6 h-6 text-sky-500" />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-gray-900">Twitter</div>
                    <div className="text-sm text-gray-600">Tweet this</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-sky-500" />
                </button>

                <button
                  onClick={() => handleShare("linkedin")}
                  className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
                >
                  <Linkedin className="w-6 h-6 text-blue-700" />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-gray-900">LinkedIn</div>
                    <div className="text-sm text-gray-600">
                      Share on LinkedIn
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-700" />
                </button>

                <button
                  onClick={() => handleShare("pinterest")}
                  className="flex items-center gap-3 p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-colors group"
                >
                  <span className="text-2xl font-bold text-red-600">P</span>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-gray-900">Pinterest</div>
                    <div className="text-sm text-gray-600">Pin this</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setUrl("");
                  setResults(null);
                  setError(null);
                }}
                className="px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Analyze Another URL
              </button>
              <button
                onClick={handleExport}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
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

export default SocialShareTracker;
