import React from 'react';

type SparklineProps = {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string; // tailwind class or hex
  fill?: string;
  strokeWidth?: number;
  smooth?: boolean;
  className?: string;
};

function toPath(points: { x: number; y: number }[], smooth = true) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
  if (!smooth) {
    return points.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ');
  }
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const cx = (p0.x + p1.x) / 2;
    const cy = (p0.y + p1.y) / 2;
    d += ` Q ${p0.x},${p0.y} ${cx},${cy}`;
  }
  d += ` T ${points[points.length - 1].x},${points[points.length - 1].y}`;
  return d;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 120,
  height = 36,
  stroke = '#6366f1',
  fill = 'url(#spark-fill)',
  strokeWidth = 2,
  smooth = true,
  className,
}) => {
  const pad = 2;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const values = data && data.length ? data : [0, 0];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1 || 1)) * w;
    const y = pad + h - ((v - min) / range) * h;
    return { x, y };
  });

  const path = toPath(points, smooth);

  // Area path for subtle fill
  const areaPath = `${path} L ${pad + w},${pad + h} L ${pad},${pad + h} Z`;

  const id = React.useId();

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden>
      <defs>
        <linearGradient id={`spark-stroke-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#a855f7"/>
        </linearGradient>
        <linearGradient id={`spark-fill-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spark-fill-${id})`} stroke="none"/>
      <path d={path} fill="none" stroke={`url(#spark-stroke-${id})`} strokeWidth={strokeWidth} strokeLinecap="round"/>
    </svg>
  );
};

export default Sparkline;
