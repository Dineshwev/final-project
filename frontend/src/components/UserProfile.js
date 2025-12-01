import React, { useState, useEffect } from 'react';
import apiService from '../services/api.js';
import { useAuth } from '../context/AuthContext';
import {
  UserCircleIcon,
  EnvelopeIcon,
  CalendarIcon,
  ShieldCheckIcon,
  CameraIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
  ClockIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';

const UserProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState({
    displayName: '',
    company: '',
    jobTitle: '',
    phone: '',
    website: '',
    bio: '',
    photoURL: ''
  });
  const [stats, setStats] = useState({
    totalScans: 0,
    avgPerformance: 0,
    lastScan: null
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          // Try to load user profile service
          try {
            const { getUserProfile } = await import('../services/userProfileService');
            const { profile, error: profileError } = await getUserProfile(user.uid);
            if (profileError) {
              console.warn('Profile service error:', profileError);
            } else if (profile) {
              setProfileData(prev => ({
                ...prev,
                ...profile,
                displayName: profile.displayName || user.displayName || '',
                photoURL: profile.photoURL || user.photoURL || ''
              }));
            }
          } catch (serviceError) {
            console.warn('Profile service not available:', serviceError);
          }

          // Set basic user data
          setProfileData(prev => ({
            ...prev,
            displayName: prev.displayName || user.displayName || user.email?.split('@')[0] || '',
            photoURL: prev.photoURL || user.photoURL || ''
          }));

          // Fetch stats using centralized API service
          try {
            const historyResponse = await apiService.getScanHistory(1, 25);
            if (historyResponse.success) {
              const backendData = historyResponse.data; // Expect shape { scans: [...] }
              const scans = backendData.scans || backendData.data?.scans || [];
              if (scans.length > 0) {
                const total = scans.length;
                const avgPerf = scans.reduce((sum, scan) => sum + (scan.scores?.performance || 0), 0) / total;
                setStats({
                  totalScans: total,
                  avgPerformance: Math.round(avgPerf),
                  lastScan: scans[0]?.timestamp
                });
              }
            } else {
              console.warn('Failed to load stats:', historyResponse.error);
            }
          } catch (statsError) {
            console.warn('Could not load stats:', statsError);
          }

          setLoading(false);
        } catch (err) {
          console.error('Error loading profile:', err);
          setError('Failed to load profile');
          setLoading(false);
        }
      }
    };

    loadProfile();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      try {
        const { uploadProfilePicture } = await import('../services/userProfileService');
        const { photoURL, error: uploadError } = await uploadProfilePicture(user.uid, file);
        if (uploadError) {
          setError(uploadError);
        } else {
          setProfileData(prev => ({ ...prev, photoURL }));
          setSuccess('Profile picture updated successfully!');
        }
      } catch (serviceError) {
        setError('Profile picture upload service not available');
      }
    } catch (err) {
      setError('Failed to upload profile picture');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      try {
        const { updateUserProfile } = await import('../services/userProfileService');
        const { error: updateError } = await updateUserProfile(user.uid, profileData);
        if (updateError) {
          setError(updateError);
        } else {
          setSuccess('Profile updated successfully!');
        }
      } catch (serviceError) {
        setError('Profile update service not available');
      }
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              {profileData.photoURL ? (
                <img
                  src={profileData.photoURL}
                  alt="Profile"
                  className="h-32 w-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="h-32 w-32 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center">
                  <UserCircleIcon className="h-24 w-24 text-blue-600" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-100 transition-all">
                <CameraIcon className="h-5 w-5 text-blue-600" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={saving}
                />
              </label>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                {profileData.displayName || 'Your Name'}
              </h1>
              <p className="text-blue-100 flex items-center space-x-2">
                <EnvelopeIcon className="h-5 w-5" />
                <span>{user?.email}</span>
              </p>
              {user?.metadata?.creationTime && (
                <p className="text-blue-100 flex items-center space-x-2 mt-1">
                  <CalendarIcon className="h-5 w-5" />
                  <span>Member since {new Date(user.metadata.creationTime).toLocaleDateString()}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <ExclamationCircleIcon className="h-6 w-6 text-red-500 mr-3" />
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
              <span className="text-green-800 font-medium">{success}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ShieldCheckIcon className="h-5 w-5" />
                  <span>Overview</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                  activeTab === 'edit'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <UserCircleIcon className="h-5 w-5" />
                  <span>Edit Profile</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <ChartBarIcon className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900">{stats.totalScans}</h3>
                  <p className="text-blue-700 text-sm">Total Scans</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <DocumentCheckIcon className="h-10 w-10 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-purple-900">{stats.avgPerformance}%</h3>
                  <p className="text-purple-700 text-sm">Avg Performance</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <ClockIcon className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-900">
                    {stats.lastScan ? new Date(stats.lastScan).toLocaleDateString() : 'N/A'}
                  </h3>
                  <p className="text-green-700 text-sm">Last Scan</p>
                </div>
              </div>

              {/* Account Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Display Name</p>
                    <p className="font-medium text-gray-900">{profileData.displayName || 'Not set'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-medium text-gray-900">{user?.email}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Company</p>
                    <p className="font-medium text-gray-900">{profileData.company || 'Not set'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Job Title</p>
                    <p className="font-medium text-gray-900">{profileData.jobTitle || 'Not set'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Tab */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="displayName" className="block text-sm font-semibold text-gray-900 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    id="displayName"
                    value={profileData.displayName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter your name"
                    disabled={saving}
                  />
                </div>

                {/* Company */}
                <div>
                  <label htmlFor="company" className="block text-sm font-semibold text-gray-900 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    id="company"
                    value={profileData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Your company name"
                    disabled={saving}
                  />
                </div>

                {/* Job Title */}
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-semibold text-gray-900 mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    id="jobTitle"
                    value={profileData.jobTitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Your job title"
                    disabled={saving}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="+1 (555) 123-4567"
                    disabled={saving}
                  />
                </div>

                {/* Website */}
                <div>
                  <label htmlFor="website" className="block text-sm font-semibold text-gray-900 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    id="website"
                    value={profileData.website}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="https://yourwebsite.com"
                    disabled={saving}
                  />
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-semibold text-gray-900 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    id="bio"
                    rows={4}
                    value={profileData.bio}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Tell us about yourself..."
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg transition-all transform hover:scale-105"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;