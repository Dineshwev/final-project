/**
 * Citation Tracker Controller
 * Handles HTTP requests for citation tracking operations
 */

import * as citationService from "../services/citationTrackerService.js";

/**
 * Search for business citations across multiple directories
 * POST /api/citations/search
 */
export async function searchCitations(req, res) {
  try {
    const { businessName, phone, city } = req.body;

    // Validate input
    if (!businessName || !phone || !city) {
      return res.status(400).json({
        success: false,
        error: "businessName, phone, and city are required",
      });
    }

    // Perform search
    const result = await citationService.searchCitations(
      businessName,
      phone,
      city
    );

    if (result.success) {
      return res.status(200).json(result);
    }

    return res.status(500).json(result);
  } catch (error) {
    console.error("Search Citations Controller Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Scrape citation data from a specific URL
 * POST /api/citations/scrape
 */
export async function scrapeCitation(req, res) {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "url is required",
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        success: false,
        error: "Invalid URL format",
      });
    }

    const result = await citationService.scrapeCitationData(url);

    if (result.success) {
      return res.status(200).json(result);
    }

    return res.status(500).json(result);
  } catch (error) {
    console.error("Scrape Citation Controller Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Compare citations with source data
 * POST /api/citations/compare
 */
export async function compareCitations(req, res) {
  try {
    const { citations, sourceData } = req.body;

    if (!citations || !Array.isArray(citations)) {
      return res.status(400).json({
        success: false,
        error: "citations array is required",
      });
    }

    if (!sourceData || !sourceData.name || !sourceData.phone) {
      return res.status(400).json({
        success: false,
        error: "sourceData with name and phone is required",
      });
    }

    const result = citationService.compareCitations(citations, sourceData);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Compare Citations Controller Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Search and compare citations (combined operation)
 * POST /api/citations/search-and-compare
 */
export async function searchAndCompare(req, res) {
  try {
    const { businessName, phone, city, address } = req.body;

    if (!businessName || !phone || !city) {
      return res.status(400).json({
        success: false,
        error: "businessName, phone, and city are required",
      });
    }

    // Search for citations
    const searchResult = await citationService.searchCitations(
      businessName,
      phone,
      city
    );

    if (!searchResult.success) {
      return res.status(500).json(searchResult);
    }

    // Compare with source data
    const sourceData = {
      name: businessName,
      phone: phone,
      address: address || "",
    };

    const comparisonResult = citationService.compareCitations(
      searchResult.citations,
      sourceData
    );

    // Combine results
    const combinedResult = {
      success: true,
      businessName,
      phone,
      city,
      address,
      searchResults: {
        totalCitations: searchResult.totalCitations,
        searchDate: searchResult.searchDate,
      },
      comparison: {
        summary: comparisonResult.summary,
        citations: comparisonResult.citations,
      },
      timestamp: new Date().toISOString(),
    };

    return res.status(200).json(combinedResult);
  } catch (error) {
    console.error("Search and Compare Controller Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Export citation data
 * POST /api/citations/export
 */
export async function exportCitations(req, res) {
  try {
    const { data, format, filename } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: "data is required",
      });
    }

    if (!format || !["json", "csv"].includes(format.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'format must be either "json" or "csv"',
      });
    }

    const exportFilename = filename || `citations_${Date.now()}`;

    let result;
    if (format.toLowerCase() === "json") {
      result = await citationService.exportToJSON(data, exportFilename);
    } else {
      // For CSV, extract citations array if present
      const citations = data.citations || data;
      result = await citationService.exportToCSV(citations, exportFilename);
    }

    if (result.success) {
      return res.status(200).json(result);
    }

    return res.status(500).json(result);
  } catch (error) {
    console.error("Export Citations Controller Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Check NAP (Name, Address, Phone) consistency across citations
 * POST /api/citations/nap-check
 */
export async function checkNAPConsistency(req, res) {
  try {
    const { citations, masterData } = req.body;

    // Validate input
    if (!citations || !Array.isArray(citations) || citations.length === 0) {
      return res.status(400).json({
        success: false,
        error: "citations array is required and must not be empty",
      });
    }

    if (
      !masterData ||
      !masterData.name ||
      !masterData.address ||
      !masterData.phone
    ) {
      return res.status(400).json({
        success: false,
        error: "masterData is required with name, address, and phone fields",
      });
    }

    // Import the NAP consistency checker
    const napChecker = await import("../services/napConsistencyChecker.js");

    // Generate consistency report
    const report = napChecker.generateConsistencyReport(citations, masterData);

    if (report.error) {
      return res.status(400).json({
        success: false,
        error: report.error,
        report,
      });
    }

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("NAP Consistency Check Controller Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export default {
  searchCitations,
  scrapeCitation,
  compareCitations,
  searchAndCompare,
  exportCitations,
  checkNAPConsistency,
};
