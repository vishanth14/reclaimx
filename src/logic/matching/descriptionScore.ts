import type { MatchSignal } from "../../types/matches"

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "all", "am", "an", "and", "any", "are",
  "as", "at", "be", "because", "been", "before", "being", "below", "between", "both",
  "but", "by", "for", "from", "had", "has", "have", "he", "her", "here", "him", "his",
  "how", "i", "if", "in", "into", "is", "it", "its", "just", "me", "more", "my", "no",
  "nor", "not", "of", "off", "on", "once", "only", "or", "other", "our", "out", "over",
  "own", "same", "she", "so", "some", "such", "than", "that", "the", "their", "theirs",
  "them", "then", "there", "these", "they", "this", "those", "through", "to", "too",
  "under", "until", "up", "very", "was", "we", "were", "what", "when", "where", "which",
  "while", "who", "whom", "why", "with", "would", "you", "your", "yours",
])

export function tokenizeAndNormalize(text: string): string[] {
  if (!text) return []
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ") // replace punctuation with space
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
}

export function calculateDescriptionScore(
  lostDesc: string,
  foundDesc: string,
  lostTitle = "",
  foundTitle = "",
): { score: number; signal: MatchSignal } {
  const combinedLost = `${lostTitle} ${lostDesc}`.trim()
  const combinedFound = `${foundTitle} ${foundDesc}`.trim()

  const tokensLost = tokenizeAndNormalize(combinedLost)
  const tokensFound = tokenizeAndNormalize(combinedFound)

  if (tokensLost.length === 0 || tokensFound.length === 0) {
    return {
      score: 0,
      signal: {
        name: "description",
        label: "Description similarity",
        strength: "Low",
        score: 0,
        maxScore: 25,
        detail: "Insufficient descriptive tokens",
      },
    }
  }

  const setLost = new Set(tokensLost)
  const setFound = new Set(tokensFound)

  // Find exact word matches
  let sharedTokens = 0
  const sharedWords: string[] = []

  for (const token of setLost) {
    if (setFound.has(token)) {
      sharedTokens++
      sharedWords.push(token)
    } else {
      // Check partial/stem match (e.g. "tear" vs "tears", "backpack" vs "backpacks")
      for (const fToken of setFound) {
        if (
          token.length >= 4 &&
          fToken.length >= 4 &&
          (token.startsWith(fToken) || fToken.startsWith(token))
        ) {
          sharedTokens += 0.8
          sharedWords.push(token)
          break
        }
      }
    }
  }

  // Jaccard similarity coefficient with bias toward recall of lost description
  const unionSize = setLost.size + setFound.size - sharedTokens
  const jaccard = unionSize > 0 ? sharedTokens / unionSize : 0
  const overlapRatio = setLost.size > 0 ? sharedTokens / setLost.size : 0

  // Combined score: weighted average of Jaccard (breadth) and Overlap (lost keywords present in found)
  const similarity = Math.min(1, jaccard * 0.4 + overlapRatio * 0.6)
  const rawScore = Math.round(similarity * 25)

  let strength: MatchSignal["strength"] = "Low"
  if (rawScore >= 20) strength = "Strong"
  else if (rawScore >= 14) strength = "Similar"
  else if (rawScore >= 8) strength = "Moderate"
  else if (rawScore >= 4) strength = "Partial"

  const detail =
    sharedWords.length > 0
      ? `Shared descriptors: ${sharedWords.slice(0, 3).join(", ")}`
      : "Low vocabulary overlap"

  return {
    score: rawScore,
    signal: {
      name: "description",
      label: "Description similarity",
      strength,
      score: rawScore,
      maxScore: 25,
      detail,
    },
  }
}
