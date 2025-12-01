// backend/utils/readabilityCalculator.js

/**
 * Count syllables in a word using vowel detection
 * @param {string} word - The word to analyze
 * @returns {number} Number of syllables
 */
export function countSyllables(word) {
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
 * @param {string} text - The text to analyze
 * @returns {number} Number of sentences
 */
export function countSentences(text) {
  if (!text || text.trim().length === 0) return 0;

  // Split by sentence-ending punctuation
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
 * @param {string} text - The text to analyze
 * @returns {number} Number of words
 */
export function countWords(text) {
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
 * @param {string} text - The text to analyze
 * @returns {string[]} Array of words
 */
export function getWords(text) {
  if (!text || text.trim().length === 0) return [];

  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0 && /[a-zA-Z]/.test(word));
}

/**
 * Identify complex words (3+ syllables)
 * @param {string} text - The text to analyze
 * @returns {Array<{word: string, syllables: number}>} Array of complex words
 */
export function identifyComplexWords(text) {
  const words = getWords(text);
  const complexWords = [];

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
 * @param {number} words - Total word count
 * @param {number} sentences - Total sentence count
 * @param {number} syllables - Total syllable count
 * @returns {number} Flesch Reading Ease score (0-100+)
 */
export function calculateFleschReadingEase(words, sentences, syllables) {
  if (words === 0 || sentences === 0) return 0;

  const score =
    206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);

  return Math.max(0, Math.round(score * 10) / 10);
}

/**
 * Calculate Flesch-Kincaid Grade Level
 * @param {number} words - Total word count
 * @param {number} sentences - Total sentence count
 * @param {number} syllables - Total syllable count
 * @returns {number} Grade level (0-18+)
 */
export function calculateFleschKincaidGrade(words, sentences, syllables) {
  if (words === 0 || sentences === 0) return 0;

  const grade = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;

  return Math.max(0, Math.round(grade * 10) / 10);
}

/**
 * Get difficulty rating based on Flesch Reading Ease score
 * @param {number} score - Flesch Reading Ease score
 * @returns {string} Difficulty rating
 */
export function getDifficultyRating(score) {
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
 * @param {number} grade - Flesch-Kincaid Grade Level
 * @returns {string} Grade level description
 */
export function getGradeLevelDescription(grade) {
  if (grade <= 0) return "Kindergarten";
  if (grade <= 6) return `${Math.floor(grade)} Grade (Elementary)`;
  if (grade <= 8) return `${Math.floor(grade)} Grade (Middle School)`;
  if (grade <= 12) return `${Math.floor(grade)} Grade (High School)`;
  if (grade <= 16) return "College Level";
  return "Graduate Level (18+)";
}

/**
 * Calculate estimated reading time
 * @param {number} wordCount - Total word count
 * @param {number} wordsPerMinute - Average reading speed (default: 200)
 * @returns {{minutes: number, seconds: number, totalSeconds: number}}
 */
export function calculateReadingTime(wordCount, wordsPerMinute = 200) {
  const totalMinutes = wordCount / wordsPerMinute;
  const minutes = Math.floor(totalMinutes);
  const seconds = Math.round((totalMinutes - minutes) * 60);
  const totalSeconds = Math.round(totalMinutes * 60);

  return { minutes, seconds, totalSeconds };
}

/**
 * Calculate comprehensive readability metrics for given text
 * @param {string} text - The text to analyze
 * @returns {Object} Complete readability metrics
 */
export function calculateReadabilityScore(text) {
  const warnings = [];

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

export default {
  countSyllables,
  countSentences,
  countWords,
  getWords,
  identifyComplexWords,
  calculateFleschReadingEase,
  calculateFleschKincaidGrade,
  getDifficultyRating,
  getGradeLevelDescription,
  calculateReadingTime,
  calculateReadabilityScore,
};
