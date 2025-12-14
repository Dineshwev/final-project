import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FeatureScanContainer } from "../scan-modes";
import { motion } from "framer-motion";
import {
  Code,
  CheckCircle,
  Download,
  ExternalLink,
  Search,
  Info,
  BarChart3,
  FileText,
} from "lucide-react";

const SchemaValidator: React.FC = () => {
  const [url, setUrl] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleScanComplete = (result: any) => {
    setShowResults(true);
  };

  const handleScanError = (error: any) => {
    console.error('Schema validation failed:', error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-6">
            <Code className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Schema Markup Validator
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Validate and analyze your website's structured data markup
          </p>
        </motion.div>

        <FeatureScanContainer
          feature="schema-validation"
          initialUrl={url}
          onScanComplete={handleScanComplete}
          onScanError={handleScanError}
          className="schema-scan"
        />
      </div>
    </div>
  );
};

export default SchemaValidator;