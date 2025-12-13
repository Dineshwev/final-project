import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://bc-worker-env.eba-k8rrjwx.ap-southeast-2.elasticbeanstalk.com/api';

interface KeywordRow { id:number; url:string; keyword:string; last_position:number|null; created_at:string; updated_at:string; }
interface HistoryRow { id:number; keyword_id:number; position:number|null; fetched_at:string; }
interface AlertRow { id:number; keyword_id:number; old_position:number|null; new_position:number|null; delta:number; created_at:string; keyword:string; url:string; }

const RankTracker: React.FC = () => {
  const [url,setUrl] = useState('');
  const [keyword,setKeyword] = useState('');
  const [keywords,setKeywords] = useState<KeywordRow[]>([]);
  const [kwTotal,setKwTotal] = useState(0);
  const [kwPage,setKwPage] = useState(1);
  const [kwPageSize,setKwPageSize] = useState(20);
  const [kwSearch,setKwSearch] = useState('');
  const [selected,setSelected] = useState<KeywordRow|null>(null);
  const [history,setHistory] = useState<HistoryRow[]>([]);
  const [histTotal,setHistTotal] = useState(0);
  const [histPage,setHistPage] = useState(1);
  const [histPageSize,setHistPageSize] = useState(50);
  const [histFrom,setHistFrom] = useState(''); // YYYY-MM-DD
  const [histTo,setHistTo] = useState('');
  const [alerts,setAlerts] = useState<AlertRow[]>([]);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState<string|null>(null);

  const loadKeywords = useCallback(async (page=kwPage) => {
    try {
      const params = new URLSearchParams({ page:String(page), pageSize:String(kwPageSize) });
      if (kwSearch.trim()) params.set('search', kwSearch.trim());
      const res = await fetch(`${API_BASE}/rank-tracker?${params.toString()}`);
      const ct = res.headers.get('content-type')||''; if (!ct.includes('application/json')) return;
      const json = await res.json(); if (json.status==='success') { setKeywords(json.items||json.data||[]); setKwTotal(json.total||0); setKwPage(json.page||page); }
    } catch {}
  }, [kwPageSize, kwSearch, kwPage]);
  async function loadAlerts() {
    try {
      const res = await fetch(`${API_BASE}/rank-tracker/alerts/list`);
      const ct = res.headers.get('content-type')||''; if (!ct.includes('application/json')) return;
      const json = await res.json(); if (json.status==='success') setAlerts(json.data);
    } catch {}
  }
  const loadHistory = useCallback(async (id:number, page=histPage) => {
    try {
      const params = new URLSearchParams({ page:String(page), pageSize:String(histPageSize) });
      if (histFrom) params.set('from', histFrom);
      if (histTo) params.set('to', histTo);
      const res = await fetch(`${API_BASE}/rank-tracker/${id}/history?${params.toString()}`);
      const ct = res.headers.get('content-type')||''; if (!ct.includes('application/json')) return;
      const json = await res.json(); if (json.status==='success') { setHistory(json.items||json.data||[]); setHistTotal(json.total||0); setHistPage(json.page||page); }
    } catch {}
  }, [histPageSize, histFrom, histTo, histPage]);

  useEffect(()=>{ loadKeywords(); loadAlerts(); },[loadKeywords]);
  useEffect(()=>{ if (selected) { setHistPage(1); loadHistory(selected.id,1); } },[selected, loadHistory]);
  useEffect(()=>{ loadKeywords(kwPage); },[kwPage, loadKeywords]);

  async function add(e:React.FormEvent) {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/rank-tracker`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ url, keyword }) });
      const json = await res.json(); if (json.status==='success') { setUrl(''); setKeyword(''); loadKeywords(); }
      else throw new Error(json.message||'Add failed');
    } catch (e:any) { setError(e.message); } finally { setLoading(false); }
  }

  async function refreshOne(id:number) {
    await fetch(`${API_BASE}/rank-tracker/refresh/${id}`, { method:'POST' });
    loadKeywords(); if (selected && selected.id===id) loadHistory(id); loadAlerts();
  }

  async function refreshAll() {
    await fetch(`${API_BASE}/rank-tracker/refresh-all`, { method:'POST' });
    loadKeywords(kwPage); if (selected) loadHistory(selected.id, histPage); loadAlerts();
  }
  async function exportAlertsCsv() {
    try {
      const res = await fetch(`${API_BASE}/rank-tracker/alerts/export.csv`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'rank-alerts.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch {}
  }
  async function exportHistoryCsv() {
    if (!selected) return;
    try {
      const params = new URLSearchParams();
      if (histFrom) params.set('from', histFrom);
      if (histTo) params.set('to', histTo);
      const res = await fetch(`${API_BASE}/rank-tracker/${selected.id}/history/export.csv?${params.toString()}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `rank-history-${selected.id}.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch {}
  }

  async function remove(id:number) {
    await fetch(`${API_BASE}/rank-tracker/${id}`, { method:'DELETE' });
    if (selected && selected.id===id) { setSelected(null); setHistory([]); }
    loadKeywords();
  }

  const chartData = useMemo(()=>{
    return history.slice().reverse().map(h => ({ date: new Date(h.fetched_at).toLocaleDateString(), position: h.position==null? 100: h.position }));
  },[history]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 py-10 px-4'>
      <div className='max-w-7xl mx-auto space-y-8'>
        <div className='bg-white p-6 rounded-2xl shadow'>
          <h1 className='text-2xl font-bold mb-4'>Rank Tracker</h1>
          <form onSubmit={add} className='grid md:grid-cols-3 gap-3'>
            <input required type='url' value={url} onChange={e=>setUrl(e.target.value)} placeholder='https://example.com/page' className='px-4 py-3 rounded-lg border'/>
            <input required value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder='target keyword' className='px-4 py-3 rounded-lg border'/>
            <button disabled={loading} className='px-5 py-3 rounded-lg bg-indigo-600 text-white font-semibold'>{loading? 'Adding...':'Add Keyword'}</button>
          </form>
          {error && <div className='text-sm text-red-600 mt-2'>{error}</div>}
          <div className='flex flex-wrap gap-3 mt-4 items-center'>
            <button onClick={refreshAll} className='px-4 py-2 rounded bg-sky-600 text-white text-sm'>Refresh All</button>
            <input value={kwSearch} onChange={e=>{ setKwSearch(e.target.value); setKwPage(1); }} placeholder='Search keywords/url' className='px-3 py-2 border rounded text-sm'/>
            <select value={kwPageSize} onChange={e=>{ setKwPageSize(parseInt(e.target.value)); setKwPage(1); }} className='px-3 py-2 border rounded text-sm'>
              {[10,20,50,100].map(n=> <option key={n} value={n}>{n}/page</option>)}
            </select>
            <div className='text-xs text-gray-600'>Total: {kwTotal}</div>
            <div className='flex gap-2'>
              <button disabled={kwPage===1} onClick={()=>setKwPage(p=>Math.max(1,p-1))} className='px-2 py-1 border rounded text-xs'>Prev</button>
              <button disabled={(kwPage*kwPageSize)>=kwTotal} onClick={()=>setKwPage(p=>p+1)} className='px-2 py-1 border rounded text-xs'>Next</button>
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
                        <td className='px-3 py-2'>{k.last_position==null? '—': k.last_position}</td>
                        <td className='px-3 py-2 text-xs'>{k.updated_at? new Date(k.updated_at).toLocaleString(): '—'}</td>
                        <td className='px-3 py-2 flex gap-2'>
                          <button onClick={()=>setSelected(k)} className='px-2 py-1 rounded bg-indigo-600 text-white'>Chart</button>
                          <button onClick={()=>refreshOne(k.id)} className='px-2 py-1 rounded bg-sky-600 text-white'>Refresh</button>
                          <button onClick={()=>remove(k.id)} className='px-2 py-1 rounded bg-red-600 text-white'>Delete</button>
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
                  <label className='text-xs flex items-center gap-1'>From <input type='date' value={histFrom} onChange={e=>{ setHistFrom(e.target.value); }} className='border px-2 py-1 rounded'/></label>
                  <label className='text-xs flex items-center gap-1'>To <input type='date' value={histTo} onChange={e=>{ setHistTo(e.target.value); }} className='border px-2 py-1 rounded'/></label>
                  <select value={histPageSize} onChange={e=>{ setHistPageSize(parseInt(e.target.value)); setHistPage(1); }} className='px-2 py-1 border rounded text-xs'>
                    {[20,50,100,200].map(n=> <option key={n} value={n}>{n}/page</option>)}
                  </select>
                  <div className='flex gap-2'>
                    <button disabled={histPage===1} onClick={()=>{ const np = Math.max(1,histPage-1); setHistPage(np); loadHistory(selected.id, np); }} className='px-2 py-1 border rounded text-xs'>Prev</button>
                    <button disabled={(histPage*histPageSize)>=histTotal} onClick={()=>{ const np = histPage+1; setHistPage(np); loadHistory(selected.id, np); }} className='px-2 py-1 border rounded text-xs'>Next</button>
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
                    <div className='text-xs'>Old: {a.old_position ?? '—'} → New: {a.new_position ?? '—'} ({a.delta>0? '+'+a.delta: a.delta})</div>
                    <div className='text-xs text-gray-500'>{new Date(a.created_at).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RankTracker;
