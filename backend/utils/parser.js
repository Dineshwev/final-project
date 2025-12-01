import { load as loadCheerio } from 'cheerio';
import axios from 'axios';

export async function parseHTML(url) {
    try {
        const response = await axios.get(url);
    const html = response.data;
    const $ = loadCheerio(html);

        return {
            title: $('title').text(),
            meta: {
                description: $('meta[name="description"]').attr('content'),
                keywords: $('meta[name="keywords"]').attr('content'),
                robots: $('meta[name="robots"]').attr('content'),
                viewport: $('meta[name="viewport"]').attr('content'),
                ogTitle: $('meta[property="og:title"]').attr('content'),
                ogDescription: $('meta[property="og:description"]').attr('content'),
                ogImage: $('meta[property="og:image"]').attr('content'),
            },
            headings: {
                h1: $('h1').length,
                h2: $('h2').length,
                h3: $('h3').length,
                h4: $('h4').length,
                h5: $('h5').length,
                h6: $('h6').length,
            },
            links: {
                internal: $('a[href^="/"], a[href^="' + url + '"]').length,
                external: $('a[href^="http"]').not('a[href^="' + url + '"]').length,
                broken: [], // This would need additional checking
            },
            images: {
                total: $('img').length,
                missing_alt: $('img:not([alt])').length,
            },
            textContent: $('body').text().trim(),
        };
    } catch (error) {
        throw new Error(`Error parsing HTML: ${error.message}`);
    }
}