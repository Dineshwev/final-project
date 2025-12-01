/**
 * NAP (Name, Address, Phone) Consistency Checker
 * Validates and compares citation data for local SEO consistency
 */

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching of names and addresses
 */
function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity percentage between two strings
 */
function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 100;

  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 100;

  const distance = levenshteinDistance(str1, str2);
  return ((maxLen - distance) / maxLen) * 100;
}

/**
 * Normalize NAP data to standard formats
 */
function normalizeNAP(napData) {
  const normalized = {};

  // Normalize name - trim, single spaces, title case
  if (napData.name) {
    normalized.name = napData.name.trim().replace(/\s+/g, " ").toLowerCase();
  }

  // Normalize address - lowercase, standardize abbreviations
  if (napData.address) {
    normalized.address = napData.address
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      // Standardize common abbreviations
      .replace(/\bstreet\b/gi, "st")
      .replace(/\bst\.\b/gi, "st")
      .replace(/\broad\b/gi, "rd")
      .replace(/\brd\.\b/gi, "rd")
      .replace(/\bavenue\b/gi, "ave")
      .replace(/\bave\.\b/gi, "ave")
      .replace(/\bboulevard\b/gi, "blvd")
      .replace(/\bblvd\.\b/gi, "blvd")
      .replace(/\bdrive\b/gi, "dr")
      .replace(/\bdr\.\b/gi, "dr")
      .replace(/\blane\b/gi, "ln")
      .replace(/\bln\.\b/gi, "ln")
      .replace(/\bcourt\b/gi, "ct")
      .replace(/\bct\.\b/gi, "ct")
      .replace(/\bcircle\b/gi, "cir")
      .replace(/\bcir\.\b/gi, "cir")
      .replace(/\bparkway\b/gi, "pkwy")
      .replace(/\bpkwy\.\b/gi, "pkwy")
      .replace(/\bsuite\b/gi, "ste")
      .replace(/\bste\.\b/gi, "ste")
      .replace(/\bapartment\b/gi, "apt")
      .replace(/\bapt\.\b/gi, "apt")
      .replace(/\bnorth\b/gi, "n")
      .replace(/\bsouth\b/gi, "s")
      .replace(/\beast\b/gi, "e")
      .replace(/\bwest\b/gi, "w")
      .replace(/\bnortheast\b/gi, "ne")
      .replace(/\bnorthwest\b/gi, "nw")
      .replace(/\bsoutheast\b/gi, "se")
      .replace(/\bsouthwest\b/gi, "sw")
      .replace(/[,.]/g, "") // Remove commas and periods
      .trim();
  }

  // Normalize phone - extract digits only
  if (napData.phone) {
    normalized.phone = napData.phone
      .replace(/\D/g, "") // Remove all non-digit characters
      .trim();

    // Handle international format - keep country code if present
    if (normalized.phone.length > 10) {
      // Keep as is for international numbers
    } else if (normalized.phone.length === 10) {
      // US format without country code
      normalized.phone = normalized.phone;
    }
  }

  return normalized;
}

/**
 * Compare two business names with fuzzy matching
 * Returns similarity score and match status
 */
function compareNames(name1, name2, threshold = 85) {
  if (!name1 || !name2) {
    return {
      match: false,
      similarity: 0,
      status: "missing",
      color: "red",
      message: "One or both names are missing",
    };
  }

  const normalized1 = name1.trim().toLowerCase();
  const normalized2 = name2.trim().toLowerCase();

  // Exact match
  if (normalized1 === normalized2) {
    return {
      match: true,
      similarity: 100,
      status: "perfect",
      color: "green",
      message: "Perfect match",
    };
  }

  // Calculate similarity
  const similarity = calculateSimilarity(normalized1, normalized2);

  if (similarity >= threshold) {
    return {
      match: true,
      similarity: Math.round(similarity),
      status: "similar",
      color: "yellow",
      message: `Similar match (${Math.round(similarity)}% similarity)`,
    };
  }

  return {
    match: false,
    similarity: Math.round(similarity),
    status: "mismatch",
    color: "red",
    message: `Significant difference (${Math.round(similarity)}% similarity)`,
  };
}

/**
 * Compare two addresses with abbreviation handling
 */
function compareAddresses(addr1, addr2, threshold = 85) {
  if (!addr1 || !addr2) {
    return {
      match: false,
      similarity: 0,
      status: "missing",
      color: "red",
      message: "One or both addresses are missing",
    };
  }

  // Normalize addresses
  const normalized1 = addr1
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[,.-]/g, "")
    .trim();

  const normalized2 = addr2
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[,.-]/g, "")
    .trim();

  // Exact match after normalization
  if (normalized1 === normalized2) {
    return {
      match: true,
      similarity: 100,
      status: "perfect",
      color: "green",
      message: "Perfect match",
    };
  }

  // Check for abbreviation differences
  const abbrevPattern =
    /\b(st|street|rd|road|ave|avenue|blvd|boulevard|dr|drive|ln|lane|ct|court|cir|circle|pkwy|parkway|ste|suite|apt|apartment|n|s|e|w|ne|nw|se|sw|north|south|east|west)\b/gi;

  const hasAbbreviations =
    abbrevPattern.test(addr1) || abbrevPattern.test(addr2);

  // Calculate similarity
  const similarity = calculateSimilarity(normalized1, normalized2);

  if (similarity >= 95) {
    return {
      match: true,
      similarity: Math.round(similarity),
      status: "perfect",
      color: "green",
      message: "Perfect match",
    };
  }

  if (similarity >= threshold) {
    return {
      match: true,
      similarity: Math.round(similarity),
      status: hasAbbreviations ? "abbreviation" : "similar",
      color: "yellow",
      message: hasAbbreviations
        ? `Minor differences (likely abbreviations, ${Math.round(
            similarity
          )}% similarity)`
        : `Similar match (${Math.round(similarity)}% similarity)`,
    };
  }

  return {
    match: false,
    similarity: Math.round(similarity),
    status: "mismatch",
    color: "red",
    message: `Significant difference (${Math.round(similarity)}% similarity)`,
  };
}

/**
 * Compare two phone numbers (digits only)
 */
function comparePhones(phone1, phone2) {
  if (!phone1 || !phone2) {
    return {
      match: false,
      similarity: 0,
      status: "missing",
      color: "red",
      message: "One or both phone numbers are missing",
    };
  }

  // Extract digits only
  const digits1 = phone1.replace(/\D/g, "");
  const digits2 = phone2.replace(/\D/g, "");

  // Handle different lengths (international vs local)
  let compareDigits1 = digits1;
  let compareDigits2 = digits2;

  // If one has country code and other doesn't, compare last 10 digits
  if (digits1.length !== digits2.length) {
    if (digits1.length > 10 && digits2.length === 10) {
      compareDigits1 = digits1.slice(-10);
    } else if (digits2.length > 10 && digits1.length === 10) {
      compareDigits2 = digits2.slice(-10);
    }
  }

  // Exact match
  if (compareDigits1 === compareDigits2) {
    return {
      match: true,
      similarity: 100,
      status: "perfect",
      color: "green",
      message: "Perfect match",
      formatted1: formatPhoneNumber(digits1),
      formatted2: formatPhoneNumber(digits2),
    };
  }

  // Calculate similarity for partial matches
  const similarity = calculateSimilarity(compareDigits1, compareDigits2);

  if (similarity >= 80) {
    return {
      match: false,
      similarity: Math.round(similarity),
      status: "partial",
      color: "yellow",
      message: `Partial match (${Math.round(similarity)}% similarity)`,
      formatted1: formatPhoneNumber(digits1),
      formatted2: formatPhoneNumber(digits2),
    };
  }

  return {
    match: false,
    similarity: Math.round(similarity),
    status: "mismatch",
    color: "red",
    message: `Different numbers (${Math.round(similarity)}% similarity)`,
    formatted1: formatPhoneNumber(digits1),
    formatted2: formatPhoneNumber(digits2),
  };
}

/**
 * Format phone number for display
 */
function formatPhoneNumber(digits) {
  if (!digits) return "";

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits[0] === "1") {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(
      7
    )}`;
  }

  return digits;
}

/**
 * Generate visual diff for two strings
 */
function generateVisualDiff(str1, str2) {
  if (!str1 || !str2) {
    return {
      original: str1 || "[missing]",
      compared: str2 || "[missing]",
      differences: [],
    };
  }

  const words1 = str1.toLowerCase().split(/\s+/);
  const words2 = str2.toLowerCase().split(/\s+/);

  const differences = [];

  // Find words only in str1
  const onlyInFirst = words1.filter((word) => !words2.includes(word));
  // Find words only in str2
  const onlyInSecond = words2.filter((word) => !words1.includes(word));

  if (onlyInFirst.length > 0) {
    differences.push({
      type: "removed",
      words: onlyInFirst,
    });
  }

  if (onlyInSecond.length > 0) {
    differences.push({
      type: "added",
      words: onlyInSecond,
    });
  }

  return {
    original: str1,
    compared: str2,
    differences,
    hasDifferences: differences.length > 0,
  };
}

/**
 * Generate comprehensive consistency report
 */
function generateConsistencyReport(citations, masterData) {
  if (!citations || citations.length === 0) {
    return {
      error: "No citations provided",
      overallScore: 0,
      summary: {
        total: 0,
        perfect: 0,
        minor: 0,
        major: 0,
      },
    };
  }

  if (
    !masterData ||
    !masterData.name ||
    !masterData.address ||
    !masterData.phone
  ) {
    return {
      error: "Invalid master data - must include name, address, and phone",
      overallScore: 0,
      summary: {
        total: citations.length,
        perfect: 0,
        minor: 0,
        major: 0,
      },
    };
  }

  // Normalize master data
  const normalizedMaster = normalizeNAP(masterData);

  const results = citations.map((citation, index) => {
    // Normalize citation data
    const normalizedCitation = normalizeNAP({
      name: citation.name || citation.businessName,
      address: citation.address || citation.businessAddress,
      phone: citation.phone || citation.phoneNumber || citation.businessPhone,
    });

    // Compare each field
    const nameComparison = compareNames(
      normalizedCitation.name,
      normalizedMaster.name
    );

    const addressComparison = compareAddresses(
      normalizedCitation.address,
      normalizedMaster.address
    );

    const phoneComparison = comparePhones(
      normalizedCitation.phone,
      normalizedMaster.phone
    );

    // Calculate overall score for this citation
    const fieldScores = [
      nameComparison.similarity,
      addressComparison.similarity,
      phoneComparison.similarity,
    ];
    const citationScore =
      fieldScores.reduce((a, b) => a + b, 0) / fieldScores.length;

    // Determine overall status
    let overallStatus;
    let overallColor;

    if (citationScore >= 95) {
      overallStatus = "perfect";
      overallColor = "green";
    } else if (citationScore >= 85) {
      overallStatus = "minor";
      overallColor = "yellow";
    } else {
      overallStatus = "major";
      overallColor = "red";
    }

    return {
      citationIndex: index + 1,
      source: citation.source || citation.platform || `Citation ${index + 1}`,
      url: citation.url || null,
      score: Math.round(citationScore),
      status: overallStatus,
      color: overallColor,
      fields: {
        name: {
          original: citation.name || citation.businessName || "[missing]",
          master: masterData.name,
          comparison: nameComparison,
          diff: generateVisualDiff(
            citation.name || citation.businessName,
            masterData.name
          ),
        },
        address: {
          original: citation.address || citation.businessAddress || "[missing]",
          master: masterData.address,
          comparison: addressComparison,
          diff: generateVisualDiff(
            citation.address || citation.businessAddress,
            masterData.address
          ),
        },
        phone: {
          original:
            citation.phone ||
            citation.phoneNumber ||
            citation.businessPhone ||
            "[missing]",
          master: masterData.phone,
          comparison: phoneComparison,
          diff: generateVisualDiff(
            citation.phone || citation.phoneNumber || citation.businessPhone,
            masterData.phone
          ),
        },
      },
    };
  });

  // Calculate summary statistics
  const summary = {
    total: citations.length,
    perfect: results.filter((r) => r.status === "perfect").length,
    minor: results.filter((r) => r.status === "minor").length,
    major: results.filter((r) => r.status === "major").length,
  };

  // Calculate overall consistency score
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const overallScore = Math.round(totalScore / results.length);

  // Generate recommendations
  const recommendations = [];

  if (summary.major > 0) {
    recommendations.push({
      priority: "high",
      message: `${summary.major} citation(s) have major inconsistencies that need immediate attention`,
      action: "Update citations with significant NAP mismatches",
    });
  }

  if (summary.minor > 0) {
    recommendations.push({
      priority: "medium",
      message: `${summary.minor} citation(s) have minor inconsistencies`,
      action: "Standardize abbreviations and formatting across all citations",
    });
  }

  if (overallScore < 85) {
    recommendations.push({
      priority: "high",
      message: "Overall consistency score is below 85%",
      action: "Perform a comprehensive NAP cleanup across all citations",
    });
  }

  if (summary.perfect === citations.length) {
    recommendations.push({
      priority: "low",
      message: "All citations have perfect NAP consistency",
      action: "Maintain current standards and monitor for changes",
    });
  }

  return {
    overallScore,
    summary,
    results,
    recommendations,
    masterData: {
      name: masterData.name,
      address: masterData.address,
      phone: masterData.phone,
    },
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Export functions
 */
export {
  normalizeNAP,
  compareNames,
  compareAddresses,
  comparePhones,
  generateConsistencyReport,
  levenshteinDistance,
  calculateSimilarity,
  formatPhoneNumber,
  generateVisualDiff,
};
