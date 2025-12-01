import { useEffect, useMemo, useState } from 'react';
import apiService from '../services/api';

export type DashboardMetrics = {
  totalScans: number;
  avgPerformance: number | null;
  avgSeo: number | null;
  lastScan: string | null;
  performanceSeries: number[]; // recent performance scores (chronological newest first)
  seoSeries: number[]; // recent seo scores (chronological newest first)
};

export function useDashboardMetrics() {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      const res = await apiService.getScanHistory(1, 50);
      if (!mounted) return;

      if (res.success && res.data) {
        try {
          const payload = res.data;
          const totalScans: number = payload?.pagination?.total ?? 0;
          const scans: Array<any> = payload?.scans ?? [];

          const lastScan = scans[0]?.completedAt ?? null;

          const perfVals = scans
            .map((s) => s?.scores?.performance)
            .filter((v: any) => typeof v === 'number') as number[];
          const seoVals = scans
            .map((s) => s?.scores?.seo)
            .filter((v: any) => typeof v === 'number') as number[];

          const avg = (arr: number[]) => (arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100 : null);

          // Limit series length for sparkline (e.g., last 12 items)
          const seriesLimit = 12;
          const performanceSeries = perfVals.slice(0, seriesLimit).reverse();
          const seoSeries = seoVals.slice(0, seriesLimit).reverse();

          const metrics: DashboardMetrics = {
            totalScans,
            avgPerformance: avg(perfVals),
            avgSeo: avg(seoVals),
            lastScan,
            performanceSeries,
            seoSeries,
          };
          setData(metrics);
        } catch (e) {
          setError(e);
        }
      } else {
        setError(res.error);
      }
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const formatted = useMemo(() => {
    if (!data) return null;
    // trend direction indicators comparing last two points if available
    const perfTrend = data.performanceSeries.length >= 2
      ? data.performanceSeries[data.performanceSeries.length - 1] - data.performanceSeries[data.performanceSeries.length - 2]
      : 0;
    const seoTrend = data.seoSeries.length >= 2
      ? data.seoSeries[data.seoSeries.length - 1] - data.seoSeries[data.seoSeries.length - 2]
      : 0;

    return {
      ...data,
      lastScanDisplay: data.lastScan ? new Date(data.lastScan).toLocaleString() : 'N/A',
      avgPerformanceDisplay: data.avgPerformance != null ? `${Math.round(data.avgPerformance)}%` : '—',
      avgSeoDisplay: data.avgSeo != null ? `${Math.round(data.avgSeo)}%` : '—',
      perfTrend,
      seoTrend,
    };
  }, [data]);

  return { data, loading, error, formatted } as const;
}

export default useDashboardMetrics;
