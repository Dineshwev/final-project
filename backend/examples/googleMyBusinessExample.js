/**
 * Google My Business API - Usage Examples
 *
 * Prerequisites:
 * 1. Install googleapis: npm install googleapis
 * 2. Set up Google Cloud Project at console.cloud.google.com
 * 3. Enable Google My Business APIs
 * 4. Create OAuth2 credentials
 * 5. Add credentials to .env file
 *
 * Required .env variables:
 * GOOGLE_CLIENT_ID=your_client_id_here
 * GOOGLE_CLIENT_SECRET=your_client_secret_here
 * GOOGLE_REDIRECT_URI=http://localhost:3002/api/gmb/callback
 * GOOGLE_REFRESH_TOKEN=your_refresh_token_here (obtained after first auth)
 */

import * as gmbService from "../services/googleMyBusinessService.js";

/**
 * Example 1: Authentication Flow
 * Run this first to get your refresh token
 */
async function exampleAuthentication() {
  console.log("\n===== AUTHENTICATION EXAMPLE =====\n");

  try {
    // Step 1: Get authorization URL
    console.log("Step 1: Getting authorization URL...");
    const authResult = await gmbService.authenticateGMB();

    if (authResult.success) {
      console.log("✓ Authorization URL generated");
      console.log("\nVisit this URL to authorize:");
      console.log(authResult.authUrl);
      console.log("\nAfter authorization, you will receive a code.");
      console.log("Use that code in Step 2 below.\n");
    }

    // Step 2: Exchange code for tokens (uncomment and add your code)
    /*
    const code = 'YOUR_AUTHORIZATION_CODE_HERE';
    console.log('Step 2: Exchanging code for tokens...');
    const tokenResult = await gmbService.authenticateGMB(code);
    
    if (tokenResult.success) {
      console.log('✓ Authentication successful!');
      console.log('\nRefresh Token:', tokenResult.tokens.refresh_token);
      console.log('\nAdd this to your .env file:');
      console.log(`GOOGLE_REFRESH_TOKEN=${tokenResult.tokens.refresh_token}`);
    }
    */
  } catch (error) {
    console.error("✗ Authentication failed:", error.message);
  }
}

/**
 * Example 2: Get Business Information
 */
async function exampleGetBusinessInfo() {
  console.log("\n===== GET BUSINESS INFO EXAMPLE =====\n");

  // Replace with your actual account and location IDs
  const accountId = "YOUR_ACCOUNT_ID";
  const locationId = "YOUR_LOCATION_ID";

  try {
    console.log("Fetching business information...");
    const result = await gmbService.getBusinessInfo(accountId, locationId);

    if (result.success) {
      console.log("✓ Business information retrieved successfully!\n");
      console.log("Business Name:", result.data.name);
      console.log("Phone:", result.data.phoneNumber);
      console.log("Website:", result.data.website);
      console.log("\nAddress:");
      console.log("  Street:", result.data.address.streetAddress);
      console.log("  City:", result.data.address.locality);
      console.log("  State:", result.data.address.region);
      console.log("  ZIP:", result.data.address.postalCode);
      console.log("\nCategories:");
      console.log("  Primary:", result.data.categories.primary);
      console.log(
        "  Additional:",
        result.data.categories.additional.join(", ")
      );
      console.log(
        "\nRegular Hours:",
        result.data.regularHours.length,
        "periods"
      );
    } else {
      console.error("✗ Failed to get business info:", result.error);
    }
  } catch (error) {
    console.error("✗ Error:", error.message);
  }
}

/**
 * Example 3: Get Business Reviews
 */
async function exampleGetBusinessReviews() {
  console.log("\n===== GET BUSINESS REVIEWS EXAMPLE =====\n");

  const accountId = "YOUR_ACCOUNT_ID";
  const locationId = "YOUR_LOCATION_ID";
  const pageSize = 10; // Get 10 most recent reviews

  try {
    console.log("Fetching business reviews...");
    const result = await gmbService.getBusinessReviews(
      accountId,
      locationId,
      pageSize
    );

    if (result.success) {
      console.log("✓ Reviews retrieved successfully!\n");
      console.log("Total Reviews:", result.data.totalReviews);
      console.log("Average Rating:", result.data.averageRating, "⭐");
      console.log("\nRecent Reviews:");

      result.data.reviews.slice(0, 3).forEach((review, index) => {
        console.log(`\n${index + 1}. ${review.reviewer.displayName}`);
        console.log("   Rating:", "⭐".repeat(review.starRating));
        console.log("   Comment:", review.comment || "(No comment)");
        console.log(
          "   Date:",
          new Date(review.createTime).toLocaleDateString()
        );

        if (review.reviewReply) {
          console.log("   Reply:", review.reviewReply.comment);
        }
      });
    } else {
      console.error("✗ Failed to get reviews:", result.error);
      if (result.note) {
        console.log("Note:", result.note);
      }
    }
  } catch (error) {
    console.error("✗ Error:", error.message);
  }
}

/**
 * Example 4: Get Business Insights
 */
async function exampleGetBusinessInsights() {
  console.log("\n===== GET BUSINESS INSIGHTS EXAMPLE =====\n");

  const accountId = "YOUR_ACCOUNT_ID";
  const locationId = "YOUR_LOCATION_ID";

  // Get insights for the last 30 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const startDateStr = startDate.toISOString().split("T")[0];
  const endDateStr = endDate.toISOString().split("T")[0];

  try {
    console.log(`Fetching insights from ${startDateStr} to ${endDateStr}...`);
    const result = await gmbService.getBusinessInsights(
      accountId,
      locationId,
      startDateStr,
      endDateStr
    );

    if (result.success) {
      console.log("✓ Insights retrieved successfully!\n");

      const insights = result.data;

      console.log("Search Views:");
      console.log("  Direct:", insights.searchViews.direct);
      console.log("  Indirect:", insights.searchViews.indirect);
      console.log("  Total:", insights.searchViews.total);

      console.log("\nMap Views:", insights.mapViews);
      console.log("Search Impressions:", insights.searchImpressions);

      console.log("\nCustomer Actions:");
      console.log("  Website Clicks:", insights.actions.websiteClicks);
      console.log("  Phone Clicks:", insights.actions.phoneClicks);
      console.log("  Direction Requests:", insights.actions.directionsRequests);
      console.log("  Total:", insights.actions.total);

      if (insights.note) {
        console.log("\nNote:", insights.note);
      }
    } else {
      console.error("✗ Failed to get insights:", result.error);
      if (result.note) {
        console.log("Note:", result.note);
      }
    }
  } catch (error) {
    console.error("✗ Error:", error.message);
  }
}

/**
 * Example 5: Update Business Information
 */
async function exampleUpdateBusinessInfo() {
  console.log("\n===== UPDATE BUSINESS INFO EXAMPLE =====\n");

  const accountId = "YOUR_ACCOUNT_ID";
  const locationId = "YOUR_LOCATION_ID";

  const updateData = {
    title: "My Updated Business Name",
    phoneNumber: "+1-555-123-4567",
    websiteUri: "https://www.mynewwebsite.com",
    description:
      "Updated business description with new information about our services.",
  };

  try {
    console.log("Updating business information...");
    const result = await gmbService.updateBusinessInfo(
      accountId,
      locationId,
      updateData
    );

    if (result.success) {
      console.log("✓ Business information updated successfully!\n");
      console.log("Updated Fields:", result.data.updatedFields.join(", "));
      console.log("Location:", result.data.locationName);
    } else {
      console.error("✗ Failed to update business info:", result.error);
    }
  } catch (error) {
    console.error("✗ Error:", error.message);
  }
}

/**
 * Example 6: Check Rate Limit Status
 */
async function exampleRateLimitStatus() {
  console.log("\n===== RATE LIMIT STATUS EXAMPLE =====\n");

  try {
    const status = gmbService.getRateLimitStatus();

    console.log("Rate Limit Status:");
    console.log("  Requests Used:", status.requestsUsed);
    console.log("  Requests Remaining:", status.requestsRemaining);
    console.log("  Max Requests:", status.maxRequests);
    console.log("  Reset Time:", new Date(status.resetTime).toLocaleString());

    const percentUsed = (
      (status.requestsUsed / status.maxRequests) *
      100
    ).toFixed(2);
    console.log(`  Usage: ${percentUsed}%`);

    if (status.requestsRemaining < 100) {
      console.log("\n⚠️  Warning: Low on API quota!");
    }
  } catch (error) {
    console.error("✗ Error:", error.message);
  }
}

/**
 * Example 7: Complete Workflow
 * Demonstrates a typical usage scenario
 */
async function exampleCompleteWorkflow() {
  console.log("\n===== COMPLETE WORKFLOW EXAMPLE =====\n");

  const accountId = "YOUR_ACCOUNT_ID";
  const locationId = "YOUR_LOCATION_ID";

  try {
    // 1. Check rate limit
    console.log("1. Checking rate limit...");
    const rateLimitStatus = gmbService.getRateLimitStatus();
    console.log(`   Requests remaining: ${rateLimitStatus.requestsRemaining}`);

    if (rateLimitStatus.requestsRemaining < 10) {
      console.log("   ⚠️  Low on API quota, skipping workflow");
      return;
    }

    // 2. Get business info
    console.log("\n2. Getting business information...");
    const businessInfo = await gmbService.getBusinessInfo(
      accountId,
      locationId
    );
    if (businessInfo.success) {
      console.log(`   ✓ Business: ${businessInfo.data.name}`);
    }

    // 3. Get reviews
    console.log("\n3. Getting business reviews...");
    const reviews = await gmbService.getBusinessReviews(
      accountId,
      locationId,
      5
    );
    if (reviews.success) {
      console.log(`   ✓ Found ${reviews.data.totalReviews} reviews`);
      console.log(`   ✓ Average rating: ${reviews.data.averageRating} ⭐`);
    }

    // 4. Get insights
    console.log("\n4. Getting business insights...");
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const insights = await gmbService.getBusinessInsights(
      accountId,
      locationId,
      startDate,
      endDate
    );

    if (insights.success) {
      console.log(
        `   ✓ Total search views: ${insights.data.searchViews.total}`
      );
      console.log(`   ✓ Total actions: ${insights.data.actions.total}`);
    }

    console.log("\n✅ Workflow completed successfully!");
  } catch (error) {
    console.error("✗ Workflow failed:", error.message);
  }
}

// Main execution
async function main() {
  console.log("=".repeat(60));
  console.log("GOOGLE MY BUSINESS API - USAGE EXAMPLES");
  console.log("=".repeat(60));

  // Uncomment the examples you want to run:

  // await exampleAuthentication();
  // await exampleGetBusinessInfo();
  // await exampleGetBusinessReviews();
  // await exampleGetBusinessInsights();
  // await exampleUpdateBusinessInfo();
  // await exampleRateLimitStatus();
  // await exampleCompleteWorkflow();

  console.log("\n" + "=".repeat(60));
  console.log("Examples completed!");
  console.log("=".repeat(60) + "\n");
}

// Run examples if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  exampleAuthentication,
  exampleGetBusinessInfo,
  exampleGetBusinessReviews,
  exampleGetBusinessInsights,
  exampleUpdateBusinessInfo,
  exampleRateLimitStatus,
  exampleCompleteWorkflow,
};
