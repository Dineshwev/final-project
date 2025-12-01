/**
 * Complete Google OAuth 2.0 Authentication Flow
 * For Google Business Profile API
 *
 * Run: node google-oauth-complete.js
 * Then open: http://localhost:3005/auth/google
 */

import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, ".env") });

const app = express();
const PORT = 3005;

// OAuth Configuration
const OAUTH_CONFIG = {
  clientId:
    process.env.GOOGLE_CLIENT_ID ||
    "679671394769-8ujh33v8sif1i1n19vuccd0pmt9q2ti8.apps.googleusercontent.com",
  clientSecret:
    process.env.GOOGLE_CLIENT_SECRET || "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",
  redirectUri: "http://localhost:3005/auth/callback", // Use dedicated port for this OAuth server
  scope: "https://www.googleapis.com/auth/business.manage",
  authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://oauth2.googleapis.com/token",
};

// Store tokens (in production, use database)
let tokenStore = {
  accessToken: null,
  refreshToken: process.env.GOOGLE_REFRESH_TOKEN || null,
  expiryDate: null,
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Route 1: GET /auth/google
 * Generates OAuth URL and redirects user to Google login
 */
app.get("/auth/google", (req, res) => {
  console.log("\n🔐 Starting OAuth flow...");

  const authUrl = new URL(OAUTH_CONFIG.authUrl);
  authUrl.searchParams.append("client_id", OAUTH_CONFIG.clientId);
  authUrl.searchParams.append("redirect_uri", OAUTH_CONFIG.redirectUri);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("scope", OAUTH_CONFIG.scope);
  authUrl.searchParams.append("access_type", "offline");
  authUrl.searchParams.append("prompt", "consent");

  console.log("📝 Generated OAuth URL");
  console.log("🌐 Redirecting to Google...");

  res.redirect(authUrl.toString());
});

/**
 * Route 2: GET /auth/callback
 * Receives authorization code from Google and exchanges it for tokens
 */
app.get("/auth/callback", async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    console.error("❌ OAuth error:", error);
    return res.status(400).send(`
      <h1>❌ Authentication Failed</h1>
      <p>Error: ${error}</p>
      <p><a href="/auth/google">Try Again</a></p>
    `);
  }

  if (!code) {
    console.error("❌ No authorization code received");
    return res.status(400).send(`
      <h1>❌ No Authorization Code</h1>
      <p><a href="/auth/google">Start OAuth Flow</a></p>
    `);
  }

  console.log("\n✅ Authorization code received");
  console.log("🔄 Exchanging code for tokens...");

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await axios.post(
      OAUTH_CONFIG.tokenUrl,
      {
        code,
        client_id: OAUTH_CONFIG.clientId,
        client_secret: OAUTH_CONFIG.clientSecret,
        redirect_uri: OAUTH_CONFIG.redirectUri,
        grant_type: "authorization_code",
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token, expires_in, token_type } =
      tokenResponse.data;

    // Store tokens
    tokenStore.accessToken = access_token;
    if (refresh_token) {
      tokenStore.refreshToken = refresh_token;
    }
    tokenStore.expiryDate = Date.now() + expires_in * 1000;

    console.log("\n" + "=".repeat(70));
    console.log("✅ SUCCESS! Tokens received");
    console.log("=".repeat(70));
    console.log("\n📝 Access Token:", access_token.substring(0, 50) + "...");
    if (refresh_token) {
      console.log("📝 Refresh Token:", refresh_token.substring(0, 50) + "...");
      console.log("\n⚠️  IMPORTANT: Add this to your .env file:");
      console.log(`GOOGLE_REFRESH_TOKEN=${refresh_token}`);
    }
    console.log("⏰ Expires in:", expires_in, "seconds");
    console.log("🔑 Token Type:", token_type);
    console.log("\n" + "=".repeat(70));

    // Send success page
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>✅ Authentication Successful</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
              max-width: 900px;
              margin: 50px auto;
              padding: 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            }
            .success {
              background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
              color: white;
              padding: 30px;
              border-radius: 8px;
              margin-bottom: 30px;
              text-align: center;
            }
            .success h1 {
              margin: 0 0 10px 0;
              font-size: 32px;
            }
            .token-section {
              background: #f8f9fa;
              padding: 25px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #11998e;
            }
            .token-section h3 {
              margin-top: 0;
              color: #333;
            }
            .token-box {
              background: white;
              padding: 15px;
              border-radius: 6px;
              font-family: 'Courier New', monospace;
              font-size: 12px;
              word-break: break-all;
              border: 2px solid #dee2e6;
              margin: 10px 0;
              position: relative;
            }
            .copy-btn {
              background: #11998e;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
              margin-top: 10px;
            }
            .copy-btn:hover {
              background: #0d7a6f;
            }
            .instructions {
              background: #fff3cd;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #ffc107;
              margin: 20px 0;
            }
            .instructions h3 {
              margin-top: 0;
              color: #856404;
            }
            .instructions ol {
              margin: 10px 0;
              padding-left: 20px;
            }
            .instructions li {
              margin: 8px 0;
            }
            .test-links {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin: 20px 0;
            }
            .test-link {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              border-radius: 8px;
              text-decoration: none;
              text-align: center;
              transition: transform 0.2s;
            }
            .test-link:hover {
              transform: translateY(-2px);
              box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            }
            .info {
              background: #d1ecf1;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #0c5460;
              margin: 15px 0;
            }
            code {
              background: #f8f9fa;
              padding: 2px 6px;
              border-radius: 3px;
              font-family: 'Courier New', monospace;
              font-size: 13px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">
              <h1>✅ Authentication Successful!</h1>
              <p>Your Google Business Profile API tokens have been generated.</p>
            </div>
            
            ${
              refresh_token
                ? `
            <div class="token-section">
              <h3>📝 Your Refresh Token</h3>
              <p>This is the most important token. It never expires!</p>
              <div class="token-box" id="refreshToken">GOOGLE_REFRESH_TOKEN=${refresh_token}</div>
              <button class="copy-btn" onclick="copyToken('refreshToken')">📋 Copy Refresh Token</button>
            </div>
            `
                : ""
            }
            
            <div class="token-section">
              <h3>🔑 Access Token</h3>
              <p>Valid for ${Math.round(
                expires_in / 60
              )} minutes. Use this for API calls.</p>
              <div class="token-box" id="accessToken">${access_token}</div>
              <button class="copy-btn" onclick="copyToken('accessToken')">📋 Copy Access Token</button>
            </div>
            
            <div class="instructions">
              <h3>⚙️ Next Steps</h3>
              <ol>
                <li><strong>Copy the refresh token</strong> from above (click the button)</li>
                <li>Open your <code>backend/.env</code> file</li>
                <li>Find or add the line: <code>GOOGLE_REFRESH_TOKEN=your_refresh_token_here</code></li>
                <li>Replace with the copied refresh token</li>
                <li>Save the file</li>
                <li>Your app can now use the Google Business Profile API!</li>
              </ol>
            </div>
            
            <div class="info">
              <strong>💡 Token Information:</strong>
              <ul style="margin: 10px 0;">
                <li><strong>Access Token:</strong> Used for API calls. Expires in ${Math.round(
                  expires_in / 60
                )} minutes.</li>
                <li><strong>Refresh Token:</strong> Used to get new access tokens. Never expires (unless revoked).</li>
                <li><strong>Token Type:</strong> ${token_type}</li>
              </ul>
            </div>
            
            <h3>🧪 Test Your Authentication</h3>
            <div class="test-links">
              <a href="/refresh-token" class="test-link">
                <div>🔄 Refresh Token</div>
                <small>Get new access token</small>
              </a>
              <a href="/test-accounts" class="test-link">
                <div>📊 Test API</div>
                <small>List your accounts</small>
              </a>
            </div>
            
            <p style="text-align: center; color: #6c757d; margin-top: 30px;">
              <small>The tokens are also displayed in your terminal window.</small>
            </p>
          </div>
          
          <script>
            function copyToken(elementId) {
              const element = document.getElementById(elementId);
              const text = element.textContent;
              navigator.clipboard.writeText(text).then(() => {
                const btn = element.nextElementSibling;
                btn.textContent = '✅ Copied!';
                setTimeout(() => {
                  btn.textContent = btn.textContent.includes('Refresh') ? '📋 Copy Refresh Token' : '📋 Copy Access Token';
                }, 2000);
              });
            }
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("\n❌ Error exchanging code for tokens:");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);

    res.status(500).send(`
      <h1>❌ Token Exchange Failed</h1>
      <p>Error: ${error.message}</p>
      <pre>${JSON.stringify(error.response?.data, null, 2)}</pre>
      <p><a href="/auth/google">Try Again</a></p>
    `);
  }
});

/**
 * Route 3: GET /refresh-token
 * Refreshes the access token using the refresh token
 */
app.get("/refresh-token", async (req, res) => {
  console.log("\n🔄 Refreshing access token...");

  if (!tokenStore.refreshToken) {
    console.error("❌ No refresh token available");
    return res.status(400).json({
      success: false,
      error: "No refresh token available",
      message: "Please authenticate first at /auth/google",
    });
  }

  try {
    const tokenResponse = await axios.post(
      OAUTH_CONFIG.tokenUrl,
      {
        client_id: OAUTH_CONFIG.clientId,
        client_secret: OAUTH_CONFIG.clientSecret,
        refresh_token: tokenStore.refreshToken,
        grant_type: "refresh_token",
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, expires_in, token_type } = tokenResponse.data;

    // Update stored access token
    tokenStore.accessToken = access_token;
    tokenStore.expiryDate = Date.now() + expires_in * 1000;

    console.log("✅ Access token refreshed successfully");
    console.log("📝 New Access Token:", access_token.substring(0, 50) + "...");
    console.log("⏰ Expires in:", expires_in, "seconds");

    res.json({
      success: true,
      message: "Access token refreshed successfully",
      accessToken: access_token,
      expiresIn: expires_in,
      tokenType: token_type,
      expiryDate: new Date(tokenStore.expiryDate).toISOString(),
    });
  } catch (error) {
    console.error("\n❌ Error refreshing token:");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);

    res.status(500).json({
      success: false,
      error: "Failed to refresh token",
      details: error.response?.data || error.message,
    });
  }
});

/**
 * Route 4: GET /test-accounts
 * Example API call: List Google Business Profile accounts
 */
app.get("/test-accounts", async (req, res) => {
  console.log("\n📊 Testing API call: List accounts...");

  if (!tokenStore.accessToken) {
    console.error("❌ No access token available");
    return res.status(400).json({
      success: false,
      error: "No access token available",
      message: "Please authenticate first at /auth/google",
    });
  }

  // Check if token is expired
  if (tokenStore.expiryDate && Date.now() >= tokenStore.expiryDate) {
    console.log("⚠️  Access token expired, refreshing...");

    if (tokenStore.refreshToken) {
      try {
        // Refresh the token
        const tokenResponse = await axios.post(OAUTH_CONFIG.tokenUrl, {
          client_id: OAUTH_CONFIG.clientId,
          client_secret: OAUTH_CONFIG.clientSecret,
          refresh_token: tokenStore.refreshToken,
          grant_type: "refresh_token",
        });

        tokenStore.accessToken = tokenResponse.data.access_token;
        tokenStore.expiryDate =
          Date.now() + tokenResponse.data.expires_in * 1000;
        console.log("✅ Token refreshed automatically");
      } catch (error) {
        console.error("❌ Failed to refresh token");
        return res.status(401).json({
          success: false,
          error: "Token expired and refresh failed",
          message: "Please re-authenticate at /auth/google",
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        error: "Token expired",
        message: "Please re-authenticate at /auth/google",
      });
    }
  }

  try {
    console.log(
      "🔑 Using access token:",
      tokenStore.accessToken.substring(0, 30) + "..."
    );

    // API call to list accounts
    const response = await axios.get(
      "https://mybusinessbusinessinformation.googleapis.com/v1/accounts",
      {
        headers: {
          Authorization: `Bearer ${tokenStore.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const accounts = response.data.accounts || [];

    console.log("\n✅ API call successful!");
    console.log(`📊 Found ${accounts.length} account(s)`);
    accounts.forEach((account, index) => {
      console.log(`\n  Account ${index + 1}:`);
      console.log(`    Name: ${account.name}`);
      console.log(`    Account Name: ${account.accountName || "N/A"}`);
      console.log(`    Type: ${account.type || "N/A"}`);
    });

    res.json({
      success: true,
      message: "Successfully retrieved accounts",
      accountCount: accounts.length,
      accounts: accounts.map((account) => ({
        name: account.name,
        accountName: account.accountName,
        type: account.type,
        role: account.role,
        state: account.state,
      })),
      rawResponse: response.data,
    });
  } catch (error) {
    console.error("\n❌ API call failed:");
    console.error("Status:", error.response?.status);
    console.error("Status Text:", error.response?.statusText);
    console.error("Error:", error.response?.data);

    const statusCode = error.response?.status || 500;
    const errorData = error.response?.data || {};

    res.status(statusCode).json({
      success: false,
      error: "API call failed",
      statusCode,
      message: errorData.error?.message || error.message,
      details: errorData,
      hint:
        statusCode === 401
          ? "Token may be invalid or expired. Try /refresh-token"
          : null,
    });
  }
});

/**
 * Helper Function: Get valid access token (with auto-refresh)
 */
async function getValidAccessToken() {
  // Check if token exists
  if (!tokenStore.accessToken) {
    throw new Error("No access token available. Please authenticate first.");
  }

  // Check if token is expired
  if (tokenStore.expiryDate && Date.now() >= tokenStore.expiryDate) {
    if (!tokenStore.refreshToken) {
      throw new Error("Token expired and no refresh token available.");
    }

    // Refresh the token
    const tokenResponse = await axios.post(OAUTH_CONFIG.tokenUrl, {
      client_id: OAUTH_CONFIG.clientId,
      client_secret: OAUTH_CONFIG.clientSecret,
      refresh_token: tokenStore.refreshToken,
      grant_type: "refresh_token",
    });

    tokenStore.accessToken = tokenResponse.data.access_token;
    tokenStore.expiryDate = Date.now() + tokenResponse.data.expires_in * 1000;
  }

  return tokenStore.accessToken;
}

/**
 * Home route with instructions
 */
app.get("/", (req, res) => {
  const hasRefreshToken = !!tokenStore.refreshToken;
  const hasAccessToken = !!tokenStore.accessToken;
  const tokenExpired =
    tokenStore.expiryDate && Date.now() >= tokenStore.expiryDate;

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Google Business Profile API - OAuth 2.0</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            max-width: 900px;
            margin: 50px auto;
            padding: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          }
          h1 {
            color: #333;
            text-align: center;
            margin-bottom: 10px;
          }
          .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
          }
          .status {
            background: ${
              hasAccessToken && !tokenExpired ? "#d4edda" : "#f8d7da"
            };
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid ${
              hasAccessToken && !tokenExpired ? "#28a745" : "#dc3545"
            };
          }
          .status h3 {
            margin: 0 0 10px 0;
            color: ${hasAccessToken && !tokenExpired ? "#155724" : "#721c24"};
          }
          .links {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 30px 0;
          }
          .link-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 8px;
            text-decoration: none;
            text-align: center;
            transition: transform 0.2s;
            display: block;
          }
          .link-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
          }
          .link-card h3 {
            margin: 0 0 10px 0;
            font-size: 20px;
          }
          .link-card p {
            margin: 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .info-box {
            background: #e7f3ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #2196F3;
          }
          .config {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            margin: 10px 0;
          }
          ul {
            line-height: 1.8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔐 Google Business Profile API</h1>
          <p class="subtitle">OAuth 2.0 Authentication Flow</p>
          
          <div class="status">
            <h3>${
              hasAccessToken && !tokenExpired
                ? "✅ Authenticated"
                : "❌ Not Authenticated"
            }</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Refresh Token: ${
                hasRefreshToken ? "✅ Available" : "❌ Not available"
              }</li>
              <li>Access Token: ${
                hasAccessToken
                  ? tokenExpired
                    ? "⚠️ Expired"
                    : "✅ Valid"
                  : "❌ Not available"
              }</li>
              ${
                tokenStore.expiryDate
                  ? `<li>Expires: ${new Date(
                      tokenStore.expiryDate
                    ).toLocaleString()}</li>`
                  : ""
              }
            </ul>
          </div>
          
          <h2>🚀 Get Started</h2>
          <div class="links">
            <a href="/auth/google" class="link-card">
              <h3>🔑 Authenticate</h3>
              <p>Start OAuth flow</p>
            </a>
            
            <a href="/refresh-token" class="link-card">
              <h3>🔄 Refresh Token</h3>
              <p>Get new access token</p>
            </a>
            
            <a href="/test-accounts" class="link-card">
              <h3>📊 Test API</h3>
              <p>List your accounts</p>
            </a>
          </div>
          
          <div class="info-box">
            <h3>📋 How It Works</h3>
            <ol style="line-height: 1.8;">
              <li>Click <strong>"Authenticate"</strong> to start the OAuth flow</li>
              <li>Login with your Google account that has Google Business Profile access</li>
              <li>Grant permissions to the app</li>
              <li>You'll receive access & refresh tokens</li>
              <li>Copy the refresh token to your <code>.env</code> file</li>
              <li>Test the API with <strong>"Test API"</strong></li>
            </ol>
          </div>
          
          <div class="info-box">
            <h3>⚙️ Configuration</h3>
            <div class="config">
              Client ID: ${OAUTH_CONFIG.clientId.substring(0, 30)}...<br>
              Redirect URI: ${OAUTH_CONFIG.redirectUri}<br>
              Scope: ${OAUTH_CONFIG.scope}
            </div>
          </div>
          
          <div class="info-box">
            <h3>📚 API Endpoints</h3>
            <ul>
              <li><code>GET /</code> - This page</li>
              <li><code>GET /auth/google</code> - Start OAuth flow</li>
              <li><code>GET /auth/callback</code> - OAuth callback (automatic)</li>
              <li><code>GET /refresh-token</code> - Refresh access token</li>
              <li><code>GET /test-accounts</code> - List Business Profile accounts</li>
            </ul>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("❌ Unhandled error:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: error.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log("\n" + "=".repeat(70));
  console.log("🚀 Google Business Profile API - OAuth 2.0 Server");
  console.log("=".repeat(70));
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log("\n📋 Available routes:");
  console.log(`   🏠 Home:           http://localhost:${PORT}/`);
  console.log(`   🔑 Authenticate:   http://localhost:${PORT}/auth/google`);
  console.log(`   🔄 Refresh Token:  http://localhost:${PORT}/refresh-token`);
  console.log(`   📊 Test API:       http://localhost:${PORT}/test-accounts`);
  console.log("\n⚙️  Configuration:");
  console.log(`   Client ID:     ${OAUTH_CONFIG.clientId.substring(0, 40)}...`);
  console.log(`   Redirect URI:  ${OAUTH_CONFIG.redirectUri}`);
  console.log(`   Scope:         ${OAUTH_CONFIG.scope}`);
  if (tokenStore.refreshToken) {
    console.log(`   ✅ Refresh Token: Loaded from .env`);
  } else {
    console.log(
      `   ⚠️  Refresh Token: Not found (will be generated on first auth)`
    );
  }
  console.log("\n💡 To get started:");
  console.log(
    `   1. Open http://localhost:${PORT}/auth/google in your browser`
  );
  console.log(`   2. Login with Google and grant permissions`);
  console.log(`   3. Copy the refresh token to your .env file`);
  console.log(`   4. Test the API at http://localhost:${PORT}/test-accounts`);
  console.log("\n" + "=".repeat(70) + "\n");
});

// Export for use in other modules
export { tokenStore, getValidAccessToken, OAUTH_CONFIG };
