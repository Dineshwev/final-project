/**
 * SSLReportGenerator.js
 * Utility to generate PDF reports for SSL check results
 * Dependencies: jsPDF, Chart.js
 */

import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // For creating tables in PDF
// Chart.js is used via canvas element

// CUSTOMIZE: Brand configuration
const BRAND_CONFIG = {
  name: 'SSL Security Checker',
  // CUSTOMIZE: Replace with your actual logo path
  logo: '/assets/images/logo.png',
  // CUSTOMIZE: Branding colors
  colors: {
    primary: '#4a6fa5',
    secondary: '#166088',
    accent: '#03a9f4',
    success: '#4caf50',
    warning: '#ff9800',
    danger: '#f44336',
    light: '#f5f5f5',
    dark: '#333333'
  },
  // CUSTOMIZE: Contact information for footer
  contact: 'support@sslsecuritychecker.com',
  website: 'https://sslsecuritychecker.com'
};

/**
 * Generate a PDF report for SSL check results
 * @param {Object} results - SSL check results data
 * @param {String} domain - Domain that was checked
 * @returns {Promise<Blob>} - PDF file as blob
 */
async function generateSSLReport(results, domain) {
  try {
    if (!results || !domain) {
      throw new Error('Results and domain are required');
    }
    
    // Create new PDF document (A4 format)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Set up document properties
    doc.setProperties({
      title: `SSL Certificate Report - ${domain}`,
      subject: 'SSL Security Analysis',
      author: BRAND_CONFIG.name,
      keywords: 'SSL, security, certificate, report',
      creator: BRAND_CONFIG.name
    });
    
    // Start building the PDF
    await addReportHeader(doc, domain, results);
    addOverallScore(doc, results);
    addCertificateDetails(doc, results);
    await addCertificateChain(doc, results);
    addSecurityHeaders(doc, results);
    addRecommendations(doc, results);
    addReportFooter(doc);
    
    // Return the PDF as a blob
    return doc.output('blob');
  } catch (error) {
    console.error('Error generating SSL report:', error);
    throw error;
  }
}

/**
 * Download the generated report
 * @param {Blob} blob - PDF blob to download
 * @param {String} filename - Name for the downloaded file
 */
function downloadReport(blob, filename) {
  try {
    // Create download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename || 'ssl-report.pdf';
    
    // Append to body, click and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the object URL
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
  } catch (error) {
    console.error('Error downloading report:', error);
    throw error;
  }
}

/**
 * Add header to the report
 * @param {jsPDF} doc - PDF document
 * @param {String} domain - Domain being analyzed
 * @param {Object} results - SSL check results
 * @private
 */
async function addReportHeader(doc, domain, results) {
  // CUSTOMIZE: You can modify header design and logo placement
  try {
    const timestamp = new Date().toLocaleString();
    
    // Add logo if available
    try {
      // CUSTOMIZE: Add your logo here
      // This is an example of loading an image
      // Replace with actual logo loading method
      const img = new Image();
      img.src = BRAND_CONFIG.logo;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      doc.addImage(img, 'PNG', 10, 10, 30, 15);
    } catch (error) {
      console.warn('Could not load logo image:', error);
      // Continue without logo
    }
    
    // Add title and date
    doc.setFontSize(22);
    doc.setTextColor(BRAND_CONFIG.colors.primary);
    doc.text('SSL Security Report', 105, 15, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(BRAND_CONFIG.colors.dark);
    doc.text(domain, 105, 25, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(BRAND_CONFIG.colors.secondary);
    doc.text(`Generated on: ${timestamp}`, 105, 30, { align: 'center' });
    
    // Add divider
    doc.setDrawColor(BRAND_CONFIG.colors.primary);
    doc.setLineWidth(0.5);
    doc.line(10, 35, 200, 35);
    
    // Set cursor position for next section
    return 40;
  } catch (error) {
    console.error('Error adding report header:', error);
    // Continue with the report
    return 40;
  }
}

/**
 * Add overall SSL score to the report
 * @param {jsPDF} doc - PDF document
 * @param {Object} results - SSL check results
 * @private
 */
function addOverallScore(doc, results) {
  // CUSTOMIZE: You can modify the design and visualization of the score
  try {
    let yPosition = 45;
    
    doc.setFontSize(14);
    doc.setTextColor(BRAND_CONFIG.colors.dark);
    doc.text('Overall SSL Security Score', 105, yPosition, { align: 'center' });
    
    yPosition += 10;
    
    // Create colored badge based on grade
    const grade = results.grade || 'Unknown';
    const scoreColor = getColorForGrade(grade);
    
    // Draw badge
    doc.setFillColor(scoreColor);
    doc.roundedRect(90, yPosition, 30, 30, 3, 3, 'F');
    
    // Add grade text
    doc.setFontSize(22);
    doc.setTextColor('#ffffff');
    doc.text(grade, 105, yPosition + 18, { align: 'center' });
    
    yPosition += 35;
    
    // Add explanation
    doc.setFontSize(10);
    doc.setTextColor(BRAND_CONFIG.colors.dark);
    let explanation = 'This grade represents the overall security of your SSL configuration.';
    
    if (grade === 'A+' || grade === 'A') {
      explanation += ' Your SSL configuration is excellent.';
    } else if (grade === 'B+' || grade === 'B') {
      explanation += ' Your SSL configuration is good but has room for improvement.';
    } else if (grade === 'C+' || grade === 'C') {
      explanation += ' Your SSL configuration has significant weaknesses that should be addressed.';
    } else if (grade.startsWith('D') || grade.startsWith('E') || grade === 'F') {
      explanation += ' Your SSL configuration has severe vulnerabilities that require immediate attention.';
    }
    
    doc.text(explanation, 105, yPosition, { align: 'center', maxWidth: 180 });
    
    return yPosition + 15;
  } catch (error) {
    console.error('Error adding overall score:', error);
    // Continue with the report
    return 80;
  }
}

/**
 * Add certificate details to the report
 * @param {jsPDF} doc - PDF document
 * @param {Object} results - SSL check results
 * @private
 */
function addCertificateDetails(doc, results) {
  try {
    let yPosition = 95;
    
    // Section title
    doc.setFontSize(14);
    doc.setTextColor(BRAND_CONFIG.colors.primary);
    doc.text('Certificate Details', 10, yPosition);
    
    yPosition += 10;
    
    // Format dates
    const validFrom = results.validFrom ? new Date(results.validFrom).toLocaleString() : 'N/A';
    const expiration = results.expiration ? new Date(results.expiration).toLocaleString() : 'N/A';
    
    // Determine if certificate is expired or close to expiring
    let expiryStatus = 'Valid';
    let expiryColor = BRAND_CONFIG.colors.success;
    
    if (results.expiration) {
      const expiryDate = new Date(results.expiration);
      const now = new Date();
      const daysToExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
      
      if (expiryDate < now) {
        expiryStatus = 'EXPIRED';
        expiryColor = BRAND_CONFIG.colors.danger;
      } else if (daysToExpiry < 30) {
        expiryStatus = `Expires soon (${daysToExpiry} days)`;
        expiryColor = BRAND_CONFIG.colors.warning;
      }
    }
    
    // Create certificate details table
    const tableData = [
      ['Domain', results.domain || 'N/A'],
      ['Issuer', results.issuer || 'N/A'],
      ['Subject', results.subject || 'N/A'],
      ['Serial Number', results.serialNumber || 'N/A'],
      ['Valid From', validFrom],
      ['Expiration', expiration],
      ['Status', expiryStatus],
      ['Protocol', results.protocol || 'N/A'],
      ['Key Size', results.keySize || 'N/A'],
      ['Signature Algorithm', results.signatureAlgorithm || 'N/A']
    ];
    
    // CUSTOMIZE: You can modify the table design here
    doc.autoTable({
      startY: yPosition,
      head: [['Property', 'Value']],
      body: tableData,
      headStyles: {
        fillColor: BRAND_CONFIG.colors.secondary,
        textColor: '#ffffff',
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: BRAND_CONFIG.colors.light
      },
      styles: {
        fontSize: 10
      },
      // Add conditional formatting for expiry status
      didDrawCell: (data) => {
        if (data.row.index === 6 && data.column.index === 1) {
          doc.setTextColor(expiryColor);
        } else {
          doc.setTextColor(BRAND_CONFIG.colors.dark);
        }
      }
    });
    
    // Get the final y position after the table
    yPosition = doc.previousAutoTable.finalY + 10;
    return yPosition;
  } catch (error) {
    console.error('Error adding certificate details:', error);
    // Continue with the report
    return 150;
  }
}

/**
 * Add certificate chain visualization to the report
 * @param {jsPDF} doc - PDF document
 * @param {Object} results - SSL check results
 * @private
 */
async function addCertificateChain(doc, results) {
  try {
    let yPosition = doc.previousAutoTable ? doc.previousAutoTable.finalY + 15 : 160;
    
    // Section title
    doc.setFontSize(14);
    doc.setTextColor(BRAND_CONFIG.colors.primary);
    doc.text('Certificate Chain', 10, yPosition);
    
    yPosition += 10;
    
    // Check if chain exists and has items
    if (!results.chain || results.chain.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(BRAND_CONFIG.colors.dark);
      doc.text('No certificate chain information available', 10, yPosition);
      return yPosition + 10;
    }
    
    // Create chain visualization
    // CUSTOMIZE: You can modify the visualization style
    const chain = [...results.chain];
    if (!chain.find(cert => cert.subject.includes(results.domain))) {
      chain.unshift({
        subject: results.domain,
        label: 'End-entity certificate',
        notBefore: results.validFrom,
        notAfter: results.expiration
      });
    }
    
    // Draw the chain
    const boxWidth = 150;
    const boxHeight = 30;
    const startX = 30;
    let currentY = yPosition + 5;
    
    for (let i = 0; i < chain.length; i++) {
      const cert = chain[i];
      
      // Box color based on position in chain
      let boxColor;
      if (i === 0) {
        boxColor = BRAND_CONFIG.colors.primary; // End entity cert
      } else if (i === chain.length - 1) {
        boxColor = BRAND_CONFIG.colors.success; // Root cert
      } else {
        boxColor = BRAND_CONFIG.colors.accent; // Intermediate cert
      }
      
      // Draw box
      doc.setFillColor(boxColor);
      doc.setDrawColor(boxColor);
      doc.roundedRect(startX, currentY, boxWidth, boxHeight, 2, 2, 'FD');
      
      // Draw text
      doc.setFontSize(10);
      doc.setTextColor('#ffffff');
      
      // Certificate subject (possibly truncated if too long)
      const subjectText = cert.subject || 'Unknown';
      const truncatedSubject = subjectText.length > 50 ? subjectText.substring(0, 47) + '...' : subjectText;
      doc.text(truncatedSubject, startX + 5, currentY + 10);
      
      // Certificate type
      let certType = i === 0 ? 'End-entity' : i === chain.length - 1 ? 'Root CA' : 'Intermediate CA';
      doc.text(`Type: ${certType}`, startX + 5, currentY + 20);
      
      // If not the last certificate, draw an arrow
      if (i < chain.length - 1) {
        doc.setDrawColor(BRAND_CONFIG.colors.dark);
        doc.setLineWidth(0.5);
        
        // Draw arrow line
        const arrowStartY = currentY + boxHeight;
        const arrowEndY = arrowStartY + 10;
        
        doc.line(startX + boxWidth / 2, arrowStartY, startX + boxWidth / 2, arrowEndY);
        
        // Draw arrow head
        doc.line(startX + boxWidth / 2 - 3, arrowEndY - 3, startX + boxWidth / 2, arrowEndY);
        doc.line(startX + boxWidth / 2 + 3, arrowEndY - 3, startX + boxWidth / 2, arrowEndY);
      }
      
      currentY += boxHeight + (i < chain.length - 1 ? 15 : 0);
    }
    
    return currentY + 10;
  } catch (error) {
    console.error('Error adding certificate chain:', error);
    // Continue with the report
    return 200;
  }
}

/**
 * Add security headers section to the report
 * @param {jsPDF} doc - PDF document
 * @param {Object} results - SSL check results
 * @private
 */
function addSecurityHeaders(doc, results) {
  try {
    // Start after the previous section
    let yPosition = doc.previousAutoTable ? doc.previousAutoTable.finalY + 15 : 200;
    
    // Add new page if not enough space
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Section title
    doc.setFontSize(14);
    doc.setTextColor(BRAND_CONFIG.colors.primary);
    doc.text('Security Headers', 10, yPosition);
    
    yPosition += 10;
    
    // List of important security headers to check
    const securityHeadersList = {
      'Strict-Transport-Security': 'HSTS enforces secure connections to the server',
      'Content-Security-Policy': 'Controls resources the browser is allowed to load',
      'X-Content-Type-Options': 'Prevents MIME type sniffing',
      'X-Frame-Options': 'Protects against clickjacking',
      'X-XSS-Protection': 'Enables cross-site scripting filter in browser',
      'Referrer-Policy': 'Controls how much referrer information is included',
      'Permissions-Policy': 'Controls browser features and APIs',
      'Access-Control-Allow-Origin': 'Defines which origins can access the resource'
    };
    
    // Prepare table data
    const tableData = [];
    const securityHeaders = results.securityHeaders || {};
    
    Object.keys(securityHeadersList).forEach(header => {
      const headerValue = securityHeaders[header] || 'Not Present';
      const status = headerValue !== 'Not Present' ? '✓' : '✗';
      const statusColor = headerValue !== 'Not Present' ? BRAND_CONFIG.colors.success : BRAND_CONFIG.colors.danger;
      
      tableData.push([
        header,
        headerValue,
        { content: status, styles: { textColor: statusColor } },
        securityHeadersList[header]
      ]);
    });
    
    // CUSTOMIZE: You can modify the table design here
    doc.autoTable({
      startY: yPosition,
      head: [['Header', 'Value', 'Status', 'Description']],
      body: tableData,
      headStyles: {
        fillColor: BRAND_CONFIG.colors.secondary,
        textColor: '#ffffff',
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 60 },
        2: { cellWidth: 15 },
        3: { cellWidth: 65 }
      },
      alternateRowStyles: {
        fillColor: BRAND_CONFIG.colors.light
      },
      styles: {
        fontSize: 8,
        cellPadding: 3
      }
    });
    
    // Get final position
    return doc.previousAutoTable.finalY + 10;
  } catch (error) {
    console.error('Error adding security headers section:', error);
    // Continue with the report
    return 240;
  }
}

/**
 * Add recommendations section to the report
 * @param {jsPDF} doc - PDF document
 * @param {Object} results - SSL check results
 * @private
 */
function addRecommendations(doc, results) {
  try {
    // Start after previous section
    let yPosition = doc.previousAutoTable ? doc.previousAutoTable.finalY + 15 : 240;
    
    // Add new page if not enough space
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Section title
    doc.setFontSize(14);
    doc.setTextColor(BRAND_CONFIG.colors.primary);
    doc.text('Recommendations', 10, yPosition);
    
    yPosition += 10;
    
    // Generate recommendations based on results
    const recommendations = generateRecommendations(results);
    
    // CUSTOMIZE: You can modify the recommendations and their display
    doc.setFontSize(10);
    doc.setTextColor(BRAND_CONFIG.colors.dark);
    
    // Draw recommendations
    recommendations.forEach((recommendation, index) => {
      // Check if we need a new page
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Draw priority indicator
      const priorityColor = recommendation.priority === 'High' ? 
        BRAND_CONFIG.colors.danger : 
        recommendation.priority === 'Medium' ? 
          BRAND_CONFIG.colors.warning : 
          BRAND_CONFIG.colors.success;
          
      doc.setFillColor(priorityColor);
      doc.circle(15, yPosition, 2, 'F');
      
      // Draw recommendation title
      doc.setFontSize(11);
      doc.setTextColor(BRAND_CONFIG.colors.dark);
      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}. ${recommendation.title}`, 20, yPosition);
      
      yPosition += 5;
      
      // Draw recommendation description
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      
      // Handle text wrapping for descriptions
      const splitDescription = doc.splitTextToSize(recommendation.description, 180);
      doc.text(splitDescription, 20, yPosition);
      
      yPosition += splitDescription.length * 5 + 5;
    });
    
    return yPosition;
  } catch (error) {
    console.error('Error adding recommendations section:', error);
    // Continue with the report
    return 260;
  }
}

/**
 * Generate recommendations based on SSL results
 * @param {Object} results - SSL check results
 * @returns {Array} List of recommendations
 * @private
 */
function generateRecommendations(results) {
  // CUSTOMIZE: Add or modify recommendations based on your business needs
  const recommendations = [];
  
  // Certificate expiration check
  if (results.expiration) {
    const expiryDate = new Date(results.expiration);
    const now = new Date();
    const daysToExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
    
    if (expiryDate < now) {
      recommendations.push({
        title: 'SSL Certificate is expired',
        description: 'Your SSL certificate has expired. This causes browser warnings and is a serious security risk. Renew your SSL certificate immediately.',
        priority: 'High'
      });
    } else if (daysToExpiry < 30) {
      recommendations.push({
        title: 'SSL Certificate expiring soon',
        description: `Your SSL certificate will expire in ${daysToExpiry} days. Plan to renew it soon to avoid disruption.`,
        priority: 'Medium'
      });
    }
  }
  
  // Grade-based recommendations
  const grade = results.grade || '';
  if (['C', 'D', 'E', 'F'].some(g => grade.startsWith(g))) {
    recommendations.push({
      title: 'Improve SSL configuration',
      description: 'Your SSL configuration received a low grade. Consider updating your cipher suites, protocols, and key exchange methods.',
      priority: 'High'
    });
  }
  
  // Key size recommendations
  if (results.keySize && parseInt(results.keySize) < 2048) {
    recommendations.push({
      title: 'Increase key size',
      description: 'Your SSL certificate key size is less than 2048 bits. This is considered weak by modern standards. Use at least 2048-bit RSA keys or switch to ECC.',
      priority: 'High'
    });
  }
  
  // Security headers recommendations
  const securityHeaders = results.securityHeaders || {};
  if (!securityHeaders['Strict-Transport-Security']) {
    recommendations.push({
      title: 'Implement HTTP Strict Transport Security (HSTS)',
      description: 'HSTS ensures that browsers always connect to your site over HTTPS, preventing downgrade attacks. Add the Strict-Transport-Security header to your responses.',
      priority: 'Medium'
    });
  }
  
  if (!securityHeaders['Content-Security-Policy']) {
    recommendations.push({
      title: 'Add Content Security Policy',
      description: 'A Content Security Policy helps prevent XSS attacks by controlling which resources can be loaded by the browser. Implement a CSP header tailored to your site\'s needs.',
      priority: 'Medium'
    });
  }
  
  // Protocol recommendations
  if (results.protocol && (results.protocol.includes('TLS 1.0') || results.protocol.includes('TLS 1.1'))) {
    recommendations.push({
      title: 'Disable older TLS versions',
      description: 'Your server supports older TLS protocols (1.0/1.1) which have known vulnerabilities. Configure your server to use TLS 1.2 or higher only.',
      priority: 'High'
    });
  }
  
  // Vulnerability recommendations
  if (results.vulnerabilities && results.vulnerabilities.length > 0) {
    recommendations.push({
      title: 'Address SSL/TLS vulnerabilities',
      description: `Your server is vulnerable to ${results.vulnerabilities.map(v => v.name).join(', ')}. Update your SSL/TLS configuration to fix these security issues.`,
      priority: 'High'
    });
  }
  
  // If no issues found, add a positive note
  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Maintain current security posture',
      description: 'Your SSL configuration looks good! Continue to monitor for new vulnerabilities and best practices.',
      priority: 'Low'
    });
  }
  
  return recommendations;
}

/**
 * Add footer to the report
 * @param {jsPDF} doc - PDF document
 * @private
 */
function addReportFooter(doc) {
  try {
    // CUSTOMIZE: Modify footer design and content
    const pageCount = doc.internal.getNumberOfPages();
    
    // Add footer to each page
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Add divider line
      doc.setDrawColor(BRAND_CONFIG.colors.primary);
      doc.setLineWidth(0.5);
      doc.line(10, pageHeight - 20, pageWidth - 10, pageHeight - 20);
      
      // Add branding
      doc.setFontSize(8);
      doc.setTextColor(BRAND_CONFIG.colors.secondary);
      doc.text(
        `Report generated by ${BRAND_CONFIG.name} | ${BRAND_CONFIG.website}`,
        pageWidth / 2,
        pageHeight - 15,
        { align: 'center' }
      );
      
      // Add page numbers
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - 20,
        pageHeight - 10
      );
      
      // Add timestamp
      const timestamp = new Date().toLocaleString();
      doc.text(
        `Generated: ${timestamp}`,
        20,
        pageHeight - 10
      );
    }
  } catch (error) {
    console.error('Error adding report footer:', error);
    // Continue without footer
  }
}

/**
 * Get color for SSL grade
 * @param {String} grade - SSL grade
 * @returns {String} Hex color code
 * @private
 */
function getColorForGrade(grade) {
  // CUSTOMIZE: You can modify the colors for different grades
  switch (grade) {
    case 'A+':
      return '#4caf50'; // Bright green
    case 'A':
      return '#7cb342'; // Green
    case 'A-':
      return '#9ccc65'; // Light green
    case 'B+':
      return '#cddc39'; // Lime
    case 'B':
      return '#ffeb3b'; // Yellow
    case 'B-':
      return '#ffc107'; // Amber
    case 'C+':
      return '#ff9800'; // Orange
    case 'C':
      return '#ff5722'; // Deep orange
    case 'C-':
      return '#f44336'; // Red
    case 'D+':
    case 'D':
    case 'D-':
    case 'E+':
    case 'E':
    case 'E-':
    case 'F':
      return '#d32f2f'; // Dark red
    default:
      return '#9e9e9e'; // Grey for unknown grades
  }
}

export {
  generateSSLReport,
  downloadReport
};