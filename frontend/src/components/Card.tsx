/**
 * Professional Card Component with animations
 */

import React from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  variant?: "glass" | "gradient" | "standard";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  onClick?: () => void;
  delay?: number;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hover = false,
  variant = "standard",
  padding = "lg",
  onClick,
  delay = 0,
}) => {
  const paddingClass = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-6 md:p-8",
    xl: "p-8 md:p-10",
  }[padding];

  const baseClasses = `
    rounded-2xl
    ${paddingClass}
    transition-all duration-300
    ${onClick ? "cursor-pointer" : ""}
    ${className}
  `;

  const styleVariants =
    variant === "glass"
      ? "glass-strong border border-white/20 shadow-xl"
      : variant === "gradient"
      ? "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg"
      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl";

  const CardContent = (
    <div className={`${baseClasses} ${styleVariants}`} onClick={onClick}>
      {children}
    </div>
  );

  if (hover) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={hover ? { scale: 1.02, y: -5 } : undefined}
        transition={{ duration: 0.5, delay }}
      >
        {CardContent}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {CardContent}
    </motion.div>
  );
};

export default Card;
