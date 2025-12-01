// src/utils/readabilityCalculator.ts

/**
 * Readability metrics interface
 */
export interface ReadabilityMetrics {
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  difficultyRating:
    | "Very Easy"
    | "Easy"
    | "Fairly Easy"
    | "Standard"
    | "Fairly Difficult"
    | "Difficult"
    | "Very Difficult";
  averageSentenceLength: number;
  averageWordLength: number;
  complexWordsCount: number;
  complexWordsPercentage: number;
  totalWordCount: number;
  totalSentenceCount: number;
  totalSyllableCount: number;
  estimatedReadingTimeMinutes: number;
  estimatedReadingTimeSeconds: number;
  gradeLevel: string;
  isShortText: boolean;
  warnings: string[];
}

/**
 * Count syllables in a word using vowel detection
 * @param word - The word to analyze
 * @returns Number of syllables
 */
export function countSyllables(word: string): number {
  if (!word || word.length === 0) return 0;

  // Convert to lowercase and remove non-alphabetic characters
  word = word.toLowerCase().replace(/[^a-z]/g, "");

  if (word.length === 0) return 0;
  if (word.length <= 3) return 1;

  // Remove silent 'e' at the end
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");

  // Remove trailing 'e' if word ends in 'le' or similar
  word = word.replace(/^y/, "");

  // Match vowel groups
  const vowelGroups = word.match(/[aeiouy]{1,2}/g);
  let syllableCount = vowelGroups ? vowelGroups.length : 0;

  // Adjust for common patterns
  if (
    word.endsWith("le") &&
    word.length > 2 &&
    !/[aeiouy]/.test(word[word.length - 3])
  ) {
    syllableCount++;
  }

  // Words like "smile" should have 1 syllable, not 2
  if (word.endsWith("e") && syllableCount > 1) {
    syllableCount--;
  }

  // Ensure at least 1 syllable
  return Math.max(syllableCount, 1);
}

/**
 * Count sentences in text by splitting on .!? punctuation
 * @param text - The text to analyze
 * @returns Number of sentences
 */
export function countSentences(text: string): number {
  if (!text || text.trim().length === 0) return 0;

  // Split by sentence-ending punctuation
  // Account for abbreviations like Mr., Dr., etc.
  const sentences = text
    .replace(/([.!?])\s+(?=[A-Z])/g, "$1|")
    .replace(/([.!?])\s*$/g, "$1|")
    .split("|")
    .filter((sentence) => sentence.trim().length > 0);

  // Return at least 1 if there's text
  return Math.max(sentences.length, text.trim().length > 0 ? 1 : 0);
}

/**
 * Count words in text by splitting on whitespace
 * @param text - The text to analyze
 * @returns Number of words
 */
export function countWords(text: string): number {
  if (!text || text.trim().length === 0) return 0;

  // Split by whitespace and filter out empty strings
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0 && /[a-zA-Z]/.test(word));

  return words.length;
}

/**
 * Get individual words from text
 * @param text - The text to analyze
 * @returns Array of words
 */
export function getWords(text: string): string[] {
  if (!text || text.trim().length === 0) return [];

  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0 && /[a-zA-Z]/.test(word));
}

/**
 * Identify complex words (3+ syllables)
 * @param text - The text to analyze
 * @returns Array of complex words with their syllable counts
 */
export function identifyComplexWords(
  text: string
): Array<{ word: string; syllables: number }> {
  const words = getWords(text);
  const complexWords: Array<{ word: string; syllables: number }> = [];

  words.forEach((word) => {
    const syllables = countSyllables(word);
    if (syllables >= 3) {
      complexWords.push({ word, syllables });
    }
  });

  return complexWords;
}

/**
 * Calculate Flesch Reading Ease score
 * Formula: 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
 * @param words - Total word count
 * @param sentences - Total sentence count
 * @param syllables - Total syllable count
 * @returns Flesch Reading Ease score (0-100+)
 */
export function calculateFleschReadingEase(
  words: number,
  sentences: number,
  syllables: number
): number {
  if (words === 0 || sentences === 0) return 0;

  const score =
    206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);

  // Clamp score between 0 and 100+
  return Math.max(0, Math.round(score * 10) / 10);
}

/**
 * Calculate Flesch-Kincaid Grade Level
 * Formula: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
 * @param words - Total word count
 * @param sentences - Total sentence count
 * @param syllables - Total syllable count
 * @returns Grade level (0-18+)
 */
export function calculateFleschKincaidGrade(
  words: number,
  sentences: number,
  syllables: number
): number {
  if (words === 0 || sentences === 0) return 0;

  const grade = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;

  // Clamp grade between 0 and 18+
  return Math.max(0, Math.round(grade * 10) / 10);
}

/**
 * Get difficulty rating based on Flesch Reading Ease score
 * @param score - Flesch Reading Ease score
 * @returns Difficulty rating
 */
export function getDifficultyRating(
  score: number
): ReadabilityMetrics["difficultyRating"] {
  if (score >= 90) return "Very Easy";
  if (score >= 80) return "Easy";
  if (score >= 70) return "Fairly Easy";
  if (score >= 60) return "Standard";
  if (score >= 50) return "Fairly Difficult";
  if (score >= 30) return "Difficult";
  return "Very Difficult";
}

/**
 * Get grade level description
 * @param grade - Flesch-Kincaid Grade Level
 * @returns Grade level description
 */
export function getGradeLevelDescription(grade: number): string {
  if (grade <= 0) return "Kindergarten";
  if (grade <= 6) return `${Math.floor(grade)} Grade (Elementary)`;
  if (grade <= 8) return `${Math.floor(grade)} Grade (Middle School)`;
  if (grade <= 12) return `${Math.floor(grade)} Grade (High School)`;
  if (grade <= 16) return "College Level";
  return "Graduate Level (18+)";
}

/**
 * Calculate estimated reading time
 * @param wordCount - Total word count
 * @param wordsPerMinute - Average reading speed (default: 200)
 * @returns Reading time in minutes and seconds
 */
export function calculateReadingTime(
  wordCount: number,
  wordsPerMinute: number = 200
): { minutes: number; seconds: number; totalSeconds: number } {
  const totalMinutes = wordCount / wordsPerMinute;
  const minutes = Math.floor(totalMinutes);
  const seconds = Math.round((totalMinutes - minutes) * 60);
  const totalSeconds = Math.round(totalMinutes * 60);

  return { minutes, seconds, totalSeconds };
}

/**
 * Calculate comprehensive readability metrics for given text
 * @param text - The text to analyze
 * @returns Complete readability metrics
 */
export function calculateReadabilityScore(text: string): ReadabilityMetrics {
  const warnings: string[] = [];

  // Handle empty text
  if (!text || text.trim().length === 0) {
    return {
      fleschReadingEase: 0,
      fleschKincaidGrade: 0,
      difficultyRating: "Standard",
      averageSentenceLength: 0,
      averageWordLength: 0,
      complexWordsCount: 0,
      complexWordsPercentage: 0,
      totalWordCount: 0,
      totalSentenceCount: 0,
      totalSyllableCount: 0,
      estimatedReadingTimeMinutes: 0,
      estimatedReadingTimeSeconds: 0,
      gradeLevel: "N/A",
      isShortText: true,
      warnings: ["Text is empty"],
    };
  }

  // Clean text
  const cleanedText = text.trim();

  // Count basic metrics
  const totalWordCount = countWords(cleanedText);
  const totalSentenceCount = countSentences(cleanedText);
  const words = getWords(cleanedText);

  // Check for very short text
  const isShortText = totalWordCount < 100;
  if (isShortText) {
    warnings.push(
      "Text is shorter than 100 words. Scores may be less accurate."
    );
  }

  // Handle edge case: no words
  if (totalWordCount === 0) {
    return {
      fleschReadingEase: 0,
      fleschKincaidGrade: 0,
      difficultyRating: "Standard",
      averageSentenceLength: 0,
      averageWordLength: 0,
      complexWordsCount: 0,
      complexWordsPercentage: 0,
      totalWordCount: 0,
      totalSentenceCount: 0,
      totalSyllableCount: 0,
      estimatedReadingTimeMinutes: 0,
      estimatedReadingTimeSeconds: 0,
      gradeLevel: "N/A",
      isShortText: true,
      warnings: ["No readable words found in text"],
    };
  }

  // Count syllables for all words
  let totalSyllableCount = 0;
  let totalCharacters = 0;

  words.forEach((word) => {
    totalSyllableCount += countSyllables(word);
    // Count only alphabetic characters for average word length
    totalCharacters += word.replace(/[^a-zA-Z]/g, "").length;
  });

  // Identify complex words
  const complexWords = identifyComplexWords(cleanedText);
  const complexWordsCount = complexWords.length;
  const complexWordsPercentage = (complexWordsCount / totalWordCount) * 100;

  // Calculate averages
  const averageSentenceLength = totalWordCount / totalSentenceCount;
  const averageWordLength = totalCharacters / totalWordCount;

  // Calculate readability scores
  const fleschReadingEase = calculateFleschReadingEase(
    totalWordCount,
    totalSentenceCount,
    totalSyllableCount
  );

  const fleschKincaidGrade = calculateFleschKincaidGrade(
    totalWordCount,
    totalSentenceCount,
    totalSyllableCount
  );

  // Get difficulty rating and grade level
  const difficultyRating = getDifficultyRating(fleschReadingEase);
  const gradeLevel = getGradeLevelDescription(fleschKincaidGrade);

  // Calculate reading time
  const readingTime = calculateReadingTime(totalWordCount);

  // Check for extreme values
  if (fleschReadingEase > 100) {
    warnings.push("Text is extremely easy to read (score > 100)");
  }
  if (fleschKincaidGrade > 18) {
    warnings.push("Text requires graduate-level education to understand");
  }
  if (averageSentenceLength > 30) {
    warnings.push(
      "Average sentence length is very long (30+ words). Consider shorter sentences."
    );
  }
  if (complexWordsPercentage > 20) {
    warnings.push(
      "High percentage of complex words (20%+). Consider simpler vocabulary."
    );
  }

  return {
    fleschReadingEase: Math.round(fleschReadingEase * 10) / 10,
    fleschKincaidGrade: Math.round(fleschKincaidGrade * 10) / 10,
    difficultyRating,
    averageSentenceLength: Math.round(averageSentenceLength * 10) / 10,
    averageWordLength: Math.round(averageWordLength * 10) / 10,
    complexWordsCount,
    complexWordsPercentage: Math.round(complexWordsPercentage * 10) / 10,
    totalWordCount,
    totalSentenceCount,
    totalSyllableCount,
    estimatedReadingTimeMinutes: readingTime.minutes,
    estimatedReadingTimeSeconds: readingTime.seconds,
    gradeLevel,
    isShortText,
    warnings,
  };
}

/**
 * Format reading time as a human-readable string
 * @param minutes - Minutes
 * @param seconds - Seconds
 * @returns Formatted string
 */
export function formatReadingTime(minutes: number, seconds: number): string {
  if (minutes === 0) {
    return `${seconds} second${seconds !== 1 ? "s" : ""}`;
  }
  if (seconds === 0) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }
  return `${minutes} minute${minutes !== 1 ? "s" : ""} ${seconds} second${
    seconds !== 1 ? "s" : ""
  }`;
}

/**
 * Get color code for Flesch Reading Ease score
 * @param score - Flesch Reading Ease score
 * @returns Color class or hex color
 */
export function getScoreColor(score: number): string {
  if (score >= 90) return "#22c55e"; // green-500
  if (score >= 80) return "#84cc16"; // lime-500
  if (score >= 70) return "#eab308"; // yellow-500
  if (score >= 60) return "#f59e0b"; // amber-500
  if (score >= 50) return "#f97316"; // orange-500
  if (score >= 30) return "#ef4444"; // red-500
  return "#dc2626"; // red-600
}

export default calculateReadabilityScore;
