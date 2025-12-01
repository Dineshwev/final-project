/**
 * Citation Tracker Service
 * Web scraping system for tracking business citations across multiple directories
 *
 * @requires puppeteer
 * @requires puppeteer-extra
 * @requires puppeteer-extra-plugin-stealth
 */

import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add stealth plugin for anti-detection
puppeteer.use(StealthPlugin());

// User agents rotation for anti-detection
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
];

// Configuration for request delays
const DELAY_CONFIG = {
  min: 3000, // 3 seconds
  max: 8000, // 8 seconds
};

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 3000, // 3 seconds
};

/**
 * Get random user agent
 * @private
 * @returns {string} Random user agent string
 */
function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Random delay between requests
 * @private
 * @param {number} [min] - Minimum delay in milliseconds
 * @param {number} [max] - Maximum delay in milliseconds
 * @returns {Promise<void>}
 */
async function randomDelay(min = DELAY_CONFIG.min, max = DELAY_CONFIG.max) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  console.log(`  ⏱️  Waiting ${(delay / 1000).toFixed(1)}s...`);
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Create browser instance with anti-detection measures
 * @private
 * @returns {Promise<Object>} Puppeteer browser instance
 */
async function createBrowser() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
      "--window-size=1920,1080",
      "--disable-blink-features=AutomationControlled",
      "--disable-features=IsolateOrigins,site-per-process",
    ],
    ignoreDefaultArgs: ["--enable-automation"],
  });
  return browser;
}

/**
 * Create page with anti-detection settings
 * @private
 * @param {Object} browser - Puppeteer browser instance
 * @returns {Promise<Object>} Configured page instance
 */
async function createPage(browser) {
  const page = await browser.newPage();

  // Set random user agent
  await page.setUserAgent(getRandomUserAgent());

  // Set viewport
  await page.setViewport({ width: 1920, height: 1080 });

  // Override navigator.webdriver
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => false,
    });
  });

  // Set extra headers
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "sec-ch-ua":
      '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
  });

  // Block unnecessary resources to speed up scraping
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    const resourceType = request.resourceType();
    if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
      request.abort();
    } else {
      request.continue();
    }
  });

  return page;
}

/**
 * Check for CAPTCHA on page
 * @private
 * @param {Object} page - Puppeteer page instance
 * @returns {Promise<boolean>} True if CAPTCHA detected
 */
async function detectCaptcha(page) {
  try {
    const content = await page.content();
    const captchaIndicators = [
      "captcha",
      "recaptcha",
      "hcaptcha",
      "challenge",
      "verify you are human",
      "security check",
    ];

    const hasCaptcha = captchaIndicators.some((indicator) =>
      content.toLowerCase().includes(indicator)
    );

    if (hasCaptcha) {
      console.warn("  ⚠️  CAPTCHA detected!");
      return true;
    }

    return false;
  } catch (error) {
    console.error("  ❌ Error detecting CAPTCHA:", error.message);
    return false;
  }
}

/**
 * Execute function with retry logic
 * @private
 * @param {Function} fn - Function to execute
 * @param {number} [retries] - Number of retries
 * @returns {Promise<any>} Function result
 */
async function withRetry(fn, retries = RETRY_CONFIG.maxRetries) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.warn(`  ⚠️  Attempt ${i + 1} failed: ${error.message}`);

      if (i < retries - 1) {
        console.log(`  🔄 Retrying in ${RETRY_CONFIG.retryDelay / 1000}s...`);
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_CONFIG.retryDelay)
        );
      } else {
        throw error;
      }
    }
  }
}

/**
 * Normalize phone number for comparison
 * @private
 * @param {string} phone - Phone number
 * @returns {string} Normalized phone number
 */
function normalizePhone(phone) {
  if (!phone) return "";
  return phone.replace(/\D/g, "").slice(-10); // Last 10 digits
}

/**
 * Normalize text for comparison
 * @private
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 */
function normalizeText(text) {
  if (!text) return "";
  return text.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Search Yelp for business citations
 * @private
 * @param {Object} page - Puppeteer page instance
 * @param {string} businessName - Business name
 * @param {string} phone - Business phone
 * @param {string} city - City name
 * @returns {Promise<Array>} Array of citations found
 */
async function searchYelp(page, businessName, phone, city) {
  console.log("📍 Searching Yelp...");
  const citations = [];

  try {
    const searchUrl = `https://www.yelp.com/search?find_desc=${encodeURIComponent(
      businessName
    )}&find_loc=${encodeURIComponent(city)}`;

    await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });
    await randomDelay();

    // Check for CAPTCHA
    if (await detectCaptcha(page)) {
      return [
        {
          source: "Yelp",
          error: "CAPTCHA detected",
          url: searchUrl,
          foundDate: new Date().toISOString(),
        },
      ];
    }

    // Wait for results
    await page
      .waitForSelector('[data-testid="serp-ia-card"]', { timeout: 10000 })
      .catch(() => null);

    // Extract citations
    const results = await page.evaluate(() => {
      const listings = [];
      const cards = document.querySelectorAll('[data-testid="serp-ia-card"]');

      cards.forEach((card, index) => {
        if (index >= 5) return; // Limit to top 5 results

        const nameEl = card.querySelector('a[href*="/biz/"]');
        const addressEl = card.querySelector("p");
        const phoneEl = card.querySelector('[href*="tel:"]');

        listings.push({
          name: nameEl?.textContent?.trim() || "",
          url: nameEl?.href || "",
          address: addressEl?.textContent?.trim() || "",
          phone:
            phoneEl?.textContent?.trim() ||
            phoneEl?.href?.replace("tel:", "") ||
            "",
        });
      });

      return listings;
    });

    results.forEach((result) => {
      citations.push({
        source: "Yelp",
        name: result.name,
        address: result.address,
        phone: result.phone,
        url: result.url,
        foundDate: new Date().toISOString(),
      });
    });

    console.log(`  ✓ Found ${citations.length} citation(s) on Yelp`);
  } catch (error) {
    console.error(`  ❌ Yelp error: ${error.message}`);
    citations.push({
      source: "Yelp",
      error: error.message,
      foundDate: new Date().toISOString(),
    });
  }

  return citations;
}

/**
 * Search Yellow Pages for business citations
 * @private
 * @param {Object} page - Puppeteer page instance
 * @param {string} businessName - Business name
 * @param {string} phone - Business phone
 * @param {string} city - City name
 * @returns {Promise<Array>} Array of citations found
 */
async function searchYellowPages(page, businessName, phone, city) {
  console.log("📍 Searching Yellow Pages...");
  const citations = [];

  try {
    const searchUrl = `https://www.yellowpages.com/search?search_terms=${encodeURIComponent(
      businessName
    )}&geo_location_terms=${encodeURIComponent(city)}`;

    await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });
    await randomDelay();

    if (await detectCaptcha(page)) {
      return [
        {
          source: "Yellow Pages",
          error: "CAPTCHA detected",
          url: searchUrl,
          foundDate: new Date().toISOString(),
        },
      ];
    }

    await page.waitForSelector(".result", { timeout: 10000 }).catch(() => null);

    const results = await page.evaluate(() => {
      const listings = [];
      const items = document.querySelectorAll(".result");

      items.forEach((item, index) => {
        if (index >= 5) return;

        const nameEl = item.querySelector(".business-name");
        const addressEl = item.querySelector(".street-address");
        const phoneEl = item.querySelector(".phones");
        const linkEl = item.querySelector('a[href*="/mip/"]');

        listings.push({
          name: nameEl?.textContent?.trim() || "",
          address: addressEl?.textContent?.trim() || "",
          phone: phoneEl?.textContent?.trim() || "",
          url: linkEl?.href || "",
        });
      });

      return listings;
    });

    results.forEach((result) => {
      citations.push({
        source: "Yellow Pages",
        name: result.name,
        address: result.address,
        phone: result.phone,
        url: result.url,
        foundDate: new Date().toISOString(),
      });
    });

    console.log(`  ✓ Found ${citations.length} citation(s) on Yellow Pages`);
  } catch (error) {
    console.error(`  ❌ Yellow Pages error: ${error.message}`);
    citations.push({
      source: "Yellow Pages",
      error: error.message,
      foundDate: new Date().toISOString(),
    });
  }

  return citations;
}

/**
 * Search Justdial (India) for business citations
 * @private
 * @param {Object} page - Puppeteer page instance
 * @param {string} businessName - Business name
 * @param {string} phone - Business phone
 * @param {string} city - City name
 * @returns {Promise<Array>} Array of citations found
 */
async function searchJustdial(page, businessName, phone, city) {
  console.log("📍 Searching Justdial...");
  const citations = [];

  try {
    const searchUrl = `https://www.justdial.com/${encodeURIComponent(
      city
    )}/${encodeURIComponent(businessName)}`;

    await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });
    await randomDelay();

    if (await detectCaptcha(page)) {
      return [
        {
          source: "Justdial",
          error: "CAPTCHA detected",
          url: searchUrl,
          foundDate: new Date().toISOString(),
        },
      ];
    }

    await page
      .waitForSelector(".resultbox_textbox", { timeout: 10000 })
      .catch(() => null);

    const results = await page.evaluate(() => {
      const listings = [];
      const items = document.querySelectorAll(".resultbox_textbox");

      items.forEach((item, index) => {
        if (index >= 5) return;

        const nameEl = item.querySelector(".jcn");
        const addressEl = item.querySelector(".address");
        const phoneEl = item.querySelector(".contact-info");
        const linkEl = item.querySelector("a");

        listings.push({
          name: nameEl?.textContent?.trim() || "",
          address: addressEl?.textContent?.trim() || "",
          phone: phoneEl?.textContent?.trim() || "",
          url: linkEl?.href || "",
        });
      });

      return listings;
    });

    results.forEach((result) => {
      citations.push({
        source: "Justdial",
        name: result.name,
        address: result.address,
        phone: result.phone,
        url: result.url,
        foundDate: new Date().toISOString(),
      });
    });

    console.log(`  ✓ Found ${citations.length} citation(s) on Justdial`);
  } catch (error) {
    console.error(`  ❌ Justdial error: ${error.message}`);
    citations.push({
      source: "Justdial",
      error: error.message,
      foundDate: new Date().toISOString(),
    });
  }

  return citations;
}

/**
 * Search Sulekha for business citations
 * @private
 * @param {Object} page - Puppeteer page instance
 * @param {string} businessName - Business name
 * @param {string} phone - Business phone
 * @param {string} city - City name
 * @returns {Promise<Array>} Array of citations found
 */
async function searchSulekha(page, businessName, phone, city) {
  console.log("📍 Searching Sulekha...");
  const citations = [];

  try {
    const searchUrl = `https://www.sulekha.com/search/${encodeURIComponent(
      businessName
    )}-in-${encodeURIComponent(city)}`;

    await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });
    await randomDelay();

    if (await detectCaptcha(page)) {
      return [
        {
          source: "Sulekha",
          error: "CAPTCHA detected",
          url: searchUrl,
          foundDate: new Date().toISOString(),
        },
      ];
    }

    await page
      .waitForSelector(".businessbox", { timeout: 10000 })
      .catch(() => null);

    const results = await page.evaluate(() => {
      const listings = [];
      const items = document.querySelectorAll(".businessbox");

      items.forEach((item, index) => {
        if (index >= 5) return;

        const nameEl = item.querySelector(".businessname");
        const addressEl = item.querySelector(".address");
        const phoneEl = item.querySelector(".phone");
        const linkEl = item.querySelector('a[href*="/business/"]');

        listings.push({
          name: nameEl?.textContent?.trim() || "",
          address: addressEl?.textContent?.trim() || "",
          phone: phoneEl?.textContent?.trim() || "",
          url: linkEl?.href || "",
        });
      });

      return listings;
    });

    results.forEach((result) => {
      citations.push({
        source: "Sulekha",
        name: result.name,
        address: result.address,
        phone: result.phone,
        url: result.url,
        foundDate: new Date().toISOString(),
      });
    });

    console.log(`  ✓ Found ${citations.length} citation(s) on Sulekha`);
  } catch (error) {
    console.error(`  ❌ Sulekha error: ${error.message}`);
    citations.push({
      source: "Sulekha",
      error: error.message,
      foundDate: new Date().toISOString(),
    });
  }

  return citations;
}

/**
 * Search MouthShut for business citations
 * @private
 * @param {Object} page - Puppeteer page instance
 * @param {string} businessName - Business name
 * @param {string} phone - Business phone
 * @param {string} city - City name
 * @returns {Promise<Array>} Array of citations found
 */
async function searchMouthShut(page, businessName, phone, city) {
  console.log("📍 Searching MouthShut...");
  const citations = [];

  try {
    const searchUrl = `https://www.mouthshut.com/search?q=${encodeURIComponent(
      businessName + " " + city
    )}`;

    await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });
    await randomDelay();

    if (await detectCaptcha(page)) {
      return [
        {
          source: "MouthShut",
          error: "CAPTCHA detected",
          url: searchUrl,
          foundDate: new Date().toISOString(),
        },
      ];
    }

    await page
      .waitForSelector(".row.search", { timeout: 10000 })
      .catch(() => null);

    const results = await page.evaluate(() => {
      const listings = [];
      const items = document.querySelectorAll(".row.search");

      items.forEach((item, index) => {
        if (index >= 5) return;

        const nameEl = item.querySelector("a");
        const descEl = item.querySelector(".text");

        listings.push({
          name: nameEl?.textContent?.trim() || "",
          address: descEl?.textContent?.trim() || "",
          phone: "",
          url: nameEl?.href || "",
        });
      });

      return listings;
    });

    results.forEach((result) => {
      citations.push({
        source: "MouthShut",
        name: result.name,
        address: result.address,
        phone: result.phone,
        url: result.url,
        foundDate: new Date().toISOString(),
      });
    });

    console.log(`  ✓ Found ${citations.length} citation(s) on MouthShut`);
  } catch (error) {
    console.error(`  ❌ MouthShut error: ${error.message}`);
    citations.push({
      source: "MouthShut",
      error: error.message,
      foundDate: new Date().toISOString(),
    });
  }

  return citations;
}

/**
 * Search multiple directories for business citations
 *
 * @async
 * @param {string} businessName - Business name to search
 * @param {string} phone - Business phone number
 * @param {string} city - City name
 * @returns {Promise<Object>} Search results with citations from all sources
 * @throws {Error} If search fails
 *
 * @example
 * const results = await searchCitations(
 *   'Pizza Hut',
 *   '+1-234-567-8900',
 *   'New York'
 * );
 * console.log(results.citations);
 */
export async function searchCitations(businessName, phone, city) {
  console.log("\n🔍 Starting citation search...");
  console.log(`📋 Business: ${businessName}`);
  console.log(`📞 Phone: ${phone}`);
  console.log(`📍 City: ${city}\n`);

  let browser;
  let allCitations = [];

  try {
    browser = await createBrowser();
    const page = await createPage(browser);

    // Search all directories with retry logic
    const sources = [
      { name: "Yelp", fn: searchYelp },
      { name: "Yellow Pages", fn: searchYellowPages },
      { name: "Justdial", fn: searchJustdial },
      { name: "Sulekha", fn: searchSulekha },
      { name: "MouthShut", fn: searchMouthShut },
    ];

    for (const source of sources) {
      try {
        const citations = await withRetry(() =>
          source.fn(page, businessName, phone, city)
        );
        allCitations = allCitations.concat(citations);
      } catch (error) {
        console.error(`❌ Failed to search ${source.name}: ${error.message}`);
        allCitations.push({
          source: source.name,
          error: `Failed after ${RETRY_CONFIG.maxRetries} attempts: ${error.message}`,
          foundDate: new Date().toISOString(),
        });
      }

      // Delay between sources
      await randomDelay();
    }

    await browser.close();

    console.log(
      `\n✅ Search complete! Found ${
        allCitations.filter((c) => !c.error).length
      } citations across ${sources.length} sources.`
    );

    return {
      success: true,
      businessName,
      phone,
      city,
      totalCitations: allCitations.filter((c) => !c.error).length,
      citations: allCitations,
      searchDate: new Date().toISOString(),
    };
  } catch (error) {
    if (browser) await browser.close();
    console.error("❌ Search failed:", error.message);

    return {
      success: false,
      error: error.message,
      citations: allCitations,
      searchDate: new Date().toISOString(),
    };
  }
}

/**
 * Scrape citation data from a specific listing URL
 *
 * @async
 * @param {string} url - URL of the listing page
 * @returns {Promise<Object>} Scraped citation data
 * @throws {Error} If scraping fails
 *
 * @example
 * const data = await scrapeCitationData('https://www.yelp.com/biz/...');
 * console.log(data);
 */
export async function scrapeCitationData(url) {
  console.log(`\n🌐 Scraping citation data from: ${url}`);

  let browser;

  try {
    browser = await createBrowser();
    const page = await createPage(browser);

    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    await randomDelay(1000, 2000);

    if (await detectCaptcha(page)) {
      throw new Error("CAPTCHA detected on page");
    }

    // Generic scraping logic - tries multiple selectors
    const data = await page.evaluate(() => {
      const getText = (selectors) => {
        for (const selector of selectors) {
          const el = document.querySelector(selector);
          if (el) return el.textContent.trim();
        }
        return "";
      };

      const getAttr = (selectors, attr) => {
        for (const selector of selectors) {
          const el = document.querySelector(selector);
          if (el) return el.getAttribute(attr);
        }
        return "";
      };

      return {
        name: getText([
          "h1",
          '[itemprop="name"]',
          ".business-name",
          ".biz-page-title",
          ".businessname",
        ]),
        address: getText([
          '[itemprop="address"]',
          '[itemprop="streetAddress"]',
          ".street-address",
          ".address",
          ".biz-address",
        ]),
        phone:
          getText([
            '[itemprop="telephone"]',
            '[href*="tel:"]',
            ".biz-phone",
            ".phone",
            ".contact-info",
          ]) || getAttr(['[href*="tel:"]'], "href")?.replace("tel:", ""),
        website: getAttr(['[itemprop="url"]', ".biz-website a"], "href"),
        rating: getText([
          '[itemprop="ratingValue"]',
          ".rating-value",
          ".rating",
        ]),
        reviews: getText([
          '[itemprop="reviewCount"]',
          ".review-count",
          ".reviews",
        ]),
      };
    });

    await browser.close();

    console.log("  ✓ Data scraped successfully");

    return {
      success: true,
      url,
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        website: data.website,
        rating: data.rating,
        reviews: data.reviews,
      },
      scrapedDate: new Date().toISOString(),
    };
  } catch (error) {
    if (browser) await browser.close();
    console.error(`  ❌ Scraping failed: ${error.message}`);

    return {
      success: false,
      url,
      error: error.message,
      scrapedDate: new Date().toISOString(),
    };
  }
}

/**
 * Compare found citations with source data
 *
 * @param {Array} citations - Array of citation objects
 * @param {Object} sourceData - Source business data {name, address, phone}
 * @returns {Object} Comparison results with accuracy scores
 *
 * @example
 * const comparison = compareCitations(citations, {
 *   name: 'Pizza Hut',
 *   address: '123 Main St, New York, NY 10001',
 *   phone: '+1-234-567-8900'
 * });
 * console.log(comparison);
 */
export function compareCitations(citations, sourceData) {
  console.log("\n🔎 Comparing citations with source data...");

  const normalizedSource = {
    name: normalizeText(sourceData.name),
    address: normalizeText(sourceData.address),
    phone: normalizePhone(sourceData.phone),
  };

  const comparisonResults = citations.map((citation) => {
    // Skip error citations
    if (citation.error) {
      return {
        ...citation,
        accuracy: null,
        matches: null,
        issues: ["Error during search"],
      };
    }

    const normalizedCitation = {
      name: normalizeText(citation.name),
      address: normalizeText(citation.address),
      phone: normalizePhone(citation.phone),
    };

    // Calculate matches
    const matches = {
      name:
        normalizedCitation.name.includes(normalizedSource.name) ||
        normalizedSource.name.includes(normalizedCitation.name),
      address:
        normalizedCitation.address.includes(normalizedSource.address) ||
        normalizedSource.address.includes(normalizedCitation.address),
      phone: normalizedCitation.phone === normalizedSource.phone,
    };

    // Identify issues
    const issues = [];
    if (!matches.name) issues.push("Name mismatch");
    if (!matches.address) issues.push("Address mismatch");
    if (!matches.phone) issues.push("Phone mismatch");

    // Calculate accuracy score
    const matchCount = Object.values(matches).filter(Boolean).length;
    const accuracy = Math.round((matchCount / 3) * 100);

    return {
      ...citation,
      accuracy,
      matches,
      issues: issues.length > 0 ? issues : ["No issues found"],
      status:
        accuracy === 100
          ? "Perfect Match"
          : accuracy >= 66
          ? "Good Match"
          : accuracy >= 33
          ? "Partial Match"
          : "Poor Match",
    };
  });

  // Calculate summary statistics
  const validCitations = comparisonResults.filter((c) => c.accuracy !== null);
  const perfectMatches = validCitations.filter(
    (c) => c.accuracy === 100
  ).length;
  const goodMatches = validCitations.filter(
    (c) => c.accuracy >= 66 && c.accuracy < 100
  ).length;
  const partialMatches = validCitations.filter(
    (c) => c.accuracy >= 33 && c.accuracy < 66
  ).length;
  const poorMatches = validCitations.filter((c) => c.accuracy < 33).length;

  const averageAccuracy =
    validCitations.length > 0
      ? Math.round(
          validCitations.reduce((sum, c) => sum + c.accuracy, 0) /
            validCitations.length
        )
      : 0;

  console.log(`\n📊 Comparison Results:`);
  console.log(`  Perfect Matches: ${perfectMatches}`);
  console.log(`  Good Matches: ${goodMatches}`);
  console.log(`  Partial Matches: ${partialMatches}`);
  console.log(`  Poor Matches: ${poorMatches}`);
  console.log(`  Average Accuracy: ${averageAccuracy}%`);

  return {
    success: true,
    sourceData: normalizedSource,
    totalCitations: citations.length,
    validCitations: validCitations.length,
    summary: {
      perfectMatches,
      goodMatches,
      partialMatches,
      poorMatches,
      averageAccuracy,
    },
    citations: comparisonResults,
    comparisonDate: new Date().toISOString(),
  };
}

/**
 * Export citations to JSON file
 *
 * @async
 * @param {Object} data - Citation data to export
 * @param {string} filename - Output filename
 * @returns {Promise<Object>} Export result
 */
export async function exportToJSON(data, filename) {
  try {
    const outputDir = path.join(__dirname, "..", "exports");
    await fs.mkdir(outputDir, { recursive: true });

    const filepath = path.join(outputDir, `${filename}.json`);
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));

    console.log(`✅ Exported to JSON: ${filepath}`);

    return {
      success: true,
      filepath,
      format: "JSON",
    };
  } catch (error) {
    console.error(`❌ JSON export failed: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Export citations to CSV file
 *
 * @async
 * @param {Array} citations - Array of citations
 * @param {string} filename - Output filename
 * @returns {Promise<Object>} Export result
 */
export async function exportToCSV(citations, filename) {
  try {
    const outputDir = path.join(__dirname, "..", "exports");
    await fs.mkdir(outputDir, { recursive: true });

    // CSV headers
    const headers = [
      "Source",
      "Name",
      "Address",
      "Phone",
      "URL",
      "Found Date",
      "Accuracy",
      "Status",
      "Issues",
    ];

    // Convert to CSV
    const rows = citations.map((citation) => [
      citation.source || "",
      citation.name || "",
      citation.address || "",
      citation.phone || "",
      citation.url || "",
      citation.foundDate || "",
      citation.accuracy !== undefined ? `${citation.accuracy}%` : "",
      citation.status || "",
      citation.issues ? citation.issues.join("; ") : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const filepath = path.join(outputDir, `${filename}.csv`);
    await fs.writeFile(filepath, csvContent);

    console.log(`✅ Exported to CSV: ${filepath}`);

    return {
      success: true,
      filepath,
      format: "CSV",
    };
  } catch (error) {
    console.error(`❌ CSV export failed: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
}

export default {
  searchCitations,
  scrapeCitationData,
  compareCitations,
  exportToJSON,
  exportToCSV,
};
