# Open Graph Meta Tags Validator

A comprehensive Open Graph (OG) meta tags validator that fetches, parses, and validates OG tags from any URL.

## Features

✅ **Complete OG Tag Validation**

- Validates all required OG tags (title, description, image, url)
- Checks optional tags (type, site_name)
- Identifies missing or empty tags

✅ **Character Length Optimization**

- og:title: 60-90 characters (optimal)
- og:description: 150-300 characters (optimal)
- Provides warnings for suboptimal lengths

✅ **Image Validation**

- Fetches and analyzes actual image dimensions
- Validates against recommended size (1200x630px)
- Checks aspect ratio (1.91:1 recommended)
- Verifies image accessibility

✅ **Smart Analysis**

- URL canonicalization checks
- Domain consistency validation
- Comprehensive error and warning system
- Actionable recommendations

✅ **Debug Tools Integration**

- Facebook Sharing Debugger URL
- LinkedIn Post Inspector URL
- Twitter Card Validator URL

## Installation

The required dependencies are already installed:

```bash
npm install axios cheerio image-size
```

## API Endpoints

### 1. Validate OG Tags

**Endpoint:** `POST /api/og-validator/validate`

**Request Body:**

```json
{
  "url": "https://example.com"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "isValid": true,
    "url": "https://example.com",
    "errors": [],
    "warnings": ["og:title is short (52 chars). Optimal: 60-90 characters"],
    "recommendations": [
      "og:description length is optimal (186 chars)",
      "Image has recommended dimensions (1200x630px)"
    ],
    "tags": {
      "title": "Example Site",
      "description": "This is an example site description that provides information about the content",
      "image": "https://example.com/image.jpg",
      "url": "https://example.com",
      "type": "website",
      "site_name": "Example"
    },
    "imageValidation": {
      "valid": true,
      "width": 1200,
      "height": 630,
      "aspectRatio": 1.9,
      "isRecommendedSize": true,
      "isRecommendedAspectRatio": true,
      "message": "Image has recommended dimensions (1200x630px)"
    },
    "debugTools": {
      "facebook": "https://developers.facebook.com/tools/debug/?q=https%3A%2F%2Fexample.com",
      "linkedin": "https://www.linkedin.com/post-inspector/inspect/https%3A%2F%2Fexample.com",
      "twitter": "https://cards-dev.twitter.com/validator"
    },
    "summary": {
      "totalTags": 6,
      "requiredTagsPresent": 4,
      "requiredTagsTotal": 4,
      "errorsCount": 0,
      "warningsCount": 1
    },
    "timestamp": "2025-11-15T10:30:00.000Z"
  }
}
```

### 2. Health Check

**Endpoint:** `GET /api/og-validator/health`

**Response:**

```json
{
  "success": true,
  "service": "Open Graph Validator",
  "status": "operational",
  "timestamp": "2025-11-15T10:30:00.000Z"
}
```

## Usage Examples

### Using cURL

```bash
# Validate a URL
curl -X POST http://localhost:3003/api/og-validator/validate \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com"}'

# Health check
curl http://localhost:3003/api/og-validator/health
```

### Using JavaScript/Fetch

```javascript
// Validate OG tags
const response = await fetch(
  "http://localhost:3003/api/og-validator/validate",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: "https://github.com",
    }),
  }
);

const data = await response.json();
console.log(data);
```

### Using the Test Script

```bash
# Run the test script
cd backend
node test-og-validator.js
```

The test script validates multiple popular websites and displays comprehensive reports.

## Validation Rules

### Required Tags (Must be present)

1. **og:title**

   - Required: Yes
   - Optimal length: 60-90 characters
   - Too short: < 60 characters (warning)
   - Too long: > 90 characters (warning, may be truncated)

2. **og:description**

   - Required: Yes
   - Optimal length: 150-300 characters
   - Too short: < 150 characters (warning)
   - Too long: > 300 characters (warning, may be truncated)

3. **og:image**

   - Required: Yes
   - Recommended size: 1200x630px
   - Recommended aspect ratio: 1.91:1
   - Must be accessible and valid

4. **og:url**
   - Required: Yes
   - Must be a valid URL
   - Should match the canonical URL
   - Domain consistency check

### Optional Tags (Recommended)

5. **og:type**

   - Optional but recommended
   - Default: "website"
   - Common values: article, video, music, profile, etc.

6. **og:site_name**
   - Optional but recommended
   - Helps with brand recognition
   - Displayed in social media shares

## Response Fields

### Top-Level Fields

- `isValid` (boolean): Overall validation status
- `url` (string): The validated URL
- `errors` (array): Critical issues that must be fixed
- `warnings` (array): Issues that should be addressed
- `recommendations` (array): Suggestions for optimization
- `tags` (object): All discovered OG tags
- `imageValidation` (object|null): Image analysis results
- `debugTools` (object): URLs to external validation tools
- `summary` (object): Quick overview statistics
- `timestamp` (string): ISO 8601 timestamp

### Image Validation Fields

- `valid` (boolean): Whether image was successfully analyzed
- `width` (number): Image width in pixels
- `height` (number): Image height in pixels
- `aspectRatio` (number): Width/height ratio
- `isRecommendedSize` (boolean): Exactly 1200x630px
- `isRecommendedAspectRatio` (boolean): Aspect ratio is 1.91:1
- `message` (string): Human-readable result

## Error Handling

### Common Errors

1. **Invalid URL Format**

```json
{
  "success": false,
  "error": "Invalid URL format"
}
```

2. **Failed to Fetch URL**

```json
{
  "isValid": false,
  "errors": ["Failed to fetch URL: Network error"]
}
```

3. **Missing Required Tags**

```json
{
  "isValid": false,
  "errors": ["Missing required tag: og:title", "Missing required tag: og:image"]
}
```

## Best Practices

### For Optimal OG Tags

1. **Title**: 60-90 characters, clear and descriptive
2. **Description**: 150-300 characters, compelling preview text
3. **Image**: 1200x630px (1.91:1 aspect ratio), high quality
4. **URL**: Use canonical URL, match the actual page
5. **Type**: Specify content type (article, video, etc.)
6. **Site Name**: Include for brand recognition

### Testing Your Implementation

1. Use the test script: `node test-og-validator.js`
2. Test with Facebook Debugger: Visit the provided URL
3. Test with LinkedIn Inspector: Visit the provided URL
4. Verify on actual social platforms before launching

## Integration with Frontend

### Example Component

```javascript
async function validateOpenGraph(url) {
  try {
    const response = await fetch(
      "http://localhost:3003/api/og-validator/validate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      }
    );

    const { data } = await response.json();

    // Display results
    console.log("Validation Status:", data.isValid ? "PASS" : "FAIL");

    if (data.errors.length > 0) {
      console.error("Errors:", data.errors);
    }

    if (data.warnings.length > 0) {
      console.warn("Warnings:", data.warnings);
    }

    // Access debug tools
    window.open(data.debugTools.facebook, "_blank");

    return data;
  } catch (error) {
    console.error("Validation failed:", error);
  }
}
```

## Technical Details

### Dependencies

- **axios**: HTTP client for fetching HTML and images
- **cheerio**: Fast, flexible HTML parsing (jQuery-like API)
- **image-size**: Determine image dimensions from buffer

### File Structure

```
backend/
├── services/
│   └── ogValidator.js      # Core validation logic
├── routes/
│   └── ogValidator.js      # API endpoints
├── test-og-validator.js    # Test script
└── server.js               # Route registration
```

### Functions

#### `fetchHTML(url)`

Fetches HTML content from a URL with proper headers and timeout.

#### `parseOGTags(html)`

Extracts all `og:*` meta tags from HTML using Cheerio.

#### `validateImageDimensions(imageUrl)`

Fetches and analyzes image dimensions, validates against recommendations.

#### `generateValidationReport(tags, url)`

Generates comprehensive report with errors, warnings, and recommendations.

#### `validateOpenGraphTags(url)`

Main entry point that orchestrates the entire validation process.

## Troubleshooting

### CORS Issues

If testing from browser, ensure CORS is properly configured in `server.js`.

### Image Validation Fails

- Check if image URL is publicly accessible
- Verify image format is supported (JPEG, PNG, GIF, WebP)
- Check for SSL certificate issues

### Timeout Errors

- Increase timeout in axios config (default: 10 seconds)
- Check if target website is responsive
- Verify network connectivity

## Resources

- [Open Graph Protocol](https://ogp.me/)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

## License

Part of the SEO Analyzer project.

---

**Created:** November 15, 2025  
**Version:** 1.0.0  
**Status:** ✅ Fully Operational
