/**
 * NAP Consistency Checker - Usage Example
 * Demonstrates how to use the NAP consistency checker in real scenarios
 */

import * as napChecker from "./services/napConsistencyChecker.js";

// Example 1: Simple NAP Check
console.log("EXAMPLE 1: Simple NAP Consistency Check");
console.log("=".repeat(80));

const myBusiness = {
  name: "Smith & Associates Law Firm",
  address: "789 Legal Boulevard, Suite 200, Boston, MA 02108",
  phone: "(617) 555-7890",
};

const myCitations = [
  {
    source: "Google My Business",
    name: "Smith & Associates Law Firm",
    address: "789 Legal Blvd, Ste 200, Boston, MA 02108",
    phone: "617-555-7890",
  },
  {
    source: "Avvo",
    name: "Smith and Associates",
    address: "789 Legal Boulevard Suite 200 Boston MA 02108",
    phone: "(617) 555-7890",
  },
  {
    source: "FindLaw",
    name: "Smith & Associates",
    address: "789 Legal Blvd, Boston, MA 02108",
    phone: "617.555.7890",
  },
];

const report = napChecker.generateConsistencyReport(myCitations, myBusiness);

console.log(`\n📊 Overall Score: ${report.overallScore}%\n`);
console.log(`✅ Perfect Matches: ${report.summary.perfect}`);
console.log(`⚠️  Minor Issues: ${report.summary.minor}`);
console.log(`❌ Major Issues: ${report.summary.major}`);

console.log("\n📋 Citation Breakdown:");
report.results.forEach((result) => {
  const emoji =
    result.color === "green" ? "🟢" : result.color === "yellow" ? "🟡" : "🔴";
  console.log(`${emoji} ${result.source}: ${result.score}% (${result.status})`);

  // Show any mismatches
  Object.entries(result.fields).forEach(([field, data]) => {
    if (data.comparison.color === "red") {
      console.log(`   ❌ ${field.toUpperCase()}: ${data.comparison.message}`);
    }
  });
});

if (report.recommendations.length > 0) {
  console.log("\n💡 Recommendations:");
  report.recommendations.forEach((rec, i) => {
    console.log(`${i + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`);
  });
}

// Example 2: Individual Field Comparisons
console.log("\n\n" + "=".repeat(80));
console.log("EXAMPLE 2: Individual Field Comparisons");
console.log("=".repeat(80));

console.log("\n🏷️  Name Comparisons:");
const nameTests = [
  ["Tech Solutions Inc", "Tech Solutions Inc"],
  ["Tech Solutions Inc", "Tech Solutions Incorporated"],
  ["Dr. Smith Dental", "Dr Smith Dental"],
];

nameTests.forEach(([name1, name2]) => {
  const result = napChecker.compareNames(name1, name2);
  const emoji =
    result.color === "green" ? "🟢" : result.color === "yellow" ? "🟡" : "🔴";
  console.log(`${emoji} "${name1}" vs "${name2}"`);
  console.log(`   Similarity: ${result.similarity}% - ${result.message}`);
});

console.log("\n📍 Address Comparisons:");
const addressTests = [
  ["100 North Main Street", "100 N Main St"],
  ["200 East Broadway Avenue", "200 E Broadway Ave"],
];

addressTests.forEach(([addr1, addr2]) => {
  const result = napChecker.compareAddresses(addr1, addr2);
  const emoji =
    result.color === "green" ? "🟢" : result.color === "yellow" ? "🟡" : "🔴";
  console.log(`${emoji} "${addr1}" vs "${addr2}"`);
  console.log(`   Similarity: ${result.similarity}% - ${result.message}`);
});

console.log("\n📞 Phone Comparisons:");
const phoneTests = [
  ["(555) 123-4567", "555.123.4567"],
  ["+1 555-123-4567", "5551234567"],
  ["555-123-4567", "555-999-8888"],
];

phoneTests.forEach(([phone1, phone2]) => {
  const result = napChecker.comparePhones(phone1, phone2);
  const emoji =
    result.color === "green" ? "🟢" : result.color === "yellow" ? "🟡" : "🔴";
  console.log(`${emoji} "${phone1}" vs "${phone2}"`);
  console.log(`   ${result.message}`);
});

// Example 3: Normalization
console.log("\n\n" + "=".repeat(80));
console.log("EXAMPLE 3: Data Normalization");
console.log("=".repeat(80));

const unnormalizedData = {
  name: "   Joe's    Pizza    Restaurant   ",
  address: "123 North Main Street, Suite 100, New York, NY",
  phone: "+1 (555) 123-4567",
};

console.log("\n📝 Original Data:");
console.log("Name:", unnormalizedData.name);
console.log("Address:", unnormalizedData.address);
console.log("Phone:", unnormalizedData.phone);

const normalized = napChecker.normalizeNAP(unnormalizedData);

console.log("\n✨ Normalized Data:");
console.log("Name:", normalized.name);
console.log("Address:", normalized.address);
console.log("Phone:", normalized.phone);

// Example 4: Visual Diff
console.log("\n\n" + "=".repeat(80));
console.log("EXAMPLE 4: Visual Diff Analysis");
console.log("=".repeat(80));

const diffExamples = [
  ["McDonald's Restaurant", "McDonalds Restaurant"],
  ["123 Main Street Suite 100", "123 Main St Ste 100"],
  ["New York City", "New York"],
];

diffExamples.forEach(([str1, str2]) => {
  const diff = napChecker.generateVisualDiff(str1, str2);
  console.log(`\n📊 Comparing: "${str1}" vs "${str2}"`);

  if (diff.hasDifferences) {
    diff.differences.forEach((d) => {
      if (d.type === "removed") {
        console.log(`   ❌ Removed: ${d.words.join(", ")}`);
      } else if (d.type === "added") {
        console.log(`   ➕ Added: ${d.words.join(", ")}`);
      }
    });
  } else {
    console.log("   ✅ No differences detected");
  }
});

// Example 5: Levenshtein Distance
console.log("\n\n" + "=".repeat(80));
console.log("EXAMPLE 5: Levenshtein Distance Calculator");
console.log("=".repeat(80));

const distanceTests = [
  ["kitten", "sitting"],
  ["Saturday", "Sunday"],
  ["book", "back"],
];

console.log("\n📏 Edit Distance Calculations:");
distanceTests.forEach(([str1, str2]) => {
  const distance = napChecker.levenshteinDistance(str1, str2);
  const similarity = napChecker.calculateSimilarity(str1, str2);
  console.log(`\n"${str1}" ↔ "${str2}"`);
  console.log(`   Edit Distance: ${distance}`);
  console.log(`   Similarity: ${similarity.toFixed(2)}%`);
});

console.log("\n\n" + "=".repeat(80));
console.log("✅ All examples completed successfully!");
console.log("=".repeat(80));
