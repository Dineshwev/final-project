/**
 * Generate SEO recommendations based on analysis results
 */
export const generateRecommendations = (results) => {
  const recommendations = [];
  
  // Add Safe Browsing recommendations if present
  if (results.safeBrowsing) {
    // Critical recommendation if the website is flagged as unsafe
    if (results.safeBrowsing.safe === false) {
      recommendations.push({
        type: 'critical',
        category: 'safety',
        issue: 'Website flagged as unsafe',
        description: `Google Safe Browsing has identified ${results.safeBrowsing.threatCount} security threat(s) on your website. This will severely impact user trust and SEO rankings.`,
        recommendation: 'Immediately address the security issues identified by Google Safe Browsing. This may involve removing malicious code, fixing security vulnerabilities, or cleaning up hacked content.',
        moreInfo: 'https://developers.google.com/safe-browsing',
        currentValue: results.safeBrowsing.threats.map(t => t.type).join(', ') || 'Unsafe'
      });
      
      // Add specific recommendations for each type of threat
      const threatTypes = new Set(results.safeBrowsing.threats.map(t => t.type));
      
      if (threatTypes.has('MALWARE')) {
        recommendations.push({
          type: 'critical',
          category: 'safety',
          issue: 'Malware detected',
          description: 'Your website contains or distributes malicious software that may harm users\' devices or steal information.',
          recommendation: 'Scan your website for malicious code, update all software, and implement stronger security measures to prevent reinfection.',
          moreInfo: 'https://developers.google.com/safe-browsing/v4/reference/rest/v4/ThreatType'
        });
      }
      
      if (threatTypes.has('SOCIAL_ENGINEERING')) {
        recommendations.push({
          type: 'critical',
          category: 'safety',
          issue: 'Phishing or social engineering content detected',
          description: 'Your website contains content designed to mislead users into revealing sensitive information or performing harmful actions.',
          recommendation: 'Remove all deceptive content and ensure your website clearly represents its true purpose.',
          moreInfo: 'https://developers.google.com/safe-browsing/v4/reference/rest/v4/ThreatType'
        });
      }
    }
  }

  // Add security recommendations if present
  if (results.security && results.security.recommendations) {
    results.security.recommendations.forEach(secRec => {
      recommendations.push({
        type: secRec.severity === 'high' ? 'critical' : (secRec.severity === 'medium' ? 'warning' : 'info'),
        category: 'security',
        issue: secRec.type === 'security_header' ? `Missing or invalid ${secRec.header}` : secRec.message,
        description: secRec.message,
        recommendation: secRec.type === 'security_header' 
          ? (secRec.implementationTip || `Add the ${secRec.header} header to improve security`)
          : secRec.message,
        moreInfo: secRec.moreInfo,
        currentValue: secRec.currentValue || 'not set'
      });
    });
    
    // Add specific section for security headers if any missing
    if (results.security.summary && results.security.summary.missing > 0) {
      recommendations.push({
        type: 'warning',
        category: 'security',
        issue: 'Security headers audit',
        description: `Your website is missing ${results.security.summary.missing} important security headers out of ${results.security.summary.total} analyzed. ${results.security.summary.critical > 0 ? `${results.security.summary.critical} of these are critical.` : ''}`,
        recommendation: 'Implement the recommended security headers to improve your website\'s security posture and protect users.',
        moreInfo: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#security'
      });
    }
  }
  
  // Metadata recommendations
  if (results.metadata) {
    // Title recommendations
    if (!results.metadata.title || !results.metadata.title.content) {
      recommendations.push({
        type: 'critical',
        category: 'metadata',
        issue: 'Missing title tag',
        description: 'The page is missing a title tag, which is crucial for SEO and user experience.',
        recommendation: 'Add a descriptive title tag of 50-60 characters that includes your main keyword.'
      });
    } else if (results.metadata.title.length < 30) {
      recommendations.push({
        type: 'warning',
        category: 'metadata',
        issue: 'Title too short',
        description: `Your title is only ${results.metadata.title.length} characters long.`,
        recommendation: 'Make the title more descriptive, aim for 50-60 characters including your main keywords.'
      });
    } else if (results.metadata.title.length > 60) {
      recommendations.push({
        type: 'warning',
        category: 'metadata',
        issue: 'Title too long',
        description: `Your title is ${results.metadata.title.length} characters long and may be truncated in search results.`,
        recommendation: 'Shorten your title to 50-60 characters to ensure it displays fully in search results.'
      });
    }
    
    // Meta description recommendations
    if (!results.metadata.description || !results.metadata.description.content) {
      recommendations.push({
        type: 'critical',
        category: 'metadata',
        issue: 'Missing meta description',
        description: 'The page is missing a meta description, which affects click-through rates from search results.',
        recommendation: 'Add a compelling meta description of 120-160 characters that includes your main keywords.'
      });
    } else if (results.metadata.description.length < 100) {
      recommendations.push({
        type: 'warning',
        category: 'metadata',
        issue: 'Meta description too short',
        description: `Your meta description is only ${results.metadata.description.length} characters long.`,
        recommendation: 'Expand your meta description to 120-160 characters to be more descriptive and entice clicks.'
      });
    } else if (results.metadata.description.length > 160) {
      recommendations.push({
        type: 'warning',
        category: 'metadata',
        issue: 'Meta description too long',
        description: `Your meta description is ${results.metadata.description.length} characters long and may be truncated in search results.`,
        recommendation: 'Shorten your meta description to 120-160 characters to ensure it displays fully in search results.'
      });
    }
    
    // Canonical tag recommendations
    if (!results.metadata.canonical || !results.metadata.canonical.url) {
      recommendations.push({
        type: 'warning',
        category: 'metadata',
        issue: 'Missing canonical tag',
        description: 'The page is missing a canonical tag, which helps prevent duplicate content issues.',
        recommendation: 'Add a canonical tag pointing to the preferred version of this page.'
      });
    } else if (!results.metadata.canonical.matches) {
      recommendations.push({
        type: 'warning',
        category: 'metadata',
        issue: 'Canonical tag mismatch',
        description: 'The canonical tag points to a different URL than the current page.',
        recommendation: 'Ensure the canonical tag is intentionally pointing to another URL, or update it to match the current page URL.'
      });
    }
    
    // Keyword consistency recommendations
    if (results.metadata.keywordConsistency) {
      if (
        !results.metadata.title.keywordMatch &&
        !results.metadata.description.keywordMatch &&
        !results.metadata.url.keywordMatch
      ) {
        recommendations.push({
          type: 'critical',
          category: 'keywords',
          issue: 'Poor keyword consistency',
          description: 'Your main keywords are not consistently used across your title, meta description, and URL.',
          recommendation: 'Ensure your main keywords appear in your page title, meta description, URL, and headings.'
        });
      }
    }
  }
  
  // Headings recommendations
  if (results.headings) {
    if (!results.headings.structure.hasH1) {
      recommendations.push({
        type: 'critical',
        category: 'headings',
        issue: 'Missing H1 heading',
        description: 'The page is missing an H1 heading, which is important for both SEO and accessibility.',
        recommendation: 'Add a single H1 heading that describes the main topic of the page and includes your primary keyword.'
      });
    } else if (!results.headings.structure.singleH1) {
      recommendations.push({
        type: 'warning',
        category: 'headings',
        issue: 'Multiple H1 headings',
        description: `The page has ${results.headings.counts.h1} H1 headings. Most pages should only have one H1 heading.`,
        recommendation: 'Restructure your headings to have a single H1 that represents the main topic, with H2-H6 for subtopics.'
      });
    }
    
    if (!results.headings.structure.hierarchyValid) {
      recommendations.push({
        type: 'warning',
        category: 'headings',
        issue: 'Invalid heading hierarchy',
        description: 'The heading structure is not properly nested or has skipped levels.',
        recommendation: 'Ensure a proper heading hierarchy with H1 > H2 > H3, etc., without skipping levels.'
      });
    }
    
    // Content recommendations
    if (results.headings.contentStats.wordCount < 300) {
      recommendations.push({
        type: 'warning',
        category: 'content',
        issue: 'Thin content',
        description: `The page only has ${results.headings.contentStats.wordCount} words, which may be seen as thin content by search engines.`,
        recommendation: 'Add more comprehensive content with at least 500 words to provide more value to users and improve search rankings.'
      });
    }
    
    // Parse the contentToHtmlRatio percentage
    const contentRatio = parseFloat(results.headings.contentStats.contentToHtmlRatio);
    if (contentRatio < 10) {
      recommendations.push({
        type: 'warning',
        category: 'content',
        issue: 'Low text-to-HTML ratio',
        description: `The page has a text-to-HTML ratio of ${results.headings.contentStats.contentToHtmlRatio}, which indicates excessive code compared to content.`,
        recommendation: 'Improve your text-to-HTML ratio by adding more content or optimizing your HTML code.'
      });
    }
  }
  
  // Image recommendations
  if (results.images) {
    if (results.images.count > 0) {
      const altPercentage = parseFloat(results.images.altTextCoverage);
      
      if (altPercentage < 80) {
        recommendations.push({
          type: 'warning',
          category: 'images',
          issue: 'Missing alt text',
          description: `${results.images.withoutAlt + results.images.withEmptyAlt} out of ${results.images.count} images are missing proper alt text.`,
          recommendation: 'Add descriptive alt text to all images to improve accessibility and SEO.'
        });
      }
      
      if (results.images.largeImages > 0) {
        recommendations.push({
          type: 'warning',
          category: 'images',
          issue: 'Large images',
          description: `${results.images.largeImages} images appear to be large and may affect page load speed.`,
          recommendation: 'Optimize and resize large images to improve page load performance.'
        });
      }
    }
  }
  
  // Links recommendations
  if (results.links) {
    if (results.links.empty > 0) {
      recommendations.push({
        type: 'warning',
        category: 'links',
        issue: 'Empty links',
        description: `The page has ${results.links.empty} links with no href value or javascript: links.`,
        recommendation: 'Ensure all links have valid destinations or consider replacing them with buttons if they trigger JavaScript actions.'
      });
    }
    
    if (results.links.broken > 0) {
      recommendations.push({
        type: 'critical',
        category: 'links',
        issue: 'Broken links',
        description: `The page may have ${results.links.broken} broken links.`,
        recommendation: 'Fix or remove broken links to improve user experience and SEO.'
      });
    }
  }
  
  // Security recommendations
  if (results.security) {
    if (results.security.ssl && !results.security.ssl.enabled) {
      recommendations.push({
        type: 'critical',
        category: 'security',
        issue: 'No SSL/HTTPS',
        description: 'The website is not using HTTPS, which is crucial for security and is a ranking factor.',
        recommendation: 'Install an SSL certificate and ensure your website uses HTTPS for all pages.'
      });
    } else if (
      results.security.https && 
      results.security.https.enabled && 
      !results.security.https.redirectFromHttp
    ) {
      recommendations.push({
        type: 'warning',
        category: 'security',
        issue: 'No HTTP to HTTPS redirect',
        description: 'The website has HTTPS enabled, but does not redirect HTTP traffic to HTTPS.',
        recommendation: 'Set up a permanent (301) redirect from HTTP to HTTPS to ensure all traffic is secure.'
      });
    }
    
    if (results.security.hsts && !results.security.hsts.enabled) {
      recommendations.push({
        type: 'info',
        category: 'security',
        issue: 'HSTS not enabled',
        description: 'HTTP Strict Transport Security (HSTS) is not enabled on your website.',
        recommendation: 'Enable HSTS to enhance security by forcing browsers to use secure connections.'
      });
    }
  }
  
  // Robots.txt recommendations
  if (results.robotsTxt) {
    if (!results.robotsTxt.exists) {
      recommendations.push({
        type: 'info',
        category: 'crawlability',
        issue: 'No robots.txt file',
        description: 'The website does not have a robots.txt file.',
        recommendation: 'Create a robots.txt file to control search engine crawlers and provide a path to your sitemap.'
      });
    }
  }
  
  // Sitemap recommendations
  if (results.sitemap) {
    if (!results.sitemap.exists) {
      recommendations.push({
        type: 'warning',
        category: 'crawlability',
        issue: 'No sitemap.xml',
        description: 'The website does not have a sitemap.xml file.',
        recommendation: 'Create a sitemap.xml file to help search engines discover and index all your important pages.'
      });
    } else if (results.sitemap.urlCount === 0) {
      recommendations.push({
        type: 'warning',
        category: 'crawlability',
        issue: 'Empty sitemap',
        description: 'The sitemap.xml file exists but contains no URLs.',
        recommendation: 'Update your sitemap to include all important URLs on your website.'
      });
    }
  }
  
  // Lighthouse recommendations
  if (results.lighthouse && results.lighthouse.scores) {
    if (results.lighthouse.scores.performance < 70) {
      recommendations.push({
        type: 'warning',
        category: 'performance',
        issue: 'Poor performance score',
        description: `Your Lighthouse performance score is ${results.lighthouse.scores.performance}/100, which indicates performance issues.`,
        recommendation: 'Improve page loading speed by optimizing images, minifying CSS/JS, and eliminating render-blocking resources.'
      });
    }
    
    if (results.lighthouse.scores.accessibility < 70) {
      recommendations.push({
        type: 'warning',
        category: 'accessibility',
        issue: 'Poor accessibility score',
        description: `Your Lighthouse accessibility score is ${results.lighthouse.scores.accessibility}/100, which indicates accessibility issues.`,
        recommendation: 'Improve accessibility by adding proper alt text, ensuring sufficient color contrast, and using semantic HTML.'
      });
    }
    
    if (results.lighthouse.scores.seo < 70) {
      recommendations.push({
        type: 'warning',
        category: 'seo',
        issue: 'Poor SEO score',
        description: `Your Lighthouse SEO score is ${results.lighthouse.scores.seo}/100, which indicates SEO issues.`,
        recommendation: 'Address the specific SEO issues identified in the Lighthouse report to improve your score.'
      });
    }
    
    if (results.lighthouse.scores.bestPractices < 70) {
      recommendations.push({
        type: 'info',
        category: 'best-practices',
        issue: 'Poor best practices score',
        description: `Your Lighthouse best practices score is ${results.lighthouse.scores.bestPractices}/100, which indicates potential issues.`,
        recommendation: 'Address the best practices issues identified in the Lighthouse report to improve your score.'
      });
    }
    
    // Specific Lighthouse audit recommendations
    if (results.lighthouse.audits) {
      if (!results.lighthouse.audits.hasTitleElement) {
        recommendations.push({
          type: 'critical',
          category: 'seo',
          issue: 'Missing title element (from Lighthouse)',
          description: 'Lighthouse detected that the page is missing a title element.',
          recommendation: 'Add a unique, descriptive title element to your page.'
        });
      }
      
      if (!results.lighthouse.audits.hasMetaDescription) {
        recommendations.push({
          type: 'critical',
          category: 'seo',
          issue: 'Missing meta description (from Lighthouse)',
          description: 'Lighthouse detected that the page is missing a meta description.',
          recommendation: 'Add a meta description that summarizes the page content within 120-160 characters.'
        });
      }
      
      if (!results.lighthouse.audits.hasViewport) {
        recommendations.push({
          type: 'critical',
          category: 'mobile',
          issue: 'Missing viewport meta tag',
          description: 'The page is missing a viewport meta tag, which is essential for responsive design.',
          recommendation: 'Add a viewport meta tag like: <meta name="viewport" content="width=device-width, initial-scale=1">.'
        });
      }
      
      if (!results.lighthouse.audits.hasCrawlableLinks) {
        recommendations.push({
          type: 'warning',
          category: 'seo',
          issue: 'Non-crawlable links',
          description: 'Some links on your page are not crawlable by search engines.',
          recommendation: 'Ensure all important links use proper <a> tags with href attributes rather than JavaScript event handlers.'
        });
      }
      
      if (!results.lighthouse.audits.hasValidCanonical) {
        recommendations.push({
          type: 'warning',
          category: 'seo',
          issue: 'Invalid canonical URL',
          description: 'The canonical URL for this page is invalid or incorrect.',
          recommendation: 'Ensure your canonical tag points to a valid URL that represents the preferred version of this page.'
        });
      }
      
      if (!results.lighthouse.audits.hasAltText) {
        recommendations.push({
          type: 'warning',
          category: 'accessibility',
          issue: 'Images missing alt text',
          description: 'Some images on your page are missing alt text.',
          recommendation: 'Add descriptive alt text to all images for better accessibility and SEO.'
        });
      }
      
      if (!results.lighthouse.audits.usesOptimizedImages) {
        recommendations.push({
          type: 'warning',
          category: 'performance',
          issue: 'Unoptimized images',
          description: 'Your page contains unoptimized images that slow down loading.',
          recommendation: 'Optimize images by compressing them and using modern formats like WebP.'
        });
      }
      
      if (!results.lighthouse.audits.usesTextCompression) {
        recommendations.push({
          type: 'warning',
          category: 'performance',
          issue: 'No text compression',
          description: 'Your server is not using text compression.',
          recommendation: 'Enable GZIP or Brotli compression on your server to reduce file sizes and improve loading speed.'
        });
      }
    }
  }
  
  return recommendations;
};

// Default export
export default {
  generateRecommendations
};