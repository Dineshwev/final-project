// src/pages/Settings.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaSave, FaKey, FaBell, FaUser, FaLock } from "../components/Icons";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import PageContainer from "../components/PageContainer";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Alert from "../components/Alert";
import { fadeIn, slideUp } from "../utils/animations";

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // User Profile State
  const [userProfile, setUserProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    company: "Acme Inc.",
    website: "https://example.com",
  });

  // API Keys State
  const [apiKeys, setApiKeys] = useState({
    pageSpeedInsightsKey: "•••••••••••••••••",
    whoApiKey: "•••••••••••••••••",
    safeBrowsingKey: "•••••••••••••••••",
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailReports: true,
    weeklyDigest: true,
    securityAlerts: true,
    newFeatures: false,
  });

  // Password Change State
  const [passwordChange, setPasswordChange] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // API call to update profile would go here
    setSuccessMessage("Profile updated successfully");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleApiKeysSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // API call to update API keys would go here
    setSuccessMessage("API keys updated successfully");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleNotificationSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // API call to update notification settings would go here
    setSuccessMessage("Notification settings updated successfully");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      alert("New passwords don't match");
      return;
    }

    // API call to change password would go here
    setSuccessMessage("Password changed successfully");
    setTimeout(() => setSuccessMessage(null), 3000);

    // Clear password fields
    setPasswordChange({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <PageContainer
      title="Settings"
      subtitle="Manage your account preferences and configurations"
      icon={<Cog6ToothIcon className="w-8 h-8" />}
      maxWidth="7xl"
    >
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Alert
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage(null)}
          />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="lg:col-span-1"
        >
          <Card variant="glass" padding="md">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                  activeTab === "profile"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-700 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <FaUser className="mr-3 h-4 w-4" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab("apiKeys")}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === "apiKeys"
                    ? "bg-blue-400 text-blue-700"
                    : "text-gray-700 hover:bg-gray-00"
                }`}
              >
                <FaKey className="mr-3 h-4 w-4" />
                API Keys
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === "notifications"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FaBell className="mr-3 h-4 w-4" />
                Notifications
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === "password"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FaLock className="mr-3 h-4 w-4" />
                Password
              </button>
            </nav>
          </Card>
        </motion.div>

        {/* Content */}
        <motion.div
          variants={slideUp}
          initial="hidden"
          animate="visible"
          className="lg:col-span-3"
        >
          <Card variant="glass" padding="lg">
            {activeTab === "profile" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Profile Information
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Update your personal details
                  </p>
                </div>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Full Name"
                      type="text"
                      name="name"
                      value={userProfile.name}
                      onChange={(e) =>
                        setUserProfile({ ...userProfile, name: e.target.value })
                      }
                      icon={<FaUser />}
                      required
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      name="email"
                      value={userProfile.email}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          email: e.target.value,
                        })
                      }
                      icon={<FaUser />}
                      disabled
                      helperText="Email cannot be changed"
                    />

                    <Input
                      label="Company"
                      type="text"
                      name="company"
                      value={userProfile.company}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          company: e.target.value,
                        })
                      }
                    />

                    <Input
                      label="Website"
                      type="url"
                      name="website"
                      value={userProfile.website}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          website: e.target.value,
                        })
                      }
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" variant="primary" icon={<FaSave />}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "apiKeys" && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  API Keys
                </h2>
                <form onSubmit={handleApiKeysSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="pageSpeedInsightsKey"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Google PageSpeed Insights API Key
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          name="pageSpeedInsightsKey"
                          id="pageSpeedInsightsKey"
                          value={apiKeys.pageSpeedInsightsKey}
                          onChange={(e) =>
                            setApiKeys({
                              ...apiKeys,
                              pageSpeedInsightsKey: e.target.value,
                            })
                          }
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Required for performance analysis.{" "}
                        <a
                          href="https://developers.google.com/speed/docs/insights/v5/get-started"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-500"
                        >
                          Learn more
                        </a>
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="whoApiKey"
                        className="block text-sm font-medium text-gray-700"
                      >
                        WhoAPI Key
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          name="whoApiKey"
                          id="whoApiKey"
                          value={apiKeys.whoApiKey}
                          onChange={(e) =>
                            setApiKeys({
                              ...apiKeys,
                              whoApiKey: e.target.value,
                            })
                          }
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Used for domain information.{" "}
                        <a
                          href="https://whoapi.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-500"
                        >
                          Learn more
                        </a>
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="safeBrowsingKey"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Google Safe Browsing API Key
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          name="safeBrowsingKey"
                          id="safeBrowsingKey"
                          value={apiKeys.safeBrowsingKey}
                          onChange={(e) =>
                            setApiKeys({
                              ...apiKeys,
                              safeBrowsingKey: e.target.value,
                            })
                          }
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Required for security analysis.{" "}
                        <a
                          href="https://developers.google.com/safe-browsing/v4/get-started"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-500"
                        >
                          Learn more
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button type="submit" variant="primary">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "notifications" && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Notification Preferences
                </h2>
                <form onSubmit={handleNotificationSettingsSubmit}>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="emailReports"
                          name="emailReports"
                          type="checkbox"
                          checked={notificationSettings.emailReports}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              emailReports: e.target.checked,
                            })
                          }
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="emailReports"
                          className="font-medium text-gray-700"
                        >
                          Email Reports
                        </label>
                        <p className="text-gray-500">
                          Receive scan results via email
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="weeklyDigest"
                          name="weeklyDigest"
                          type="checkbox"
                          checked={notificationSettings.weeklyDigest}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              weeklyDigest: e.target.checked,
                            })
                          }
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="weeklyDigest"
                          className="font-medium text-gray-700"
                        >
                          Weekly Digest
                        </label>
                        <p className="text-gray-500">
                          Get a weekly summary of all your website's performance
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="securityAlerts"
                          name="securityAlerts"
                          type="checkbox"
                          checked={notificationSettings.securityAlerts}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              securityAlerts: e.target.checked,
                            })
                          }
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="securityAlerts"
                          className="font-medium text-gray-700"
                        >
                          Security Alerts
                        </label>
                        <p className="text-gray-500">
                          Receive immediate notifications about security issues
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="newFeatures"
                          name="newFeatures"
                          type="checkbox"
                          checked={notificationSettings.newFeatures}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              newFeatures: e.target.checked,
                            })
                          }
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="newFeatures"
                          className="font-medium text-gray-700"
                        >
                          Product Updates
                        </label>
                        <p className="text-gray-500">
                          Get notified about new features and improvements
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FaSave className="mr-2 -ml-1 h-4 w-4" />
                      Save Preferences
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "password" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Change Password
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Update your password to keep your account secure
                  </p>
                </div>
                <form
                  onSubmit={handlePasswordChangeSubmit}
                  className="space-y-6"
                >
                  <Input
                    label="Current Password"
                    type="password"
                    name="currentPassword"
                    value={passwordChange.currentPassword}
                    onChange={(e) =>
                      setPasswordChange({
                        ...passwordChange,
                        currentPassword: e.target.value,
                      })
                    }
                    icon={<FaLock />}
                    required
                  />

                  <Input
                    label="New Password"
                    type="password"
                    name="newPassword"
                    value={passwordChange.newPassword}
                    onChange={(e) =>
                      setPasswordChange({
                        ...passwordChange,
                        newPassword: e.target.value,
                      })
                    }
                    icon={<FaLock />}
                    helperText="Must be at least 8 characters and include a number and a symbol"
                    required
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    name="confirmPassword"
                    value={passwordChange.confirmPassword}
                    onChange={(e) =>
                      setPasswordChange({
                        ...passwordChange,
                        confirmPassword: e.target.value,
                      })
                    }
                    icon={<FaLock />}
                    required
                  />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      icon={<FaLock />}
                      iconPosition="left"
                    >
                      Update Password
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default Settings;
