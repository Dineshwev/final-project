const fieldDefinitions = {
  scanHistory: {
    url: { type: 'string', required: true },
    date: { type: 'string', required: true },
    score: { type: 'number', required: false },
    metrics: { type: 'object', required: false }
  },
  reports: {
    type: { type: 'string', required: true },
    date: { type: 'string', required: true },
    status: { type: 'string', required: true }
  },
  settings: {
    // All fields are optional in settings
  },
  files: {
    name: { type: 'string', required: true },
    url: { type: 'string', required: true }
  }
};

export const validateData = (data) => {
  const errors = {};
  const warnings = {};

  Object.entries(data).forEach(([section, items]) => {
    if (!fieldDefinitions[section]) {
      warnings[section] = ['Unknown section type'];
      return;
    }

    if (Array.isArray(items)) {
      const itemErrors = [];
      items.forEach((item, index) => {
        const fieldErrors = validateFields(item, fieldDefinitions[section]);
        if (fieldErrors.length > 0) {
          itemErrors.push({ index, errors: fieldErrors });
        }
      });
      if (itemErrors.length > 0) {
        errors[section] = itemErrors;
      }
    } else if (section === 'settings') {
      // Settings is a special case as it's an object
      const fieldErrors = validateFields(items, fieldDefinitions[section]);
      if (fieldErrors.length > 0) {
        errors[section] = fieldErrors;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
    summary: generateValidationSummary(errors, warnings)
  };
};

const validateFields = (item, definition) => {
  const errors = [];

  // Check required fields
  Object.entries(definition).forEach(([field, rules]) => {
    if (rules.required && !item[field]) {
      errors.push(`Missing required field: ${field}`);
    }
    if (item[field] && !validateType(item[field], rules.type)) {
      errors.push(`Invalid type for field ${field}: expected ${rules.type}`);
    }
  });

  return errors;
};

const validateType = (value, type) => {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'object':
      return typeof value === 'object' && value !== null;
    case 'boolean':
      return typeof value === 'boolean';
    default:
      return true;
  }
};

const generateValidationSummary = (errors, warnings) => {
  const summary = {
    status: 'success',
    message: 'All data is valid',
    details: []
  };

  if (Object.keys(errors).length > 0) {
    summary.status = 'error';
    summary.message = 'Data validation failed';
    Object.entries(errors).forEach(([section, sectionErrors]) => {
      summary.details.push(`${section}: ${sectionErrors.length} items with errors`);
    });
  } else if (Object.keys(warnings).length > 0) {
    summary.status = 'warning';
    summary.message = 'Data validated with warnings';
    Object.entries(warnings).forEach(([section, sectionWarnings]) => {
      summary.details.push(`${section}: ${sectionWarnings.join(', ')}`);
    });
  }

  return summary;
};