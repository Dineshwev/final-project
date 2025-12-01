import React, { useState, useMemo } from 'react';

const FieldPreview = ({ data, section, field }) => {
  const [showMore, setShowMore] = useState(false);

  const fieldData = useMemo(() => {
    if (!data || !data[section]) return null;

    let values = [];
    if (Array.isArray(data[section])) {
      values = data[section].map(item => item[field]);
    } else if (typeof data[section] === 'object') {
      values = [data[section][field]];
    }

    // Filter out undefined/null values
    values = values.filter(v => v != null);
    if (values.length === 0) return null;

    // Get unique values
    const uniqueValues = [...new Set(values)];
    const types = [...new Set(values.map(v => typeof v))];
    
    // Calculate stats for numeric values
    let numericStats = null;
    if (types.length === 1 && types[0] === 'number') {
      const nums = values.filter(v => !isNaN(v));
      if (nums.length > 0) {
        numericStats = {
          min: Math.min(...nums),
          max: Math.max(...nums),
          avg: nums.reduce((a, b) => a + b, 0) / nums.length,
          median: getMedian(nums)
        };
      }
    }

    return {
      values,
      uniqueValues,
      types,
      numericStats,
      sample: uniqueValues.slice(0, showMore ? uniqueValues.length : 3)
    };
  }, [data, section, field, showMore]);

  const getMedian = (numbers) => {
    const sorted = numbers.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    
    return sorted[middle];
  };

  const formatValue = (value, field) => {
    if (value == null) return 'N/A';
    
    switch (typeof value) {
      case 'object':
        return JSON.stringify(value).slice(0, 50) + '...';
      case 'boolean':
        return value.toString();
      case 'number':
        // Format dates if the field name suggests it's a date
        if (field.toLowerCase().includes('date')) {
          return new Date(value).toLocaleDateString();
        }
        return value.toLocaleString(undefined, { 
          maximumFractionDigits: 2 
        });
      case 'string':
        // Format dates if it looks like an ISO date string
        if (field.toLowerCase().includes('date') && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
          return new Date(value).toLocaleDateString();
        }
        return value.length > 50 ? value.slice(0, 47) + '...' : value;
      default:
        return String(value);
    }
  };

  if (!fieldData) return <div className="text-sm text-gray-500">No data available</div>;

  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm font-medium text-gray-500">Total Values</div>
          <div className="mt-1 text-lg font-semibold text-gray-900">
            {fieldData.values.length}
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm font-medium text-gray-500">Unique Values</div>
          <div className="mt-1 text-lg font-semibold text-gray-900">
            {fieldData.uniqueValues.length}
          </div>
        </div>
      </div>

      {/* Type Info */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Data Types</h4>
        <div className="flex gap-2">
          {fieldData.types.map(type => (
            <span
              key={type}
              className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      {/* Sample Values */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Values</h4>
        <div className="bg-gray-50 rounded p-3 space-y-2">
          {fieldData.sample.map((value, index) => (
            <div key={index} className="text-sm">
              <span className="text-gray-500">{index + 1}.</span>{' '}
              <span className="font-mono text-gray-900">{formatValue(value, field)}</span>
            </div>
          ))}
          {!showMore && fieldData.uniqueValues.length > 3 && (
            <button
              onClick={() => setShowMore(true)}
              className="text-xs text-indigo-600 hover:text-indigo-700"
            >
              Show {fieldData.uniqueValues.length - 3} more values...
            </button>
          )}
          {showMore && fieldData.uniqueValues.length > 3 && (
            <button
              onClick={() => setShowMore(false)}
              className="text-xs text-indigo-600 hover:text-indigo-700"
            >
              Show less
            </button>
          )}
        </div>
      </div>

      {/* Numeric Stats */}
      {fieldData.numericStats && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Numeric Statistics</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm font-medium text-gray-500">Range</div>
              <div className="mt-1 text-sm text-gray-900">
                {fieldData.numericStats.min.toLocaleString()} - {fieldData.numericStats.max.toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm font-medium text-gray-500">Average</div>
              <div className="mt-1 text-sm text-gray-900">
                {fieldData.numericStats.avg.toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm font-medium text-gray-500">Median</div>
              <div className="mt-1 text-sm text-gray-900">
                {fieldData.numericStats.median.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldPreview;