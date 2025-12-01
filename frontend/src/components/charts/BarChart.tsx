/**
 * BarChart Component
 * Side-by-side comparison of metrics across websites
 */

import React, { useState, useRef } from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import {
  ArrowsUpDownIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { BarChartProps } from "../../types/chartTypes";
import {
  exportChartToPNG,
  exportToCSV,
  generateChartColors,
} from "../../utils/chartUtils";

const BarChart: React.FC<BarChartProps> = ({
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
  orientation = "vertical",
  showValues = true,
  sortable = true,
  className = "",
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [sortedData, setSortedData] = useState(data);
  const [sortMetric, setSortMetric] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const chartColors = colors || generateChartColors(metrics.length, darkMode);

  const handleSort = (metric: string) => {
    if (!sortable) return;

    let direction: "asc" | "desc" = "desc";
    if (sortMetric === metric && sortDirection === "desc") {
      direction = "asc";
    }

    const sorted = [...data].sort((a, b) => {
      const aValue = a[metric] as number;
      const bValue = b[metric] as number;
      return direction === "desc" ? bValue - aValue : aValue - bValue;
    });

    setSortedData(sorted);
    setSortMetric(metric);
    setSortDirection(direction);
  };

  const handleExportPNG = async () => {
    if (chartRef.current) {
      await exportChartToPNG(chartRef.current, "bar-chart.png");
    }
  };

  const handleExportCSV = () => {
    exportToCSV(sortedData, "bar-chart-data.csv");
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
        {payload.map((entry: any) => (
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
            <span className="font-semibold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  // Custom label
  const renderCustomLabel = (props: any) => {
    const { x, y, width, height, value } = props;

    if (orientation === "vertical") {
      return (
        <text
          x={x + width / 2}
          y={y - 5}
          fill={darkMode ? "#9ca3af" : "#6b7280"}
          textAnchor="middle"
          fontSize={12}
          fontWeight="600"
        >
          {value}
        </text>
      );
    } else {
      return (
        <text
          x={x + width + 5}
          y={y + height / 2}
          fill={darkMode ? "#9ca3af" : "#6b7280"}
          textAnchor="start"
          dominantBaseline="middle"
          fontSize={12}
          fontWeight="600"
        >
          {value}
        </text>
      );
    }
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

  return (
    <div
      ref={chartRef}
      className={`${
        darkMode ? "bg-gray-900" : "bg-white"
      } p-6 rounded-lg ${className}`}
    >
      {/* Header with Sort and Export */}
      <div className="flex justify-between items-center mb-4">
        <h3
          className={`text-lg font-semibold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Comparison
        </h3>
        <div className="flex gap-2">
          {sortable && metrics.length > 0 && (
            <div className="flex gap-1">
              {metrics.map((metric, index) => (
                <button
                  key={metric}
                  onClick={() => handleSort(metric)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                    sortMetric === metric
                      ? darkMode
                        ? "bg-blue-600 text-white"
                        : "bg-blue-500 text-white"
                      : darkMode
                      ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                  title={`Sort by ${metric}`}
                >
                  <ArrowsUpDownIcon className="w-4 h-4" />
                  {metric}
                </button>
              ))}
            </div>
          )}
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
        <RechartsBarChart
          data={sortedData}
          layout={orientation === "horizontal" ? "horizontal" : "vertical"}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={darkMode ? "#374151" : "#e5e7eb"}
            />
          )}
          {orientation === "vertical" ? (
            <>
              <XAxis
                dataKey="name"
                stroke={darkMode ? "#9ca3af" : "#6b7280"}
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke={darkMode ? "#9ca3af" : "#6b7280"}
                style={{ fontSize: "12px" }}
                domain={[0, 100]}
              />
            </>
          ) : (
            <>
              <XAxis
                type="number"
                stroke={darkMode ? "#9ca3af" : "#6b7280"}
                style={{ fontSize: "12px" }}
                domain={[0, 100]}
              />
              <YAxis
                dataKey="name"
                type="category"
                stroke={darkMode ? "#9ca3af" : "#6b7280"}
                style={{ fontSize: "12px" }}
              />
            </>
          )}
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="rect" />
          )}
          {metrics.map((metric, index) => (
            <Bar
              key={metric}
              dataKey={metric}
              fill={chartColors[index]}
              animationDuration={animate ? 800 : 0}
              radius={[4, 4, 0, 0]}
            >
              {showValues && <LabelList content={renderCustomLabel} />}
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div
        className={`mt-4 pt-4 border-t ${
          darkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Websites
            </p>
            <p
              className={`text-xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {sortedData.length}
            </p>
          </div>
          <div>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Metrics
            </p>
            <p
              className={`text-xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {metrics.length}
            </p>
          </div>
          <div>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Sort By
            </p>
            <p
              className={`text-xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {sortMetric || "None"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarChart;
