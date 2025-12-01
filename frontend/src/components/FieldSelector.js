import React, { useState, useMemo } from 'react';
import {
  getFieldDependencies,
  getDependentFields,
  getFieldGroup,
  validateFieldDependencies,
  suggestRelatedFields
} from '../utils/fieldDependencies';
import FieldPreview from './FieldPreview';

const FieldSelector = ({ section, data, selectedFields, onFieldChange }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewField, setPreviewField] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);

  // Get unique fields from the first item in the section
  const getAvailableFields = () => {
    if (!data || !data[section]) return [];
    
    if (Array.isArray(data[section]) && data[section].length > 0) {
      return Object.keys(data[section][0]);
    } else if (typeof data[section] === 'object') {
      return Object.keys(data[section]);
    }
    
    return [];
  };

  const fields = getAvailableFields();

  // Group fields by their group
  const groupedFields = useMemo(() => {
    const groups = {};
    fields.forEach(field => {
      const group = getFieldGroup(section, field) || 'other';
      if (!groups[group]) groups[group] = [];
      groups[group].push(field);
    });
    return groups;
  }, [fields, section]);

  // Get validation issues for current selection
  const validationIssues = useMemo(() => {
    return validateFieldDependencies(section, selectedFields[section] || []);
  }, [section, selectedFields]);

  // Get suggestions based on current selection
  const suggestions = useMemo(() => {
    return suggestRelatedFields(section, selectedFields[section] || []);
  }, [section, selectedFields]);

  const handleFieldClick = (field) => {
    setPreviewField(field);
    setShowPreview(true);
  };

  const handleGroupClick = (group) => {
    setActiveGroup(group === activeGroup ? null : group);
  };

  const handleFieldSelect = (field) => {
    const currentFields = selectedFields[section] || [];
    const newFields = currentFields.includes(field)
      ? currentFields.filter(f => f !== field)
      : [...currentFields, field];

    // Get dependent fields that should be auto-selected
    const dependencies = getFieldDependencies(section, field);
    const dependents = getDependentFields(section, field);
    
    // Auto-select required dependencies
    dependencies.forEach(dep => {
      if (!newFields.includes(dep)) {
        newFields.push(dep);
      }
    });

    // Auto-select dependent fields if configured
    dependents.forEach(dep => {
      if (!newFields.includes(dep)) {
        newFields.push(dep);
      }
    });

    onFieldChange(section, newFields);
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h4 className="text-sm font-medium text-gray-900 mb-2">
        Select Fields - {section.charAt(0).toUpperCase() + section.slice(1)}
      </h4>
      
      {/* Field Groups */}
      <div className="space-y-4">
        {Object.keys(groupedFields).map(group => (
          <div key={group} className="field-group">
            <h5 
              className={`text-xs font-medium text-gray-700 cursor-pointer flex items-center ${
                activeGroup === group ? 'text-blue-600' : ''
              }`}
              onClick={() => handleGroupClick(group)}
            >
              <svg
                className={`w-4 h-4 mr-1 transform transition-transform ${
                  activeGroup === group ? 'rotate-90' : ''
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M6 6L14 10L6 14V6Z" />
              </svg>
              {group.charAt(0).toUpperCase() + group.slice(1)}
            </h5>
            
            <div className={`space-y-2 ml-6 ${activeGroup === group ? 'block' : 'hidden'}`}>
              {groupedFields[group].map(field => (
                <div key={field} className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 flex-grow">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                      checked={selectedFields[section]?.includes(field)}
                      onChange={() => handleFieldSelect(field)}
                    />
                    <span 
                      className="text-sm text-gray-700 cursor-pointer hover:text-gray-900"
                      onClick={() => handleFieldClick(field)}
                    >
                      {field}
                    </span>
                  </label>
                  <div className="flex items-center space-x-1">
                    {validationIssues[field] && (
                      <span 
                        className="text-amber-500" 
                        title={validationIssues[field]}
                      >
                        ⚠️
                      </span>
                    )}
                    {suggestions.includes(field) && (
                      <span 
                        className="text-blue-500" 
                        title="Recommended based on your selection"
                      >
                        💡
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Field Preview Modal */}
      {showPreview && previewField && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium text-gray-900">
                Field Preview: {previewField}
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-4">
              <FieldPreview
                section={section}
                field={previewField}
                data={data}
              />
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 flex justify-end space-x-2">
        <button
          type="button"
          onClick={() => {
            const allFields = Object.values(groupedFields).flat();
            allFields.forEach(field => handleFieldSelect(field));
          }}
          className="text-xs text-indigo-600 hover:text-indigo-700"
        >
          Select All
        </button>
        <span className="text-gray-300">|</span>
        <button
          type="button"
          onClick={() => onFieldChange(section, [])}
          className="text-xs text-indigo-600 hover:text-indigo-700"
        >
          Deselect All
        </button>
      </div>
    </div>
  );
};

export default FieldSelector;