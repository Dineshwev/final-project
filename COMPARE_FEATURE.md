# Competitor Comparison Tool

Provides side-by-side analysis for 2-3 competitor URLs.

## Endpoint

`POST /api/compare` with body:
```
{ "urls": ["https://site1.com","https://site2.com"] }
```
Or `GET /api/compare?urls=https://site1.com,https://site2.com`

## Response Structure
```
{
  status: 'success',
  data: {
    analyzed: [
      {
        url: string,
        performance: { score: number|null, lighthouse: {...} },
        seo: { score: number, issuesCount: number, breakdown: { meta:number, headings:number, images:number } },
        content: { readability: {...}, structure: {...}, score:number } | null,
        keywords: string[],
        errors: string[]
      },
      ...
    ],
    comparison: {
      diffs: [
        {
          url: string,
          performance: { score:number|null, vsPrimary:'better'|'worse'|'equal'|'n/a' },
          seo: { score:number|null, issues:number|null, vsPrimary:string },
          readability: { fle:number|null, vsPrimary:string }
        }
      ],
      perfRanks: [{ url:string, score:number|null }],
      seoRanks: [{ url:string, score:number|null }],
      readRanks: [{ url:string, fle:number|null }],
      issueRanks: [{ url:string, issues:number|null }],
      overlapAll: string[],
      pairwise: [{ a:string, b:string, overlap:string[], overlapCount:number }]
    }
  }
}
```

## Metrics & Logic
- Performance score: from Lighthouse (falls back if unavailable)
- SEO score: 100 - (total issues * 3), clamped 0-100 (heuristic)
- Content readability: Flesch score from existing content analysis
- Keyword overlap: intersection sets per pair + full intersection
- Diff labeling relative to the first URL: better / worse / equal / n/a

## Future UI (planned)
- Input form for URLs
- Comparison table with colored indicators
- Keyword overlap chips
- PDF export with tables and summary

## Notes
- Parallel Promise.all for speed
- Resilient: each sub-task wrapped with safe() to avoid total failure
- Limits to 3 unique URLs
