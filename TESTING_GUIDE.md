# Testing Guide - Scan Results Feature

## 🧪 Quick Test Checklist

### ✅ Prerequisites
- [ ] Backend server running on port 3002
- [ ] Frontend running (http://localhost:3000 or your dev server)
- [ ] Browser console open (F12) for debugging

### ✅ Test Steps

#### 1. **Navigate to Scan Page**
```
URL: http://localhost:3000/scan
```
Expected: Beautiful gradient page with scan form

#### 2. **Enter Test URL**
Try one of these:
```
https://www.world.rugby/tournaments/videos/818739/become-your-own-hero/become-your-own-hero-hollie-davidson
https://www.google.com
https://www.github.com
https://example.com
```

#### 3. **Submit Scan**
- Click "Start SEO Analysis" button
- Button should show "Scanning Website..." with spinner
- Progress bar should appear and update

#### 4. **Watch Progress**
Expected behavior:
- Progress bar starts at 0%
- Updates every second based on server progress
- Shows percentage (0-100%)
- Page stays on scanning state

#### 5. **Wait for Results**
Time: ~5-30 seconds (depends on website)

Expected:
- Progress reaches 100%
- Scanning state ends
- Results automatically appear

#### 6. **Verify Results Display**

##### Success Banner ✅
- Green banner at top
- Shows "Scan Complete!"
- Displays scanned URL
- Shows completion timestamp

##### Score Cards 📊
Should see 4 cards:
- **Performance** (Lightning icon, Blue)
- **SEO** (Chart icon, Purple)
- **Accessibility** (Eye icon, Green)
- **Best Practices** (Shield icon, Indigo)

Each card should show:
- Score out of 100
- Color-coded (Green: 90+, Yellow: 70-89, Red: <70)
- Progress bar matching score

##### SEO Analysis Details 📋
Should see cards for:
- **Metadata Analysis**: Title, description, issues
- **Heading Structure**: H1, H2, H3 counts
- **Image Analysis**: Total images, alt text stats
- **Link Analysis**: Internal/external link counts

##### Recommendations 💡
- Color-coded priority badges (High/Medium/Low)
- Category labels (SEO, Performance, etc.)
- Clear issue descriptions
- Actionable suggestions

##### Complete Data 📄
- Collapsible JSON view
- Scrollable area
- Full raw data

### ✅ Error Testing

#### Test 1: Invalid URL
```
Input: not-a-url
Expected: HTML5 validation error
```

#### Test 2: Unreachable URL
```
Input: https://this-domain-does-not-exist-12345.com
Expected: Scan should fail with error message
```

#### Test 3: Timeout (if possible)
```
Input: Very slow website
Expected: After 60 seconds, show "Scan timed out" error
```

### ✅ Browser Console Checks

#### During Scan
Look for:
```javascript
// Network tab:
POST /api/scan → 202 response
GET /api/scan/{scanId} → 200 (repeated)
GET /api/scan/{scanId}/results → 200 (when complete)
```

#### Console logs
Should NOT see:
- ❌ Uncaught errors
- ❌ Failed to fetch
- ❌ CORS errors

May see (warnings are OK):
- ⚠️ PageSpeed API rate limit warnings

### ✅ Responsive Design Test

#### Desktop (1920x1080)
- [ ] 4-column score card grid
- [ ] 2-column SEO details grid
- [ ] Full navigation visible

#### Tablet (768px)
- [ ] 2-column score card grid
- [ ] Single column SEO details
- [ ] Navigation adjusted

#### Mobile (375px)
- [ ] Single column score cards
- [ ] Stacked layout
- [ ] Hamburger menu

### ✅ Server-Side Verification

Check backend terminal for:
```
POST /api/scan 202 ...
GET /api/scan/[scanId] 200 ...
GET /api/scan/[scanId] 304 ... (repeated polling)
GET /api/scan/[scanId]/results 200 ...
```

Scan process logs:
```
Scan [scanId] completed successfully
```

### ✅ Results Data Validation

Verify results contain:
```json
{
  "scanId": "uuid",
  "url": "https://...",
  "completedAt": "2025-10-17...",
  "seo": {
    "metadata": { ... },
    "headings": { ... },
    "images": { ... },
    "links": { ... }
  },
  "lighthouse": {
    "scores": {
      "performance": 0-1,
      "seo": 0-1,
      "accessibility": 0-1,
      "bestPractices": 0-1
    }
  },
  "recommendations": [ ... ]
}
```

## 🐛 Common Issues & Solutions

### Issue: "Connection refused"
**Solution**: Backend not running
```powershell
cd backend
node server.js
```

### Issue: Results not showing
**Check**:
1. Browser console for errors
2. Network tab - verify all 3 API calls succeed
3. Backend logs for scan completion

### Issue: "Scan timed out"
**Causes**:
- Website is very slow
- API rate limits hit
- Network issues

**Solution**: Try another URL or wait and retry

### Issue: Scores missing or 0
**Cause**: Lighthouse/PageSpeed API issues
**Note**: This is expected if API keys are rate limited
**Check**: Backend should show warnings about API availability

### Issue: Recommendations empty
**Cause**: Website has perfect scores (rare!)
**OR**: Analysis incomplete due to API limits

## ✅ Success Criteria

Test is successful if:
- ✅ Scan starts without errors
- ✅ Progress bar updates smoothly
- ✅ Results display after completion
- ✅ All score cards render
- ✅ SEO details show data
- ✅ No console errors
- ✅ Mobile responsive works
- ✅ Multiple scans can be run sequentially

## 📸 Screenshots to Verify

Take screenshots of:
1. Empty scan page (starting state)
2. Scanning in progress (with progress bar)
3. Complete results page (all sections)
4. Mobile view
5. Recommendations section
6. Console network tab

---

**Test Duration**: ~2-3 minutes per URL
**Recommended Test URLs**: 3-5 different websites
**Browser**: Chrome, Firefox, Edge (test all if possible)
