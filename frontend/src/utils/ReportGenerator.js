/**
 * Performance report generator utility
 * Handles PDF and JSON exports of performance data
 */
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { formatValue } from './Performanceutils';

/**
 * Generate a performance report in specified format
 * @param {Object} metrics - Performance metrics object
 * @param {string} url - URL that was tested
 * @param {string} format - Report format ('pdf' or 'json')
 * @returns {Object|Blob} Report data as JSON object or PDF blob
 */
export const generatePerformanceReport = async (metrics, url, format = 'pdf') => {
  if (format.toLowerCase() === 'pdf') {
    return generatePdfReport(metrics, url);
  } else if (format.toLowerCase() === 'json') {
    return generateJsonReport(metrics, url);
  } else {
    throw new Error(`Unsupported report format: ${format}`);
  }
};

/**
 * Generate JSON report
 * @param {Object} metrics - Performance metrics object
 * @param {string} url - URL that was tested
 * @returns {Object} Report data object
 */
const generateJsonReport = (metrics, url) => {
  const data = {
    url,
    timestamp: new Date().toISOString(),
    metrics
  };
  
  return data;
};

/**
 * Generate and download PDF report
 * @param {Object} metrics - Performance metrics object
 * @param {string} url - URL that was tested
 */
const generatePdfReport = (metrics, url) => {
  // Initialize jsPDF
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const hostname = new URL(url).hostname;
  
  // Set up document metadata
  doc.setProperties({
    title: `Performance Report - ${hostname}`,
    subject: 'Web Performance Metrics',
    author: 'Performance Meter Tool',
    keywords: 'web performance, metrics, LCP, FID, CLS',
    creator: 'Performance Meter Tool'
  });
  
  // Add header
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 128);
  doc.text('Performance Report', pageWidth / 2, 20, { align: 'center' });
  
  // Add URL and date
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`URL: ${url}`, 14, 30);
  doc.text(`Date: ${new Date().toLocaleString()}`, 14, 37);
  
  // Add overall score
  const totalScore = calculateTotalScore(metrics);
  doc.setFontSize(16);
  doc.text(`Overall Score: ${Math.round(totalScore)}/100`, pageWidth / 2, 47, { align: 'center' });
  
  // Add Core Web Vitals section
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 128);
  doc.text('Core Web Vitals', 14, 57);
  
  // Create Core Web Vitals table
  doc.autoTable({
    startY: 60,
    head: [['Metric', 'Value', 'Score']],
    body: [
      ['Largest Contentful Paint (LCP)', `${formatValue(metrics.lcp.value, 's')}`, `${Math.round(metrics.lcp.score * 100)}%`],
      ['First Input Delay (FID)', `${formatValue(metrics.fid.value, 'ms')}`, `${Math.round(metrics.fid.score * 100)}%`],
      ['Cumulative Layout Shift (CLS)', `${metrics.cls.value.toFixed(3)}`, `${Math.round(metrics.cls.score * 100)}%`]
    ],
    theme: 'striped',
    headStyles: { fillColor: [0, 0, 128] }
  });
  
  // Add Other Metrics section
  const finalY = doc.lastAutoTable.finalY || 120;
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 128);
  doc.text('Other Metrics', 14, finalY + 10);
  
  // Create Other Metrics table
  const otherMetricsBody = Object.entries(metrics.other).map(([key, value]) => {
    const formattedValue = typeof value === 'number' 
      ? formatValue(value, key.includes('time') ? 'ms' : (key.includes('Size') ? 'KB' : ''))
      : value;
    return [key, formattedValue];
  });
  
  doc.autoTable({
    startY: finalY + 13,
    head: [['Metric', 'Value']],
    body: otherMetricsBody,
    theme: 'striped',
    headStyles: { fillColor: [0, 0, 128] }
  });
  
  // Add Resources section if available
  if (metrics.resources) {
    const resourcesFinalY = doc.lastAutoTable.finalY || finalY + 70;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 128);
    doc.text('Resource Breakdown', 14, resourcesFinalY + 10);
    
    // Create Resources table
    const resourcesBody = Object.entries(metrics.resources).map(([type, data]) => {
      return [
        type,
        data.count,
        `${(data.size / 1024).toFixed(1)} KB`,
        `${data.loadTime.toFixed(0)} ms`
      ];
    });
    
    doc.autoTable({
      startY: resourcesFinalY + 13,
      head: [['Type', 'Count', 'Size', 'Load Time']],
      body: resourcesBody,
      theme: 'striped',
      headStyles: { fillColor: [0, 0, 128] }
    });
  }
  
  // Add Suggestions section if available
  if (metrics.suggestions && metrics.suggestions.length > 0) {
    const suggestionsFinalY = doc.lastAutoTable.finalY || 180;
    
    // Check if we need a new page
    if (suggestionsFinalY > 240) {
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 128);
      doc.text('Improvement Suggestions', 14, 20);
      
      // Create Suggestions content
      let y = 30;
      metrics.suggestions.forEach((suggestion, index) => {
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        // Handle text wrapping for suggestions
        const textLines = doc.splitTextToSize(
          `${index + 1}. ${suggestion}`, 
          pageWidth - 28
        );
        
        // Check if we need a new page
        if (y + (textLines.length * 5) > 280) {
          doc.addPage();
          y = 20;
        }
        
        doc.text(textLines, 14, y);
        y += (textLines.length * 7);
      });
    } else {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 128);
      doc.text('Improvement Suggestions', 14, suggestionsFinalY + 10);
      
      // Create Suggestions content
      let y = suggestionsFinalY + 20;
      metrics.suggestions.forEach((suggestion, index) => {
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        // Handle text wrapping for suggestions
        const textLines = doc.splitTextToSize(
          `${index + 1}. ${suggestion}`, 
          pageWidth - 28
        );
        
        // Check if we need a new page
        if (y + (textLines.length * 5) > 280) {
          doc.addPage();
          y = 20;
        }
        
        doc.text(textLines, 14, y);
        y += (textLines.length * 7);
      });
    }
  }
  
  // Add footer with page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Generated by Performance Meter Tool - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // Return the PDF as a blob
  return doc.output('blob');
};

/**
 * Calculate total performance score
 * @param {Object} metrics - Performance metrics
 * @returns {number} Score from 0-100
 */
const calculateTotalScore = (metrics) => {
  // Calculate weighted average
  const weights = {
    lcp: 25,   // 25% weight
    fid: 25,   // 25% weight
    cls: 25,   // 25% weight
    ttfb: 15,  // 15% weight
    fcp: 10    // 10% weight
  };
  
  return (
    (metrics.lcp.score * weights.lcp) +
    (metrics.fid.score * weights.fid) +
    (metrics.cls.score * weights.cls) +
    (metrics.other.ttfbScore * weights.ttfb) +
    (metrics.other.fcpScore * weights.fcp)
  );
};

/**
 * Format date for filename use
 * @returns {string} Formatted date string for filenames
 */
export const formatDateForFilename = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `${year}${month}${day}_${hours}${minutes}`;
};