import React from 'react';

interface ComparisonTableProps { data: any; }

const badge = (state: string) => {
  const base = 'px-2 py-1 rounded-full text-xs font-medium';
  if (state === 'better') return `${base} bg-green-100 text-green-700`;
  if (state === 'worse') return `${base} bg-red-100 text-red-700`;
  if (state === 'equal') return `${base} bg-gray-100 text-gray-700`;
  return `${base} bg-gray-50 text-gray-400`;
};

const ComparisonTable: React.FC<ComparisonTableProps> = ({ data }) => {
  const diffs = data.comparison.diffs;
  const primaryUrl = diffs[0]?.url;
  const primaryIssues = diffs[0]?.seo?.issues ?? null;

  return (
    <div className="bg-white rounded-2xl shadow p-6 overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">Comparison Summary</h2>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left bg-gray-50">
            <th className="p-2 font-medium">URL</th>
            <th className="p-2 font-medium">Performance</th>
            <th className="p-2 font-medium">SEO Score</th>
            <th className="p-2 font-medium">SEO Issues</th>
            <th className="p-2 font-medium">Readability (FRE)</th>
            <th className="p-2 font-medium">Indicators</th>
          </tr>
        </thead>
        <tbody>
          {diffs.map((d:any,i:number)=> {
            const analyzed = data.analyzed.find((a:any) => a.url === d.url);
            return (
              <tr key={d.url} className="border-b last:border-0">
                <td className="p-2 align-top">
                  <div className="font-medium break-all">{d.url}</div>
                  {i===0 && <div className="text-xs text-indigo-600">Primary reference</div>}
                </td>
                <td className="p-2 align-top">
                  <div className="flex items-center gap-2">
                    <span>{d.performance.score ?? '—'}</span>
                    {i>0 && <span className={badge(d.performance.vsPrimary)}>{d.performance.vsPrimary}</span>}
                  </div>
                </td>
                <td className="p-2 align-top">
                  <div className="flex items-center gap-2">
                    <span>{d.seo.score ?? '—'}</span>
                    {i>0 && <span className={badge(d.seo.vsPrimary)}>{d.seo.vsPrimary}</span>}
                  </div>
                </td>
                <td className="p-2 align-top">
                  <div className="flex items-center gap-2">
                    <span>{d.seo.issues ?? '—'}</span>
                    {i>0 && (
                      <span className={badge(
                        primaryIssues==null || d.seo.issues==null
                          ? 'n/a'
                          : (d.seo.issues < primaryIssues ? 'better' : d.seo.issues > primaryIssues ? 'worse' : 'equal')
                      )}>
                        {primaryIssues==null || d.seo.issues==null ? 'n/a' : (d.seo.issues < primaryIssues ? 'better' : d.seo.issues > primaryIssues ? 'worse' : 'equal')}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-2 align-top">
                  <div className="flex items-center gap-2">
                    <span>{d.readability.fle ?? '—'}</span>
                    {i>0 && <span className={badge(d.readability.vsPrimary)}>{d.readability.vsPrimary}</span>}
                  </div>
                </td>
                <td className="p-2 align-top">
                  {analyzed?.content?.score != null ? (
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs">Content {analyzed.content.score}</span>
                      {analyzed.content.readability && <span className="px-2 py-1 rounded bg-purple-50 text-purple-700 text-xs">Avg Sent {analyzed.content.readability.averageSentenceLength}</span>}
                    </div>
                  ) : <span className="text-gray-400 text-xs">No content</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-4 text-xs text-gray-500">
        Badges show relative performance against <span className="font-medium">primary URL ({primaryUrl})</span>.
      </div>
    </div>
  );
};

export default ComparisonTable;
