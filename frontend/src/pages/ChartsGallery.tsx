/**
 * ChartsGallery Component
 * Demonstration of all chart types with sample data
 */

import React, { useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import LineChart from "../components/charts/LineChart";
import DonutChart from "../components/charts/DonutChart";
import BarChart from "../components/charts/BarChart";
import SparklineChart from "../components/charts/SparklineChart";
import {
  generateSampleData,
  generateComparisonData,
} from "../utils/chartUtils";

const ChartsGallery: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  // Sample data
  const timeSeriesData = generateSampleData(14);
  const comparisonData = generateComparisonData(5);
  const categoryData = [
    { name: "SEO", value: 85 },
    { name: "Performance", value: 72 },
    { name: "Accessibility", value: 91 },
    { name: "Best Practices", value: 88 },
    { name: "Security", value: 76 },
  ];
  const sparklineData = [65, 68, 70, 72, 69, 75, 78, 82];

  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? "bg-gray-950"
          : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
      } py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1
              className={`text-4xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              } mb-4`}
            >
              📊 Interactive Charts Gallery
            </h1>
            <p
              className={`text-xl ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              SEO Data Visualization Components
            </p>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-lg transition-colors ${
              darkMode
                ? "bg-gray-800 hover:bg-gray-700 text-yellow-400"
                : "bg-white hover:bg-gray-100 text-gray-700"
            } shadow-lg`}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? (
              <SunIcon className="w-6 h-6" />
            ) : (
              <MoonIcon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Grid Layout */}
        <div className="space-y-8">
          {/* Line Chart */}
          <section>
            <div className="mb-4">
              <h2
                className={`text-2xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                } mb-2`}
              >
                1. LineChart - Score Trends
              </h2>
              <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Multi-line support with time-based X-axis, tooltips showing
                trends, and legend toggling
              </p>
            </div>
            <LineChart
              data={timeSeriesData}
              metrics={[
                "seoScore",
                "performanceScore",
                "accessibilityScore",
                "bestPracticesScore",
              ]}
              darkMode={darkMode}
              showTrend={true}
              showZoom={true}
              className="shadow-xl"
            />
          </section>

          {/* Donut + Bar Charts Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Donut Chart */}
            <section>
              <div className="mb-4">
                <h2
                  className={`text-2xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  } mb-2`}
                >
                  2. DonutChart - Score Breakdown
                </h2>
                <p
                  className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Category-wise distribution with center text and hover effects
                </p>
              </div>
              <DonutChart
                data={categoryData}
                darkMode={darkMode}
                centerText="Average"
                height={450}
                className="shadow-xl"
              />
            </section>

            {/* Bar Chart */}
            <section>
              <div className="mb-4">
                <h2
                  className={`text-2xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  } mb-2`}
                >
                  3. BarChart - Website Comparison
                </h2>
                <p
                  className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Side-by-side comparison with sort functionality
                </p>
              </div>
              <BarChart
                data={comparisonData}
                metrics={[
                  "seo",
                  "performance",
                  "accessibility",
                  "bestPractices",
                ]}
                darkMode={darkMode}
                showValues={true}
                sortable={true}
                height={450}
                className="shadow-xl"
              />
            </section>
          </div>

          {/* Sparkline Charts */}
          <section>
            <div className="mb-4">
              <h2
                className={`text-2xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                } mb-2`}
              >
                4. SparklineChart - Mini Trends
              </h2>
              <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Compact visualization for dashboard cards
              </p>
            </div>
            <div
              className={`${
                darkMode ? "bg-gray-900" : "bg-white"
              } p-6 rounded-lg shadow-xl`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* SEO Score Card */}
                <div
                  className={`p-4 rounded-lg ${
                    darkMode ? "bg-gray-800" : "bg-gray-50"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } mb-2`}
                  >
                    SEO Score
                  </p>
                  <div className="flex items-end justify-between mb-3">
                    <p
                      className={`text-3xl font-bold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {sparklineData[sparklineData.length - 1]}
                    </p>
                  </div>
                  <SparklineChart
                    data={sparklineData}
                    width={150}
                    height={40}
                    showTrend={true}
                  />
                </div>

                {/* Performance Card */}
                <div
                  className={`p-4 rounded-lg ${
                    darkMode ? "bg-gray-800" : "bg-gray-50"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } mb-2`}
                  >
                    Performance
                  </p>
                  <div className="flex items-end justify-between mb-3">
                    <p
                      className={`text-3xl font-bold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      72
                    </p>
                  </div>
                  <SparklineChart
                    data={[60, 62, 65, 68, 70, 72, 70, 72]}
                    width={150}
                    height={40}
                    color="#f59e0b"
                    showTrend={true}
                  />
                </div>

                {/* Accessibility Card */}
                <div
                  className={`p-4 rounded-lg ${
                    darkMode ? "bg-gray-800" : "bg-gray-50"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } mb-2`}
                  >
                    Accessibility
                  </p>
                  <div className="flex items-end justify-between mb-3">
                    <p
                      className={`text-3xl font-bold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      91
                    </p>
                  </div>
                  <SparklineChart
                    data={[85, 87, 88, 90, 89, 91, 92, 91]}
                    width={150}
                    height={40}
                    color="#8b5cf6"
                    showTrend={true}
                  />
                </div>

                {/* Security Card */}
                <div
                  className={`p-4 rounded-lg ${
                    darkMode ? "bg-gray-800" : "bg-gray-50"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } mb-2`}
                  >
                    Security
                  </p>
                  <div className="flex items-end justify-between mb-3">
                    <p
                      className={`text-3xl font-bold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      76
                    </p>
                  </div>
                  <SparklineChart
                    data={[70, 72, 71, 73, 75, 76, 75, 76]}
                    width={150}
                    height={40}
                    color="#ec4899"
                    showTrend={true}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Features List */}
          <section
            className={`${
              darkMode ? "bg-gray-900" : "bg-white"
            } p-8 rounded-lg shadow-xl`}
          >
            <h2
              className={`text-2xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              } mb-6`}
            >
              ✨ Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3
                  className={`font-semibold ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  } mb-3`}
                >
                  Interactivity
                </h3>
                <ul
                  className={`space-y-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <li>✓ Interactive tooltips with detailed information</li>
                  <li>✓ Legend toggling to show/hide data series</li>
                  <li>✓ Click events on chart segments</li>
                  <li>✓ Sort functionality for bar charts</li>
                  <li>✓ Zoom and brush for date range selection</li>
                </ul>
              </div>
              <div>
                <h3
                  className={`font-semibold ${
                    darkMode ? "text-purple-400" : "text-purple-600"
                  } mb-3`}
                >
                  Customization
                </h3>
                <ul
                  className={`space-y-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <li>✓ Dark mode support</li>
                  <li>✓ Responsive design (mobile + desktop)</li>
                  <li>✓ Custom colors and styling</li>
                  <li>✓ Animated transitions</li>
                  <li>✓ Export to PNG and CSV</li>
                </ul>
              </div>
              <div>
                <h3
                  className={`font-semibold ${
                    darkMode ? "text-green-400" : "text-green-600"
                  } mb-3`}
                >
                  Accessibility
                </h3>
                <ul
                  className={`space-y-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <li>✓ ARIA labels for screen readers</li>
                  <li>✓ Keyboard navigation support</li>
                  <li>✓ High contrast colors</li>
                  <li>✓ Semantic HTML structure</li>
                  <li>✓ Focus indicators</li>
                </ul>
              </div>
              <div>
                <h3
                  className={`font-semibold ${
                    darkMode ? "text-orange-400" : "text-orange-600"
                  } mb-3`}
                >
                  TypeScript
                </h3>
                <ul
                  className={`space-y-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <li>✓ Fully typed with interfaces</li>
                  <li>✓ Prop validation</li>
                  <li>✓ IntelliSense support</li>
                  <li>✓ Type-safe data handling</li>
                  <li>✓ Reusable components</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Usage Example */}
          <section
            className={`${
              darkMode ? "bg-gray-900" : "bg-white"
            } p-8 rounded-lg shadow-xl`}
          >
            <h2
              className={`text-2xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              } mb-4`}
            >
              💻 Usage Example
            </h2>
            <pre
              className={`${
                darkMode
                  ? "bg-gray-800 text-gray-300"
                  : "bg-gray-100 text-gray-800"
              } p-4 rounded-lg overflow-x-auto text-sm`}
            >
              {`import LineChart from './components/charts/LineChart';
import DonutChart from './components/charts/DonutChart';
import BarChart from './components/charts/BarChart';

// Line Chart for trends
<LineChart
  data={timeSeriesData}
  metrics={['seoScore', 'performanceScore']}
  darkMode={true}
  showTrend={true}
  showZoom={true}
/>

// Donut Chart for distribution
<DonutChart
  data={categoryData}
  darkMode={true}
  centerText="Average"
  onSegmentClick={(data) => console.log(data)}
/>

// Bar Chart for comparison
<BarChart
  data={comparisonData}
  metrics={['seo', 'performance']}
  darkMode={true}
  sortable={true}
  orientation="vertical"
/>`}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ChartsGallery;
