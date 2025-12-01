# 🚀 Quick Reference - Google My Business API

## 📦 Installation

```bash
cd backend
npm install googleapis
```

## ⚙️ Setup (.env)

```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3002/api/gmb/callback
GOOGLE_REFRESH_TOKEN=your_refresh_token
```

## 🔑 Authentication

```bash
# Get auth URL
curl http://localhost:3002/api/gmb/auth

# Exchange code for token
curl "http://localhost:3002/api/gmb/auth?code=YOUR_CODE"
```

## 📡 API Endpoints

```bash
# Get Business Info
GET /api/gmb/business/:accountId/:locationId

# Get Reviews
GET /api/gmb/reviews/:accountId/:locationId?pageSize=10

# Get Insights
GET /api/gmb/insights/:accountId/:locationId?startDate=2025-01-01&endDate=2025-01-31

# Update Business
PATCH /api/gmb/business/:accountId/:locationId

# Rate Limit Status
GET /api/gmb/rate-limit
```

## 🧪 Test Integration

```bash
node backend/tests/testGoogleMyBusiness.js
```

## 📖 Full Documentation

- **Quick Start**: `GOOGLE_MY_BUSINESS_QUICK_START.md`
- **Complete Guide**: `GOOGLE_MY_BUSINESS_INTEGRATION.md`
- **Implementation**: `GMB_IMPLEMENTATION_COMPLETE.md`
- **Examples**: `backend/examples/googleMyBusinessExample.js`

## ✅ Features

- ✅ OAuth2 authentication
- ✅ Get business information
- ✅ Fetch reviews & ratings
- ✅ Business insights/analytics
- ✅ Update business details
- ✅ Rate limiting (1500/day)
- ✅ Error handling
- ✅ Full JSDoc documentation

## 🆘 Support

Check the documentation files above or visit:

- [Google My Business API Docs](https://developers.google.com/my-business)
