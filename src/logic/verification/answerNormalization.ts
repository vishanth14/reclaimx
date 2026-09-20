/**
 * Normalizes a user verification answer or expected answer for deterministic evaluation.
 * Strips formatting, punctuation, hyphens, and standard filler words.
 */
export function normalizeAnswer(input: string): string {
  if (!input) return ""
  return input
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // remove punctuation, dashes
    .replace(/\s+/g, " ") // collapse multiple spaces
    .trim()
}

/**
 * Compares claimant answer against expected answer from Proof Locker.
 * Never exposes the expected answer.
 */
export function compareAnswers(userAnswer: string, expectedAnswer: string): boolean {
  const normUser = normalizeAnswer(userAnswer)
  const normExpected = normalizeAnswer(expectedAnswer)

  if (!normUser || !normExpected) return false

  // 1. Direct match after normalization (e.g. "red key-chain" vs "red keychain")
  if (normUser === normExpected) return true

  // 2. Compact match (removing all spaces, e.g. "keychain" vs "key chain")
  const compactUser = normUser.replace(/\s+/g, "")
  const compactExpected = normExpected.replace(/\s+/g, "")
  if (compactUser === compactExpected) return true

  // 3. Token inclusion check (if expected has multiple words, all key words must be present)
  // e.g. expected: "blue notebook", user: "a blue spiral notebook with notes"
  const expectedTokens = normExpected.split(/\s+/).filter((w) => w.length > 2)
  const userTokens = new Set(normUser.split(/\s+/))

  if (expectedTokens.length > 0) {
    const allPresent = expectedTokens.every((token) => userTokens.has(token))
    if (allPresent) return true
  }

  // 4. Substring presence for compound terms
  if (compactUser.includes(compactExpected) || compactExpected.includes(compactUser)) {
    // Only allow if length ratio is reasonable (> 0.6) to avoid trivial 1-letter matches
    const ratio = Math.min(compactUser.length, compactExpected.length) / Math.max(compactUser.length, compactExpected.length)
    if (ratio >= 0.65) return true
  }

  return false
}
