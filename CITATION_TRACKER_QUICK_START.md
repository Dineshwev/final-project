# 🚀 Citation Tracker - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Verify Dependencies ✓

All required packages are already installed:

- ✅ `puppeteer`
- ✅ `puppeteer-extra`
- ✅ `puppeteer-extra-plugin-stealth`

### Step 2: Test the System

```bash
cd backend
node examples/citationTrackerExample.js
```

### Step 3: Run Your First Search

Edit `backend/examples/citationTrackerExample.js` and uncomment:

```javascript
await exampleSearchCitations();
```

Then run:

```bash
node examples/citationTrackerExample.js
```

## 📡 API Usage

### Start Server

```bash
cd backend
npm start
```

### Test with cURL

```bash
# Search for citations
curl -X POST http://localhost:3002/api/citations/search \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Pizza Hut",
    "phone": "+1-234-567-8900",
    "city": "New York"
  }'
```

### Test with Postman

**1. Search Citations**

```
POST http://localhost:3002/api/citations/search

Body (JSON):
{
  "businessName": "Starbucks",
  "phone": "+1-206-555-1234",
  "city": "Seattle"
}
```

**2. Search and Compare**

```
POST http://localhost:3002/api/citations/search-and-compare

Body (JSON):
{
  "businessName": "Dominos Pizza",
  "phone": "+91-9876543210",
  "city": "Mumbai",
  "address": "Andheri West, Mumbai, Maharashtra"
}
```

**3. Export Results**

```
POST http://localhost:3002/api/citations/export

Body (JSON):
{
  "data": { /* your citation data */ },
  "format": "csv",
  "filename": "my_citations"
}
```

## 💻 Code Examples

### Example 1: Simple Search

```javascript
import * as citationService from "./services/citationTrackerService.js";

const result = await citationService.searchCitations(
  "McDonald's",
  "+1-800-244-6227",
  "Chicago"
);

console.log(`Found ${result.totalCitations} citations!`);
```

### Example 2: With Comparison

```javascript
// Search
const search = await citationService.searchCitations(
  "KFC",
  "+1-800-225-5532",
  "Los Angeles"
);

// Compare
const comparison = citationService.compareCitations(search.citations, {
  name: "KFC",
  phone: "+1-800-225-5532",
  address: "1441 Gardena Ave, Glendale, CA 91204",
});

console.log("Accuracy:", comparison.summary.averageAccuracy + "%");
```

### Example 3: Full Workflow

```javascript
async function trackCitations() {
  // 1. Search
  const search = await citationService.searchCitations(
    "Subway",
    "+1-800-888-4848",
    "Miami"
  );

  // 2. Compare
  const comparison = citationService.compareCitations(search.citations, {
    name: "Subway",
    phone: "+1-800-888-4848",
    address: "325 Biscayne Blvd, Miami, FL 33132",
  });

  // 3. Export
  await citationService.exportToJSON(
    {
      search: search,
      comparison: comparison,
      generatedAt: new Date().toISOString(),
    },
    "subway_citations_report"
  );

  await citationService.exportToCSV(comparison.citations, "subway_citations");

  console.log("✅ Complete! Check backend/exports/ for files.");
}

trackCitations();
```

## 🌐 Supported Directories

| Directory        | Region    | Best For                |
| ---------------- | --------- | ----------------------- |
| **Yelp**         | US/Global | Restaurants, Services   |
| **Yellow Pages** | US        | All Business Types      |
| **Justdial**     | India     | All Business Types      |
| **Sulekha**      | India     | Services, Professionals |
| **MouthShut**    | India     | Reviews, Ratings        |

## 📊 Understanding Results

### Citation Object

```javascript
{
  source: 'Yelp',              // Directory name
  name: 'Pizza Hut',           // Business name
  address: '123 Main St',      // Full address
  phone: '(234) 567-8900',     // Phone number
  url: 'https://...',          // Listing URL
  foundDate: '2025-11-14...',  // When found

  // After comparison:
  accuracy: 100,               // 0-100%
  status: 'Perfect Match',     // Match status
  matches: {                   // Field matches
    name: true,
    address: true,
    phone: true
  },
  issues: ['No issues found']  // Problems detected
}
```

### Accuracy Scores

- **100%** = Perfect Match (all fields match)
- **66%** = Good Match (2/3 fields match)
- **33%** = Partial Match (1/3 fields match)
- **0%** = Poor Match (no fields match)

### Match Status

- **Perfect Match** - 100% accuracy
- **Good Match** - 66-99% accuracy
- **Partial Match** - 33-65% accuracy
- **Poor Match** - 0-32% accuracy

## 🚨 Troubleshooting

### "CAPTCHA detected"

**Solution 1:** Increase delays

```javascript
// In citationTrackerService.js
const DELAY_CONFIG = {
  min: 4000, // 4 seconds
  max: 8000, // 8 seconds
};
```

**Solution 2:** Use proxies (for production)

**Solution 3:** Run during off-peak hours

### "No citations found"

**Check:**

1. Business name spelling
2. City name format (try "New York" vs "New York, NY")
3. Business actually exists on directories

### "Request timeout"

**Fix:**

1. Increase timeout in service (currently 30s)
2. Check internet connection
3. Verify target sites are accessible

## 📁 Export Locations

All exports are saved to:

```
backend/exports/
├── my_citations.json
└── my_citations.csv
```

### JSON Format

```json
{
  "businessName": "Pizza Hut",
  "totalCitations": 15,
  "citations": [...]
}
```

### CSV Format

```csv
Source,Name,Address,Phone,URL,Found Date,Accuracy,Status,Issues
Yelp,"Pizza Hut","123 Main St","234-567-8900","https://...","2025-11-14",100%,Perfect Match,No issues
```

## ⚙️ Configuration

### Adjust Search Speed

**Slower (safer):**

```javascript
const DELAY_CONFIG = {
  min: 5000, // 5 seconds
  max: 10000, // 10 seconds
};
```

**Faster (riskier):**

```javascript
const DELAY_CONFIG = {
  min: 1000, // 1 second
  max: 3000, // 3 seconds
};
```

### Add More Retries

```javascript
const RETRY_CONFIG = {
  maxRetries: 5, // Try 5 times instead of 3
  retryDelay: 5000, // Wait 5 seconds between retries
};
```

## 📈 Performance Tips

### 1. Run During Off-Peak Hours

- Late night/early morning in target region
- Reduces CAPTCHA frequency

### 2. Batch Processing

- Group multiple searches
- Add delays between batches

### 3. Monitor Success Rates

- Track CAPTCHA occurrences
- Adjust delays accordingly

### 4. Cache Results

- Save search results
- Avoid re-scraping same business

## 🎯 Best Practices

### ✅ DO:

- Use realistic business data
- Implement proper delays
- Handle errors gracefully
- Export results regularly
- Monitor for CAPTCHAs

### ❌ DON'T:

- Scrape excessively
- Ignore rate limits
- Store personal data unnecessarily
- Violate terms of service
- Run without error handling

## 📞 Common Use Cases

### 1. Citation Audit

Check if business is listed correctly across directories

### 2. NAP Consistency

Verify Name, Address, Phone consistency

### 3. Competitor Analysis

Track competitor citations

### 4. Local SEO

Monitor local search presence

### 5. Reputation Management

Find and track online mentions

## 🔗 Quick Links

- **Full Documentation**: `CITATION_TRACKER_DOCUMENTATION.md`
- **Implementation Summary**: `CITATION_TRACKER_IMPLEMENTATION.md`
- **Example Code**: `backend/examples/citationTrackerExample.js`
- **Service Code**: `backend/services/citationTrackerService.js`

## 🎉 You're Ready!

Start tracking citations with:

```bash
# Test examples
node backend/examples/citationTrackerExample.js

# Or use API
cd backend
npm start
```

Happy citation tracking! 🔍✨
