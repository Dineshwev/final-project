# Open Graph Validator - Quick Start Guide

## 🚀 What Was Built

A complete Open Graph (OG) meta tags validator that:

- ✅ Fetches and parses HTML from any URL
- ✅ Validates all required OG tags (title, description, image, url)
- ✅ Checks image dimensions (1200x630px recommended)
- ✅ Validates character lengths (title: 60-90, description: 150-300)
- ✅ Returns structured JSON with errors, warnings, and recommendations
- ✅ Provides Facebook/LinkedIn/Twitter debugging URLs

## 📁 Files Created

```
backend/
├── services/
│   └── ogValidator.js           # Core validation service
├── routes/
│   └── ogValidator.js           # API endpoints
├── test-og-validator.js         # Test script
├── og-validator-demo.html       # Frontend demo
└── OG_VALIDATOR_README.md       # Full documentation
```

## 🎯 Quick Test

### 1. Test with the CLI Script

```bash
cd backend
node test-og-validator.js
```

This will validate GitHub, IMDb, and YouTube, showing:

- All OG tags found
- Image dimensions
- Errors and warnings
- Character length analysis

### 2. Test the API

Start your server:

```bash
cd backend
node server.js
```

Test with cURL:

```bash
curl -X POST http://localhost:3003/api/og-validator/validate \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com"}'
```

### 3. Use the Frontend Demo

1. Start your backend server:

   ```bash
   cd backend
   node server.js
   ```

2. Open the demo in your browser:

   - Open `backend/og-validator-demo.html` in your browser
   - Or navigate to: `file:///C:/Users/Lenovo/OneDrive/Desktop/analyzer/backend/og-validator-demo.html`

3. Enter a URL and click "Validate"

## 📡 API Endpoints

### Validate URL

```
POST /api/og-validator/validate
Body: { "url": "https://example.com" }
```

### Health Check

```
GET /api/og-validator/health
```

## 🔍 What Gets Validated

### Required Tags ✅

1. **og:title** - Title of the page (60-90 chars optimal)
2. **og:description** - Description (150-300 chars optimal)
3. **og:image** - Image URL (1200x630px recommended)
4. **og:url** - Canonical URL

### Optional Tags ℹ️

5. **og:type** - Content type (default: website)
6. **og:site_name** - Website name

### Image Validation 🖼️

- Fetches actual image
- Checks dimensions (1200x630px recommended)
- Validates aspect ratio (1.91:1)
- Reports size and accessibility

## 📊 Response Format

```json
{
  "isValid": true,
  "errors": [],
  "warnings": ["og:title is short (52 chars)"],
  "recommendations": ["Image has recommended dimensions"],
  "tags": {
    "title": "Page Title",
    "description": "Page description",
    "image": "https://example.com/image.jpg",
    "url": "https://example.com",
    "type": "website",
    "site_name": "Example Site"
  },
  "imageValidation": {
    "valid": true,
    "width": 1200,
    "height": 630,
    "aspectRatio": 1.9,
    "isRecommendedSize": true,
    "message": "Image has recommended dimensions"
  },
  "debugTools": {
    "facebook": "https://developers.facebook.com/tools/debug/?q=...",
    "linkedin": "https://www.linkedin.com/post-inspector/...",
    "twitter": "https://cards-dev.twitter.com/validator"
  },
  "summary": {
    "totalTags": 6,
    "requiredTagsPresent": 4,
    "requiredTagsTotal": 4,
    "errorsCount": 0,
    "warningsCount": 1
  }
}
```

## 💡 Usage Examples

### JavaScript/Fetch

```javascript
const response = await fetch(
  "http://localhost:3003/api/og-validator/validate",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: "https://github.com" }),
  }
);

const { data } = await response.json();
console.log("Valid:", data.isValid);
console.log("Tags:", data.tags);
```

### Node.js

```javascript
import { validateOpenGraphTags } from "./services/ogValidator.js";

const report = await validateOpenGraphTags("https://github.com");
console.log(report);
```

## ✅ Test Results

The validator was tested with:

1. **GitHub.com** ✅

   - All required tags present
   - Perfect image dimensions (1200x630px)
   - Minor title length warning

2. **IMDb.com** ⚠️

   - All required tags present
   - Image dimensions not optimal (1000x1000px)
   - Good character lengths

3. **YouTube.com** ❌
   - Missing required tags (title, description, url)
   - Only og:image present
   - Demonstrates error detection

## 🔧 Integration

The validator is already integrated into your backend:

- Route registered in `server.js`
- Available at `/api/og-validator/*`
- CORS enabled for localhost testing

## 📚 Resources

- **Full Documentation**: `backend/OG_VALIDATOR_README.md`
- **Test Script**: `backend/test-og-validator.js`
- **Demo Page**: `backend/og-validator-demo.html`

## 🎨 Frontend Integration

Add to your existing frontend:

```javascript
// In your SEO tool dashboard
async function checkOpenGraph(url) {
  const response = await fetch("/api/og-validator/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  const { data } = await response.json();

  // Display results in your UI
  displayOGResults(data);
}
```

## 🐛 Debug Tools

The validator provides direct links to:

1. **Facebook Sharing Debugger** - Test Facebook previews
2. **LinkedIn Post Inspector** - Test LinkedIn cards
3. **Twitter Card Validator** - Test Twitter cards

## ⚡ Performance

- Average response time: 2-5 seconds
- Includes image fetch and dimension analysis
- Timeout: 10 seconds per request
- Handles redirects automatically

## 🔐 Security

- URL validation before fetching
- Timeout protection (10s)
- Error handling for malformed HTML
- Safe image buffer processing

## 🎉 What's Next?

You now have a fully functional Open Graph validator! Use it to:

- Audit your website's social media optimization
- Validate client websites
- Build SEO reporting tools
- Integrate into your existing analyzer

---

**Status**: ✅ Fully Operational  
**Version**: 1.0.0  
**Created**: November 15, 2025

Need help? Check `OG_VALIDATOR_README.md` for detailed documentation!
