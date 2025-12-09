// src/pages/AlertSettings.tsx - Configure alert preferences
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

interface AlertSetting {
  alertType: string;
  isEnabled: boolean;
  notificationChannel: "email" | "in_app" | "webhook";
  frequency: "immediate" | "daily" | "weekly";
  webhookUrl?: string;
  thresholdSettings?: {
    contentChangePercent?: number;
    loadTimeIncrease?: number;
    linkChangePercent?: number;
  };
}

const AlertSettings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AlertSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [projectName, setProjectName] = useState("");

  const alertTypes = [
    {
      type: "title_change",
      label: "Title Tag Changes",
      description: "Alert when page title tags are modified",
      icon: "📝",
      category: "Content Changes",
    },
    {
      type: "meta_change",
      label: "Meta Description Changes",
      description: "Alert when meta descriptions are updated",
      icon: "📄",
      category: "Content Changes",
    },
    {
      type: "content_change",
      label: "Significant Content Updates",
      description: "Alert when page content changes significantly",
      icon: "✏️",
      category: "Content Changes",
      hasThreshold: true,
    },
    {
      type: "status_change",
      label: "HTTP Status Code Changes",
      description: "Alert when pages return different status codes",
      icon: "⚠️",
      category: "Technical Issues",
    },
    {
      type: "broken_link",
      label: "New Broken Links",
      description: "Alert when broken links are detected",
      icon: "🔗",
      category: "Technical Issues",
    },
    {
      type: "performance_degradation",
      label: "Page Load Time Degradation",
      description: "Alert when page load times increase",
      icon: "🐌",
      category: "Technical Issues",
      hasThreshold: true,
    },
    {
      type: "new_page",
      label: "New Pages Added",
      description: "Alert when new pages are discovered",
      icon: "➕",
      category: "Site Structure",
    },
    {
      type: "removed_page",
      label: "Pages Removed (404s)",
      description: "Alert when pages return 404 errors",
      icon: "🚫",
      category: "Site Structure",
    },
  ];

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const userId = user?.uid || "demo-user";
      const API_BASE_URL =
        process.env.REACT_APP_API_BASE_URL || "http://irpwi5mww.ap-southeast-2.awsapprunner.com/api";

      const response = await fetch(
        `${API_BASE_URL}/alerts/settings?userId=${userId}${
          projectName ? `&projectName=${projectName}` : ""
        }`
      );
      const data = await response.json();

      if (data.success) {
        if (data.isDefault) {
          // Use default settings
          setSettings(data.data);
        } else {
          setSettings(data.data);
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      setMessage({ type: "error", text: "Failed to load alert settings" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (alertType: string) => {
    setSettings((prev) =>
      prev.map((s) =>
        s.alertType === alertType ? { ...s, isEnabled: !s.isEnabled } : s
      )
    );
  };

  const handleChannelChange = (
    alertType: string,
    channel: "email" | "in_app" | "webhook"
  ) => {
    setSettings((prev) =>
      prev.map((s) =>
        s.alertType === alertType ? { ...s, notificationChannel: channel } : s
      )
    );
  };

  const handleFrequencyChange = (
    alertType: string,
    frequency: "immediate" | "daily" | "weekly"
  ) => {
    setSettings((prev) =>
      prev.map((s) => (s.alertType === alertType ? { ...s, frequency } : s))
    );
  };

  const handleThresholdChange = (
    alertType: string,
    key: string,
    value: number
  ) => {
    setSettings((prev) =>
      prev.map((s) =>
        s.alertType === alertType
          ? {
              ...s,
              thresholdSettings: {
                ...s.thresholdSettings,
                [key]: value,
              },
            }
          : s
      )
    );
  };

  const handleWebhookUrlChange = (alertType: string, url: string) => {
    setSettings((prev) =>
      prev.map((s) =>
        s.alertType === alertType ? { ...s, webhookUrl: url } : s
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const userId = user?.uid || "demo-user";
      const API_BASE_URL =
        process.env.REACT_APP_API_BASE_URL || "http://irpwi5mww.ap-southeast-2.awsapprunner.com/api";

      const response = await fetch(`${API_BASE_URL}/alerts/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          settings: settings.map((s) => ({
            ...s,
            projectName: projectName || null,
          })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Alert settings saved successfully!",
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to save settings",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({ type: "error", text: "Failed to save alert settings" });
    } finally {
      setSaving(false);
    }
  };

  const getSetting = (alertType: string): AlertSetting | undefined => {
    return settings.find((s) => s.alertType === alertType);
  };

  const groupedAlerts = alertTypes.reduce((acc, alert) => {
    if (!acc[alert.category]) {
      acc[alert.category] = [];
    }
    acc[alert.category].push(alert);
    return acc;
  }, {} as Record<string, typeof alertTypes>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading alert settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
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
            Alert Settings
          </h1>
          <p className="text-gray-600">
            Configure when and how you receive SEO change alerts
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === "success" ? "✓" : "✗"}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* Project Filter */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Project (Optional)
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Leave empty for global settings, or enter domain (e.g., example.com)"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <p className="mt-2 text-xs text-gray-500">
            Configure settings for a specific project or leave empty for global
            defaults
          </p>
        </div>

        {/* Alert Type Groups */}
        {Object.entries(groupedAlerts).map(([category, alerts]) => (
          <div
            key={category}
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
              {category}
            </h2>

            <div className="space-y-4">
              {alerts.map((alert) => {
                const setting = getSetting(alert.type);
                const isEnabled = setting?.isEnabled ?? true;

                return (
                  <div
                    key={alert.type}
                    className={`p-5 rounded-xl border-2 transition-all duration-200 ${
                      isEnabled
                        ? "border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    {/* Alert Type Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-2xl">{alert.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {alert.label}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {alert.description}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => handleToggle(alert.type)}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    {/* Settings (only show when enabled) */}
                    {isEnabled && (
                      <div className="ml-11 space-y-4 pt-4 border-t border-gray-200">
                        {/* Notification Channel */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Notification Channel
                          </label>
                          <div className="flex gap-2">
                            {(["in_app", "email", "webhook"] as const).map(
                              (channel) => (
                                <button
                                  key={channel}
                                  onClick={() =>
                                    handleChannelChange(alert.type, channel)
                                  }
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    setting?.notificationChannel === channel
                                      ? "bg-indigo-600 text-white shadow-md"
                                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                  }`}
                                >
                                  {channel === "in_app" && "🔔 In-App"}
                                  {channel === "email" && "📧 Email"}
                                  {channel === "webhook" && "🔗 Webhook"}
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        {/* Webhook URL (only if webhook selected) */}
                        {setting?.notificationChannel === "webhook" && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Webhook URL
                            </label>
                            <input
                              type="url"
                              value={setting?.webhookUrl || ""}
                              onChange={(e) =>
                                handleWebhookUrlChange(
                                  alert.type,
                                  e.target.value
                                )
                              }
                              placeholder="https://hooks.slack.com/services/..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            />
                          </div>
                        )}

                        {/* Frequency */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Notification Frequency
                          </label>
                          <div className="flex gap-2">
                            {(["immediate", "daily", "weekly"] as const).map(
                              (freq) => (
                                <button
                                  key={freq}
                                  onClick={() =>
                                    handleFrequencyChange(alert.type, freq)
                                  }
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    setting?.frequency === freq
                                      ? "bg-purple-600 text-white shadow-md"
                                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                  }`}
                                >
                                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        {/* Thresholds (if applicable) */}
                        {alert.hasThreshold && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Alert Threshold
                            </label>
                            {alert.type === "content_change" && (
                              <div className="flex items-center gap-3">
                                <input
                                  type="number"
                                  value={
                                    setting?.thresholdSettings
                                      ?.contentChangePercent || 10
                                  }
                                  onChange={(e) =>
                                    handleThresholdChange(
                                      alert.type,
                                      "contentChangePercent",
                                      parseInt(e.target.value)
                                    )
                                  }
                                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                  min="1"
                                  max="100"
                                />
                                <span className="text-sm text-gray-600">
                                  % word count change
                                </span>
                              </div>
                            )}
                            {alert.type === "performance_degradation" && (
                              <div className="flex items-center gap-3">
                                <input
                                  type="number"
                                  value={
                                    setting?.thresholdSettings
                                      ?.loadTimeIncrease || 2000
                                  }
                                  onChange={(e) =>
                                    handleThresholdChange(
                                      alert.type,
                                      "loadTimeIncrease",
                                      parseInt(e.target.value)
                                    )
                                  }
                                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                  min="100"
                                  step="100"
                                />
                                <span className="text-sm text-gray-600">
                                  ms load time increase
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold border border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
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
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertSettings;
