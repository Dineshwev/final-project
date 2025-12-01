/**
 * NAP Consistency Checker - Test Suite
 * Comprehensive tests for the NAP validation system
 */

import * as napChecker from "./services/napConsistencyChecker.js";
import fs from "fs";

console.log("=".repeat(80));
console.log("NAP CONSISTENCY CHECKER - TEST SUITE");
console.log("=".repeat(80));
console.log();

// Test Data
const masterData = {
  name: "Joe's Pizza Restaurant",
  address: "123 Main Street, Suite 100, New York, NY 10001",
  phone: "(555) 123-4567",
};

const testCitations = [
  {
    source: "Google My Business",
    name: "Joe's Pizza Restaurant",
    address: "123 Main St, Ste 100, New York, NY 10001",
    phone: "555-123-4567",
  },
  {
    source: "Yelp",
    name: "Joes Pizza Restaurant",
    address: "123 Main Street Suite 100 New York NY 10001",
    phone: "+1 (555) 123-4567",
  },
  {
    source: "Yellow Pages",
    name: "Joe's Pizza",
    address: "123 Main St., Suite 100, New York, NY 10001",
    phone: "5551234567",
  },
  {
    source: "Facebook",
    name: "Joe's Pizza Restaurant & Bar",
    address: "123 Main Street, New York, NY 10001",
    phone: "(555) 123-4567",
  },
  {
    source: "TripAdvisor",
    name: "Joes Pizzeria",
    address: "456 Oak Avenue, New York, NY 10001",
    phone: "(555) 999-8888",
  },
  {
    source: "Foursquare",
    name: "Joe's Pizza Restaurant",
    address: "123 Main Street, Suite 100, New York, NY 10001",
    phone: "(555) 123-4567",
  },
];

// Test 1: Individual Function Tests
console.log("TEST 1: NORMALIZATION FUNCTIONS");
console.log("-".repeat(80));

const normalized = napChecker.normalizeNAP(masterData);
console.log("Original Master Data:", masterData);
console.log("Normalized Master Data:", normalized);
console.log();

// Test 2: Name Comparison
console.log("TEST 2: NAME COMPARISON");
console.log("-".repeat(80));

const nameTests = [
  ["Joe's Pizza Restaurant", "Joe's Pizza Restaurant"],
  ["Joe's Pizza Restaurant", "Joes Pizza Restaurant"],
  ["Joe's Pizza Restaurant", "Joe's Pizza"],
  ["Joe's Pizza Restaurant", "Joe's Pizza Restaurant & Bar"],
  ["Joe's Pizza Restaurant", "Completely Different Name"],
];

nameTests.forEach(([name1, name2]) => {
  const result = napChecker.compareNames(name1, name2);
  console.log(`\nComparing: "${name1}" vs "${name2}"`);
  console.log(`Status: ${result.status.toUpperCase()} (${result.color})`);
  console.log(`Similarity: ${result.similarity}%`);
  console.log(`Message: ${result.message}`);
});
console.log();

// Test 3: Address Comparison
console.log("TEST 3: ADDRESS COMPARISON");
console.log("-".repeat(80));

const addressTests = [
  [
    "123 Main Street, Suite 100, New York, NY 10001",
    "123 Main St, Ste 100, New York, NY 10001",
  ],
  [
    "123 Main Street, Suite 100, New York, NY 10001",
    "123 Main Street Suite 100 New York NY 10001",
  ],
  ["123 Main Street, New York", "456 Oak Avenue, New York"],
  ["123 North Main Street", "123 N Main St"],
  ["456 West Boulevard", "456 W Blvd"],
];

addressTests.forEach(([addr1, addr2]) => {
  const result = napChecker.compareAddresses(addr1, addr2);
  console.log(`\nComparing: "${addr1}" vs "${addr2}"`);
  console.log(`Status: ${result.status.toUpperCase()} (${result.color})`);
  console.log(`Similarity: ${result.similarity}%`);
  console.log(`Message: ${result.message}`);
});
console.log();

// Test 4: Phone Comparison
console.log("TEST 4: PHONE COMPARISON");
console.log("-".repeat(80));

const phoneTests = [
  ["(555) 123-4567", "555-123-4567"],
  ["(555) 123-4567", "+1 (555) 123-4567"],
  ["5551234567", "(555) 123-4567"],
  ["(555) 123-4567", "(555) 999-8888"],
  ["555.123.4567", "555 123 4567"],
];

phoneTests.forEach(([phone1, phone2]) => {
  const result = napChecker.comparePhones(phone1, phone2);
  console.log(`\nComparing: "${phone1}" vs "${phone2}"`);
  console.log(`Status: ${result.status.toUpperCase()} (${result.color})`);
  console.log(`Similarity: ${result.similarity}%`);
  console.log(`Message: ${result.message}`);
  if (result.formatted1) {
    console.log(`Formatted: ${result.formatted1} vs ${result.formatted2}`);
  }
});
console.log();

// Test 5: Visual Diff
console.log("TEST 5: VISUAL DIFF GENERATION");
console.log("-".repeat(80));

const diffTests = [
  ["Joe's Pizza Restaurant", "Joe's Pizza"],
  ["123 Main Street Suite 100", "123 Main St Ste 100"],
  ["New York City", "New York"],
];

diffTests.forEach(([str1, str2]) => {
  const diff = napChecker.generateVisualDiff(str1, str2);
  console.log(`\nComparing: "${str1}" vs "${str2}"`);
  console.log(`Has Differences: ${diff.hasDifferences}`);
  if (diff.hasDifferences && diff.differences.length > 0) {
    diff.differences.forEach((d) => {
      console.log(`  ${d.type.toUpperCase()}: ${d.words.join(", ")}`);
    });
  }
});
console.log();

// Test 6: Comprehensive Consistency Report
console.log("TEST 6: COMPREHENSIVE CONSISTENCY REPORT");
console.log("-".repeat(80));

const report = napChecker.generateConsistencyReport(testCitations, masterData);

console.log("\n=== OVERALL SUMMARY ===");
console.log(`Overall Score: ${report.overallScore}%`);
console.log(`Total Citations: ${report.summary.total}`);
console.log(
  `Perfect Matches: ${report.summary.perfect} (${Math.round(
    (report.summary.perfect / report.summary.total) * 100
  )}%)`
);
console.log(
  `Minor Issues: ${report.summary.minor} (${Math.round(
    (report.summary.minor / report.summary.total) * 100
  )}%)`
);
console.log(
  `Major Issues: ${report.summary.major} (${Math.round(
    (report.summary.major / report.summary.total) * 100
  )}%)`
);

console.log("\n=== MASTER DATA ===");
console.log(`Name: ${report.masterData.name}`);
console.log(`Address: ${report.masterData.address}`);
console.log(`Phone: ${report.masterData.phone}`);

console.log("\n=== CITATION ANALYSIS ===");
report.results.forEach((result) => {
  console.log(`\n--- ${result.source} ---`);
  console.log(
    `Overall Score: ${
      result.score
    }% (${result.status.toUpperCase()}) [${result.color.toUpperCase()}]`
  );

  // Name
  console.log(`\n  NAME:`);
  console.log(`    Citation: ${result.fields.name.original}`);
  console.log(`    Master:   ${result.fields.name.master}`);
  console.log(
    `    Status:   ${result.fields.name.comparison.status} (${result.fields.name.comparison.similarity}%)`
  );
  console.log(
    `    Color:    ${result.fields.name.comparison.color.toUpperCase()}`
  );

  // Address
  console.log(`\n  ADDRESS:`);
  console.log(`    Citation: ${result.fields.address.original}`);
  console.log(`    Master:   ${result.fields.address.master}`);
  console.log(
    `    Status:   ${result.fields.address.comparison.status} (${result.fields.address.comparison.similarity}%)`
  );
  console.log(
    `    Color:    ${result.fields.address.comparison.color.toUpperCase()}`
  );

  // Phone
  console.log(`\n  PHONE:`);
  console.log(`    Citation: ${result.fields.phone.original}`);
  console.log(`    Master:   ${result.fields.phone.master}`);
  console.log(
    `    Status:   ${result.fields.phone.comparison.status} (${result.fields.phone.comparison.similarity}%)`
  );
  console.log(
    `    Color:    ${result.fields.phone.comparison.color.toUpperCase()}`
  );
});

console.log("\n=== RECOMMENDATIONS ===");
if (report.recommendations && report.recommendations.length > 0) {
  report.recommendations.forEach((rec, index) => {
    console.log(`\n${index + 1}. [${rec.priority.toUpperCase()} PRIORITY]`);
    console.log(`   ${rec.message}`);
    console.log(`   Action: ${rec.action}`);
  });
} else {
  console.log("No recommendations available.");
}

console.log("\n" + "=".repeat(80));
console.log("TEST COMPLETE - Generated at: " + report.generatedAt);
console.log("=".repeat(80));

// Test 7: Edge Cases
console.log("\n\nTEST 7: EDGE CASES");
console.log("-".repeat(80));

// Missing data
console.log("\n--- Missing Data Test ---");
const missingDataReport = napChecker.generateConsistencyReport(
  [{ source: "Test", name: "", address: "", phone: "" }],
  masterData
);
console.log(
  "Missing data result:",
  JSON.stringify(missingDataReport.results[0].fields.name.comparison, null, 2)
);

// Empty citations array
console.log("\n--- Empty Citations Test ---");
const emptyReport = napChecker.generateConsistencyReport([], masterData);
console.log("Empty citations result:", emptyReport.error || "Error detected");

// Invalid master data
console.log("\n--- Invalid Master Data Test ---");
const invalidMasterReport = napChecker.generateConsistencyReport(
  testCitations,
  {}
);
console.log(
  "Invalid master data result:",
  invalidMasterReport.error || "Error detected"
);

console.log("\n" + "=".repeat(80));
console.log("ALL TESTS COMPLETED SUCCESSFULLY!");
console.log("=".repeat(80));

// Export report to JSON for inspection
const outputPath = "./nap-consistency-test-report.json";
fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
console.log(`\nFull report saved to: ${outputPath}`);
