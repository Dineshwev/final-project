import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FeatureScanContainer } from "../scan-modes";
import { motion } from "framer-motion";
import {
  Copy,
  CheckCircle,
  Download,
  ExternalLink,
  Search,
  Info,
  BarChart3,
  FileText,
} from "lucide-react";

const DuplicateContentDetector: React.FC = () => {
  const [url, setUrl] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleScanComplete = (result: any) => {
    setShowResults(true);
  };

  const handleScanError = (error: any) => {
    console.error('Duplicate content scan failed:', error);
  };

  return (
    <div className="duplicate-content-detector">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Duplicate Content Detector
            </h1>
            <p className="text-xl text-gray-600">
              Identify duplicate content across your website and external sources
            </p>
          </div>

          <FeatureScanContainer
            feature="content-analysis"
            initialUrl={url}
            onScanComplete={handleScanComplete}
            onScanError={handleScanError}
            className="duplicate-content-scan"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default DuplicateContentDetector;