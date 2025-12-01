/**
 * Chart Component Types
 * TypeScript interfaces for chart components
 */

export interface BaseChartProps {
  width?: number;
  height?: number;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  animate?: boolean;
  responsive?: boolean;
  darkMode?: boolean;
  className?: string;
}

export interface LineChartProps extends BaseChartProps {
  data: TimeSeriesData[];
  metrics: string[];
  showTrend?: boolean;
  showZoom?: boolean;
}

export interface DonutChartProps extends BaseChartProps {
  data: CategoryData[];
  centerText?: string;
  centerValue?: number;
  onSegmentClick?: (data: CategoryData) => void;
}

export interface BarChartProps extends BaseChartProps {
  data: ComparisonData[];
  metrics: string[];
  orientation?: "vertical" | "horizontal";
  showValues?: boolean;
  sortable?: boolean;
}

export interface RadarChartProps extends BaseChartProps {
  data: RadarData[];
  websites?: WebsiteData[];
  maxValue?: number;
}

export interface AreaChartProps extends BaseChartProps {
  data: TimeSeriesData[];
  metrics: string[];
  stacked?: boolean;
  showBrush?: boolean;
}

export interface SparklineChartProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  showTrend?: boolean;
}

// Data Types

export interface TimeSeriesData {
  date: string;
  [key: string]: string | number;
}

export interface CategoryData {
  name: string;
  value: number;
  color?: string;
}

export interface ComparisonData {
  name: string;
  [key: string]: string | number;
}

export interface RadarData {
  category: string;
  score: number;
  fullMark?: number;
}

export interface WebsiteData {
  name: string;
  data: RadarData[];
}

export interface TrendData {
  value: number;
  trend: number;
  trendPercentage: number;
}

// Chart Configuration

export interface ChartColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  grid: string;
  text: string;
  background: string;
}

export interface TooltipData {
  date?: string;
  name?: string;
  value: number;
  trend?: number;
  trendPercentage?: number;
  color?: string;
}

export interface LegendItem {
  value: string;
  color: string;
  visible: boolean;
}

// Export Options

export type ExportFormat = "png" | "svg" | "csv";

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  quality?: number;
}

// Loading & Empty States

export interface ChartState {
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
}
