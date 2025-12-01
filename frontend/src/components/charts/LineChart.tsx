/**
 * LineChart Component
 * Multi-line chart for SEO score trends over time
 */

import React, { useState, useRef } from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { LineChartProps } from "../../types/chartTypes";
import {
  exportChartToPNG,
  exportToCSV,
  generateChartColors,
} from "../../utils/chartUtils";

const LineChartComponent: React.FC<LineChartProps> = ({
  data,
  metrics,
  width,
  height = 400,
  colors,
  showLegend = true,
  showGrid = true,
  animate = true,
  responsive = true,
  darkMode = false,
  showTrend = true,
  showZoom = false,
  className = "",
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [hiddenMetrics, setHiddenMetrics] = useState<Set<string>>(new Set());

  const chartColors = colors || generateChartColors(metrics.length, darkMode);

  const toggleMetric = (metric: string) => {
    const newHidden = new Set(hiddenMetrics);
    if (newHidden.has(metric)) {
      newHidden.delete(metric);
    } else {
      newHidden.add(metric);
    }
    setHiddenMetrics(newHidden);
  };

  const handleExportPNG = async () => {
    if (chartRef.current) {
      await exportChartToPNG(chartRef.current, "line-chart.png");
    }
  };

  const handleExportCSV = () => {
    exportToCSV(data, "line-chart-data.csv");
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div
        className={`${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        } p-4 rounded-lg shadow-lg border ${
          darkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => {
          if (hiddenMetrics.has(entry.dataKey)) return null;

          const prevValue =
            index > 0 ? payload[0].payload[entry.dataKey + "Prev"] : null;
          const trend = prevValue ? entry.value - prevValue : 0;
          const trendPercentage = prevValue
            ? ((trend / prevValue) * 100).toFixed(1)
            : "0";

          return (
            <div
              key={entry.dataKey}
              className="flex items-center justify-between gap-4 py-1"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm">{entry.name}:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{entry.value}</span>
                {showTrend && trend !== 0 && (
                  <span
                    className={`flex items-center text-xs ${
                      trend > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {trend > 0 ? (
                      <ArrowUpIcon className="w-3 h-3" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3" />
                    )}
                    {trendPercentage}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center ${
          darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-50 text-gray-500"
        } rounded-lg p-8 ${className}`}
        style={{ height }}
      >
        <p>No data available</p>
      </div>
    );
  }

  const ChartContent = (
    <div
      ref={chartRef}
      className={`${
        darkMode ? "bg-gray-900" : "bg-white"
      } p-6 rounded-lg ${className}`}
    >
      {/* Header with Export Buttons */}
      <div className="flex justify-between items-center mb-4">
        <h3
          className={`text-lg font-semibold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Score Trends
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleExportPNG}
            className={`p-2 rounded-lg transition-colors ${
              darkMode
                ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
            title="Export as PNG"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handleExportCSV}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              darkMode
                ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
            title="Export as CSV"
          >
            CSV
          </button>
        </div>
      </div>

      <ResponsiveContainer width={responsive ? "100%" : width} height={height}>
        <RechartsLineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={darkMode ? "#374151" : "#e5e7eb"}
            />
          )}
          <XAxis
            dataKey="date"
            stroke={darkMode ? "#9ca3af" : "#6b7280"}
            style={{ fontSize: "12px" }}
          />
          <YAxis
            stroke={darkMode ? "#9ca3af" : "#6b7280"}
            style={{ fontSize: "12px" }}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              onClick={(e) => {
                if (e.dataKey && typeof e.dataKey === "string") {
                  toggleMetric(e.dataKey);
                }
              }}
              wrapperStyle={{ cursor: "pointer" }}
              formatter={(value: string) => (
                <span className={hiddenMetrics.has(value) ? "opacity-50" : ""}>
                  {value}
                </span>
              )}
            />
          )}
          {showZoom && (
            <Brush
              dataKey="date"
              height={30}
              stroke={darkMode ? "#6b7280" : "#9ca3af"}
              fill={darkMode ? "#1f2937" : "#f3f4f6"}
            />
          )}
          {metrics.map((metric, index) => (
            <Line
              key={metric}
              type="monotone"
              dataKey={metric}
              stroke={chartColors[index]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              hide={hiddenMetrics.has(metric)}
              animationDuration={animate ? 1000 : 0}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );

  return ChartContent;
};

export default LineChartComponent;
