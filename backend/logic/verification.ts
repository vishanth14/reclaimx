export function normalizeAnswer(input: string): string {
  if (!input) return ""
  return input
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export function compareAnswers(userAnswer: string, expectedAnswer: string): boolean {
  const normUser = normalizeAnswer(userAnswer)
  const normExpected = normalizeAnswer(expectedAnswer)

  if (!normUser || !normExpected) return false
  if (normUser === normExpected) return true

  const compactUser = normUser.replace(/\s+/g, "")
  const compactExpected = normExpected.replace(/\s+/g, "")
  if (compactUser === compactExpected) return true

  const expectedTokens = normExpected.split(/\s+/).filter((w) => w.length > 2)
  const userTokens = new Set(normUser.split(/\s+/))

  if (expectedTokens.length > 0) {
    const allPresent = expectedTokens.every((token) => userTokens.has(token))
    if (allPresent) return true
  }

  if (compactUser.includes(compactExpected) || compactExpected.includes(compactUser)) {
    const ratio = Math.min(compactUser.length, compactExpected.length) / Math.max(compactUser.length, compactExpected.length)
    if (ratio >= 0.65) return true
  }

  return false
}
