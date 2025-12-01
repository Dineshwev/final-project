import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const exportUserData = async (userId) => {
  try {
    const db = getFirestore();
    const storage = getStorage();
    const userData = {
      scanHistory: [],
      reports: [],
      settings: [],
      files: [],
    };

    // Fetch scan history
    const scanHistoryQuery = query(collection(db, 'scans'), where('userId', '==', userId));
    const scanHistoryDocs = await getDocs(scanHistoryQuery);
    userData.scanHistory = scanHistoryDocs.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Fetch reports
    const reportsQuery = query(collection(db, 'reports'), where('userId', '==', userId));
    const reportsDocs = await getDocs(reportsQuery);
    userData.reports = reportsDocs.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Fetch user settings
    const settingsQuery = query(collection(db, 'settings'), where('userId', '==', userId));
    const settingsDocs = await getDocs(settingsQuery);
    userData.settings = settingsDocs.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // List and fetch all user files from storage
    const userFilesRef = ref(storage, `users/${userId}`);
    try {
      const filesList = await listAll(userFilesRef);
      const fileUrls = await Promise.all(
        filesList.items.map(async (fileRef) => {
          const url = await getDownloadURL(fileRef);
          return {
            name: fileRef.name,
            url: url
          };
        })
      );
      userData.files = fileUrls;
    } catch (error) {
      console.log('No files found in storage or storage access error:', error);
    }

    // Generate export file
    const exportData = JSON.stringify(userData, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `user_data_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Error exporting user data:', error);
    return { success: false, error: error.message };
  }
};