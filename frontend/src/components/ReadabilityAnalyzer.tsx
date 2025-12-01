// src/components/ReadabilityAnalyzer.tsx
import React, { useState, useMemo } from "react";
import {
  calculateReadabilityScore,
  formatReadingTime,
  getScoreColor,
  ReadabilityMetrics,
} from "../utils/readabilityCalculator";

const ReadabilityAnalyzer: React.FC = () => {
  const [text, setText] = useState("");

  // Calculate metrics whenever text changes
  const metrics: ReadabilityMetrics = useMemo(() => {
    return calculateReadabilityScore(text);
  }, [text]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const getScoreInterpretation = (score: number): string => {
    if (score >= 90)
      return "Very easy to read. Easily understood by an average 11-year-old student.";
    if (score >= 80)
      return "Easy to read. Conversational English for consumers.";
    if (score >= 70) return "Fairly easy to read.";
    if (score >= 60)
      return "Plain English. Easily understood by 13- to 15-year-old students.";
    if (score >= 50) return "Fairly difficult to read.";
    if (score >= 30) return "Difficult to read.";
    return "Very difficult to read. Best understood by university graduates.";
  };

  const getGradeInterpretation = (grade: number): string => {
    if (grade <= 6) return "Elementary school level";
    if (grade <= 8) return "Middle school level";
    if (grade <= 12) return "High school level";
    if (grade <= 16) return "College level";
    return "Graduate level";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            📖 Readability Score Calculator
          </h1>
          <p className="text-gray-600 text-lg">
            Analyze your text's readability using Flesch Reading Ease and
            Flesch-Kincaid Grade Level
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="mb-4">
              <label
                htmlFor="text-input"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Enter Your Text
              </label>
              <textarea
                id="text-input"
                value={text}
                onChange={handleTextChange}
                placeholder="Paste or type your text here to analyze its readability..."
                className="w-full h-96 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-800"
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.totalWordCount}
                </div>
                <div className="text-xs text-gray-600">Words</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {metrics.totalSentenceCount}
                </div>
                <div className="text-xs text-gray-600">Sentences</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {metrics.totalSyllableCount}
                </div>
                <div className="text-xs text-gray-600">Syllables</div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Main Scores */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🎯</span> Readability Scores
              </h2>

              {/* Flesch Reading Ease */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Flesch Reading Ease
                  </span>
                  <span
                    className="text-2xl font-bold"
                    style={{ color: getScoreColor(metrics.fleschReadingEase) }}
                  >
                    {metrics.fleschReadingEase}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(metrics.fleschReadingEase, 100)}%`,
                      backgroundColor: getScoreColor(metrics.fleschReadingEase),
                    }}
                  ></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700">
                    {metrics.difficultyRating}
                  </span>
                  <span className="text-xs text-gray-600">
                    {getScoreInterpretation(metrics.fleschReadingEase)}
                  </span>
                </div>
              </div>

              {/* Flesch-Kincaid Grade Level */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Grade Level
                  </span>
                  <span className="text-2xl font-bold text-indigo-600">
                    {metrics.fleschKincaidGrade}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">
                    {metrics.gradeLevel}
                  </span>
                  <span className="text-xs text-gray-600">
                    {getGradeInterpretation(metrics.fleschKincaidGrade)}
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📊</span> Detailed Metrics
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">
                    Average Sentence Length
                  </span>
                  <span className="font-semibold text-gray-900">
                    {metrics.averageSentenceLength} words
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">
                    Average Word Length
                  </span>
                  <span className="font-semibold text-gray-900">
                    {metrics.averageWordLength} characters
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">
                    Complex Words (3+ syllables)
                  </span>
                  <span className="font-semibold text-gray-900">
                    {metrics.complexWordsCount} (
                    {metrics.complexWordsPercentage}%)
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">
                    Estimated Reading Time
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatReadingTime(
                      metrics.estimatedReadingTimeMinutes,
                      metrics.estimatedReadingTimeSeconds
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Warnings */}
            {metrics.warnings.length > 0 && (
              <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <span>⚠️</span> Suggestions
                </h3>
                <ul className="space-y-1">
                  {metrics.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-amber-800">
                      • {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Info Box */}
            {metrics.totalWordCount === 0 && (
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ℹ️ Enter at least 100 words for accurate readability scoring.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            📋 Score Interpretation Guide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Flesch Reading Ease Score
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="w-16 h-3 rounded"
                    style={{ backgroundColor: "#22c55e" }}
                  ></span>
                  <span className="text-gray-600">90-100: Very Easy</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-16 h-3 rounded"
                    style={{ backgroundColor: "#84cc16" }}
                  ></span>
                  <span className="text-gray-600">80-89: Easy</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-16 h-3 rounded"
                    style={{ backgroundColor: "#eab308" }}
                  ></span>
                  <span className="text-gray-600">70-79: Fairly Easy</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-16 h-3 rounded"
                    style={{ backgroundColor: "#f59e0b" }}
                  ></span>
                  <span className="text-gray-600">60-69: Standard</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-16 h-3 rounded"
                    style={{ backgroundColor: "#f97316" }}
                  ></span>
                  <span className="text-gray-600">50-59: Fairly Difficult</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-16 h-3 rounded"
                    style={{ backgroundColor: "#ef4444" }}
                  ></span>
                  <span className="text-gray-600">30-49: Difficult</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-16 h-3 rounded"
                    style={{ backgroundColor: "#dc2626" }}
                  ></span>
                  <span className="text-gray-600">0-29: Very Difficult</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Flesch-Kincaid Grade Level
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Indicates the U.S. school grade level needed to understand the
                text.
              </p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>
                  • <strong>0-6:</strong> Elementary School
                </li>
                <li>
                  • <strong>7-8:</strong> Middle School
                </li>
                <li>
                  • <strong>9-12:</strong> High School
                </li>
                <li>
                  • <strong>13-16:</strong> College
                </li>
                <li>
                  • <strong>17+:</strong> Graduate Level
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadabilityAnalyzer;
