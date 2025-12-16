import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Languages } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FeatureScanContainer from '../scan-modes/feature/FeatureScanContainer';

const MultiLanguageSeoChecker: React.FC = () => {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Removed auto-redirect - subscription check will happen on analyze button click

  const handleScanComplete = (data: any) => {
    console.log('Multi-language SEO scan completed:', data);
  };

  const handleScanError = (error: string) => {
    console.error('Multi-language SEO scan failed:', error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full mb-6">
            <Globe className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Multi-Language SEO Checker
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Analyze your website's international SEO implementation and 
            multilingual content structure for better global rankings.
          </p>
        </motion.div>

        <FeatureScanContainer
          featureKey="international-seo"
          initialUrl={url}
          onScanComplete={handleScanComplete}
          onScanError={handleScanError}
          className="multilang-seo-scan"
        />
      </div>
    </div>
  );
};

export default MultiLanguageSeoChecker;