import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";
import { BASE64_LOGO } from "../assets/logo.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Service for generating PDF reports from SEO analysis results
 */
class PDFGeneratorService {
  /**
   * Generate a PDF report for a website analysis
   *
   * @param {Object} analysisData - The analysis data to include in the report
   * @param {Object} options - Options for PDF generation
   * @returns {Promise<Buffer>} - The PDF document as a buffer
   */
  async generateReport(analysisData, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        // Create a new PDF document
        const doc = new PDFDocument({
          size: "A4",
          margin: 50,
          info: {
            Title: `SEO Health Report - ${analysisData.url}`,
            Author: "SEO Health Checker",
            Subject: "Website SEO Analysis",
            Keywords: "seo, analysis, report, health check",
          },
        });

        // Collect the PDF data chunks
        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));

        // Resolve the promise with the PDF data when done
        doc.on("end", () => resolve(Buffer.concat(chunks)));

        // Handle any errors
        doc.on("error", (err) => reject(err));

        // Start creating the PDF
        this.buildReport(doc, analysisData);

        // Finalize the PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Build the PDF report with all sections
   *
   * @param {PDFKit.PDFDocument} doc - PDFKit document
   * @param {Object} data - Analysis data
   */
  buildReport(doc, data) {
    try {
      // Add logo and title
      this.addHeader(doc, data);
      console.log("✓ Header added");

      // Add summary section
      this.addSummary(doc, data);
      console.log("✓ Summary added");

      // Add scores section
      this.addScores(doc, data);
      console.log("✓ Scores added");

      // Add recommendations
      this.addRecommendations(doc, data);
      console.log("✓ Recommendations added");

      // Add metadata section
      this.addMetadata(doc, data);
      console.log("✓ Metadata added");

      // Add security section if available
      if (data.security) {
        this.addSecuritySection(doc, data);
        console.log("✓ Security section added");
      }

      // Add footer
      this.addFooter(doc, data);
      console.log("✓ Footer added");
    } catch (error) {
      console.error("Error in buildReport:", error.message);
      console.error("Stack:", error.stack);
      throw error;
    }
  }

  /**
   * Add the report header with logo and title
   *
   * @param {PDFKit.PDFDocument} doc
   * @param {Object} data
   */
  addHeader(doc, data) {
    // Add title (removed logo due to corruption issues)
    doc
      .fontSize(24)
      .fillColor("#333333")
      .text("SEO Health Report", 50, 50)
      .fontSize(16)
      .text(data.url || "N/A", 50, 85)
      .fontSize(12)
      .text(
        `Generated on: ${new Date(
          data.analyzedAt || new Date()
        ).toLocaleDateString()} ${new Date(
          data.analyzedAt || new Date()
        ).toLocaleTimeString()}`,
        50,
        110
      );

    doc.moveTo(50, 135).lineTo(550, 135).stroke("#dddddd");

    doc.moveDown(2);
  }

  /**
   * Add the summary section
   *
   * @param {PDFKit.PDFDocument} doc
   * @param {Object} data
   */
  addSummary(doc, data) {
    doc.fontSize(16).fillColor("#333333").text("Summary", 50, 160);

    doc
      .fontSize(12)
      .fillColor("#666666")
      .text(
        "This report provides an analysis of your website's SEO health, including performance metrics, content analysis, security checks, and actionable recommendations.",
        50,
        190,
        { width: 500 }
      );

    doc.moveDown(2);
  }

  /**
   * Add the scores section
   *
   * @param {PDFKit.PDFDocument} doc
   * @param {Object} data
   */
  addScores(doc, data) {
    doc.fontSize(16).fillColor("#333333").text("Performance Scores", 50, 250);

    const scores = [];

    // Add lighthouse scores if available
    if (data.lighthouse && data.lighthouse.scores) {
      scores.push(
        { name: "Performance", score: data.lighthouse.scores.performance || 0 },
        { name: "SEO", score: data.lighthouse.scores.seo || 0 },
        {
          name: "Accessibility",
          score: data.lighthouse.scores.accessibility || 0,
        },
        {
          name: "Best Practices",
          score: data.lighthouse.scores.bestPractices || 0,
        }
      );
    }

    // Add security score if available
    if (data.security && data.security.score !== undefined) {
      scores.push({ name: "Security", score: data.security.score });
    }

    // Draw score bars
    doc.fontSize(12);
    let y = 280;
    scores.forEach((item) => {
      const scoreValue = typeof item.score === "number" ? item.score : 0;
      const barWidth = Math.max(5, Math.min(400, 4 * scoreValue));
      const color = this.getScoreColor(scoreValue);

      // Draw label
      doc.fillColor("#333333").text(item.name, 50, y, { width: 100 });

      // Draw score value
      doc.fillColor("#333333").text(`${scoreValue}/100`, 150, y, { width: 50 });

      // Draw background bar
      doc.rect(220, y, 400, 15).fillColor("#eeeeee").fill();

      // Draw score bar
      doc.rect(220, y, barWidth, 15).fillColor(color).fill();

      y += 25;
    });

    doc.moveDown(4);
    doc.addPage();
  }

  /**
   * Add the recommendations section
   *
   * @param {PDFKit.PDFDocument} doc
   * @param {Object} data
   */
  addRecommendations(doc, data) {
    doc.fontSize(16).fillColor("#333333").text("Key Recommendations", 50, 50);

    if (!data.recommendations || data.recommendations.length === 0) {
      doc
        .fontSize(12)
        .fillColor("#666666")
        .text("No recommendations available.", 50, 80);
      return;
    }

    let y = 80;
    // Filter for critical and warning recommendations
    const keyRecs = data.recommendations
      .filter((rec) => rec.type === "critical" || rec.type === "warning")
      .slice(0, 10); // Limit to top 10

    keyRecs.forEach((rec, i) => {
      const icon = rec.type === "critical" ? "⚠️" : "📝";
      const color = rec.type === "critical" ? "#ff4444" : "#ff8800";

      doc
        .fontSize(14)
        .fillColor(color)
        .text(`${i + 1}. ${rec.issue}`, 50, y);

      y += 25;

      doc
        .fontSize(12)
        .fillColor("#666666")
        .text(rec.recommendation, 70, y, { width: 480 });

      y += 45;

      // Add page break if running out of space
      if (y > 700 && i < keyRecs.length - 1) {
        doc.addPage();
        y = 50;
      }
    });

    doc.moveDown(2);

    if (y > 600) {
      doc.addPage();
      y = 50;
    } else {
      y += 50;
    }
  }

  /**
   * Add the metadata section
   *
   * @param {PDFKit.PDFDocument} doc
   * @param {Object} data
   */
  addMetadata(doc, data) {
    if (!data.metadata) return;

    doc.fontSize(16).fillColor("#333333").text("Metadata Analysis", 50, 50);

    let y = 80;

    // Title information
    if (data.metadata.title) {
      doc.fontSize(14).fillColor("#333333").text("Title", 50, y);

      doc
        .fontSize(12)
        .fillColor("#666666")
        .text(data.metadata.title.content || "Not found", 50, y + 25, {
          width: 500,
        });

      const titleLength = data.metadata.title.content
        ? data.metadata.title.content.length
        : 0;
      const titleStatus =
        titleLength < 30
          ? "Too short"
          : titleLength > 60
          ? "Too long"
          : "Good length";
      const titleColor =
        titleLength < 30 || titleLength > 60 ? "#ff8800" : "#44aa44";

      doc
        .fontSize(12)
        .fillColor(titleColor)
        .text(`Length: ${titleLength} characters (${titleStatus})`, 50, y + 45);

      y += 70;
    }

    // Meta description
    if (data.metadata.description) {
      doc.fontSize(14).fillColor("#333333").text("Meta Description", 50, y);

      doc
        .fontSize(12)
        .fillColor("#666666")
        .text(data.metadata.description.content || "Not found", 50, y + 25, {
          width: 500,
        });

      const descLength = data.metadata.description.content
        ? data.metadata.description.content.length
        : 0;
      const descStatus =
        descLength < 120
          ? "Too short"
          : descLength > 155
          ? "Too long"
          : "Good length";
      const descColor =
        descLength < 120 || descLength > 155 ? "#ff8800" : "#44aa44";

      doc
        .fontSize(12)
        .fillColor(descColor)
        .text(`Length: ${descLength} characters (${descStatus})`, 50, y + 65);

      y += 90;
    }

    // Add page break if needed
    if (y > 650) {
      doc.addPage();
    }
  }

  /**
   * Add the security section
   *
   * @param {PDFKit.PDFDocument} doc
   * @param {Object} data
   */
  addSecuritySection(doc, data) {
    doc.fontSize(16).fillColor("#333333").text("Security Analysis", 50, 50);

    let y = 80;

    // SSL/HTTPS status
    const sslStatus =
      data.security.ssl && data.security.ssl.enabled ? "Enabled" : "Disabled";
    const sslColor =
      data.security.ssl && data.security.ssl.enabled ? "#44aa44" : "#ff4444";

    doc.fontSize(14).fillColor("#333333").text("HTTPS Status", 50, y);

    doc.fontSize(12).fillColor(sslColor).text(sslStatus, 200, y);

    y += 30;

    // Security headers
    if (data.security.headers) {
      doc.fontSize(14).fillColor("#333333").text("Security Headers", 50, y);

      y += 25;

      // Get critical headers
      const criticalHeaders = [
        "Content-Security-Policy",
        "X-Frame-Options",
        "X-Content-Type-Options",
        "Strict-Transport-Security",
      ];

      criticalHeaders.forEach((header) => {
        const headerData =
          data.security.headers.analyzed &&
          data.security.headers.analyzed[header];

        if (headerData) {
          const status =
            headerData.present && headerData.valid ? "Present" : "Missing";
          const color =
            headerData.present && headerData.valid ? "#44aa44" : "#ff4444";

          doc
            .fontSize(12)
            .fillColor("#333333")
            .text(header, 70, y, { width: 200 });

          doc.fontSize(12).fillColor(color).text(status, 350, y);

          y += 20;
        }
      });
    }
  }

  /**
   * Add the footer to the report
   *
   * @param {PDFKit.PDFDocument} doc
   * @param {Object} data
   */
  addFooter(doc, data) {
    // Add footer to every page
    const range = doc.bufferedPageRange();
    const totalPages = range.count;

    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(range.start + i);

      const now = new Date().toLocaleDateString();

      doc
        .fontSize(10)
        .fillColor("#999999")
        .text(
          `SEO Health Report - Generated on ${now} | Page ${
            i + 1
          } of ${totalPages}`,
          50,
          doc.page.height - 50,
          { width: 500, align: "center" }
        );
    }
  }

  /**
   * Get color based on score value
   *
   * @param {number} score
   * @returns {string} color hex code
   */
  getScoreColor(score) {
    if (score >= 90) return "#44bb44"; // Green
    if (score >= 70) return "#88bb44"; // Yellow-green
    if (score >= 50) return "#ffaa00"; // Orange
    if (score >= 30) return "#ff8800"; // Dark orange
    return "#ff4444"; // Red
  }

  /**
   * Generate a trend report PDF for historical data
   *
   * @param {Object} trendData - The trend data to include in the report
   * @returns {Promise<Buffer>} - The PDF document as a buffer
   */
  async generateTrendReport(trendData) {
    return new Promise((resolve, reject) => {
      try {
        // Create a new PDF document
        const doc = new PDFDocument({
          size: "A4",
          margin: 50,
          info: {
            Title: `SEO Trends Report - ${trendData.url}`,
            Author: "SEO Health Checker",
            Subject: "Website SEO Trends Analysis",
            Keywords: "seo, trends, analysis, report, history",
          },
        });

        // Collect the PDF data chunks
        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));

        // Resolve the promise with the PDF data when done
        doc.on("end", () => resolve(Buffer.concat(chunks)));

        // Handle any errors
        doc.on("error", (err) => reject(err));

        // Start creating the PDF
        this.buildTrendReport(doc, trendData);

        // Finalize the PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Build the trend report PDF with all sections
   *
   * @param {PDFKit.PDFDocument} doc - PDFKit document
   * @param {Object} data - Trend data
   */
  buildTrendReport(doc, data) {
    // Add title (removed logo due to corruption issues)
    doc
      .fontSize(24)
      .fillColor("#333333")
      .text("SEO Score Trends Report", 50, 50);

    doc.moveDown();
    doc.fontSize(16).text(`Website: ${data.url}`, 50, 120);

    doc.fontSize(14).text(`Data points: ${data.dataPoints}`, 50, 150);

    doc.text(`Report generated: ${new Date().toLocaleDateString()}`, 50, 170);

    doc.moveDown(2);

    // Add trend data
    this.addTrendSummary(doc, data);

    // Add score changes
    this.addScoreChanges(doc, data);

    // Add trend data table
    this.addTrendTable(doc, data);

    // Add footer
    doc
      .fontSize(10)
      .text("Generated by SEO Health Checker API", 50, doc.page.height - 50, {
        align: "center",
      });
  }

  /**
   * Add trend summary section
   *
   * @param {PDFKit.PDFDocument} doc
   * @param {Object} data
   */
  addTrendSummary(doc, data) {
    doc.fontSize(16).fillColor("#333333").text("Performance Summary", 50, 220);

    doc.moveDown();

    // Draw a line
    doc
      .strokeColor("#cccccc")
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke();

    doc.moveDown();

    // Create a simple text summary
    doc
      .fontSize(12)
      .fillColor("#333333")
      .text(
        `This report shows the SEO score trends for ${data.url} over ${data.dataPoints} scans. ` +
          `The earliest scan was on ${data.dates[0]} and the latest was on ${
            data.dates[data.dates.length - 1]
          }.`,
        50,
        doc.y,
        { width: doc.page.width - 100 }
      );

    doc.moveDown(2);
  }

  /**
   * Add score changes section
   *
   * @param {PDFKit.PDFDocument} doc
   * @param {Object} data
   */
  addScoreChanges(doc, data) {
    doc
      .fontSize(14)
      .fillColor("#333333")
      .text("Score Changes Over Time", 50, doc.y);

    doc.moveDown();

    const tableTop = doc.y;
    const columnWidth = 120;

    // Draw header
    doc
      .fontSize(12)
      .fillColor("#ffffff")
      .rect(50, tableTop, columnWidth, 25)
      .fill("#333333");

    doc.fillColor("#ffffff").text("Metric", 60, tableTop + 7);

    doc.rect(50 + columnWidth, tableTop, columnWidth, 25).fill("#333333");

    doc.text("Change", 60 + columnWidth, tableTop + 7);

    doc.rect(50 + columnWidth * 2, tableTop, columnWidth, 25).fill("#333333");

    doc.text("Status", 60 + columnWidth * 2, tableTop + 7);

    // Draw rows
    let rowY = tableTop + 25;

    const metrics = [
      { name: "Performance", change: data.changes.performance },
      { name: "SEO", change: data.changes.seo },
      { name: "Accessibility", change: data.changes.accessibility },
      { name: "Best Practices", change: data.changes.bestPractices },
    ];

    metrics.forEach((metric, i) => {
      const isEven = i % 2 === 0;
      const bgColor = isEven ? "#f5f5f5" : "#ffffff";
      const changeColor =
        metric.change > 0
          ? "#44bb44"
          : metric.change < 0
          ? "#ff4444"
          : "#888888";
      const changeSymbol =
        metric.change > 0 ? "▲" : metric.change < 0 ? "▼" : "─";
      const status =
        metric.change > 0
          ? "Improved"
          : metric.change < 0
          ? "Declined"
          : "No change";

      // Background
      doc.rect(50, rowY, columnWidth * 3, 25).fill(bgColor);

      // Text
      doc.fillColor("#333333").text(metric.name, 60, rowY + 7);

      doc
        .fillColor(changeColor)
        .text(
          `${changeSymbol} ${Math.abs(metric.change).toFixed(1)}`,
          60 + columnWidth,
          rowY + 7
        );

      doc.fillColor("#333333").text(status, 60 + columnWidth * 2, rowY + 7);

      rowY += 25;
    });

    doc.moveDown(4);
  }

  /**
   * Add trend data table
   *
   * @param {PDFKit.PDFDocument} doc
   * @param {Object} data
   */
  addTrendTable(doc, data) {
    // Check if we need a new page
    if (doc.y > doc.page.height - 200) {
      doc.addPage();
    }

    doc
      .fontSize(14)
      .fillColor("#333333")
      .text("Historical Data Table", 50, doc.y);

    doc.moveDown();

    const tableTop = doc.y;
    const dateWidth = 130;
    const scoreWidth = 100;

    // Draw header
    doc
      .fontSize(10)
      .fillColor("#ffffff")
      .rect(50, tableTop, dateWidth, 25)
      .fill("#333333");

    doc.fillColor("#ffffff").text("Date", 60, tableTop + 7);

    const metrics = ["Performance", "SEO", "Accessibility", "Best Practices"];

    metrics.forEach((metric, i) => {
      doc
        .rect(50 + dateWidth + scoreWidth * i, tableTop, scoreWidth, 25)
        .fill("#333333");

      doc.text(metric, 60 + dateWidth + scoreWidth * i, tableTop + 7, {
        width: scoreWidth - 20,
      });
    });

    // Limit to the last 10 data points to fit on the page
    const maxRows = 10;
    const startIndex = Math.max(0, data.dates.length - maxRows);

    // Draw rows
    let rowY = tableTop + 25;

    for (let i = startIndex; i < data.dates.length; i++) {
      const isEven = (i - startIndex) % 2 === 0;
      const bgColor = isEven ? "#f5f5f5" : "#ffffff";

      // Background
      doc.rect(50, rowY, dateWidth + scoreWidth * 4, 25).fill(bgColor);

      // Date
      const date = new Date(data.dates[i]).toLocaleDateString();
      doc
        .fillColor("#333333")
        .text(date, 60, rowY + 7, { width: dateWidth - 20 });

      // Scores
      doc.text(data.scores.performance[i].toFixed(1), 60 + dateWidth, rowY + 7);
      doc.text(
        data.scores.seo[i].toFixed(1),
        60 + dateWidth + scoreWidth,
        rowY + 7
      );
      doc.text(
        data.scores.accessibility[i].toFixed(1),
        60 + dateWidth + scoreWidth * 2,
        rowY + 7
      );
      doc.text(
        data.scores.bestPractices[i].toFixed(1),
        60 + dateWidth + scoreWidth * 3,
        rowY + 7
      );

      rowY += 25;
    }

    doc.moveDown(2);
  }
}

export default new PDFGeneratorService();
