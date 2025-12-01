/**
 * @file exportController.js
 * @description Controller for exporting scan reports in various formats
 */

import db from "../db/init.js";
import { promisify } from "util";
import pdfGeneratorService from "../services/pdfGeneratorService.js";
import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Convert callback-based DB methods to Promise-based
const dbGet = promisify(db.get).bind(db);
const dbAll = promisify(db.all).bind(db);

// Get the directory name (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ExportController {
  /**
   * Export the latest scan report as PDF
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async exportPDF(req, res) {
    try {
      const { url } = req.params;
      const decodedUrl = decodeURIComponent(url);

      // Get the latest scan for the URL
      const scan = await dbGet(
        `
        SELECT 
          s.id AS scan_id,
          s.url,
          s.status,
          s.created_at,
          s.completed_at
        FROM scans s
        WHERE s.url = ? AND s.status = 'completed'
        ORDER BY s.completed_at DESC
        LIMIT 1
      `,
        [decodedUrl]
      );

      if (!scan) {
        return res.status(404).json({
          status: "error",
          message: "No completed scan found for this URL",
        });
      }

      // Get the scan results
      const results = await dbGet(
        `
        SELECT 
          performance_score,
          seo_score,
          accessibility_score,
          best_practices_score,
          meta_data,
          issues
        FROM scan_results
        WHERE scan_id = ?
      `,
        [scan.scan_id]
      );

      if (!results) {
        return res.status(404).json({
          status: "error",
          message: "No results found for this scan",
        });
      }

      // Prepare the analysis data for the PDF
      const analysisData = {
        url: decodedUrl,
        analyzedAt: scan.completed_at,
        metadata: results.meta_data ? JSON.parse(results.meta_data) : null,
        lighthouse: {
          scores: {
            performance: results.performance_score,
            seo: results.seo_score,
            accessibility: results.accessibility_score,
            bestPractices: results.best_practices_score,
          },
        },
        recommendations: results.issues ? JSON.parse(results.issues) : [],
      };

      // Get security data if available
      try {
        const securityData = await dbGet(
          `
          SELECT headers, ssl
          FROM security_checks
          WHERE scan_id = ?
        `,
          [scan.scan_id]
        );

        // Add security data if available
        if (securityData) {
          analysisData.security = {
            headers: JSON.parse(securityData.headers),
            ssl: JSON.parse(securityData.ssl),
          };
        }
      } catch (error) {
        console.warn("Security data not available:", error.message);
      }

      // Generate the PDF
      const pdfBuffer = await pdfGeneratorService.generateReport(analysisData);

      // Send the PDF to the client
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="seo-report-${encodeURIComponent(
          decodedUrl
        )}.pdf"`,
        "Content-Length": pdfBuffer.length,
      });

      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error in exportPDF:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to export PDF",
        details: error.message,
      });
    }
  }

  /**
   * Export a scan report as PDF by scan ID
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async exportPdf(req, res) {
    try {
      const { scanId } = req.params;

      // Get the scan
      const scan = await dbGet(
        `
        SELECT 
          s.id AS scan_id,
          s.url,
          s.status,
          s.created_at,
          s.completed_at
        FROM scans s
        WHERE s.id = ? AND s.status = 'completed'
      `,
        [scanId]
      );

      if (!scan) {
        return res.status(404).json({
          status: "error",
          message: "No completed scan found with this ID",
        });
      }

      // Get the scan results
      const results = await dbGet(
        `
        SELECT 
          performance_score,
          seo_score,
          accessibility_score,
          best_practices_score,
          meta_data,
          issues
        FROM scan_results
        WHERE scan_id = ?
      `,
        [scanId]
      );

      if (!results) {
        return res.status(404).json({
          status: "error",
          message: "No results found for this scan",
        });
      }

      // Prepare the analysis data for the PDF with safe parsing
      let metadata = null;
      let recommendations = [];

      try {
        metadata = results.meta_data ? JSON.parse(results.meta_data) : null;
      } catch (e) {
        console.warn("Failed to parse meta_data:", e.message);
      }

      try {
        recommendations = results.issues ? JSON.parse(results.issues) : [];
      } catch (e) {
        console.warn("Failed to parse issues:", e.message);
      }

      const analysisData = {
        url: scan.url || "Unknown",
        analyzedAt: scan.completed_at || new Date().toISOString(),
        metadata: metadata,
        lighthouse: {
          scores: {
            performance: results.performance_score || 0,
            seo: results.seo_score || 0,
            accessibility: results.accessibility_score || 0,
            bestPractices: results.best_practices_score || 0,
          },
        },
        recommendations: recommendations,
      };

      // Get security data if available
      try {
        const securityData = await dbGet(
          `
          SELECT headers, ssl
          FROM security_checks
          WHERE scan_id = ?
        `,
          [scanId]
        );

        if (securityData) {
          analysisData.security = {
            headers: JSON.parse(securityData.headers),
            ssl: JSON.parse(securityData.ssl),
          };
        }
      } catch (error) {
        console.warn("Security data not available:", error.message);
      }

      // Generate the PDF
      console.log("Generating PDF for scan:", scanId);
      console.log("Analysis data keys:", Object.keys(analysisData));

      const pdfBuffer = await pdfGeneratorService.generateReport(analysisData);

      // Send the PDF to the client
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="seo-report-${scanId}.pdf"`,
        "Content-Length": pdfBuffer.length,
      });

      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error in exportPdf:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({
        status: "error",
        message: "Failed to export PDF",
        details: error.message,
      });
    }
  }

  /**
   * Export scan report as CSV
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async exportCsv(req, res) {
    try {
      const { scanId } = req.params;

      // Get the scan
      const scan = await dbGet(
        `
        SELECT 
          s.id AS scan_id,
          s.url,
          s.status,
          s.created_at,
          s.completed_at
        FROM scans s
        WHERE s.id = ? AND s.status = 'completed'
      `,
        [scanId]
      );

      if (!scan) {
        return res.status(404).json({
          status: "error",
          message: "No completed scan found with this ID",
        });
      }

      // Get the scan results
      const results = await dbGet(
        `
        SELECT 
          performance_score,
          seo_score,
          accessibility_score,
          best_practices_score,
          meta_data,
          issues
        FROM scan_results
        WHERE scan_id = ?
      `,
        [scanId]
      );

      if (!results) {
        return res.status(404).json({
          status: "error",
          message: "No results found for this scan",
        });
      }

      // Parse JSON fields
      const metadata = results.meta_data ? JSON.parse(results.meta_data) : {};
      const issues = results.issues ? JSON.parse(results.issues) : [];

      // Create records for CSV
      const records = [];

      // Add basic info
      records.push({
        category: "Basic Info",
        item: "URL",
        value: scan.url,
        details: "",
      });

      records.push({
        category: "Basic Info",
        item: "Scan Date",
        value: scan.completed_at,
        details: "",
      });

      // Add scores
      records.push({
        category: "Scores",
        item: "Performance",
        value: results.performance_score,
        details: "Out of 100",
      });

      records.push({
        category: "Scores",
        item: "SEO",
        value: results.seo_score,
        details: "Out of 100",
      });

      records.push({
        category: "Scores",
        item: "Accessibility",
        value: results.accessibility_score,
        details: "Out of 100",
      });

      records.push({
        category: "Scores",
        item: "Best Practices",
        value: results.best_practices_score,
        details: "Out of 100",
      });

      // Add metadata
      if (metadata.title) {
        records.push({
          category: "Metadata",
          item: "Title",
          value: metadata.title,
          details: "",
        });
      }

      if (metadata.description) {
        records.push({
          category: "Metadata",
          item: "Description",
          value: metadata.description,
          details: "",
        });
      }

      // Add issues/recommendations
      issues.forEach((issue) => {
        records.push({
          category: "Issues",
          item: issue.category || "General",
          value: issue.issue || issue,
          details: issue.priority || "medium",
        });
      });

      // Create a temporary file
      const tempFilePath = path.join(
        __dirname,
        "..",
        "temp",
        `seo-report-${scanId}.csv`
      );
      const dirPath = path.dirname(tempFilePath);

      // Ensure the temp directory exists
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // Create CSV writer
      const csvWriter = createObjectCsvWriter({
        path: tempFilePath,
        header: [
          { id: "category", title: "Category" },
          { id: "item", title: "Item" },
          { id: "value", title: "Value" },
          { id: "details", title: "Details" },
        ],
      });

      // Write records to CSV
      await csvWriter.writeRecords(records);

      // Send the CSV file
      res.download(tempFilePath, `seo-report-${scanId}.csv`, (err) => {
        // Delete the temporary file after sending
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }

        if (err) {
          console.error("Error sending CSV file:", err);
        }
      });
    } catch (error) {
      console.error("Error in exportCsv:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to export CSV",
        details: error.message,
      });
    }
  }

  /**
   * Export scan report as JSON
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async exportJson(req, res) {
    try {
      const { scanId } = req.params;

      // Get the scan
      const scan = await dbGet(
        `
        SELECT 
          s.id AS scan_id,
          s.url,
          s.status,
          s.created_at,
          s.completed_at
        FROM scans s
        WHERE s.id = ? AND s.status = 'completed'
      `,
        [scanId]
      );

      if (!scan) {
        return res.status(404).json({
          status: "error",
          message: "No completed scan found with this ID",
        });
      }

      // Get the scan results
      const results = await dbGet(
        `
        SELECT 
          performance_score,
          seo_score,
          accessibility_score,
          best_practices_score,
          meta_data,
          issues
        FROM scan_results
        WHERE scan_id = ?
      `,
        [scanId]
      );

      if (!results) {
        return res.status(404).json({
          status: "error",
          message: "No results found for this scan",
        });
      }

      // Get security data if available
      let securityData = null;
      try {
        securityData = await dbGet(
          `
          SELECT headers, ssl
          FROM security_checks
          WHERE scan_id = ?
        `,
          [scanId]
        );
      } catch (error) {
        console.warn("Security data not available:", error.message);
      }

      // Create the report object
      const report = {
        scanId: scan.scan_id,
        url: scan.url,
        analyzedAt: scan.completed_at,
        scores: {
          performance: results.performance_score,
          seo: results.seo_score,
          accessibility: results.accessibility_score,
          bestPractices: results.best_practices_score,
        },
        metadata: results.meta_data ? JSON.parse(results.meta_data) : null,
        issues: results.issues ? JSON.parse(results.issues) : [],
        security: securityData
          ? {
              headers: securityData.headers
                ? JSON.parse(securityData.headers)
                : null,
              ssl: securityData.ssl ? JSON.parse(securityData.ssl) : null,
            }
          : null,
      };

      // Set headers for file download
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="seo-report-${scanId}.json"`
      );
      res.setHeader("Content-Type", "application/json");

      // Send the JSON data
      res.json(report);
    } catch (error) {
      console.error("Error in exportJson:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to export JSON",
        details: error.message,
      });
    }
  }

  /**
   * Export historical trends for a URL
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async exportTrends(req, res) {
    try {
      const { url } = req.params;
      const format = req.query.format || "json";
      const decodedUrl = decodeURIComponent(url);

      // Get the historical scores for trend analysis
      const rows = await dbAll(
        `
        SELECT 
          s.id AS scan_id,
          s.completed_at,
          r.performance_score,
          r.seo_score,
          r.accessibility_score,
          r.best_practices_score
        FROM scans s
        JOIN scan_results r ON s.id = r.scan_id
        WHERE s.url = ? AND s.status = 'completed'
        ORDER BY s.completed_at ASC
      `,
        [decodedUrl]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "No historical data found for this URL",
        });
      }

      // Format data for trend analysis
      const trends = {
        url: decodedUrl,
        dataPoints: rows.length,
        dates: rows.map((row) => row.completed_at),
        scores: {
          performance: rows.map((row) => row.performance_score),
          seo: rows.map((row) => row.seo_score),
          accessibility: rows.map((row) => row.accessibility_score),
          bestPractices: rows.map((row) => row.best_practices_score),
        },
        changes: {
          performance:
            rows[rows.length - 1].performance_score - rows[0].performance_score,
          seo: rows[rows.length - 1].seo_score - rows[0].seo_score,
          accessibility:
            rows[rows.length - 1].accessibility_score -
            rows[0].accessibility_score,
          bestPractices:
            rows[rows.length - 1].best_practices_score -
            rows[0].best_practices_score,
        },
      };

      // Export based on format
      switch (format) {
        case "csv":
          // Create records for CSV
          const records = [];

          // Add header row
          rows.forEach((row, index) => {
            records.push({
              date: row.completed_at,
              performance: row.performance_score,
              seo: row.seo_score,
              accessibility: row.accessibility_score,
              bestPractices: row.best_practices_score,
            });
          });

          // Create a temporary file
          const tempFilePath = path.join(
            __dirname,
            "..",
            "temp",
            `trends-${encodeURIComponent(decodedUrl)}.csv`
          );
          const dirPath = path.dirname(tempFilePath);

          // Ensure the temp directory exists
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
          }

          // Create CSV writer
          const csvWriter = createObjectCsvWriter({
            path: tempFilePath,
            header: [
              { id: "date", title: "Date" },
              { id: "performance", title: "Performance" },
              { id: "seo", title: "SEO" },
              { id: "accessibility", title: "Accessibility" },
              { id: "bestPractices", title: "Best Practices" },
            ],
          });

          // Write records to CSV
          await csvWriter.writeRecords(records);

          // Send the CSV file
          res.download(
            tempFilePath,
            `trends-${encodeURIComponent(decodedUrl)}.csv`,
            (err) => {
              // Delete the temporary file after sending
              if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
              }

              if (err) {
                console.error("Error sending CSV file:", err);
              }
            }
          );
          break;

        case "pdf":
          // Generate a PDF with trend data
          const pdfBuffer = await pdfGeneratorService.generateTrendReport(
            trends
          );

          // Send the PDF to the client
          res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="trends-${encodeURIComponent(
              decodedUrl
            )}.pdf"`,
            "Content-Length": pdfBuffer.length,
          });

          res.send(pdfBuffer);
          break;

        case "json":
        default:
          // Set headers for file download
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="trends-${encodeURIComponent(
              decodedUrl
            )}.json"`
          );
          res.setHeader("Content-Type", "application/json");

          // Send the JSON data
          res.json(trends);
          break;
      }
    } catch (error) {
      console.error("Error in exportTrends:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to export trends",
        details: error.message,
      });
    }
  }
}

export default new ExportController();
