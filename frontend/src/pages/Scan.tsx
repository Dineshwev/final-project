import React from "react";
import GlobalScanContainer from "../scan-modes/global/GlobalScanContainer";

const ScanPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Global SEO Analysis
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Run a comprehensive SEO audit to analyze your website's performance, 
            accessibility, technical health, and optimization opportunities.
          </p>
        </div>
        
        {/* Isolated GlobalScanContainer - all functionality contained within */}
        <GlobalScanContainer 
          className="w-full"
          showHistory={true}
        />
      </div>
    </div>
  );
};

export default ScanPage;