import React, { useState } from "react";
import { Link } from "react-router-dom";
import useScanResults from "../hooks/useScanResults";
import apiService from "../services/api";
const LinkChecker: React.FC = () => {
  const { scanResults, serviceData, hasServiceData, serviceStatus, loading, error: scanError } = useScanResults({ serviceName: 'backlinks' });
  const [url, setUrl] = useState("");
  const [filter, setFilter] = useState<
    "all" | "broken" | "redirects" | "images"
  >("all");
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeResults, setAnalyzeResults] = useState<any>(null);

  // Get link checker data from scan results or analyze results
  const linkCheckerData = serviceData || analyzeResults;
  const hasLinkData = hasServiceData || !!analyzeResults;

  // Set error from scan service
  React.useEffect(() => {
    if (scanError) {
      setError(scanError);
    } else if (!hasLinkData && !loading) {
      setError(serviceStatus);
    } else {
      setError(null);
    }
  }, [scanError, hasLinkData, loading, serviceStatus]);

  const analyzeLinkChecker = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }
    
    setAnalyzing(true);
    setError(null);
    
    try {
      const response = await apiService.analyzeLinkChecker(url);
      if (response.success) {
        setAnalyzeResults(response.data);
      } else {
        setError(response.error || 'Link analysis failed');
      }
    } catch (err: any) {
      setError(err.message || 'Link analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const filtered = React.useMemo(() => {
    if (!linkCheckerData || !linkCheckerData.links) return [];
    const list = linkCheckerData.links || [];
    if (filter === "broken")
      return list.filter((r: any) => r.status >= 400 && r.status < 600);
    if (filter === "redirects")
      return list.filter((r: any) => (r.chainLength || 0) > 0);
    if (filter === "images")
      return list.filter((r: any) => r.type === "image");
    return list;
  }, [filter, linkCheckerData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h1 className="text-2xl font-bold mb-3">Link Checker</h1>
          
          {scanResults && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Showing results from scan: <strong>{scanResults.url}</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                <Link to="/dashboard/new-scan" className="underline">Click here to run a new scan</Link>
              </p>
            </div>
          )}
          
          {!hasLinkData && (
            <form onSubmit={(e) => { e.preventDefault(); analyzeLinkChecker(); }} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={analyzing}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                >
                  {analyzing ? 'Analyzing...' : 'Analyze Links'}
                </button>
              </div>
            </form>
          )}
        </div>

        {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
        {loading && (
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading scan results...</span>
            </div>
          </div>
        )}
        
        {linkCheckerData && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow flex gap-3 items-center">
              <div>
                Total: <b>{linkCheckerData.summary?.total || 0}</b>
              </div>
              <div>
                Broken: <b className="text-red-600">{linkCheckerData.summary?.broken || 0}</b>
              </div>
              <div>
                Redirects: <b>{linkCheckerData.summary?.redirects || 0}</b>
              </div>
              <div>
                Images broken:{" "}
                <b className="text-red-600">{linkCheckerData.summary?.imagesBroken || 0}</b>
              </div>
              <div>
                Orphaned pages: <b>{linkCheckerData.summary?.orphanedPages || 0}</b>
              </div>
              <div className="ml-auto flex gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-3 py-2 border rounded"
                >
                  <option value="all">All</option>
                  <option value="broken">Broken</option>
                  <option value="redirects">Redirect chains</option>
                  <option value="images">Images</option>
                </select>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2">URL</th>
                    <th className="text-left px-4 py-2">Final URL</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-left px-4 py-2">Type</th>
                    <th className="text-left px-4 py-2">Redirects</th>
                    <th className="text-left px-4 py-2">Fix Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-4 text-center text-sm text-gray-500"
                      >
                        No matching link data found.
                      </td>
                    </tr>
                  )}
                  {filtered.map((r: any, idx: number) => (
                    <tr key={idx} className="border-t">
                      <td className="px-4 py-2 text-sm break-all">{r.url}</td>
                      <td className="px-4 py-2 text-sm break-all">
                        {r.finalUrl || r.url}
                      </td>
                      <td className="px-4 py-2 text-sm">{r.status}</td>
                      <td className="px-4 py-2 text-sm">{r.type || 'link'}</td>
                      <td className="px-4 py-2 text-sm">{r.chainLength || 0}</td>
                      <td className="px-4 py-2 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-white ${
                            (r.priority || 0) >= 80
                              ? "bg-red-600"
                              : (r.priority || 0) >= 50
                              ? "bg-yellow-600"
                              : "bg-emerald-600"
                          }`}
                        >
                          {r.priority || 'Low'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkChecker;