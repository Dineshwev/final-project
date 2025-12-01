/**
 * DonutChart Component
 * Category-wise score breakdown with interactive segments
 */

import React, { useState, useRef } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { DonutChartProps } from "../../types/chartTypes";
import {
  exportChartToPNG,
  exportToCSV,
  getScoreColor,
} from "../../utils/chartUtils";

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  width,
  height = 400,
  colors,
  showLegend = true,
  animate = true,
  responsive = true,
  darkMode = false,
  centerText = "Total",
  centerValue,
  onSegmentClick,
  className = "",
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleExportPNG = async () => {
    if (chartRef.current) {
      await exportChartToPNG(chartRef.current, "donut-chart.png");
    }
  };

  const handleExportCSV = () => {
    exportToCSV(data, "donut-chart-data.csv");
  };

  // Calculate total if centerValue not provided
  const total = centerValue || data.reduce((sum, item) => sum + item.value, 0);
  const average = Math.round(total / data.length);

  // Generate colors based on scores or use provided colors
  const chartColors =
    colors ||
    data.map((item) => item.color || getScoreColor(item.value, darkMode));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0];
    const percentage = ((data.value / total) * 100).toFixed(1);

    return (
      <div
        className={`${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        } p-4 rounded-lg shadow-lg border ${
          darkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <p className="font-semibold mb-2">{data.name}</p>
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm">Score:</span>
          <span className="font-semibold">{data.value}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm">Percentage:</span>
          <span className="font-semibold">{percentage}%</span>
        </div>
      </div>
    );
  };

  // Custom label
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    if (percent < 0.05) return null; // Hide labels for small segments

    return (
      <text
        x={x}
        y={y}
        fill={darkMode ? "#ffffff" : "#000000"}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Center label component
  const CenterLabel = () => (
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="middle"
      className={darkMode ? "fill-white" : "fill-gray-900"}
    >
      <tspan x="50%" dy="-0.5em" className="text-sm font-medium opacity-70">
        {centerText}
      </tspan>
      <tspan x="50%" dy="1.5em" className="text-3xl font-bold">
        {average}
      </tspan>
    </text>
  );

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
      {/* Header with Export Buttons */}
      <div className="flex justify-between items-center mb-4">
        <h3
          className={`text-lg font-semibold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Score Distribution
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
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius="80%"
            innerRadius="60%"
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={animate ? 800 : 0}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            onClick={(data) => onSegmentClick && onSegmentClick(data)}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={chartColors[index]}
                opacity={
                  activeIndex === null || activeIndex === index ? 1 : 0.6
                }
                style={{
                  cursor: onSegmentClick ? "pointer" : "default",
                  transition: "opacity 0.3s",
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value: string) => (
                <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
                  {value}
                </span>
              )}
            />
          )}
          <CenterLabel />
        </PieChart>
      </ResponsiveContainer>

      {/* Score Summary */}
      <div
        className={`mt-4 pt-4 border-t ${
          darkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Average Score
            </p>
            <p
              className={`text-2xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {average}
            </p>
          </div>
          <div>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Categories
            </p>
            <p
              className={`text-2xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {data.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
