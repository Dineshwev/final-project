import React from 'react';

interface SecurityData {
  isHttps?: boolean;
  securityHeaders?: Record<string, string | undefined>;
  issues?: string[];
  securityScore?: number | null;
}

const importantHeaders = [
  'Content-Security-Policy',
  'Strict-Transport-Security',
  'X-Content-Type-Options',
  'X-Frame-Options',
  'Referrer-Policy',
  'Permissions-Policy'
];

const SecurityPanel: React.FC<{ data?: SecurityData }> = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-lg font-semibold mb-2">Security Overview</h3>
        <p className="text-sm text-gray-500">Security data not available for this scan.</p>
      </div>
    );
  }

  const score = Math.max(0, Math.min(100, Math.round(data.securityScore ?? 0)));
  const badge = score >= 90 ? 'bg-green-100 text-green-700' : score >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';

  return (
    <div className="bg-white rounded-2xl shadow">
      <div className="px-6 pt-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Security Overview</h3>
          <p className="text-xs text-gray-500">Protocol & essential headers</p>
        </div>
        <div className={`px-3 py-1 rounded text-xs font-semibold ${badge}`}>Score: {score}/100</div>
      </div>
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Protocol</div>
            <div className={`inline-flex items-center px-2 py-1 text-xs rounded ${data.isHttps ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {data.isHttps ? 'HTTPS enabled' : 'HTTP (not secure)'}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Key Headers</div>
            <div className="space-y-2">
              {importantHeaders.map(h => {
                const val = data.securityHeaders?.[h];
                const ok = Boolean(val);
                return (
                  <div key={h} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{h}</span>
                    <span className={`text-xs px-2 py-1 rounded ${ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{ok ? 'Present' : 'Missing'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {Array.isArray(data.issues) && data.issues.length > 0 && (
          <div className="mt-6">
            <div className="text-sm font-medium text-gray-700 mb-2">Issues</div>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {data.issues.map((i, idx) => <li key={idx}>{i}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityPanel;
