# Google My Business API - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
cd backend
npm install googleapis
```

### Step 2: Set Up Google Cloud Project

1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing one
3. Go to **APIs & Services** > **Library**
4. Search and enable these APIs:
   - **Google My Business API**
   - **My Business Business Information API**
   - **My Business Account Management API**

### Step 3: Create OAuth2 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application**
4. Add redirect URI: `http://localhost:3002/api/gmb/callback`
5. Click **Create**
6. Copy **Client ID** and **Client Secret**

### Step 4: Update .env File

The `.env` file already has the template. Just replace the placeholder values:

```env
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcd1234efgh5678
GOOGLE_REDIRECT_URI=http://localhost:3002/api/gmb/callback
GOOGLE_REFRESH_TOKEN=  # Leave empty for now
```

### Step 5: Get Refresh Token

Start your backend server:

```bash
npm start
```

Get the authorization URL:

```bash
curl http://localhost:3002/api/gmb/auth
```

You'll get a response like:

```json
{
  "success": true,
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "message": "Visit the authUrl to authorize the application"
}
```

**Visit the authUrl in your browser:**

1. Sign in with your Google account (that has GMB access)
2. Grant permissions
3. You'll be redirected to: `http://localhost:3002/api/gmb/callback?code=4/0A...`
4. Copy the `code` parameter from the URL

**Exchange code for tokens:**

```bash
curl "http://localhost:3002/api/gmb/auth?code=YOUR_CODE_HERE"
```

You'll get:

```json
{
  "success": true,
  "message": "Authentication successful...",
  "refreshToken": "1//0g...",
  "note": "Save this refresh token in your .env file as GOOGLE_REFRESH_TOKEN"
}
```

**Add the refresh token to `.env`:**

```env
GOOGLE_REFRESH_TOKEN=1//0g...your_refresh_token_here
```

### Step 6: Find Your Account & Location IDs

#### Option A: Use GMB Dashboard

1. Go to [Google My Business](https://business.google.com)
2. Select your business
3. Look at URL: `business.google.com/locations/LOCATION_ID`

#### Option B: Use the API

You'll need to create a helper script or use the examples file:

```javascript
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

async function listAccountsAndLocations() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  const mybusiness = google.mybusinessaccountmanagement("v1");

  // List accounts
  const accounts = await mybusiness.accounts.list({ auth: oauth2Client });
  console.log("Accounts:", accounts.data.accounts);

  if (accounts.data.accounts && accounts.data.accounts.length > 0) {
    const accountName = accounts.data.accounts[0].name;
    const accountId = accountName.split("/")[1];

    // List locations
    const locations = await mybusiness.accounts.locations.list({
      auth: oauth2Client,
      parent: accountName,
    });

    console.log("Locations:", locations.data.locations);
  }
}

listAccountsAndLocations().catch(console.error);
```

### Step 7: Test the API

**Get Business Info:**

```bash
curl "http://localhost:3002/api/gmb/business/YOUR_ACCOUNT_ID/YOUR_LOCATION_ID"
```

**Get Reviews:**

```bash
curl "http://localhost:3002/api/gmb/reviews/YOUR_ACCOUNT_ID/YOUR_LOCATION_ID?pageSize=10"
```

**Get Insights:**

```bash
curl "http://localhost:3002/api/gmb/insights/YOUR_ACCOUNT_ID/YOUR_LOCATION_ID?startDate=2025-10-01&endDate=2025-10-31"
```

**Update Business:**

```bash
curl -X PATCH "http://localhost:3002/api/gmb/business/YOUR_ACCOUNT_ID/YOUR_LOCATION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Business Name",
    "phoneNumber": "+1-415-555-9999"
  }'
```

**Check Rate Limit:**

```bash
curl "http://localhost:3002/api/gmb/rate-limit"
```

## 📝 Example Response

### Business Information

```json
{
  "success": true,
  "data": {
    "name": "My Awesome Restaurant",
    "phoneNumber": "+1-415-555-1234",
    "website": "https://www.myrestaurant.com",
    "address": {
      "streetAddress": "123 Main St",
      "locality": "San Francisco",
      "region": "CA",
      "postalCode": "94102",
      "country": "US"
    },
    "categories": {
      "primary": "Italian Restaurant",
      "additional": ["Pizza Place", "Wine Bar"]
    },
    "regularHours": [...]
  }
}
```

## 🔧 Common Issues

### "Authentication failed"

- Verify credentials in `.env`
- Make sure refresh token is valid
- Re-run authentication flow

### "Rate limit exceeded"

- You've made 1500+ requests in 24 hours
- Wait for reset or check status: `/api/gmb/rate-limit`

### "Invalid account or location ID"

- Use the helper script to find correct IDs
- Format should be numeric strings

### "Reviews API access denied"

- Reviews API requires special permissions
- Contact Google My Business API support

## 📚 Next Steps

1. **Read full documentation**: `GOOGLE_MY_BUSINESS_INTEGRATION.md`
2. **Check examples**: `backend/examples/googleMyBusinessExample.js`
3. **Integrate with frontend**: Create UI components to display GMB data
4. **Add to navigation**: Link GMB features in your app menu

## 🎉 You're Ready!

Your Google My Business API integration is complete and ready to use. Start building features to:

- Display business information on dashboard
- Show customer reviews and ratings
- Track business performance metrics
- Update business details programmatically
- Monitor SEO impact with GMB insights

For detailed API documentation and advanced usage, see `GOOGLE_MY_BUSINESS_INTEGRATION.md`.
