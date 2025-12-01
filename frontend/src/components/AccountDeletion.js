import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { deleteUserAccount } from '../services/authService';
import { exportUserData } from '../services/exportService';
import ConfirmationModal from './ConfirmationModal';
import Notification from './Notification';
import DataPreview from './DataPreview';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  listAll, 
  getDownloadURL 
} from 'firebase/storage';

const AccountDeletion = () => {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [notification, setNotification] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');
  const [previewData, setPreviewData] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const isPasswordRequired = user?.providerData[0]?.providerId === 'password';
  const isDeleteEnabled = (isPasswordRequired ? password.length > 0 : true) && 
                        confirmText.toLowerCase() === 'delete my account';

  const handleExportClick = async () => {
    setIsExporting(true);
    try {
      const db = getFirestore();
      const storage = getStorage();
      
      // Fetch preview data with better error handling
      let scanHistory = [], reports = [], settings = {}, files = [];
      
      try {
        const scanHistoryQuery = query(collection(db, 'scans'), where('userId', '==', user.uid));
        const scanHistoryDocs = await getDocs(scanHistoryQuery);
        scanHistory = scanHistoryDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error fetching scan history:', error);
        setNotification({
          type: 'warning',
          message: 'Some scan history data could not be loaded'
        });
      }

      try {
        const reportsQuery = query(collection(db, 'reports'), where('userId', '==', user.uid));
        const reportsDocs = await getDocs(reportsQuery);
        reports = reportsDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error fetching reports:', error);
        setNotification({
          type: 'warning',
          message: 'Some report data could not be loaded'
        });
      }

      try {
        const settingsQuery = query(collection(db, 'settings'), where('userId', '==', user.uid));
        const settingsDocs = await getDocs(settingsQuery);
        settingsDocs.docs.forEach(doc => {
          Object.assign(settings, doc.data());
        });
      } catch (error) {
        console.error('Error fetching settings:', error);
        setNotification({
          type: 'warning',
          message: 'Some settings data could not be loaded'
        });
      }

      try {
        const userFilesRef = ref(storage, `users/${user.uid}`);
        const filesList = await listAll(userFilesRef);
        files = await Promise.all(
          filesList.items.map(async (fileRef) => ({
            name: fileRef.name,
            url: await getDownloadURL(fileRef)
          }))
        );
      } catch (error) {
        console.error('Error fetching files:', error);
        if (error.code !== 'storage/object-not-found') {
          setNotification({
            type: 'warning',
            message: 'Some file data could not be loaded'
          });
        }
      }

      setPreviewData({
        scanHistory,
        reports,
        settings,
        files
      });
      setShowPreview(true);
    } catch (error) {
      setNotification({
        type: 'error',
        message: `Failed to prepare data preview: ${error.message}`
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportData = async (filteredData) => {
    setIsExporting(true);
    try {
      const result = await exportUserData(user.uid, exportFormat, filteredData);
      if (result.success) {
        setNotification({
          type: 'success',
          message: `Your data has been exported successfully in ${exportFormat.toUpperCase()} format. Download should begin automatically.`
        });
        setShowPreview(false);
      } else {
        throw new Error(result.error || 'Failed to export data');
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: `Failed to export data: ${error.message}`
      });
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    let timer;
    if (showModal && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [showModal, countdown]);

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setShowModal(true);
    setCountdown(5);
  };

  const handleConfirmDelete = async () => {
    if (countdown > 0) return;
    
    setError('');
    setLoading(true);
    setShowModal(false);
    
    try {
      const { error } = await deleteUserAccount(password);
      if (error) {
        setError(error);
      } else {
        setNotification({
          type: 'success',
          message: 'Your account has been successfully deleted.'
        });
        // Short delay to show the success message before redirecting
        setTimeout(() => {
          navigate('/register');
        }, 2000);
      }
    } catch (err) {
      setError('Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
    }

    try {
      const { error } = await deleteUserAccount(password);
      if (error) {
        setError(error);
      } else {
        // Account deleted successfully, redirect to registration page
        navigate('/register');
      }
    } catch (err) {
      setError('Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-red-600">Delete Account</h2>
        <p className="mt-2 text-gray-600">
          This action is permanent and cannot be undone. All your data will be permanently deleted.
        </p>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          Download Your Data
        </h3>
        <p className="text-sm text-blue-600 mb-3">
          Before deleting your account, you may want to export your data for future reference.
        </p>
        <button
          type="button"
          onClick={handleExportClick}
          disabled={isExporting}
          className="w-full py-2 px-4 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isExporting ? 'Preparing Export...' : 'Preview & Export Data'}
        </button>

        {showPreview && previewData && (
          <DataPreview
            data={previewData}
            onClose={() => setShowPreview(false)}
            onExport={handleExportData}
            exportFormat={exportFormat}
            setExportFormat={setExportFormat}
            isExporting={isExporting}
          />
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleDeleteAccount} className="space-y-6">
        {isPasswordRequired && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Confirm your password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              disabled={loading}
              required
            />
          </div>
        )}

        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600 mb-4">
            To confirm deletion, please type "delete my account" in the box below:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            placeholder="delete my account"
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-4">
          <button
            type="submit"
            disabled={!isDeleteEnabled || loading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Deleting Account...' : 'Delete Account'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading}
          >
            Cancel
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <h3 className="font-medium text-gray-700">What will be deleted:</h3>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Your account and profile information</li>
            <li>All your scan history and reports</li>
            <li>Your saved API keys and settings</li>
            <li>All uploaded files and profile pictures</li>
          </ul>
        </div>
      </form>

      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Account Deletion"
        message={
          countdown > 0
            ? `Please wait ${countdown} seconds before confirming. This action cannot be undone.`
            : "Are you absolutely sure you want to delete your account? This action cannot be undone."
        }
        confirmButtonText={countdown > 0 ? `Wait ${countdown}s...` : "Yes, Delete My Account"}
        isDestructive={true}
      />
    </div>
  );
};

export default AccountDeletion;