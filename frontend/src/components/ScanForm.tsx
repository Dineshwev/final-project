// src/components/ScanForm.tsx - Simplified for Basic Scan
import React, { useState } from "react";
import { FaSearch } from ".//Icons";
import { executeSimpleBasicScan, type SimpleScanResult } from "../services/simpleScan";

interface ScanFormProps {
  className?: string;
}

const ScanForm: React.FC<ScanFormProps> = ({ className = "" }) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SimpleScanResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url) {
      setError("Please enter a URL");
      return;
    }

    // Simple URL validation
    try {
      new URL(url);
    } catch (_) {
      setError("Please enter a valid URL including http:// or https://");
      return;
    }

    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const scanResult = await executeSimpleBasicScan(url.trim());

      // Set the simplified result directly
      setResult(scanResult);

    } catch (err: any) {
      // Show friendly error message, no redirect
      setError(err.message || "Unable to analyze website. Please try again in a moment.");
      console.error("Basic scan error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetScan = () => {
    setResult(null);
    setError(null);
    setUrl("");
  };

  const renderResults = () => {
    if (!result) return null;

    // Calculate simple scores based on available data
    const overallScore = result.score || 75;
    const technicalScore = result.httpsStatus ? 90 : 60;
    const contentScore = (result.title && result.metaDescription) ? 85 : result.title || result.metaDescription ? 65 : 40;
    const userExperienceScore = result.h1Count === 1 ? 90 : result.h1Count === 0 ? 50 : 70;

    return (
      <div className="mt-6 bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-xl border-2 border-green-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Scan Results</h3>
          <div className="text-3xl font-bold text-blue-600">{overallScore}/100</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-700">{technicalScore}</div>
            <div className="text-sm text-gray-600">Technical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-700">{contentScore}</div>
            <div className="text-sm text-gray-600">Content</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-700">{userExperienceScore}</div>
            <div className="text-sm text-gray-600">User Experience</div>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Title:</span>
            <span className={`font-medium ${result.title ? 'text-green-600' : 'text-red-600'}`}>
              {result.title ? '✓ Present' : '✗ Missing'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Meta Description:</span>
            <span className={`font-medium ${result.metaDescription ? 'text-green-600' : 'text-red-600'}`}>
              {result.metaDescription ? '✓ Present' : '✗ Missing'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">H1 Count:</span>
            <span className={`font-medium ${result.h1Count === 1 ? 'text-green-600' : 'text-orange-600'}`}>
              {result.h1Count || 0} {result.h1Count === 1 ? '✓' : result.h1Count === 0 ? '✗' : '⚠'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">HTTPS:</span>
            <span className={`font-medium ${result.httpsStatus ? 'text-green-600' : 'text-red-600'}`}>
              {result.httpsStatus ? '✓ Enabled' : '✗ Not Enabled'}
            </span>
          </div>
        </div>

        <button
          onClick={resetScan}
          className="mt-4 w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Scan Another Website
        </button>
      </div>
    );
  };

  return (
    <div className={`scan-form ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col shadow-2xl rounded-2xl overflow-hidden border-2 border-white/30">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 sm:h-5 sm:w-5 text-white/60" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter website URL (e.g., https://example.com)"
                className="flex-grow w-full px-4 py-4 sm:px-5 sm:py-5 pl-10 sm:pl-12 bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-300 font-medium border-0 text-sm sm:text-base min-h-[52px] sm:min-h-[60px] touch-manipulation"
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className={`px-6 py-4 sm:px-8 sm:py-5 text-white font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] min-h-[52px] sm:min-h-[60px] touch-manipulation ${
                loading
                  ? "bg-blue-500 cursor-wait"
                  : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg hover:shadow-xl"
              } focus:outline-none focus:ring-4 focus:ring-blue-400/50 disabled:opacity-50`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white"
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
                  <span>Analyzing...</span>
                </div>
              ) : (
                <span className="flex items-center">
                  <FaSearch className="mr-2" /> Quick SEO Scan
                </span>
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/90 backdrop-blur-sm border-2 border-red-300 p-4 rounded-xl text-white text-sm font-medium shadow-lg">
              <p>{error}</p>
            </div>
          )}

          {renderResults()}

          {!result && (
            <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl border-2 border-white/40">
              <div className="text-center text-gray-700">
                <p className="font-medium">✅ Free Quick SEO Analysis</p>
                <p className="text-sm mt-1">Get instant insights on title, meta description, headings, and HTTPS status</p>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default ScanForm;
