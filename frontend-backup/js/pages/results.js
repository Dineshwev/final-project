/**
 * Results module for SEO Pulse
 * Handles displaying scan results and analysis
 */

// Results state management
const results = {
  scanData: null,
  currentTab: 'overview',
  
  // Load results from API
  async loadResults(scanId) {
    try {
      const loadingIndicator = document.getElementById('results-loading');
      const resultsContainer = document.getElementById('results-container');
      const resultsError = document.getElementById('results-error');
      
      if (loadingIndicator) loadingIndicator.classList.remove('hidden');
      if (resultsContainer) resultsContainer.classList.add('hidden');
      if (resultsError) resultsError.classList.add('hidden');
      
      // Get scan results from API
      const response = await fetch(`${API_BASE_URL}/scan/${scanId}`, {
        method: 'GET',
        headers: auth.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to load scan results');
      }
      
      this.scanData = await response.json();
      
      // Render results
      this.renderResults();
      
      if (loadingIndicator) loadingIndicator.classList.add('hidden');
      if (resultsContainer) resultsContainer.classList.remove('hidden');
      
    } catch (error) {
      console.error('Results loading error:', error);
      
      const loadingIndicator = document.getElementById('results-loading');
      const resultsError = document.getElementById('results-error');
      
      if (loadingIndicator) loadingIndicator.classList.add('hidden');
      if (resultsError) {
        resultsError.classList.remove('hidden');
        resultsError.textContent = error.message || 'Failed to load scan results';
      }
    }
  },
  
  // Render scan results
  renderResults() {
    if (!this.scanData) return;
    
    // Set page title and URL
    const resultsUrl = document.getElementById('results-url');
    const resultsDate = document.getElementById('results-date');
    
    if (resultsUrl) resultsUrl.textContent = this.scanData.url;
    
    if (resultsDate) {
      const date = new Date(this.scanData.scanDate);
      resultsDate.textContent = `Scanned on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
    }
    
    // Render score overview
    this.renderScoreOverview();
    
    // Render tab content
    this.changeTab(this.currentTab);
  },
  
  // Render score overview section
  renderScoreOverview() {
    const overviewContainer = document.getElementById('results-overview');
    if (!overviewContainer) return;
    
    const scores = [
      { label: 'Performance', value: this.scanData.scores.performance, icon: 'fa-gauge-high' },
      { label: 'SEO Score', value: this.scanData.scores.seo, icon: 'fa-magnifying-glass-chart' },
      { label: 'Accessibility', value: this.scanData.scores.accessibility, icon: 'fa-universal-access' },
      { label: 'Best Practices', value: this.scanData.scores.bestPractices, icon: 'fa-check-double' }
    ];
    
    // Clear container
    overviewContainer.innerHTML = '';
    
    // Add score cards
    scores.forEach(score => {
      // Determine score class
      let scoreClass = '';
      if (score.value >= 90) scoreClass = 'score-high';
      else if (score.value >= 70) scoreClass = 'score-medium';
      else scoreClass = 'score-low';
      
      const scoreCard = document.createElement('div');
      scoreCard.className = 'results-score';
      scoreCard.innerHTML = `
        <div class="score-label"><i class="fas ${score.icon}"></i> ${score.label}</div>
        <div class="score-value ${scoreClass}">${score.value}</div>
      `;
      
      overviewContainer.appendChild(scoreCard);
    });
  },
  
  // Change results tab
  changeTab(tabId) {
    this.currentTab = tabId;
    
    // Hide all tab content
    const tabContents = document.querySelectorAll('.results-tab-content');
    tabContents.forEach(content => {
      content.classList.add('hidden');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(`${tabId}-tab`);
    if (selectedTab) {
      selectedTab.classList.remove('hidden');
    }
    
    // Update tab buttons
    const tabButtons = document.querySelectorAll('.results-tab');
    tabButtons.forEach(button => {
      button.classList.remove('active');
    });
    
    const activeButton = document.querySelector(`.results-tab[data-tab="${tabId}"]`);
    if (activeButton) {
      activeButton.classList.add('active');
    }
    
    // Render tab content
    switch(tabId) {
      case 'overview': this.renderOverviewTab(); break;
      case 'seo': this.renderSeoTab(); break;
      case 'performance': this.renderPerformanceTab(); break;
      case 'security': this.renderSecurityTab(); break;
      case 'accessibility': this.renderAccessibilityTab(); break;
    }
  },
  
  // Render overview tab content
  renderOverviewTab() {
    const overviewContent = document.getElementById('overview-content');
    if (!overviewContent || !this.scanData) return;
    
    overviewContent.innerHTML = `
      <div class="results-section">
        <h3 class="results-section-title"><i class="fas fa-circle-info"></i> Summary</h3>
        <div class="card">
          <div class="card-body">
            <p>${this.scanData.summary || 'No summary available for this scan.'}</p>
          </div>
        </div>
      </div>
      
      <div class="results-section">
        <h3 class="results-section-title"><i class="fas fa-list-check"></i> Key Findings</h3>
        <div class="card">
          <div class="card-body">
            <ul class="findings-list">
              ${this.renderKeyFindings()}
            </ul>
          </div>
        </div>
      </div>
    `;
  },
  
  // Render SEO tab content
  renderSeoTab() {
    const seoContent = document.getElementById('seo-content');
    if (!seoContent || !this.scanData) return;
    
    seoContent.innerHTML = `
      <div class="results-section">
        <h3 class="results-section-title"><i class="fas fa-tags"></i> Meta Tags</h3>
        <div class="card">
          <div class="card-body">
            ${this.renderMetaTags()}
          </div>
        </div>
      </div>
      
      <div class="results-section">
        <h3 class="results-section-title"><i class="fas fa-heading"></i> Headings Structure</h3>
        <div class="card">
          <div class="card-body">
            ${this.renderHeadings()}
          </div>
        </div>
      </div>
      
      <div class="results-section">
        <h3 class="results-section-title"><i class="fas fa-link"></i> Links Analysis</h3>
        <div class="card">
          <div class="card-body">
            ${this.renderLinks()}
          </div>
        </div>
      </div>
      
      <div class="results-section">
        <h3 class="results-section-title"><i class="fas fa-image"></i> Images</h3>
        <div class="card">
          <div class="card-body">
            ${this.renderImages()}
          </div>
        </div>
      </div>
    `;
  },
  
  // Render Performance tab content
  renderPerformanceTab() {
    const performanceContent = document.getElementById('performance-content');
    if (!performanceContent || !this.scanData) return;
    
    performanceContent.innerHTML = `
      <div class="results-section">
        <h3 class="results-section-title"><i class="fas fa-gauge-high"></i> Core Web Vitals</h3>
        <div class="card">
          <div class="card-body">
            ${this.renderCoreWebVitals()}
          </div>
        </div>
      </div>
      
      <div class="results-section">
        <h3 class="results-section-title"><i class="fas fa-weight-hanging"></i> Page Weight</h3>
        <div class="card">
          <div class="card-body">
            ${this.renderPageWeight()}
          </div>
        </div>
      </div>
      
      <div class="results-section">
        <h3 class="results-section-title"><i class="fas fa-code"></i> Code Optimization</h3>
        <div class="card">
          <div class="card-body">
            ${this.renderCodeOptimization()}
          </div>
        </div>
      </div>
    `;
  },
  
  // Render Security tab content
  renderSecurityTab() {
    const securityContent = document.getElementById('security-content');
    if (!securityContent || !this.scanData) return;
    
    securityContent.innerHTML = `
      <div class="results-section">
        <h3 class="results-section-title"><i class="fas fa-shield-halved"></i> Security Headers</h3>
        <div class="card">
          <div class="card-body">
            ${this.renderSecurityHeaders()}
          </div>
        </div>
      </div>
      
      <div class="results-section">
        <h3 class="results-section-title"><i class="fas fa-lock"></i> SSL/TLS</h3>
        <div class="card">
          <div class="card-body">
            ${this.renderSslInfo()}
          </div>
        </div>
      </div>
      
      <div class="results-section">
        <h3 class="results-section-title"><i class="fas fa-bug"></i> Vulnerabilities</h3>
        <div class="card">
          <div class="card-body">
            ${this.renderVulnerabilities()}
          </div>
        </div>
      </div>
    `;
  },
  
  // Render Accessibility tab content
  renderAccessibilityTab() {
    const accessibilityContent = document.getElementById('accessibility-content');
    if (!accessibilityContent || !this.scanData) return;
    
    accessibilityContent.innerHTML = `
      <div class="results-section">
        <h3 class="results-section-title"><i class="fas fa-universal-access"></i> WCAG Compliance</h3>
        <div class="card">
          <div class="card-body">
            ${this.renderWcagCompliance()}
          </div>
        </div>
      </div>
      
      <div class="results-section">
        <h3 class="results-section-title"><i class="fas fa-puzzle-piece"></i> Accessibility Issues</h3>
        <div class="card">
          <div class="card-body">
            ${this.renderAccessibilityIssues()}
          </div>
        </div>
      </div>
    `;
  },
  
  // Helper function to render key findings
  renderKeyFindings() {
    if (!this.scanData.keyFindings || this.scanData.keyFindings.length === 0) {
      return '<li>No key findings available.</li>';
    }
    
    return this.scanData.keyFindings.map(finding => {
      let iconClass = 'fa-circle-info';
      if (finding.type === 'error') iconClass = 'fa-circle-xmark';
      else if (finding.type === 'warning') iconClass = 'fa-triangle-exclamation';
      else if (finding.type === 'success') iconClass = 'fa-circle-check';
      
      return `
        <li class="finding-item finding-${finding.type}">
          <i class="fas ${iconClass}"></i> ${finding.message}
        </li>
      `;
    }).join('');
  },
  
  // Helper function to render meta tags
  renderMetaTags() {
    if (!this.scanData.seo || !this.scanData.seo.metaTags) {
      return 'No meta tag information available.';
    }
    
    const { metaTags } = this.scanData.seo;
    
    return `
      <table class="info-table">
        <tr>
          <th>Title</th>
          <td>${metaTags.title || 'Missing'}</td>
        </tr>
        <tr>
          <th>Description</th>
          <td>${metaTags.description || 'Missing'}</td>
        </tr>
        <tr>
          <th>Canonical URL</th>
          <td>${metaTags.canonical || 'Missing'}</td>
        </tr>
        <tr>
          <th>Robots</th>
          <td>${metaTags.robots || 'Not specified'}</td>
        </tr>
      </table>
    `;
  },
  
  // Helper function to render headings structure
  renderHeadings() {
    if (!this.scanData.seo || !this.scanData.seo.headings) {
      return 'No headings information available.';
    }
    
    const { headings } = this.scanData.seo;
    
    return `
      <div class="headings-structure">
        ${Object.entries(headings).map(([level, items]) => `
          <div class="heading-level">
            <div class="heading-level-tag">H${level}</div>
            <div class="heading-level-count">${items.length}</div>
          </div>
        `).join('')}
      </div>
      
      <div class="headings-list">
        ${Object.entries(headings).flatMap(([level, items]) => 
          items.map(item => `
            <div class="heading-item">
              <div class="heading-tag">H${level}</div>
              <div class="heading-text">${item}</div>
            </div>
          `)
        ).join('')}
      </div>
    `;
  },
  
  // Helper function to render links analysis
  renderLinks() {
    if (!this.scanData.seo || !this.scanData.seo.links) {
      return 'No links information available.';
    }
    
    const { links } = this.scanData.seo;
    
    return `
      <div class="links-summary">
        <div class="link-stat">
          <div class="link-stat-value">${links.total || 0}</div>
          <div class="link-stat-label">Total Links</div>
        </div>
        <div class="link-stat">
          <div class="link-stat-value">${links.internal || 0}</div>
          <div class="link-stat-label">Internal</div>
        </div>
        <div class="link-stat">
          <div class="link-stat-value">${links.external || 0}</div>
          <div class="link-stat-label">External</div>
        </div>
        <div class="link-stat">
          <div class="link-stat-value">${links.nofollow || 0}</div>
          <div class="link-stat-label">Nofollow</div>
        </div>
      </div>
    `;
  },
  
  // Helper function to render images info
  renderImages() {
    if (!this.scanData.seo || !this.scanData.seo.images) {
      return 'No images information available.';
    }
    
    const { images } = this.scanData.seo;
    
    return `
      <div class="images-summary">
        <div class="image-stat">
          <div class="image-stat-value">${images.total || 0}</div>
          <div class="image-stat-label">Total Images</div>
        </div>
        <div class="image-stat">
          <div class="image-stat-value">${images.missing_alt || 0}</div>
          <div class="image-stat-label">Missing Alt Text</div>
        </div>
      </div>
    `;
  },
  
  // Helper function to render core web vitals
  renderCoreWebVitals() {
    if (!this.scanData.performance || !this.scanData.performance.webVitals) {
      return 'No Core Web Vitals information available.';
    }
    
    const { webVitals } = this.scanData.performance;
    
    return `
      <div class="web-vitals">
        <div class="web-vital-item">
          <div class="web-vital-name">LCP</div>
          <div class="web-vital-value">${webVitals.lcp || 'N/A'}</div>
          <div class="web-vital-label">Largest Contentful Paint</div>
        </div>
        <div class="web-vital-item">
          <div class="web-vital-name">FID</div>
          <div class="web-vital-value">${webVitals.fid || 'N/A'}</div>
          <div class="web-vital-label">First Input Delay</div>
        </div>
        <div class="web-vital-item">
          <div class="web-vital-name">CLS</div>
          <div class="web-vital-value">${webVitals.cls || 'N/A'}</div>
          <div class="web-vital-label">Cumulative Layout Shift</div>
        </div>
      </div>
    `;
  },
  
  // Helper function to render page weight info
  renderPageWeight() {
    if (!this.scanData.performance || !this.scanData.performance.pageWeight) {
      return 'No page weight information available.';
    }
    
    const { pageWeight } = this.scanData.performance;
    
    return `
      <div class="page-weight">
        <div class="page-weight-total">
          <div class="page-weight-value">${pageWeight.total || 'N/A'}</div>
          <div class="page-weight-label">Total Page Size</div>
        </div>
        
        <div class="page-weight-breakdown">
          ${Object.entries(pageWeight.breakdown || {}).map(([type, size]) => `
            <div class="page-weight-item">
              <div class="page-weight-type">${type}</div>
              <div class="page-weight-size">${size}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },
  
  // Helper function to render code optimization info
  renderCodeOptimization() {
    if (!this.scanData.performance || !this.scanData.performance.optimization) {
      return 'No code optimization information available.';
    }
    
    const { optimization } = this.scanData.performance;
    
    return `
      <table class="info-table">
        <tr>
          <th>HTML Minified</th>
          <td>${optimization.htmlMinified ? 'Yes' : 'No'}</td>
        </tr>
        <tr>
          <th>CSS Minified</th>
          <td>${optimization.cssMinified ? 'Yes' : 'No'}</td>
        </tr>
        <tr>
          <th>JS Minified</th>
          <td>${optimization.jsMinified ? 'Yes' : 'No'}</td>
        </tr>
        <tr>
          <th>Image Optimization</th>
          <td>${optimization.imagesOptimized ? 'Yes' : 'No'}</td>
        </tr>
        <tr>
          <th>Compression</th>
          <td>${optimization.compression ? 'Yes' : 'No'}</td>
        </tr>
      </table>
    `;
  },
  
  // Helper function to render security headers
  renderSecurityHeaders() {
    if (!this.scanData.security || !this.scanData.security.headers) {
      return 'No security headers information available.';
    }
    
    const { headers } = this.scanData.security;
    
    return `
      <table class="info-table">
        ${Object.entries(headers).map(([header, value]) => `
          <tr>
            <th>${header}</th>
            <td>${value ? value : '<span class="text-error">Missing</span>'}</td>
          </tr>
        `).join('')}
      </table>
    `;
  },
  
  // Helper function to render SSL info
  renderSslInfo() {
    if (!this.scanData.security || !this.scanData.security.ssl) {
      return 'No SSL/TLS information available.';
    }
    
    const { ssl } = this.scanData.security;
    
    return `
      <table class="info-table">
        <tr>
          <th>SSL Enabled</th>
          <td>${ssl.enabled ? 'Yes' : 'No'}</td>
        </tr>
        <tr>
          <th>Certificate Valid</th>
          <td>${ssl.valid ? 'Yes' : 'No'}</td>
        </tr>
        <tr>
          <th>Protocol Version</th>
          <td>${ssl.protocol || 'N/A'}</td>
        </tr>
        <tr>
          <th>Expiry Date</th>
          <td>${ssl.expiryDate || 'N/A'}</td>
        </tr>
      </table>
    `;
  },
  
  // Helper function to render vulnerabilities
  renderVulnerabilities() {
    if (!this.scanData.security || !this.scanData.security.vulnerabilities || this.scanData.security.vulnerabilities.length === 0) {
      return 'No vulnerabilities detected.';
    }
    
    const { vulnerabilities } = this.scanData.security;
    
    return `
      <ul class="vulnerabilities-list">
        ${vulnerabilities.map(vuln => `
          <li class="vulnerability-item">
            <div class="vulnerability-severity vulnerability-${vuln.severity}">${vuln.severity}</div>
            <div class="vulnerability-info">
              <div class="vulnerability-title">${vuln.title}</div>
              <div class="vulnerability-description">${vuln.description}</div>
            </div>
          </li>
        `).join('')}
      </ul>
    `;
  },
  
  // Helper function to render WCAG compliance
  renderWcagCompliance() {
    if (!this.scanData.accessibility || !this.scanData.accessibility.wcag) {
      return 'No WCAG compliance information available.';
    }
    
    const { wcag } = this.scanData.accessibility;
    
    return `
      <div class="wcag-compliance">
        <div class="wcag-level">
          <div class="wcag-level-name">Level A</div>
          <div class="wcag-level-score">${wcag.a || 'N/A'}</div>
        </div>
        <div class="wcag-level">
          <div class="wcag-level-name">Level AA</div>
          <div class="wcag-level-score">${wcag.aa || 'N/A'}</div>
        </div>
        <div class="wcag-level">
          <div class="wcag-level-name">Level AAA</div>
          <div class="wcag-level-score">${wcag.aaa || 'N/A'}</div>
        </div>
      </div>
    `;
  },
  
  // Helper function to render accessibility issues
  renderAccessibilityIssues() {
    if (!this.scanData.accessibility || !this.scanData.accessibility.issues || this.scanData.accessibility.issues.length === 0) {
      return 'No accessibility issues detected.';
    }
    
    const { issues } = this.scanData.accessibility;
    
    return `
      <ul class="issues-list">
        ${issues.map(issue => `
          <li class="issue-item">
            <div class="issue-impact issue-${issue.impact}">${issue.impact}</div>
            <div class="issue-info">
              <div class="issue-title">${issue.title}</div>
              <div class="issue-description">${issue.description}</div>
              ${issue.element ? `<div class="issue-element"><code>${issue.element}</code></div>` : ''}
            </div>
          </li>
        `).join('')}
      </ul>
    `;
  },
  
  // Export report as PDF
  async exportPdf() {
    if (!this.scanData) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/export/${this.scanData.id}`, {
        method: 'GET',
        headers: auth.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to export report');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `seo-report-${this.scanData.id}.pdf`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export report. Please try again.');
    }
  },
  
  // Share report via email
  async shareReport() {
    if (!this.scanData) return;
    
    const email = prompt('Enter email address to share this report:');
    if (!email) return;
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/share/${this.scanData.id}`, {
        method: 'POST',
        headers: {
          ...auth.getHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        throw new Error('Failed to share report');
      }
      
      alert('Report shared successfully!');
      
    } catch (error) {
      console.error('Share error:', error);
      alert('Failed to share report. Please try again.');
    }
  }
};

// DOM Ready - Initialize Results
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the results page
  if (!document.getElementById('results-page')) return;
  
  // Get scan ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const scanId = urlParams.get('id');
  
  if (!scanId) {
    const resultsError = document.getElementById('results-error');
    if (resultsError) {
      resultsError.classList.remove('hidden');
      resultsError.textContent = 'No scan ID provided.';
    }
    return;
  }
  
  // Load results data
  results.loadResults(scanId);
  
  // Setup tab switching
  const tabButtons = document.querySelectorAll('.results-tab');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;
      results.changeTab(tabId);
    });
  });
  
  // Setup export button
  const exportButton = document.getElementById('export-button');
  if (exportButton) {
    exportButton.addEventListener('click', () => {
      results.exportPdf();
    });
  }
  
  // Setup share button
  const shareButton = document.getElementById('share-button');
  if (shareButton) {
    shareButton.addEventListener('click', () => {
      results.shareReport();
    });
  }
});