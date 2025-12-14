import React, { useState } from "react";
import { Link } from "react-router-dom";
import useScanResults from "../hooks/useScanResults";
import { motion } from "framer-motion";
import {
  Copy,
  CheckCircle,
  Download,
  ExternalLink,
  Search,
  Info,
  BarChart3,
  FileText,
} from "lucide-react";

const DuplicateContentDetector: React.FC = () => {
  const { scanResults, serviceData, hasServiceData, serviceStatus, loading, error: scanError } = useScanResults({ serviceName: 'duplicateContent' });
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"internal" | "external">("internal");

  // Get duplicate content data from scan results
  const duplicateContentData = serviceData;
  const hasDuplicateContentData = hasServiceData;

  // Set error from scan service
  React.useEffect(() => {
    if (scanError) {
      setError(scanError);
    } else if (!hasDuplicateContentData && !loading) {
      setError(serviceStatus);
    } else {
      setError("");
    }
  }, [scanError, hasDuplicateContentData, loading, serviceStatus]);

  const redirectToScan = () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }
    // Redirect to scan page to run a new scan
    window.location.href = `/scan?url=${encodeURIComponent(url)}`;
  };

  const getSeverityColor = (percentage: number) => {
    if (percentage >= 80) return "text-red-600 bg-red-100";
    if (percentage >= 50) return "text-orange-600 bg-orange-100";
    if (percentage >= 20) return "text-yellow-600 bg-yellow-100";
    return "text-green-600 bg-green-100";
  };

  const handleExport = () => {
    if (!duplicateContentData) return;
    
    const dataStr = JSON.stringify(duplicateContentData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'duplicate-content-report.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const getActiveData = () => {
    if (!duplicateContentData) return [];
    
    if (activeTab === "internal") {
      return duplicateContentData.internalDuplicates || [];
    } else {
      return duplicateContentData.externalDuplicates || [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-6">
            <Copy className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Duplicate Content Detector
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Identify duplicate content across your website and external sources 
            that may be affecting your SEO performance.
          </p>
        </motion.div>

        {/* URL Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
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

          {!hasDuplicateContentData && (
            <form onSubmit={(e) => { e.preventDefault(); redirectToScan(); }} className="space-y-6">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL to Analyze
                </label>
                <div className="flex rounded-lg shadow-sm">
                  <input
                    type="url"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 min-w-0 block w-full px-4 py-3 rounded-l-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                    placeholder="https://example.com"
                    required
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-r-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Analyze
                  </button>
                </div>
              </div>
            </form>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-8"
          >
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
              <span className="text-lg text-gray-600">Analyzing content for duplicates...</span>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {duplicateContentData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">
                  {duplicateContentData.score || 0}%
                </div>
                <div className="text-sm text-gray-600">Uniqueness Score</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <Copy className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-purple-600">
                  {duplicateContentData.duplicatePercentage || 0}%
                </div>
                <div className="text-sm text-gray-600">Duplicate Content</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <FileText className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-green-600">
                  {(duplicateContentData.internalDuplicates || []).length}
                </div>
                <div className="text-sm text-gray-600">Internal Issues</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <ExternalLink className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-orange-600">
                  {(duplicateContentData.externalDuplicates || []).length}
                </div>
                <div className="text-sm text-gray-600">External Matches</div>
              </div>
            </div>

            {/* Tabs and Export */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab("internal")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === "internal"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Internal Duplicates
                  </button>
                  <button
                    onClick={() => setActiveTab("external")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === "external"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    External Matches
                  </button>
                </div>
                
                <button
                  onClick={handleExport}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </button>
              </div>

              {/* Content List */}
              <div className="space-y-4">
                {getActiveData().length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {activeTab === "internal" 
                        ? "No internal duplicate content found!" 
                        : "No external duplicate content detected!"}
                    </p>
                  </div>
                ) : (
                  getActiveData().map((item: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                              {item.title || item.url}
                            </a>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                                item.similarity || 0
                              )}`}
                            >
                              {item.similarity || 0}% similar
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>URL:</strong> {item.url}</p>
                            {item.snippet && (
                              <p><strong>Content Preview:</strong> {item.snippet}</p>
                            )}
                            {item.issues && item.issues.length > 0 && (
                              <p><strong>Issues:</strong> {item.issues.join(", ")}</p>
                            )}
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recommendations */}
            {duplicateContentData.recommendations && duplicateContentData.recommendations.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Recommendations
                </h3>
                <div className="space-y-3">
                  {duplicateContentData.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                      <p className="text-gray-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Analysis Summary */}
            {duplicateContentData.summary && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Content Analysis Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Content Statistics</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>Total Pages Analyzed: {duplicateContentData.summary.totalPages || 0}</li>
                      <li>Unique Content: {duplicateContentData.summary.uniqueContent || 0}%</li>
                      <li>Average Similarity: {duplicateContentData.summary.averageSimilarity || 0}%</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>Review flagged content for originality</li>
                      <li>Implement canonical tags where appropriate</li>
                      <li>Consider 301 redirects for duplicate pages</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DuplicateContentDetector;