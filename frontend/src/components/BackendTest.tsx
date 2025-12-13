import React, { useState } from 'react';

const BackendTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testBackendConnection = async () => {
    setLoading(true);
    setTestResult('');
    
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://bc-worker-env.eba-k8rrjwx.ap-southeast-2.elasticbeanstalk.com/api";
    
    try {
      console.log(`🧪 Testing backend connection to: ${API_BASE_URL}`);
      
      // Test basic connectivity
      const response = await fetch(`${API_BASE_URL}/test`);
      const data = await response.json();
      
      if (response.ok) {
        setTestResult(`✅ Backend Connected Successfully!\n\nResponse: ${JSON.stringify(data, null, 2)}`);
      } else {
        setTestResult(`❌ Backend Error: ${response.status}\n\nResponse: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setTestResult(`🚫 Connection Failed: ${error}`);
      console.error('Backend test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-800 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Backend Connection Test</h2>
      
      <button
        onClick={testBackendConnection}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg mb-4"
      >
        {loading ? 'Testing...' : 'Test Backend Connection'}
      </button>
      
      {testResult && (
        <pre className="bg-slate-900 text-green-400 p-4 rounded-lg whitespace-pre-wrap text-sm">
          {testResult}
        </pre>
      )}
      
      <div className="mt-4 text-sm text-gray-400">
        <p><strong>API Base URL:</strong> {process.env.REACT_APP_API_BASE_URL || "https://bc-worker-env.eba-k8rrjwx.ap-southeast-2.elasticbeanstalk.com/api"}</p>
      </div>
    </div>
  );
};

export default BackendTest;