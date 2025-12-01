/**
 * NAP Consistency Checker - API Test Example
 * Test the /api/citations/nap-check endpoint
 */

// Example POST request body for testing the API endpoint
const testRequest = {
  masterData: {
    name: "Johnson's Hardware Store",
    address: "500 Market Street, Suite 300, San Francisco, CA 94102",
    phone: "(415) 555-0123",
  },
  citations: [
    {
      source: "Google My Business",
      url: "https://maps.google.com/...",
      name: "Johnson's Hardware Store",
      address: "500 Market St, Ste 300, San Francisco, CA 94102",
      phone: "415-555-0123",
    },
    {
      source: "Yelp",
      url: "https://yelp.com/...",
      name: "Johnsons Hardware Store",
      address: "500 Market Street Suite 300 San Francisco CA 94102",
      phone: "+1 (415) 555-0123",
    },
    {
      source: "Yellow Pages",
      url: "https://yellowpages.com/...",
      name: "Johnson's Hardware",
      address: "500 Market St., San Francisco, CA 94102",
      phone: "4155550123",
    },
    {
      source: "Foursquare",
      url: "https://foursquare.com/...",
      name: "Johnson Hardware Store",
      address: "500 Market Street, San Francisco, CA 94102",
      phone: "(415) 555-0123",
    },
    {
      source: "Apple Maps",
      url: "https://maps.apple.com/...",
      name: "Johnson's Hardware Store",
      address: "500 Market Street, Suite 300, San Francisco, CA 94102",
      phone: "(415) 555-0123",
    },
    {
      source: "Facebook",
      url: "https://facebook.com/...",
      name: "Johnson's Hardware & Tools",
      address: "500 Market Street, San Francisco, CA",
      phone: "415.555.0123",
    },
  ],
};

console.log("=".repeat(80));
console.log("NAP CONSISTENCY CHECKER - API TEST");
console.log("=".repeat(80));
console.log();

console.log("📝 Test Request Body:");
console.log(JSON.stringify(testRequest, null, 2));
console.log();

console.log("🔗 API Endpoint: POST /api/citations/nap-check");
console.log();

console.log("📋 Master Data:");
console.log(`   Name: ${testRequest.masterData.name}`);
console.log(`   Address: ${testRequest.masterData.address}`);
console.log(`   Phone: ${testRequest.masterData.phone}`);
console.log();

console.log("📊 Citations to Check: " + testRequest.citations.length);
testRequest.citations.forEach((citation, i) => {
  console.log(`   ${i + 1}. ${citation.source}`);
});
console.log();

// Example using fetch (for browser/frontend)
console.log("💻 Frontend Example (JavaScript):");
console.log(`
async function checkNAPConsistency() {
    try {
        const response = await fetch('/api/citations/nap-check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(${JSON.stringify(testRequest, null, 16)})
        });

        const result = await response.json();
        
        if (result.success) {
            const { report } = result;
            
            console.log('Overall Score:', report.overallScore + '%');
            console.log('Perfect Matches:', report.summary.perfect);
            console.log('Minor Issues:', report.summary.minor);
            console.log('Major Issues:', report.summary.major);
            
            // Display each citation's results
            report.results.forEach(citation => {
                console.log(\`\${citation.source}: \${citation.score}% (\${citation.status})\`);
                
                // Check for issues
                if (citation.fields.name.comparison.color === 'red') {
                    console.log('  ⚠️ Name mismatch:', citation.fields.name.comparison.message);
                }
                if (citation.fields.address.comparison.color === 'red') {
                    console.log('  ⚠️ Address mismatch:', citation.fields.address.comparison.message);
                }
                if (citation.fields.phone.comparison.color === 'red') {
                    console.log('  ⚠️ Phone mismatch:', citation.fields.phone.comparison.message);
                }
            });
            
            // Display recommendations
            if (report.recommendations.length > 0) {
                console.log('\\nRecommendations:');
                report.recommendations.forEach(rec => {
                    console.log(\`  [\${rec.priority.toUpperCase()}] \${rec.message}\`);
                });
            }
        } else {
            console.error('Error:', result.error);
        }
    } catch (error) {
        console.error('Request failed:', error);
    }
}

// Call the function
checkNAPConsistency();
`);
console.log();

// Example using axios
console.log("💻 Frontend Example (Axios):");
console.log(`
import axios from 'axios';

async function checkNAP() {
    try {
        const { data } = await axios.post('/api/citations/nap-check', {
            masterData: {
                name: "Johnson's Hardware Store",
                address: "500 Market Street, Suite 300, San Francisco, CA 94102",
                phone: "(415) 555-0123"
            },
            citations: [
                // ... your citations array
            ]
        });

        if (data.success) {
            return data.report;
        }
    } catch (error) {
        console.error('NAP check failed:', error.response?.data || error.message);
    }
}
`);
console.log();

// Example using cURL
console.log("💻 cURL Example:");
console.log(`
curl -X POST http://localhost:5000/api/citations/nap-check \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(testRequest)}'
`);
console.log();

// Example expected response
console.log("📥 Expected Response:");
console.log(`
{
  "success": true,
  "report": {
    "overallScore": 92,
    "summary": {
      "total": 6,
      "perfect": 4,
      "minor": 1,
      "major": 1
    },
    "results": [
      {
        "citationIndex": 1,
        "source": "Google My Business",
        "score": 100,
        "status": "perfect",
        "color": "green",
        "fields": {
          "name": {
            "original": "Johnson's Hardware Store",
            "master": "Johnson's Hardware Store",
            "comparison": {
              "match": true,
              "similarity": 100,
              "status": "perfect",
              "color": "green",
              "message": "Perfect match"
            },
            "diff": {
              "hasDifferences": false
            }
          },
          "address": { ... },
          "phone": { ... }
        }
      },
      // ... more results
    ],
    "recommendations": [
      {
        "priority": "high",
        "message": "1 citation(s) have major inconsistencies that need immediate attention",
        "action": "Update citations with significant NAP mismatches"
      }
    ],
    "masterData": {
      "name": "Johnson's Hardware Store",
      "address": "500 Market Street, Suite 300, San Francisco, CA 94102",
      "phone": "(415) 555-0123"
    },
    "generatedAt": "2025-11-14T19:30:00.000Z"
  }
}
`);
console.log();

console.log("=".repeat(80));
console.log("✅ API Test Information Generated");
console.log("=".repeat(80));
console.log();
console.log(
  "🚀 To test the API, start your server and make a POST request to:"
);
console.log("   http://localhost:5000/api/citations/nap-check");
console.log();
console.log("📖 For more information, see: NAP_CONSISTENCY_CHECKER.md");
