import type { MatchSignal } from "../../types/matches"

interface Characteristics {
  color?: string
  brand?: string
  marks?: string
  accessories?: string
  contents?: string
  material?: string
}

export function calculateCharacteristicScore(
  lostChar: Characteristics = {},
  foundChar: Characteristics = {},
  lostTitle = "",
  foundTitle = "",
): { score: number; signal: MatchSignal } {
  let matchedPoints = 0
  const maxScore = 15
  const matchedList: string[] = []

  // 1. Color check (up to 5 pts)
  const lostColor = (lostChar.color || "").toLowerCase().trim()
  const foundColor = (foundChar.color || "").toLowerCase().trim()
  const titleText = `${lostTitle} ${foundTitle}`.toLowerCase()

  const commonColors = ["black", "white", "blue", "red", "green", "brown", "silver", "grey", "gray", "gold", "yellow"]
  let colorMatch = false

  if (lostColor && foundColor && (lostColor === foundColor || lostColor.includes(foundColor) || foundColor.includes(lostColor))) {
    colorMatch = true
  } else {
    // Check if color is in titles
    for (const c of commonColors) {
      if (lostTitle.toLowerCase().includes(c) && foundTitle.toLowerCase().includes(c)) {
        colorMatch = true
        break
      }
    }
  }

  if (colorMatch) {
    matchedPoints += 5
    matchedList.push("Color match")
  }

  // 2. Brand / make check (up to 4 pts)
  const lostBrand = (lostChar.brand || "").toLowerCase().trim()
  const foundBrand = (foundChar.brand || "").toLowerCase().trim()
  if (lostBrand && foundBrand && (lostBrand === foundBrand || lostBrand.includes(foundBrand) || foundBrand.includes(lostBrand))) {
    matchedPoints += 4
    matchedList.push("Brand trait")
  }

  // 3. Visible marks or damage (up to 3 pts)
  const lostMarks = (lostChar.marks || "").toLowerCase().trim()
  const foundMarks = (foundChar.marks || "").toLowerCase().trim()
  if (lostMarks && foundMarks) {
    const markWords = lostMarks.split(/\s+/).filter((w) => w.length > 3)
    const hasOverlap = markWords.some((w) => foundMarks.includes(w))
    if (hasOverlap) {
      matchedPoints += 3
      matchedList.push("Visible mark similarity")
    }
  }

  // 4. Accessories or attachments (up to 3 pts)
  const lostAcc = (lostChar.accessories || "").toLowerCase().trim()
  const foundAcc = (foundChar.accessories || "").toLowerCase().trim()
  if (lostAcc && foundAcc) {
    matchedPoints += 3
    matchedList.push("Compatible accessories")
  }

  // If no explicit characteristic form fields were filled, estimate baseline from title words
  if (matchedPoints === 0) {
    const lostWords = lostTitle.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
    const foundWords = foundTitle.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
    const overlap = lostWords.filter((w) => foundWords.includes(w))
    if (overlap.length >= 2) {
      matchedPoints = 7
      matchedList.push("Title attribute overlap")
    } else if (overlap.length === 1) {
      matchedPoints = 4
      matchedList.push("Broad title traits")
    } else {
      matchedPoints = 1
    }
  }

  const finalScore = Math.min(maxScore, matchedPoints)

  let strength: MatchSignal["strength"] = "Low"
  if (finalScore >= 11) strength = "Strong"
  else if (finalScore >= 7) strength = "Moderate"
  else if (finalScore >= 4) strength = "Partial"

  const detail =
    matchedList.length > 0
      ? matchedList.join(", ")
      : "Basic structural similarity"

  return {
    score: finalScore,
    signal: {
      name: "characteristics",
      label: "Item characteristics",
      strength,
      score: finalScore,
      maxScore,
      detail,
    },
  }
}
