import React, { useState } from "react";
import { Link } from "react-router-dom";
import useScanResults from "../hooks/useScanResults";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Download,
  ExternalLink,
  Search,
  Info,
  BarChart3,
} from "lucide-react";

const ToxicBacklinkDetector: React.FC = () => {
  const { scanResults, serviceData, hasServiceData, serviceStatus, loading, error: scanError } = useScanResults({ serviceName: 'backlinks' });
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "safe" | "suspicious" | "toxic"
  >("all");

  // Get toxic backlink data from scan results
  const toxicBacklinkData = serviceData;
  const hasToxicBacklinkData = hasServiceData;

  // Set error from scan service
  React.useEffect(() => {
    if (scanError) {
      setError(scanError);
    } else if (!hasToxicBacklinkData && !loading) {
      setError(serviceStatus);
    } else {
      setError("");
    }
  }, [scanError, hasToxicBacklinkData, loading, serviceStatus]);

  const redirectToScan = () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }
    // Redirect to scan page to run a new scan
    window.location.href = `/scan?url=${encodeURIComponent(url)}`;
  };

  const getToxicityColor = (toxicity: string) => {
    switch (toxicity) {
      case "toxic": return "text-red-600 bg-red-100";
      case "suspicious": return "text-orange-600 bg-orange-100";
      case "safe": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getFilteredBacklinks = () => {
    if (!toxicBacklinkData?.backlinks) return [];
    
    const backlinks = toxicBacklinkData.backlinks;
    if (activeFilter === "all") return backlinks;
    
    return backlinks.filter((backlink: any) => 
      backlink.toxicity === activeFilter
    );
  };

  const handleExport = () => {
    if (!toxicBacklinkData) return;
    
    const dataStr = JSON.stringify(toxicBacklinkData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'toxic-backlinks-report.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-full mb-6">
            <ShieldAlert className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Toxic Backlink Detector
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Identify harmful backlinks that may be damaging your website's SEO 
            and create disavow files to protect your rankings.
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

          {!hasToxicBacklinkData && (
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
                    className="flex-1 min-w-0 block w-full px-4 py-3 rounded-l-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg"
                    placeholder="https://example.com"
                    required
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-r-lg text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mr-3"></div>
              <span className="text-lg text-gray-600">Analyzing backlinks for toxic patterns...</span>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {toxicBacklinkData && (
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
                  {toxicBacklinkData.summary?.total || 0}
                </div>
                <div className="text-sm text-gray-600">Total Backlinks</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <ShieldCheck className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-green-600">
                  {toxicBacklinkData.summary?.safe || 0}
                </div>
                <div className="text-sm text-gray-600">Safe Backlinks</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-orange-600">
                  {toxicBacklinkData.summary?.suspicious || 0}
                </div>
                <div className="text-sm text-gray-600">Suspicious</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <ShieldAlert className="h-8 w-8 text-red-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-red-600">
                  {toxicBacklinkData.summary?.toxic || 0}
                </div>
                <div className="text-sm text-gray-600">Toxic Backlinks</div>
              </div>
            </div>

            {/* Filter and Export */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex space-x-2">
                  {["all", "safe", "suspicious", "toxic"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeFilter === filter
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={handleExport}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </button>
              </div>

              {/* Backlinks List */}
              <div className="space-y-4">
                {getFilteredBacklinks().length === 0 ? (
                  <div className="text-center py-8">
                    <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No backlinks found for the selected filter.
                    </p>
                  </div>
                ) : (
                  getFilteredBacklinks().map((backlink: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <a
                              href={backlink.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                              {backlink.domain || backlink.url}
                            </a>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getToxicityColor(
                                backlink.toxicity
                              )}`}
                            >
                              {backlink.toxicity}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Anchor Text:</strong> {backlink.anchorText || "Unknown"}</p>
                            <p><strong>Domain Authority:</strong> {backlink.domainAuthority || "N/A"}</p>
                            {backlink.issues && backlink.issues.length > 0 && (
                              <p><strong>Issues:</strong> {backlink.issues.join(", ")}</p>
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
            {toxicBacklinkData.recommendations && toxicBacklinkData.recommendations.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Recommendations
                </h3>
                <div className="space-y-3">
                  {toxicBacklinkData.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                      <p className="text-gray-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ToxicBacklinkDetector;