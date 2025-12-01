/**
 * SparklineChart Component
 * Compact mini charts for dashboard cards
 */

import React from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { SparklineChartProps } from "../../types/chartTypes";

const SparklineChart: React.FC<SparklineChartProps> = ({
  data,
  color,
  width = 100,
  height = 40,
  showTrend = true,
}) => {
  // Convert array to chart data format
  const chartData = data.map((value, index) => ({ index, value }));

  // Calculate trend
  const firstValue = data[0];
  const lastValue = data[data.length - 1];
  const trend = lastValue - firstValue;
  const trendPercentage =
    firstValue !== 0 ? ((trend / firstValue) * 100).toFixed(1) : "0";
  const isPositive = trend >= 0;

  // Determine color
  const lineColor = color || (isPositive ? "#10b981" : "#ef4444");

  if (data.length === 0) {
    return <div style={{ width, height }} className="bg-gray-100 rounded" />;
  }

  return (
    <div className="flex items-center gap-2">
      <ResponsiveContainer width={width} height={height}>
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      {showTrend && (
        <div
          className={`flex items-center gap-1 text-sm font-semibold ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? (
            <ArrowUpIcon className="w-4 h-4" />
          ) : (
            <ArrowDownIcon className="w-4 h-4" />
          )}
          <span>{trendPercentage}%</span>
        </div>
      )}
    </div>
  );
};

export default SparklineChart;
