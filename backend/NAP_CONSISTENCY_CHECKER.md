# NAP Consistency Checker

A comprehensive NAP (Name, Address, Phone) consistency validation system for local SEO citation management.

## Features

✅ **Smart Normalization**

- Automatically standardizes phone numbers (removes formatting)
- Normalizes addresses (handles abbreviations: St/Street, Rd/Road, etc.)
- Consistent name formatting (lowercase, trim spaces)

✅ **Fuzzy Matching**

- Uses Levenshtein distance algorithm
- 85% similarity threshold for names
- Handles typos and minor variations

✅ **Color-Coded Results**

- 🟢 **Green**: Perfect match (95-100% similarity)
- 🟡 **Yellow**: Minor differences (85-94% similarity)
- 🔴 **Red**: Significant mismatch (<85% similarity)

✅ **Comprehensive Reports**

- Overall consistency score (0-100%)
- Detailed breakdown per citation
- Visual diffs showing exact differences
- Actionable recommendations

## API Endpoint

### Check NAP Consistency

**POST** `/api/citations/nap-check`

#### Request Body

```json
{
  "masterData": {
    "name": "Joe's Pizza Restaurant",
    "address": "123 Main Street, Suite 100, New York, NY 10001",
    "phone": "(555) 123-4567"
  },
  "citations": [
    {
      "source": "Google My Business",
      "name": "Joe's Pizza Restaurant",
      "address": "123 Main St, Ste 100, New York, NY 10001",
      "phone": "555-123-4567"
    },
    {
      "source": "Yelp",
      "name": "Joes Pizza Restaurant",
      "address": "123 Main Street Suite 100 New York NY 10001",
      "phone": "+1 (555) 123-4567"
    }
  ]
}
```

#### Response

```json
{
  "success": true,
  "report": {
    "overallScore": 98,
    "summary": {
      "total": 2,
      "perfect": 2,
      "minor": 0,
      "major": 0
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
            "original": "Joe's Pizza Restaurant",
            "master": "Joe's Pizza Restaurant",
            "comparison": {
              "match": true,
              "similarity": 100,
              "status": "perfect",
              "color": "green",
              "message": "Perfect match"
            },
            "diff": {
              "original": "Joe's Pizza Restaurant",
              "compared": "Joe's Pizza Restaurant",
              "differences": [],
              "hasDifferences": false
            }
          },
          "address": {
            "original": "123 Main St, Ste 100, New York, NY 10001",
            "master": "123 Main Street, Suite 100, New York, NY 10001",
            "comparison": {
              "match": true,
              "similarity": 100,
              "status": "perfect",
              "color": "green",
              "message": "Perfect match"
            }
          },
          "phone": {
            "original": "555-123-4567",
            "master": "(555) 123-4567",
            "comparison": {
              "match": true,
              "similarity": 100,
              "status": "perfect",
              "color": "green",
              "message": "Perfect match"
            }
          }
        }
      }
    ],
    "recommendations": [
      {
        "priority": "low",
        "message": "All citations have perfect NAP consistency",
        "action": "Maintain current standards and monitor for changes"
      }
    ],
    "generatedAt": "2025-11-14T19:14:31.825Z"
  }
}
```

## Functions

### normalizeNAP(napData)

Standardizes NAP data to consistent formats.

```javascript
import { normalizeNAP } from "./services/napConsistencyChecker.js";

const normalized = normalizeNAP({
  name: "Joe's Pizza Restaurant",
  address: "123 Main Street, Suite 100",
  phone: "(555) 123-4567",
});

// Result:
// {
//   name: "joe's pizza restaurant",
//   address: "123 main st ste 100",
//   phone: "5551234567"
// }
```

**Normalization Rules:**

- **Name**: Lowercase, trim, single spaces
- **Address**: Lowercase, standardize abbreviations (Street→st, Suite→ste, etc.)
- **Phone**: Digits only, preserve country code if present

### compareNames(name1, name2, threshold = 85)

Compare two business names with fuzzy matching.

```javascript
import { compareNames } from "./services/napConsistencyChecker.js";

const result = compareNames("Joe's Pizza Restaurant", "Joes Pizza Restaurant");

// Result:
// {
//   match: true,
//   similarity: 95,
//   status: "similar",
//   color: "yellow",
//   message: "Similar match (95% similarity)"
// }
```

**Parameters:**

- `name1` (string): First name to compare
- `name2` (string): Second name to compare
- `threshold` (number): Similarity threshold (default: 85%)

**Returns:**

- `match` (boolean): Whether names match above threshold
- `similarity` (number): Similarity percentage (0-100)
- `status` (string): 'perfect', 'similar', 'mismatch', or 'missing'
- `color` (string): 'green', 'yellow', or 'red'
- `message` (string): Human-readable description

### compareAddresses(addr1, addr2, threshold = 85)

Compare two addresses with abbreviation handling.

```javascript
import { compareAddresses } from "./services/napConsistencyChecker.js";

const result = compareAddresses(
  "123 Main Street, Suite 100",
  "123 Main St, Ste 100"
);

// Result:
// {
//   match: true,
//   similarity: 100,
//   status: "perfect",
//   color: "green",
//   message: "Perfect match"
// }
```

**Handles Abbreviations:**

- Street/St, Road/Rd, Avenue/Ave
- Boulevard/Blvd, Drive/Dr, Lane/Ln
- Suite/Ste, Apartment/Apt
- North/N, South/S, East/E, West/W
- And many more...

### comparePhones(phone1, phone2)

Compare phone numbers (digits only).

```javascript
import { comparePhones } from "./services/napConsistencyChecker.js";

const result = comparePhones("(555) 123-4567", "555-123-4567");

// Result:
// {
//   match: true,
//   similarity: 100,
//   status: "perfect",
//   color: "green",
//   message: "Perfect match",
//   formatted1: "(555) 123-4567",
//   formatted2: "(555) 123-4567"
// }
```

**Features:**

- Strips all formatting (spaces, dashes, parentheses)
- Compares digits only
- Handles international format (+1)
- Auto-formats for display

### generateConsistencyReport(citations, masterData)

Generate comprehensive consistency report.

```javascript
import { generateConsistencyReport } from "./services/napConsistencyChecker.js";

const report = generateConsistencyReport(
  [
    {
      source: "Google My Business",
      name: "Joe's Pizza",
      address: "123 Main St",
      phone: "555-123-4567",
    },
    // ... more citations
  ],
  {
    name: "Joe's Pizza Restaurant",
    address: "123 Main Street",
    phone: "(555) 123-4567",
  }
);
```

**Returns:**

- `overallScore` (number): Overall consistency (0-100%)
- `summary` (object): Statistics (total, perfect, minor, major)
- `results` (array): Detailed analysis per citation
- `recommendations` (array): Actionable improvement suggestions
- `generatedAt` (string): ISO timestamp

## Usage Examples

### Example 1: Basic NAP Check

```javascript
import { generateConsistencyReport } from "./services/napConsistencyChecker.js";

const masterData = {
  name: "Acme Corp",
  address: "456 Oak Avenue, Chicago, IL 60601",
  phone: "(312) 555-9999",
};

const citations = [
  {
    source: "Google",
    name: "Acme Corporation",
    address: "456 Oak Ave, Chicago, IL 60601",
    phone: "312-555-9999",
  },
];

const report = generateConsistencyReport(citations, masterData);
console.log(`Overall Score: ${report.overallScore}%`);
```

### Example 2: Using via API

```javascript
// Frontend/Client Code
async function checkNAPConsistency() {
  const response = await fetch("/api/citations/nap-check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      masterData: {
        name: "My Business",
        address: "123 Main St",
        phone: "555-1234",
      },
      citations: [
        {
          source: "Yelp",
          name: "My Business LLC",
          address: "123 Main Street",
          phone: "(555) 1234",
        },
      ],
    }),
  });

  const { report } = await response.json();

  // Display results
  report.results.forEach((citation) => {
    console.log(`${citation.source}: ${citation.score}%`);
    console.log(`Status: ${citation.status} (${citation.color})`);
  });
}
```

### Example 3: Programmatic Use

```javascript
import * as napChecker from "./services/napConsistencyChecker.js";

// Normalize data
const normalized = napChecker.normalizeNAP({
  name: "Joe's Pizza",
  address: "123 Main Street",
  phone: "(555) 123-4567",
});

// Compare individual fields
const nameMatch = napChecker.compareNames("Joe's Pizza", "Joes Pizza");
const addrMatch = napChecker.compareAddresses("123 Main St", "123 Main Street");
const phoneMatch = napChecker.comparePhones("555-123-4567", "(555) 123-4567");

// Generate visual diff
const diff = napChecker.generateVisualDiff("Joe's Pizza", "Joes Pizza");
console.log("Differences:", diff.differences);
```

## Color Coding System

### 🟢 Green (Perfect Match)

- Similarity: 95-100%
- Action: No action needed
- Example: "Joe's Pizza" vs "Joe's Pizza"

### 🟡 Yellow (Minor Differences)

- Similarity: 85-94%
- Action: Consider standardizing
- Example: "123 Main Street" vs "123 Main St"

### 🔴 Red (Significant Mismatch)

- Similarity: <85%
- Action: Update citation immediately
- Example: "Joe's Pizza" vs "Tony's Pizzeria"

## Testing

Run the comprehensive test suite:

```bash
cd backend
node test-nap-consistency.js
```

The test suite includes:

- ✅ Normalization functions
- ✅ Name comparison (exact, fuzzy, mismatch)
- ✅ Address comparison (abbreviations, variations)
- ✅ Phone comparison (formatting, country codes)
- ✅ Visual diff generation
- ✅ Full consistency reports
- ✅ Edge cases (missing data, empty arrays, invalid input)

Test output is saved to `nap-consistency-test-report.json`.

## Algorithm Details

### Levenshtein Distance

The system uses the Levenshtein distance algorithm for fuzzy string matching:

```javascript
function levenshteinDistance(str1, str2) {
  // Creates matrix to calculate edit distance
  // Operations: insertion, deletion, substitution
  // Returns minimum number of edits needed
}
```

**Similarity Calculation:**

```
similarity = ((maxLength - distance) / maxLength) × 100
```

### Address Normalization

Standardizes common abbreviations:

| Full Form             | Abbreviated |
| --------------------- | ----------- |
| Street                | st          |
| Road                  | rd          |
| Avenue                | ave         |
| Boulevard             | blvd        |
| Drive                 | dr          |
| Suite                 | ste         |
| North/South/East/West | n/s/e/w     |

## Best Practices

1. **Always provide master data**: Ensure complete NAP information
2. **Regular audits**: Run consistency checks monthly
3. **Act on red flags**: Prioritize citations with <85% similarity
4. **Standardize formatting**: Use consistent abbreviations across all citations
5. **Monitor changes**: Track score trends over time

## Integration

### With Citation Tracker

```javascript
import { searchCitations } from "./services/citationTrackerService.js";
import { generateConsistencyReport } from "./services/napConsistencyChecker.js";

// Search for citations
const searchResult = await searchCitations(
  "My Business",
  "555-1234",
  "Chicago"
);

// Check consistency
const report = generateConsistencyReport(searchResult.citations, {
  name: "My Business",
  address: "123 Main St, Chicago, IL",
  phone: "555-1234",
});

console.log(`Found ${report.summary.total} citations`);
console.log(`Overall consistency: ${report.overallScore}%`);
```

## Error Handling

The system handles various error cases:

```javascript
// Empty citations
const report1 = generateConsistencyReport([], masterData);
// Returns: { error: "No citations provided", overallScore: 0 }

// Missing master data
const report2 = generateConsistencyReport(citations, {});
// Returns: { error: "Invalid master data...", overallScore: 0 }

// Missing NAP fields in citations
const report3 = generateConsistencyReport(
  [{ source: "Test", name: "", address: "", phone: "" }],
  masterData
);
// Returns detailed report with "missing" status for each field
```

## Performance

- **Fast processing**: ~1ms per citation comparison
- **Scalable**: Handles 100+ citations efficiently
- **Memory efficient**: Processes citations sequentially
- **No external dependencies**: Pure JavaScript implementation

## Troubleshooting

### Issue: Low similarity scores for valid matches

**Solution**: Check for:

- Extra spaces or special characters
- Different abbreviation styles
- International phone format differences

### Issue: Phone numbers not matching

**Solution**: Ensure both have same format or use normalization:

```javascript
const normalized = normalizeNAP({ phone: yourPhone });
```

### Issue: Address abbreviations causing mismatches

**Solution**: The system auto-handles common abbreviations. For custom ones, add to normalization rules.

## Support

For issues or questions:

1. Check test suite: `node test-nap-consistency.js`
2. Review test output in `nap-consistency-test-report.json`
3. Verify input data format matches examples above

## License

Part of the SEO Analyzer platform.
