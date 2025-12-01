import React from 'react';

interface RawDataPanelProps {
  data: any;
  filename?: string;
}

export const RawDataPanel: React.FC<RawDataPanelProps> = ({ data, filename = 'scan-results.json' }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Raw JSON Data</h3>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="px-3 py-2 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 rounded">Copy</button>
          <button onClick={handleDownload} className="px-3 py-2 text-xs font-medium bg-purple-50 hover:bg-purple-100 text-purple-700 rounded">Download</button>
        </div>
      </div>
      <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-80">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default RawDataPanel;
