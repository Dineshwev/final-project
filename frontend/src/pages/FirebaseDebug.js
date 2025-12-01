import React, { useState, useEffect } from 'react';

const FirebaseDebug = () => {
  const [diagnostics, setDiagnostics] = useState({
    configLoaded: false,
    apiKeyPresent: false,
    projectId: '',
    errors: [],
    apiTests: []
  });

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const results = {
      configLoaded: false,
      apiKeyPresent: false,
      projectId: '',
      errors: [],
      apiTests: []
    };

    // Check if environment variables are loaded
    const apiKey = process.env.REACT_APP_FIREBASE_API_KEY;
    const projectId = process.env.REACT_APP_FIREBASE_PROJECT_ID;

    results.apiKeyPresent = !!apiKey;
    results.projectId = projectId || 'NOT SET';
    results.configLoaded = !!(apiKey && projectId);

    // Test 1: Check if Identity Toolkit API is accessible
    try {
      const response = await fetch(
        `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=${apiKey}`
      );
      
      if (response.ok) {
        results.apiTests.push({
          test: 'Identity Toolkit API',
          status: 'PASSED',
          message: 'API is accessible'
        });
      } else {
        const errorData = await response.json();
        results.apiTests.push({
          test: 'Identity Toolkit API',
          status: 'FAILED',
          message: `${response.status}: ${errorData.error?.message || 'Unknown error'}`
        });
        results.errors.push(errorData.error?.message || 'Unknown error');
      }
    } catch (error) {
      results.apiTests.push({
        test: 'Identity Toolkit API',
        status: 'ERROR',
        message: error.message
      });
      results.errors.push(error.message);
    }

    setDiagnostics(results);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Firebase Configuration Diagnostics</h1>
        
        {/* Configuration Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration Status</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-3 ${diagnostics.configLoaded ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span>Configuration Loaded: {diagnostics.configLoaded ? 'YES' : 'NO'}</span>
            </div>
            <div className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-3 ${diagnostics.apiKeyPresent ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span>API Key Present: {diagnostics.apiKeyPresent ? 'YES' : 'NO'}</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full mr-3 bg-blue-500"></span>
              <span>Project ID: {diagnostics.projectId}</span>
            </div>
          </div>
        </div>

        {/* API Tests */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Tests</h2>
          {diagnostics.apiTests.length === 0 ? (
            <p className="text-gray-500">Running tests...</p>
          ) : (
            <div className="space-y-3">
              {diagnostics.apiTests.map((test, index) => (
                <div key={index} className="border rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{test.test}</span>
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${
                      test.status === 'PASSED' ? 'bg-green-100 text-green-800' :
                      test.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {test.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{test.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Errors and Solutions */}
        {diagnostics.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-red-800 mb-4">⚠️ Errors Detected</h2>
            <div className="space-y-2 mb-4">
              {diagnostics.errors.map((error, index) => (
                <p key={index} className="text-red-700 text-sm">{error}</p>
              ))}
            </div>
            
            <div className="bg-white rounded p-4 mt-4">
              <h3 className="font-semibold mb-2">How to Fix:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  <strong>Enable Identity Toolkit API:</strong>
                  <br />
                  <a 
                    href={`https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=${diagnostics.projectId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-6"
                  >
                    Click here to enable Identity Toolkit API
                  </a>
                </li>
                <li>
                  <strong>Remove API Key Restrictions:</strong>
                  <br />
                  <a 
                    href={`https://console.cloud.google.com/apis/credentials?project=${diagnostics.projectId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-6"
                  >
                    Click here to manage API credentials
                  </a>
                  <br />
                  <span className="ml-6 text-gray-600">Then select "Don't restrict key" for development</span>
                </li>
                <li>
                  <strong>Wait 1-2 minutes</strong> for changes to propagate
                </li>
                <li>
                  <button 
                    onClick={runDiagnostics}
                    className="ml-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Re-run Diagnostics
                  </button>
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Success Message */}
        {diagnostics.apiTests.length > 0 && diagnostics.errors.length === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-2">✅ All Tests Passed!</h2>
            <p className="text-green-700">Your Firebase configuration is working correctly.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirebaseDebug;