import React, { useState } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://inrpws5mww.ap-southeast-2.awsapprunner.com/api';

const templates: Record<string, any> = {
  Article: {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: 'Example Headline', datePublished: '2025-01-01',
    author: { '@type':'Person', name:'Author Name' }
  },
  Product: {
    '@context':'https://schema.org', '@type':'Product', name:'Example Product',
    description:'An awesome product', sku:'SKU123', offers:{ '@type':'Offer', price:'9.99', priceCurrency:'USD', availability:'https://schema.org/InStock' }
  },
  FAQPage: {
    '@context':'https://schema.org', '@type':'FAQPage', mainEntity:[
      { '@type':'Question', name:'Question 1', acceptedAnswer:{ '@type':'Answer', text:'Answer 1'} }
    ]
  },
  Organization: {
    '@context':'https://schema.org', '@type':'Organization', name:'Example Corp', url:'https://example.com', logo:'https://example.com/logo.png'
  },
  BreadcrumbList: {
    '@context':'https://schema.org', '@type':'BreadcrumbList', itemListElement:[
      { '@type':'ListItem', position:1, name:'Home', item:'https://example.com' }
    ]
  }
};

const SchemaValidator: React.FC = () => {
  const [url, setUrl] = useState('');
  const [data, setData] = useState<any|null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('Article');
  const [headless, setHeadless] = useState(false);

  const submit = async (e:React.FormEvent) => {
    e.preventDefault(); setError(null); setData(null); setLoading(true);
    try {
  const params = new URLSearchParams({ url });
  if (headless) params.set('headless','true');
  const res = await fetch(`${API_BASE}/schema-validator?${params.toString()}`);
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        const text = await res.text();
        throw new Error(`Unexpected response (not JSON): ${text.substring(0,100)}...`);
      }
      const json = await res.json();
      if (json.status !== 'success') throw new Error(json.message || 'Validation failed');
      setData(json.data);
    } catch (e:any) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-white to-pink-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h1 className="text-2xl font-bold mb-3">Schema Markup Validator</h1>
          <form onSubmit={submit} className="space-y-4">
            <div className="flex gap-3">
              <input type="url" required value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com/article" className="flex-1 px-4 py-3 rounded-lg border" />
              <button className="px-5 py-3 rounded-lg bg-purple-600 text-white font-semibold" disabled={loading}>{loading? 'Validating…':'Validate'}</button>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={headless} onChange={e=>setHeadless(e.target.checked)} />
              <span>Headless (render JS, may bypass blocks)</span>
            </label>
          </form>
          {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
        </div>

        {data && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow">
              <h2 className="font-semibold mb-2">Detections</h2>
              {data.validation.detections.length === 0 && <p className="text-sm text-gray-500">No structured data found.</p>}
              <ul className="text-sm space-y-1">
                {data.validation.detections.map((d:any,i:number)=>(
                  <li key={i} className="flex justify-between"><span>{d.format} {d.type || ''}</span></li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-4 rounded-xl shadow">
              <h2 className="font-semibold mb-2">Issues</h2>
              {data.validation.issues.length === 0 && <p className="text-sm text-green-700">No missing required fields detected for sampled types.</p>}
              <ul className="text-sm space-y-1">
                {data.validation.issues.map((iss:any,i:number)=>(
                  <li key={i} className="text-red-600">[{iss.type}] {iss.message}</li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-4 rounded-xl shadow">
              <h2 className="font-semibold mb-2">Rich Snippet Preview (simplified)</h2>
              {data.previews.length === 0 && <p className="text-sm text-gray-500">No previewable schemas.</p>}
              <div className="grid md:grid-cols-2 gap-4">
                {data.previews.map((p:any,i:number)=>(
                  <div key={i} className="border rounded-lg p-3 text-sm">
                    <div className="font-medium">{p.type}</div>
                    {p.title && <div>{p.title}</div>}
                    {p.date && <div className="text-xs text-gray-500">{p.date}</div>}
                    {p.price && <div className="text-xs">Price: {p.price}</div>}
                    {p.rating && <div className="text-xs">Rating: {p.rating}</div>}
                    {p.count && <div className="text-xs">FAQ entries: {p.count}</div>}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow">
              <h2 className="font-semibold mb-2">Suggestions</h2>
              <ul className="text-sm space-y-1">
                {data.validation.suggestions.map((s:string,i:number)=>(
                  <li key={i} className="text-blue-600">{s}</li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-4 rounded-xl shadow">
              <h2 className="font-semibold mb-2">Schema Templates</h2>
              <div className="flex gap-3 mb-3 flex-wrap">
                {Object.keys(templates).map(t => (
                  <button key={t} onClick={()=>setSelectedTemplate(t)} className={`px-3 py-2 rounded text-sm border ${selectedTemplate===t? 'bg-purple-600 text-white':'bg-gray-50'}`}>{t}</button>
                ))}
              </div>
              <pre className="text-xs bg-gray-900 text-green-200 p-3 rounded overflow-x-auto">
{JSON.stringify(templates[selectedTemplate], null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchemaValidator;
