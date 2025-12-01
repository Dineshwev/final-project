import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer';

export async function runLighthouseAudit(url) {
    let browser;
    try {
        // Launch Chrome using puppeteer
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        // Run Lighthouse
        const { lhr } = await lighthouse(url, {
            port: (new URL(browser.wsEndpoint())).port,
            output: 'json',
            logLevel: 'error',
            onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
        });

        // Extract scores and audits
        const results = {
            performance_score: lhr.categories.performance.score,
            accessibility_score: lhr.categories.accessibility.score,
            best_practices_score: lhr.categories['best-practices'].score,
            seo_score: lhr.categories.seo.score,
            audits: lhr.audits,
            issues: []
        };

        // Extract critical issues
        for (const [key, audit] of Object.entries(lhr.audits)) {
            if (audit.score !== null && audit.score < 0.9) {
                results.issues.push({
                    id: key,
                    title: audit.title,
                    description: audit.description,
                    score: audit.score,
                    displayValue: audit.displayValue,
                });
            }
        }

        return results;
    } catch (error) {
        throw new Error(`Lighthouse audit failed: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}