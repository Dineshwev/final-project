/**
 * Citation Tracker - Working Test
 * Tests multiple approaches to handle CAPTCHA issues
 */

import * as citationService from "./services/citationTrackerService.js";
import * as altService from "./services/citationTrackerAlternative.js";

console.log("🔍 Citation Tracker - Comprehensive Test\n");
console.log("=".repeat(70));

async function testApproach1() {
  console.log("\n\n📊 APPROACH 1: Direct Scraping (Original Method)");
  console.log("=".repeat(70));
  console.log("⚠️  Warning: This may encounter CAPTCHAs");

  try {
    const result = await citationService.searchCitations(
      "Pizza Hut",
      "+1-234-567-8900",
      "Chicago"
    );

    console.log("\n📈 Results Summary:");
    console.log(`  Total Citations: ${result.totalCitations}`);
    console.log(`  Total Attempts: ${result.citations.length}`);

    const errors = result.citations.filter((c) => c.error);
    const successful = result.citations.filter((c) => !c.error);

    console.log(`  ✅ Successful: ${successful.length}`);
    console.log(`  ❌ Errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log("\n⚠️  Errors encountered:");
      errors.forEach((err) => {
        console.log(`    - ${err.source}: ${err.error}`);
      });
    }

    if (successful.length > 0) {
      console.log("\n✅ Successful citations:");
      successful.forEach((cit) => {
        console.log(`\n    ${cit.source}:`);
        console.log(`      Name: ${cit.name || "N/A"}`);
        console.log(`      Phone: ${cit.phone || "N/A"}`);
        console.log(`      URL: ${cit.url || "N/A"}`);
      });
    }
  } catch (error) {
    console.error("\n❌ Approach 1 failed:", error.message);
  }
}

async function testApproach2() {
  console.log("\n\n📊 APPROACH 2: Google Search Method");
  console.log("=".repeat(70));
  console.log("✨ This approach is more CAPTCHA-resistant");

  try {
    const result = await altService.searchCitationsViaGoogle(
      "Starbucks",
      "+1-206-555-1234",
      "Seattle"
    );

    console.log("\n📈 Results Summary:");
    console.log(`  Method: ${result.method}`);
    console.log(`  Total Citations Found: ${result.totalCitations}`);

    const successful = result.citations.filter((c) => !c.error);
    const errors = result.citations.filter((c) => c.error);

    console.log(`  ✅ Successful: ${successful.length}`);
    console.log(`  ❌ Errors: ${errors.length}`);

    if (successful.length > 0) {
      console.log("\n✅ Found citations:");
      successful.forEach((cit) => {
        console.log(`\n    ${cit.source}:`);
        console.log(`      Title: ${cit.title}`);
        console.log(`      URL: ${cit.url}`);
        if (cit.snippet) {
          console.log(`      Snippet: ${cit.snippet.substring(0, 100)}...`);
        }
      });
    }

    console.log(`\n💡 Note: ${result.note}`);
  } catch (error) {
    console.error("\n❌ Approach 2 failed:", error.message);
  }
}

async function testApproach3() {
  console.log("\n\n📊 APPROACH 3: Manual Check URLs");
  console.log("=".repeat(70));
  console.log("🔗 Provides URLs for manual verification");

  try {
    const result = altService.getManualCheckURLs("McDonald's", "New York");

    // URLs are already printed by the function
    console.log(
      "\n💡 Use these URLs to manually verify your business listings"
    );
    console.log(
      "   This is the most reliable method when automation is blocked"
    );
  } catch (error) {
    console.error("\n❌ Approach 3 failed:", error.message);
  }
}

async function runAllTests() {
  console.log("🚀 Starting comprehensive citation tracker tests...\n");

  // Test Approach 1 (may have CAPTCHA issues)
  await testApproach1();

  // Wait between tests
  console.log("\n⏳ Waiting 10 seconds before next test...");
  await new Promise((resolve) => setTimeout(resolve, 10000));

  // Test Approach 2 (Google-based)
  await testApproach2();

  // Test Approach 3 (Manual URLs)
  await testApproach3();

  console.log("\n\n" + "=".repeat(70));
  console.log("🎉 All tests completed!");
  console.log("=".repeat(70));

  console.log("\n📝 RECOMMENDATIONS:");
  console.log("  1. Use Approach 2 (Google Search) for automated discovery");
  console.log("  2. Use Approach 3 (Manual URLs) for verification");
  console.log("  3. Consider using official APIs (Yelp, Google Places)");
  console.log("  4. Implement caching to avoid repeated scraping");
  console.log("\n⚠️  Important: Always respect robots.txt and ToS");
}

// Run tests
runAllTests()
  .then(() => {
    console.log("\n✅ Test suite completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test suite failed:", error);
    process.exit(1);
  });
