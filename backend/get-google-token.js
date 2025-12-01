/**
 * Google OAuth2 Token Generator
 * Helps you get the refresh token for Google My Business API
 */

import express from "express";
import open from "open";
import { google } from "googleapis";

// Load your credentials from .env
const CLIENT_ID =
  "679671394769-8ujh33v8sif1i1n19vuccd0pmt9q2ti8.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "http://localhost:3005/callback";

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Create Express server to handle callback
const app = express();
const PORT = 3005;

console.log("\n🔐 Google OAuth2 Token Generator");
console.log("=".repeat(70));
console.log("\n📋 This will help you get your Google refresh token\n");

// Step 1: Generate authorization URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/business.manage"],
  prompt: "consent",
});

console.log("📝 Step 1: Authorization URL generated");
console.log("\n🌐 Opening your browser to authenticate...\n");
console.log("If browser doesn't open, copy this URL:\n");
console.log(authUrl);
console.log("\n");

// Step 2: Handle callback
app.get("/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    res.send("❌ Error: No authorization code received");
    return;
  }

  try {
    console.log("\n✅ Authorization code received!");
    console.log("🔄 Exchanging code for tokens...\n");

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    console.log("=".repeat(70));
    console.log("✅ SUCCESS! Your tokens:");
    console.log("=".repeat(70));
    console.log("\n📝 REFRESH TOKEN (add this to your .env file):");
    console.log("\nGOOGLE_REFRESH_TOKEN=" + tokens.refresh_token);
    console.log("\n");
    console.log("Other tokens (for reference):");
    console.log("Access Token:", tokens.access_token);
    console.log("Token Type:", tokens.token_type);
    console.log("Expiry Date:", new Date(tokens.expiry_date).toLocaleString());
    console.log("\n" + "=".repeat(70));

    // Send success page
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 50px auto;
              padding: 20px;
              background: #f5f5f5;
            }
            .success {
              background: #4CAF50;
              color: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .token-box {
              background: white;
              padding: 20px;
              border-radius: 8px;
              border: 2px solid #4CAF50;
              margin: 20px 0;
            }
            .token {
              background: #f9f9f9;
              padding: 10px;
              border-radius: 4px;
              font-family: monospace;
              word-break: break-all;
              margin: 10px 0;
            }
            .instructions {
              background: #fff3cd;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #ffc107;
            }
          </style>
        </head>
        <body>
          <div class="success">
            <h1>✅ Authentication Successful!</h1>
            <p>Your Google refresh token has been generated.</p>
          </div>
          
          <div class="token-box">
            <h2>📝 Your Refresh Token:</h2>
            <div class="token">
              <strong>GOOGLE_REFRESH_TOKEN=</strong>${tokens.refresh_token}
            </div>
          </div>
          
          <div class="instructions">
            <h3>⚙️ Next Steps:</h3>
            <ol>
              <li>Copy the refresh token shown above</li>
              <li>Open your <code>backend/.env</code> file</li>
              <li>Replace the value of <code>GOOGLE_REFRESH_TOKEN</code> with the token above</li>
              <li>Save the file</li>
              <li>Restart your server</li>
            </ol>
          </div>
          
          <p><strong>Note:</strong> The token is also displayed in your terminal window.</p>
          
          <p style="margin-top: 30px;">
            <em>You can close this window now.</em>
          </p>
        </body>
      </html>
    `);

    console.log("\n💡 Next steps:");
    console.log("   1. Copy the GOOGLE_REFRESH_TOKEN from above");
    console.log("   2. Add it to your backend/.env file");
    console.log("   3. Save the file and restart your server\n");

    // Close server after 30 seconds
    setTimeout(() => {
      console.log("Closing server...");
      process.exit(0);
    }, 30000);
  } catch (error) {
    console.error("\n❌ Error getting tokens:", error.message);
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Error</title></head>
        <body>
          <h1>❌ Error</h1>
          <p>${error.message}</p>
          <p>Check your terminal for more details.</p>
        </body>
      </html>
    `);
  }
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
  console.log("\n🚀 Opening browser for authentication...\n");

  // Open browser after a short delay
  setTimeout(() => {
    open(authUrl).catch((err) => {
      console.log("⚠️  Could not open browser automatically");
      console.log("   Please copy the URL above and paste it in your browser");
    });
  }, 1000);
});

// Handle errors
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n❌ Error: Port ${PORT} is already in use`);
    console.error("   Please stop the other server first or change the port\n");
  } else {
    console.error("\n❌ Server error:", err.message);
  }
  process.exit(1);
});

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n\n👋 Process interrupted. Closing server...\n");
  server.close();
  process.exit(0);
});
