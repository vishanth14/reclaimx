export interface MatchSignal {
  name: "category" | "location" | "time" | "description" | "characteristics"
  label: string
  strength: "Strong" | "Moderate" | "Low" | "Nearby" | "Very close" | "Within expected window" | "Plausible" | "Partial"
  score: number
  maxScore: number
  detail: string
}

export type MatchConfidence = "Strong potential match" | "Possible match" | "Low signal"

export interface MatchResult {
  lostItemId: string
  foundItemId: string
  score: number
  confidenceLabel: MatchConfidence
  signals: MatchSignal[]
  createdAt: string
}

export interface BackendItem {
  id: string
  type: "lost" | "found"
  category: string
  title: string
  description: string
  location: string
  date: string
  time: string
  imageUrl?: string
  status: "active" | "potential_match" | "verification" | "handover_ready" | "reclaimed"
  userId: string
  isDemo?: boolean
  createdAt: string
  latitude?: number
  longitude?: number
  characteristics?: Record<string, string>
}

// ── Category Score ─────────────────────────────────────────────
const RELATED_CATEGORIES: Record<string, string[]> = {
  Bags: ["Backpacks", "Luggage", "Accessories", "Personal"],
  Backpacks: ["Bags", "Luggage", "Accessories"],
  Electronics: ["Audio", "Earbuds", "Headphones", "Accessories", "Mobile"],
  Accessories: ["Electronics", "Bags", "Jewelry", "Personal", "Watches"],
  Academic: ["Documents", "Books", "Calculators", "Stationery"],
  Documents: ["Academic", "Cards", "Wallets", "ID"],
  Keys: ["Personal", "Accessories", "EDC"],
  "Water Bottles": ["Personal", "Sports"],
}

export function calculateCategoryScore(lostCat: string, foundCat: string): { score: number; signal: MatchSignal } {
  const normLost = (lostCat || "").trim().toLowerCase()
  const normFound = (foundCat || "").trim().toLowerCase()

  if (!normLost || !normFound) {
    return {
      score: 0,
      signal: {
        name: "category",
        label: "Item characteristics",
        strength: "Low",
        score: 0,
        maxScore: 25,
        detail: "Category unassigned",
      },
    }
  }

  if (normLost === normFound) {
    return {
      score: 25,
      signal: {
        name: "category",
        label: "Item characteristics",
        strength: "Strong",
        score: 25,
        maxScore: 25,
        detail: `Exact category match (${lostCat})`,
      },
    }
  }

  const relatedList = Object.entries(RELATED_CATEGORIES).find(([key]) => key.toLowerCase() === normLost)?.[1]
  const isRelated = relatedList?.some((rel) => rel.toLowerCase() === normFound || normFound.includes(rel.toLowerCase()))

  if (isRelated) {
    return {
      score: 16,
      signal: {
        name: "category",
        label: "Item characteristics",
        strength: "Moderate",
        score: 16,
        maxScore: 25,
        detail: `Compatible category grouping (${lostCat} ~ ${foundCat})`,
      },
    }
  }

  return {
    score: 0,
    signal: {
      name: "category",
      label: "Item characteristics",
      strength: "Low",
      score: 0,
      maxScore: 25,
      detail: `Different categories (${lostCat} ≠ ${foundCat})`,
    },
  }
}

// ── Description Score ──────────────────────────────────────────
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

export function calculateDescriptionScore(lostDesc: string, foundDesc: string, lostTitle = "", foundTitle = ""): { score: number; signal: MatchSignal } {
  const normLost = `${lostTitle} ${lostDesc}`.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w))
  const normFound = `${foundTitle} ${foundDesc}`.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w))

  const setFound = new Set(normFound)
  const shared = normLost.filter((w) => setFound.has(w))
  const uniqueShared = Array.from(new Set(shared))

  let score = 0
  if (uniqueShared.length >= 4) score = 25
  else if (uniqueShared.length === 3) score = 20
  else if (uniqueShared.length === 2) score = 15
  else if (uniqueShared.length === 1) score = 8

  let strength: MatchSignal["strength"] = "Low"
  if (score >= 20) strength = "Strong"
  else if (score >= 12) strength = "Moderate"

  return {
    score,
    signal: {
      name: "description",
      label: "Description similarity",
      strength,
      score,
      maxScore: 25,
      detail: uniqueShared.length > 0 ? `Shared keywords: ${uniqueShared.slice(0, 3).join(", ")}` : "No distinctive keyword overlap",
    },
  }
}

// ── Location Score ─────────────────────────────────────────────
export const CAMPUS_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  "central library": { lat: 37.4275, lng: -122.1697 },
  library: { lat: 37.4275, lng: -122.1697 },
  cafeteria: { lat: 37.4250, lng: -122.1702 },
  "tresidder union": { lat: 37.4250, lng: -122.1702 },
  "academic block": { lat: 37.4285, lng: -122.1740 },
  "academic block — room 204": { lat: 37.4285, lng: -122.1740 },
  "hewlett teaching center": { lat: 37.4288, lng: -122.1742 },
  "gates computer science": { lat: 37.4300, lng: -122.1730 },
  "student center": { lat: 37.4260, lng: -122.1700 },
  "bus stop": { lat: 37.4320, lng: -122.1780 },
  "bus stop — west gate": { lat: 37.4320, lng: -122.1780 },
  "main gate": { lat: 37.4340, lng: -122.1700 },
  "sports complex": { lat: 37.4310, lng: -122.1620 },
  gym: { lat: 37.4310, lng: -122.1620 },
  dorms: { lat: 37.4230, lng: -122.1670 },
}

export function calculateLocationScore(lostLoc: string, foundLoc: string): { score: number; signal: MatchSignal } {
  const normLost = (lostLoc || "").trim().toLowerCase()
  const normFound = (foundLoc || "").trim().toLowerCase()

  if (normLost && normFound && (normLost === normFound || normLost.includes(normFound) || normFound.includes(normLost))) {
    return {
      score: 20,
      signal: {
        name: "location",
        label: "Location proximity",
        strength: "Very close",
        score: 20,
        maxScore: 20,
        detail: `Matching campus area (${lostLoc || foundLoc})`,
      },
    }
  }

  return {
    score: 6,
    signal: {
      name: "location",
      label: "Location proximity",
      strength: "Low",
      score: 6,
      maxScore: 20,
      detail: `Different campus zones (${lostLoc} vs ${foundLoc})`,
    },
  }
}

// ── Time Score ─────────────────────────────────────────────────
export function calculateTimeScore(lostDate: string, _lostTime: string, foundDate: string, _foundTime: string): { score: number; signal: MatchSignal } {
  if (lostDate === foundDate) {
    return {
      score: 15,
      signal: {
        name: "time",
        label: "Time window",
        strength: "Within expected window",
        score: 15,
        maxScore: 15,
        detail: "Reported on the same day",
      },
    }
  }
  return {
    score: 8,
    signal: {
      name: "time",
      label: "Time window",
      strength: "Plausible",
      score: 8,
      maxScore: 15,
      detail: "Within reasonable timeframe",
    },
  }
}

// ── Characteristic Score ───────────────────────────────────────
export function calculateCharacteristicScore(
  lostChar: Record<string, string> = {},
  foundChar: Record<string, string> = {},
  lostTitle = "",
  foundTitle = "",
): { score: number; signal: MatchSignal } {
  let matchedPoints = 0
  const matchedList: string[] = []

  const lostColor = (lostChar.color || "").toLowerCase().trim()
  const foundColor = (foundChar.color || "").toLowerCase().trim()
  if (lostColor && foundColor && (lostColor === foundColor || lostColor.includes(foundColor) || foundColor.includes(lostColor))) {
    matchedPoints += 5
    matchedList.push("Color match")
  }

  const lostBrand = (lostChar.brand || "").toLowerCase().trim()
  const foundBrand = (foundChar.brand || "").toLowerCase().trim()
  if (lostBrand && foundBrand && (lostBrand === foundBrand || lostBrand.includes(foundBrand) || foundBrand.includes(lostBrand))) {
    matchedPoints += 4
    matchedList.push("Brand trait")
  }

  if (matchedPoints === 0) {
    const lostWords = lostTitle.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
    const foundWords = foundTitle.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
    const overlap = lostWords.filter((w) => foundWords.includes(w))
    if (overlap.length >= 1) {
      matchedPoints = 5
      matchedList.push("Title attribute overlap")
    }
  }

  const finalScore = Math.min(15, matchedPoints || 2)
  return {
    score: finalScore,
    signal: {
      name: "characteristics",
      label: "Item characteristics",
      strength: finalScore >= 8 ? "Strong" : "Moderate",
      score: finalScore,
      maxScore: 15,
      detail: matchedList.length > 0 ? matchedList.join(", ") : "Baseline structural traits",
    },
  }
}

export function scorePair(lost: BackendItem, found: BackendItem): MatchResult {
  const cat = calculateCategoryScore(lost.category, found.category)
  const desc = calculateDescriptionScore(lost.description, found.description, lost.title, found.title)
  const loc = calculateLocationScore(lost.location, found.location)
  const time = calculateTimeScore(lost.date, lost.time, found.date, found.time)
  const char = calculateCharacteristicScore(lost.characteristics, found.characteristics, lost.title, found.title)

  const total = cat.score + desc.score + loc.score + time.score + char.score
  let confidence: MatchConfidence = "Low signal"
  if (total >= 80) confidence = "Strong potential match"
  else if (total >= 60) confidence = "Possible match"

  return {
    lostItemId: lost.id,
    foundItemId: found.id,
    score: total,
    confidenceLabel: confidence,
    signals: [cat.signal, loc.signal, time.signal, desc.signal, char.signal],
    createdAt: new Date().toISOString(),
  }
}
