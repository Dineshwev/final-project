/**
 * Performance Report Generator
 * Creates comprehensive PDF reports for performance metrics using jsPDF
 */

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
// Note: local helper file is named Performancehelper.js (lowercase h), adjust import accordingly
import { 
  calculatePerformanceGrade, 
  formatMetricValue, 
  getMetricThreshold 
} from './Performancehelper.js';

// Default colors
const COLORS = {
  primary: '#4285F4', // Google Blue
  secondary: '#34A853', // Google Green
  accent: '#FBBC05', // Google Yellow
  error: '#EA4335', // Google Red
  gray: '#9AA0A6',
  lightGray: '#F1F3F4',
  white: '#FFFFFF',
  black: '#202124',
};

// Default fonts
const FONTS = {
  heading: 'Helvetica',
  body: 'Helvetica',
};

/**
 * Generate performance report PDF
 * @param {string} url - URL of the analyzed page
 * @param {object} metrics - Performance metrics data
 * @param {object} analysis - Additional analysis data (opportunities, diagnostics, resources)
 * @param {object} options - Custom report options
 * @returns {Blob} - PDF document as blob
 */
export const generatePerformanceReport = async (url, metrics, analysis = {}, options = {}) => {
  const {
    opportunities = [],
    diagnostics = [],
    resources = [],
    device = 'mobile',
    includeBenchmarks = true,
    includeActionItems = true,
    includeDetailedAnalysis = true
  } = analysis;

  // Initialize PDF with A4 portrait
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Current Y position tracker
  let currentY = 20;
  
  // Add page function with auto page break
  const addPage = () => {
    pdf.addPage();
    currentY = 20;
    // Add header and footer to new page
    addPageNumbers(pdf.getNumberOfPages());
    addHeaderFooter();
  };
  
  // Check if we need to add a new page based on available space
  const checkForPageBreak = (requiredSpace) => {
    if (currentY + requiredSpace > 270) {
      addPage();
      return true;
    }
    return false;
  };

  // Add page numbers
  const addPageNumbers = (pageNumber) => {
    pdf.setFontSize(10);
    pdf.setTextColor(COLORS.gray);
    pdf.text(`Page ${pageNumber}`, 195, 285, { align: 'right' });
  };

  // Add header and footer
  const addHeaderFooter = () => {
    // Header - URL
    pdf.setFontSize(8);
    pdf.setTextColor(COLORS.gray);
    pdf.text(`Analysis of: ${url}`, 10, 10);
    
    // Header - Date
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    pdf.text(`Generated: ${date}`, 200, 10, { align: 'right' });
    
    // Footer - Copyright
    pdf.text('© SEO Test Tool', 10, 287);
    
    // TODO: Add company branding/logo here
    // pdf.addImage(companyLogo, 'PNG', 170, 283, 25, 10);
  };
  
  // Helper for drawing section heading
  const addSectionHeading = (title, icon = null) => {
    pdf.setFillColor(COLORS.lightGray);
    pdf.rect(10, currentY, 190, 10, 'F');
    pdf.setFontSize(14);
    pdf.setFont(FONTS.heading, 'bold');
    pdf.setTextColor(COLORS.primary);
    pdf.text(title, 15, currentY + 7);
    currentY += 15;
  };

  // Create title page
  const createTitlePage = () => {
    // Title
    pdf.setFontSize(24);
    pdf.setFont(FONTS.heading, 'bold');
    pdf.setTextColor(COLORS.black);
    pdf.text('PERFORMANCE ANALYSIS REPORT', 105, 60, { align: 'center' });
    
    // URL
    pdf.setFontSize(14);
    pdf.setFont(FONTS.body, 'normal');
    pdf.setTextColor(COLORS.primary);
    pdf.text(url, 105, 70, { align: 'center' });
    
    // Performance score circle
    const score = metrics.score;
    let scoreColor = COLORS.error;
    if (score >= 90) {
      scoreColor = COLORS.secondary;
    } else if (score >= 50) {
      scoreColor = COLORS.accent;
    }
    
    // Draw circle
    pdf.setFillColor(scoreColor);
    pdf.circle(105, 120, 20, 'F');
    
    // Draw score text
    pdf.setFontSize(22);
    pdf.setFont(FONTS.heading, 'bold');
    pdf.setTextColor(COLORS.white);
    pdf.text(score.toString(), 105, 125, { align: 'center' });
    
    // Grade
    pdf.setFontSize(14);
    pdf.text(metrics.grade || calculatePerformanceGrade(score), 105, 145, { align: 'center' });
    
    // Date
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    pdf.setFontSize(12);
    pdf.setTextColor(COLORS.gray);
    pdf.text(`Generated on ${date}`, 105, 160, { align: 'center' });
    
    // Device type
    const deviceText = device === 'mobile' ? 'Mobile Analysis' : 'Desktop Analysis';
    pdf.text(deviceText, 105, 170, { align: 'center' });
    
    // Footer
    pdf.setFontSize(10);
    pdf.setTextColor(COLORS.black);
    pdf.text('This report provides a comprehensive analysis of web performance metrics', 105, 240, { align: 'center' });
    pdf.text('based on Lighthouse and Core Web Vitals standards.', 105, 247, { align: 'center' });
    
    // Add page number
    addPageNumbers(1);
  };

  // Create table of contents
  const createTableOfContents = () => {
    addPage();
    
    pdf.setFontSize(18);
    pdf.setFont(FONTS.heading, 'bold');
    pdf.setTextColor(COLORS.black);
    pdf.text('Table of Contents', 105, currentY, { align: 'center' });
    currentY += 15;
    
    const tocItems = [
      { title: '1. Executive Summary', page: 3 },
      { title: '2. Core Web Vitals', page: 4 },
      { title: '3. Performance Metrics', page: 5 },
    ];
    
    let nextPage = 6;
    
    if (opportunities.length > 0) {
      tocItems.push({ title: '4. Improvement Opportunities', page: nextPage++ });
    }
    
    if (includeDetailedAnalysis) {
      tocItems.push({ title: `${tocItems.length + 1}. Detailed Analysis`, page: nextPage++ });
    }
    
    if (resources.length > 0) {
      tocItems.push({ title: `${tocItems.length + 1}. Resource Breakdown`, page: nextPage++ });
    }
    
    if (includeBenchmarks) {
      tocItems.push({ title: `${tocItems.length + 1}. Industry Benchmarks`, page: nextPage++ });
    }
    
    if (includeActionItems) {
      tocItems.push({ title: `${tocItems.length + 1}. Action Items`, page: nextPage });
    }
    
    pdf.setFontSize(12);
    pdf.setFont(FONTS.body, 'normal');
    
    tocItems.forEach(item => {
      pdf.setTextColor(COLORS.black);
      pdf.text(item.title, 20, currentY);
      
      // Add dotted line
      pdf.setTextColor(COLORS.primary);
      pdf.text(`Page ${item.page}`, 180, currentY, { align: 'right' });
      
      // Draw dots
      pdf.setDrawColor(COLORS.lightGray);
      pdf.setLineDashPattern([1, 1], 0);
      pdf.line(70, currentY - 2, 170, currentY - 2);
      
      currentY += 10;
    });
  };
  
  // Create executive summary
  const createExecutiveSummary = () => {
    addPage();
    addSectionHeading('1. Executive Summary');
    
    // Overall assessment
    pdf.setFontSize(12);
    pdf.setFont(FONTS.body, 'normal');
    pdf.setTextColor(COLORS.black);
    
    const score = metrics.score;
    let assessment = '';
    
    if (score >= 90) {
      assessment = 'Excellent performance. The page loads quickly and provides a great user experience.';
    } else if (score >= 70) {
      assessment = 'Good performance. The page loads reasonably quickly but has room for improvement.';
    } else if (score >= 50) {
      assessment = 'Average performance. The page loads somewhat slowly and needs improvement.';
    } else {
      assessment = 'Poor performance. The page loads slowly and requires significant optimization.';
    }
    
    pdf.text('Overall Assessment:', 15, currentY);
    currentY += 7;
    pdf.text(assessment, 15, currentY, { maxWidth: 180 });
    currentY += 15;
    
    // Key findings
    pdf.setFont(FONTS.body, 'bold');
    pdf.text('Key Findings:', 15, currentY);
    currentY += 7;
    
    pdf.setFont(FONTS.body, 'normal');
    
    // Identify the biggest issues
    const findings = [];
    
    // Check Core Web Vitals
    if (metrics.LCP > getMetricThreshold('LCP').poor) {
      findings.push('Largest Contentful Paint (LCP) is too slow, affecting perceived load speed.');
    }
    
    if (metrics.FID > getMetricThreshold('FID').poor) {
      findings.push('First Input Delay (FID) is high, causing poor interactivity.');
    }
    
    if (metrics.CLS > getMetricThreshold('CLS').poor) {
      findings.push('Cumulative Layout Shift (CLS) is high, causing visual instability.');
    }
    
    // Add top opportunities if available
    if (opportunities.length > 0) {
      opportunities.slice(0, 2).forEach(opp => {
        findings.push(opp.title);
      });
    }
    
    // If no specific findings, add generic advice
    if (findings.length === 0) {
      if (score < 90) {
        findings.push('General speed optimizations would improve overall performance.');
      } else {
        findings.push('Performance is excellent, continue monitoring to maintain high standards.');
      }
    }
    
    // List findings with bullet points
    findings.forEach((finding, index) => {
      if (index > 5) return; // Limit to 6 findings
      
      pdf.text(`• ${finding}`, 15, currentY, { maxWidth: 180 });
      currentY += 7;
    });
    
    currentY += 10;
    
    // Bottom line summary
    pdf.setFont(FONTS.body, 'bold');
    pdf.text('Bottom Line:', 15, currentY);
    currentY += 7;
    
    pdf.setFont(FONTS.body, 'normal');
    
    let bottomLine = '';
    if (score >= 90) {
      bottomLine = 'The page performs excellently. Focus on maintaining performance as content changes.';
    } else if (score >= 70) {
      bottomLine = 'The page performs well but could be improved. Address the key opportunities identified.';
    } else if (score >= 50) {
      bottomLine = 'The page needs performance improvements. Prioritize the identified issues.';
    } else {
      bottomLine = 'The page requires significant optimization. Address all critical performance issues.';
    }
    
    pdf.text(bottomLine, 15, currentY, { maxWidth: 180 });
  };
  
  // Create Core Web Vitals section
  const createCoreWebVitalsSection = () => {
    addPage();
    addSectionHeading('2. Core Web Vitals');
    
    // Introduction text
    pdf.setFontSize(10);
    pdf.setFont(FONTS.body, 'italic');
    pdf.setTextColor(COLORS.gray);
    pdf.text('Core Web Vitals are a set of specific factors that Google considers important in a webpage\'s overall user experience.', 
      15, currentY, { maxWidth: 180 });
    currentY += 15;
    
    // Create a table for Core Web Vitals
    const webVitals = [
      {
        metric: 'LCP',
        name: 'Largest Contentful Paint',
        value: formatMetricValue(metrics.LCP, 'LCP'),
        raw: metrics.LCP,
        threshold: getMetricThreshold('LCP').good,
        description: 'Measures loading performance. To provide a good user experience, LCP should occur within 2.5 seconds of when the page first starts loading.'
      },
      {
        metric: 'FID',
        name: 'First Input Delay',
        value: formatMetricValue(metrics.FID, 'FID'),
        raw: metrics.FID,
        threshold: getMetricThreshold('FID').good,
        description: 'Measures interactivity. To provide a good user experience, pages should have a FID of 100 milliseconds or less.'
      },
      {
        metric: 'CLS',
        name: 'Cumulative Layout Shift',
        value: formatMetricValue(metrics.CLS, 'CLS'),
        raw: metrics.CLS,
        threshold: getMetricThreshold('CLS').good,
        description: 'Measures visual stability. To provide a good user experience, pages should maintain a CLS of 0.1 or less.'
      }
    ];
    
    const tableData = webVitals.map(vital => {
      // Determine status
      let status = 'GOOD';
      let statusColor = COLORS.secondary;
      
      if (vital.metric === 'LCP') {
        if (vital.raw > getMetricThreshold('LCP').poor) {
          status = 'POOR';
          statusColor = COLORS.error;
        } else if (vital.raw > getMetricThreshold('LCP').good) {
          status = 'NEEDS IMPROVEMENT';
          statusColor = COLORS.accent;
        }
      } else if (vital.metric === 'FID') {
        if (vital.raw > getMetricThreshold('FID').poor) {
          status = 'POOR';
          statusColor = COLORS.error;
        } else if (vital.raw > getMetricThreshold('FID').good) {
          status = 'NEEDS IMPROVEMENT';
          statusColor = COLORS.accent;
        }
      } else if (vital.metric === 'CLS') {
        if (vital.raw > getMetricThreshold('CLS').poor) {
          status = 'POOR';
          statusColor = COLORS.error;
        } else if (vital.raw > getMetricThreshold('CLS').good) {
          status = 'NEEDS IMPROVEMENT';
          statusColor = COLORS.accent;
        }
      }
      
      return [
        { content: vital.metric, styles: { fontStyle: 'bold' } },
        { content: vital.name },
        { content: vital.value },
        { content: status, styles: { fillColor: statusColor, textColor: COLORS.white } }
      ];
    });
    
    pdf.autoTable({
      startY: currentY,
      head: [['Metric', 'Name', 'Value', 'Status']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: COLORS.primary, textColor: COLORS.white },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 60 },
        2: { cellWidth: 35 },
        3: { cellWidth: 40 }
      },
      didDrawCell: (data) => {
        // Custom cell styling
      }
    });
    
    currentY = pdf.lastAutoTable.finalY + 15;
    
    // Add descriptions
    pdf.setFontSize(10);
    pdf.setFont(FONTS.body, 'normal');
    pdf.setTextColor(COLORS.black);
    
    webVitals.forEach(vital => {
      if (checkForPageBreak(20)) return;
      
      pdf.setFont(FONTS.body, 'bold');
      pdf.text(`${vital.metric} - ${vital.name}:`, 15, currentY);
      currentY += 5;
      
      pdf.setFont(FONTS.body, 'normal');
      pdf.text(vital.description, 15, currentY, { maxWidth: 180 });
      currentY += 10;
    });
  };
  
  // Create Performance Metrics section
  const createPerformanceMetricsSection = () => {
    addPage();
    addSectionHeading('3. Performance Metrics');
    
    // Additional metrics table
    const additionalMetrics = [
      {
        metric: 'FCP',
        name: 'First Contentful Paint',
        value: formatMetricValue(metrics.FCP, 'FCP'),
        description: 'Measures the time from when the page starts loading to when any part of the page\'s content is rendered on the screen.'
      },
      {
        metric: 'TTI',
        name: 'Time to Interactive',
        value: formatMetricValue(metrics.TTI, 'TTI'),
        description: 'Measures how long it takes a page to become fully interactive.'
      },
      {
        metric: 'TBT',
        name: 'Total Blocking Time',
        value: formatMetricValue(metrics.TBT, 'TBT'),
        description: 'Measures the total amount of time that a page is blocked from responding to user input.'
      },
      {
        metric: 'TTFB',
        name: 'Time to First Byte',
        value: formatMetricValue(metrics.TTFB, 'TTFB'),
        description: 'Measures the time between the request for a resource and when the first byte of a response begins to arrive.'
      }
    ];
    
    if (metrics.totalBytes) {
      additionalMetrics.push({
        metric: 'Size',
        name: 'Total Page Size',
        value: formatMetricValue(metrics.totalBytes, 'totalBytes'),
        description: 'The total size of all resources loaded by the page.'
      });
    }
    
    const tableData = additionalMetrics.map(metric => [
      { content: metric.metric, styles: { fontStyle: 'bold' } },
      { content: metric.name },
      { content: metric.value }
    ]);
    
    pdf.autoTable({
      startY: currentY,
      head: [['Metric', 'Name', 'Value']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: COLORS.primary, textColor: COLORS.white },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 100 },
        2: { cellWidth: 35 }
      }
    });
    
    currentY = pdf.lastAutoTable.finalY + 15;
    
    // Add descriptions
    pdf.setFontSize(10);
    pdf.setFont(FONTS.body, 'normal');
    pdf.setTextColor(COLORS.black);
    
    additionalMetrics.forEach((metric, index) => {
      if (index > 2) return; // Limit to first 3 descriptions to avoid overcrowding
      if (checkForPageBreak(15)) return;
      
      pdf.setFont(FONTS.body, 'bold');
      pdf.text(`${metric.metric}:`, 15, currentY);
      currentY += 5;
      
      pdf.setFont(FONTS.body, 'normal');
      pdf.text(metric.description, 15, currentY, { maxWidth: 180 });
      currentY += 10;
    });
  };
  
  // Create opportunities section
  const createOpportunitiesSection = () => {
    if (opportunities.length === 0) return;
    
    addPage();
    addSectionHeading('4. Improvement Opportunities');
    
    // Introduction text
    pdf.setFontSize(10);
    pdf.setFont(FONTS.body, 'italic');
    pdf.setTextColor(COLORS.gray);
    pdf.text('These opportunities suggest specific optimizations that could improve page load performance.', 
      15, currentY, { maxWidth: 180 });
    currentY += 15;
    
    // List opportunities
    pdf.setFontSize(11);
    pdf.setFont(FONTS.body, 'normal');
    pdf.setTextColor(COLORS.black);
    
    opportunities.forEach((opportunity, index) => {
      if (checkForPageBreak(25)) return;
      
      // Priority indicator based on score
      let priorityColor = COLORS.error;
      
      if (opportunity.score >= 0.5) {
        priorityColor = COLORS.accent;
      } else if (opportunity.score >= 0.9) {
        priorityColor = COLORS.secondary;
      }
      
      pdf.setFillColor(priorityColor);
      pdf.rect(15, currentY - 4, 7, 7, 'F');
      
      // Opportunity title
      pdf.setFont(FONTS.body, 'bold');
      pdf.text(`${index + 1}. ${opportunity.title}`, 28, currentY);
      currentY += 7;
      
      // Opportunity description
      pdf.setFont(FONTS.body, 'normal');
      pdf.setFontSize(10);
      pdf.text(opportunity.description, 28, currentY, { maxWidth: 170 });
      currentY += 10;
      
      // Potential savings if available
      if (opportunity.displayValue) {
        pdf.setFont(FONTS.body, 'italic');
        pdf.text(`Potential impact: ${opportunity.displayValue}`, 28, currentY);
        currentY += 10;
      }
    });
  };
  
  // Create detailed analysis section
  const createDetailedAnalysisSection = () => {
    if (!includeDetailedAnalysis) return;
    
    addPage();
    const sectionNumber = opportunities.length > 0 ? 5 : 4;
    addSectionHeading(`${sectionNumber}. Detailed Analysis`);
    
    // Introduction text
    pdf.setFontSize(10);
    pdf.setFont(FONTS.body, 'italic');
    pdf.setTextColor(COLORS.gray);
    pdf.text('This section provides in-depth analysis of various performance aspects.', 
      15, currentY, { maxWidth: 180 });
    currentY += 15;
    
    // Display diagnostics if available
    if (diagnostics.length > 0) {
      pdf.setFontSize(12);
      pdf.setFont(FONTS.body, 'bold');
      pdf.setTextColor(COLORS.black);
      pdf.text('Technical Diagnostics', 15, currentY);
      currentY += 10;
      
      pdf.setFontSize(10);
      pdf.setFont(FONTS.body, 'normal');
      
      diagnostics.forEach((item, index) => {
        if (index > 4) return; // Limit to 5 diagnostics
        if (checkForPageBreak(20)) return;
        
        pdf.setFont(FONTS.body, 'bold');
        pdf.text(`${item.title}`, 15, currentY);
        currentY += 5;
        
        pdf.setFont(FONTS.body, 'normal');
        pdf.text(item.description, 15, currentY, { maxWidth: 180 });
        
        if (item.displayValue) {
          pdf.text(`Value: ${item.displayValue}`, 15, currentY + 7);
          currentY += 12;
        } else {
          currentY += 10;
        }
      });
    }
    
    // Add additional analysis based on metrics
    if (checkForPageBreak(30)) return;
    currentY += 5;
    
    pdf.setFontSize(12);
    pdf.setFont(FONTS.body, 'bold');
    pdf.setTextColor(COLORS.black);
    pdf.text('Performance Analysis', 15, currentY);
    currentY += 10;
    
    pdf.setFontSize(10);
    pdf.setFont(FONTS.body, 'normal');
    
    // Example: Analyze page load sequence
    const loadTimeAnalysis = `The page begins loading with a Time to First Byte (TTFB) of ${formatMetricValue(metrics.TTFB, 'TTFB')}, 
followed by First Contentful Paint (FCP) at ${formatMetricValue(metrics.FCP, 'FCP')}, and becomes fully interactive 
after ${formatMetricValue(metrics.TTI, 'TTI')}. The main content (LCP) appears at ${formatMetricValue(metrics.LCP, 'LCP')}.`;
    
    pdf.text(loadTimeAnalysis, 15, currentY, { maxWidth: 180 });
    currentY += 15;
    
    // Bottlenecks identification (example)
    pdf.setFont(FONTS.body, 'bold');
    pdf.text('Key Bottlenecks:', 15, currentY);
    currentY += 7;
    
    pdf.setFont(FONTS.body, 'normal');
    
    let bottlenecks = [];
    
    // Identify bottlenecks based on metrics
    if (metrics.TTFB > 600) {
      bottlenecks.push('Slow server response time - Consider server optimization or CDN');
    }
    
    if (metrics.LCP > 2500 && metrics.FCP > 1800) {
      bottlenecks.push('Slow initial rendering - Optimize critical rendering path');
    }
    
    if (metrics.TTI - metrics.FCP > 5000) {
      bottlenecks.push('Long time to interactive - Reduce JavaScript execution time');
    }
    
    if (metrics.TBT > 300) {
      bottlenecks.push('High blocking time - Break up long tasks and optimize JavaScript');
    }
    
    if (metrics.CLS > 0.1) {
      bottlenecks.push('Layout instability - Set size attributes on images and videos');
    }
    
    // If no bottlenecks identified, add a placeholder
    if (bottlenecks.length === 0) {
      bottlenecks.push('No significant bottlenecks identified');
    }
    
    // List bottlenecks
    bottlenecks.forEach((bottleneck) => {
      pdf.text(`• ${bottleneck}`, 15, currentY, { maxWidth: 180 });
      currentY += 7;
    });
  };
  
  // Create resources section
  const createResourcesSection = () => {
    if (resources.length === 0) return;
    
    addPage();
    const sectionOffset = (opportunities.length > 0 ? 1 : 0) + (includeDetailedAnalysis ? 1 : 0);
    const sectionNumber = 4 + sectionOffset;
    addSectionHeading(`${sectionNumber}. Resource Breakdown`);
    
    // Introduction text
    pdf.setFontSize(10);
    pdf.setFont(FONTS.body, 'italic');
    pdf.setTextColor(COLORS.gray);
    pdf.text('This section breaks down the resources loaded by the page by type and size.', 
      15, currentY, { maxWidth: 180 });
    currentY += 15;
    
    // Total stats
    const totalBytes = resources.reduce((sum, r) => sum + r.totalBytes, 0);
    const totalRequests = resources.reduce((sum, r) => sum + r.totalRequests, 0);
    
    pdf.setFontSize(12);
    pdf.setFont(FONTS.body, 'normal');
    pdf.setTextColor(COLORS.black);
    pdf.text(`Total Size: ${formatMetricValue(totalBytes, 'totalBytes')} (${totalRequests} requests)`, 15, currentY);
    currentY += 15;
    
    // Create resource table
    const tableData = resources.map(resource => {
      const percentage = Math.round((resource.totalBytes / totalBytes) * 100);
      const resourceType = resource.type.charAt(0).toUpperCase() + resource.type.slice(1);
      
      return [
        { content: resourceType },
        { content: formatMetricValue(resource.totalBytes, 'totalBytes') },
        { content: resource.totalRequests.toString() },
        { content: `${percentage}%` }
      ];
    });
    
    pdf.autoTable({
      startY: currentY,
      head: [['Type', 'Size', 'Requests', '% of Total']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: COLORS.primary, textColor: COLORS.white }
    });
    
    currentY = pdf.lastAutoTable.finalY + 15;
    
    // Add optimization tips based on resource breakdown
    pdf.setFontSize(11);
    pdf.setFont(FONTS.body, 'bold');
    pdf.text('Resource Optimization Tips:', 15, currentY);
    currentY += 7;
    
    pdf.setFontSize(10);
    pdf.setFont(FONTS.body, 'normal');
    
    // Find largest resource types
    const sortedResources = [...resources].sort((a, b) => b.totalBytes - a.totalBytes);
    const largestType = sortedResources.length > 0 ? sortedResources[0].type : null;
    
    // Tips based on largest resource types
    const tips = [];
    
    if (largestType === 'image') {
      tips.push('Consider using WebP format and responsive images');
      tips.push('Implement lazy loading for below-the-fold images');
    } else if (largestType === 'script') {
      tips.push('Implement code splitting to reduce JavaScript bundle size');
      tips.push('Defer non-critical JavaScript');
    } else if (largestType === 'stylesheet') {
      tips.push('Remove unused CSS and consider critical CSS inline');
      tips.push('Minify and compress CSS files');
    } else if (largestType === 'font') {
      tips.push('Use system fonts when possible or optimize web font loading');
      tips.push('Consider font-display: swap for text visibility during font loading');
    } else {
      tips.push('Optimize resource loading order to prioritize critical resources');
      tips.push('Implement resource hints like preconnect and preload');
    }
    
    tips.forEach((tip) => {
      pdf.text(`• ${tip}`, 15, currentY, { maxWidth: 180 });
      currentY += 7;
    });
  };
  
  // Create benchmarks section
  const createBenchmarksSection = () => {
    if (!includeBenchmarks) return;
    
    addPage();
    const sectionOffset = (opportunities.length > 0 ? 1 : 0) + 
      (includeDetailedAnalysis ? 1 : 0) +
      (resources.length > 0 ? 1 : 0);
    const sectionNumber = 4 + sectionOffset;
    addSectionHeading(`${sectionNumber}. Industry Benchmarks`);
    
    // Introduction text
    pdf.setFontSize(10);
    pdf.setFont(FONTS.body, 'italic');
    pdf.setTextColor(COLORS.gray);
    pdf.text('This section compares your performance metrics against industry benchmarks.', 
      15, currentY, { maxWidth: 180 });
    currentY += 15;
    
    // Create benchmarks table
    // These are example benchmarks, in a real implementation you would fetch industry data
    const benchmarks = [
      {
        metric: 'LCP',
        current: metrics.LCP,
        industry: 2500,
        target: 2500,
        unit: 'ms'
      },
      {
        metric: 'FID',
        current: metrics.FID,
        industry: 100,
        target: 100,
        unit: 'ms'
      },
      {
        metric: 'CLS',
        current: metrics.CLS,
        industry: 0.1,
        target: 0.1,
        unit: ''
      },
      {
        metric: 'FCP',
        current: metrics.FCP,
        industry: 1800,
        target: 1800,
        unit: 'ms'
      },
      {
        metric: 'Performance Score',
        current: metrics.score,
        industry: 75,
        target: 90,
        unit: ''
      }
    ];
    
    const tableData = benchmarks.map(benchmark => {
      let currentValue = benchmark.current;
      let industryValue = benchmark.industry;
      let targetValue = benchmark.target;
      
      // Format values
      if (benchmark.metric === 'Performance Score') {
        currentValue = `${currentValue}`;
        industryValue = `${industryValue}`;
        targetValue = `${targetValue}`;
      } else {
        currentValue = `${formatMetricValue(currentValue, benchmark.metric)}`;
        industryValue = `${formatMetricValue(industryValue, benchmark.metric)}`;
        targetValue = `${formatMetricValue(targetValue, benchmark.metric)}`;
      }
      
      // Determine status
      let status = 'ABOVE AVERAGE';
      let statusColor = COLORS.secondary;
      
      if (benchmark.metric === 'Performance Score' || benchmark.metric === 'Speed Index') {
        if (benchmark.current < benchmark.industry) {
          status = 'BELOW AVERAGE';
          statusColor = COLORS.error;
        }
      } else {
        if (benchmark.current > benchmark.industry) {
          status = 'BELOW AVERAGE';
          statusColor = COLORS.error;
        }
      }
      
      return [
        { content: benchmark.metric, styles: { fontStyle: 'bold' } },
        { content: currentValue },
        { content: industryValue },
        { content: targetValue },
        { content: status, styles: { fillColor: statusColor, textColor: COLORS.white } }
      ];
    });
    
    pdf.autoTable({
      startY: currentY,
      head: [['Metric', 'Your Value', 'Industry Avg.', 'Target', 'Status']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: COLORS.primary, textColor: COLORS.white }
    });
    
    currentY = pdf.lastAutoTable.finalY + 15;
    
    // Benchmark explanation
    pdf.setFontSize(10);
    pdf.setFont(FONTS.body, 'normal');
    pdf.setTextColor(COLORS.black);
    pdf.text('Industry benchmarks are based on aggregated Chrome User Experience Report (CrUX) data. These benchmarks represent', 
      15, currentY, { maxWidth: 180 });
    currentY += 5;
    pdf.text('median values across sites in similar industries.', 
      15, currentY, { maxWidth: 180 });
    currentY += 15;
    
    // Add comparison insights
    pdf.setFontSize(11);
    pdf.setFont(FONTS.body, 'bold');
    pdf.text('Benchmark Insights:', 15, currentY);
    currentY += 7;
    
    pdf.setFontSize(10);
    pdf.setFont(FONTS.body, 'normal');
    
    // Generate insights based on metric comparisons
    const insights = [];
    
    if (metrics.score > benchmarks[4].industry + 10) {
      insights.push('Your performance score is significantly better than the industry average.');
    } else if (metrics.score < benchmarks[4].industry - 10) {
      insights.push('Your performance score is below the industry average, indicating improvement opportunities.');
    } else {
      insights.push('Your performance score is in line with the industry average.');
    }
    
    if (metrics.LCP > benchmarks[0].industry * 1.5) {
      insights.push('Your Largest Contentful Paint is significantly slower than industry average.');
    }
    
    if (metrics.CLS > benchmarks[2].industry * 1.5) {
      insights.push('Your page has more layout instability than industry average.');
    }
    
    insights.forEach((insight) => {
      pdf.text(`• ${insight}`, 15, currentY, { maxWidth: 180 });
      currentY += 7;
    });
  };
  
  // Create action items section
  const createActionItemsSection = () => {
    if (!includeActionItems) return;
    
    addPage();
    const sectionOffset = (opportunities.length > 0 ? 1 : 0) + 
      (includeDetailedAnalysis ? 1 : 0) +
      (resources.length > 0 ? 1 : 0) +
      (includeBenchmarks ? 1 : 0);
    const sectionNumber = 4 + sectionOffset;
    addSectionHeading(`${sectionNumber}. Action Items Checklist`);
    
    // Introduction text
    pdf.setFontSize(10);
    pdf.setFont(FONTS.body, 'italic');
    pdf.setTextColor(COLORS.gray);
    pdf.text('This checklist provides specific actions to improve your page performance.', 
      15, currentY, { maxWidth: 180 });
    currentY += 15;
    
    // Generate action items based on metrics and opportunities
    const actionItems = [];
    
    // Add items from opportunities first
    if (opportunities.length > 0) {
      opportunities.forEach(opportunity => {
        let actionText = '';
        
        switch(opportunity.id) {
          case 'render-blocking-resources':
            actionText = 'Eliminate render-blocking resources by deferring or asynchronously loading them';
            break;
          case 'uses-optimized-images':
            actionText = 'Optimize images using modern formats like WebP and enable compression';
            break;
          case 'uses-responsive-images':
            actionText = 'Serve responsive images with appropriate sizes for different devices';
            break;
          case 'unminified-css':
            actionText = 'Minify CSS files to reduce their size';
            break;
          case 'unminified-javascript':
            actionText = 'Minify JavaScript files to reduce their size';
            break;
          case 'unused-css-rules':
            actionText = 'Remove or defer unused CSS rules to reduce stylesheet size';
            break;
          case 'unused-javascript':
            actionText = 'Remove or defer unused JavaScript to reduce bundle size';
            break;
          default:
            actionText = opportunity.title;
        }
        
        if (actionText) {
          actionItems.push({
            text: actionText,
            priority: opportunity.score < 0.5 ? 'High' : 'Medium'
          });
        }
      });
    }
    
    // Add general action items based on metrics
    if (metrics.LCP > getMetricThreshold('LCP').good) {
      actionItems.push({
        text: 'Optimize Largest Contentful Paint by prioritizing loading of the main content image or text',
        priority: metrics.LCP > getMetricThreshold('LCP').poor ? 'High' : 'Medium'
      });
    }
    
    if (metrics.FID > getMetricThreshold('FID').good) {
      actionItems.push({
        text: 'Improve First Input Delay by optimizing JavaScript execution and breaking up long tasks',
        priority: metrics.FID > getMetricThreshold('FID').poor ? 'High' : 'Medium'
      });
    }
    
    if (metrics.CLS > getMetricThreshold('CLS').good) {
      actionItems.push({
        text: 'Reduce Cumulative Layout Shift by specifying size attributes for images and embeds',
        priority: metrics.CLS > getMetricThreshold('CLS').poor ? 'High' : 'Medium'
      });
    }
    
    if (metrics.TTFB > 600) {
      actionItems.push({
        text: 'Improve server response time through better hosting, CDN, or caching',
        priority: metrics.TTFB > 1000 ? 'High' : 'Medium'
      });
    }
    
    // Add some general recommendations if we don't have many specific items
    if (actionItems.length < 3) {
      actionItems.push({
        text: 'Implement a caching strategy for static assets',
        priority: 'Medium'
      });
      
      actionItems.push({
        text: 'Enable text compression (gzip or Brotli) on your server',
        priority: 'Medium'
      });
    }
    
    // Sort by priority
    actionItems.sort((a, b) => {
      const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    // Create a checklist table
    const tableData = actionItems.map((item, index) => {
      let priorityColor = COLORS.secondary;
      if (item.priority === 'High') {
        priorityColor = COLORS.error;
      } else if (item.priority === 'Medium') {
        priorityColor = COLORS.accent;
      }
      
      return [
        { content: `${index + 1}.`, styles: { fontStyle: 'bold' } },
        { content: item.text },
        { content: item.priority, styles: { fillColor: priorityColor, textColor: COLORS.white } },
        { content: '☐' }
      ];
    });
    
    pdf.autoTable({
      startY: currentY,
      head: [['#', 'Action Item', 'Priority', 'Done']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: COLORS.primary, textColor: COLORS.white },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 120 },
        2: { cellWidth: 30 },
        3: { cellWidth: 15 }
      }
    });
    
    currentY = pdf.lastAutoTable.finalY + 15;
    
    // Add note
    pdf.setFontSize(9);
    pdf.setFont(FONTS.body, 'italic');
    pdf.setTextColor(COLORS.gray);
    pdf.text('Note: This checklist represents the most impactful actions based on your current performance analysis.', 
      15, currentY, { maxWidth: 180 });
    currentY += 5;
    pdf.text('Implementing these items in order of priority will likely yield the best performance improvements.', 
      15, currentY, { maxWidth: 180 });
  };
  
  // Generate the report
  try {
    // Create each section of the report
    createTitlePage();
    createTableOfContents();
    createExecutiveSummary();
    createCoreWebVitalsSection();
    createPerformanceMetricsSection();
    createOpportunitiesSection();
    createDetailedAnalysisSection();
    createResourcesSection();
    createBenchmarksSection();
    createActionItemsSection();
    
    // Return the PDF as a blob
    return pdf.output('blob');
  } catch (err) {
    console.error('Error generating performance report:', err);
    throw err;
  }
};

/**
 * Generate comparison report between two URLs
 * @param {string} url1 - First URL
 * @param {string} url2 - Second URL
 * @param {object} metrics1 - Performance metrics for first URL
 * @param {object} metrics2 - Performance metrics for second URL
 * @param {object} options - Custom report options
 * @returns {Blob} - PDF document as blob
 */
export const generateComparisonReport = async (url1, url2, metrics1, metrics2, options = {}) => {
  // Initialize PDF with A4 portrait
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Current Y position tracker
  let currentY = 20;
  
  // Add page function with auto page break
  const addPage = () => {
    pdf.addPage();
    currentY = 20;
    // Add header and footer to new page
    addPageNumbers(pdf.getNumberOfPages());
    addHeaderFooter();
  };
  
  // Check if we need to add a new page based on available space
  const checkForPageBreak = (requiredSpace) => {
    if (currentY + requiredSpace > 270) {
      addPage();
      return true;
    }
    return false;
  };

  // Add page numbers
  const addPageNumbers = (pageNumber) => {
    pdf.setFontSize(10);
    pdf.setTextColor(COLORS.gray);
    pdf.text(`Page ${pageNumber}`, 195, 285, { align: 'right' });
  };

  // Add header and footer
  const addHeaderFooter = () => {
    // Header - URLs
    pdf.setFontSize(8);
    pdf.setTextColor(COLORS.gray);
    pdf.text(`Comparison: ${url1} vs ${url2}`, 10, 10);
    
    // Header - Date
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    pdf.text(`Generated: ${date}`, 200, 10, { align: 'right' });
    
    // Footer - Copyright
    pdf.text('© SEO Test Tool', 10, 287);
    
    // TODO: Add company branding/logo here
    // pdf.addImage(companyLogo, 'PNG', 170, 283, 25, 10);
  };
  
  // Helper for drawing section heading
  const addSectionHeading = (title, icon = null) => {
    pdf.setFillColor(COLORS.lightGray);
    pdf.rect(10, currentY, 190, 10, 'F');
    pdf.setFontSize(14);
    pdf.setFont(FONTS.heading, 'bold');
    pdf.setTextColor(COLORS.primary);
    pdf.text(title, 15, currentY + 7);
    currentY += 15;
  };

  // Create title page
  const createTitlePage = () => {
    // Title
    pdf.setFontSize(24);
    pdf.setFont(FONTS.heading, 'bold');
    pdf.setTextColor(COLORS.black);
    pdf.text('PERFORMANCE COMPARISON REPORT', 105, 60, { align: 'center' });
    
    // URLs
    pdf.setFontSize(14);
    pdf.setFont(FONTS.body, 'normal');
    pdf.setTextColor(COLORS.primary);
    
    // Format URLs to ensure they fit
    const maxUrlLength = 60;
    const formatUrl = (url) => {
      if (url.length > maxUrlLength) {
        return url.substring(0, maxUrlLength) + '...';
      }
      return url;
    };
    
    pdf.text(`URL 1: ${formatUrl(url1)}`, 105, 80, { align: 'center' });
    pdf.text(`URL 2: ${formatUrl(url2)}`, 105, 90, { align: 'center' });
    
    // Performance score circles
    const score1 = metrics1.score;
    const score2 = metrics2.score;
    
    let score1Color = COLORS.error;
    if (score1 >= 90) {
      score1Color = COLORS.secondary;
    } else if (score1 >= 50) {
      score1Color = COLORS.accent;
    }
    
    let score2Color = COLORS.error;
    if (score2 >= 90) {
      score2Color = COLORS.secondary;
    } else if (score2 >= 50) {
      score2Color = COLORS.accent;
    }
    
    // Draw circles
    pdf.setFillColor(score1Color);
    pdf.circle(80, 130, 20, 'F');
    
    pdf.setFillColor(score2Color);
    pdf.circle(130, 130, 20, 'F');
    
    // Draw score text
    pdf.setFontSize(22);
    pdf.setFont(FONTS.heading, 'bold');
    pdf.setTextColor(COLORS.white);
    pdf.text(score1.toString(), 80, 135, { align: 'center' });
    pdf.text(score2.toString(), 130, 135, { align: 'center' });
    
    // URL labels
    pdf.setFontSize(10);
    pdf.setTextColor(COLORS.gray);
    pdf.text('URL 1', 80, 160, { align: 'center' });
    pdf.text('URL 2', 130, 160, { align: 'center' });
    
    // Date
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
    });
    
    pdf.setFontSize(12);
    pdf.text(`Generated on ${date}`, 105, 180, { align: 'center' });
    
    // Add page number
    addPageNumbers(1);
  };
  
  // Create comparison summary
  const createComparisonSummary = () => {
    addPage();
    addSectionHeading('1. Comparison Summary');
    
    const score1 = metrics1.score;
    const score2 = metrics2.score;
    const scoreDiff = score2 - score1;
    
    // Summary text
    pdf.setFontSize(11);
    pdf.setFont(FONTS.body, 'normal');
    pdf.setTextColor(COLORS.black);
    
    let summaryText = '';
    if (Math.abs(scoreDiff) < 5) {
      summaryText = 'The two URLs have similar overall performance scores.';
    } else if (scoreDiff > 0) {
      summaryText = `URL 2 (${url2}) outperforms URL 1 (${url1}) by ${Math.abs(scoreDiff)} points.`;
    } else {
      summaryText = `URL 1 (${url1}) outperforms URL 2 (${url2}) by ${Math.abs(scoreDiff)} points.`;
    }
    
    pdf.text(summaryText, 15, currentY, { maxWidth: 180 });
    currentY += 15;
    
    // Create comparison table for core metrics
    const coreMetrics = [
      {
        name: 'Performance Score',
        value1: `${score1}`,
        value2: `${score2}`,
        diff: scoreDiff,
        unit: 'points',
        higherIsBetter: true
      },
      {
        name: 'Largest Contentful Paint',
        value1: formatMetricValue(metrics1.LCP, 'LCP'),
        value2: formatMetricValue(metrics2.LCP, 'LCP'),
        diff: metrics2.LCP - metrics1.LCP,
        unit: 'ms',
        higherIsBetter: false
      },
      {
        name: 'First Input Delay',
        value1: formatMetricValue(metrics1.FID, 'FID'),
        value2: formatMetricValue(metrics2.FID, 'FID'),
        diff: metrics2.FID - metrics1.FID,
        unit: 'ms',
        higherIsBetter: false
      },
      {
        name: 'Cumulative Layout Shift',
        value1: formatMetricValue(metrics1.CLS, 'CLS'),
        value2: formatMetricValue(metrics2.CLS, 'CLS'),
        diff: metrics2.CLS - metrics1.CLS,
        unit: '',
        higherIsBetter: false
      },
      {
        name: 'First Contentful Paint',
        value1: formatMetricValue(metrics1.FCP, 'FCP'),
        value2: formatMetricValue(metrics2.FCP, 'FCP'),
        diff: metrics2.FCP - metrics1.FCP,
        unit: 'ms',
        higherIsBetter: false
      },
      {
        name: 'Time to Interactive',
        value1: formatMetricValue(metrics1.TTI, 'TTI'),
        value2: formatMetricValue(metrics2.TTI, 'TTI'),
        diff: metrics2.TTI - metrics1.TTI,
        unit: 'ms',
        higherIsBetter: false
      }
    ];
    
    const tableData = coreMetrics.map(metric => {
      // Calculate difference indicator
      let diffText = '';
      let diffColor = COLORS.gray;
      
      if (metric.name === 'Performance Score') {
        if (metric.diff > 5) {
          diffText = `+${metric.diff} (better)`;
          diffColor = COLORS.secondary;
        } else if (metric.diff < -5) {
          diffText = `${metric.diff} (worse)`;
          diffColor = COLORS.error;
        } else {
          diffText = `${metric.diff > 0 ? '+' : ''}${metric.diff} (similar)`;
          diffColor = COLORS.gray;
        }
      } else {
        const isPositive = (metric.higherIsBetter && metric.diff > 0) || 
                          (!metric.higherIsBetter && metric.diff < 0);
        
        if (Math.abs(metric.diff) < 50 && metric.name !== 'Cumulative Layout Shift') {
          diffText = 'Similar';
          diffColor = COLORS.gray;
        } else if (isPositive) {
          diffText = metric.higherIsBetter ? 'Better' : 'Better';
          diffColor = COLORS.secondary;
        } else {
          diffText = metric.higherIsBetter ? 'Worse' : 'Worse';
          diffColor = COLORS.error;
        }
        
        // Special case for CLS
        if (metric.name === 'Cumulative Layout Shift') {
          if (Math.abs(metric.diff) < 0.05) {
            diffText = 'Similar';
            diffColor = COLORS.gray;
          }
        }
      }
      
      return [
        { content: metric.name, styles: { fontStyle: 'bold' } },
        { content: metric.value1 },
        { content: metric.value2 },
        { content: diffText, styles: { fillColor: diffColor, textColor: diffColor === COLORS.gray ? COLORS.black : COLORS.white } }
      ];
    });
    
    pdf.autoTable({
      startY: currentY,
      head: [['Metric', 'URL 1', 'URL 2', 'Difference']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: COLORS.primary, textColor: COLORS.white },
      columnStyles: {
        0: { cellWidth: 65 },
        1: { cellWidth: 40 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 }
      }
    });
    
    currentY = pdf.lastAutoTable.finalY + 15;
    
    // Key insights
    pdf.setFontSize(12);
    pdf.setFont(FONTS.body, 'bold');
    pdf.setTextColor(COLORS.black);
    pdf.text('Key Insights:', 15, currentY);
    currentY += 10;
    
    pdf.setFontSize(10);
    pdf.setFont(FONTS.body, 'normal');
    
    // Generate insights based on metrics comparison
    const insights = [];
    
    if (Math.abs(scoreDiff) >= 10) {
      if (scoreDiff > 0) {
        insights.push(`URL 2 has a significantly better performance score (${score2} vs ${score1}).`);
      } else {
        insights.push(`URL 1 has a significantly better performance score (${score1} vs ${score2}).`);
      }
    }
    
    // LCP comparison
    const lcpDiff = metrics2.LCP - metrics1.LCP;
    if (Math.abs(lcpDiff) >= 500) {
      if (lcpDiff < 0) {
        insights.push(`URL 2 loads main content (LCP) ${formatMetricValue(Math.abs(lcpDiff), 'ms')} faster.`);
      } else {
        insights.push(`URL 1 loads main content (LCP) ${formatMetricValue(Math.abs(lcpDiff), 'ms')} faster.`);
      }
    }
    
    // TTI comparison
    const ttiDiff = metrics2.TTI - metrics1.TTI;
    if (Math.abs(ttiDiff) >= 1000) {
      if (ttiDiff < 0) {
        insights.push(`URL 2 becomes interactive ${formatMetricValue(Math.abs(ttiDiff), 'ms')} faster.`);
      } else {
        insights.push(`URL 1 becomes interactive ${formatMetricValue(Math.abs(ttiDiff), 'ms')} faster.`);
      }
    }
    
    // CLS comparison
    const clsDiff = metrics2.CLS - metrics1.CLS;
    if (Math.abs(clsDiff) >= 0.1) {
      if (clsDiff < 0) {
        insights.push(`URL 2 has better visual stability (${formatMetricValue(metrics2.CLS, 'CLS')} vs ${formatMetricValue(metrics1.CLS, 'CLS')}).`);
      } else {
        insights.push(`URL 1 has better visual stability (${formatMetricValue(metrics1.CLS, 'CLS')} vs ${formatMetricValue(metrics2.CLS, 'CLS')}).`);
      }
    }
    
    // Add general insight if nothing specific
    if (insights.length === 0) {
      insights.push('Both URLs show similar performance characteristics across most metrics.');
    }
    
    // List insights
    insights.forEach((insight, index) => {
      if (checkForPageBreak(10)) return;
      
      pdf.text(`${index + 1}. ${insight}`, 15, currentY, { maxWidth: 180 });
      currentY += 7;
    });
  };
  
  // Generate the report
  try {
    // Create each section of the report
    createTitlePage();
    createComparisonSummary();
    
    // Additional sections could be added here:
    // - Detailed metric comparisons
    // - Opportunity comparisons
    // - Resource usage comparisons
    // - Recommendations based on differences
    
    // Return the PDF as a blob
    return pdf.output('blob');
  } catch (err) {
    console.error('Error generating comparison report:', err);
    throw err;
  }
};

const PerformanceReportGenerator = {
  generatePerformanceReport,
  generateComparisonReport
};

export default PerformanceReportGenerator;