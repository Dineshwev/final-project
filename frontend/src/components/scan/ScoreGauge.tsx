import React from 'react';

interface ScoreGaugeProps {
  label: string;
  score: number; // 0-100
  color?: 'blue' | 'purple' | 'green' | 'indigo' | 'orange' | 'red';
}

const colorMap: Record<string, string> = {
  blue: '#3b82f6',
  purple: '#8b5cf6',
  green: '#10b981',
  indigo: '#6366f1',
  orange: '#f59e0b',
  red: '#ef4444',
};

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ label, score, color = 'blue' }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const offset = circumference - (clamped / 100) * circumference;
  const trackColor = '#e5e7eb';
  const fg = colorMap[color] || colorMap.blue;

  const badgeBg = clamped >= 90 ? 'bg-green-100 text-green-700' : clamped >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span className={`px-2 py-1 text-xs rounded ${badgeBg}`}>{clamped >= 90 ? 'Excellent' : clamped >= 70 ? 'Good' : 'Needs work'}</span>
      </div>
      <div className="flex items-center justify-center">
        <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
          <circle cx="70" cy="70" r={radius} fill="transparent" stroke={trackColor} strokeWidth="12" />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="transparent"
            stroke={fg}
            strokeWidth="12"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute text-center">
          <div className="text-4xl font-bold" style={{ color: fg }}>{clamped}</div>
          <div className="text-xs text-gray-500">/100</div>
        </div>
      </div>
    </div>
  );
};

export default ScoreGauge;
