// fixImports.js
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
      files.push(fullPath);
    }
  }

  return files;
}

// Function to update imports in a file
async function updateImports(file) {
  try {
    const content = await readFile(file, 'utf8');
    
    // Look for specific imports
    const apiImportRegex = /import\s+(\w+)\s+from\s+['"]\.\.\/services\/api['"];?/g;
    const firebaseImportRegex = /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]\.\.\/config\/firebase['"];?/g;
    
    let newContent = content;
    let modified = false;
    
    // Fix API imports
    let match;
    while ((match = apiImportRegex.exec(content)) !== null) {
      const importStatement = match[0];
      const importName = match[1];
      
      // Create the new import statement with .js extension
      const newImportStatement = `import ${importName} from '../services/api.js';`;
      
      // Replace the old import statement with the new one
      newContent = newContent.replace(importStatement, newImportStatement);
      modified = true;
    }
    
    // Fix Firebase imports
    while ((match = firebaseImportRegex.exec(content)) !== null) {
      const importStatement = match[0];
      const importedItems = match[1].trim();
      
      // Create the new import statement with .js extension
      const newImportStatement = `import { ${importedItems} } from '../config/firebase.js';`;
      
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