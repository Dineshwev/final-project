/**
 * Feature Scan Container
 * 
 * Routes to specific feature tools based on URL parameters
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import SchemaChecker from '../../seo-tools/SchemaChecker';
import ToxicBacklinkDetector from '../../seo-tools/ToxicBacklinkDetector';
import AccessibilityChecker from '../../seo-tools/AccessibilityChecker';
import MultiLanguageSeoChecker from '../../seo-tools/MultiLanguageSeoChecker';

interface FeatureScanContainerProps {
  className?: string;
}

export const FeatureScanContainer: React.FC<FeatureScanContainerProps> = ({
  className = ''
}) => {
  const { tool } = useParams<{ tool: string }>();

  const renderFeatureTool = () => {
    switch (tool) {
      case 'schema':
        return <SchemaChecker />;
      case 'backlinks':
        return <ToxicBacklinkDetector />;
      case 'accessibility':
        return <AccessibilityChecker />;
      case 'multilang':
        return <MultiLanguageSeoChecker />;
      default:
        return (
          <div className="feature-not-found">
            <div className="error-content">
              <h2>Feature Not Found</h2>
              <p>The requested feature "{tool}" is not available.</p>
              <div className="available-features">
                <h3>Available Features:</h3>
                <ul>
                  <li><strong>schema</strong> - Schema markup validation and analysis</li>
                  <li><strong>backlinks</strong> - Toxic backlink detection and analysis</li>
                  <li><strong>accessibility</strong> - Website accessibility checker</li>
                  <li><strong>multilang</strong> - Multi-language SEO analysis</li>
                </ul>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`feature-scan-container ${className}`}>
      {renderFeatureTool()}
    </div>
  );
};

export default FeatureScanContainer;