// Test page for the Quick Scan functionality
import React from 'react';
import TestScanForm from '../components/TestScanForm';

const TestScanPage: React.FC = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>
          Home Page Quick Website Scan Test
        </h1>
        
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
            This tests the integration between the Home Page "Quick Website Scan" and the /api/basic-scan endpoint.
            <br />
            Requirements: 10-second timeout, no authentication, friendly error handling, free users.
          </p>
          
          <TestScanForm />
        </div>
        
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
          <h3 style={{ color: '#1976d2', marginBottom: '10px' }}>Test Requirements ✅</h3>
          <ul style={{ color: '#333', lineHeight: '1.6' }}>
            <li>✅ Uses /api/basic-scan endpoint ONLY</li>
            <li>✅ No scanId required</li>
            <li>✅ No polling needed</li>
            <li>✅ 10-second timeout maximum</li>
            <li>✅ Friendly error handling without redirects</li>
            <li>✅ No localStorage usage</li>
            <li>✅ Works for FREE users without login</li>
            <li>✅ Returns: title, meta description, H1 count, HTTPS status, basic score</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestScanPage;