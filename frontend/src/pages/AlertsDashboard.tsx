// src/pages/AlertsDashboard.tsx - View and manage alerts
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

interface Alert {
  id: number;
  alertType: string;
  severity: "critical" | "warning" | "info";
  pageUrl: string;
  changeDescription: string;
  oldValue: string | null;
  newValue: string | null;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

const AlertsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    alertType: "",
    severity: "",
    isRead: "",
    search: "",
  });
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadAlerts();
    loadStats();
  }, [user, filter]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const userId = user?.uid || "demo-user";
      const API_BASE_URL =
        process.env.REACT_APP_API_BASE_URL || "http://irpwi5mww.ap-southeast-2.awsapprunner.com/api";

      const params = new URLSearchParams({
        userId,
        ...Object.fromEntries(
          Object.entries(filter).filter(([_, v]) => v !== "")
        ),
      });

      const response = await fetch(`${API_BASE_URL}/alerts?${params}`);
      const data = await response.json();

      if (data.success) {
        setAlerts(data.data);
      }
    } catch (error) {
      console.error("Error loading alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const userId = user?.uid || "demo-user";
      const API_BASE_URL =
        process.env.REACT_APP_API_BASE_URL || "http://irpwi5mww.ap-southeast-2.awsapprunner.com/api";
      const response = await fetch(
        `${API_BASE_URL}/alerts/stats?userId=${userId}`
      );
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const markAsRead = async (alertId: number) => {
    try {
      const userId = user?.uid || "demo-user";
      const API_BASE_URL =
        process.env.REACT_APP_API_BASE_URL || "http://irpwi5mww.ap-southeast-2.awsapprunner.com/api";
      const response = await fetch(`${API_BASE_URL}/alerts/${alertId}/read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
        );
        loadStats();
      }
    } catch (error) {
      console.error("Error marking alert as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const userId = user?.uid || "demo-user";
      const API_BASE_URL =
        process.env.REACT_APP_API_BASE_URL || "http://irpwi5mww.ap-southeast-2.awsapprunner.com/api";
      const response = await fetch(`${API_BASE_URL}/alerts/mark-all-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
        loadStats();
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteAlert = async (alertId: number) => {
    if (!window.confirm("Are you sure you want to delete this alert?")) return;

    try {
      const userId = user?.uid || "demo-user";
      const API_BASE_URL =
        process.env.REACT_APP_API_BASE_URL || "http://irpwi5mww.ap-southeast-2.awsapprunner.com/api";
      const response = await fetch(
        `${API_BASE_URL}/alerts/${alertId}?userId=${userId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setAlerts((prev) => prev.filter((a) => a.id !== alertId));
        setSelectedAlert(null);
        loadStats();
      }
    } catch (error) {
      console.error("Error deleting alert:", error);
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
      heading_change: "🏷️",
      link_change: "🔀",
    };
    return icons[type] || "📌";
  };

  const getAlertLabel = (type: string) => {
    const labels: Record<string, string> = {
      title_change: "Title Changed",
      meta_change: "Meta Description Changed",
      content_change: "Content Modified",
      status_change: "Status Code Changed",
      broken_link: "Broken Links",
      new_page: "New Page",
      removed_page: "Page Removed",
      performance_degradation: "Performance Issue",
      heading_change: "Headings Changed",
      link_change: "Links Changed",
    };
    return labels[type] || type;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (
      filter.search &&
      !alert.pageUrl.toLowerCase().includes(filter.search.toLowerCase()) &&
      !alert.changeDescription
        .toLowerCase()
        .includes(filter.search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  if (loading && alerts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
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
              </div>
              Alerts Dashboard
            </h1>
            <p className="text-gray-600">
              Monitor SEO changes and receive notifications
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-white text-gray-700 rounded-xl font-medium border border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
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
              Mark All Read
            </button>
            <a
              href="/alert-settings"
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Settings
            </a>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-md p-5 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Total Alerts
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.total}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-md p-5 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Unread</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.unread}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📬</span>
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-md p-5 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Critical</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">
                    {stats.bySeverity?.critical || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🚨</span>
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-md p-5 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Warnings</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">
                    {stats.bySeverity?.warning || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-md p-5 border border-white/20 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search alerts..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <select
              value={filter.severity}
              onChange={(e) =>
                setFilter({ ...filter, severity: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
            <select
              value={filter.alertType}
              onChange={(e) =>
                setFilter({ ...filter, alertType: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="title_change">Title Changes</option>
              <option value="meta_change">Meta Changes</option>
              <option value="content_change">Content Changes</option>
              <option value="status_change">Status Changes</option>
              <option value="broken_link">Broken Links</option>
            </select>
            <select
              value={filter.isRead}
              onChange={(e) => setFilter({ ...filter, isRead: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="false">Unread Only</option>
              <option value="true">Read Only</option>
            </select>
          </div>
        </div>

        {/* Alerts List */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-white/20 overflow-hidden">
          {filteredAlerts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📭</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No alerts found
              </h3>
              <p className="text-gray-600">
                You're all caught up! No alerts match your current filters.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-5 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !alert.isRead ? "bg-blue-50/50" : ""
                  }`}
                  onClick={() => {
                    setSelectedAlert(alert);
                    if (!alert.isRead) markAsRead(alert.id);
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">
                      {getAlertIcon(alert.alertType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-gray-900">
                          {getAlertLabel(alert.alertType)}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
                            alert.severity
                          )}`}
                        >
                          {alert.severity.toUpperCase()}
                        </span>
                        {!alert.isRead && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {alert.changeDescription}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        📄 {alert.pageUrl}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAlert(alert.id);
                      }}
                      className="text-gray-400 hover:text-red-600 transition-colors"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alert Detail Modal */}
        {selectedAlert && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedAlert(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">
                      {getAlertIcon(selectedAlert.alertType)}
                    </span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {getAlertLabel(selectedAlert.alertType)}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(selectedAlert.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAlert(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${getSeverityColor(
                      selectedAlert.severity
                    )}`}
                  >
                    {selectedAlert.severity.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700">
                    {selectedAlert.changeDescription}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Affected Page
                  </h3>
                  <a
                    href={selectedAlert.pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 underline break-all"
                  >
                    {selectedAlert.pageUrl}
                  </a>
                </div>

                {(selectedAlert.oldValue || selectedAlert.newValue) && (
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Changes Detected
                    </h3>
                    <div className="space-y-4">
                      {selectedAlert.oldValue && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold text-red-600 uppercase">
                              Previous
                            </span>
                            <div className="flex-1 h-px bg-red-200"></div>
                          </div>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-gray-700">
                            {selectedAlert.oldValue}
                          </div>
                        </div>
                      )}
                      {selectedAlert.newValue && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold text-green-600 uppercase">
                              Current
                            </span>
                            <div className="flex-1 h-px bg-green-200"></div>
                          </div>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-gray-700">
                            {selectedAlert.newValue}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedAlert.metadata &&
                  Object.keys(selectedAlert.metadata).length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Additional Details
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 text-sm">
                        <pre className="whitespace-pre-wrap text-gray-700">
                          {JSON.stringify(selectedAlert.metadata, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => deleteAlert(selectedAlert.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Delete Alert
                </button>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsDashboard;
