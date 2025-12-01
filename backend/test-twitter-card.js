import { generateTwitterCardReport } from "./services/twitterCardValidator.js";

// Test URLs with different Twitter Card implementations
const testUrls = [
  "https://github.com",
  "https://www.imdb.com",
  "https://www.youtube.com",
];

async function testTwitterCardValidator() {
  console.log("🐦 Twitter Card Validator Test Suite\n");
  console.log("=".repeat(80));
  console.log("\n");

  for (const url of testUrls) {
    console.log(`\n📝 Testing: ${url}`);
    console.log("-".repeat(80));

    try {
      const report = await generateTwitterCardReport(url);

      console.log(`✅ Validation Complete\n`);
      console.log(`Card Type: ${report.cardType}`);
      console.log(`Status: ${report.isValid ? "✅ VALID" : "❌ INVALID"}`);
      console.log(`Total Twitter Tags: ${report.summary.totalTags}`);
      console.log(
        `Has Fallbacks: ${report.summary.hasFallbacks ? "Yes" : "No"}`
      );
      console.log(`Errors: ${report.summary.errorsCount}`);
      console.log(`Warnings: ${report.summary.warningsCount}`);

      console.log(`\n📋 Twitter Tags:`);
      Object.entries(report.twitterTags).forEach(([key, value]) => {
        const displayValue =
          value.length > 80 ? value.substring(0, 80) + "..." : value;
        console.log(`  twitter:${key}: ${displayValue}`);
      });

      if (Object.keys(report.fallbacks).length > 0) {
        console.log(`\n🔄 Fallback Tags (from OG):`);
        Object.entries(report.fallbacks).forEach(([key, value]) => {
          const displayValue =
            value.length > 80 ? value.substring(0, 80) + "..." : value;
          console.log(`  og:${key}: ${displayValue}`);
        });
      }

      if (report.imageValidation) {
        console.log(`\n🖼️  Image Validation:`);
        if (report.imageValidation.error) {
          console.log(`  ❌ ${report.imageValidation.error}`);
        } else {
          console.log(
            `  ${report.imageValidation.valid ? "✅" : "❌"} ${
              report.imageValidation.message
            }`
          );
          if (report.imageValidation.width) {
            console.log(
              `  Dimensions: ${report.imageValidation.width}x${report.imageValidation.height}px`
            );
            console.log(`  Format: ${report.imageValidation.format}`);
            console.log(`  Size: ${report.imageValidation.fileSizeMB} MB`);
          }
        }
      }

      if (report.errors.length > 0) {
        console.log(`\n❌ Errors (${report.errors.length}):`);
        report.errors.forEach((error, idx) => {
          console.log(`  ${idx + 1}. ${error}`);
        });
      }

      if (report.warnings.length > 0) {
        console.log(`\n⚠️  Warnings (${report.warnings.length}):`);
        report.warnings.forEach((warning, idx) => {
          console.log(`  ${idx + 1}. ${warning}`);
        });
      }

      if (report.recommendations.length > 0) {
        console.log(`\n💡 Recommendations (${report.recommendations.length}):`);
        report.recommendations.forEach((rec, idx) => {
          console.log(`  ${idx + 1}. ${rec}`);
        });
      }

      console.log(`\n🔗 Preview URL: ${report.previewUrl}`);
    } catch (error) {
      console.error(`\n❌ Validation failed: ${error.message}`);
    }

    console.log("\n" + "=".repeat(80));
  }

  console.log("\n✅ Test suite completed!\n");
}

// Run the tests
testTwitterCardValidator().catch((error) => {
  console.error("Test suite error:", error);
  process.exit(1);
});
