import React, { useState } from 'react';
import { Link } from "react-router-dom";
import useScanResults from "../hooks/useScanResults";

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
  const { scanResults, serviceData, hasServiceData, serviceStatus, loading, error: scanError } = useScanResults({ serviceName: 'schema' });
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string|null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('Article');

  // Get schema data from scan results
  const schemaData = serviceData;
  const hasSchemaData = hasServiceData;

  // Set error from scan service
  React.useEffect(() => {
    if (scanError) {
      setError(scanError);
    } else if (!hasSchemaData && !loading) {
      setError(serviceStatus);
    } else {
      setError(null);
    }
  }, [scanError, hasSchemaData, loading, serviceStatus]);

  const redirectToScan = () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }
    // Redirect to scan page to run a new scan
    window.location.href = `/scan?url=${encodeURIComponent(url)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-white to-pink-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h1 className="text-2xl font-bold mb-3">Schema Markup Validator</h1>
          
          {scanResults && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Showing results from scan: <strong>{scanResults.url}</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                <Link to="/scan" className="underline">Click here to run a new scan</Link>
              </p>
            </div>
          )}
          
          {!hasSchemaData && (
            <form onSubmit={(e) => { e.preventDefault(); redirectToScan(); }} className="space-y-4">
              <div className="flex gap-3">
                <input 
                  type="url" 
                  required 
                  value={url} 
                  onChange={e=>setUrl(e.target.value)} 
                  placeholder="https://example.com/article" 
                  className="flex-1 px-4 py-3 rounded-lg border" 
                />
                <button className="px-5 py-3 rounded-lg bg-purple-600 text-white font-semibold">
                  Start Scan
                </button>
              </div>
            </form>
          )}
          
          {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
        </div>

        {loading && (
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Loading scan results...</span>
            </div>
          </div>
        )}

        {schemaData && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow">
              <h2 className="font-semibold mb-2">Schema Detection Results</h2>
              {(!schemaData.detections || schemaData.detections.length === 0) && (
                <p className="text-sm text-gray-500">No structured data found.</p>
              )}
              <ul className="text-sm space-y-1">
                {(schemaData.detections || []).map((d:any,i:number)=>(
                  <li key={i} className="flex justify-between">
                    <span>{d.format} {d.type || ''}</span>
                    <span className="text-green-600">✓ Found</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <h2 className="font-semibold mb-2">Validation Issues</h2>
              {(!schemaData.errors || schemaData.errors.length === 0) && (
                <p className="text-sm text-green-700">No critical schema validation errors detected.</p>
              )}
              <ul className="text-sm space-y-1">
                {(schemaData.errors || []).map((iss:any,i:number)=>(
                  <li key={i} className="text-red-600">[{iss.type}] {iss.message}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <h2 className="font-semibold mb-2">Schema Summary</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {schemaData.summary?.totalSchemas || 0}
                  </div>
                  <div className="text-sm text-blue-800">Total Schemas</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {schemaData.summary?.validSchemas || 0}
                  </div>
                  <div className="text-sm text-green-800">Valid Schemas</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {schemaData.summary?.errors || 0}
                  </div>
                  <div className="text-sm text-red-800">Errors Found</div>
                </div>
              </div>
            </div>

            {schemaData.recommendations && schemaData.recommendations.length > 0 && (
              <div className="bg-white p-4 rounded-xl shadow">
                <h2 className="font-semibold mb-2">Recommendations</h2>
                <ul className="text-sm space-y-2">
                  {schemaData.recommendations.map((rec:any,i:number)=>(
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">⚡</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Schema Templates</h2>
          <div className="flex gap-2 mb-3 flex-wrap">
            {Object.keys(templates).map(k=>(
              <button
                key={k}
                onClick={()=>setSelectedTemplate(k)}
                className={`px-3 py-1 text-xs rounded ${selectedTemplate === k ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
              >
                {k}
              </button>
            ))}
          </div>
          <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
            {JSON.stringify(templates[selectedTemplate], null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default SchemaValidator;