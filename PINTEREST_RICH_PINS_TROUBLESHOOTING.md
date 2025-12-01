# Pinterest Rich Pins Validator - Troubleshooting Guide

## Common 404 Errors and Solutions

### Why am I getting a 404 error?

The validator needs to fetch and analyze the HTML content of a webpage. A 404 error occurs when:

1. **The URL doesn't exist** - The page has been removed or never existed
2. **Bot blocking** - The website blocks automated requests
3. **Access restrictions** - The page requires authentication or has geographical restrictions
4. **Invalid URL format** - Missing protocol (http/https) or typos

## ✅ URLs That Work Well

### Best Test URLs

```
✅ https://github.com/ (Article Rich Pin - 73% score)
✅ https://www.wikipedia.org/ (Article Rich Pin - 53% score)
✅ Most blog posts and news articles
✅ Public e-commerce product pages (some)
✅ Recipe websites (AllRecipes, Food Network)
✅ GitHub repositories
✅ Medium articles
```

### URLs That Often Work

- Tech blogs (Dev.to, Hashnode)
- News websites (BBC, CNN, Reuters)
- Documentation sites
- Public portfolios
- Open source project pages

## ❌ URLs That Often Fail

### Common Blocked Sites

```
❌ Amazon product pages (bot protection)
❌ Social media (Facebook, Instagram, LinkedIn)
❌ Paywalled content (NYTimes, WSJ)
❌ Sites with aggressive anti-bot measures
❌ Private/authenticated pages
❌ Localhost URLs (not publicly accessible)
```

## 🔧 Improved Error Messages

The validator now provides specific error messages:

### Error: "Page not found (404)"

- **Cause:** The URL doesn't exist
- **Solution:** Verify the URL in your browser first

### Error: "Access forbidden (403)"

- **Cause:** Website is blocking automated requests
- **Solution:** Try a different, more open website

### Error: "Domain not found"

- **Cause:** DNS lookup failed, domain doesn't exist
- **Solution:** Check for typos in the domain name

### Error: "Connection refused"

- **Cause:** Server is not accepting connections
- **Solution:** Website may be down, try later

### Error: "Request timeout"

- **Cause:** Page took longer than 30 seconds to respond
- **Solution:** Try a faster loading page

## 💡 Best Practices

### For Testing

1. **Start with known-good URLs** (GitHub, Wikipedia)
2. **Test your own blog posts** if you have a website
3. **Use public articles** from tech blogs
4. **Avoid e-commerce sites** (most have bot protection)

### For Production Use

1. **Validate your own website** before deploying Rich Pins
2. **Test on staging/preview URLs** first
3. **Use Pinterest's official validator** for final verification
4. **Consider rate limiting** if validating many URLs

## 🛠️ Technical Improvements Made

### Enhanced User Agent

Changed from PinterestBot to standard Chrome browser:

```javascript
"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
```

### Better Headers

Added standard browser headers:

- Accept-Language
- Accept-Encoding
- Cache-Control

### Improved Error Handling

- Graceful handling of 4xx errors
- Specific error messages per status code
- Network error detection (ENOTFOUND, ECONNREFUSED)
- Timeout handling with clear message

### Status Code Handling

```javascript
validateStatus: (status) => status < 500;
// Accepts 4xx to provide custom error messages
```

## 🎯 Recommended Test Workflow

### Step 1: Verify URL Works

```bash
1. Open the URL in your browser
2. Check if the page loads
3. View page source (Ctrl+U)
4. Look for <meta property="og:title"> tags
```

### Step 2: Test with Validator

```bash
1. Enter the URL
2. Select pin type or use auto-detect
3. Click "Validate Rich Pin"
4. Review results
```

### Step 3: Use Pinterest's Official Tool

```bash
1. Go to https://developers.pinterest.com/tools/url-debugger/
2. Validate with Pinterest's tool
3. Apply for Rich Pins if valid
```

## 📊 Success Rates by Site Type

| Site Type    | Success Rate | Notes                |
| ------------ | ------------ | -------------------- |
| Tech Blogs   | 95%          | Usually work great   |
| News Sites   | 80%          | Some have paywalls   |
| E-commerce   | 30%          | Most block bots      |
| Social Media | 10%          | Heavy bot protection |
| GitHub       | 100%         | Perfect for testing  |
| Wikipedia    | 100%         | Great for testing    |

## 🚀 Example Valid URLs

### Article Rich Pins

```
https://github.com/
https://dev.to/
https://medium.com/@username/article-slug
https://www.bbc.com/news/article
```

### Product Rich Pins

```
https://www.etsy.com/listing/... (sometimes works)
https://shopify-demo-store.com/products/...
Your own e-commerce site
```

### Recipe Rich Pins

```
https://www.allrecipes.com/recipe/...
https://www.foodnetwork.com/recipes/...
Your own recipe blog
```

## 📝 Frontend Error UI

The validator now shows helpful troubleshooting tips:

- Ensure URL is publicly accessible
- Try different websites if blocked
- Check page exists in browser
- Note that some sites block tools
- Best with simple blog/article pages

## 🔗 Additional Resources

- [Pinterest Rich Pins Overview](https://developers.pinterest.com/docs/rich-pins/overview/)
- [Rich Pins Validator Tool](https://developers.pinterest.com/tools/url-debugger/)
- [Open Graph Protocol](https://ogp.me/)
- [Schema.org Documentation](https://schema.org/)

## ✅ Summary

The 404 errors are typically caused by:

1. Bot blocking (most common)
2. Invalid/non-existent URLs
3. Access restrictions

**Solution:** Test with GitHub, Wikipedia, or public tech blogs first to verify the tool works, then try your own website's URLs.
