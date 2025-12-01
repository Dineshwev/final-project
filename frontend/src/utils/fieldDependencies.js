// Define field dependencies and relationships
const fieldDependencies = {
  scanHistory: {
    url: [],
    date: [],
    score: [],
    metrics: ['score'], // metrics might depend on score being present
    status: ['score', 'metrics'], // status might depend on score and metrics
    errorCount: ['metrics'],
    warningCount: ['metrics']
  },
  reports: {
    type: [],
    date: [],
    status: ['type'], // status might depend on report type
    details: ['type', 'status'], // details might depend on type and status
    metrics: ['type']
  },
  settings: {
    apiKey: [],
    preferences: [],
    notifications: ['preferences'],
    schedule: ['preferences', 'notifications']
  },
  files: {
    name: [],
    url: [],
    size: [],
    type: [],
    lastModified: [],
    metadata: ['type'] // metadata might depend on file type
  }
};

// Define field groups (fields that should be selected together)
const fieldGroups = {
  scanHistory: {
    basic: ['url', 'date', 'score'],
    metrics: ['metrics', 'errorCount', 'warningCount'],
    advanced: ['status', 'details', 'metadata']
  },
  reports: {
    basic: ['type', 'date', 'status'],
    details: ['details', 'metrics'],
    metadata: ['createdAt', 'updatedAt', 'userId']
  },
  settings: {
    basic: ['preferences', 'notifications'],
    security: ['apiKey', 'authSettings'],
    advanced: ['schedule', 'customRules']
  },
  files: {
    basic: ['name', 'url', 'type'],
    details: ['size', 'lastModified'],
    metadata: ['metadata', 'permissions']
  }
};

export const getFieldDependencies = (section, field) => {
  return fieldDependencies[section]?.[field] || [];
};

export const getDependentFields = (section, field) => {
  const dependents = [];
  const sectionDeps = fieldDependencies[section];
  if (sectionDeps) {
    Object.entries(sectionDeps).forEach(([depField, deps]) => {
      if (deps.includes(field)) {
        dependents.push(depField);
      }
    });
  }
  return dependents;
};

export const getFieldGroup = (section, field) => {
  const groups = fieldGroups[section];
  if (!groups) return null;

  return Object.entries(groups).find(([_, fields]) => 
    fields.includes(field)
  )?.[0] || null;
};

export const getGroupFields = (section, group) => {
  return fieldGroups[section]?.[group] || [];
};

export const validateFieldDependencies = (section, selectedFields) => {
  const issues = [];
  const sectionDeps = fieldDependencies[section];

  if (sectionDeps) {
    selectedFields.forEach(field => {
      const deps = sectionDeps[field] || [];
      deps.forEach(dep => {
        if (!selectedFields.includes(dep)) {
          issues.push({
            field,
            dependency: dep,
            message: `Field '${field}' requires '${dep}' to be selected`
          });
        }
      });
    });
  }

  return issues;
};

export const suggestRelatedFields = (section, selectedFields) => {
  const suggestions = new Set();
  const sectionDeps = fieldDependencies[section];

  if (sectionDeps) {
    // Add fields that are commonly selected together
    selectedFields.forEach(field => {
      const group = getFieldGroup(section, field);
      if (group) {
        getGroupFields(section, group).forEach(groupField => {
          if (!selectedFields.includes(groupField)) {
            suggestions.add(groupField);
          }
        });
      }
    });

    // Add dependent fields
    selectedFields.forEach(field => {
      getDependentFields(section, field).forEach(dep => {
        if (!selectedFields.includes(dep)) {
          suggestions.add(dep);
        }
      });
    });
  }

  return Array.from(suggestions);
};