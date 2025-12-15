import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FeatureScanContainer from '../scan-modes/feature/FeatureScanContainer';

const ToxicBacklinkDetector: React.FC = () => {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // ✅ CORRECT: Redirect unpaid users to pricing, not global scan
  useEffect(() => {
    // Simple check - for now, all authenticated users can access features
    // TODO: Add proper subscription system
    const isPaidUser = Boolean(currentUser);
    
    if (!isPaidUser) {
      navigate('/pricing');
      return;
    }
  }, [currentUser, navigate]);

  const handleScanComplete = (data: any) => {
    console.log('Backlink scan completed:', data);
  };

  const handleScanError = (error: string) => {
    console.error('Backlink scan failed:', error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-full mb-6">
            <ShieldAlert className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Toxic Backlink Detector
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Identify harmful backlinks that may be damaging your website's SEO 
            and create disavow files to protect your rankings.
          </p>
        </motion.div>

        <FeatureScanContainer
          featureKey="backlinks"
          initialUrl={url}
          onScanComplete={handleScanComplete}
          onScanError={handleScanError}
          className="backlink-scan"
        />
      </div>
    </div>
  );
};

export default ToxicBacklinkDetector;