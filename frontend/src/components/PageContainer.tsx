/**
 * Professional Page Container Component
 * Provides consistent layout, animations, and styling across all pages
 */

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsapFadeIn } from "../utils/animations";

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "7xl";
  showBackground?: boolean;
  gradient?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  subtitle,
  icon,
  className = "",
  maxWidth = "7xl",
  showBackground = true,
  gradient = "from-indigo-50 via-white to-purple-50",
}) => {
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      gsapFadeIn(headerRef.current, 0);
    }
  }, []);

  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "7xl": "max-w-7xl",
    full: "max-w-full",
  }[maxWidth];

  return (
    <div
      className={`min-h-screen ${
        showBackground
          ? `bg-gradient-to-br ${gradient} dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`
          : ""
      } relative overflow-hidden`}
    >
      {/* Animated background elements */}
      {showBackground && (
        <>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-32 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full opacity-20 blur-3xl animate-float-slow" />
            <div className="absolute top-1/3 -right-24 w-80 h-80 bg-indigo-300 dark:bg-indigo-900 rounded-full opacity-20 blur-3xl animate-float-slower" />
            <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-pink-300 dark:bg-pink-900 rounded-full opacity-20 blur-3xl animate-float-slowest" />
          </div>

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </>
      )}

      {/* Content */}
      <div
        className={`relative z-10 ${maxWidthClass} mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 ${className}`}
      >
        {/* Page Header */}
        {(title || subtitle) && (
          <motion.div
            ref={headerRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 md:mb-12"
          >
            {icon && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-4"
              >
                {icon}
              </motion.div>
            )}

            {title && (
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3">
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {title}
                </span>
              </h1>
            )}

            {subtitle && (
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
                {subtitle}
              </p>
            )}

            {/* Decorative line */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100px" }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mt-4"
            />
          </motion.div>
        )}

        {/* Page Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default PageContainer;
