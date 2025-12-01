import React from 'react';

const ProgressTracker = ({ progress, error }) => {
  const percentage = Math.round(progress * 100);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium text-gray-900">Export Progress</h4>
        <span className="text-sm font-medium text-gray-700">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${
            error ? 'bg-red-600' : 'bg-indigo-600'
          }`}
          style={{ width: `${percentage}%`, transition: 'width 0.5s ease-in-out' }}
        />
      </div>
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
      {progress === 1 && !error && (
        <div className="mt-2 text-sm text-green-600">
          Export completed successfully!
        </div>
      )}
      {progress > 0 && progress < 1 && !error && (
        <div className="mt-2 text-sm text-gray-500">
          {getProgressMessage(percentage)}
        </div>
      )}
    </div>
  );
};

const getProgressMessage = (percentage) => {
  if (percentage < 25) {
    return 'Preparing data for export...';
  } else if (percentage < 50) {
    return 'Validating selected data...';
  } else if (percentage < 75) {
    return 'Compressing data...';
  } else {
    return 'Finalizing export...';
  }
};

export default ProgressTracker;