/**
 * Feature Scan Container
 * 
 * Routes to specific feature tools based on URL parameters
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import SchemaChecker from '../../pages/SchemaValidator';
import ToxicBacklinkDetector from '../../pages/ToxicBacklinkDetector';
import AccessibilityChecker from '../../pages/AccessibilityChecker';
import MultiLanguageSeoChecker from '../../pages/MultiLanguageSeoChecker';

interface FeatureScanContainerProps {
  className?: string;
}

export const FeatureScanContainer: React.FC<FeatureScanContainerProps> = ({
  className = ''
}) => {
  const { tool } = useParams<{ tool: string }>();

  // Feature tool metadata
  const featureTools = {
    schema: {
      name: 'Schema Markup Validator',
      description: 'Analyze and validate your website\'s structured data markup for better search engine understanding and rich snippets.',
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      gradient: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-100',
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    backlinks: {
      name: 'Toxic Backlink Detector',
      description: 'Identify harmful backlinks that could damage your search rankings and create disavow files for protection.',
      icon: (
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      gradient: 'from-red-50 to-rose-50',
      borderColor: 'border-red-100',
      badgeColor: 'bg-red-100 text-red-800'
    },
    accessibility: {
      name: 'Website Accessibility Checker',
      description: 'Ensure your website meets WCAG accessibility standards and provides an inclusive experience for all users.',
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      gradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-100',
      badgeColor: 'bg-green-100 text-green-800'
    },
    multilang: {
      name: 'Multi-Language SEO Analyzer',
      description: 'Optimize your international SEO strategy with comprehensive analysis of hreflang, content localization, and global search performance.',
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
      gradient: 'from-purple-50 to-indigo-50',
      borderColor: 'border-purple-100',
      badgeColor: 'bg-purple-100 text-purple-800'
    }
  };

  const currentTool = featureTools[tool as keyof typeof featureTools];

  const renderFeatureTool = () => {
    // If tool is supported, wrap it with enhanced UI
    if (currentTool) {
      let ToolComponent;
      switch (tool) {
        case 'schema':
          ToolComponent = SchemaChecker;
          break;
        case 'backlinks':
          ToolComponent = ToxicBacklinkDetector;
          break;
        case 'accessibility':
          ToolComponent = AccessibilityChecker;
          break;
        case 'multilang':
          ToolComponent = MultiLanguageSeoChecker;
          break;
        default:
          ToolComponent = null;
      }

      return (
        <div className="max-w-6xl mx-auto">
          {/* Feature Header */}
          <div className={`bg-white rounded-2xl shadow-lg border ${currentTool.borderColor} overflow-hidden mb-8`}>
            <div className={`bg-gradient-to-r ${currentTool.gradient} px-8 py-8 border-b ${currentTool.borderColor}`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-white bg-opacity-50 rounded-2xl flex items-center justify-center">
                    {currentTool.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">{currentTool.name}</h1>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentTool.badgeColor}`}>
                        Premium Feature
                      </span>
                    </div>
                    <p className="text-lg text-gray-700 leading-relaxed max-w-4xl">
                      {currentTool.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Advanced Analysis Tool</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Real-time Results</span>
                  </div>
                </div>
                
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-30 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Start Analysis</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
          
          {/* Tool Content */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {ToolComponent && <ToolComponent />}
          </div>
        </div>
      );
    }

    // Fallback for unsupported tools
    // Fallback for unsupported tools
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-8 py-8 border-b border-orange-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-white bg-opacity-50 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">Feature Coming Soon</h1>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      In Development
                    </span>
                  </div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    The feature "{tool}" is currently under development and will be available soon.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="bg-blue-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Available SEO Analysis Tools
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(featureTools).map(([key, tool]) => (
                  <div key={key} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        {tool.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-2">{tool.name}</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">{tool.description}</p>
                        <a 
                          href={`/features/${key}`}
                          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mt-3 group"
                        >
                          Try this tool
                          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {renderFeatureTool()}
      </div>
    </div>
  );
};

export default FeatureScanContainer;