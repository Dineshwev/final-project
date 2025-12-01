import { generateAuditReport } from "./services/socialPresenceValidator.js";

// Test profiles
const testProfiles = {
  facebook: "https://facebook.com/github",
  twitter: "https://twitter.com/github",
  instagram: "https://instagram.com/github",
  linkedin: "https://linkedin.com/company/github",
  youtube: "https://youtube.com/@GitHub",
  pinterest: "", // Intentionally empty
};

async function testSocialPresenceValidator() {
  console.log("🌐 Social Media Presence Validator Test Suite\n");
  console.log("=".repeat(80));
  console.log("\n");

  console.log("📝 Testing GitHub's Social Profiles:");
  console.log("-".repeat(80));
  console.log("\nProfiles to audit:");
  Object.entries(testProfiles).forEach(([platform, url]) => {
    if (url) {
      console.log(`  ${platform}: ${url}`);
    } else {
      console.log(`  ${platform}: (not provided)`);
    }
  });
  console.log("\n");

  try {
    const report = await generateAuditReport(testProfiles);

    console.log(`✅ Audit Complete\n`);
    console.log(`📊 Overall Score: ${report.score}%`);
    console.log(
      `⏰ Timestamp: ${new Date(report.timestamp).toLocaleString()}\n`
    );

    console.log(`📈 Summary:`);
    console.log(`  Total Platforms: ${report.summary.totalPlatforms}`);
    console.log(`  Provided Profiles: ${report.summary.providedProfiles}`);
    console.log(`  ✅ Active Profiles: ${report.summary.activeProfiles}`);
    console.log(`  ❌ Invalid URLs: ${report.summary.invalidProfiles}`);
    console.log(`  ⚠️  Not Found: ${report.summary.notFoundProfiles}`);
    console.log(`  🔍 Missing Platforms: ${report.summary.missingPlatforms}\n`);

    console.log(`🔍 Profile Details:`);
    report.profiles.forEach((profile) => {
      const statusIcon =
        profile.status === "active"
          ? "✅"
          : profile.status === "invalid"
          ? "❌"
          : "⚠️";
      console.log(`\n  ${statusIcon} ${profile.platform}:`);
      console.log(`     URL: ${profile.url}`);
      console.log(`     Status: ${profile.status}`);
      console.log(`     Valid: ${profile.isValid}`);
      console.log(`     Exists: ${profile.exists}`);
      if (profile.username) {
        console.log(`     Username: @${profile.username}`);
      }
      if (profile.info?.name) {
        console.log(`     Name: ${profile.info.name}`);
      }
      if (profile.error) {
        console.log(`     Error: ${profile.error}`);
      }
    });

    if (report.missingPlatforms.length > 0) {
      console.log(`\n⚠️  Missing Platforms:`);
      report.missingPlatforms.forEach((platform) => {
        console.log(`  - ${platform.name}`);
      });
    }

    if (report.recommendations.length > 0) {
      console.log(`\n💡 Recommendations:`);
      report.recommendations.forEach((rec, idx) => {
        console.log(`  ${idx + 1}. ${rec}`);
      });
    }

    console.log("\n" + "=".repeat(80));
  } catch (error) {
    console.error(`\n❌ Audit failed: ${error.message}`);
    console.log("\n" + "=".repeat(80));
  }

  console.log("\n✅ Test suite completed!\n");
}

// Run the test
testSocialPresenceValidator().catch((error) => {
  console.error("Test suite error:", error);
  process.exit(1);
});
