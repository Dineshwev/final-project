// src/components/ScanForm.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from ".//Icons";
import apiService from "../services/api.js";

interface ScanFormProps {
  className?: string;
}

const ScanForm: React.FC<ScanFormProps> = ({ className = "" }) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState({
    deepCrawl: false,
    includeSecurity: true,
    includeBacklinks: false,
  });
  const navigate = useNavigate();

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

    try {
      const response = await apiService.scanWebsite(url, options);

      if (response.success) {
        // Navigate to results page with the scan ID
        navigate(`/results/${response.data.scanId}`);
      } else {
        setError("Failed to scan website. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
      console.error("Scan error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setOptions((prevOptions) => ({
      ...prevOptions,
      [name]: checked,
    }));
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
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-4 sm:px-8 sm:py-5 text-white font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] min-h-[52px] sm:min-h-[60px] touch-manipulation ${
                loading
                  ? "bg-blue-500 cursor-wait"
                  : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg hover:shadow-xl"
              } focus:outline-none focus:ring-4 focus:ring-blue-400/50`}
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
                  <FaSearch className="mr-2" /> Analyze Website
                </span>
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/90 backdrop-blur-sm border-2 border-red-300 p-4 rounded-xl text-white text-sm font-medium shadow-lg">
              <p>{error}</p>
            </div>
          )}

          <div className="bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-xl border-2 border-white/40 flex flex-wrap gap-6">
            <label className="inline-flex items-center group cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  name="deepCrawl"
                  checked={options.deepCrawl}
                  onChange={handleOptionChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-10 rounded transition-opacity duration-200"></div>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-800 group-hover:text-blue-700 transition-colors duration-200">
                Deep crawl (analyzes multiple pages)
              </span>
            </label>

            <label className="inline-flex items-center group cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  name="includeSecurity"
                  checked={options.includeSecurity}
                  onChange={handleOptionChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-10 rounded transition-opacity duration-200"></div>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-800 group-hover:text-blue-700 transition-colors duration-200">
                Security analysis
              </span>
            </label>

            <label className="inline-flex items-center group cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  name="includeBacklinks"
                  checked={options.includeBacklinks}
                  onChange={handleOptionChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-10 rounded transition-opacity duration-200"></div>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-800 group-hover:text-blue-700 transition-colors duration-200">
                Backlink analysis
              </span>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ScanForm;
