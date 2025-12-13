# 🔒 LOCKED SINGLE SCAN API CONTRACT

**Version:** 1.0  
**Status:** PRODUCTION READY  
**Last Updated:** December 13, 2025  

> ⚠️ **CRITICAL**: This API contract is LOCKED and must not be changed without proper versioning. The frontend depends on this exact structure.

## 📋 API ENDPOINTS

### POST /api/scan
Start a new website scan.

**Request Body:**
```json
{
  "url": "https://example.com",
  "keywords": ["keyword1", "keyword2"]  // optional
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

### GET /api/scan/:scanId/results
Get scan results by scan ID.

**Response Structure (LOCKED CONTRACT):**
```json
{
  "success": true,
  "data": {
    "status": "completed",
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
      "accessibility": { /* service result */ },
      "duplicateContent": { /* service result */ },
      "backlinks": { /* service result */ },
      "schema": { /* service result */ },
      "multiLanguage": { /* service result */ },
      "rankTracker": { /* service result */ }
    },
    "meta": {
      "version": "1.0",
      "backend": "seo-health-checker",
      "environment": "production"
    }
  }
}
```

## 🏗️ RESPONSE STRUCTURE

### Top-Level Fields (ALWAYS PRESENT)
- `status`: `"pending" | "running" | "completed" | "failed" | "partial"`
- `scanId`: `string` - Unique scan identifier
- `url`: `string` - The scanned URL
- `startedAt`: `string` - ISO-8601 timestamp
- `completedAt`: `string | null` - ISO-8601 timestamp or null if pending
- `progress`: `object` - Progress information
- `services`: `object` - Service results (always contains all 6 services)
- `meta`: `object` - Metadata about the response

### Progress Object
```json
{
  "completedServices": 4,
  "totalServices": 6,
  "percentage": 67
}
```

### Service Result Structure (ALWAYS PRESENT FOR EACH SERVICE)
```json
{
  "status": "success | failed | pending",
  "score": 85,  // number 0-100 or null
  "data": {     // object or null
    "checks": 15,
    "passed": 13
  },
  "issues": [   // always array, even if empty
    {
      "type": "missing-alt-text",
      "severity": "medium",
      "message": "2 images are missing alt text",
      "recommendation": "Add descriptive alt text to all images"
    }
  ],
  "error": {    // object or null
    "code": "SERVICE_NAME_ERROR",
    "message": "Human readable error message",
    "retryable": true
  },
  "executionTimeMs": 1500  // number or null
}
```

## 🎯 GUARANTEED SERVICE NAMES

The `services` object ALWAYS contains these exact keys:
- `accessibility`
- `duplicateContent`
- `backlinks`
- `schema`
- `multiLanguage`
- `rankTracker`

## 📊 STATUS VALUES

### Overall Scan Status
- `pending`: Scan not started or in progress
- `running`: Scan actively processing (future use)
- `completed`: All services completed successfully
- `failed`: All services failed
- `partial`: Some services succeeded, some failed

### Service Status
- `success`: Service completed successfully
- `failed`: Service failed with error
- `pending`: Service not yet executed

### Issue Severity
- `low`: Minor optimization opportunity
- `medium`: Moderate issue affecting SEO
- `high`: Important issue requiring attention
- `critical`: Severe issue significantly impacting SEO

## 🔧 FRONTEND INTEGRATION GUIDE

### Safe Data Access Patterns
```javascript
// ✅ CORRECT: Always check service status first
const accessibilityResult = response.services.accessibility;
if (accessibilityResult.status === 'success') {
  const score = accessibilityResult.score;
  const data = accessibilityResult.data;
  const issues = accessibilityResult.issues;
}

// ✅ CORRECT: Handle errors gracefully
if (accessibilityResult.status === 'failed') {
  const error = accessibilityResult.error;
  if (error.retryable) {
    // Show retry option
  }
}

// ✅ CORRECT: Progress indicator
const progressPercent = response.progress.percentage;
```

### Common Patterns
```javascript
// Get all successful services
const successfulServices = Object.entries(response.services)
  .filter(([name, service]) => service.status === 'success');

// Get all issues across services
const allIssues = Object.values(response.services)
  .filter(service => service.status === 'success')
  .flatMap(service => service.issues);

// Calculate average score (excluding failed services)
const scores = Object.values(response.services)
  .filter(service => service.status === 'success' && service.score !== null)
  .map(service => service.score);
const averageScore = scores.length > 0 
  ? scores.reduce((a, b) => a + b) / scores.length 
  : null;
```

## ⚠️ CRITICAL DO'S AND DON'TS

### ✅ DO
- Always check `service.status` before accessing `data` or `score`
- Handle `null` values gracefully
- Use `progress.percentage` for loading indicators
- Display `error.message` to users when services fail
- Check `error.retryable` to determine if retry is possible

### ❌ DON'T
- Access `service.data` without checking `service.status` first
- Assume any field will be undefined or missing
- Rely on specific error codes changing
- Modify the response object (treat as immutable)

## 🧪 TESTING THE CONTRACT

Run the contract validation test:
```bash
cd backend
node utils/testApiContract.js
```

This will verify:
- All required fields are present
- Structure is consistent
- Service normalization works
- Progress calculation is correct

## 🚀 EXAMPLE RESPONSES

### Complete Success
```json
{
  "status": "completed",
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
      "status": "success",
      "score": 85,
      "data": { "checks": 15, "passed": 13 },
      "issues": [],
      "error": null,
      "executionTimeMs": 1200
    }
    // ... 5 more services with same structure
  },
  "meta": {
    "version": "1.0",
    "backend": "seo-health-checker",
    "environment": "production"
  }
}
```

### Partial Success (Some Services Failed)
```json
{
  "status": "partial",
  "scanId": "scan_1671234567890_xyz789ghi",
  "url": "https://example.com",
  "startedAt": "2025-12-13T10:00:00.000Z",
  "completedAt": "2025-12-13T10:01:45.000Z",
  "progress": {
    "completedServices": 4,
    "totalServices": 6,
    "percentage": 67
  },
  "services": {
    "accessibility": {
      "status": "success",
      "score": 85,
      "data": { "checks": 15, "passed": 13 },
      "issues": [],
      "error": null,
      "executionTimeMs": 1200
    },
    "backlinks": {
      "status": "failed",
      "score": null,
      "data": null,
      "issues": [],
      "error": {
        "code": "BACKLINKS_API_ERROR",
        "message": "External API temporarily unavailable",
        "retryable": true
      },
      "executionTimeMs": 5000
    }
    // ... 4 more services
  },
  "meta": {
    "version": "1.0",
    "backend": "seo-health-checker",
    "environment": "production"
  }
}
```

## 🔄 FUTURE COMPATIBILITY

This contract is designed for future enhancements:
- **Billing Integration**: Add billing fields without breaking existing structure
- **Async Processing**: Convert to async by changing response behavior, not structure
- **Caching**: Add cache metadata in `meta` object
- **New Services**: Add new services to `services` object
- **Retry Logic**: Use `error.retryable` flag for automatic retries

## 📝 VERSION HISTORY

### v1.0 (December 13, 2025)
- Initial locked contract
- Standardized service response format
- Progress tracking
- Error handling with retry flags
- Complete backward compatibility

---

**🔐 This contract is now LOCKED and must not be changed without proper API versioning.**