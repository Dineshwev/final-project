/**
 * Simple Citation Tracker Test
 */

import * as citationService from "./services/citationTrackerService.js";

console.log("🔍 Testing Citation Tracker Service...\n");

async function testSearch() {
  console.log("Test 1: Basic Search");
  console.log("=".repeat(50));

  try {
    const result = await citationService.searchCitations(
      "Starbucks",
      "+1-206-555-1234",
      "Seattle"
    );

    console.log("\n✅ Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

testSearch()
  .then(() => {
    console.log("\n✅ Test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });
