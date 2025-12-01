/**
 * Google My Business API - Test & Verification Script
 * Run this to verify your GMB API integration is working correctly
 *
 * Usage: node backend/tests/testGoogleMyBusiness.js
 */

import * as gmbService from "../services/googleMyBusinessService.js";
import dotenv from "dotenv";

dotenv.config();

// Color codes for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function separator() {
  console.log("=".repeat(70));
}

/**
 * Test 1: Check Environment Variables
 */
async function testEnvironmentVariables() {
  separator();
  log("TEST 1: Environment Variables Check", "cyan");
  separator();

  const required = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REDIRECT_URI",
  ];

  const optional = ["GOOGLE_REFRESH_TOKEN"];

  let allPresent = true;

  // Check required variables
  log("\nRequired Variables:", "blue");
  for (const key of required) {
    const exists = !!process.env[key];
    const status = exists ? "✓" : "✗";
    const color = exists ? "green" : "red";
    log(`  ${status} ${key}: ${exists ? "Present" : "MISSING"}`, color);
    if (!exists) allPresent = false;
  }

  // Check optional variables
  log("\nOptional Variables:", "blue");
  for (const key of optional) {
    const exists = !!process.env[key];
    const status = exists ? "✓" : "○";
    const color = exists ? "green" : "yellow";
    log(
      `  ${status} ${key}: ${
        exists ? "Present" : "Not set (run auth flow first)"
      }`,
      color
    );
  }

  if (allPresent) {
    log("\n✓ All required environment variables are set!", "green");
    return true;
  } else {
    log("\n✗ Some required environment variables are missing!", "red");
    log("\nPlease add them to backend/.env:", "yellow");
    log("  GOOGLE_CLIENT_ID=your_client_id_here", "yellow");
    log("  GOOGLE_CLIENT_SECRET=your_client_secret_here", "yellow");
    log(
      "  GOOGLE_REDIRECT_URI=http://localhost:3002/api/gmb/callback",
      "yellow"
    );
    return false;
  }
}

/**
 * Test 2: Authentication Flow
 */
async function testAuthentication() {
  separator();
  log("TEST 2: Authentication", "cyan");
  separator();

  try {
    log("\nTesting authentication URL generation...", "blue");
    const result = await gmbService.authenticateGMB();

    if (result.success && result.authUrl) {
      log("✓ Authentication URL generated successfully!", "green");
      log("\nAuthorization URL:", "blue");
      log(result.authUrl, "yellow");
      log(
        "\nNote: Visit this URL in your browser to complete OAuth flow",
        "yellow"
      );
      return true;
    } else {
      log("✗ Failed to generate auth URL", "red");
      return false;
    }
  } catch (error) {
    log(`✗ Authentication test failed: ${error.message}`, "red");
    return false;
  }
}

/**
 * Test 3: Rate Limit Status
 */
async function testRateLimitStatus() {
  separator();
  log("TEST 3: Rate Limit Status", "cyan");
  separator();

  try {
    log("\nChecking rate limit status...", "blue");
    const status = gmbService.getRateLimitStatus();

    log("✓ Rate limit status retrieved!", "green");
    log(`\n  Requests Used: ${status.requestsUsed}`, "blue");
    log(`  Requests Remaining: ${status.requestsRemaining}`, "blue");
    log(`  Max Requests: ${status.maxRequests}`, "blue");
    log(`  Reset Time: ${new Date(status.resetTime).toLocaleString()}`, "blue");

    const percentUsed = (
      (status.requestsUsed / status.maxRequests) *
      100
    ).toFixed(2);
    log(`  Usage: ${percentUsed}%`, "blue");

    if (status.requestsRemaining < 100) {
      log("\n⚠ Warning: Low on API quota!", "yellow");
    }

    return true;
  } catch (error) {
    log(`✗ Rate limit check failed: ${error.message}`, "red");
    return false;
  }
}

/**
 * Test 4: Business Info (requires auth)
 */
async function testBusinessInfo() {
  separator();
  log("TEST 4: Get Business Information", "cyan");
  separator();

  if (!process.env.GOOGLE_REFRESH_TOKEN) {
    log("\n○ Skipping - GOOGLE_REFRESH_TOKEN not set", "yellow");
    log("  Run the authentication flow first to get a refresh token", "yellow");
    return null;
  }

  // These are placeholder IDs - user needs to replace them
  const accountId = process.env.GMB_TEST_ACCOUNT_ID || "YOUR_ACCOUNT_ID";
  const locationId = process.env.GMB_TEST_LOCATION_ID || "YOUR_LOCATION_ID";

  if (accountId === "YOUR_ACCOUNT_ID" || locationId === "YOUR_LOCATION_ID") {
    log("\n○ Skipping - Test account/location IDs not configured", "yellow");
    log("  Add to .env file:", "yellow");
    log("    GMB_TEST_ACCOUNT_ID=your_account_id", "yellow");
    log("    GMB_TEST_LOCATION_ID=your_location_id", "yellow");
    return null;
  }

  try {
    log(`\nFetching business info for account ${accountId}...`, "blue");
    const result = await gmbService.getBusinessInfo(accountId, locationId);

    if (result.success) {
      log("✓ Business information retrieved successfully!", "green");
      log(`\n  Business Name: ${result.data.name}`, "blue");
      log(`  Phone: ${result.data.phoneNumber || "N/A"}`, "blue");
      log(`  Website: ${result.data.website || "N/A"}`, "blue");
      log(`  Address: ${result.data.address.streetAddress || "N/A"}`, "blue");
      return true;
    } else {
      log("✗ Failed to get business info", "red");
      log(`  Error: ${result.error}`, "red");
      if (result.details) {
        log(`  Details: ${JSON.stringify(result.details, null, 2)}`, "yellow");
      }
      return false;
    }
  } catch (error) {
    log(`✗ Business info test failed: ${error.message}`, "red");
    return false;
  }
}

/**
 * Test 5: Service Imports
 */
async function testServiceImports() {
  separator();
  log("TEST 5: Service Functions", "cyan");
  separator();

  const functions = [
    "authenticateGMB",
    "getBusinessInfo",
    "getBusinessReviews",
    "getBusinessInsights",
    "updateBusinessInfo",
    "getRateLimitStatus",
  ];

  log("\nChecking exported functions...", "blue");
  let allPresent = true;

  for (const funcName of functions) {
    const exists = typeof gmbService[funcName] === "function";
    const status = exists ? "✓" : "✗";
    const color = exists ? "green" : "red";
    log(`  ${status} ${funcName}()`, color);
    if (!exists) allPresent = false;
  }

  if (allPresent) {
    log("\n✓ All service functions are properly exported!", "green");
    return true;
  } else {
    log("\n✗ Some service functions are missing!", "red");
    return false;
  }
}

/**
 * Main Test Runner
 */
async function runTests() {
  console.log("\n");
  separator();
  log("GOOGLE MY BUSINESS API - INTEGRATION TESTS", "cyan");
  separator();
  log("\nRunning verification tests...\n", "blue");

  const results = {
    envVars: false,
    imports: false,
    auth: false,
    rateLimit: false,
    businessInfo: null, // null = skipped
  };

  // Run tests
  results.envVars = await testEnvironmentVariables();
  results.imports = await testServiceImports();

  if (results.envVars && results.imports) {
    results.auth = await testAuthentication();
    results.rateLimit = await testRateLimitStatus();
    results.businessInfo = await testBusinessInfo();
  } else {
    log("\nSkipping remaining tests due to failures", "yellow");
  }

  // Summary
  separator();
  log("TEST SUMMARY", "cyan");
  separator();

  const summary = [];
  let passCount = 0;
  let failCount = 0;
  let skipCount = 0;

  for (const [test, result] of Object.entries(results)) {
    let status, color, label;

    if (result === true) {
      status = "✓ PASS";
      color = "green";
      passCount++;
    } else if (result === false) {
      status = "✗ FAIL";
      color = "red";
      failCount++;
    } else {
      status = "○ SKIP";
      color = "yellow";
      skipCount++;
    }

    // Format test name
    label = test
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();

    log(`  ${status} ${label}`, color);
  }

  console.log("");
  separator();

  log(`Total Tests: ${Object.keys(results).length}`, "blue");
  log(`Passed: ${passCount}`, "green");
  log(`Failed: ${failCount}`, failCount > 0 ? "red" : "green");
  log(`Skipped: ${skipCount}`, "yellow");

  separator();

  // Final verdict
  if (failCount === 0 && passCount > 0) {
    log("\n✓ ALL TESTS PASSED!", "green");
    log(
      "Your Google My Business API integration is working correctly.",
      "green"
    );
  } else if (failCount > 0) {
    log("\n✗ SOME TESTS FAILED", "red");
    log("Please check the errors above and fix the issues.", "red");
  } else {
    log("\n○ SETUP INCOMPLETE", "yellow");
    log(
      "Follow GOOGLE_MY_BUSINESS_QUICK_START.md to complete setup.",
      "yellow"
    );
  }

  // Next steps
  console.log("");
  separator();
  log("NEXT STEPS", "cyan");
  separator();

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    log("\n1. Set up Google Cloud credentials in backend/.env", "yellow");
    log("   See: GOOGLE_MY_BUSINESS_QUICK_START.md", "yellow");
  } else if (!process.env.GOOGLE_REFRESH_TOKEN) {
    log("\n1. Complete OAuth2 authentication flow:", "yellow");
    log("   - Visit the authorization URL shown above", "yellow");
    log("   - Authorize the app", "yellow");
    log("   - Exchange the code for a refresh token", "yellow");
    log("   - Add GOOGLE_REFRESH_TOKEN to .env", "yellow");
  } else if (!process.env.GMB_TEST_ACCOUNT_ID) {
    log("\n1. Find your GMB account and location IDs", "yellow");
    log("2. Add them to .env for testing:", "yellow");
    log("   GMB_TEST_ACCOUNT_ID=your_account_id", "yellow");
    log("   GMB_TEST_LOCATION_ID=your_location_id", "yellow");
  } else {
    log("\n✓ Setup complete! You can now:", "green");
    log("  - Start your backend server", "blue");
    log("  - Test API endpoints with curl or Postman", "blue");
    log("  - Integrate GMB features into your frontend", "blue");
  }

  console.log("");
  separator();
  console.log("");
}

// Run tests
runTests().catch((error) => {
  log(`\n✗ Test runner failed: ${error.message}`, "red");
  console.error(error);
  process.exit(1);
});
