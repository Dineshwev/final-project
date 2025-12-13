// src/pages/History.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaExternalLinkAlt,
  FaDownload,
  FaTrashAlt,
  FaSearch,
} from "../components/Icons";
import { ClockIcon } from "@heroicons/react/24/outline";
import apiService from "../services/api.js";
import PageContainer from "../components/PageContainer";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Alert from "../components/Alert";
import Loading from "../components/Loading";
import Badge from "../components/Badge";
import {
  fadeIn,
  staggerContainer,
  staggerItem,
} from "../utils/animations";

interface ScanResult {
  id: string;
  url: string;
  timestamp: string;
  score: number;
  status: "completed" | "failed" | "processing";
  scores?: {
    performance: number | null;
    seo: number | null;
    accessibility: number | null;
    bestPractices: number | null;
  };
}

const History: React.FC = () => {
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch scan history on component mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await apiService.getScanHistory();

        if (response.success && response.data) {
          // Handle different possible response structures
          const scans =
            response.data.scans || response.data.data?.scans || response.data;

          // Ensure scans is an array
          if (Array.isArray(scans)) {
            // Transform backend data to match frontend interface
            const transformedScans = scans.map((scan: any) => {
              // Calculate average score from individual scores
              const scores = scan.scores || {};
              const validScores = Object.values(scores).filter(
                (s): s is number => s !== null && s !== undefined
              );
              const avgScore =
                validScores.length > 0
                  ? Math.round(
                      validScores.reduce((a: number, b: number) => a + b, 0) /
                        validScores.length
                    )
                  : 0;

              return {
                id: scan.scanId || scan.id || scan.scan_id || "",
                url: scan.url || "",
                timestamp:
                  scan.completedAt ||
                  scan.completed_at ||
                  scan.timestamp ||
                  new Date().toISOString(),
                score: avgScore,
                status: "completed" as const,
                scores: scan.scores,
              };
            });

            setScanHistory(transformedScans);
          } else {
            console.error("Unexpected response format:", response.data);
            setScanHistory([]);
            setError("Unexpected data format received");
          }
        } else {
          setScanHistory([]);
          setError("Failed to load scan history");
        }
      } catch (err) {
        setScanHistory([]);
        setError("An error occurred while fetching scan history");
        console.error("History fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleDeleteScan = async (scanId: string) => {
    if (!window.confirm("Are you sure you want to delete this scan?")) {
      return;
    }

    try {
      // API call to delete scan would go here
      // For now, just remove it from the local state
      setScanHistory((prevHistory) =>
        prevHistory.filter((scan) => scan.id !== scanId)
      );
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete scan");
    }
  };

  const handleExport = async (scanId: string, format: "pdf" | "csv") => {
    // Export feature is not available
    alert("Export feature is coming soon!");
  };

  // Filter scans based on search term
  const filteredScans = Array.isArray(scanHistory)
    ? scanHistory.filter((scan) =>
        scan.url?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <PageContainer
      title="Scan History"
      subtitle="View and manage your previous website scans"
      icon={<ClockIcon className="w-8 h-8" />}
    >
      {/* Search bar */}
      <motion.div variants={fadeIn} className="mb-6">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<FaSearch />}
          placeholder="Search by URL..."
        />
      </motion.div>

      {loading ? (
        <motion.div variants={fadeIn}>
          <Loading text="Loading scan history..." />
        </motion.div>
      ) : error ? (
        <motion.div variants={fadeIn}>
          <Alert type="error" title="Error Loading History" message={error} />
        </motion.div>
      ) : filteredScans.length === 0 ? (
        <motion.div variants={fadeIn}>
          <Card variant="glass" padding="xl">
            <div className="text-center py-12">
              <ClockIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No scans found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm
                  ? "No results match your search."
                  : "Get started by running your first website analysis."}
              </p>
              {!searchTerm && (
                <Link to="/">
                  <Button variant="primary" icon={<FaSearch />}>
                    Run a new scan
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <Card variant="glass" padding="none">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      URL
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Score
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900/50 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredScans.map((scan) => (
                    <motion.tr
                      key={scan.id}
                      variants={staggerItem}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {scan.url && scan.url.length > 40
                          ? `${scan.url.substring(0, 40)}...`
                          : scan.url || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {scan.timestamp
                          ? new Date(scan.timestamp).toLocaleString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {scan.status === "completed" ? (
                          <div className="flex items-center">
                            <div
                              className={`mr-2 h-4 w-4 rounded-full ${
                                scan.score >= 90
                                  ? "bg-green-500"
                                  : scan.score >= 70
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                            ></div>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {scan.score}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">
                            -
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Badge
                          variant={
                            scan.status === "completed"
                              ? "success"
                              : scan.status === "processing"
                              ? "warning"
                              : "error"
                          }
                        >
                          {scan.status
                            ? scan.status.charAt(0).toUpperCase() +
                              scan.status.slice(1)
                            : "Unknown"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <Link
                            to={`/results/${scan.id}`}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            title="View Report"
                          >
                            <FaExternalLinkAlt className="w-4 h-4" />
                          </Link>

                          {scan.status === "completed" && (
                            <button
                              onClick={() => handleExport(scan.id, "pdf")}
                              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors disabled:opacity-50"
                              title="Export as PDF"
                              disabled={!scan.id}
                            >
                              <FaDownload className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteScan(scan.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            title="Delete"
                          >
                            <FaTrashAlt className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}
    </PageContainer>
  );
};

export default History;
