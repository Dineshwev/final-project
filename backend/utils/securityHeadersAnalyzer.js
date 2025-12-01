/**
 * Security headers analyzer module
 * Evaluates the presence and correctness of critical security headers
 */

// List of important security headers and their recommended values
const SECURITY_HEADERS = {
    'Content-Security-Policy': {
        required: true,
        recommendation: "Implement Content-Security-Policy (CSP) to prevent XSS attacks and other code injection vulnerabilities",
        implementationTip: "Add 'Content-Security-Policy: default-src 'self'; script-src 'self' trusted-scripts.com' as a starting point",
        info: "https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP",
        severity: "high",
        impact: "Critical for preventing cross-site scripting attacks and unauthorized code execution",
        category: "security"
    },
    'X-Frame-Options': {
        required: true,
        validValues: ['DENY', 'SAMEORIGIN'],
        recommendation: "Set X-Frame-Options to prevent clickjacking attacks",
        implementationTip: "Add 'X-Frame-Options: DENY' to prevent your site from being embedded in frames",
        info: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options",
        severity: "high",
        impact: "Prevents attackers from embedding your site in iframes for clickjacking attacks",
        category: "security"
    },
    'X-Content-Type-Options': {
        required: true,
        validValues: ['nosniff'],
        recommendation: "Set X-Content-Type-Options to prevent MIME type sniffing security vulnerabilities",
        implementationTip: "Add 'X-Content-Type-Options: nosniff' to your response headers",
        info: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options",
        severity: "medium",
        impact: "Prevents browsers from interpreting files as a different MIME type than declared",
        category: "security"
    },
    'Strict-Transport-Security': {
        required: true,
        pattern: /^max-age=\d+/,
        recommendation: "Implement HTTP Strict Transport Security (HSTS) to enforce HTTPS connections",
        implementationTip: "Add 'Strict-Transport-Security: max-age=31536000; includeSubDomains' for strong protection",
        info: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security",
        severity: "high",
        impact: "Forces browsers to use HTTPS for all future connections to your site, preventing downgrade attacks",
        category: "security"
    },
    'X-XSS-Protection': {
        required: true,
        validValues: ['1', '1; mode=block'],
        recommendation: "Enable X-XSS-Protection to provide an additional layer of XSS protection in older browsers",
        implementationTip: "Add 'X-XSS-Protection: 1; mode=block' to your response headers",
        info: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection",
        severity: "medium",
        impact: "Enables browser's built-in XSS filtering capabilities for older browsers",
        category: "security"
    },
    'Referrer-Policy': {
        required: true,
        validValues: [
            'no-referrer',
            'no-referrer-when-downgrade',
            'origin',
            'origin-when-cross-origin',
            'same-origin',
            'strict-origin',
            'strict-origin-when-cross-origin',
            'unsafe-url'
        ],
        recommendation: "Set Referrer-Policy to control how much referrer information is shared",
        implementationTip: "Add 'Referrer-Policy: strict-origin-when-cross-origin' for a good balance of security and usability",
        info: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy",
        severity: "medium",
        impact: "Controls how much information is sent in the Referer header when navigating away from your page",
        category: "privacy"
    },
    'Permissions-Policy': {
        required: false,
        recommendation: "Implement Permissions-Policy to control which browser features and APIs can be used",
        implementationTip: "Add 'Permissions-Policy: geolocation=(), camera=(), microphone=()' to limit sensitive feature access",
        info: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy",
        severity: "medium",
        impact: "Gives you fine-grained control over which browser features can be used on your site",
        category: "privacy"
    },
    'Cross-Origin-Opener-Policy': {
        required: false,
        validValues: ['same-origin', 'same-origin-allow-popups', 'unsafe-none'],
        recommendation: "Implement Cross-Origin-Opener-Policy for additional isolation of your site's browsing context",
        implementationTip: "Add 'Cross-Origin-Opener-Policy: same-origin' to isolate your browsing context",
        info: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy",
        severity: "low",
        impact: "Isolates your site's browsing context to protect against certain cross-origin attacks",
        category: "security"
    },
    'Cross-Origin-Resource-Policy': {
        required: false,
        validValues: ['same-site', 'same-origin', 'cross-origin'],
        recommendation: "Implement Cross-Origin-Resource-Policy to prevent your resources from being loaded by other sites",
        implementationTip: "Add 'Cross-Origin-Resource-Policy: same-origin' to your response headers",
        info: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Resource-Policy",
        severity: "low",
        impact: "Protects your resources from being loaded by other sites, preventing data leaks",
        category: "security"
    }
};

function validateHeaderValue(header, value, config) {
    if (!value) return false;
    if (config.validValues && !config.validValues.includes(value)) return false;
    if (config.pattern && !config.pattern.test(value)) return false;
    return true;
}

function analyzeSecurityHeaders(headers) {
    const results = {
        score: 100,
        headers: {},
        missing: [],
        recommendations: [],
        summary: {
            total: Object.keys(SECURITY_HEADERS).length,
            present: 0,
            missing: 0,
            invalid: 0,
            critical: 0
        },
        categories: {
            security: {
                score: 100,
                headers: []
            },
            privacy: {
                score: 100,
                headers: []
            }
        }
    };

    // Convert headers to lowercase for case-insensitive comparison
    const normalizedHeaders = {};
    for (const [key, value] of Object.entries(headers)) {
        normalizedHeaders[key.toLowerCase()] = value;
    }

    // Analyze each security header
    for (const [header, config] of Object.entries(SECURITY_HEADERS)) {
        const headerLower = header.toLowerCase();
        const value = normalizedHeaders[headerLower];
        const isPresent = !!value;
        const isValid = value ? validateHeaderValue(header, value, config) : false;
        const category = config.category || 'security';
        
        // Add header to appropriate category
        if (!results.categories[category]) {
            results.categories[category] = {
                score: 100,
                headers: []
            };
        }
        
        results.categories[category].headers.push(header);
        
        // Build detailed header result
        const headerResult = {
            present: isPresent,
            value: value || null,
            valid: isValid,
            required: config.required,
            severity: config.severity,
            impact: config.impact,
            recommendation: config.recommendation,
            implementationTip: config.implementationTip,
            moreInfo: config.info
        };

        // Update summary counts
        if (isPresent) {
            results.summary.present++;
            if (!isValid) {
                results.summary.invalid++;
                if (config.severity === 'high') {
                    results.summary.critical++;
                }
            }
        } else if (config.required) {
            results.summary.missing++;
            if (config.severity === 'high') {
                results.summary.critical++;
            }
        }

        results.headers[header] = headerResult;

        // If header is missing or invalid, add to recommendations
        if (config.required && (!isPresent || !isValid)) {
            results.missing.push(header);
            results.recommendations.push({
                header,
                type: 'security_header',
                severity: config.severity,
                message: config.recommendation,
                implementationTip: config.implementationTip,
                currentValue: value || 'not set',
                moreInfo: config.info,
                category: category
            });
            
            // Reduce score based on severity
            if (config.severity === 'high') {
                results.score -= 20;
                if (category) {
                    results.categories[category].score = Math.max(0, results.categories[category].score - 25);
                }
            } else if (config.severity === 'medium') {
                results.score -= 10;
                if (category) {
                    results.categories[category].score = Math.max(0, results.categories[category].score - 15);
                }
            } else {
                results.score -= 5;
                if (category) {
                    results.categories[category].score = Math.max(0, results.categories[category].score - 5);
                }
            }
        }
    }

    // Ensure scores don't go below 0
    results.score = Math.max(0, results.score);
    Object.keys(results.categories).forEach(category => {
        results.categories[category].score = Math.max(0, results.categories[category].score);
    });

    return results;
}

export {
    analyzeSecurityHeaders,
    SECURITY_HEADERS
};