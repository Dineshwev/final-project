import React from 'react';

export interface IssueItem {
  category: string;
  issue: string;
  priority: 'high' | 'medium' | 'low';
}

interface IssueTableProps {
  title?: string;
  issues: IssueItem[];
  compact?: boolean;
}

const priorityColor: Record<string, string> = {
  high: 'bg-red-100 text-red-700 border-red-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  low: 'bg-blue-100 text-blue-700 border-blue-300'
};

export const IssueTable: React.FC<IssueTableProps> = ({ title = 'Issues & Recommendations', issues, compact = false }) => {
  if (!issues || issues.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-500">No issues detected in this category.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="px-6 pt-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-6 py-3 font-medium text-gray-600">Priority</th>
              <th className="px-6 py-3 font-medium text-gray-600">Category</th>
              <th className="px-6 py-3 font-medium text-gray-600">Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {issues.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded border text-xs font-semibold ${priorityColor[item.priority]}`}>{item.priority.toUpperCase()}</span>
                </td>
                <td className="px-6 py-3 font-medium text-gray-700 whitespace-nowrap">{item.category}</td>
                <td className="px-6 py-3 text-gray-600">{item.issue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!compact && (
        <div className="px-6 pb-4 pt-2 text-xs text-gray-400">Prioritize HIGH issues first for fastest impact on overall score.</div>
      )}
    </div>
  );
};

export default IssueTable;
