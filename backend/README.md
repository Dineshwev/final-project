# SEO Health Checker API

A robust API for analyzing website SEO health and providing actionable recommendations.

## Features

- Comprehensive website SEO and health analysis
- Performance metrics via Google Lighthouse integration
- Detailed metadata extraction and evaluation
- Content structure analysis
- Image optimization checking
- Link analysis (internal, external, broken)
- Security evaluation (SSL, HTTPS, HSTS)
- Robots.txt and sitemap.xml analysis
- Historical scan tracking and trend analysis
- Export functionality in multiple formats (PDF, CSV, JSON)
- Customized recommendations engine

## Requirements

- Node.js 18.0.0 or higher
- NPM or Yarn package manager
- SQLite (included in dependencies)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
```

2. Install dependencies:
```bash
cd seo-health-checker-api
npm install
```

3. Create a `.env` file based on the provided `.env.example`:
```
PORT=3000
NODE_ENV=development
TIMEOUT_MS=30000
MAX_CONCURRENT_REQUESTS=5
FRONTEND_URL=http://localhost:5000
```

4. Initialize the database:
```bash
npm run db:init
```

5. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## API Endpoints

### SEO Analysis

#### GET /api/seo/analyze

Analyzes a website URL and returns a detailed SEO health report.

**Query Parameters:**
- `url` (required): The URL of the website to analyze (must include protocol)

**Example Request:**
```
GET /api/seo/analyze?url=https://example.com
```

**Example Response:**
```json
{
  "status": "success",
  "data": {
    "url": "https://example.com",
    "analyzedAt": "2023-11-05T15:22:33.456Z",
    "metadata": {
      "title": {
        "content": "Example Domain",
        "length": 13,
        "optimal": false,
        "keywordMatch": true,
        "matchingKeywords": ["example"]
      },
      "description": {
        "content": null,
        "length": 0,
        "optimal": false,
        "keywordMatch": false,
        "matchingKeywords": []
      },
      "canonical": {
        "url": "https://example.com",
        "matches": true,
        "valid": true
      }
    },
    "lighthouse": {
      "scores": {
        "performance": 95,
        "accessibility": 88,
        "bestPractices": 92,
        "seo": 89
      }
    }
  },
  "nextScan": "2023-11-12T15:22:33.456Z"
}
```

### Scan Management

#### POST /api/scan

Start a new website scan.

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Scan started successfully",
  "data": {
    "scanId": "550e8400-e29b-41d4-a716-446655440000",
    "url": "https://example.com",
    "status": "pending"
  }
}
```

#### GET /api/scan/:scanId

Get the status of a scan.

**Response:**
```json
{
  "status": "success",
  "data": {
    "scanId": "550e8400-e29b-41d4-a716-446655440000",
    "url": "https://example.com",
    "startTime": "2023-11-05T15:22:33.456Z",
    "status": "in-progress",
    "progress": 50
  }
}
```

#### GET /api/report/:url

Get the latest report for a URL.

**Response:**
```json
{
  "status": "success",
  "data": {
    "scanId": "550e8400-e29b-41d4-a716-446655440000",
    "url": "https://example.com",
    "completedAt": "2023-11-05T15:25:33.456Z",
    "seo": { /* SEO analysis data */ },
    "lighthouse": { /* Lighthouse results */ },
    "recommendations": [
      {
        "category": "SEO - Metadata",
        "issue": "Missing meta description",
        "priority": "high"
      }
    ]
  }
}
```

#### DELETE /api/scan/:scanId

Cancel an ongoing scan.

**Response:**
```json
{
  "status": "success",
  "message": "Scan cancelled successfully",
  "data": {
    "scanId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "cancelled"
  }
}
```

### Backlink Analysis

#### GET /api/backlinks

Get a backlink summary for a URL.

**Query Parameters:**
- `url` (required): The URL to analyze

**Response:**
```json
{
  "status": "success",
  "data": {
    "totalBacklinks": 150,
    "uniqueDomains": 45,
    "topLevelDomains": {
      "com": 25,
      "org": 12,
      "net": 8
    },
    "qualityScore": 72
  }
}
```

#### GET /api/backlinks/detailed

Get detailed backlink information for a URL.

**Query Parameters:**
- `url` (required): The URL to analyze

#### GET /api/backlinks/domains

Get domain metrics for a URL's backlinks.

**Query Parameters:**
- `url` (required): The URL to analyze

### History Management

#### GET /api/history/:url

Get scan history for a URL.

**Response:**
```json
{
  "status": "success",
  "url": "https://example.com",
  "totalScans": 5,
  "scans": [
    {
      "scanId": "550e8400-e29b-41d4-a716-446655440000",
      "status": "completed",
      "createdAt": "2023-11-05T15:20:33.456Z",
      "completedAt": "2023-11-05T15:25:33.456Z",
      "scores": {
        "performance": 95,
        "seo": 89,
        "accessibility": 88,
        "bestPractices": 92
      }
    }
  ]
}
```

#### GET /api/history/recent

Get recent scans across all URLs.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

#### GET /api/history/scan/:id

Get scan details by ID.

#### GET /api/history/trends/:url

Get score trends for a specific URL.

**Response:**
```json
{
  "status": "success",
  "url": "https://example.com",
  "dataPoints": 5,
  "trends": {
    "dates": ["2023-10-01", "2023-10-08", "2023-10-15", "2023-10-22", "2023-10-29"],
    "performance": [85, 88, 90, 92, 95],
    "seo": [80, 83, 85, 87, 89],
    "accessibility": [75, 78, 82, 85, 88],
    "bestPractices": [80, 84, 86, 90, 92]
  },
  "changes": {
    "performance": 10,
    "seo": 9,
    "accessibility": 13,
    "bestPractices": 12
  }
}
```

#### DELETE /api/history/scan/:id

Delete a scan by ID.

### Export Functionality

#### GET /api/export/pdf/:url

Export the latest scan report for a URL as PDF.

#### GET /api/export/:scanId/pdf

Export a specific scan report as PDF.

#### GET /api/export/:scanId/csv

Export a specific scan report as CSV.

#### GET /api/export/:scanId/json

Export a specific scan report as JSON.

#### GET /api/export/trends/:url

Export historical trends for a URL.

**Query Parameters:**
- `format` (optional): Export format (json, csv, pdf). Default: json

## Error Handling

The API uses consistent error handling across all endpoints:

```json
{
  "status": "error",
  "message": "Error description",
  "details": "Additional error information (in development mode)"
}
```

Common HTTP status codes:
- `400` - Bad Request (invalid input, validation error)
- `404` - Not Found (resource not found)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error (server-side error)

## Rate Limiting

To prevent abuse, the API implements rate limiting:
- 100 requests per IP address per 15-minute window
- When limit is exceeded, returns 429 status with retry-after header

## Example Usage

### Using cURL

```bash
# Start a new scan
curl -X POST -H "Content-Type: application/json" -d '{"url": "https://example.com"}' http://localhost:3000/api/scan

# Get scan status
curl http://localhost:3000/api/scan/550e8400-e29b-41d4-a716-446655440000

# Get scan history for a URL
curl http://localhost:3000/api/history/https%3A%2F%2Fexample.com

# Export PDF report
curl -o report.pdf http://localhost:3000/api/export/550e8400-e29b-41d4-a716-446655440000/pdf
```

### Using JavaScript Fetch API

```javascript
// Start a new scan
async function startScan(url) {
  const response = await fetch('http://localhost:3000/api/scan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url })
  });
  
  return await response.json();
}

// Get scan status
async function getScanStatus(scanId) {
  const response = await fetch(`http://localhost:3000/api/scan/${scanId}`);
  return await response.json();
}

// Example usage
startScan('https://example.com')
  .then(data => {
    console.log('Scan started:', data);
    return getScanStatus(data.data.scanId);
  })
  .then(status => console.log('Scan status:', status))
  .catch(error => console.error('Error:', error));
```

## Command Line Usage

The API includes a CLI tool for running scans directly:

```bash
# Run a scan from the command line
npm run scan -- --url=https://example.com
```

## License

MIT License - See LICENSE file for details.
        "descriptionMatch": 0,
        "urlMatch": 0.33
      }
    },
    "headings": {
      "counts": {
        "h1": 1,
        "h2": 0,
        "h3": 0,
        "h4": 0,
        "h5": 0,
        "h6": 0
      },
      "content": {
        "h1": ["Example Domain"],
        "h2": [],
        "h3": [],
        "h4": [],
        "h5": [],
        "h6": []
      },
      "structure": {
        "hasH1": true,
        "singleH1": true,
        "hierarchyValid": true
      },
      "contentStats": {
        "wordCount": 32,
        "contentToHtmlRatio": "12.50%"
      }
    },
    "images": {
      "count": 0,
      "withAlt": 0,
      "withEmptyAlt": 0,
      "withoutAlt": 0,
      "largeImages": 0,
      "altTextCoverage": "0%",
      "images": []
    },
    "links": {
      "count": 1,
      "internal": 0,
      "external": 1,
      "empty": 0,
      "nofollow": 0,
      "broken": 0,
      "links": [
        {
          "href": "https://www.iana.org/domains/example",
          "text": "More information...",
          "isInternal": false,
          "isNoFollow": false,
          "isEmpty": false,
          "isBroken": false
        }
      ]
    },
    "security": {
      "ssl": {
        "enabled": true,
        "valid": true
      },
      "https": {
        "enabled": true,
        "redirectFromHttp": true
      },
      "hsts": {
        "enabled": true
      },
      "xRobotsTag": null
    },
    "robotsTxt": {
      "exists": true,
      "url": "https://example.com/robots.txt",
      "userAgents": 1,
      "disallowRules": 1,
      "allowRules": 0,
      "sitemapReferences": 0,
      "content": "User-agent: *\nDisallow: /"
    },
    "sitemap": {
      "exists": false,
      "url": "https://example.com/sitemap.xml",
      "urlCount": 0,
      "isSitemapIndex": false,
      "sitemapCount": 0,
      "error": "Request failed with status code 404"
    },
    "lighthouse": {
      "scores": {
        "performance": 98,
        "accessibility": 85,
        "bestPractices": 92,
        "seo": 80
      },
      "metrics": {
        "firstContentfulPaint": "0.8 s",
        "speedIndex": "0.8 s",
        "largestContentfulPaint": "0.8 s",
        "timeToInteractive": "0.8 s",
        "totalBlockingTime": "0 ms",
        "cumulativeLayoutShift": "0"
      },
      "audits": {
        "hasTitleElement": true,
        "hasMetaDescription": false,
        "hasViewport": true,
        "hasCrawlableLinks": true,
        "hasValidHreflang": true,
        "hasValidCanonical": true,
        "hasAltText": true,
        "hasAriaLabels": true,
        "hasGoodColorContrast": true,
        "usesOptimizedImages": true,
        "usesTextCompression": true,
        "usesResponsiveImages": true
      }
    },
    "recommendations": [
      {
        "type": "critical",
        "category": "metadata",
        "issue": "Missing meta description",
        "description": "The page is missing a meta description, which affects click-through rates from search results.",
        "recommendation": "Add a compelling meta description of 120-160 characters that includes your main keywords."
      },
      {
        "type": "warning",
        "category": "metadata",
        "issue": "Title too short",
        "description": "Your title is only 13 characters long.",
        "recommendation": "Make the title more descriptive, aim for 50-60 characters including your main keywords."
      },
      {
        "type": "warning",
        "category": "content",
        "issue": "Thin content",
        "description": "The page only has 32 words, which may be seen as thin content by search engines.",
        "recommendation": "Add more comprehensive content with at least 500 words to provide more value to users and improve search rankings."
      }
    ],
    "error": null
  }
}
```

## Error Handling

The API uses standard HTTP status codes:

- 200: Success
- 400: Bad Request (invalid URL format)
- 429: Too Many Requests (rate limit exceeded)
- 500: Server Error

Error responses follow this format:

```json
{
  "status": "error",
  "message": "Error message description"
}
```

## Rate Limiting

To prevent abuse, the API implements rate limiting:
- 100 requests per IP per 15-minute window

## Future Improvements

- URL screenshot functionality
- Structured data (JSON-LD) validation
- Mobile friendliness testing
- Social media meta tags analysis
- Internationalization support
- Core Web Vitals field data

## License

[MIT](LICENSE)