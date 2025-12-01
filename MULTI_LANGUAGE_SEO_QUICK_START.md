# 🚀 Multi-Language SEO Checker - Quick Start Guide

## What is it?

The Multi-Language SEO Checker analyzes your website's international SEO setup, checking:

- 🏷️ Hreflang tags (language versions)
- 🌐 Language declarations
- 📝 Content language detection
- 🔗 URL structure
- 🔤 Character encoding
- ↔️ RTL (Right-to-Left) support

## How to Access

1. **Login** to your SEO Analyzer dashboard
2. Click **"Features"** in the top navigation
3. Select **"Multi-Language SEO"** from the dropdown
4. Or go directly to: `http://localhost:3000/multi-language-seo`

## How to Use

### Step 1: Enter URL

```
https://www.wikipedia.org
```

Type or paste any website URL you want to analyze.

### Step 2: Click Analyze

The tool will:

- Fetch the webpage
- Parse hreflang tags
- Detect content language
- Check all declarations
- Calculate score

### Step 3: Review Results

#### 📊 Score Card

- **Grade**: A+ to F (based on best practices)
- **Overall Score**: 0-100 points
- **Total Issues**: Number of problems found

#### 📈 Summary Stats

- Hreflang tags count
- Languages detected
- Bidirectional links status

#### 🏷️ Hreflang Tags

Expandable list showing each language version:

```html
en → https://example.com/en/ fr → https://example.com/fr/ es →
https://example.com/es/
```

#### 🌍 Language Detection

- **Detected Language**: What the content appears to be
- **Confidence**: How sure the detection is (0-100%)
- **Declared Language**: What the HTML says it is
- **Match**: Do they agree? ✅ or ❌

#### ⚠️ Issues

Grouped by severity:

- 🔴 **Critical**: Must fix immediately
- 🟠 **High**: Important to fix soon
- 🟡 **Medium**: Should fix eventually
- 🔵 **Low**: Nice to have

Each issue shows:

- **Message**: What's wrong
- **Impact**: Why it matters
- **Fix**: How to resolve it

#### 💡 Recommendations

Actionable suggestions to improve your international SEO.

## Sample URLs to Try

### ✅ Good Examples

| URL                       | Why It's Good                   |
| ------------------------- | ------------------------------- |
| https://www.wikipedia.org | Perfect hreflang implementation |
| https://www.airbnb.com    | Clean subdirectory structure    |
| https://www.google.com    | Multiple regional versions      |

### ⚠️ Common Issues Examples

| URL                   | Typical Issues              |
| --------------------- | --------------------------- |
| Small business sites  | Often missing hreflang tags |
| WordPress sites       | May have plugin conflicts   |
| Single-language sites | No multilingual setup       |

## Understanding Your Results

### Score Ranges

| Score  | Grade | Meaning                                    |
| ------ | ----- | ------------------------------------------ |
| 95-100 | A+    | Perfect international SEO                  |
| 85-94  | A     | Excellent, minor issues                    |
| 70-84  | B     | Good, some improvements needed             |
| 50-69  | C     | Fair, several issues to fix                |
| 30-49  | D     | Poor, many problems                        |
| 0-29   | F     | Critical issues, needs immediate attention |

### Common Issues & Fixes

#### ❌ "Missing x-default hreflang tag"

**What it means**: No default version specified  
**Fix**: Add this to your `<head>`:

```html
<link rel="alternate" hreflang="x-default" href="https://example.com/en/" />
```

#### ❌ "Page does not reference itself"

**What it means**: Missing self-referencing hreflang  
**Fix**: Each page should include itself:

```html
<!-- On /en/ page -->
<link rel="alternate" hreflang="en" href="https://example.com/en/" />
```

#### ❌ "Bidirectional linking is incomplete"

**What it means**: Language versions don't link back  
**Fix**: Ensure all pages reference each other:

```html
<!-- On EVERY page, include ALL versions -->
<link rel="alternate" hreflang="en" href="https://example.com/en/" />
<link rel="alternate" hreflang="fr" href="https://example.com/fr/" />
<link rel="alternate" hreflang="es" href="https://example.com/es/" />
<link rel="alternate" hreflang="x-default" href="https://example.com/en/" />
```

#### ❌ "Invalid language code"

**What it means**: Using wrong format  
**Fix**: Use ISO 639-1 codes:

- ✅ `en` (English)
- ✅ `es-MX` (Spanish - Mexico)
- ✅ `fr-FR` (French - France)
- ❌ `english` (wrong!)
- ❌ `ESP` (wrong!)

#### ❌ "Language declarations are inconsistent"

**What it means**: HTML and meta tags don't match  
**Fix**: Make them consistent:

```html
<html lang="en">
  <head>
    <meta http-equiv="content-language" content="en" />
  </head>
</html>
```

#### ❌ "Non-UTF-8 encoding"

**What it means**: Using old character encoding  
**Fix**: Use UTF-8:

```html
<meta charset="UTF-8" />
```

#### ❌ "URL structure not optimal"

**What it means**: Using URL parameters or other bad patterns  
**Fix**: Use subdirectories:

- ✅ Good: `example.com/en/`, `example.com/fr/`
- ⚠️ Okay: `en.example.com`, `fr.example.com`
- ❌ Bad: `example.com?lang=en`

#### ❌ "RTL language detected but no dir attribute"

**What it means**: Arabic/Hebrew site missing RTL setup  
**Fix**: Add direction attribute:

```html
<html lang="ar" dir="rtl"></html>
```

## URL Structure Best Practices

### 🏆 Recommended: Subdirectories

```
https://example.com/en/     (English)
https://example.com/fr/     (French)
https://example.com/es/     (Spanish)
```

**Pros**: Easy to manage, keeps domain authority  
**Cons**: Requires careful URL planning

### ✅ Good: Subdomains

```
https://en.example.com/     (English)
https://fr.example.com/     (French)
https://es.example.com/     (Spanish)
```

**Pros**: Easy to separate, can use different servers  
**Cons**: Splits domain authority

### ✅ Good: ccTLDs (Country Code Top-Level Domains)

```
https://example.com/        (English - US)
https://example.fr/         (French)
https://example.es/         (Spanish)
```

**Pros**: Strong geo-targeting signal  
**Cons**: Expensive, requires multiple domains

### ❌ Avoid: URL Parameters

```
https://example.com?lang=en
https://example.com?lang=fr
```

**Pros**: Easy to implement  
**Cons**: Poor for SEO, confusing for search engines

## Complete Hreflang Example

Here's a perfect implementation for a site with English, French, and Spanish versions:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My Multilingual Site</title>

    <!-- Hreflang tags -->
    <link rel="alternate" hreflang="en" href="https://example.com/en/" />
    <link rel="alternate" hreflang="fr" href="https://example.com/fr/" />
    <link rel="alternate" hreflang="es" href="https://example.com/es/" />
    <link rel="alternate" hreflang="x-default" href="https://example.com/en/" />

    <!-- Canonical tag -->
    <link rel="canonical" href="https://example.com/en/" />
  </head>
  <body>
    <!-- Your content -->
  </body>
</html>
```

**Important**: This SAME structure must be on ALL language versions (with the correct `lang` attribute).

## Supported Languages

The tool detects these languages automatically:

| Language | Code | Language   | Code |
| -------- | ---- | ---------- | ---- |
| English  | en   | Spanish    | es   |
| French   | fr   | German     | de   |
| Italian  | it   | Portuguese | pt   |
| Russian  | ru   | Chinese    | zh   |
| Japanese | ja   | Korean     | ko   |
| Arabic   | ar   | Hindi      | hi   |
| Hebrew   | he   | Dutch      | nl   |
| Polish   | pl   | Turkish    | tr   |
| Thai     | th   | Vietnamese | vi   |

Plus 30+ more languages!

## Tips for Best Results

### ✅ Do's

1. **Use subdirectories** for language versions
2. **Include x-default** tag for default language
3. **Make it bidirectional** - all pages reference each other
4. **Use UTF-8** encoding always
5. **Be consistent** - same language codes everywhere
6. **Self-reference** - each page includes itself
7. **Match content** - declared language should match actual content

### ❌ Don'ts

1. Don't use URL parameters for languages
2. Don't mix language code formats
3. Don't forget x-default tag
4. Don't have one-way hreflang links
5. Don't use wrong language codes
6. Don't forget to self-reference
7. Don't declare wrong language for content

## Troubleshooting

### "No hreflang tags found"

**Problem**: The page doesn't have any hreflang tags  
**Solution**: Add them if you have multiple language versions

### "Language mismatch detected"

**Problem**: HTML says "en" but content is in French  
**Solution**: Fix the `lang` attribute to match actual content

### "Bidirectional links broken"

**Problem**: Not all pages reference each other  
**Solution**: Add the complete set of hreflang tags to every language version

### "Invalid URL format"

**Problem**: The URL you entered is malformed  
**Solution**: Include `https://` at the start

### "Failed to fetch URL"

**Problem**: Website is blocking the analyzer or is down  
**Solution**: Try again later or check if site is accessible

## Need Help?

### Resources

- [Google's International SEO Guide](https://developers.google.com/search/docs/specialty/international)
- [Hreflang Tags Guide](https://ahrefs.com/blog/hreflang-tags/)
- [Language Code List](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)

### Common Questions

**Q: Do I need hreflang tags if I only have one language?**  
A: No, hreflang tags are only needed for multi-language/multi-regional sites.

**Q: Should I use language + region codes (en-US, en-GB)?**  
A: Yes, if you have different content for different regions (US vs UK English).

**Q: Can I use hreflang for different countries with same language?**  
A: Yes! Use codes like `en-US`, `en-GB`, `en-AU` for US, UK, Australian English.

**Q: What's the x-default tag for?**  
A: It's the fallback version for users whose language doesn't match any specific version.

**Q: Does hreflang affect rankings?**  
A: Not directly, but it ensures users see the right language version, improving user experience.

**Q: Can I use hreflang in sitemap instead of HTML?**  
A: Yes! Google supports hreflang in both HTML `<link>` tags and XML sitemaps.

---

## 🎉 Ready to Optimize!

Now you're ready to analyze and improve your international SEO. Start with the sample URLs, then try your own sites!

**Happy optimizing!** 🚀🌍
