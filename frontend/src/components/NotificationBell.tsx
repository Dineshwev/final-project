// src/components/NotificationBell.tsx - In-app notification dropdown
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

interface Alert {
  id: number;
  alertType: string;
  severity: "critical" | "warning" | "info";
  changeDescription: string;
  pageUrl: string;
  createdAt: string;
}

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUnreadCount();

    // Poll for new alerts every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      loadRecentAlerts();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const loadUnreadCount = async () => {
    try {
      const userId = user?.uid || "demo-user";
      const API_BASE_URL =
        process.env.REACT_APP_API_BASE_URL || "http://localhost:3002/api";
      const response = await fetch(
        `${API_BASE_URL}/alerts/unread-count?userId=${userId}`
      );
      const data = await response.json();

      if (data.success) {
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  };

  const loadRecentAlerts = async () => {
    try {
      setLoading(true);
      const userId = user?.uid || "demo-user";
      const API_BASE_URL =
        process.env.REACT_APP_API_BASE_URL || "http://localhost:3002/api";
      const response = await fetch(
        `${API_BASE_URL}/alerts?userId=${userId}&limit=10&isRead=false`
      );
      const data = await response.json();

      if (data.success) {
        setAlerts(data.data);
      }
    } catch (error) {
      console.error("Error loading recent alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: number) => {
    try {
      const userId = user?.uid || "demo-user";
      const API_BASE_URL =
        process.env.REACT_APP_API_BASE_URL || "http://localhost:3002/api";
      await fetch(`${API_BASE_URL}/alerts/${alertId}/read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking alert as read:", error);
    }
  };

  const getAlertIcon = (type: string) => {
    const icons: Record<string, string> = {
      title_change: "📝",
      meta_change: "📄",
      content_change: "✏️",
      status_change: "⚠️",
      broken_link: "🔗",
      new_page: "➕",
      removed_page: "🚫",
      performance_degradation: "🐌",
    };
    return icons[type] || "📌";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      default:
        return "text-blue-600";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
          </div>

          {/* Alerts List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading...</p>
              </div>
            ) : alerts.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">📭</span>
                </div>
                <p className="text-gray-900 font-medium">All caught up!</p>
                <p className="text-sm text-gray-500 mt-1">
                  No new notifications
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">
                        {getAlertIcon(alert.alertType)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                          {alert.changeDescription}
                        </p>
                        <p className="text-xs text-gray-500 truncate mb-1">
                          {alert.pageUrl}
                        </p>
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-medium ${getSeverityColor(
                              alert.severity
                            )}`}
                          >
                            {alert.severity.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(alert.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => markAsRead(alert.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-indigo-600"
                        title="Mark as read"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-5 py-3">
            <a
              href="/alerts"
              className="block text-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              View All Alerts →
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
