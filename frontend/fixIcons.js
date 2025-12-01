// fixIcons.js
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Define the root directory for the search
const rootDir = path.resolve(__dirname);
const srcDir = path.join(rootDir, 'src');

// Function to search files recursively
async function findFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...await findFiles(fullPath));
    } else if (entry.isFile() && /\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      // Skip our new Icons.tsx file and IconWrapper.tsx
      if (entry.name === 'Icons.tsx' || entry.name === 'IconWrapper.tsx') {
        continue;
      }
      files.push(fullPath);
    }
  }

  return files;
}

// Function to update imports in a file
async function updateImports(file) {
  try {
    const content = await readFile(file, 'utf8');
    
    // Look for react-icons/fa imports
    const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]react-icons\/fa['"];?/g;
    
    let match;
    let newContent = content;
    let modified = false;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importStatement = match[0];
      const importedIcons = match[1].trim();
      
      // Create the new import statement - determine the correct relative path
      let relativePath = path.relative(path.dirname(file), path.join(srcDir, 'components'));
      // Convert to forward slashes
      relativePath = relativePath.replace(/\\/g, '/');
      // Ensure path starts with ./ or ../
      if (!relativePath.startsWith('.')) {
        relativePath = './' + relativePath;
      }
      
      const newImportStatement = `import { ${importedIcons} } from '${relativePath}/Icons';`;
      
      // Replace the old import statement with the new one
      newContent = newContent.replace(importStatement, newImportStatement);
      modified = true;
    }
    
    if (modified) {
      await writeFile(file, newContent, 'utf8');
      console.log(`Updated imports in ${file}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing file ${file}:`, error);
    return false;
  }
}

// Main function
async function main() {
  const files = await findFiles(srcDir);
  let updatedCount = 0;
  
  for (const file of files) {
    const updated = await updateImports(file);
    if (updated) {
      updatedCount++;
    }
  }
  
  console.log(`Finished updating ${updatedCount} files.`);
}

main().catch(console.error);