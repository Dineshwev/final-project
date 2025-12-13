# SEO Health Checker Backend

## 🔒 LOCKED API CONTRACT - v1.0

**This backend implements a LOCKED API CONTRACT that ensures backward compatibility and predictable responses.**

> ⚠️ **CRITICAL**: The API response structure is locked and must not change without versioning. The frontend depends on the exact structure defined in [API_CONTRACT.md](API_CONTRACT.md).

## 🎯 Key Features

✅ **Standardized Response Format** - Every API call returns the same structure  
✅ **Error Isolation** - Failed services don't break the entire response  
✅ **Progress Tracking** - Built-in progress calculation  
✅ **Type Safety** - All fields always present with correct types  
✅ **Future Compatible** - Designed for billing, async processing, and caching  

## 🏗️ Project Structure

```
backend/
├─ routes/
│   └─ scan.routes.js               # 🔒 Locked API routes
├─ controllers/  
│   └─ scan.controller.js           # 🔒 Locked response controller
├─ services/
│   ├─ scanOrchestrator.service.js  # 🔒 Orchestrator with locked contract
│   ├─ duplicateContent.service.js  # Duplicate content analysis
│   ├─ accessibility.service.js     # Accessibility analysis  
│   ├─ backlinks.service.js         # Backlinks analysis
│   ├─ schema.service.js            # Schema markup analysis
│   ├─ multiLanguage.service.js     # Multi-language SEO analysis
│   └─ rankTracker.service.js       # Rank tracking analysis
├─ utils/
│   ├─ responseContract.js          # 🔒 LOCKED response builder
│   └─ testApiContract.js           # Contract validation tests
├─ app.js                           # Express app configuration  
├─ server.js                        # Server startup
├─ API_CONTRACT.md                  # 📖 Complete API documentation
└─ package.json                     # Dependencies and scripts
```

## 🚀 API Endpoints

### Single Scan API (LOCKED CONTRACT v1.0)

- **POST** `/api/scan` - Start a new website scan
- **GET** `/api/scan/:scanId/results` - Get standardized scan results

### Health Check
- **GET** `/api/health` - Check API status

## 📋 LOCKED API CONTRACT USAGE

### Start a Scan
```bash
POST /api/scan
Content-Type: application/json

{
  "url": "https://example.com",
  "keywords": ["seo", "optimization"]  // optional
}
```

**Response:**
```json
{
  "success": true,
  "scanId": "scan_1671234567890_abc123def",
  "status": "completed",
  "url": "https://example.com"
}
```

### Get Scan Results (LOCKED CONTRACT)
```bash
GET /api/scan/:scanId/results
```

**Response Structure (ALWAYS THE SAME):**
```json
{
  "success": true,
  "data": {
    "status": "completed | partial | failed | pending",
    "scanId": "scan_1671234567890_abc123def",
    "url": "https://example.com",
    "startedAt": "2025-12-13T10:00:00.000Z",
    "completedAt": "2025-12-13T10:01:30.000Z",
    "progress": {
      "completedServices": 6,
      "totalServices": 6, 
      "percentage": 100
    },
    "services": {
      "accessibility": {
        "status": "success | failed | pending",
        "score": 85,  // 0-100 or null
        "data": { /* service-specific data */ },
        "issues": [
          {
            "type": "string",
            "severity": "low | medium | high | critical", 
            "message": "Issue description",
            "recommendation": "How to fix"
          }
        ],
        "error": {
          "code": "ERROR_CODE",
          "message": "Human readable error",
          "retryable": true
        } | null,
        "executionTimeMs": 1500
      },
      "duplicateContent": { /* same structure */ },
      "backlinks": { /* same structure */ },
      "schema": { /* same structure */ },
      "multiLanguage": { /* same structure */ },
      "rankTracker": { /* same structure */ }
}
```

## 🔧 TESTING THE CONTRACT

### Validate API Contract
```bash
# Run contract validation tests
node utils/testApiContract.js
```

This verifies:
- ✅ All required fields are always present
- ✅ Response structure is consistent
- ✅ Service normalization works correctly
- ✅ Progress calculation is accurate
- ✅ Error handling follows the contract

### Example Test Output
```
🧪 Testing Locked API Contract...
✓ Mock response generated successfully
✓ Contains all required top-level keys
✓ Services object contains all required services
✓ All responses pass schema validation
🎉 ALL TESTS PASSED - API Contract is working correctly!
```

## 🛠️ Development

### Start the server
```bash
npm start          # Production mode
npm run dev        # Development mode (auto-restart)
```

### Install dependencies
```bash
npm install
```

### Run tests
```bash
npm test
```

## 🎯 CONTRACT GUARANTEES

### ✅ ALWAYS PRESENT
- All 6 service results (`accessibility`, `duplicateContent`, `backlinks`, `schema`, `multiLanguage`, `rankTracker`)
- `status`, `scanId`, `url`, `startedAt`, `completedAt`, `progress`, `services`, `meta`
- Each service has: `status`, `score`, `data`, `issues`, `error`, `executionTimeMs`
- `progress.percentage` calculated correctly
- `issues` is always an array (empty if no issues)

### ✅ RELIABLE BEHAVIOR  
- Failed services don't break the response
- Partial success is handled gracefully
- Error messages are human-readable
- All timestamps are ISO-8601 format
- Scores are 0-100 or null

## 🚀 DEPLOYMENT

### Environment Variables
```bash
NODE_ENV=production    # Environment type
PORT=8080             # Server port (default: 8080)
```

### Production Setup
1. Install dependencies: `npm install --production`
2. Set `NODE_ENV=production`
3. Start server: `npm start`

## 🔄 FUTURE COMPATIBILITY

The locked contract supports future enhancements:

- **Async Processing**: Change to polling without breaking structure
- **Billing Integration**: Add billing fields to `meta` object
- **Caching**: Add cache metadata without affecting core structure  
- **New Services**: Add to `services` object without breaking existing ones
- **Retry Logic**: Use `error.retryable` for automatic retry logic

## 📖 FULL DOCUMENTATION

See [API_CONTRACT.md](API_CONTRACT.md) for complete contract documentation, including:
- Detailed field descriptions
- Frontend integration patterns  
- Error handling examples
- Response structure guarantees
- Breaking change policies

## ⚠️ CRITICAL NOTES

1. **DO NOT** change the response structure without API versioning
2. **DO NOT** remove or rename fields in the services object
3. **DO NOT** change the meaning of status values
4. **DO NOT** throw unhandled errors from API endpoints
5. **ALWAYS** test changes against `utils/testApiContract.js`

---

**🔐 This API contract is LOCKED for frontend stability and backward compatibility.**

- **Mock Data Only**: All services return static mock data with `"status": "mock"`
- **Clean Architecture**: Separation of routes, controllers, and services
- **Production Ready**: Simple, no heavy dependencies or complex logic
- **Stable API**: Consistent response format for frontend integration
- **No Database**: In-memory storage for scan results
- **No Authentication**: Simplified for development

## 🔧 Services

Each service in the `services/` directory exports a single function that:
- Accepts a URL parameter
- Returns mock data with `status: "mock"`
- Provides realistic sample data for frontend development

### Service Functions:
- `analyzeDuplicateContent(url)` - Returns score, duplicates array, and summary
- `analyzeAccessibility(url)` - Returns score, issues array, and WCAG level
- `analyzeBacklinks(url)` - Returns total count, toxic count, and quality metrics  
- `analyzeSchema(url)` - Returns validation status, errors, and schema types
- `analyzeMultiLanguage(url)` - Returns detected languages and hreflang analysis
- `analyzeRankTracker(url)` - Returns keywords array, positions, and visibility metrics

## 🎯 Mock Response Format

Each service returns minimal, focused data that the frontend can immediately render:

```javascript
// duplicateContent
{ status: "mock", score: 85, duplicates: [...] }

// accessibility  
{ status: "mock", score: 78, issues: [...], level: "AA" }

// backlinks
{ status: "mock", total: 1247, toxic: 8, domainAuthority: 68 }

// schema
{ status: "mock", valid: true, score: 82, errors: [...] }

// multiLanguage
{ status: "mock", languages: ["en", "es", "fr"], score: 75 }

// rankTracker
{ status: "mock", keywords: [...], averagePosition: 24, topTen: 8 }
```

## 📝 Notes

- This is a **skeleton implementation** with mock data only
- Real SEO analysis logic should be added to individual services
- Each service has clear TODO comments for future implementation
- Mock functions can be easily replaced with worker-based real logic
- Database integration can be added later for persistent storage
- Authentication and rate limiting should be added for production use

## 🔄 Future Implementation

Each service is prepared for real implementation with:
- **Mock wrapper functions** - Easy to replace with real logic
- **Clear TODO comments** - Detailed implementation guidelines  
- **Worker-based architecture** - Ready for heavy computation offloading
- **Same API interface** - No frontend changes required

Example implementation path:
```javascript
// Before: Mock function
const generateMockAccessibilityAnalysis = (url) => { /* mock data */ };

// After: Real function (future)
const performRealAccessibilityAnalysis = async (url) => {
  // 1. Launch headless browser
  // 2. Inject axe-core library
  // 3. Run WCAG compliance tests
  // 4. Return real analysis results
};
```