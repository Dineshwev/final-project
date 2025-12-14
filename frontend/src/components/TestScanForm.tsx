// Test page for ScanForm component
import React from 'react';
import { executeSimpleBasicScan, type SimpleScanResult } from '../services/simpleScan';

const TestScanForm = () => {
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<SimpleScanResult | null>(null);

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
      setResult(scanResult);
    } catch (err: any) {
      setError(err.message || "Unable to analyze website. Please try again in a moment.");
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

    const overallScore = result.score || 75;

    return (
      <div style={{ marginTop: '24px', padding: '24px', border: '2px solid green', borderRadius: '16px', backgroundColor: '#f8f9fa' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>Scan Results</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff' }}>{overallScore}/100</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{result.httpsStatus ? 90 : 60}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Technical</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{(result.title && result.metaDescription) ? 85 : 65}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Content</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{result.h1Count === 1 ? 90 : 70}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>User Experience</div>
          </div>
        </div>

        <div style={{ fontSize: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#666' }}>Title:</span>
            <span style={{ fontWeight: 'medium', color: result.title ? 'green' : 'red' }}>
              {result.title ? '✓ Present' : '✗ Missing'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#666' }}>Meta Description:</span>
            <span style={{ fontWeight: 'medium', color: result.metaDescription ? 'green' : 'red' }}>
              {result.metaDescription ? '✓ Present' : '✗ Missing'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#666' }}>H1 Count:</span>
            <span style={{ fontWeight: 'medium', color: result.h1Count === 1 ? 'green' : 'orange' }}>
              {result.h1Count || 0} {result.h1Count === 1 ? '✓' : result.h1Count === 0 ? '✗' : '⚠'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#666' }}>HTTPS:</span>
            <span style={{ fontWeight: 'medium', color: result.httpsStatus ? 'green' : 'red' }}>
              {result.httpsStatus ? '✓ Enabled' : '✗ Not Enabled'}
            </span>
          </div>
        </div>

        <button
          onClick={resetScan}
          style={{
            marginTop: '16px',
            width: '100%',
            padding: '12px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Scan Another Website
        </button>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Quick SEO Scan Test</h1>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL (e.g., https://example.com)"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              border: '2px solid #ddd',
              borderRadius: '8px',
              marginBottom: '10px'
            }}
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              backgroundColor: loading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Analyzing...' : 'Quick SEO Scan'}
          </button>
        </div>
      </form>

      {error && (
        <div style={{
          padding: '16px',
          backgroundColor: '#dc3545',
          color: 'white',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}

      {loading && (
        <div style={{
          padding: '16px',
          backgroundColor: '#f8f9fa',
          border: '2px solid #ddd',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>✅ Free Quick SEO Analysis</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>Get instant insights on title, meta description, headings, and HTTPS status</p>
        </div>
      )}

      {renderResults()}
    </div>
  );
};

export default TestScanForm;