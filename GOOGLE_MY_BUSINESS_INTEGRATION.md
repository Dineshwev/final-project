# Google My Business API Integration

## 📋 Overview

Complete Node.js integration with Google My Business API v4.9 providing OAuth2 authentication, business information retrieval, reviews management, insights analytics, and business updates.

## ✨ Features

- ✅ **OAuth2 Authentication** - Secure authentication with Google Cloud credentials
- ✅ **Business Information** - Fetch name, address, phone, categories, hours
- ✅ **Reviews Management** - Get reviews with ratings and comments
- ✅ **Business Insights** - Analytics for views, searches, and customer actions
- ✅ **Update Business** - Modify business details programmatically
- ✅ **Rate Limiting** - Built-in protection (1500 requests/day)
- ✅ **Error Handling** - Comprehensive error handling with detailed messages
- ✅ **JSDoc Documentation** - Full documentation for all functions

## 📦 Installation

### 1. Install Dependencies

```bash
npm install googleapis dotenv
```

### 2. Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the following APIs:
   - **Google My Business API**
   - **Business Profile Performance API** (for insights)
   - **My Business Business Information API**
   - **My Business Account Management API**

### 3. Create OAuth2 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application**
4. Add authorized redirect URI: `http://localhost:3002/api/gmb/callback`
5. Save **Client ID** and **Client Secret**

### 4. Configure Environment Variableshttps://health-4c77c.firebaseapp.com/__/auth/handler

http://localhost:5173/**/auth/handler
http://localhost:3000/**/auth/handler

Add to your `.env` file:

```env
# Google My Business API Credentials
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3002/api/gmb/callback
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
```

## 🔐 Authentication Setup

### Step 1: Get Authorization URL

```javascript
import * as gmbService from "./services/googleMyBusinessService.js";

const authResult = await gmbService.authenticateGMB();
console.log("Visit this URL:", authResult.authUrl);
```

### Step 2: Authorize and Get Code

1. Visit the authorization URL in your browser
2. Sign in with your Google account that has GMB access
3. Grant permissions
4. Copy the authorization code from the redirect URL

### Step 3: Exchange Code for Tokens

```javascript
const code = "YOUR_AUTHORIZATION_CODE";
const tokenResult = await gmbService.authenticateGMB(code);
console.log("Refresh Token:", tokenResult.tokens.refresh_token);
```

### Step 4: Save Refresh Token

Add the refresh token to your `.env` file:

```env
GOOGLE_REFRESH_TOKEN=1//0g...your_refresh_token_here
```

## 🚀 Usage Examples

### Get Business Information

```javascript
import * as gmbService from "./services/googleMyBusinessService.js";

const accountId = "1234567890";
const locationId = "0987654321";

const result = await gmbService.getBusinessInfo(accountId, locationId);

if (result.success) {
  console.log("Business Name:", result.data.name);
  console.log("Phone:", result.data.phoneNumber);
  console.log("Address:", result.data.address);
  console.log("Categories:", result.data.categories);
  console.log("Hours:", result.data.regularHours);
}
```

**Response Example:**

```json
{
  "success": true,
  "data": {
    "name": "My Awesome Business",
    "locationName": "accounts/1234567890/locations/0987654321",
    "address": {
      "streetAddress": "123 Main St",
      "locality": "San Francisco",
      "region": "CA",
      "postalCode": "94102",
      "country": "US"
    },
    "phoneNumber": "+1-415-555-1234",
    "website": "https://www.myawesomebusiness.com",
    "categories": {
      "primary": "Restaurant",
      "additional": ["Italian Restaurant", "Pizza Place"]
    },
    "regularHours": [
      {
        "openDay": "MONDAY",
        "openTime": "09:00",
        "closeDay": "MONDAY",
        "closeTime": "17:00"
      }
    ]
  },
  "timestamp": "2025-11-14T10:30:00.000Z"
}
```

### Get Business Reviews

```javascript
const result = await gmbService.getBusinessReviews(accountId, locationId, 10);

if (result.success) {
  console.log("Total Reviews:", result.data.totalReviews);
  console.log("Average Rating:", result.data.averageRating);

  result.data.reviews.forEach((review) => {
    console.log(`${review.reviewer.displayName}: ${review.starRating}⭐`);
    console.log(`Comment: ${review.comment}`);
  });
}
```

**Response Example:**

```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "reviewId": "abc123",
        "reviewer": {
          "displayName": "John Doe",
          "profilePhotoUrl": "https://...",
          "isAnonymous": false
        },
        "starRating": 5,
        "comment": "Excellent service!",
        "createTime": "2025-11-10T15:30:00Z",
        "updateTime": "2025-11-10T15:30:00Z",
        "reviewReply": {
          "comment": "Thank you for your feedback!",
          "updateTime": "2025-11-11T09:00:00Z"
        }
      }
    ],
    "averageRating": 4.5,
    "totalReviews": 150
  },
  "timestamp": "2025-11-14T10:30:00.000Z"
}
```

### Get Business Insights

```javascript
const startDate = "2025-10-01";
const endDate = "2025-10-31";

const result = await gmbService.getBusinessInsights(
  accountId,
  locationId,
  startDate,
  endDate
);

if (result.success) {
  console.log("Search Views:", result.data.searchViews);
  console.log("Map Views:", result.data.mapViews);
  console.log("Actions:", result.data.actions);
}
```

**Response Example:**

```json
{
  "success": true,
  "data": {
    "locationName": "accounts/1234567890/locations/0987654321",
    "dateRange": {
      "startDate": "2025-10-01",
      "endDate": "2025-10-31"
    },
    "searchViews": {
      "direct": 1200,
      "indirect": 800,
      "total": 2000
    },
    "mapViews": 1500,
    "searchImpressions": 5000,
    "actions": {
      "websiteClicks": 450,
      "phoneClicks": 230,
      "directionsRequests": 180,
      "total": 860
    }
  },
  "timestamp": "2025-11-14T10:30:00.000Z"
}
```

### Update Business Information

```javascript
const updateData = {
  title: "New Business Name",
  phoneNumber: "+1-415-555-9999",
  websiteUri: "https://www.newwebsite.com",
  description: "Updated business description",
};

const result = await gmbService.updateBusinessInfo(
  accountId,
  locationId,
  updateData
);

if (result.success) {
  console.log("Updated fields:", result.data.updatedFields);
}
```

### Check Rate Limit Status

```javascript
const status = gmbService.getRateLimitStatus();

console.log("Requests Used:", status.requestsUsed);
console.log("Requests Remaining:", status.requestsRemaining);
console.log("Reset Time:", status.resetTime);
```

## 🌐 API Endpoints

### Authentication

```
GET /api/gmb/auth
GET /api/gmb/auth?code=AUTHORIZATION_CODE
```

### Business Information

```
GET /api/gmb/business/:accountId/:locationId
```

### Reviews

```
GET /api/gmb/reviews/:accountId/:locationId?pageSize=10
```

### Insights

```
GET /api/gmb/insights/:accountId/:locationId?startDate=2025-01-01&endDate=2025-01-31
```

### Update Business

```
PATCH /api/gmb/business/:accountId/:locationId
Content-Type: application/json

{
  "title": "New Business Name",
  "phoneNumber": "+1-415-555-9999"
}
```

### Rate Limit

```
GET /api/gmb/rate-limit
```

## 📊 Rate Limiting

The module includes built-in rate limiting:

- **Maximum**: 1500 requests per day
- **Reset**: Every 24 hours
- **Tracking**: Automatic with timestamp-based cleanup
- **Protection**: Returns error when limit exceeded

```javascript
// Check rate limit before making requests
const status = gmbService.getRateLimitStatus();

if (status.requestsRemaining < 10) {
  console.warn("Low on API quota!");
}
```

## 🔧 Integration with Backend

### 1. Add Route to `server.js`

```javascript
import gmbRoutes from "./routes/googleMyBusiness.js";

// Add GMB routes
app.use("/api/gmb", gmbRoutes);
```

### 2. Test the Integration

Start your server:

```bash
cd backend
node server.js
```

Test authentication:

```bash
curl http://localhost:3002/api/gmb/auth
```

## 📝 Finding Account and Location IDs

### Method 1: Using GMB API

```javascript
const mybusiness = google.mybusinessaccountmanagement("v1");

// List accounts
const accounts = await mybusiness.accounts.list({
  auth: oauth2Client,
});

console.log("Accounts:", accounts.data.accounts);

// List locations for an account
const locations = await mybusiness.accounts.locations.list({
  auth: oauth2Client,
  parent: `accounts/${accountId}`,
});

console.log("Locations:", locations.data.locations);
```

### Method 2: From GMB Dashboard

1. Go to [Google My Business](https://business.google.com)
2. Select your business
3. Look at the URL: `business.google.com/locations/LOCATION_ID/dashboard`

## ⚠️ Important Notes

### API Deprecations

- **Insights API**: The legacy Insights API has been deprecated. Google recommends migrating to the **Business Profile Performance API**.
- **Reviews API**: Requires special permissions. Contact Google to enable review access.

### Permissions Required

Your OAuth2 scopes need:

- `https://www.googleapis.com/auth/business.manage`
- `https://www.googleapis.com/auth/plus.business.manage`

### Error Handling

All functions return structured error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": { ... },
  "note": "Additional information"
}
```

## 🧪 Testing

Run the example file:

```bash
node backend/examples/googleMyBusinessExample.js
```

Uncomment the examples you want to test in the `main()` function.

## 📚 Documentation References

- [Google My Business API Documentation](https://developers.google.com/my-business)
- [googleapis npm package](https://www.npmjs.com/package/googleapis)
- [OAuth2 Authentication](https://developers.google.com/identity/protocols/oauth2)
- [Business Profile Performance API](https://developers.google.com/my-business/content/review-data)

## 🐛 Troubleshooting

### "Rate limit exceeded"

- Wait for the 24-hour reset
- Check `getRateLimitStatus()` before making requests

### "Authentication failed"

- Verify credentials in `.env` file
- Ensure refresh token is valid
- Re-run authentication flow if needed

### "Reviews API access denied"

- Contact Google to enable review API access
- Verify your account has proper permissions

### "Invalid account or location ID"

- Use the correct format: numeric strings
- Verify IDs using the list methods

## 📄 Files Created

```
backend/
├── services/
│   └── googleMyBusinessService.js (600+ lines)
├── controllers/
│   └── googleMyBusinessController.js (200+ lines)
├── routes/
│   └── googleMyBusiness.js (80+ lines)
└── examples/
    └── googleMyBusinessExample.js (400+ lines)
```

## ✅ Features Checklist

- ✅ OAuth2 authentication with Google Cloud
- ✅ Get business information (name, address, phone, categories, hours)
- ✅ Fetch business reviews with ratings
- ✅ Get business insights (views, searches, actions)
- ✅ Update business information
- ✅ Rate limiting (1500 requests/day)
- ✅ Structured JSON responses
- ✅ Error handling with detailed messages
- ✅ JSDoc comments for all functions
- ✅ Example usage with environment variables
- ✅ Complete API documentation

## 🚀 Status

**Status**: ✅ **Production Ready**

The Google My Business API integration is fully implemented and ready to use!
