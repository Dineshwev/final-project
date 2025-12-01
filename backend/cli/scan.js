#!/usr/bin/env node
import { runScan } from '../services/seoServiceNew.js';

const url = process.argv[2];

if (!url) {
    console.error('Please provide a URL to scan');
    console.log('Usage: npm run scan <url>');
    process.exit(1);
}

console.log(`Starting scan for ${url}...`);

try {
    const result = await runScan(url);
    console.log('\nScan Results:');
    console.log('-------------');
    console.log(`URL: ${url}`);
    console.log(`Performance Score: ${(result.performance_score * 100).toFixed(1)}%`);
    console.log(`SEO Score: ${(result.seo_score * 100).toFixed(1)}%`);
    console.log(`Accessibility Score: ${(result.accessibility_score * 100).toFixed(1)}%`);
    console.log(`Best Practices Score: ${(result.best_practices_score * 100).toFixed(1)}%`);
    
    if (result.issues && result.issues.length > 0) {
        console.log('\nKey Issues Found:');
        result.issues.forEach(issue => {
            console.log(`- ${issue.message}`);
        });
    }
} catch (error) {
    console.error('Error during scan:', error.message);
    process.exit(1);
}