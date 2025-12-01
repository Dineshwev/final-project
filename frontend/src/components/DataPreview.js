import React, { useState, useMemo, useEffect } from 'react';
import { calculateSize, calculateCompressedSize, formatSize, shouldCompress } from '../utils/compression';
import { validateData } from '../utils/dataValidation';
import FieldSelector from './FieldSelector';
import ProgressTracker from './ProgressTracker';

const ITEMS_PER_PAGE = 10;

const DataPreview = ({ data, onClose, onExport, exportFormat, setExportFormat, isExporting }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSections, setSelectedSections] = useState({
    scanHistory: true,
    reports: true,
    settings: true,
    files: true
  });
  const [selectedFields, setSelectedFields] = useState({
    scanHistory: [],
    reports: [],
    settings: [],
    files: []
  });
  const [activeTab, setActiveTab] = useState('summary');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSize, setTotalSize] = useState({ raw: 0, compressed: 0 });
  const [activeSectionView, setActiveSectionView] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState(null);

  // Initialize selected fields when data changes
  useEffect(() => {
    const newSelectedFields = {};
    Object.entries(data).forEach(([section, sectionData]) => {
      if (Array.isArray(sectionData) && sectionData.length > 0) {
        newSelectedFields[section] = Object.keys(sectionData[0]);
      } else if (typeof sectionData === 'object') {
        newSelectedFields[section] = Object.keys(sectionData);
      }
    });
    setSelectedFields(newSelectedFields);
  }, [data]);

  const formatSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredData = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return {
      scanHistory: data.scanHistory?.filter(scan => 
        searchTerm === '' || 
        scan.url?.toLowerCase().includes(searchLower) ||
        scan.date?.toLowerCase().includes(searchLower)
      ) || [],
      reports: data.reports?.filter(report =>
        searchTerm === '' ||
        report.type?.toLowerCase().includes(searchLower) ||
        report.date?.toLowerCase().includes(searchLower)
      ) || [],
      settings: Object.entries(data.settings || {}).filter(([key, value]) =>
        searchTerm === '' ||
        key.toLowerCase().includes(searchLower) ||
        String(value).toLowerCase().includes(searchLower)
      ).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
      files: data.files?.filter(file =>
        searchTerm === '' ||
        file.name?.toLowerCase().includes(searchLower)
      ) || []
    };
  }, [data, searchTerm]);

  // Calculate export size whenever filtered data or selected sections change
  useEffect(() => {
    const selectedData = Object.keys(selectedSections).reduce((acc, section) => {
      if (selectedSections[section]) {
        acc[section] = filteredData[section];
      }
      return acc;
    }, {});

    const rawSize = calculateSize(selectedData);
    const compressedSize = calculateCompressedSize(selectedData);

    setTotalSize({
      raw: rawSize,
      compressed: compressedSize
    });
  }, [filteredData, selectedSections]);

  const getPaginatedData = (section) => {
    if (!activeSectionView) return [];
    const data = filteredData[activeSectionView];
    if (!Array.isArray(data)) return [];
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const totalPages = useMemo(() => {
    if (!activeSectionView) return 0;
    const data = filteredData[activeSectionView];
    if (!Array.isArray(data)) return 0;
    return Math.ceil(data.length / ITEMS_PER_PAGE);
  }, [filteredData, activeSectionView]);

  const getDataSummary = () => {
    return {
      scans: filteredData.scanHistory.length,
      reports: filteredData.reports.length,
      settings: Object.keys(filteredData.settings).length,
      files: filteredData.files.length,
    };
  };

  const summary = getDataSummary();

  const handleSectionToggle = (section) => {
    setSelectedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFieldChange = (section, field, isChecked) => {
    setSelectedFields(prev => ({
      ...prev,
      [section]: isChecked
        ? [...(prev[section] || []), field]
        : (prev[section] || []).filter(f => f !== field)
    }));
  };

  const filterFieldsForExport = (data, fields) => {
    if (Array.isArray(data)) {
      return data.map(item => {
        const filtered = {};
        fields.forEach(field => {
          if (item.hasOwnProperty(field)) {
            filtered[field] = item[field];
          }
        });
        return filtered;
      });
    } else if (typeof data === 'object') {
      const filtered = {};
      fields.forEach(field => {
        if (data.hasOwnProperty(field)) {
          filtered[field] = data[field];
        }
      });
      return filtered;
    }
    return data;
  };

  const handleExport = async () => {
    setExportProgress(0);
    setExportError(null);

    try {
      // Create a filtered version of the data based on selected sections and fields
      const exportData = Object.keys(selectedSections).reduce((acc, section) => {
        if (selectedSections[section]) {
          acc[section] = filterFieldsForExport(
            filteredData[section],
            selectedFields[section]
          );
        }
        return acc;
      }, {});

      // Validate data before export
      setExportProgress(0.2);
      const validation = validateData(exportData);
      setValidationResult(validation);

      if (!validation.isValid) {
        setExportError('Data validation failed. Please check the validation summary.');
        return;
      }

      // Simulate progress for compression and processing
      setExportProgress(0.4);
      await new Promise(resolve => setTimeout(resolve, 500));
      setExportProgress(0.6);

      // Perform the actual export
      await onExport(exportData);
      
      setExportProgress(1);
    } catch (error) {
      setExportError(error.message);
      setExportProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full m-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Data Export Preview</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search in all data..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="mb-4 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('summary')}
                className={`${
                  activeTab === 'summary'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`${
                  activeTab === 'details'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Details
              </button>
            </nav>
          </div>

          {activeTab === 'summary' ? (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Summary of filtered data:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Scan History</p>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSections.scanHistory}
                        onChange={() => handleSectionToggle('scanHistory')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                  <p className="text-lg font-semibold">{summary.scans} scans</p>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Reports</p>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSections.reports}
                        onChange={() => handleSectionToggle('reports')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                  <p className="text-lg font-semibold">{summary.reports} reports</p>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Settings</p>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSections.settings}
                        onChange={() => handleSectionToggle('settings')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                  <p className="text-lg font-semibold">{summary.settings} items</p>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Files</p>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSections.files}
                        onChange={() => handleSectionToggle('files')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                  <p className="text-lg font-semibold">{summary.files} files</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">Detailed Preview:</h3>
                <div className="flex space-x-2">
                  <select
                    value={activeSectionView || ''}
                    onChange={(e) => {
                      setActiveSectionView(e.target.value || null);
                      setCurrentPage(1);
                    }}
                    className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select section...</option>
                    {Object.entries(filteredData).map(([section, data]) => (
                      <option key={section} value={section}>
                        {section.charAt(0).toUpperCase() + section.slice(1)} ({Array.isArray(data) ? data.length : Object.keys(data).length} items)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {activeSectionView && (
                <div className="space-y-4">
                  <div className="max-h-96 overflow-y-auto">
                    {getPaginatedData().map((item, index) => (
                      <div key={index} className="bg-white p-3 rounded border border-gray-200 mb-2">
                        {activeSectionView === 'scanHistory' && (
                          <>
                            <p className="text-sm font-medium">{item.url}</p>
                            <p className="text-xs text-gray-500">{item.date}</p>
                            {item.score && <p className="text-xs text-gray-600">Score: {item.score}</p>}
                          </>
                        )}
                        {activeSectionView === 'reports' && (
                          <>
                            <p className="text-sm font-medium">{item.type}</p>
                            <p className="text-xs text-gray-500">{item.date}</p>
                            <p className="text-xs text-gray-600">Status: {item.status}</p>
                          </>
                        )}
                        {activeSectionView === 'files' && (
                          <>
                            <p className="text-sm font-medium">{item.name}</p>
                            <a href={item.url} className="text-xs text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                              View File
                            </a>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setExportFormat('json')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  exportFormat === 'json'
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } border shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
              >
                JSON
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  exportFormat === 'csv'
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } border shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
              >
                CSV
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('pdf')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  exportFormat === 'pdf'
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } border shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
              >
                PDF
              </button>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Only checked sections will be included in the export. {summary.scans + summary.reports + summary.settings + summary.files} items selected.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Export Size Estimation</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Original Size</p>
                    <p className="text-lg font-semibold">{formatSize(totalSize.raw)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Compressed Size</p>
                    <p className="text-lg font-semibold">{formatSize(totalSize.compressed)}</p>
                  </div>
                </div>
                {shouldCompress(totalSize.raw) && (
                  <p className="mt-2 text-sm text-green-600">
                    Compression will be automatically applied to reduce file size
                  </p>
                )}
              </div>

              {isExporting && (
                <ProgressTracker
                  progress={exportProgress}
                  error={exportError}
                />
              )}

              {validationResult && validationResult.status !== 'success' && (
                <div className={`p-4 rounded-lg ${
                  validationResult.status === 'error' ? 'bg-red-50 border-red-400' : 'bg-yellow-50 border-yellow-400'
                } border`}>
                  <h4 className={`text-sm font-medium ${
                    validationResult.status === 'error' ? 'text-red-800' : 'text-yellow-800'
                  } mb-2`}>
                    Validation {validationResult.status === 'error' ? 'Errors' : 'Warnings'}
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {validationResult.summary.details.map((detail, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Field Selection</h4>
                <div className="space-y-4">
                  {Object.keys(selectedSections).map(section => (
                    selectedSections[section] && (
                      <FieldSelector
                        key={section}
                        section={section}
                        data={data}
                        selectedFields={selectedFields}
                        onFieldChange={handleFieldChange}
                      />
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || Object.values(selectedSections).every(v => !v)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isExporting ? 'Exporting...' : `Export ${Object.values(selectedSections).filter(Boolean).length} Sections`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPreview;