import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  ExternalLink,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Share2,
} from "lucide-react";
import {
  generateAudit,
  getPlatforms,
  exportAsJSON,
  saveToHistory,
  getScoreBgColor,
  getStatusColor,
  AuditReport,
  Platform,
} from "../services/socialPresenceService";

const SocialPresenceValidator: React.FC = () => {
  const [profiles, setProfiles] = useState<{ [key: string]: string }>({
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    youtube: "",
    pinterest: "",
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>([]);

  useEffect(() => {
    loadPlatforms();
  }, []);

  const loadPlatforms = async () => {
    const platformList = await getPlatforms();
    setPlatforms(platformList);
  };

  const handleInputChange = (platform: string, value: string) => {
    setProfiles((prev) => ({
      ...prev,
      [platform]: value,
    }));
  };

  const handleAudit = async () => {
    // Check if at least one profile is provided
    const hasProfiles = Object.values(profiles).some((url) => url.trim());
    if (!hasProfiles) {
      setError("Please enter at least one social profile URL");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const report = await generateAudit(profiles);
      setResults(report);
      saveToHistory(report);
    } catch (err: any) {
      setError(err.message || "Audit failed");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (results) {
      exportAsJSON(results);
    }
  };

  const getPlatformIcon = (platform: string): React.ReactElement => {
    const icons: { [key: string]: React.ReactElement } = {
      facebook: <Facebook className="w-5 h-5" />,
      "twitter/x": <Twitter className="w-5 h-5" />,
      instagram: <Instagram className="w-5 h-5" />,
      linkedin: <Linkedin className="w-5 h-5" />,
      youtube: <Youtube className="w-5 h-5" />,
      pinterest: <Share2 className="w-5 h-5" />,
    };
    return icons[platform.toLowerCase()] || <Share2 className="w-5 h-5" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "invalid":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "not_found":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-2xl shadow-lg">
              <Share2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Social Presence Validator
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Audit your social media presence across major platforms and get a
            comprehensive score
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Enter Your Social Profile URLs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(profiles).map((platform) => {
              const platformData = platforms.find((p) => p.id === platform);
              return (
                <div key={platform}>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    {getPlatformIcon(platformData?.name || platform)}
                    {platformData?.name ||
                      platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </label>
                  <input
                    type="url"
                    value={profiles[platform]}
                    onChange={(e) =>
                      handleInputChange(platform, e.target.value)
                    }
                    placeholder={
                      platformData?.example ||
                      `https://${platform}.com/username`
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 text-sm transition-all"
                    disabled={loading}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={handleAudit}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Search className="w-5 h-5" />
              {loading ? "Auditing..." : "Run Audit"}
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
            {/* Score Banner */}
            <div
              className={`rounded-2xl shadow-xl p-8 bg-gradient-to-r ${getScoreBgColor(
                results.score
              )} text-white`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/80 text-lg mb-2">
                    Social Presence Score
                  </div>
                  <div className="text-6xl font-bold">{results.score}%</div>
                  <div className="text-white/90 mt-2">
                    {results.score >= 80
                      ? "Excellent presence!"
                      : results.score >= 60
                      ? "Good coverage"
                      : results.score >= 40
                      ? "Needs improvement"
                      : "Limited presence"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white/80 text-sm mb-2">Coverage</div>
                  <div className="text-3xl font-bold">
                    {results.summary.activeProfiles}/
                    {results.summary.totalPlatforms}
                  </div>
                  <div className="text-white/80 text-sm">platforms</div>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-3xl font-bold text-green-600">
                  {results.summary.activeProfiles}
                </div>
                <div className="text-gray-600 font-medium">Active Profiles</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-3xl font-bold text-red-600">
                  {results.summary.invalidProfiles}
                </div>
                <div className="text-gray-600 font-medium">Invalid URLs</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-3xl font-bold text-yellow-600">
                  {results.summary.notFoundProfiles}
                </div>
                <div className="text-gray-600 font-medium">Not Found</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-3xl font-bold text-gray-600">
                  {results.summary.missingPlatforms}
                </div>
                <div className="text-gray-600 font-medium">Missing</div>
              </div>
            </div>

            {/* Profile Results */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Profile Details
              </h3>
              <div className="space-y-4">
                {results.profiles.map((profile, idx) => {
                  const statusColors = getStatusColor(profile.status);
                  return (
                    <div
                      key={idx}
                      className={`p-6 rounded-xl border-2 ${statusColors.border} ${statusColors.bg}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getPlatformIcon(profile.platform)}
                            <span className="font-bold text-lg text-gray-900">
                              {profile.platform}
                            </span>
                            {getStatusIcon(profile.status)}
                          </div>
                          <div className="text-sm text-gray-600 break-all mb-2">
                            {profile.url}
                          </div>
                          {profile.username && (
                            <div className="text-sm font-semibold text-gray-700">
                              Username: @{profile.username}
                            </div>
                          )}
                          {profile.info?.name && (
                            <div className="text-sm text-gray-700 mt-2">
                              <span className="font-semibold">Name:</span>{" "}
                              {profile.info.name}
                            </div>
                          )}
                          {profile.error && (
                            <div
                              className={`text-sm mt-2 ${statusColors.text}`}
                            >
                              {profile.error}
                            </div>
                          )}
                        </div>
                        {profile.exists && (
                          <a
                            href={profile.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-4 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-5 h-5 text-gray-600" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Missing Platforms */}
            {results.missingPlatforms.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <AlertTriangle className="text-yellow-600" />
                  Missing Platforms ({results.missingPlatforms.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {results.missingPlatforms.map((platform, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl"
                    >
                      <div className="font-semibold text-gray-900">
                        {platform.name}
                      </div>
                      <div className="text-sm text-gray-600">Not provided</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {results.recommendations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Recommendations
                </h3>
                <div className="space-y-3">
                  {results.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="text-gray-700">{rec}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setProfiles({
                    facebook: "",
                    twitter: "",
                    instagram: "",
                    linkedin: "",
                    youtube: "",
                    pinterest: "",
                  });
                  setResults(null);
                  setError(null);
                }}
                className="px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                New Audit
              </button>
              <button
                onClick={handleExport}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
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

export default SocialPresenceValidator;
