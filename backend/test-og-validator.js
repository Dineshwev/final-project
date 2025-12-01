import { validateOpenGraphTags } from "./services/ogValidator.js";

/**
 * Test script for Open Graph meta tags validator
 * Run with: node test-og-validator.js
 */

async function runTests() {
  console.log("=".repeat(80));
  console.log("Open Graph Meta Tags Validator - Test Suite");
  console.log("=".repeat(80));
  console.log("");

  const testUrls = [
    // Good examples
    "https://www.imdb.com/",
    "https://github.com/",
    "https://www.youtube.com/",

    // You can add your own URLs to test
    // 'https://example.com'
  ];

  for (const url of testUrls) {
    console.log(`\n${"*".repeat(80)}`);
    console.log(`Testing URL: ${url}`);
    console.log("*".repeat(80));

    try {
      const report = await validateOpenGraphTags(url);

      console.log("\n📊 VALIDATION SUMMARY:");
      console.log("─".repeat(80));
      console.log(`✓ Valid: ${report.isValid ? "✅ YES" : "❌ NO"}`);
      console.log(`✓ Total OG Tags Found: ${report.summary.totalTags}`);
      console.log(
        `✓ Required Tags Present: ${report.summary.requiredTagsPresent}/${report.summary.requiredTagsTotal}`
      );
      console.log(`✓ Errors: ${report.summary.errorsCount}`);
      console.log(`✓ Warnings: ${report.summary.warningsCount}`);

      // Display tags
      console.log("\n📝 OPEN GRAPH TAGS:");
      console.log("─".repeat(80));
      if (Object.keys(report.tags).length > 0) {
        for (const [key, value] of Object.entries(report.tags)) {
          const displayValue =
            value.length > 100 ? value.substring(0, 100) + "..." : value;
          console.log(`  og:${key}`);
          console.log(`    └─ ${displayValue}`);
        }
      } else {
        console.log("  No Open Graph tags found");
      }

      // Display image validation
      if (report.imageValidation) {
        console.log("\n🖼️  IMAGE VALIDATION:");
        console.log("─".repeat(80));
        if (report.imageValidation.valid) {
          console.log(
            `  ✓ Dimensions: ${report.imageValidation.width}x${report.imageValidation.height}px`
          );
          console.log(
            `  ✓ Aspect Ratio: ${report.imageValidation.aspectRatio}:1`
          );
          console.log(
            `  ✓ Recommended Size: ${
              report.imageValidation.isRecommendedSize ? "✅ YES" : "⚠️  NO"
            }`
          );
          console.log(`  ✓ Message: ${report.imageValidation.message}`);
        } else {
          console.log(`  ❌ Error: ${report.imageValidation.error}`);
        }
      }

      // Display errors
      if (report.errors.length > 0) {
        console.log("\n❌ ERRORS:");
        console.log("─".repeat(80));
        report.errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error}`);
        });
      }

      // Display warnings
      if (report.warnings.length > 0) {
        console.log("\n⚠️  WARNINGS:");
        console.log("─".repeat(80));
        report.warnings.forEach((warning, index) => {
          console.log(`  ${index + 1}. ${warning}`);
        });
      }

      // Display recommendations
      if (report.recommendations.length > 0) {
        console.log("\n💡 RECOMMENDATIONS:");
        console.log("─".repeat(80));
        report.recommendations.forEach((rec, index) => {
          console.log(`  ${index + 1}. ${rec}`);
        });
      }

      // Display debug tools
      console.log("\n🔧 DEBUG TOOLS:");
      console.log("─".repeat(80));
      console.log(`  📘 Facebook Debugger:`);
      console.log(`    ${report.debugTools.facebook}`);
      console.log(`  💼 LinkedIn Inspector:`);
      console.log(`    ${report.debugTools.linkedin}`);
      console.log(`  🐦 Twitter Validator:`);
      console.log(`    ${report.debugTools.twitter}`);
    } catch (error) {
      console.log(`\n❌ ERROR: ${error.message}`);
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("Test suite completed");
  console.log("=".repeat(80));
}

// Run the tests
runTests().catch(console.error);
