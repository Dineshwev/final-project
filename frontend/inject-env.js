const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

/**
 * Injects environment variables as meta tags into HTML files
 * @param {string} htmlFilePath - Path to HTML file
 */
function injectEnvironmentVariables(htmlFilePath) {
  try {
    // Read the HTML file
    let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
    
    // Find the position to inject meta tags (after head opening tag)
    const headPos = htmlContent.indexOf('<head>') + 6;
    
    // Prepare meta tags for environment variables
    let metaTags = '\n  <!-- Environment Variables -->\n';
    
    // Add environment variables as meta tags
    Object.keys(process.env).forEach(key => {
      // Only inject FIREBASE_ prefixed variables and other specific ones we need
      if (key.startsWith('FIREBASE_') || 
          ['PAGE_SPEED_INSIGHTS_API_KEY', 'WHOAPI_KEY', 'SAFE_BROWSING_API_KEY'].includes(key)) {
        metaTags += `  <meta name="env-${key}" content="${process.env[key]}">\n`;
      }
    });
    
    // Inject meta tags into HTML
    htmlContent = htmlContent.slice(0, headPos) + metaTags + htmlContent.slice(headPos);
    
    // Write the modified HTML back to the file
    fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
    console.log(`Successfully injected environment variables into ${htmlFilePath}`);
    
  } catch (error) {
    console.error(`Error processing ${htmlFilePath}:`, error);
  }
}

// Process all HTML files in the directory
const htmlFiles = ['index.html', 'login.html', 'register.html', 'settings.html', 'history.html', 
                  'results.html', 'about.html', 'terms.html', 'privacy.html', 'contact.html'];

htmlFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    injectEnvironmentVariables(filePath);
  }
});

console.log('All HTML files processed successfully.');