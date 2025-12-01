/**
 * History module for SEO Pulse
 * Handles loading, filtering and displaying scan history
 */

// History state management
const history = {
  items: [],
  filters: {
    search: '',
    status: 'all',
    dateRange: 'all',
    page: 1,
    perPage: 10
  },
  
  // Load history items from API
  async loadHistory() {
    try {
      const loadingIndicator = document.getElementById('history-loading');
      const historyTable = document.getElementById('history-table');
      const historyError = document.getElementById('history-error');
      
      if (loadingIndicator) loadingIndicator.classList.remove('hidden');
      if (historyError) historyError.classList.add('hidden');
      
      // Build query params
      const params = new URLSearchParams();
      if (this.filters.search) params.append('search', this.filters.search);
      if (this.filters.status !== 'all') params.append('status', this.filters.status);
      if (this.filters.dateRange !== 'all') params.append('dateRange', this.filters.dateRange);
      params.append('page', this.filters.page.toString());
      params.append('perPage', this.filters.perPage.toString());
      
      // Get history data from API
      const response = await fetch(`${API_BASE_URL}/history?${params.toString()}`, {
        method: 'GET',
        headers: auth.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to load history');
      }
      
      const data = await response.json();
      this.items = data.items;
      this.totalItems = data.total;
      this.totalPages = Math.ceil(data.total / this.filters.perPage);
      
      this.renderHistory();
      this.renderPagination();
      
      if (loadingIndicator) loadingIndicator.classList.add('hidden');
      if (historyTable && this.items.length > 0) historyTable.classList.remove('hidden');
      
    } catch (error) {
      console.error('History loading error:', error);
      
      const loadingIndicator = document.getElementById('history-loading');
      const historyError = document.getElementById('history-error');
      
      if (loadingIndicator) loadingIndicator.classList.add('hidden');
      if (historyError) {
        historyError.classList.remove('hidden');
        historyError.textContent = error.message || 'Failed to load history data';
      }
    }
  },
  
  // Render history table
  renderHistory() {
    const tableBody = document.querySelector('#history-table tbody');
    if (!tableBody) return;
    
    // Clear table
    tableBody.innerHTML = '';
    
    if (this.items.length === 0) {
      const emptyMessage = document.getElementById('history-empty');
      if (emptyMessage) emptyMessage.classList.remove('hidden');
      return;
    }
    
    const emptyMessage = document.getElementById('history-empty');
    if (emptyMessage) emptyMessage.classList.add('hidden');
    
    // Add items to table
    this.items.forEach(item => {
      const row = document.createElement('tr');
      
      // Format date
      const date = new Date(item.scanDate);
      const formattedDate = date.toLocaleDateString() + ' ' + 
                           date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      
      // Create status class
      let statusClass = '';
      switch(item.status) {
        case 'completed': statusClass = 'completed'; break;
        case 'processing': statusClass = 'processing'; break;
        case 'failed': statusClass = 'failed'; break;
      }
      
      // Create table row
      row.innerHTML = `
        <td>${item.url}</td>
        <td>${formattedDate}</td>
        <td><span class="history-status ${statusClass}">${item.status}</span></td>
        <td>
          <div class="history-actions">
            <button class="btn btn-secondary btn-small" onclick="history.viewReport('${item.id}')">
              <i class="fas fa-eye"></i> View
            </button>
            <button class="btn btn-outline btn-small" onclick="history.exportReport('${item.id}')">
              <i class="fas fa-download"></i>
            </button>
            <button class="btn btn-error btn-small" onclick="history.deleteReport('${item.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      `;
      
      tableBody.appendChild(row);
    });
  },
  
  // Render pagination controls
  renderPagination() {
    const paginationElement = document.getElementById('history-pagination');
    if (!paginationElement) return;
    
    paginationElement.innerHTML = '';
    
    if (this.totalPages <= 1) return;
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = 'btn btn-secondary btn-small';
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i> Previous';
    prevButton.disabled = this.filters.page === 1;
    prevButton.addEventListener('click', () => {
      if (this.filters.page > 1) {
        this.filters.page--;
        this.loadHistory();
      }
    });
    paginationElement.appendChild(prevButton);
    
    // Page numbers
    const pageInfo = document.createElement('span');
    pageInfo.className = 'pagination-info';
    pageInfo.textContent = `Page ${this.filters.page} of ${this.totalPages}`;
    paginationElement.appendChild(pageInfo);
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = 'btn btn-secondary btn-small';
    nextButton.innerHTML = 'Next <i class="fas fa-chevron-right"></i>';
    nextButton.disabled = this.filters.page >= this.totalPages;
    nextButton.addEventListener('click', () => {
      if (this.filters.page < this.totalPages) {
        this.filters.page++;
        this.loadHistory();
      }
    });
    paginationElement.appendChild(nextButton);
  },
  
  // Apply search filter
  applySearchFilter(search) {
    this.filters.search = search;
    this.filters.page = 1;
    this.loadHistory();
  },
  
  // Apply status filter
  applyStatusFilter(status) {
    this.filters.status = status;
    this.filters.page = 1;
    this.loadHistory();
  },
  
  // Apply date range filter
  applyDateFilter(dateRange) {
    this.filters.dateRange = dateRange;
    this.filters.page = 1;
    this.loadHistory();
  },
  
  // View scan report
  viewReport(id) {
    window.location.href = `/results.html?id=${id}`;
  },
  
  // Export scan report
  async exportReport(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/export/${id}`, {
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
      a.download = `seo-report-${id}.pdf`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export report. Please try again.');
    }
  },
  
  // Delete scan report
  async deleteReport(id) {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/history/${id}`, {
        method: 'DELETE',
        headers: auth.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete report');
      }
      
      // Reload history after successful deletion
      this.loadHistory();
      
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete report. Please try again.');
    }
  }
};

// DOM Ready - Initialize History
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the history page
  if (!document.getElementById('history-page')) return;
  
  // Check authentication
  if (!auth.isAuthenticated) {
    window.location.href = '/login.html?redirect=history.html';
    return;
  }
  
  // Load history data
  history.loadHistory();
  
  // Setup search form
  const searchForm = document.getElementById('history-search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const searchInput = document.getElementById('history-search-input');
      history.applySearchFilter(searchInput.value);
    });
  }
  
  // Setup status filter
  const statusFilter = document.getElementById('status-filter');
  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      history.applyStatusFilter(statusFilter.value);
    });
  }
  
  // Setup date filter
  const dateFilter = document.getElementById('date-filter');
  if (dateFilter) {
    dateFilter.addEventListener('change', () => {
      history.applyDateFilter(dateFilter.value);
    });
  }
});