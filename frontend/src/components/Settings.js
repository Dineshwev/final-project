import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        {/* Profile Settings Section */}
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900">Profile Settings</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account information and preferences
          </p>
          <div className="mt-4 space-y-4">
            <Link
              to="/profile"
              className="block w-full text-left px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Account Management Section */}
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900">Account Management</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account security and preferences
          </p>
          <div className="mt-4 space-y-4">
            <Link
              to="/account/delete"
              className="block w-full text-left px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Account
            </Link>
          </div>
        </div>

        {/* API Settings Section */}
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900">API Settings</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your API keys and integration preferences
          </p>
          <div className="mt-4">
            {/* Add API key management here */}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
          <p className="mt-1 text-sm text-gray-500">
            Choose what updates you want to receive and how
          </p>
          <div className="mt-4">
            {/* Add notification preferences here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;