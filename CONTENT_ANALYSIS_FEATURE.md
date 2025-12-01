# Content Quality Analyzer

This feature provides advanced content analysis for any URL, including:

- Flesch Reading Ease score and approximate grade level
- Keyword density (top 15 terms with percentage)
- Word count, sentence count, average sentence length, syllables per word
- Content structure (paragraph count, average paragraph length, lists, headings)
- Suggestion engine with actionable recommendations

## API

Endpoint: `GET /api/content-analysis?url=https://example.com`

Response shape:
```
{
  status: 'success',
  data: {
    url: string,
    analyzedAt: string,
    readability: {
      fleschReadingEase: number,
      gradeLevel: string,
      averageSentenceLength: number,
      averageSyllablesPerWord: number,
      sentenceCount: number,
      wordCount: number
    },
    keywordDensity: {
      totalKeywordsConsidered: number,
      topKeywords: Array<{ keyword: string, count: number, densityPercent: number }>
    },
    structure: {
      paragraphCount: number,
      averageParagraphLength: number,
      longParagraphs: number,
      listCount: number,
      listItemCount: number,
      headings: { h1:number,h2:number,h3:number,h4:number,h5:number,h6:number }
    },
    indicators: {
      readability: 'good'|'warning'|'poor',
      sentenceLength: 'good'|'warning'|'poor',
      paragraphLength: 'good'|'warning'|'poor',
      keywordVariety: 'good'|'warning'|'poor'
    },
    suggestions: string[],
    score: number // 0-100
  }
}
```

## Frontend

- New "Content" tab added to the Scan page.
- Clicking "Run Content Analysis" fetches metrics and renders:
  - Readability metrics and score
  - Structure breakdown
  - Top keywords with densities
  - Suggestions list

## Notes

- Uses existing `fetchWebsite` utility for robust HTML fetch with fallbacks.
- Keyword density excludes stop words and very short tokens.
- Readability score uses a heuristic syllable counter; adequate for SEO guidance.
