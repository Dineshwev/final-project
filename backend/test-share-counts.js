import { getShareCountReport } from "./services/shareCountService.js";

// Test URLs
const testUrls = [
  "https://github.com",
  "https://www.wikipedia.org",
  "https://www.reddit.com",
];

async function testShareCountService() {
  console.log("📊 Social Share Count Tracker Test Suite\n");
  console.log("=".repeat(80));
  console.log("\n");

  for (const url of testUrls) {
    console.log(`\n📝 Testing: ${url}`);
    console.log("-".repeat(80));

    try {
      const report = await getShareCountReport(url);

      console.log(`✅ Analysis Complete\n`);
      console.log(`URL: ${report.url}`);
      console.log(`Cached: ${report.cached ? "Yes" : "No"}`);
      console.log(
        `Last Updated: ${new Date(report.lastUpdated).toLocaleString()}`
      );

      console.log(`\n📊 Share Counts:`);
      console.log(
        `  Facebook: ${
          report.displayValues.facebook
        } (${report.counts.facebook.toLocaleString()})`
      );
      console.log(
        `  Pinterest: ${
          report.displayValues.pinterest
        } (${report.counts.pinterest.toLocaleString()})`
      );
      console.log(
        `  LinkedIn: ${
          report.displayValues.linkedin
        } (${report.counts.linkedin.toLocaleString()})`
      );
      console.log(
        `  Total: ${
          report.displayValues.totalShares
        } (${report.counts.totalShares.toLocaleString()})`
      );

      console.log(`\n📈 Trends:`);
      console.log(
        `  Facebook: ${report.trends.facebook.direction} ${
          report.trends.facebook.change > 0 ? "+" : ""
        }${report.trends.facebook.change} (${
          report.trends.facebook.percentage
        }%)`
      );
      console.log(
        `  Pinterest: ${report.trends.pinterest.direction} ${
          report.trends.pinterest.change > 0 ? "+" : ""
        }${report.trends.pinterest.change} (${
          report.trends.pinterest.percentage
        }%)`
      );
      console.log(
        `  LinkedIn: ${report.trends.linkedin.direction} ${
          report.trends.linkedin.change > 0 ? "+" : ""
        }${report.trends.linkedin.change} (${
          report.trends.linkedin.percentage
        }%)`
      );
      console.log(
        `  Total: ${report.trends.totalShares.direction} ${
          report.trends.totalShares.change > 0 ? "+" : ""
        }${report.trends.totalShares.change} (${
          report.trends.totalShares.percentage
        }%)`
      );
    } catch (error) {
      console.error(`\n❌ Analysis failed: ${error.message}`);
    }

    console.log("\n" + "=".repeat(80));

    // Add delay between requests to avoid rate limiting
    if (testUrls.indexOf(url) < testUrls.length - 1) {
      console.log("\n⏳ Waiting 2 seconds before next request...\n");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log("\n✅ Test suite completed!\n");
}

// Run the tests
testShareCountService().catch((error) => {
  console.error("Test suite error:", error);
  process.exit(1);
});
