import { fetchWebsite } from "./seoServiceNew.js";
import {
  calculateReadabilityScore,
  countSyllables,
} from "../utils/readabilityCalculator.js";

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "to",
  "at",
  "in",
  "on",
  "by",
  "for",
  "with",
  "about",
  "from",
  "as",
  "of",
  "this",
  "that",
  "these",
  "those",
  "it",
  "its",
  "they",
  "them",
  "their",
  "we",
  "us",
  "our",
  "you",
  "your",
  "he",
  "she",
  "him",
  "her",
  "i",
  "my",
  "me",
  "so",
  "if",
  "not",
  "no",
  "can",
  "will",
  "just",
]);

const tokenize = (text) => {
  return text
    .replace(/<script[\s\S]*?<\/script>/gi, " ") // remove scripts
    .replace(/<style[\s\S]*?<\/style>/gi, " ") // remove styles
    .replace(/<[^>]+>/g, " ") // remove tags
    .replace(/&[a-z]+;/gi, " ") // remove entities
    .toLowerCase()
    .replace(/[^a-z0-9\.\!\?\s]/g, " ") // keep sentence punctuation
    .split(/\s+/)
    .filter(Boolean);
};

const splitSentences = (text) => {
  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[\.\!\?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

export const analyzeContentQuality = async (url) => {
  const { html, $ } = await fetchWebsite(url);
  const bodyText = $("body").html() || "";

  // Structural elements
  const paragraphCount = $("p").length;
  const listCount = $("ul, ol").length;
  const listItemCount = $("li").length;
  const headings = {
    h1: $("h1").length,
    h2: $("h2").length,
    h3: $("h3").length,
    h4: $("h4").length,
    h5: $("h5").length,
    h6: $("h6").length,
  };

  // Text processing
  const words = tokenize(bodyText);
  const sentences = splitSentences(bodyText.replace(/<[^>]+>/g, " "));
  const wordCount = words.length;
  const sentenceCount = sentences.length || 1; // avoid div by zero

  // Get comprehensive readability analysis
  const plainText = bodyText
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const readabilityMetrics = calculateReadabilityScore(plainText);

  // Syllables (for backward compatibility)
  let syllableTotal = 0;
  words.forEach((w) => (syllableTotal += countSyllables(w)));

  // Use comprehensive metrics
  const avgSentenceLength = readabilityMetrics.averageSentenceLength;
  const avgSyllablesPerWord = syllableTotal / Math.max(wordCount, 1);
  const fleschReadingEase = readabilityMetrics.fleschReadingEase;
  const gradeLevel = readabilityMetrics.gradeLevel;

  // Keyword density
  const freq = {};
  words.forEach((w) => {
    if (!STOP_WORDS.has(w) && w.length > 2 && /[a-z]/.test(w)) {
      freq[w] = (freq[w] || 0) + 1;
    }
  });
  const keywordEntries = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([keyword, count]) => ({
      keyword,
      count,
      densityPercent: +((count / wordCount) * 100).toFixed(2),
    }));

  // Paragraph length stats
  const paragraphLengths = [];
  $("p").each((i, el) => {
    const text = $(el).text().trim();
    const wc = text.split(/\s+/).filter(Boolean).length;
    if (wc > 0) paragraphLengths.push(wc);
  });
  const avgParagraphLength = paragraphLengths.length
    ? paragraphLengths.reduce((a, b) => a + b, 0) / paragraphLengths.length
    : 0;
  const longParagraphs = paragraphLengths.filter((l) => l > 150).length;

  // Indicators (simple thresholds)
  const indicator = (value, goodRange, warnRange) => {
    if (value >= goodRange[0] && value <= goodRange[1]) return "good";
    if (value >= warnRange[0] && value <= warnRange[1]) return "warning";
    return "poor";
  };

  const indicators = {
    readability: indicator(fleschReadingEase, [60, 80], [50, 59]), // ideal mid-range for broad audience
    sentenceLength: indicator(avgSentenceLength, [12, 20], [20, 25]),
    paragraphLength: indicator(avgParagraphLength, [40, 120], [121, 150]),
    keywordVariety:
      keywordEntries.length >= 8
        ? "good"
        : keywordEntries.length >= 5
        ? "warning"
        : "poor",
  };

  // Suggestions
  const suggestions = [];
  if (fleschReadingEase < 50)
    suggestions.push(
      "Improve readability: shorten sentences and use simpler vocabulary."
    );
  if (avgSentenceLength > 20)
    suggestions.push("Break up long sentences to enhance clarity.");
  if (avgParagraphLength > 120)
    suggestions.push(
      "Split long paragraphs (>120 words) for better scannability."
    );
  if (longParagraphs > 0)
    suggestions.push(
      `${longParagraphs} very long paragraph(s) detected (>150 words). Consider splitting.`
    );
  if (paragraphCount < 3)
    suggestions.push(
      "Add more descriptive paragraphs to provide sufficient content depth."
    );
  if (listCount === 0)
    suggestions.push(
      "Use lists (bulleted or numbered) to present key points for better readability."
    );
  const topOverused = keywordEntries.find((k) => k.densityPercent > 5);
  if (topOverused)
    suggestions.push(
      `Keyword "${topOverused.keyword}" density (${topOverused.densityPercent}%) may be high; ensure natural usage.`
    );
  if (keywordEntries.length < 5)
    suggestions.push(
      "Increase keyword variety to target more relevant search queries."
    );
  if (headings.h1 !== 1)
    suggestions.push(
      "Ensure exactly one H1 heading is present for semantic structure."
    );
  if (headings.h2 < 2)
    suggestions.push("Add more H2 subheadings to organize content sections.");

  return {
    url,
    analyzedAt: new Date().toISOString(),
    readability: {
      fleschReadingEase: readabilityMetrics.fleschReadingEase,
      fleschKincaidGrade: readabilityMetrics.fleschKincaidGrade,
      gradeLevel: readabilityMetrics.gradeLevel,
      difficultyRating: readabilityMetrics.difficultyRating,
      averageSentenceLength: readabilityMetrics.averageSentenceLength,
      averageWordLength: readabilityMetrics.averageWordLength,
      averageSyllablesPerWord: +avgSyllablesPerWord.toFixed(2),
      sentenceCount: readabilityMetrics.totalSentenceCount,
      wordCount: readabilityMetrics.totalWordCount,
      syllableCount: readabilityMetrics.totalSyllableCount,
      complexWordsCount: readabilityMetrics.complexWordsCount,
      complexWordsPercentage: readabilityMetrics.complexWordsPercentage,
      estimatedReadingTime: {
        minutes: readabilityMetrics.estimatedReadingTimeMinutes,
        seconds: readabilityMetrics.estimatedReadingTimeSeconds,
        total: `${readabilityMetrics.estimatedReadingTimeMinutes}m ${readabilityMetrics.estimatedReadingTimeSeconds}s`,
      },
      isShortText: readabilityMetrics.isShortText,
      readabilityWarnings: readabilityMetrics.warnings,
    },
    keywordDensity: {
      totalKeywordsConsidered: keywordEntries.length,
      topKeywords: keywordEntries,
    },
    structure: {
      paragraphCount,
      averageParagraphLength: +avgParagraphLength.toFixed(2),
      longParagraphs,
      listCount,
      listItemCount,
      headings,
    },
    indicators,
    suggestions,
  };
};

export default { analyzeContentQuality };
