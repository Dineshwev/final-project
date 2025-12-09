import React, { useState, useEffect } from "react";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "https://irpwi5mww.ap-southeast-2.awsapprunner.com/api";

const LinkChecker: React.FC = () => {
  const [url, setUrl] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<
    "idle" | "running" | "completed" | "error"
  >("idle");
  const [savedId, setSavedId] = useState<number | null>(null);
  const [results, setResults] = useState<any | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "all" | "broken" | "redirects" | "images"
  >("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let t: any;
    if (jobId && status === "running") {
      t = setInterval(async () => {
        try {
          const res = await fetch(
            `${API_BASE}/link-checker/jobs/${jobId}/status`
          );
          const ct = res.headers.get("content-type") || "";
          if (!ct.includes("application/json")) return; // ignore HTML
          const json = await res.json();
          if (json.status === "ok") {
            setProgress(json.job.progress);
            setStatus(json.job.status);
            if (json.job.status === "error" && json.job.error)
              setError(json.job.error);
            if (json.job.warning) setWarning(json.job.warning);
            if (json.job.savedId) setSavedId(json.job.savedId);
          }
        } catch {}
      }, 1000);
    }
    return () => {
      if (t) clearInterval(t);
    };
  }, [jobId, status]);

  useEffect(() => {
    const load = async () => {
      if (status === "completed" && savedId) {
        try {
          const res = await fetch(`${API_BASE}/link-checker/${savedId}`);
          const ct = res.headers.get("content-type") || "";
          if (!ct.includes("application/json")) return;
          const json = await res.json();
          if (json.status === "success") setResults(json.data);
        } catch {}
      }
    };
    load();
  }, [status, savedId]);

  // Advanced options (shallow crawl & headless)
  const [depth, setDepth] = useState(0);
  const [maxPages, setMaxPages] = useState(5);
  const [headless, setHeadless] = useState(false);
  // Extended advanced controls
  const [userAgent, setUserAgent] = useState<string>("");
  const [cookieHeader, setCookieHeader] = useState<string>("");
  const [customHeaders, setCustomHeaders] = useState<string>("");
  const [proxy, setProxy] = useState<string>("");
  const [respectRobots, setRespectRobots] = useState<boolean>(false);
  const [useStealth, setUseStealth] = useState<boolean>(false);
  const [maxRetries, setMaxRetries] = useState<number>(2);
  const [timeoutMs, setTimeoutMs] = useState<number>(15000);

  const start = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResults(null);
    setWarning(null);
    try {
      const headersObj = customHeaders
        ? (() => {
            try {
              return JSON.parse(customHeaders);
            } catch {
              return undefined;
            }
          })()
        : undefined;
      const res = await fetch(`${API_BASE}/link-checker`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          depth,
          maxPages,
          headless,
          userAgent: userAgent || undefined,
          cookieHeader: cookieHeader || undefined,
          headers: headersObj,
          proxy: proxy || undefined,
          respectRobots,
          useStealth,
          maxRetries,
          timeoutMs,
        }),
      });
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const text = await res.text();
        throw new Error(
          `Unexpected response (not JSON): ${text.substring(0, 100)}...`
        );
      }
      const json = await res.json();
      if (json.status !== "accepted")
        throw new Error(json.message || "Failed to start");
      setJobId(json.jobId);
      setStatus("running");
      setProgress(0);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const filtered = React.useMemo(() => {
    if (!results) return [];
    const list = results.results || [];
    if (filter === "broken")
      return list.filter(
        (r: any) => r.status === 404 || r.status >= 500 || r.status === 0
      );
    if (filter === "redirects")
      return list.filter((r: any) => r.chainLength > 1);
    if (filter === "images") return list.filter((r: any) => r.type === "image");
    return list;
  }, [results, filter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h1 className="text-2xl font-bold mb-3">Broken Link Checker</h1>
          <form onSubmit={start} className="space-y-4">
            <div className="flex gap-3">
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-4 py-3 rounded-lg border"
              />
              <button className="px-5 py-3 rounded-lg bg-emerald-600 text-white font-semibold">
                Scan
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <label className="flex flex-col">
                <span className="font-medium mb-1">Depth</span>
                <input
                  type="number"
                  min={0}
                  max={2}
                  value={depth}
                  onChange={(e) => setDepth(parseInt(e.target.value) || 0)}
                  className="px-3 py-2 rounded border"
                />
              </label>
              <label className="flex flex-col">
                <span className="font-medium mb-1">Max Pages</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={maxPages}
                  onChange={(e) => setMaxPages(parseInt(e.target.value) || 5)}
                  className="px-3 py-2 rounded border"
                />
              </label>
              <label className="flex items-center gap-2 mt-6 md:mt-0">
                <input
                  type="checkbox"
                  checked={headless}
                  onChange={(e) => setHeadless(e.target.checked)}
                />{" "}
                <span>Headless (JS render)</span>
              </label>
            </div>
            <details className="bg-gray-50 rounded p-3 text-sm">
              <summary className="cursor-pointer font-medium">
                Advanced Options
              </summary>
              <div className="mt-3 grid md:grid-cols-2 gap-4">
                <label className="flex flex-col">
                  <span className="mb-1">User-Agent</span>
                  <input
                    className="px-3 py-2 rounded border"
                    value={userAgent}
                    onChange={(e) => setUserAgent(e.target.value)}
                    placeholder="Custom UA"
                  />
                </label>
                <label className="flex flex-col">
                  <span className="mb-1">
                    Proxy (http(s)://user:pass@host:port)
                  </span>
                  <input
                    className="px-3 py-2 rounded border"
                    value={proxy}
                    onChange={(e) => setProxy(e.target.value)}
                    placeholder="http://127.0.0.1:8080"
                  />
                </label>
                <label className="flex flex-col">
                  <span className="mb-1">Cookie header</span>
                  <input
                    className="px-3 py-2 rounded border"
                    value={cookieHeader}
                    onChange={(e) => setCookieHeader(e.target.value)}
                    placeholder="key=value; key2=value2"
                  />
                </label>
                <label className="flex flex-col">
                  <span className="mb-1">Custom headers (JSON)</span>
                  <textarea
                    className="px-3 py-2 rounded border h-20"
                    value={customHeaders}
                    onChange={(e) => setCustomHeaders(e.target.value)}
                    placeholder='{"Accept-Language":"en-US"}'
                  />
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={respectRobots}
                    onChange={(e) => setRespectRobots(e.target.checked)}
                  />
                  <span>Respect robots.txt</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={useStealth}
                    onChange={(e) => setUseStealth(e.target.checked)}
                  />
                  <span>Stealth (reduce detection)</span>
                </label>
                <label className="flex flex-col">
                  <span className="mb-1">Max Retries</span>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={maxRetries}
                    onChange={(e) =>
                      setMaxRetries(parseInt(e.target.value) || 0)
                    }
                    className="px-3 py-2 rounded border"
                  />
                </label>
                <label className="flex flex-col">
                  <span className="mb-1">Timeout (ms)</span>
                  <input
                    type="number"
                    min={1000}
                    max={60000}
                    value={timeoutMs}
                    onChange={(e) =>
                      setTimeoutMs(parseInt(e.target.value) || 15000)
                    }
                    className="px-3 py-2 rounded border"
                  />
                </label>
              </div>
            </details>
          </form>
          {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
          {status !== "idle" && (
            <div className="mt-4">
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Status: {status} • {progress}%
              </div>
            </div>
          )}
        </div>

        {warning && !results && (
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm rounded-lg p-3">
            {warning}
          </div>
        )}
        {results && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow flex gap-3 items-center">
              <div>
                Total: <b>{results.summary.total}</b>
              </div>
              <div>
                Broken: <b className="text-red-600">{results.summary.broken}</b>
              </div>
              <div>
                Redirects: <b>{results.summary.redirects}</b>
              </div>
              <div>
                Images broken:{" "}
                <b className="text-red-600">{results.summary.imagesBroken}</b>
              </div>
              <div>
                Orphaned pages: <b>{results.summary.orphanedPages}</b>
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
                        {status === "completed"
                          ? "No results (site may have blocked the scan)."
                          : "No matching entries yet."}
                      </td>
                    </tr>
                  )}
                  {filtered.map((r: any, idx: number) => (
                    <tr key={idx} className="border-t">
                      <td className="px-4 py-2 text-sm break-all">{r.url}</td>
                      <td className="px-4 py-2 text-sm break-all">
                        {r.finalUrl}
                      </td>
                      <td className="px-4 py-2 text-sm">{r.status}</td>
                      <td className="px-4 py-2 text-sm">{r.type}</td>
                      <td className="px-4 py-2 text-sm">{r.chainLength}</td>
                      <td className="px-4 py-2 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-white ${
                            r.priority >= 80
                              ? "bg-red-600"
                              : r.priority >= 50
                              ? "bg-yellow-600"
                              : "bg-emerald-600"
                          }`}
                        >
                          {r.priority}
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
