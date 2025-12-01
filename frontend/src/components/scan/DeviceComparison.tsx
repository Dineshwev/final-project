import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';
import ScoreGauge from './ScoreGauge';

// Lightweight inline icons to avoid external peer-dep conflicts
const IconSmartphone: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="6" y="2" width="12" height="20" rx="2" ry="2"></rect>
    <path d="M11 18h2"></path>
  </svg>
);

const IconMonitor: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="2" y="3" width="20" height="14" rx="2"></rect>
    <path d="M8 21h8"></path>
    <path d="M12 17v4"></path>
  </svg>
);
 

type DeviceScores = {
  device?: string;
  scores?: { performance?: number; accessibility?: number; bestPractices?: number; seo?: number };
  metrics?: Record<string, any>;
  audits?: Record<string, any>;
  source?: string;
};

interface Props {
  mobile: DeviceScores | null | undefined;
  desktop: DeviceScores | null | undefined;
  comparison: any;
  responsive: any;
  loading?: boolean; // optional explicit loading flag
  onRetry?: () => void; // optional retry handler
}

const parseMetric = (v: any) => {
  if (v == null) return null;
  if (typeof v === 'number') return v;
  const s = String(v).trim();
  if (s.endsWith('ms')) return parseFloat(s.replace('ms', ''));
  if (s.endsWith('s')) return parseFloat(s.replace('s', '')) * 1000;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
};

// metric parsing helper above; individual metric rows are rendered inline

const DeviceComparison: React.FC<Props> = ({ mobile, desktop, comparison, responsive, loading, onRetry }) => {
  const [animate, setAnimate] = useState(false);
  const [animatedMobileScore, setAnimatedMobileScore] = useState(0);
  const [animatedDesktopScore, setAnimatedDesktopScore] = useState(0);

  const mobileScores = mobile?.scores || { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 };
  const desktopScores = desktop?.scores || { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 };

  const metrics = [
    { key: 'LCP', label: 'LCP', mMobile: mobile?.metrics?.LCP ?? mobile?.metrics?.largestContentfulPaint, mDesktop: desktop?.metrics?.LCP ?? desktop?.metrics?.largestContentfulPaint },
    { key: 'FCP', label: 'FCP', mMobile: mobile?.metrics?.FCP ?? mobile?.metrics?.firstContentfulPaint, mDesktop: desktop?.metrics?.FCP ?? desktop?.metrics?.firstContentfulPaint },
    { key: 'CLS', label: 'CLS', mMobile: mobile?.metrics?.CLS ?? mobile?.metrics?.cumulativeLayoutShift, mDesktop: desktop?.metrics?.CLS ?? desktop?.metrics?.cumulativeLayoutShift },
    { key: 'TBT', label: 'TBT', mMobile: mobile?.metrics?.TBT ?? mobile?.metrics?.totalBlockingTime, mDesktop: desktop?.metrics?.TBT ?? desktop?.metrics?.totalBlockingTime },
    { key: 'SI', label: 'SpeedIndex', mMobile: mobile?.metrics?.speedIndex ?? mobile?.metrics?.SI, mDesktop: desktop?.metrics?.speedIndex ?? desktop?.metrics?.SI }
  ];

  const chartData = metrics.map(m => ({ name: m.label, Mobile: parseMetric(m.mMobile) || 0, Desktop: parseMetric(m.mDesktop) || 0 }));

  const scoreDiff = (k: string) => {
    const m = mobileScores[k as keyof typeof mobileScores] ?? 0;
    const d = desktopScores[k as keyof typeof desktopScores] ?? 0;
    const delta = Math.round((d - m));
    return { delta, color: delta > 0 ? 'bg-green-50 text-green-700' : delta < 0 ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700' };
  };

  const isLoading = loading || (mobile === undefined && desktop === undefined);

  // Animate mount
  useEffect(() => {
    setAnimate(true);
    // animate gauges from 0 to values
    let raf1: number | null = null;
    let raf2: number | null = null;
    const start = performance.now();
    const duration = 1000; // 1s
    const fromM = 0;
    const toM = mobileScores.performance ?? 0;
    const fromD = 0;
    const toD = desktopScores.performance ?? 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p; // easeInOut
      setAnimatedMobileScore(Math.round(fromM + (toM - fromM) * ease));
      setAnimatedDesktopScore(Math.round(fromD + (toD - fromD) * ease));
      if (p < 1) {
        raf1 = requestAnimationFrame(tick);
      }
    };
    raf2 = requestAnimationFrame(tick);
    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [mobileScores.performance, desktopScores.performance]);

  // Empty / no-data state (when not loading)
  if (!isLoading && !mobile && !desktop) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 text-center" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-4">
          <IconMonitor className="w-12 h-12 text-gray-400" />
          <div className="text-lg font-semibold">No device comparison data yet</div>
          <div className="text-sm text-gray-500 max-w-xl">Device comparison runs a mobile and desktop Lighthouse/PageSpeed analysis and shows differences between them. Run a scan to see side-by-side results.</div>
          <div className="pt-4">
            <button
              onClick={() => onRetry ? onRetry() : window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Retry analysis"
            >
              Retry Analysis
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
  <div className="space-y-6 overflow-auto max-h-[60vh] sm:max-h-[50vh]" role="region" aria-label="Device Comparison">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Mobile */}
        <div
          className={`bg-white rounded-2xl shadow p-6 transition-opacity duration-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-1 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
          role="group"
          aria-label="Mobile device comparison"
          tabIndex={0}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center" aria-hidden>
                <IconSmartphone className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Mobile</div>
                <div className="text-lg font-semibold text-gray-900">{mobile?.source ?? 'mock'}</div>
              </div>
            </div>
            <div className="text-sm text-gray-500">Usability</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`${isLoading ? 'animate-pulse' : ''}`}>
              <ScoreGauge label="Performance" score={isLoading ? 0 : animatedMobileScore} color="blue" aria-label={`Mobile performance ${mobileScores.performance ?? 0}`} />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between"><div className="text-sm text-gray-500">SEO</div><div className="font-semibold" aria-label={`Mobile SEO score ${mobileScores.seo ?? '—'}`}>{mobileScores.seo ?? '—'}</div></div>
              <div className="flex items-center justify-between"><div className="text-sm text-gray-500">Accessibility</div><div className="font-semibold">{mobileScores.accessibility ?? '—'}</div></div>
              <div className="flex items-center justify-between"><div className="text-sm text-gray-500">Best Practices</div><div className="font-semibold">{mobileScores.bestPractices ?? '—'}</div></div>
              <div className="mt-2">
                <div className="text-xs text-gray-500">Mobile Usability</div>
                <div className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold">{responsive?.mobileUsabilityScore ?? 'N/A'}</div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-2">Mobile-specific issues</div>
            {isLoading ? (
              <div className="text-sm text-gray-500">Analyzing mobile performance...</div>
            ) : comparison?.mobileIssues && comparison.mobileIssues.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-red-600">
                {comparison.mobileIssues.map((m:string,i:number)=>(<li key={i}>{m}</li>))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500">No major mobile issues detected</div>
            )}
          </div>
        </div>

        {/* Right: Desktop */}
        <div
          className={`bg-white rounded-2xl shadow p-6 transition-opacity duration-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-1 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
          role="group"
          aria-label="Desktop device comparison"
          tabIndex={0}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center" aria-hidden>
                <IconMonitor className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Desktop</div>
                <div className="text-lg font-semibold text-gray-900">{desktop?.source ?? 'mock'}</div>
              </div>
            </div>
            <div className="text-sm text-gray-500">Comparison</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`${isLoading ? 'animate-pulse' : ''}`}>
              <ScoreGauge label="Performance" score={isLoading ? 0 : animatedDesktopScore} color="blue" aria-label={`Desktop performance ${desktopScores.performance ?? 0}`} />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between"><div className="text-sm text-gray-500">SEO</div><div className="font-semibold">{desktopScores.seo ?? '—'}</div></div>
              <div className="flex items-center justify-between"><div className="text-sm text-gray-500">Accessibility</div><div className="font-semibold">{desktopScores.accessibility ?? '—'}</div></div>
              <div className="flex items-center justify-between"><div className="text-sm text-gray-500">Best Practices</div><div className="font-semibold">{desktopScores.bestPractices ?? '—'}</div></div>
              <div className="mt-2">
                <div className="text-xs text-gray-500">Mobile Usability (from responsive)</div>
                <div className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold">{responsive?.mobileUsabilityScore ?? 'N/A'}</div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-2">Comparison summary</div>
            <div className="grid gap-2">
              {['performance','accessibility','bestPractices','seo'].map((k)=>{
                const s = scoreDiff(k as any);
                const valMobile = (mobileScores as any)[k] ?? 0;
                const valDesktop = (desktopScores as any)[k] ?? 0;
                const delta = valDesktop - valMobile;
                const pct = valMobile ? Math.round((delta/valMobile)*100) : delta;
                const sign = pct > 0 ? '+' : '';
                return (
                  <div key={k} className={`flex items-center justify-between p-2 rounded ${s.color}`}>
                    <div className="text-sm capitalize">{k}</div>
                    <div className="text-sm font-semibold">{valMobile} → {valDesktop} <span className="text-xs ml-2">{pct===null?'':`${sign}${pct}%`}</span></div>
                    <span className="sr-only">Difference for {k}: {pct===null?'no data':`${sign}${pct} percent`}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics chart */}
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold">Core Web Vitals Comparison</div>
          <div className="text-sm text-gray-500">Lower is better for most metrics</div>
        </div>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Mobile" fill="#60a5fa">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-mobile-${index}`} />
                ))}
              </Bar>
              <Bar dataKey="Desktop" fill="#7c3aed">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-desktop-${index}`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DeviceComparison;
