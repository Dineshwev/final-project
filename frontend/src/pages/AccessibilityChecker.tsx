import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { FeatureScanContainer } from "../scan-modes";
import { motion } from "framer-motion";
import {
  Eye,
  CheckCircle,
  Download,
  ExternalLink,
  Search,
  Info,
  BarChart3,
  Shield,
} from "lucide-react";

const AccessibilityChecker: React.FC = () => {
  const [url, setUrl] = useState("");
  const [showResults, setShowResults] = useState(false);
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

  const handleScanComplete = (result: any) => {
    setShowResults(true);
  };

  const handleScanError = (error: any) => {
    console.error('Accessibility scan failed:', error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
            <Eye className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Accessibility Checker
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Test your website for accessibility compliance and WCAG guidelines
          </p>
        </motion.div>

        <FeatureScanContainer
          featureKey="accessibility"
          initialUrl={url}
          onScanComplete={handleScanComplete}
          onScanError={handleScanError}
          className="accessibility-scan"
        />
      </div>
    </div>
  );
};

export default AccessibilityChecker;