/**
 * Alert/Toast Component
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface AlertProps {
  type?: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  onClose?: () => void;
  showIcon?: boolean;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  type = "info",
  title,
  message,
  onClose,
  showIcon = true,
  className = "",
}) => {
  const config = {
    success: {
      icon: CheckCircleIcon,
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-500 dark:border-green-700",
      textColor: "text-green-800 dark:text-green-200",
      iconColor: "text-green-600 dark:text-green-400",
    },
    error: {
      icon: XCircleIcon,
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-500 dark:border-red-700",
      textColor: "text-red-800 dark:text-red-200",
      iconColor: "text-red-600 dark:text-red-400",
    },
    warning: {
      icon: ExclamationCircleIcon,
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      borderColor: "border-yellow-500 dark:border-yellow-700",
      textColor: "text-yellow-800 dark:text-yellow-200",
      iconColor: "text-yellow-600 dark:text-yellow-400",
    },
    info: {
      icon: InformationCircleIcon,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-500 dark:border-blue-700",
      textColor: "text-blue-800 dark:text-blue-200",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
  }[type];

  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className={`
          ${config.bgColor}
          ${config.borderColor}
          ${config.textColor}
          rounded-xl border-l-4 p-4
          shadow-lg
          ${className}
        `}
        role="alert"
      >
        <div className="flex items-start gap-3">
          {showIcon && (
            <Icon className={`w-6 h-6 flex-shrink-0 ${config.iconColor}`} />
          )}

          <div className="flex-1">
            {title && <p className="font-semibold mb-1">{title}</p>}
            <p className="text-sm">{message}</p>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              aria-label="Close alert"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Alert;
