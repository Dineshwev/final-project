/**
 * Simple keyword extraction from text content
 */
export const extractKeywords = (text) => {
  // Convert to lowercase and remove special characters
  const cleanText = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Split into words
  const words = cleanText.split(' ');
  
  // Filter out common stop words
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'to', 'at', 'in', 'on', 'by', 'for',
    'with', 'about', 'from', 'as', 'of', 'this', 'that', 'these', 'those', 'it', 'its',
    'they', 'them', 'their', 'we', 'us', 'our', 'you', 'your', 'he', 'she', 'him', 'her'
  ]);
  
  const filteredWords = words.filter(word => !stopWords.has(word) && word.length > 2);
  
  // Count word frequencies
  const wordFrequency = {};
  filteredWords.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });
  
  // Sort by frequency and return
  return Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .slice(0, 20); // Return top 20 keywords
};