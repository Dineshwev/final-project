import puppeteer from "puppeteer";
import crypto from "crypto";
import { URL } from "url";
import natural from "natural";
import { removeStopwords } from "stopword";

const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

// Stop words for content filtering
const CONTENT_SELECTORS_TO_REMOVE = [
  "header",
  "footer",
  "nav",
  "aside",
  ".sidebar",
  ".menu",
  ".navigation",
  "#header",
  "#footer",
  ".advertisement",
  ".ad",
  ".cookie-banner",
  "script",
  "style",
  "noscript",
];

/**
 * Crawl a website and discover all internal pages
 * @param {string} startUrl - Starting URL to crawl
 * @param {number} maxPages - Maximum pages to crawl
 * @param {object} options - Crawling options
 * @returns {Promise<Array>} Array of discovered pages with content
 */
export async function crawlWebsite(startUrl, maxPages = 50, options = {}) {
  const {
    timeout = 30000,
    waitUntil = "networkidle2",
    excludePatterns = [/\.(pdf|jpg|jpeg|png|gif|zip|exe)$/i],
  } = options;

  console.log(`Starting crawl from: ${startUrl}, max pages: ${maxPages}`);

  const baseUrl = new URL(startUrl);
  const visitedUrls = new Set();
  const toVisit = [startUrl];
  const pages = [];

  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    while (toVisit.length > 0 && pages.length < maxPages) {
      const currentUrl = toVisit.shift();

      if (visitedUrls.has(currentUrl)) continue;

      // Skip excluded patterns
      if (excludePatterns.some((pattern) => pattern.test(currentUrl))) {
        console.log(`Skipping excluded URL: ${currentUrl}`);
        continue;
      }

      visitedUrls.add(currentUrl);

      console.log(`Crawling ${pages.length + 1}/${maxPages}: ${currentUrl}`);

      try {
        const page = await browser.newPage();

        // Set user agent
        await page.setUserAgent(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        );

        // Navigate to page
        await page.goto(currentUrl, {
          timeout,
          waitUntil,
        });

        // Extract page data
        const pageData = await page.evaluate(() => {
          // Get title
          const title = document.title || "";

          // Get all links
          const links = Array.from(document.querySelectorAll("a[href]"))
            .map((a) => a.href)
            .filter(
              (href) =>
                href &&
                !href.startsWith("javascript:") &&
                !href.startsWith("mailto:")
            );

          // Get full HTML
          const html = document.documentElement.outerHTML;

          // Get meta description
          const metaDesc =
            document.querySelector("meta[name='description']")?.content || "";

          return { title, links, html, metaDesc };
        });

        await page.close();

        // Store page data
        pages.push({
          url: currentUrl,
          title: pageData.title,
          html: pageData.html,
          metaDescription: pageData.metaDesc,
          discoveredLinks: pageData.links,
        });

        // Add new internal links to visit queue
        for (const link of pageData.links) {
          try {
            const linkUrl = new URL(link, currentUrl);

            // Only crawl same domain
            if (
              linkUrl.hostname === baseUrl.hostname &&
              !visitedUrls.has(linkUrl.href) &&
              !toVisit.includes(linkUrl.href)
            ) {
              // Remove hash fragments
              const cleanUrl =
                linkUrl.origin + linkUrl.pathname + linkUrl.search;
              if (!visitedUrls.has(cleanUrl) && !toVisit.includes(cleanUrl)) {
                toVisit.push(cleanUrl);
              }
            }
          } catch (err) {
            // Invalid URL, skip
          }
        }
      } catch (error) {
        console.error(`Error crawling ${currentUrl}:`, error.message);
      }
    }

    console.log(`Crawl complete. Discovered ${pages.length} pages.`);
    return pages;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Extract main content from HTML, removing boilerplate
 * @param {string} html - Full HTML content
 * @returns {string} Extracted main content
 */
export function extractMainContent(html) {
  // Simple regex-based content extraction
  // In production, consider using libraries like Mozilla's Readability

  let content = html;

  // Remove script and style tags with content
  content = content.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    " "
  );
  content = content.replace(
    /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
    " "
  );
  content = content.replace(
    /<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi,
    " "
  );

  // Remove common navigation/header/footer sections
  content = content.replace(
    /<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi,
    " "
  );
  content = content.replace(
    /<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi,
    " "
  );
  content = content.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, " ");
  content = content.replace(
    /<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi,
    " "
  );

  // Try to extract main content area
  const mainMatch = content.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) {
    content = mainMatch[1];
  } else {
    // Try article tag
    const articleMatch = content.match(
      /<article\b[^>]*>([\s\S]*?)<\/article>/i
    );
    if (articleMatch) {
      content = articleMatch[1];
    }
  }

  // Remove all HTML tags
  content = content.replace(/<[^>]+>/g, " ");

  // Decode HTML entities
  content = content
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/gi, " ");

  // Normalize whitespace
  content = content.replace(/\s+/g, " ").trim();

  return content;
}

/**
 * Preprocess text for comparison
 * @param {string} text - Raw text
 * @returns {string} Preprocessed text
 */
export function preprocessText(text) {
  // Lowercase
  let processed = text.toLowerCase();

  // Remove special characters but keep spaces
  processed = processed.replace(/[^a-z0-9\s]/g, " ");

  // Normalize whitespace
  processed = processed.replace(/\s+/g, " ").trim();

  // Tokenize
  const tokens = tokenizer.tokenize(processed);

  // Remove stop words
  const filteredTokens = removeStopwords(tokens);

  // Join back
  return filteredTokens.join(" ");
}

/**
 * Generate MD5 hash for exact duplicate detection
 * @param {string} text - Text to hash
 * @returns {string} MD5 hash
 */
export function generateContentHash(text) {
  const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();
  return crypto.createHash("md5").update(normalized).digest("hex");
}

/**
 * Calculate cosine similarity between two texts using TF-IDF
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {number} Similarity score (0-1)
 */
export function calculateSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;

  // Preprocess texts
  const processed1 = preprocessText(text1);
  const processed2 = preprocessText(text2);

  if (!processed1 || !processed2) return 0;

  // Create TF-IDF vectors
  const tfidf = new TfIdf();
  tfidf.addDocument(processed1);
  tfidf.addDocument(processed2);

  // Get all terms
  const allTerms = new Set();

  tfidf.listTerms(0).forEach((item) => allTerms.add(item.term));
  tfidf.listTerms(1).forEach((item) => allTerms.add(item.term));

  // Build vectors
  const vector1 = [];
  const vector2 = [];

  for (const term of allTerms) {
    vector1.push(tfidf.tfidf(term, 0));
    vector2.push(tfidf.tfidf(term, 1));
  }

  // Calculate cosine similarity
  const similarity = cosineSimilarity(vector1, vector2);

  return similarity;
}

/**
 * Calculate cosine similarity between two vectors
 * @param {Array} vec1 - First vector
 * @param {Array} vec2 - Second vector
 * @returns {number} Cosine similarity (0-1)
 */
function cosineSimilarity(vec1, vec2) {
  if (vec1.length !== vec2.length) return 0;

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    magnitude1 += vec1[i] * vec1[i];
    magnitude2 += vec2[i] * vec2[i];
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) return 0;

  return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Detect duplicate and near-duplicate content
 * @param {Array} pages - Array of page objects with content
 * @param {number} exactThreshold - Threshold for exact duplicates (default 0.95)
 * @param {number} nearThreshold - Threshold for near duplicates (default 0.80)
 * @returns {object} Duplicate detection results
 */
export function detectDuplicates(
  pages,
  exactThreshold = 0.95,
  nearThreshold = 0.8
) {
  console.log(`Analyzing ${pages.length} pages for duplicates...`);

  // Extract and preprocess content
  const processedPages = pages.map((page) => {
    const mainContent = extractMainContent(page.html);
    const processed = preprocessText(mainContent);
    const hash = generateContentHash(processed);
    const wordCount = mainContent.split(/\s+/).length;

    return {
      ...page,
      mainContent,
      processed,
      hash,
      wordCount,
    };
  });

  // Find exact duplicates by hash
  const hashGroups = {};
  processedPages.forEach((page, index) => {
    if (!hashGroups[page.hash]) {
      hashGroups[page.hash] = [];
    }
    hashGroups[page.hash].push({ ...page, index });
  });

  const exactDuplicates = Object.values(hashGroups)
    .filter((group) => group.length > 1)
    .map((group) => ({
      pages: group.map((p) => ({
        url: p.url,
        title: p.title,
        wordCount: p.wordCount,
      })),
      similarityScore: 1.0,
      type: "exact",
    }));

  // Calculate pairwise similarities for near duplicates
  const similarities = [];
  const alreadyExact = new Set();

  // Mark pages that are already in exact duplicate groups
  exactDuplicates.forEach((cluster) => {
    cluster.pages.forEach((p) => alreadyExact.add(p.url));
  });

  for (let i = 0; i < processedPages.length; i++) {
    for (let j = i + 1; j < processedPages.length; j++) {
      const page1 = processedPages[i];
      const page2 = processedPages[j];

      // Skip if already marked as exact duplicates
      if (alreadyExact.has(page1.url) && alreadyExact.has(page2.url)) {
        continue;
      }

      // Skip if hashes are the same (already handled as exact)
      if (page1.hash === page2.hash) continue;

      const similarity = calculateSimilarity(page1.processed, page2.processed);

      if (similarity >= nearThreshold) {
        similarities.push({
          page1: {
            url: page1.url,
            title: page1.title,
            wordCount: page1.wordCount,
            index: i,
          },
          page2: {
            url: page2.url,
            title: page2.title,
            wordCount: page2.wordCount,
            index: j,
          },
          similarity,
          type: similarity >= exactThreshold ? "exact" : "near",
        });
      }
    }
  }

  // Sort by similarity
  similarities.sort((a, b) => b.similarity - a.similarity);

  // Cluster similar pages
  const clusters = clusterSimilarPages(similarities, nearThreshold);

  // Generate near duplicates list
  const nearDuplicates = similarities
    .filter(
      (s) => s.similarity < exactThreshold && s.similarity >= nearThreshold
    )
    .map((s) => ({
      pages: [s.page1, s.page2],
      similarityScore: s.similarity,
      type: "near",
    }));

  console.log(
    `Found ${exactDuplicates.length} exact duplicate clusters, ${nearDuplicates.length} near duplicate pairs`
  );

  return {
    totalPages: pages.length,
    exactDuplicates,
    nearDuplicates,
    duplicateClusters: [...exactDuplicates, ...clusters],
    allSimilarities: similarities,
    processedPages, // Include for diff generation
  };
}

/**
 * Cluster similar pages into groups
 * @param {Array} similarities - Array of similarity pairs
 * @param {number} threshold - Similarity threshold
 * @returns {Array} Array of clusters
 */
function clusterSimilarPages(similarities, threshold) {
  const clusters = [];
  const processed = new Set();

  // Build adjacency list
  const adjacency = {};

  similarities.forEach((sim) => {
    if (sim.similarity >= threshold) {
      const url1 = sim.page1.url;
      const url2 = sim.page2.url;

      if (!adjacency[url1]) adjacency[url1] = [];
      if (!adjacency[url2]) adjacency[url2] = [];

      adjacency[url1].push({
        url: url2,
        similarity: sim.similarity,
        page: sim.page2,
      });
      adjacency[url2].push({
        url: url1,
        similarity: sim.similarity,
        page: sim.page1,
      });
    }
  });

  // Find connected components (clusters)
  for (const startUrl in adjacency) {
    if (processed.has(startUrl)) continue;

    const cluster = [];
    const queue = [startUrl];
    const visited = new Set();

    while (queue.length > 0) {
      const url = queue.shift();

      if (visited.has(url)) continue;
      visited.add(url);
      processed.add(url);

      // Find page data
      const pageSim = similarities.find(
        (s) => s.page1.url === url || s.page2.url === url
      );

      if (pageSim) {
        const pageData =
          pageSim.page1.url === url ? pageSim.page1 : pageSim.page2;
        cluster.push(pageData);
      }

      // Add neighbors
      if (adjacency[url]) {
        adjacency[url].forEach((neighbor) => {
          if (!visited.has(neighbor.url)) {
            queue.push(neighbor.url);
          }
        });
      }
    }

    if (cluster.length > 1) {
      // Calculate average similarity for cluster
      let totalSim = 0;
      let count = 0;

      for (let i = 0; i < cluster.length; i++) {
        for (let j = i + 1; j < cluster.length; j++) {
          const sim = similarities.find(
            (s) =>
              (s.page1.url === cluster[i].url &&
                s.page2.url === cluster[j].url) ||
              (s.page2.url === cluster[i].url && s.page1.url === cluster[j].url)
          );
          if (sim) {
            totalSim += sim.similarity;
            count++;
          }
        }
      }

      const avgSimilarity = count > 0 ? totalSim / count : threshold;

      clusters.push({
        pages: cluster,
        similarityScore: avgSimilarity,
        type: "cluster",
      });
    }
  }

  return clusters;
}

/**
 * Generate comprehensive duplicate content report
 * @param {object} duplicateResults - Results from detectDuplicates
 * @param {Array} pages - Original pages array
 * @returns {object} Formatted report
 */
export function generateReport(duplicateResults, pages) {
  const {
    totalPages,
    exactDuplicates,
    nearDuplicates,
    duplicateClusters,
    processedPages,
  } = duplicateResults;

  // Calculate statistics
  const uniquePages =
    totalPages -
    exactDuplicates.reduce(
      (sum, cluster) => sum + (cluster.pages.length - 1),
      0
    );

  const affectedPages = new Set();
  duplicateClusters.forEach((cluster) => {
    cluster.pages.forEach((p) => affectedPages.add(p.url));
  });

  // Add content samples to clusters
  const enrichedClusters = duplicateClusters.map((cluster) => {
    const firstPageUrl = cluster.pages[0].url;
    const pageData = processedPages.find((p) => p.url === firstPageUrl);
    const contentSample = pageData
      ? pageData.mainContent.substring(0, 200) + "..."
      : "";

    return {
      ...cluster,
      contentSample,
      clusterSize: cluster.pages.length,
    };
  });

  // Sort clusters by size and similarity
  enrichedClusters.sort((a, b) => {
    if (b.clusterSize !== a.clusterSize) {
      return b.clusterSize - a.clusterSize;
    }
    return b.similarityScore - a.similarityScore;
  });

  // Calculate duplicate percentage
  const duplicatePercentage =
    totalPages > 0 ? ((affectedPages.size / totalPages) * 100).toFixed(1) : 0;

  const report = {
    summary: {
      totalPages,
      uniquePages,
      affectedPages: affectedPages.size,
      duplicatePercentage: parseFloat(duplicatePercentage),
      exactDuplicateClusters: exactDuplicates.length,
      nearDuplicatePairs: nearDuplicates.length,
      totalClusters: duplicateClusters.length,
    },
    duplicateClusters: enrichedClusters,
    exactDuplicates,
    nearDuplicates,
    recommendations: generateRecommendations(enrichedClusters, totalPages),
  };

  return report;
}

/**
 * Generate recommendations based on findings
 * @param {Array} clusters - Duplicate clusters
 * @param {number} totalPages - Total pages analyzed
 * @returns {Array} Array of recommendations
 */
function generateRecommendations(clusters, totalPages) {
  const recommendations = [];

  if (clusters.length === 0) {
    recommendations.push({
      priority: "success",
      message: "No duplicate content detected! All pages have unique content.",
    });
    return recommendations;
  }

  // High-priority exact duplicates
  const exactClusters = clusters.filter((c) => c.type === "exact");
  if (exactClusters.length > 0) {
    recommendations.push({
      priority: "critical",
      message: `Found ${exactClusters.length} exact duplicate clusters. Consider using canonical tags or 301 redirects.`,
      action: "Set canonical URLs or consolidate pages",
    });
  }

  // Near duplicates
  const nearClusters = clusters.filter(
    (c) => c.type === "near" || c.type === "cluster"
  );
  if (nearClusters.length > 0) {
    recommendations.push({
      priority: "high",
      message: `Found ${nearClusters.length} near-duplicate clusters. Review and differentiate content.`,
      action: "Add unique content or use rel=canonical",
    });
  }

  // Large clusters
  const largeClusters = clusters.filter((c) => c.clusterSize > 3);
  if (largeClusters.length > 0) {
    recommendations.push({
      priority: "high",
      message: `${largeClusters.length} clusters contain more than 3 similar pages. Consider content consolidation.`,
      action: "Merge similar pages or create a comprehensive guide",
    });
  }

  // High duplicate percentage
  const affectedCount = new Set(
    clusters.flatMap((c) => c.pages.map((p) => p.url))
  ).size;
  const dupPercentage = (affectedCount / totalPages) * 100;

  if (dupPercentage > 30) {
    recommendations.push({
      priority: "high",
      message: `${dupPercentage.toFixed(
        1
      )}% of pages have duplicate content issues.`,
      action: "Conduct a comprehensive content audit",
    });
  }

  return recommendations;
}

/**
 * Generate text diff between two pages
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {object} Diff information
 */
export function generateDiff(text1, text2) {
  const words1 = text1.split(/\s+/);
  const words2 = text2.split(/\s+/);

  // Simple word-level diff
  const common = [];
  const unique1 = [];
  const unique2 = [];

  const words2Set = new Set(words2);
  const words1Set = new Set(words1);

  words1.forEach((word) => {
    if (words2Set.has(word)) {
      common.push(word);
    } else {
      unique1.push(word);
    }
  });

  words2.forEach((word) => {
    if (!words1Set.has(word)) {
      unique2.push(word);
    }
  });

  const totalWords = Math.max(words1.length, words2.length);
  const commonPercentage =
    totalWords > 0 ? (common.length / totalWords) * 100 : 0;

  return {
    commonWords: common.length,
    uniqueToFirst: unique1.length,
    uniqueToSecond: unique2.length,
    totalWords,
    commonPercentage: commonPercentage.toFixed(1),
    uniqueWords1: unique1.slice(0, 50), // Sample
    uniqueWords2: unique2.slice(0, 50), // Sample
  };
}

/**
 * Perform complete duplicate content analysis
 * @param {string} startUrl - Starting URL
 * @param {object} options - Analysis options
 * @returns {Promise<object>} Complete analysis report
 */
export async function analyzeDuplicateContent(startUrl, options = {}) {
  const {
    maxPages = 50,
    exactThreshold = 0.95,
    nearThreshold = 0.8,
    crawlTimeout = 30000,
  } = options;

  try {
    console.log(`Starting duplicate content analysis for: ${startUrl}`);

    // Step 1: Crawl website
    const pages = await crawlWebsite(startUrl, maxPages, {
      timeout: crawlTimeout,
    });

    if (pages.length === 0) {
      return {
        success: false,
        error: "No pages found to analyze",
      };
    }

    // Step 2: Detect duplicates
    const duplicateResults = detectDuplicates(
      pages,
      exactThreshold,
      nearThreshold
    );

    // Step 3: Generate report
    const report = generateReport(duplicateResults, pages);

    console.log(
      `Analysis complete: ${report.summary.totalClusters} duplicate clusters found`
    );

    return {
      success: true,
      url: startUrl,
      analyzedAt: new Date().toISOString(),
      ...report,
      pages: duplicateResults.processedPages.map((p) => ({
        url: p.url,
        title: p.title,
        wordCount: p.wordCount,
        hash: p.hash,
      })),
    };
  } catch (error) {
    console.error("Error in duplicate content analysis:", error);
    throw error;
  }
}

export default {
  crawlWebsite,
  extractMainContent,
  preprocessText,
  generateContentHash,
  calculateSimilarity,
  detectDuplicates,
  generateReport,
  generateDiff,
  analyzeDuplicateContent,
};
