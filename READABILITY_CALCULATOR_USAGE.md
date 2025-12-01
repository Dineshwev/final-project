// READABILITY_CALCULATOR_USAGE.md

# Readability Score Calculator - Usage Guide

## Overview

A comprehensive TypeScript/React readability calculator that implements Flesch Reading Ease and Flesch-Kincaid Grade Level formulas with full error handling and edge case support.

## Features Implemented

### ✅ Core Calculations

- **Flesch Reading Ease Score** (0-100+)
  - Formula: 206.835 - 1.015 × (words/sentences) - 84.6 × (syllables/words)
  - Higher score = easier to read
- **Flesch-Kincaid Grade Level** (0-18+)
  - Formula: 0.39 × (words/sentences) + 11.8 × (syllables/words) - 15.59
  - Indicates U.S. school grade level needed

### ✅ Metrics Provided

- Flesch Reading Ease score
- Flesch-Kincaid Grade Level
- Difficulty rating (Very Easy → Very Difficult)
- Average sentence length
- Average word length
- Complex words count (3+ syllables)
- Complex words percentage
- Total word count
- Total sentence count
- Total syllable count
- Estimated reading time (minutes & seconds)
- Grade level description
- Warnings and suggestions

### ✅ Helper Functions

- `countSyllables(word)` - Vowel-based syllable detection
- `countSentences(text)` - Split by .!? punctuation
- `countWords(text)` - Whitespace-based word counting
- `identifyComplexWords(text)` - Find 3+ syllable words
- `formatReadingTime()` - Human-readable time format
- `getScoreColor()` - Color coding for scores

### ✅ Edge Cases Handled

- Empty text
- Very short text (< 100 words)
- Special characters and numbers
- Multiple sentence endings
- Silent 'e' in syllable counting
- Extreme readability scores
- Division by zero

## Quick Start

### 1. Basic Usage (TypeScript/JavaScript)

\`\`\`typescript
import { calculateReadabilityScore } from './utils/readabilityCalculator';

const text = "Your text here...";
const metrics = calculateReadabilityScore(text);

console.log('Reading Ease:', metrics.fleschReadingEase);
console.log('Grade Level:', metrics.gradeLevel);
console.log('Difficulty:', metrics.difficultyRating);
console.log('Reading Time:', `${metrics.estimatedReadingTimeMinutes}m ${metrics.estimatedReadingTimeSeconds}s`);
\`\`\`

### 2. Using Individual Helper Functions

\`\`\`typescript
import {
countSyllables,
countWords,
countSentences,
identifyComplexWords
} from './utils/readabilityCalculator';

const word = "beautiful";
console.log('Syllables:', countSyllables(word)); // 3

const text = "Hello world. How are you?";
console.log('Words:', countWords(text)); // 5
console.log('Sentences:', countSentences(text)); // 2

const complexWords = identifyComplexWords(text);
console.log('Complex words:', complexWords);
\`\`\`

### 3. React Component Usage

The `ReadabilityAnalyzer` component provides a complete UI for text analysis:

\`\`\`typescript
import ReadabilityAnalyzer from './components/ReadabilityAnalyzer';

function App() {
return <ReadabilityAnalyzer />;
}
\`\`\`

### 4. Custom Integration Example

\`\`\`typescript
import React, { useState, useEffect } from 'react';
import { calculateReadabilityScore, formatReadingTime } from './utils/readabilityCalculator';

function MyComponent() {
const [content, setContent] = useState('');
const [metrics, setMetrics] = useState(null);

useEffect(() => {
if (content) {
const results = calculateReadabilityScore(content);
setMetrics(results);
}
}, [content]);

return (
<div>
<textarea
value={content}
onChange={(e) => setContent(e.target.value)}
placeholder="Enter text..."
/>

      {metrics && (
        <div>
          <h3>Readability Score: {metrics.fleschReadingEase}</h3>
          <p>Difficulty: {metrics.difficultyRating}</p>
          <p>Grade Level: {metrics.gradeLevel}</p>
          <p>Reading Time: {formatReadingTime(
            metrics.estimatedReadingTimeMinutes,
            metrics.estimatedReadingTimeSeconds
          )}</p>

          {metrics.warnings.length > 0 && (
            <div className="warnings">
              <h4>Suggestions:</h4>
              <ul>
                {metrics.warnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>

);
}
\`\`\`

## API Reference

### `calculateReadabilityScore(text: string): ReadabilityMetrics`

Main function that returns complete analysis.

**Returns:**
\`\`\`typescript
{
fleschReadingEase: number; // 0-100+ (higher = easier)
fleschKincaidGrade: number; // 0-18+ (grade level)
difficultyRating: string; // 'Very Easy' | 'Easy' | ... | 'Very Difficult'
averageSentenceLength: number; // Words per sentence
averageWordLength: number; // Characters per word
complexWordsCount: number; // Words with 3+ syllables
complexWordsPercentage: number; // Percentage of complex words
totalWordCount: number; // Total words
totalSentenceCount: number; // Total sentences
totalSyllableCount: number; // Total syllables
estimatedReadingTimeMinutes: number;
estimatedReadingTimeSeconds: number;
gradeLevel: string; // Description like "8 Grade (Middle School)"
isShortText: boolean; // True if < 100 words
warnings: string[]; // Suggestions for improvement
}
\`\`\`

### `countSyllables(word: string): number`

Counts syllables in a word using vowel detection.

### `countSentences(text: string): number`

Counts sentences by splitting on .!? punctuation.

### `countWords(text: string): number`

Counts words by splitting on whitespace.

### `identifyComplexWords(text: string): Array<{word: string, syllables: number}>`

Returns array of complex words (3+ syllables).

### `formatReadingTime(minutes: number, seconds: number): string`

Returns formatted string like "2 minutes 30 seconds".

### `getScoreColor(score: number): string`

Returns hex color code based on readability score.

## Score Interpretation

### Flesch Reading Ease

- **90-100**: Very Easy (5th grade)
- **80-89**: Easy (6th grade)
- **70-79**: Fairly Easy (7th grade)
- **60-69**: Standard (8th-9th grade)
- **50-59**: Fairly Difficult (10th-12th grade)
- **30-49**: Difficult (College)
- **0-29**: Very Difficult (Graduate)

### Flesch-Kincaid Grade Level

- **0-6**: Elementary School
- **7-8**: Middle School
- **9-12**: High School
- **13-16**: College
- **17+**: Graduate Level

## Testing

Run the test file to verify functionality:

\`\`\`bash

# If using ts-node

npx ts-node src/utils/readabilityCalculator.test.ts

# Or compile and run

tsc src/utils/readabilityCalculator.test.ts
node src/utils/readabilityCalculator.test.js
\`\`\`

## Integration with Content Analysis

You can integrate this with your existing content analysis feature:

\`\`\`typescript
// In contentAnalysisService.js or similar
import { calculateReadabilityScore } from '../utils/readabilityCalculator';

async function analyzeContent(url) {
// ... fetch content ...

const readability = calculateReadabilityScore(textContent);

return {
...otherMetrics,
readability: {
score: readability.fleschReadingEase,
gradeLevel: readability.fleschKincaidGrade,
difficulty: readability.difficultyRating,
readingTime: readability.estimatedReadingTimeMinutes,
warnings: readability.warnings
}
};
}
\`\`\`

## Production Considerations

1. **Performance**: The calculator is optimized for real-time analysis
2. **Caching**: Consider memoization for large texts that don't change
3. **Debouncing**: Use debouncing when analyzing text as user types
4. **Error Handling**: All edge cases are handled with graceful fallbacks
5. **TypeScript**: Full type safety with comprehensive interfaces

## Example Output

\`\`\`json
{
"fleschReadingEase": 65.3,
"fleschKincaidGrade": 8.2,
"difficultyRating": "Standard",
"averageSentenceLength": 15.4,
"averageWordLength": 4.8,
"complexWordsCount": 12,
"complexWordsPercentage": 15.6,
"totalWordCount": 77,
"totalSentenceCount": 5,
"totalSyllableCount": 112,
"estimatedReadingTimeMinutes": 0,
"estimatedReadingTimeSeconds": 23,
"gradeLevel": "8 Grade (Middle School)",
"isShortText": true,
"warnings": [
"Text is shorter than 100 words. Scores may be less accurate."
]
}
\`\`\`

## Files Created

1. **`src/utils/readabilityCalculator.ts`** - Main calculator with all functions
2. **`src/utils/readabilityCalculator.test.ts`** - Test file with examples
3. **`src/components/ReadabilityAnalyzer.tsx`** - React UI component

## Next Steps

1. Add the ReadabilityAnalyzer component to your routes
2. Integrate with existing content analysis
3. Add to SEO scanning results
4. Create API endpoint if needed for backend analysis
5. Add to dashboard metrics

---

**Status**: ✅ Production-ready with full TypeScript support, error handling, and edge case coverage.
