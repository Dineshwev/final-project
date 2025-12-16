import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp,
  CheckCircle,
  Download,
  ExternalLink,
  Search,
  Info,
  BarChart3,
  Target,
} from "lucide-react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface KeywordRow {
  id: number;
  keyword: string;
  url: string;
  last_position: number | null;
  updated_at: string | null;
}

interface HistoryRow {
  id: number;
  keyword_id: number;
  position: number | null;
  fetched_at: string;
}

interface AlertRow {
  id: number;
  keyword_id: number;
  keyword: string;
  url: string;
  old_position: number | null;
  new_position: number | null;
  delta: number;
  created_at: string;
}

const RankTracker: React.FC = () => {
  const [url, setUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [showResults, setShowResults] = useState(false);
  
  // Additional state for rank tracking functionality
  const [keywords, setKeywords] = useState<KeywordRow[]>([]);
  const [kwTotal, setKwTotal] = useState(0);
  const [kwPage, setKwPage] = useState(1);
  const [kwPageSize, setKwPageSize] = useState(20);
  const [kwSearch, setKwSearch] = useState('');
  const [selected, setSelected] = useState<KeywordRow | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [histTotal, setHistTotal] = useState(0);
  const [histPage, setHistPage] = useState(1);
  const [histPageSize, setHistPageSize] = useState(50);
  const [histFrom, setHistFrom] = useState('');
  const [histTo, setHistTo] = useState('');
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResults, setScanResults] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleScanComplete = (result: any) => {
    setShowResults(true);
    setScanResults(result);
  };

  const handleScanError = (error: any) => {
    console.error('Rank tracking scan failed:', error);
    setScanError(error.message || 'Scan failed');
  };

  // Get rank tracker data from scan results
  const serviceData = scanResults?.services?.rankTracker;
  const hasServiceData = Boolean(serviceData);
  const rankTrackerData = serviceData;
  const hasRankData = hasServiceData;

  const loadKeywords = useCallback(async (page = kwPage) => {
    try {
      if (hasRankData && rankTrackerData) {
        return;
      }
      setError("Rank tracking feature is coming soon!");
      setLoading(false);
      return;
    } catch {
      // Handle error
    }
  }, [kwPageSize, kwSearch, kwPage, hasRankData, rankTrackerData]);

  async function loadAlerts() {
    try {
      setAlerts([]);
      return;
    } catch {
      // Handle error
    }
  }

  const loadHistory = useCallback(async (id: number, page = histPage) => {
    try {
      setHistory([]);
      setHistTotal(0);
      return;
    } catch {
      // Handle error
    }
  }, [histPageSize, histFrom, histTo, histPage]);

  useEffect(() => { 
    loadKeywords(); 
    loadAlerts(); 
  }, [loadKeywords]);

  useEffect(() => { 
    if (selected) { 
      setHistPage(1); 
      loadHistory(selected.id, 1); 
    } 
  }, [selected, loadHistory]);

  useEffect(() => { 
    loadKeywords(kwPage); 
  }, [kwPage, loadKeywords]);

  async function add(e: React.FormEvent) {
    e.preventDefault(); 
    setError(null); 
    setLoading(true);
    try {
      setError("Add keyword feature is coming soon!");
    } catch (e: any) { 
      setError(e.message); 
    } finally { 
      setLoading(false); 
    }
  }

  async function refreshOne(id: number) {
    setError("Refresh feature is coming soon!");
  }

  async function refreshAll() {
    setError("Refresh all feature is coming soon!");
  }

  async function exportAlertsCsv() {
    alert("Export alerts feature is coming soon!");
  }

  async function exportHistoryCsv() {
    if (!selected) return;
    alert("Export history feature is coming soon!");
  }

  async function remove(id: number) {
    alert("Remove keyword feature is coming soon!");
  }

  const chartData = useMemo(() => {
    return history.slice().reverse().map(h => ({ 
      date: new Date(h.fetched_at).toLocaleDateString(), 
      position: h.position == null ? 100 : h.position 
    }));
  }, [history]);

  // If we have rank tracker data from scan results, show it
  if (hasRankData && rankTrackerData) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 py-10 px-4'>
        <div className='max-w-7xl mx-auto space-y-8'>
          <div className='bg-white p-6 rounded-2xl shadow'>
            <h1 className='text-2xl font-bold mb-4'>Rank Tracker Analysis</h1>
            <p className='text-gray-600 mb-6'>
              Rank tracking results for: <span className='font-semibold'>{scanResults?.url || url}</span>
            </p>
            
            {scanError && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-4'>
                <p className='text-red-700'>Error loading scan results: {scanError}</p>
              </div>
            )}

            <div className='space-y-6'>
              {/* Rankings Display */}
              <div className='bg-gray-50 p-4 rounded-lg'>
                <h3 className='text-lg font-semibold mb-4'>Current Rankings</h3>
                {Array.isArray(rankTrackerData.rankings) && rankTrackerData.rankings.length > 0 ? (
                  <div className='space-y-3'>
                    {rankTrackerData.rankings.map((ranking: any, index: number) => (
                      <div key={index} className='bg-white p-4 rounded-lg border'>
                        <div className='grid md:grid-cols-4 gap-4 items-center'>
                          <div>
                            <span className='text-sm text-gray-500'>Keyword:</span>
                            <div className='font-semibold'>{ranking.keyword}</div>
                          </div>
                          <div>
                            <span className='text-sm text-gray-500'>Position:</span>
                            <div className='text-lg font-bold text-indigo-600'>#{ranking.position}</div>
                          </div>
                          <div>
                            <span className='text-sm text-gray-500'>Search Engine:</span>
                            <div>{ranking.searchEngine || 'Google'}</div>
                          </div>
                          {ranking.url && (
                            <div>
                              <span className='text-sm text-gray-500'>Page:</span>
                              <div className='text-xs break-all'>{ranking.url}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-8 text-gray-500'>
                    <p>No ranking data available</p>
                  </div>
                )}
              </div>

              {/* Summary Stats */}
              {rankTrackerData.summary && (
                <div className='bg-gray-50 p-4 rounded-lg'>
                  <h3 className='text-lg font-semibold mb-4'>Summary Statistics</h3>
                  <div className='grid md:grid-cols-2 gap-4'>
                    {rankTrackerData.summary.totalKeywords && (
                      <div className='bg-white p-4 rounded-lg text-center'>
                        <div className='text-2xl font-bold text-indigo-600'>{rankTrackerData.summary.totalKeywords}</div>
                        <div className='text-sm text-gray-600'>Total Keywords</div>
                      </div>
                    )}
                    {rankTrackerData.summary.averagePosition && (
                      <div className='bg-white p-4 rounded-lg text-center'>
                        <div className='text-2xl font-bold text-green-600'>#{rankTrackerData.summary.averagePosition}</div>
                        <div className='text-sm text-gray-600'>Average Position</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className='flex justify-center'>
                <Link to="/results" className='px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors'>
                  Back to All Results
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full mb-6">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Keyword Rank Tracker
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Track your website's search engine rankings for target keywords
          </p>
        </motion.div>

        {/* Feature scan section removed - now using /features/rank-tracker route */}
        
        {/* Additional Rank Tracking Interface */}
        <div className='max-w-7xl mx-auto space-y-8 mt-8'>
          <div className='bg-white p-6 rounded-2xl shadow'>
            <h2 className='text-2xl font-bold mb-4'>Manual Rank Tracking</h2>
            <form onSubmit={add} className='grid md:grid-cols-3 gap-3'>
              <input 
                required 
                type='url' 
                value={url} 
                onChange={e => setUrl(e.target.value)} 
                placeholder='https://example.com/page' 
                className='px-4 py-3 rounded-lg border'
              />
              <input 
                required 
                value={keyword} 
                onChange={e => setKeyword(e.target.value)} 
                placeholder='target keyword' 
                className='px-4 py-3 rounded-lg border'
              />
              <button 
                disabled={loading} 
                className='px-5 py-3 rounded-lg bg-indigo-600 text-white font-semibold'
              >
                {loading ? 'Adding...' : 'Add Keyword'}
              </button>
            </form>
            {error && <div className='text-sm text-red-600 mt-2'>{error}</div>}
            <div className='flex flex-wrap gap-3 mt-4 items-center'>
              <button onClick={refreshAll} className='px-4 py-2 rounded bg-sky-600 text-white text-sm'>Refresh All</button>
              <input 
                value={kwSearch} 
                onChange={e => { setKwSearch(e.target.value); setKwPage(1); }} 
                placeholder='Search keywords/url' 
                className='px-3 py-2 border rounded text-sm'
              />
              <select 
                value={kwPageSize} 
                onChange={e => { setKwPageSize(parseInt(e.target.value)); setKwPage(1); }} 
                className='px-3 py-2 border rounded text-sm'
              >
                {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/page</option>)}
              </select>
              <div className='text-xs text-gray-600'>Total: {kwTotal}</div>
              <div className='flex gap-2'>
                <button 
                  disabled={kwPage === 1} 
                  onClick={() => setKwPage(p => Math.max(1, p - 1))} 
                  className='px-2 py-1 border rounded text-xs'
                >
                  Prev
                </button>
                <button 
                  disabled={(kwPage * kwPageSize) >= kwTotal} 
                  onClick={() => setKwPage(p => p + 1)} 
                  className='px-2 py-1 border rounded text-xs'
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className='grid lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-2 space-y-6'>
              <div className='bg-white p-4 rounded-xl shadow'>
                <h2 className='font-semibold mb-2'>Keywords</h2>
                <div className='overflow-x-auto'>
                  <table className='min-w-full text-sm'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='text-left px-3 py-2'>Keyword</th>
                        <th className='text-left px-3 py-2'>URL</th>
                        <th className='text-left px-3 py-2'>Last Pos</th>
                        <th className='text-left px-3 py-2'>Updated</th>
                        <th className='text-left px-3 py-2'>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {keywords.map(k => (
                        <tr key={k.id} className='border-t hover:bg-gray-50'>
                          <td className='px-3 py-2'>{k.keyword}</td>
                          <td className='px-3 py-2 max-w-xs break-all'>{k.url}</td>
                          <td className='px-3 py-2'>{k.last_position == null ? '—' : k.last_position}</td>
                          <td className='px-3 py-2 text-xs'>{k.updated_at ? new Date(k.updated_at).toLocaleString() : '—'}</td>
                          <td className='px-3 py-2 flex gap-2'>
                            <button onClick={() => setSelected(k)} className='px-2 py-1 rounded bg-indigo-600 text-white'>Chart</button>
                            <button onClick={() => refreshOne(k.id)} className='px-2 py-1 rounded bg-sky-600 text-white'>Refresh</button>
                            <button onClick={() => remove(k.id)} className='px-2 py-1 rounded bg-red-600 text-white'>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {selected && (
                <div className='bg-white p-4 rounded-xl shadow'>
                  <h2 className='font-semibold mb-2'>History: {selected.keyword}</h2>
                  <div className='flex flex-wrap gap-3 mb-3 items-center'>
                    <label className='text-xs flex items-center gap-1'>
                      From <input type='date' value={histFrom} onChange={e => { setHistFrom(e.target.value); }} className='border px-2 py-1 rounded' />
                    </label>
                    <label className='text-xs flex items-center gap-1'>
                      To <input type='date' value={histTo} onChange={e => { setHistTo(e.target.value); }} className='border px-2 py-1 rounded' />
                    </label>
                    <select 
                      value={histPageSize} 
                      onChange={e => { setHistPageSize(parseInt(e.target.value)); setHistPage(1); }} 
                      className='px-2 py-1 border rounded text-xs'
                    >
                      {[20, 50, 100, 200].map(n => <option key={n} value={n}>{n}/page</option>)}
                    </select>
                    <div className='flex gap-2'>
                      <button 
                        disabled={histPage === 1} 
                        onClick={() => { const np = Math.max(1, histPage - 1); setHistPage(np); loadHistory(selected.id, np); }} 
                        className='px-2 py-1 border rounded text-xs'
                      >
                        Prev
                      </button>
                      <button 
                        disabled={(histPage * histPageSize) >= histTotal} 
                        onClick={() => { const np = histPage + 1; setHistPage(np); loadHistory(selected.id, np); }} 
                        className='px-2 py-1 border rounded text-xs'
                      >
                        Next
                      </button>
                    </div>
                    <button onClick={exportHistoryCsv} className='px-3 py-1 rounded bg-green-600 text-white text-xs'>Export CSV</button>
                  </div>
                  {chartData.length === 0 && <div className='text-sm text-gray-500'>No history yet.</div>}
                  {chartData.length > 0 && (
                    <ResponsiveContainer width='100%' height={300}>
                      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <Line type='monotone' dataKey='position' stroke='#6366f1' strokeWidth={2} />
                        <CartesianGrid stroke='#eee' strokeDasharray='5 5' />
                        <XAxis dataKey='date' />
                        <YAxis reversed domain={[0, 'dataMax+5']} allowDecimals={false} />
                        <Tooltip />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              )}
            </div>
            <div className='space-y-6'>
              <div className='bg-white p-4 rounded-xl shadow'>
                <h2 className='font-semibold mb-2'>Alerts</h2>
                <div className='flex gap-2 mb-2'>
                  <button onClick={exportAlertsCsv} className='px-3 py-1 rounded bg-green-600 text-white text-xs'>Export CSV</button>
                </div>
                {alerts.length === 0 && <div className='text-sm text-gray-500'>No alerts.</div>}
                <ul className='space-y-2 text-sm'>
                  {alerts.map(a => (
                    <li key={a.id} className='border rounded p-2 flex flex-col'>
                      <div className='font-medium'>{a.keyword}</div>
                      <div className='text-xs break-all'>{a.url}</div>
                      <div className='text-xs'>Old: {a.old_position ?? '—'} → New: {a.new_position ?? '—'} ({a.delta > 0 ? '+' + a.delta : a.delta})</div>
                      <div className='text-xs text-gray-500'>{new Date(a.created_at).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankTracker;
