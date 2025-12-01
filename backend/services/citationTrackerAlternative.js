/**
 * Citation Tracker Service - Google Search Based Approach
 * Uses Google search to find business citations instead of direct scraping
 * This approach is more CAPTCHA-resistant
 */

import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

puppeteer.use(StealthPlugin());

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
];

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

async function randomDelay(min = 3000, max = 7000) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  console.log(`  ⏱️  Waiting ${(delay / 1000).toFixed(1)}s...`);
  return new Promise((resolve) => setTimeout(resolve, delay));
}

async function createBrowser() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled",
      "--window-size=1920,1080",
    ],
    ignoreDefaultArgs: ["--enable-automation"],
  });
  return browser;
}

async function createPage(browser) {
  const page = await browser.newPage();
  await page.setUserAgent(getRandomUserAgent());
  await page.setViewport({ width: 1920, height: 1080 });

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => false,
    });
  });

  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  });

  return page;
}

/**
 * Search for business citations using Google
 * More reliable than direct directory scraping
 */
export async function searchCitationsViaGoogle(businessName, phone, city) {
  console.log("\n🔍 Starting Google-based citation search...");
  console.log(`📋 Business: ${businessName}`);
  console.log(`📞 Phone: ${phone}`);
  console.log(`📍 City: ${city}\n`);

  const citations = [];
  const directories = [
    { name: "Yelp", domain: "yelp.com" },
    { name: "Yellow Pages", domain: "yellowpages.com" },
    { name: "Justdial", domain: "justdial.com" },
    { name: "Sulekha", domain: "sulekha.com" },
    { name: "MouthShut", domain: "mouthshut.com" },
  ];

  let browser;
  try {
    browser = await createBrowser();
    const page = await createPage(browser);

    for (const directory of directories) {
      console.log(`\n📍 Searching ${directory.name} via Google...`);

      try {
        // Google search query: site:domain.com "business name" "city"
        const searchQuery = `site:${directory.domain} "${businessName}" "${city}"`;
        const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(
          searchQuery
        )}`;

        await page.goto(googleUrl, {
          waitUntil: "networkidle2",
          timeout: 30000,
        });
        await randomDelay(2000, 4000);

        // Check for CAPTCHA
        const content = await page.content();
        if (content.toLowerCase().includes("captcha")) {
          console.warn(`  ⚠️  CAPTCHA detected on Google search`);
          citations.push({
            source: directory.name,
            error: "CAPTCHA detected on Google",
            foundDate: new Date().toISOString(),
          });
          continue;
        }

        // Extract search results
        const results = await page.evaluate((dirName) => {
          const links = [];
          const searchResults = document.querySelectorAll("div.g");

          searchResults.forEach((result) => {
            const linkEl = result.querySelector("a");
            const titleEl = result.querySelector("h3");
            const snippetEl = result.querySelector(".VwiC3b");

            if (linkEl && linkEl.href) {
              links.push({
                url: linkEl.href,
                title: titleEl?.textContent || "",
                snippet: snippetEl?.textContent || "",
              });
            }
          });

          return links;
        }, directory.name);

        if (results.length > 0) {
          console.log(
            `  ✓ Found ${results.length} potential listing(s) on ${directory.name}`
          );

          // Add the first result as a citation
          results.slice(0, 3).forEach((result) => {
            citations.push({
              source: directory.name,
              name: businessName, // Will need to scrape the actual page for exact name
              url: result.url,
              title: result.title,
              snippet: result.snippet,
              foundDate: new Date().toISOString(),
              needsVerification: true, // Flag to indicate this needs manual verification
            });
          });
        } else {
          console.log(`  ℹ️  No listings found on ${directory.name}`);
        }

        await randomDelay();
      } catch (error) {
        console.error(
          `  ❌ Error searching ${directory.name}: ${error.message}`
        );
        citations.push({
          source: directory.name,
          error: error.message,
          foundDate: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  console.log(
    `\n✅ Google search complete! Found ${
      citations.filter((c) => !c.error).length
    } potential citations.`
  );

  return {
    success: true,
    businessName,
    phone,
    city,
    totalCitations: citations.filter((c) => !c.error).length,
    citations,
    searchDate: new Date().toISOString(),
    method: "google-search",
    note: "Results found via Google search. Visit URLs to verify business information.",
  };
}

/**
 * Alternative: Use public APIs when available
 */
export async function searchCitationsViaAPIs(businessName, phone, city) {
  console.log("\n🔍 Searching via public APIs...");

  const citations = [];

  // Yelp has a public API - would need API key
  // Google Places API - would need API key
  // Most other directories don't have public APIs

  console.log("⚠️  Public API approach requires API keys for most services");
  console.log("Consider these options:");
  console.log(
    "  1. Yelp Fusion API - https://www.yelp.com/developers/documentation/v3"
  );
  console.log(
    "  2. Google Places API - https://developers.google.com/maps/documentation/places/web-service"
  );
  console.log("  3. Foursquare Places API - https://developer.foursquare.com/");

  return {
    success: false,
    message: "API-based search requires API keys",
    recommendations: [
      "Use Yelp Fusion API for Yelp citations",
      "Use Google Places API for general citations",
      "Use manual verification for other directories",
    ],
  };
}

/**
 * Manual citation checker - provides URLs for manual verification
 */
export function getManualCheckURLs(businessName, city) {
  console.log("\n🔗 Manual Citation Check URLs");
  console.log("=".repeat(70));

  const urls = [
    {
      source: "Yelp",
      url: `https://www.yelp.com/search?find_desc=${encodeURIComponent(
        businessName
      )}&find_loc=${encodeURIComponent(city)}`,
    },
    {
      source: "Yellow Pages",
      url: `https://www.yellowpages.com/search?search_terms=${encodeURIComponent(
        businessName
      )}&geo_location_terms=${encodeURIComponent(city)}`,
    },
    {
      source: "Google Maps",
      url: `https://www.google.com/maps/search/${encodeURIComponent(
        businessName + " " + city
      )}`,
    },
    {
      source: "Bing Places",
      url: `https://www.bing.com/maps?q=${encodeURIComponent(
        businessName + " " + city
      )}`,
    },
    {
      source: "Facebook",
      url: `https://www.facebook.com/search/top?q=${encodeURIComponent(
        businessName + " " + city
      )}`,
    },
  ];

  urls.forEach((item) => {
    console.log(`\n${item.source}:`);
    console.log(`  ${item.url}`);
  });

  console.log("\n" + "=".repeat(70));

  return {
    success: true,
    businessName,
    city,
    checkURLs: urls,
    instructions: "Visit each URL manually to verify business listings",
  };
}
