// Define scan form elements globally
let scanBtn, urlInput, scanStatus, progressFill, progressText, progressInterval;

// Handle form submission
async function handleScanFormSubmit(e) {
  e.preventDefault();
  
  // Get URL input
  const url = urlInput.value.trim();
  
  // Validate URL
  if (!url || !url.match(/^https?:\/\/.+\..+/)) {
    alert('Please enter a valid URL (including http:// or https://)');
    return;
  }
  
  // Get scan options
  const deepCrawl = document.getElementById('deep-crawl').checked;
  const includeSecurity = document.getElementById('include-security').checked;
  const includeBacklinks = document.getElementById('include-backlinks').checked;
  
  // Visual feedback
  scanBtn.disabled = true;
  scanBtn.innerHTML = '<span class="spinner"></span> Analyzing...';
  scanStatus.classList.remove('hidden');
  
  // Start progress animation
  startProgressAnimation();
  
  try {
    // Start the scan via the API
    const response = await startScan(url);
    
    // Get the scan results
    const scanReport = await analyzeSite(url);
    
    // Clear interval and redirect to results page
    stopProgressAnimation();
    window.location.href = `results.html?url=${encodeURIComponent(url)}`;
    
  } catch (error) {
    console.error('Scan error:', error);
    handleScanError(error);
  }
}

// Progress animation
function startProgressAnimation() {
  let progress = 0;
  stopProgressAnimation(); // Clear any existing interval
  
  progressInterval = setInterval(() => {
    progress += 5;
    if (progress > 100) {
      stopProgressAnimation();
      return;
    }
    
    progressFill.style.width = `${progress}%`;
    updateProgressText(progress);
  }, 500);
}

function stopProgressAnimation() {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}

function updateProgressText(progress) {
  if (progress < 20) {
    progressText.textContent = 'Crawling website...';
  } else if (progress < 40) {
    progressText.textContent = 'Analyzing SEO factors...';
  } else if (progress < 60) {
    progressText.textContent = 'Checking performance metrics...';
  } else if (progress < 80) {
    progressText.textContent = 'Evaluating security...';
  } else {
    progressText.textContent = 'Finalizing report...';
  }
}

function handleScanError(error) {
  stopProgressAnimation();
  
  // Reset UI
  scanBtn.disabled = false;
  scanBtn.innerHTML = '<i class="fas fa-search"></i> Analyze Website';
  scanStatus.classList.add('hidden');
  progressFill.style.width = '0%';
  
  // Show error message
  alert(`Error analyzing site: ${error.message || 'Unknown error'}`);
}

// Handle retry button click
function handleRetryClick() {
  checkApiConnection();
}

// Initialize when DOM is ready
function init() {
  // Get form elements
  const scanForm = document.getElementById('scan-form');
  scanBtn = document.getElementById('scanBtn');
  urlInput = document.getElementById('urlInput');
  scanStatus = document.getElementById('scan-status');
  progressFill = document.querySelector('.progress-fill');
  progressText = document.querySelector('.progress-text');
  
  // Clean up any existing intervals
  stopProgressAnimation();
  
  // Add form submit handler
  if (scanForm) {
    // Remove any existing listeners first
    scanForm.removeEventListener('submit', handleScanFormSubmit);
    scanForm.addEventListener('submit', handleScanFormSubmit);
  }
  
  // Add retry button handler
  const retryButton = document.getElementById('retryButton');
  if (retryButton) {
    // Remove any existing listeners first
    retryButton.removeEventListener('click', handleRetryClick);
    retryButton.addEventListener('click', handleRetryClick);
  }
}

// Start initialization when DOM is ready and clean up when page unloads
document.addEventListener('DOMContentLoaded', init);
window.addEventListener('unload', () => {
  stopProgressAnimation();
  const scanForm = document.getElementById('scan-form');
  const retryButton = document.getElementById('retryButton');
  
  if (scanForm) {
    scanForm.removeEventListener('submit', handleScanFormSubmit);
  }
  if (retryButton) {
    retryButton.removeEventListener('click', handleRetryClick);
  }
});