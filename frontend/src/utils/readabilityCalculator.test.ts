// src/utils/readabilityCalculator.test.ts

import {
  countSyllables,
  countSentences,
  countWords,
  identifyComplexWords,
  calculateReadabilityScore,
  formatReadingTime,
  getScoreColor,
} from "./readabilityCalculator";

// Test countSyllables
console.log("=== Testing countSyllables ===");
console.log("hello:", countSyllables("hello")); // 2
console.log("world:", countSyllables("world")); // 1
console.log("readability:", countSyllables("readability")); // 5
console.log("cat:", countSyllables("cat")); // 1
console.log("beautiful:", countSyllables("beautiful")); // 3
console.log("algorithm:", countSyllables("algorithm")); // 4

// Test countSentences
console.log("\n=== Testing countSentences ===");
console.log("One sentence.:", countSentences("One sentence.")); // 1
console.log(
  "Two sentences. Another one.:",
  countSentences("Two sentences. Another one.")
); // 2
console.log(
  "Multiple! How many? Three.:",
  countSentences("Multiple! How many? Three.")
); // 3

// Test countWords
console.log("\n=== Testing countWords ===");
console.log("Hello world:", countWords("Hello world")); // 2
console.log("Multiple   spaces:", countWords("Multiple   spaces")); // 2
console.log("Empty string:", countWords("")); // 0

// Test identifyComplexWords
console.log("\n=== Testing identifyComplexWords ===");
const complexWords = identifyComplexWords(
  "The beautiful algorithm demonstrates complexity perfectly."
);
console.log("Complex words:", complexWords);

// Test with different text samples
console.log("\n=== Testing calculateReadabilityScore ===");

// Sample 1: Simple text (elementary level)
const simpleText = `
The cat sat on the mat. It was a big cat. The cat was black.
The mat was red. The cat liked the mat. The mat was soft.
`;

console.log("\n--- Simple Text ---");
const simpleMetrics = calculateReadabilityScore(simpleText);
console.log("Flesch Reading Ease:", simpleMetrics.fleschReadingEase);
console.log("Grade Level:", simpleMetrics.gradeLevel);
console.log("Difficulty:", simpleMetrics.difficultyRating);
console.log("Words:", simpleMetrics.totalWordCount);
console.log("Sentences:", simpleMetrics.totalSentenceCount);
console.log(
  "Reading Time:",
  formatReadingTime(
    simpleMetrics.estimatedReadingTimeMinutes,
    simpleMetrics.estimatedReadingTimeSeconds
  )
);

// Sample 2: Medium complexity text
const mediumText = `
Search engine optimization is the process of improving the quality and quantity of website 
traffic to a website or a web page from search engines. SEO targets unpaid traffic rather 
than direct traffic or paid traffic. Unpaid traffic may originate from different kinds of 
searches, including image search, video search, academic search, news search, and 
industry-specific vertical search engines. As an Internet marketing strategy, SEO considers 
how search engines work, the computer-programmed algorithms that dictate search engine 
behavior, what people search for, the actual search terms or keywords typed into search 
engines, and which search engines are preferred by their targeted audience.
`;

console.log("\n--- Medium Complexity Text ---");
const mediumMetrics = calculateReadabilityScore(mediumText);
console.log("Flesch Reading Ease:", mediumMetrics.fleschReadingEase);
console.log("Grade Level:", mediumMetrics.gradeLevel);
console.log("Difficulty:", mediumMetrics.difficultyRating);
console.log("Words:", mediumMetrics.totalWordCount);
console.log(
  "Complex Words:",
  mediumMetrics.complexWordsCount,
  `(${mediumMetrics.complexWordsPercentage}%)`
);
console.log("Avg Sentence Length:", mediumMetrics.averageSentenceLength);
console.log(
  "Reading Time:",
  formatReadingTime(
    mediumMetrics.estimatedReadingTimeMinutes,
    mediumMetrics.estimatedReadingTimeSeconds
  )
);
console.log("Warnings:", mediumMetrics.warnings);

// Sample 3: Complex academic text
const complexText = `
The epistemological ramifications of poststructuralist hermeneutics necessitate a 
comprehensive reevaluation of phenomenological methodologies within contemporary 
philosophical discourse. This paradigmatic transformation engenders multifaceted 
implications for interdisciplinary research, particularly concerning the intersectionality 
of metacognitive processes and sociolinguistic constructs. The juxtaposition of 
theoretical frameworks illuminates the inherent complexities of deconstructionist 
approaches to textual analysis.
`;

console.log("\n--- Complex Academic Text ---");
const complexMetrics = calculateReadabilityScore(complexText);
console.log("Flesch Reading Ease:", complexMetrics.fleschReadingEase);
console.log("Grade Level:", complexMetrics.gradeLevel);
console.log("Difficulty:", complexMetrics.difficultyRating);
console.log("Words:", complexMetrics.totalWordCount);
console.log(
  "Complex Words:",
  complexMetrics.complexWordsCount,
  `(${complexMetrics.complexWordsPercentage}%)`
);
console.log("Avg Sentence Length:", complexMetrics.averageSentenceLength);
console.log("Avg Word Length:", complexMetrics.averageWordLength);
console.log(
  "Reading Time:",
  formatReadingTime(
    complexMetrics.estimatedReadingTimeMinutes,
    complexMetrics.estimatedReadingTimeSeconds
  )
);
console.log("Warnings:", complexMetrics.warnings);
console.log("Score Color:", getScoreColor(complexMetrics.fleschReadingEase));

// Edge cases
console.log("\n=== Testing Edge Cases ===");

// Empty text
console.log("\n--- Empty Text ---");
const emptyMetrics = calculateReadabilityScore("");
console.log("Result:", emptyMetrics);

// Very short text
console.log("\n--- Very Short Text ---");
const shortMetrics = calculateReadabilityScore("Hello world!");
console.log("Words:", shortMetrics.totalWordCount);
console.log("Is Short Text:", shortMetrics.isShortText);
console.log("Warnings:", shortMetrics.warnings);

// Text with special characters
console.log("\n--- Text with Special Characters ---");
const specialText = "Hello! How are you? I'm fine. 123 test @#$% abc.";
const specialMetrics = calculateReadabilityScore(specialText);
console.log("Words:", specialMetrics.totalWordCount);
console.log("Sentences:", specialMetrics.totalSentenceCount);
console.log("Reading Ease:", specialMetrics.fleschReadingEase);

console.log("\n=== All Tests Complete ===");
