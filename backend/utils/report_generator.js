const PDFDocument = require('pdfkit');
const { format } = require('date-fns');

class ReportGenerator {
  constructor() {
    this.doc = new PDFDocument();
  }

  /**
   * Generate a complete SEO report
   */
  generateReport(data) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      
      this.doc.on('data', chunk => chunks.push(chunk));
      this.doc.on('end', () => resolve(Buffer.concat(chunks)));
      this.doc.on('error', reject);

      // Header
      this._addHeader(data.domain);
      
      // Summary
      this._addSummary(data);
      
      // SEO Analysis
      this._addSEOAnalysis(data.seo);
      
      // Performance Metrics
      this._addPerformanceMetrics(data.performance);
      
      // Security Analysis
      this._addSecurityAnalysis(data.security);
      
      // Recommendations
      this._addRecommendations(data.recommendations);
      
      this.doc.end();
    });
  }

  /**
   * Add report header
   */
  _addHeader(domain) {
    this.doc
      .fontSize(24)
      .text('SEO Analysis Report', { align: 'center' })
      .fontSize(16)
      .text(`Domain: ${domain}`, { align: 'center' })
      .text(`Generated: ${format(new Date(), 'PPpp')}`, { align: 'center' })
      .moveDown(2);
  }

  /**
   * Add executive summary
   */
  _addSummary(data) {
    this.doc
      .fontSize(18)
      .text('Executive Summary')
      .moveDown(0.5);

    // Create score table
    const scores = {
      'Overall Score': data.overallScore,
      'SEO Score': data.seo.score,
      'Performance Score': data.performance.score,
      'Security Score': data.security.score
    };

    Object.entries(scores).forEach(([label, score]) => {
      this.doc
        .fontSize(12)
        .text(label, { continued: true })
        .text(`: ${score}/100`, { align: 'right' });
    });

    this.doc.moveDown(2);
  }

  /**
   * Add SEO analysis section
   */
  _addSEOAnalysis(seoData) {
    this.doc
      .fontSize(18)
      .text('SEO Analysis')
      .moveDown(0.5);

    // Meta Information
    this.doc
      .fontSize(14)
      .text('Meta Information')
      .fontSize(12);

    const metaInfo = {
      'Title': seoData.meta.title,
      'Description': seoData.meta.description,
      'Keywords': seoData.meta.keywords.join(', ')
    };

    Object.entries(metaInfo).forEach(([label, value]) => {
      this.doc.text(`${label}: ${value}`);
    });

    this.doc.moveDown(2);
  }

  /**
   * Add performance metrics section
   */
  _addPerformanceMetrics(performanceData) {
    this.doc
      .fontSize(18)
      .text('Performance Metrics')
      .moveDown(0.5);

    const metrics = {
      'First Contentful Paint': `${performanceData.fcp}ms`,
      'Largest Contentful Paint': `${performanceData.lcp}ms`,
      'First Input Delay': `${performanceData.fid}ms`,
      'Cumulative Layout Shift': performanceData.cls
    };

    Object.entries(metrics).forEach(([label, value]) => {
      this.doc
        .fontSize(12)
        .text(label, { continued: true })
        .text(`: ${value}`, { align: 'right' });
    });

    this.doc.moveDown(2);
  }

  /**
   * Add security analysis section
   */
  _addSecurityAnalysis(securityData) {
    this.doc
      .fontSize(18)
      .text('Security Analysis')
      .moveDown(0.5);

    // SSL Information
    if (securityData.ssl) {
      this.doc
        .fontSize(14)
        .text('SSL Certificate')
        .fontSize(12)
        .text(`Status: ${securityData.ssl.valid ? 'Valid' : 'Invalid'}`)
        .text(`Issuer: ${securityData.ssl.issuer}`)
        .text(`Expires: ${format(new Date(securityData.ssl.expiryDate), 'PP')}`);
    }

    this.doc.moveDown(2);
  }

  /**
   * Add recommendations section
   */
  _addRecommendations(recommendations) {
    this.doc
      .fontSize(18)
      .text('Recommendations')
      .moveDown(0.5);

    recommendations.forEach((rec, index) => {
      this.doc
        .fontSize(14)
        .text(`${index + 1}. ${rec.title}`)
        .fontSize(12)
        .text(rec.description)
        .moveDown(0.5);
    });
  }

  /**
   * Generate CSV report
   */
  generateCSV(data) {
    const rows = [
      ['Domain', 'Category', 'Metric', 'Value', 'Score'],
      // SEO Metrics
      ...Object.entries(data.seo.metrics).map(([metric, value]) => [
        data.domain,
        'SEO',
        metric,
        value,
        data.seo.scores[metric]
      ]),
      // Performance Metrics
      ...Object.entries(data.performance.metrics).map(([metric, value]) => [
        data.domain,
        'Performance',
        metric,
        value,
        data.performance.scores[metric]
      ]),
      // Security Metrics
      ...Object.entries(data.security.metrics).map(([metric, value]) => [
        data.domain,
        'Security',
        metric,
        value,
        data.security.scores[metric]
      ])
    ];

    return rows.map(row => row.join(',')).join('\n');
  }

  /**
   * Generate JSON report
   */
  generateJSON(data) {
    return JSON.stringify(data, null, 2);
  }
}

module.exports = ReportGenerator;