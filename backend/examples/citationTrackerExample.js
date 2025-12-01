/**
 * Citation Tracker - Usage Examples
 *
 * Prerequisites:
 * - Puppeteer and puppeteer-extra already installed
 * - puppeteer-extra-plugin-stealth already installed
 *
 * Run examples: node backend/examples/citationTrackerExample.js
 */

import * as citationService from "../services/citationTrackerService.js";

/**
 * Example 1: Search for citations across all directories
 */
async function exampleSearchCitations() {
  console.log("\n" + "=".repeat(70));
  console.log("EXAMPLE 1: Search Citations");
  console.log("=".repeat(70));

  const businessName = "Pizza Hut";
  const phone = "+1-234-567-8900";
  const city = "New York";

  try {
    const result = await citationService.searchCitations(
      businessName,
      phone,
      city
    );

    if (result.success) {
      console.log("\n✅ Search completed successfully!");
      console.log(`\nTotal Citations Found: ${result.totalCitations}`);
      console.log(`\nCitations by Source:`);

      const grouped = {};
      result.citations.forEach((citation) => {
        if (!grouped[citation.source]) {
          grouped[citation.source] = [];
        }
        grouped[citation.source].push(citation);
      });

      Object.keys(grouped).forEach((source) => {
        const validCitations = grouped[source].filter((c) => !c.error);
        console.log(`  ${source}: ${validCitations.length} citation(s)`);
      });

      // Show first 3 citations
      console.log("\nSample Citations:");
      result.citations
        .filter((c) => !c.error)
        .slice(0, 3)
        .forEach((citation, index) => {
          console.log(`\n  ${index + 1}. ${citation.source}`);
          console.log(`     Name: ${citation.name}`);
          console.log(`     Phone: ${citation.phone}`);
          console.log(`     Address: ${citation.address}`);
          console.log(`     URL: ${citation.url}`);
        });
    } else {
      console.error("\n❌ Search failed:", result.error);
    }

    return result;
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    throw error;
  }
}

/**
 * Example 2: Scrape specific citation URL
 */
async function exampleScrapeCitation() {
  console.log("\n" + "=".repeat(70));
  console.log("EXAMPLE 2: Scrape Citation Data");
  console.log("=".repeat(70));

  // Replace with actual URL
  const url = "https://www.yelp.com/biz/pizza-hut-new-york";

  try {
    const result = await citationService.scrapeCitationData(url);

    if (result.success) {
      console.log("\n✅ Scraping completed successfully!");
      console.log("\nExtracted Data:");
      console.log(`  Name: ${result.data.name}`);
      console.log(`  Address: ${result.data.address}`);
      console.log(`  Phone: ${result.data.phone}`);
      console.log(`  Website: ${result.data.website}`);
      console.log(`  Rating: ${result.data.rating}`);
      console.log(`  Reviews: ${result.data.reviews}`);
    } else {
      console.error("\n❌ Scraping failed:", result.error);
    }

    return result;
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    throw error;
  }
}

/**
 * Example 3: Compare citations with source data
 */
async function exampleCompareCitations() {
  console.log("\n" + "=".repeat(70));
  console.log("EXAMPLE 3: Compare Citations");
  console.log("=".repeat(70));

  // Sample citations (usually from search results)
  const citations = [
    {
      source: "Yelp",
      name: "Pizza Hut",
      address: "123 Main St, New York, NY 10001",
      phone: "(234) 567-8900",
      url: "https://www.yelp.com/biz/pizza-hut",
      foundDate: new Date().toISOString(),
    },
    {
      source: "Yellow Pages",
      name: "Pizza Hut Restaurant",
      address: "123 Main Street, New York, NY",
      phone: "234-567-8900",
      url: "https://www.yellowpages.com/...",
      foundDate: new Date().toISOString(),
    },
    {
      source: "Justdial",
      name: "Pizza Hut",
      address: "456 Different St, New York",
      phone: "234-567-8900",
      url: "https://www.justdial.com/...",
      foundDate: new Date().toISOString(),
    },
  ];

  const sourceData = {
    name: "Pizza Hut",
    address: "123 Main St, New York, NY 10001",
    phone: "+1-234-567-8900",
  };

  try {
    const result = citationService.compareCitations(citations, sourceData);

    console.log("\n✅ Comparison completed!");
    console.log("\n📊 Summary:");
    console.log(`  Perfect Matches: ${result.summary.perfectMatches}`);
    console.log(`  Good Matches: ${result.summary.goodMatches}`);
    console.log(`  Partial Matches: ${result.summary.partialMatches}`);
    console.log(`  Poor Matches: ${result.summary.poorMatches}`);
    console.log(`  Average Accuracy: ${result.summary.averageAccuracy}%`);

    console.log("\n📋 Detailed Results:");
    result.citations.forEach((citation, index) => {
      console.log(`\n  ${index + 1}. ${citation.source} - ${citation.status}`);
      console.log(`     Accuracy: ${citation.accuracy}%`);
      console.log(`     Name Match: ${citation.matches.name ? "✓" : "✗"}`);
      console.log(
        `     Address Match: ${citation.matches.address ? "✓" : "✗"}`
      );
      console.log(`     Phone Match: ${citation.matches.phone ? "✓" : "✗"}`);
      console.log(`     Issues: ${citation.issues.join(", ")}`);
    });

    return result;
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    throw error;
  }
}

/**
 * Example 4: Export citations to JSON
 */
async function exampleExportJSON() {
  console.log("\n" + "=".repeat(70));
  console.log("EXAMPLE 4: Export to JSON");
  console.log("=".repeat(70));

  const sampleData = {
    businessName: "Pizza Hut",
    phone: "+1-234-567-8900",
    city: "New York",
    citations: [
      {
        source: "Yelp",
        name: "Pizza Hut",
        address: "123 Main St",
        phone: "234-567-8900",
        url: "https://yelp.com/...",
        foundDate: new Date().toISOString(),
      },
    ],
  };

  try {
    const result = await citationService.exportToJSON(
      sampleData,
      "pizza_hut_citations"
    );

    if (result.success) {
      console.log("\n✅ Export successful!");
      console.log(`  Format: ${result.format}`);
      console.log(`  File: ${result.filepath}`);
    } else {
      console.error("\n❌ Export failed:", result.error);
    }

    return result;
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    throw error;
  }
}

/**
 * Example 5: Export citations to CSV
 */
async function exampleExportCSV() {
  console.log("\n" + "=".repeat(70));
  console.log("EXAMPLE 5: Export to CSV");
  console.log("=".repeat(70));

  const citations = [
    {
      source: "Yelp",
      name: "Pizza Hut",
      address: "123 Main St, New York, NY",
      phone: "234-567-8900",
      url: "https://yelp.com/...",
      foundDate: new Date().toISOString(),
      accuracy: 100,
      status: "Perfect Match",
      issues: ["No issues found"],
    },
    {
      source: "Yellow Pages",
      name: "Pizza Hut",
      address: "123 Main Street",
      phone: "234-567-8900",
      url: "https://yellowpages.com/...",
      foundDate: new Date().toISOString(),
      accuracy: 66,
      status: "Good Match",
      issues: ["Address mismatch"],
    },
  ];

  try {
    const result = await citationService.exportToCSV(
      citations,
      "pizza_hut_citations"
    );

    if (result.success) {
      console.log("\n✅ Export successful!");
      console.log(`  Format: ${result.format}`);
      console.log(`  File: ${result.filepath}`);
    } else {
      console.error("\n❌ Export failed:", result.error);
    }

    return result;
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    throw error;
  }
}

/**
 * Example 6: Complete Workflow
 */
async function exampleCompleteWorkflow() {
  console.log("\n" + "=".repeat(70));
  console.log("EXAMPLE 6: Complete Citation Tracking Workflow");
  console.log("=".repeat(70));

  const businessName = "Dominos Pizza";
  const phone = "+91-9876543210";
  const city = "Mumbai";
  const address = "456 Market Street, Mumbai, Maharashtra";

  try {
    // Step 1: Search for citations
    console.log("\n📍 Step 1: Searching for citations...");
    const searchResult = await citationService.searchCitations(
      businessName,
      phone,
      city
    );

    if (!searchResult.success) {
      throw new Error("Search failed");
    }

    console.log(`✓ Found ${searchResult.totalCitations} citations`);

    // Step 2: Compare with source data
    console.log("\n🔎 Step 2: Comparing citations...");
    const sourceData = { name: businessName, phone, address };
    const comparisonResult = citationService.compareCitations(
      searchResult.citations,
      sourceData
    );

    console.log(
      `✓ Average accuracy: ${comparisonResult.summary.averageAccuracy}%`
    );

    // Step 3: Export results
    console.log("\n💾 Step 3: Exporting results...");

    const exportData = {
      businessName,
      phone,
      city,
      address,
      searchDate: searchResult.searchDate,
      summary: comparisonResult.summary,
      citations: comparisonResult.citations,
    };

    await citationService.exportToJSON(
      exportData,
      `${businessName.replace(/\s+/g, "_")}_citations`
    );
    await citationService.exportToCSV(
      comparisonResult.citations,
      `${businessName.replace(/\s+/g, "_")}_citations`
    );

    console.log("\n✅ Workflow completed successfully!");
    console.log("\n📊 Final Summary:");
    console.log(`  Total Citations: ${searchResult.totalCitations}`);
    console.log(
      `  Perfect Matches: ${comparisonResult.summary.perfectMatches}`
    );
    console.log(`  Good Matches: ${comparisonResult.summary.goodMatches}`);
    console.log(
      `  Average Accuracy: ${comparisonResult.summary.averageAccuracy}%`
    );

    return {
      search: searchResult,
      comparison: comparisonResult,
    };
  } catch (error) {
    console.error("\n❌ Workflow failed:", error.message);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("CITATION TRACKER - USAGE EXAMPLES");
  console.log("=".repeat(70));

  try {
    // Uncomment the example you want to run:

    // await exampleSearchCitations();
    // await exampleScrapeCitation();
    // await exampleCompareCitations();
    // await exampleExportJSON();
    // await exampleExportCSV();
    // await exampleCompleteWorkflow();

    console.log("\n" + "=".repeat(70));
    console.log("To run examples, uncomment them in the main() function");
    console.log("=".repeat(70) + "\n");
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run examples if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  exampleSearchCitations,
  exampleScrapeCitation,
  exampleCompareCitations,
  exampleExportJSON,
  exampleExportCSV,
  exampleCompleteWorkflow,
};
