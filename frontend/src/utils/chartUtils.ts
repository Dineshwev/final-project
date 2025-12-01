/**
 * Chart Utilities
 * Helper functions for chart data formatting, colors, and exports
 */

import html2canvas from "html2canvas";

/**
 * Format raw data for charts
 */
export function formatChartData(rawData: any[]): any[] {
  if (!Array.isArray(rawData) || rawData.length === 0) {
    return [];
  }

  return rawData.map((item) => ({
    ...item,
    // Ensure date is formatted consistently
    date: item.date ? new Date(item.date).toLocaleDateString() : undefined,
    // Round numeric values to 2 decimal places
    ...Object.keys(item).reduce((acc, key) => {
      if (typeof item[key] === "number") {
        acc[key] = Math.round(item[key] * 100) / 100;
      }
      return acc;
    }, {} as any),
  }));
}

/**
 * Generate color palette for charts
 */
export function generateChartColors(
  count: number,
  darkMode: boolean = false
): string[] {
  const lightColors = [
    "#3b82f6", // blue-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#f59e0b", // amber-500
    "#10b981", // emerald-500
    "#06b6d4", // cyan-500
    "#f97316", // orange-500
    "#6366f1", // indigo-500
  ];

  const darkColors = [
    "#60a5fa", // blue-400
    "#a78bfa", // violet-400
    "#f472b6", // pink-400
    "#fbbf24", // amber-400
    "#34d399", // emerald-400
    "#22d3ee", // cyan-400
    "#fb923c", // orange-400
    "#818cf8", // indigo-400
  ];

  const colors = darkMode ? darkColors : lightColors;

  // Repeat colors if needed
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }

  return result;
}

/**
 * Get color based on score/value
 */
export function getScoreColor(
  score: number,
  darkMode: boolean = false
): string {
  if (score >= 90) {
    return darkMode ? "#34d399" : "#10b981"; // green
  } else if (score >= 70) {
    return darkMode ? "#60a5fa" : "#3b82f6"; // blue
  } else if (score >= 50) {
    return darkMode ? "#fbbf24" : "#f59e0b"; // amber
  } else if (score >= 30) {
    return darkMode ? "#fb923c" : "#f97316"; // orange
  } else {
    return darkMode ? "#f87171" : "#ef4444"; // red
  }
}

/**
 * Calculate trends between data points
 */
export function calculateTrends(data: any[], valueKey: string): any[] {
  if (!Array.isArray(data) || data.length < 2) {
    return data.map((item) => ({ ...item, trend: 0, trendPercentage: 0 }));
  }

  return data.map((item, index) => {
    if (index === 0) {
      return { ...item, trend: 0, trendPercentage: 0 };
    }

    const currentValue = item[valueKey];
    const previousValue = data[index - 1][valueKey];

    if (typeof currentValue !== "number" || typeof previousValue !== "number") {
      return { ...item, trend: 0, trendPercentage: 0 };
    }

    const trend = currentValue - previousValue;
    const trendPercentage =
      previousValue !== 0 ? (trend / previousValue) * 100 : 0;

    return {
      ...item,
      trend: Math.round(trend * 100) / 100,
      trendPercentage: Math.round(trendPercentage * 100) / 100,
    };
  });
}

/**
 * Export chart to PNG
 */
export async function exportChartToPNG(
  chartRef: HTMLElement | null,
  filename: string = "chart.png"
): Promise<void> {
  if (!chartRef) {
    console.error("Chart reference is null");
    return;
  }

  try {
    const canvas = await html2canvas(chartRef, {
      backgroundColor: "#ffffff",
      scale: 2, // Higher quality
      logging: false,
    });

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    });
  } catch (error) {
    console.error("Error exporting chart:", error);
    throw error;
  }
}

/**
 * Export chart data to CSV
 */
export function exportToCSV(
  data: any[],
  filename: string = "chart-data.csv"
): void {
  if (!Array.isArray(data) || data.length === 0) {
    console.error("No data to export");
    return;
  }

  try {
    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
      headers.join(","), // Header row
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Escape commas and quotes
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(",")
      ),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting to CSV:", error);
    throw error;
  }
}

/**
 * Format number with K/M suffix
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

/**
 * Generate sample data for testing
 */
export function generateSampleData(points: number = 7): any[] {
  const data = [];
  const baseDate = new Date();

  for (let i = 0; i < points; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - (points - i - 1));

    data.push({
      date: date.toLocaleDateString(),
      seoScore: Math.floor(Math.random() * 30) + 70,
      performanceScore: Math.floor(Math.random() * 30) + 65,
      accessibilityScore: Math.floor(Math.random() * 30) + 75,
      bestPracticesScore: Math.floor(Math.random() * 30) + 80,
    });
  }

  return data;
}

/**
 * Generate comparison data
 */
export function generateComparisonData(websites: number = 3): any[] {
  const data = [];

  for (let i = 0; i < websites; i++) {
    data.push({
      website: `Website ${i + 1}`,
      seo: Math.floor(Math.random() * 30) + 70,
      performance: Math.floor(Math.random() * 30) + 65,
      accessibility: Math.floor(Math.random() * 30) + 75,
      bestPractices: Math.floor(Math.random() * 30) + 80,
    });
  }

  return data;
}

/**
 * Generate radar chart data
 */
export function generateRadarData(): any[] {
  return [
    { category: "SEO", score: Math.floor(Math.random() * 30) + 70 },
    { category: "Performance", score: Math.floor(Math.random() * 30) + 65 },
    { category: "Accessibility", score: Math.floor(Math.random() * 30) + 75 },
    { category: "Best Practices", score: Math.floor(Math.random() * 30) + 80 },
    { category: "Security", score: Math.floor(Math.random() * 30) + 70 },
    { category: "Mobile", score: Math.floor(Math.random() * 30) + 75 },
  ];
}

/**
 * Get responsive chart dimensions
 */
export function getResponsiveDimensions(containerWidth: number) {
  if (containerWidth < 640) {
    return { width: containerWidth - 32, height: 250 };
  } else if (containerWidth < 1024) {
    return { width: containerWidth - 48, height: 300 };
  } else {
    return { width: containerWidth - 64, height: 400 };
  }
}
