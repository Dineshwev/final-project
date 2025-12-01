import { generateRichPinReport } from "./services/pinterestRichPinValidator.js";

// Test URLs for different Rich Pin types
const testUrls = {
  github: "https://github.com/", // GitHub has article-like OG tags
  wikipedia: "https://www.wikipedia.org/", // Wikipedia for auto-detection
  invalid: "https://invalid-url-that-does-not-exist-12345.com/", // Test 404 handling
};

async function testPinterestRichPinValidator() {
  console.log("📌 Pinterest Rich Pins Validator Test Suite\n");
  console.log("=".repeat(80));
  console.log("\n");

  for (const [type, url] of Object.entries(testUrls)) {
    console.log(`\n🧪 Testing ${type.toUpperCase()} Rich Pin:`);
    console.log("-".repeat(80));
    console.log(`URL: ${url}\n`);

    try {
      const report = await generateRichPinReport(url);

      if (!report.success) {
        console.log(`❌ Validation failed: ${report.error}\n`);
        if (report.suggestion) {
          console.log(`💡 Suggestion: ${report.suggestion}\n`);
        }
        continue;
      }

      console.log(`✅ Validation complete\n`);
      console.log(`📊 Pin Type: ${report.pinType} (${report.pinTypeKey})`);
      console.log(`📝 Description: ${report.description}`);
      console.log(`✔️  Valid: ${report.isValid ? "YES" : "NO"}`);
      console.log(
        `⏰ Timestamp: ${new Date(report.timestamp).toLocaleString()}\n`
      );

      if (report.summary) {
        console.log(`📈 Summary:`);
        console.log(
          `  Required Tags: ${report.summary.requiredTagsFound}/${report.summary.requiredTagsTotal}`
        );
        console.log(
          `  Recommended Tags: ${report.summary.recommendedTagsFound}/${report.summary.recommendedTagsTotal}`
        );
        console.log(`  Errors: ${report.errors?.length || 0}`);
        console.log(`  Warnings: ${report.warnings?.length || 0}\n`);

        // Calculate score
        const requiredScore =
          (report.summary.requiredTagsFound /
            report.summary.requiredTagsTotal) *
          70;
        const recommendedScore =
          (report.summary.recommendedTagsFound /
            report.summary.recommendedTagsTotal) *
          30;
        const totalScore = Math.round(requiredScore + recommendedScore);
        console.log(`🎯 Overall Score: ${totalScore}%\n`);
      }

      if (report.foundTags && report.foundTags.length > 0) {
        console.log(`✅ Found Tags (${report.foundTags.length}):`);
        report.foundTags.forEach((tag) => {
          const typeIcon =
            tag.type === "required"
              ? "⚠️"
              : tag.type === "recommended"
              ? "💡"
              : "🔗";
          const sourceInfo = tag.source ? ` [${tag.source}]` : "";
          console.log(`  ${typeIcon} ${tag.tag}${sourceInfo}`);
          console.log(
            `     Value: ${tag.value.substring(0, 100)}${
              tag.value.length > 100 ? "..." : ""
            }`
          );
        });
        console.log();
      }

      if (report.missingTags && report.missingTags.length > 0) {
        console.log(`❌ Missing Required Tags (${report.missingTags.length}):`);
        report.missingTags.forEach((tag) => {
          console.log(`  - ${tag}`);
        });
        console.log();
      }

      if (report.errors && report.errors.length > 0) {
        console.log(`🚨 Errors (${report.errors.length}):`);
        report.errors.forEach((err, idx) => {
          console.log(`  ${idx + 1}. ${err}`);
        });
        console.log();
      }

      if (report.warnings && report.warnings.length > 0) {
        console.log(`⚠️  Warnings (${report.warnings.length}):`);
        report.warnings.forEach((warn, idx) => {
          console.log(`  ${idx + 1}. ${warn}`);
        });
        console.log();
      }

      if (report.schemaInfo) {
        console.log(`🔗 Schema.org Structured Data:`);
        console.log(
          `  Has Schema: ${report.schemaInfo.hasSchema ? "YES ✓" : "NO ✗"}`
        );
        if (report.schemaInfo.schemaType) {
          console.log(`  Schema Type: ${report.schemaInfo.schemaType}`);
        }
        console.log();
      }

      if (report.schemas && report.schemas.length > 0) {
        console.log(`📋 Found ${report.schemas.length} Schema(s):`);
        report.schemas.forEach((schema, idx) => {
          console.log(`  ${idx + 1}. Type: ${schema.type}`);
        });
        console.log();
      }

      console.log(`🔍 Pinterest Validator: ${report.validationURL}`);
      console.log("\n" + "=".repeat(80));
    } catch (error) {
      console.error(`\n❌ Test failed: ${error.message}`);
      console.log("\n" + "=".repeat(80));
    }
  }

  console.log("\n✅ Test suite completed!\n");
}

// Run the test
testPinterestRichPinValidator().catch((error) => {
  console.error("Test suite error:", error);
  process.exit(1);
});
