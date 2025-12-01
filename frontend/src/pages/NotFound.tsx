// src/pages/NotFound.tsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaExclamationTriangle, FaHome } from "../components/Icons";
import Card from "../components/Card";
import Button from "../components/Button";
import { fadeIn, slideUp } from "../utils/animations";

const NotFound: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md w-full"
        variants={fadeIn}
        initial="initial"
        animate="animate"
      >
        <Card variant="glass" padding="xl">
          <div className="text-center space-y-6">
            <motion.div variants={slideUp}>
              <FaExclamationTriangle className="mx-auto h-20 w-20 text-yellow-500 mb-4" />
              <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                404
              </h2>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Page Not Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </motion.div>

            <motion.div variants={slideUp}>
              <Link to="/">
                <Button variant="primary" icon={<FaHome />} fullWidth>
                  Return to Home
                </Button>
              </Link>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default NotFound;
