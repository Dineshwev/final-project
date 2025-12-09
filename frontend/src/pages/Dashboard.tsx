import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import {
  BarChart3,
  Gauge,
  Zap,
  Clock,
  Search,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "components/ui/skeleton";
import { useDashboardMetrics } from "../hooks/useDashboardMetrics";
import { useMobileOptimization } from "../hooks/useMobileOptimization";
import { Link, useNavigate } from "react-router-dom";
import Sparkline from "components/Sparkline";
import Ripple from "components/ui/Ripple";
import { useAuth } from "../context/AuthContext";
import apiService from "../services/api";

export default function Dashboard() {
  const { loading, formatted } = useDashboardMetrics();
  const { shouldReduceBackgroundEffects } = useMobileOptimization();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scanUrl, setScanUrl] = useState("");
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Get user's display name or email
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";

  const handleQuickScan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!scanUrl.trim()) {
      setScanError("Please enter a valid URL");
      return;
    }

    // Basic URL validation
    try {
      const url = new URL(
        scanUrl.startsWith("http") ? scanUrl : `https://${scanUrl}`
      );
      setScanError(null);
      setScanLoading(true);

      const response = await apiService.scanWebsite(url.toString(), {
        deepCrawl: false,
        includeSecurity: true,
        includeBacklinks: false,
      });

      console.log("Scan response from Dashboard:", response);

      // Check if the request was successful and has proper data structure
      if (!response.success) {
        console.error("Scan API request failed:", response.error || "Unknown error");
        setScanError(
          typeof response.error === 'string' 
            ? response.error 
            : (response.error as any)?.message || "Failed to start scan. Please try again."
        );
        setScanLoading(false);
        return;
      }

      // Backend returns nested structure: { success, data: { status, data: { scanId } } }
      // After wrapResponse: { success, data: { scanId, url, status } }
      const scanId = response.data?.scanId || response.data?.data?.scanId;

      if (!scanId) {
        console.error("No scanId found in response.data:", response.data);
        setScanError("Failed to get scan ID from server. Please try again.");
        setScanLoading(false);
        return;
      }

      console.log("Scan started with scanId:", scanId);
      console.log("Polling for scan completion...");

        // Poll for scan completion before redirecting
        const API_BASE =
          process.env.REACT_APP_API_BASE_URL || "https://inrpws5mww.ap-southeast-2.awsapprunner.com/api";
        const maxPolls = 30; // 30 seconds max
        let pollCount = 0;

        while (pollCount < maxPolls) {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
          pollCount++;

          try {
            const statusRes = await fetch(`${API_BASE}/scan/${scanId}/results`);
            const statusData = await statusRes.json();

            console.log(`Poll ${pollCount}: status =`, statusData.status);

            if (statusData.status === "success") {
              console.log("Scan completed! Navigating to results page");
              navigate(`/results/${scanId}`);
              return;
            }

            // If still pending or in-progress, continue polling
            if (
              statusData.status === "pending" ||
              statusData.data?.status === "in-progress"
            ) {
              continue;
            }

            // If error, break and show error
            if (statusData.status === "error") {
              setScanError(statusData.message || "Scan failed");
              setScanLoading(false);
              return;
            }
          } catch (pollError) {
            console.log("Poll error:", pollError);
            // Continue polling even on error
          }
        }

        // If we've exhausted polls, navigate anyway (Results page will handle polling)
        console.log("Max polls reached, navigating to results page");
        navigate(`/results/${scanId}`);
    } catch (error) {
      setScanError("Invalid URL format");
      setScanLoading(false);
    }
  };
  return (
    <div className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 min-h-screen overflow-hidden">
      {/* Optimized background - reduced for mobile performance */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {!shouldReduceBackgroundEffects && (
          <>
            <div className="bg-gradient-blur-1" />
            <div className="bg-gradient-blur-2" />
            <div className="bg-gradient-blur-3" />
          </>
        )}
      </div>

      {/* Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-12 sm:pb-16">
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="fade-in-fast">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Welcome back, {displayName}!
              </span>{" "}
              <span className="inline-block animate-wave">👋</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6">
              Monitor and optimize your website's SEO performance in real-time
            </p>
          </div>

          {/* Quick Scan Form - Premium Dark */}
          <div className="fade-in-delayed bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 hover:border-white/20 transition-all mt-4 sm:mt-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <span className="text-sm sm:text-base lg:text-xl">Quick Website Scan</span>
              </h2>
            </div>
            <form
              onSubmit={handleQuickScan}
              className="flex flex-col gap-3 sm:gap-4"
            >
              <div className="flex-1">
                <input
                  type="text"
                  value={scanUrl}
                  onChange={(e) => setScanUrl(e.target.value)}
                  placeholder="Enter website URL (e.g., https://example.com)"
                  className="w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border-2 border-white/10 bg-slate-900/50 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-slate-900/70 transition-all backdrop-blur-sm text-sm sm:text-base touch-manipulation"
                  disabled={scanLoading}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={scanLoading || !scanUrl.trim()}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 min-h-[48px] sm:min-w-[160px] shadow-lg hover:-translate-y-0.5 touch-manipulation text-sm sm:text-base"
                >
                  {scanLoading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Scanning...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Analyze Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>
            {scanError && (
              <div className="fade-in-fast mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300 font-medium">{scanError}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid - Premium Dark */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 lg:mb-10">
          <div className="fade-in-stagger-1">
            <Card className="group relative shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 hover:border-purple-500/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-300 text-sm relative z-10">
                  <BarChart3 className="w-4 h-4 text-blue-400 animate-icon-pulse" />{" "}
                  Total Scans
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                {loading ? (
                  <Skeleton className="h-9 w-20 bg-slate-700/50" />
                ) : (
                  <div className="flex items-end justify-between gap-3">
                    <p className="text-3xl font-bold text-white">
                      {formatted?.totalScans ?? 0}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="fade-in-stagger-1"
            style={{ animationDelay: '0.35s' }}
          >
            <Card className="group relative shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 hover:border-purple-500/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-300 text-sm relative z-10">
                  <Zap className="w-4 h-4 text-purple-400 animate-icon-pulse" />{" "}
                  Avg Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                {loading ? (
                  <Skeleton className="h-9 w-24 bg-slate-700/50" />
                ) : (
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-3xl font-bold text-white">
                        {formatted?.avgPerformanceDisplay ?? "—"}
                      </p>
                      {formatted &&
                        formatted.performanceSeries &&
                        formatted.performanceSeries.length >= 2 && (
                          <div className="mt-1 text-xs flex items-center gap-1">
                            {(formatted.perfTrend ?? 0) >= 0 ? (
                              <>
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">
                                  +
                                  {Math.abs(formatted.perfTrend ?? 0).toFixed(
                                    1
                                  )}
                                  %
                                </span>
                              </>
                            ) : (
                              <>
                                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                                <span className="text-rose-400">
                                  -
                                  {Math.abs(formatted?.perfTrend ?? 0).toFixed(
                                    1
                                  )}
                                  %
                                </span>
                              </>
                            )}
                          </div>
                        )}
                    </div>
                    <Sparkline
                      data={formatted?.performanceSeries ?? []}
                      width={120}
                      height={40}
                      className="opacity-80"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="fade-in-stagger-1"
            style={{ animationDelay: '0.3s' }}
          >
            <Card className="group relative shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 hover:border-emerald-500/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-300 text-sm relative z-10">
                  <Gauge className="w-4 h-4 text-emerald-400 animate-icon-pulse" />{" "}
                  Avg SEO Score
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                {loading ? (
                  <Skeleton className="h-9 w-24 bg-slate-700/50" />
                ) : (
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-3xl font-bold text-white">
                        {formatted?.avgSeoDisplay ?? "—"}
                      </p>
                      {formatted &&
                        formatted.seoSeries &&
                        formatted.seoSeries.length >= 2 && (
                          <div className="mt-1 text-xs flex items-center gap-1">
                            {(formatted.seoTrend ?? 0) >= 0 ? (
                              <>
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">
                                  +
                                  {Math.abs(formatted.seoTrend ?? 0).toFixed(1)}
                                  %
                                </span>
                              </>
                            ) : (
                              <>
                                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                                <span className="text-rose-400">
                                  -
                                  {Math.abs(formatted?.seoTrend ?? 0).toFixed(
                                    1
                                  )}
                                  %
                                </span>
                              </>
                            )}
                          </div>
                        )}
                    </div>
                    <Sparkline
                      data={formatted?.seoSeries ?? []}
                      width={120}
                      height={40}
                      className="opacity-80"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="fade-in-stagger-1"
            style={{ animationDelay: '0.4s' }}
          >
            <Card className="group relative shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-300 text-sm relative z-10">
                  <Clock className="w-4 h-4 text-cyan-400 animate-icon-pulse" />{" "}
                  Last Scan
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                {loading ? (
                  <Skeleton className="h-9 w-40 bg-slate-700/50" />
                ) : (
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {formatted?.lastScanDisplay ?? "No scans yet"}
                    </p>
                    {!formatted?.lastScan && (
                      <p className="text-xs text-slate-400 mt-1">
                        Start your first scan above
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Quick Actions */}
        <div className="fade-in-delayed rounded-2xl p-4 sm:p-6 md:p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 text-white shadow-2xl relative overflow-hidden mb-6 sm:mb-8 lg:mb-10">
          <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20"></div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 relative z-10 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 relative z-10">
            <Link to="/scan" className="block">
              <Ripple className="relative group rounded-xl bg-white/10 backdrop-blur border border-white/20 p-4 sm:p-5 hover:shadow-[0_0_0_2px_rgba(255,255,255,0.2),0_10px_25px_-5px_rgba(0,0,0,0.4)] transition-transform duration-200 hover:-translate-y-0.5 touch-manipulation min-h-[72px] sm:min-h-[80px]">
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Search className="w-4 h-4 sm:w-5 sm:h-5 animate-icon-pulse" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm sm:text-base truncate">Start New Scan</div>
                      <div className="text-xs sm:text-sm text-white/80 truncate">
                        Analyze a new URL
                      </div>
                    </div>
                  </div>
                  <div className="text-white/70 flex-shrink-0 ml-2">→</div>
                </div>
              </Ripple>
            </Link>
            <Link to="/history" className="block">
              <Ripple className="relative group rounded-xl bg-white/10 backdrop-blur border border-white/20 p-5 hover:shadow-[0_0_0_2px_rgba(255,255,255,0.2),0_10px_25px_-5px_rgba(0,0,0,0.4)] transition-transform duration-200 hover:-translate-y-0.5">
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BarChart3 className="w-5 h-5 animate-icon-pulse" />
                    </div>
                    <div>
                      <div className="font-semibold">View History</div>
                      <div className="text-xs text-white/80">
                        See previous results
                      </div>
                    </div>
                  </div>
                  <div className="text-white/70">→</div>
                </div>
              </Ripple>
            </Link>
            <Link to="/compare" className="block">
              <Ripple className="relative group rounded-xl bg-white/10 backdrop-blur border border-white/20 p-5 hover:shadow-[0_0_0_2px_rgba(255,255,255,0.2),0_10px_25px_-5px_rgba(0,0,0,0.4)] transition-transform duration-200 hover:-translate-y-0.5">
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-5 h-5 animate-icon-pulse" />
                    </div>
                    <div>
                      <div className="font-semibold">Compare Scans</div>
                      <div className="text-xs text-white/80">
                        Spot regressions
                      </div>
                    </div>
                  </div>
                  <div className="text-white/70">→</div>
                </div>
              </Ripple>
            </Link>
            <Link to="/og-validator" className="block">
              <Ripple className="relative group rounded-xl bg-white/10 backdrop-blur border border-white/20 p-5 hover:shadow-[0_0_0_2px_rgba(255,255,255,0.2),0_10px_25px_-5px_rgba(0,0,0,0.4)] transition-transform duration-200 hover:-translate-y-0.5">
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-lg">🔍</span>
                    </div>
                    <div>
                      <div className="font-semibold">OG Validator</div>
                      <div className="text-xs text-white/80">
                        Check social tags
                      </div>
                    </div>
                  </div>
                  <div className="text-white/70">→</div>
                </div>
              </Ripple>
            </Link>
            <Link to="/twitter-card" className="block">
              <Ripple className="relative group rounded-xl bg-white/10 backdrop-blur border border-white/20 p-5 hover:shadow-[0_0_0_2px_rgba(255,255,255,0.2),0_10px_25px_-5px_rgba(0,0,0,0.4)] transition-transform duration-200 hover:-translate-y-0.5">
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-lg">🐦</span>
                    </div>
                    <div>
                      <div className="font-semibold">Twitter Card</div>
                      <div className="text-xs text-white/80">
                        Validate Twitter tags
                      </div>
                    </div>
                  </div>
                  <div className="text-white/70">→</div>
                </div>
              </Ripple>
            </Link>
            <Link to="/share-tracker" className="block">
              <Ripple className="relative group rounded-xl bg-white/10 backdrop-blur border border-white/20 p-5 hover:shadow-[0_0_0_2px_rgba(255,255,255,0.2),0_10px_25px_-5px_rgba(0,0,0,0.4)] transition-transform duration-200 hover:-translate-y-0.5">
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-lg">📊</span>
                    </div>
                    <div>
                      <div className="font-semibold">Share Tracker</div>
                      <div className="text-xs text-white/80">
                        Social share counts
                      </div>
                    </div>
                  </div>
                  <div className="text-white/70">→</div>
                </div>
              </Ripple>
            </Link>
            <Link to="/social-presence" className="block">
              <Ripple className="relative group rounded-xl bg-white/10 backdrop-blur border border-white/20 p-5 hover:shadow-[0_0_0_2px_rgba(255,255,255,0.2),0_10px_25px_-5px_rgba(0,0,0,0.4)] transition-transform duration-200 hover:-translate-y-0.5">
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-lg">🌐</span>
                    </div>
                    <div>
                      <div className="font-semibold">Social Presence</div>
                      <div className="text-xs text-white/80">
                        Validate profiles
                      </div>
                    </div>
                  </div>
                  <div className="text-white/70">→</div>
                </div>
              </Ripple>
            </Link>
            <Link to="/pinterest-rich-pin" className="block">
              <Ripple className="relative group rounded-xl bg-white/10 backdrop-blur border border-white/20 p-5 hover:shadow-[0_0_0_2px_rgba(255,255,255,0.2),0_10px_25px_-5px_rgba(0,0,0,0.4)] transition-transform duration-200 hover:-translate-y-0.5">
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-lg">📌</span>
                    </div>
                    <div>
                      <div className="font-semibold">Pinterest Rich Pins</div>
                      <div className="text-xs text-white/80">
                        Validate meta tags
                      </div>
                    </div>
                  </div>
                  <div className="text-white/70">→</div>
                </div>
              </Ripple>
            </Link>
            <Link to="/accessibility" className="block">
              <Ripple className="relative group rounded-xl bg-white/10 backdrop-blur border border-white/20 p-5 hover:shadow-[0_0_0_2px_rgba(255,255,255,0.2),0_10px_25px_-5px_rgba(0,0,0,0.4)] transition-transform duration-200 hover:-translate-y-0.5">
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-lg">👁️</span>
                    </div>
                    <div>
                      <div className="font-semibold">WCAG Accessibility</div>
                      <div className="text-xs text-white/80">
                        Check compliance
                      </div>
                    </div>
                  </div>
                  <div className="text-white/70">→</div>
                </div>
              </Ripple>
            </Link>

            <Link to="/toxic-backlinks">
              <Ripple>
                <div className="group relative bg-gradient-to-br from-red-600 to-orange-600 rounded-xl p-6 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer flex items-center justify-between overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-lg">🛡️</span>
                    </div>
                    <div>
                      <div className="font-semibold">Toxic Backlinks</div>
                      <div className="text-xs text-white/80">
                        Detect spam links
                      </div>
                    </div>
                  </div>
                  <div className="text-white/70">→</div>
                </div>
              </Ripple>
            </Link>

            <Link to="/duplicate-content">
              <Ripple>
                <div className="group relative bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer flex items-center justify-between overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-lg">📄</span>
                    </div>
                    <div>
                      <div className="font-semibold">Duplicate Content</div>
                      <div className="text-xs text-white/80">
                        Find similar pages
                      </div>
                    </div>
                  </div>
                  <div className="text-white/70">→</div>
                </div>
              </Ripple>
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="fade-in-delayed grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="group relative shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 hover:border-blue-500/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-lg text-white">
                <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-slate-300 text-sm">
                Track Core Web Vitals and page speed metrics with real-time
                analysis and historical trends.
              </p>
            </CardContent>
          </Card>

          <Card className="group relative shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 hover:border-purple-500/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-lg text-white">
                <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                </div>
                Historical Data
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-slate-300 text-sm">
                Access {formatted?.totalScans || 0} total scans with
                side-by-side comparison tools to spot trends.
              </p>
            </CardContent>
          </Card>

          <Card className="group relative shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 hover:border-emerald-500/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-lg text-white">
                <div className="p-2 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors">
                  <Gauge className="w-5 h-5 text-emerald-400" />
                </div>
                SEO Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-slate-300 text-sm">
                Get actionable recommendations to improve your website's search
                engine rankings.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
