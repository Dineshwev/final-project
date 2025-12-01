#!/bin/bash
# This script helps you convert from CommonJS to ESM

# Fixes for files with require and module.exports
echo "# Files to convert from CommonJS to ES modules:"
find . -type f -name "*.js" -exec grep -l "require\|module.exports" {} \;

echo ""
echo "# Conversion guidance:"
echo "1. Change 'const moduleName = require('module')' to 'import moduleName from 'module.js''"
echo "2. Change 'module.exports = ' to 'export default '"
echo "3. For destructuring imports: Change 'const { x, y } = require('module')' to 'import { x, y } from 'module.js''"
echo "4. Add .js extension to all local imports"
echo "5. Check circular dependencies and fix them"

echo ""
echo "# Important: After installing Node.js 18.x LTS:"
echo "1. Delete node_modules directory"
echo "2. Run: npm cache clean --force"
echo "3. Run: npm install --legacy-peer-deps"

echo ""
echo "# Test commands:"
echo "npm run db:init"
echo "npm start"