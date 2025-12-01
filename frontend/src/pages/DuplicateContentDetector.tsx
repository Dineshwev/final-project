import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Search,
  FileText,
  Download,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Network,
  ChevronDown,
  ChevronUp,
  Eye,
  Maximize2,
  Minimize2,
} from "lucide-react";
import {
  analyzeDuplicateContent,
  exportAsJSON,
  convertToNetworkGraph,
  getSimilarityColor,
  getSimilarityBgColor,
  getClusterTypeColor,
  getPriorityColor,
  truncateUrl,
  estimateCrawlTime,
  type AnalysisReport,
  type DuplicateCluster,
} from "../services/duplicateContentService";
import NetworkGraph from "../components/NetworkGraph";

const DuplicateContentDetector: React.FC = () => {
  const [url, setUrl] = useState("");
  const [maxPages, setMaxPages] = useState(50);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState("");
  const [expandedCluster, setExpandedCluster] = useState<number | null>(null);
  const [showNetworkGraph, setShowNetworkGraph] = useState(false);
  const [isGraphFullscreen, setIsGraphFullscreen] = useState(false);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError("Please enter a website URL");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setReport(null);

      const analysisReport = await analyzeDuplicateContent(url, maxPages);

      if (analysisReport.success) {
        setReport(analysisReport);
      } else {
        setError(analysisReport.error || "Analysis failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to analyze duplicate content");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!report) return;
    const domain = new URL(url).hostname.replace(/\./g, "-");
    const filename = `duplicate-content-${domain}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    exportAsJSON(report, filename);
  };

  const toggleCluster = (index: number) => {
    setExpandedCluster(expandedCluster === index ? null : index);
  };

  const renderNetworkVisualization = () => {
    if (!report || !showNetworkGraph) return null;

    const { nodes, edges } = convertToNetworkGraph(report);

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className={`bg-white rounded-lg shadow-lg p-6 mb-6 ${
          isGraphFullscreen ? "fixed inset-4 z-50 overflow-auto" : "relative"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Network className="w-6 h-6 text-blue-600" />
            Interactive Content Similarity Network
          </h3>
          <button
            onClick={() => setIsGraphFullscreen(!isGraphFullscreen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={isGraphFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isGraphFullscreen ? (
              <Minimize2 className="w-5 h-5 text-gray-600" />
            ) : (
              <Maximize2 className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Network Statistics:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                • <strong>{nodes.length}</strong> pages (nodes)
              </li>
              <li>
                • <strong>{edges.length}</strong> similarity connections (edges)
              </li>
              <li>
                • <strong>{report.summary.totalClusters}</strong> duplicate
                clusters
              </li>
            </ul>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Node Colors:
            </p>
            <ul className="text-sm space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 bg-green-500 rounded-full border-2 border-green-600"></span>
                <span>Unique content</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 bg-red-500 rounded-full border-2 border-red-600"></span>
                <span>Exact duplicates (≥95%)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 bg-orange-500 rounded-full border-2 border-orange-600"></span>
                <span>Near duplicates (≥80%)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 bg-blue-500 rounded-full border-2 border-blue-600"></span>
                <span>Similar content (≥60%)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              <strong>Interactive controls:</strong> Drag nodes to reposition,
              scroll to zoom, hover over nodes/edges for details, click nodes to
              highlight connections.
            </p>
          </div>
        </div>

        <NetworkGraph
          nodes={nodes}
          edges={edges}
          height={isGraphFullscreen ? "calc(100vh - 300px)" : "600px"}
        />
      </motion.div>
    );
  };

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
            <Copy className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-800">
              Duplicate Content Detector
            </h1>
          </div>
          <p className="text-gray-600 ml-13">
            Crawl your website and detect exact and near-duplicate content using
            TF-IDF similarity analysis
          </p>
        </motion.div>

        {/* Analysis Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Max Pages to Crawl (Estimated time:{" "}
                {estimateCrawlTime(maxPages)})
              </label>
              <select
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value={10}>10 pages</option>
                <option value={25}>25 pages</option>
                <option value={50}>50 pages</option>
                <option value={100}>100 pages</option>
                <option value={250}>250 pages</option>
              </select>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !url}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Crawling & Analyzing... (This may take several minutes)
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Analyze Duplicate Content
                </>
              )}
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">How it works:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Crawls all internal pages using Puppeteer</li>
                <li>
                  Extracts main content (removes headers, footers, navigation)
                </li>
                <li>
                  Calculates TF-IDF similarity scores between all page pairs
                </li>
                <li>Groups pages into duplicate clusters</li>
                <li>Generates recommendations for SEO improvement</li>
              </ul>
            </div>
          </div>
        </motion.div>

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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            >
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Pages</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {report.summary.totalPages}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-green-50 rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-semibold">
                      Unique Pages
                    </p>
                    <p className="text-2xl font-bold text-green-700">
                      {report.summary.uniquePages}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-red-50 rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-semibold">
                      Affected Pages
                    </p>
                    <p className="text-2xl font-bold text-red-700">
                      {report.summary.affectedPages}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-semibold">
                      Duplicate %
                    </p>
                    <p className="text-2xl font-bold text-purple-700">
                      {report.summary.duplicatePercentage}%
                    </p>
                  </div>
                  <Copy className="w-8 h-8 text-purple-600" />
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
                onClick={handleExport}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
              >
                <Download className="w-5 h-5" />
                Export Report (JSON)
              </button>

              <button
                onClick={() => setShowNetworkGraph(!showNetworkGraph)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
              >
                <Network className="w-5 h-5" />
                {showNetworkGraph ? "Hide" : "Show"} Network Graph
              </button>
            </motion.div>

            {/* Network Visualization */}
            <AnimatePresence>{renderNetworkVisualization()}</AnimatePresence>

            {/* Recommendations */}
            {report.recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-lg p-6 mb-6"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Info className="w-6 h-6 text-blue-600" />
                  Recommendations
                </h3>
                <div className="space-y-3">
                  {report.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg border-2"
                      style={{
                        borderColor:
                          rec.priority === "critical"
                            ? "#ef4444"
                            : rec.priority === "high"
                            ? "#f59e0b"
                            : rec.priority === "medium"
                            ? "#eab308"
                            : "#10b981",
                      }}
                    >
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(
                          rec.priority
                        )}`}
                      >
                        {rec.priority.toUpperCase()}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {rec.message}
                        </p>
                        {rec.action && (
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Action:</strong> {rec.action}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Duplicate Clusters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Copy className="w-7 h-7 text-purple-600" />
                Duplicate Clusters ({report.duplicateClusters.length})
              </h3>

              {report.duplicateClusters.length === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-green-800 mb-2">
                    No Duplicate Content Detected!
                  </h4>
                  <p className="text-green-600">
                    All pages have unique content. Great job maintaining content
                    diversity!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {report.duplicateClusters.map((cluster, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-lg shadow-lg overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold border ${getClusterTypeColor(
                                  cluster.type
                                )}`}
                              >
                                {cluster.type.toUpperCase()}
                              </span>
                              <span className="text-sm text-gray-600">
                                {cluster.clusterSize} pages
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Content Sample:</strong>{" "}
                              {cluster.contentSample}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <div
                              className={`text-3xl font-bold ${getSimilarityColor(
                                cluster.similarityScore
                              )}`}
                            >
                              {(cluster.similarityScore * 100).toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-600">
                              Similarity
                            </div>
                          </div>
                        </div>

                        {/* Pages in Cluster */}
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-700">
                            Pages in this cluster:
                          </p>
                          {cluster.pages
                            .slice(0, expandedCluster === index ? undefined : 3)
                            .map((page, pageIndex) => (
                              <div
                                key={pageIndex}
                                className="bg-gray-50 rounded p-3 flex items-start justify-between"
                              >
                                <div className="flex-1">
                                  <a
                                    href={page.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2 font-medium"
                                  >
                                    {truncateUrl(page.url, 70)}
                                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                                  </a>
                                  <p className="text-sm text-gray-600 mt-1">
                                    <strong>Title:</strong>{" "}
                                    {page.title || "No title"}
                                  </p>
                                </div>
                                <span className="text-sm text-gray-600 ml-4">
                                  {page.wordCount} words
                                </span>
                              </div>
                            ))}

                          {cluster.pages.length > 3 && (
                            <button
                              onClick={() => toggleCluster(index)}
                              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2 text-sm mt-2"
                            >
                              {expandedCluster === index ? (
                                <>
                                  <ChevronUp className="w-4 h-4" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4" />
                                  Show All {cluster.pages.length} Pages
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default DuplicateContentDetector;
