import React from 'react';
import { getMetricThreshold, formatMetricValue } from '../../utils/Performancehelper.js';

interface PerformancePanelProps {
  metrics: Record<string, any> | undefined;
}

const metricOrder = ['LCP', 'FCP', 'CLS', 'FID', 'TTI', 'TBT', 'INP'];

const PerformancePanel: React.FC<PerformancePanelProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-lg font-semibold mb-2">Performance Metrics</h3>
        <p className="text-sm text-gray-500">Detailed metrics not available in this result.</p>
      </div>
    );
  }

  const rows = metricOrder.filter(m => metrics[m] !== undefined).map(m => {
    const raw = metrics[m];
    const threshold: any = getMetricThreshold(m as any) as any;
    let status: 'good' | 'warn' | 'poor' = 'good';
    if (raw > threshold.needsImprovement) status = 'poor';
    else if (raw > threshold.good) status = 'warn';
    const color = status === 'good' ? 'text-green-600' : status === 'warn' ? 'text-yellow-600' : 'text-red-600';
    return { metric: m, value: formatMetricValue(raw, m), status, color };
  });

  return (
    <div className="bg-white rounded-2xl shadow">
      <div className="px-6 pt-6">
        <h3 className="text-lg font-semibold mb-1">Performance Metrics</h3>
        <p className="text-xs text-gray-500 mb-4">Core Web Vitals & timings</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-6 py-3 font-medium text-gray-600">Metric</th>
              <th className="px-6 py-3 font-medium text-gray-600">Value</th>
              <th className="px-6 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map(r => (
              <tr key={r.metric} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-700">{r.metric}</td>
                <td className="px-6 py-3 text-gray-600">{r.value}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${r.status === 'good' ? 'bg-green-100 text-green-700' : r.status === 'warn' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{r.status.toUpperCase()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 pb-4 pt-2 text-xs text-gray-400">Improve POOR/WARN items to raise your performance score.</div>
    </div>
  );
};

export default PerformancePanel;
