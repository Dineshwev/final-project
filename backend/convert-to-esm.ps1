# ESM Conversion Guide for Windows

# List files to convert from CommonJS to ES modules
Write-Host "# Files to convert from CommonJS to ES modules:"
Get-ChildItem -Path . -Recurse -Include *.js | Select-String -Pattern "require|module.exports" | Select-Object Path -Unique | ForEach-Object { $_.Path }

Write-Host ""
Write-Host "# Conversion guidance:"
Write-Host "1. Change 'const moduleName = require('module')' to 'import moduleName from 'module.js''"
Write-Host "2. Change 'module.exports = ' to 'export default '"
Write-Host "3. For destructuring imports: Change 'const { x, y } = require('module')' to 'import { x, y } from 'module.js''"
Write-Host "4. Add .js extension to all local imports"
Write-Host "5. Check circular dependencies and fix them"

Write-Host ""
Write-Host "# Important: After installing Node.js 18.x LTS:"
Write-Host "1. Delete node_modules directory:"
Write-Host "   rmdir /s /q node_modules"
Write-Host "2. Run: npm cache clean --force"
Write-Host "3. Run: npm install --legacy-peer-deps"

Write-Host ""
Write-Host "# Test commands:"
Write-Host "npm run db:init"
Write-Host "npm start"