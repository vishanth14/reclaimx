import type { MatchSignal } from "../../types/matches"

// Category taxonomy relationships for fuzzy semantic grouping
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

export function calculateCategoryScore(
  lostCategory: string,
  foundCategory: string,
): { score: number; signal: MatchSignal } {
  const normLost = (lostCategory || "").trim().toLowerCase()
  const normFound = (foundCategory || "").trim().toLowerCase()

  let score = 0
  let strength: MatchSignal["strength"] = "Low"
  let detail = `Category mismatch (${lostCategory || "Unknown"} vs ${foundCategory || "Unknown"})`

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
    score = 25
    strength = "Strong"
    detail = `Exact category match (${lostCategory})`
  } else {
    // Check related taxonomy
    const relatedList = Object.entries(RELATED_CATEGORIES).find(
      ([key]) => key.toLowerCase() === normLost,
    )?.[1]

    const isRelated = relatedList?.some(
      (rel) => rel.toLowerCase() === normFound || normFound.includes(rel.toLowerCase()),
    )

    if (isRelated) {
      score = 16
      strength = "Moderate"
      detail = `Compatible category grouping (${lostCategory} ~ ${foundCategory})`
    } else {
      score = 0
      strength = "Low"
      detail = `Different categories (${lostCategory} ≠ ${foundCategory})`
    }
  }

  return {
    score,
    signal: {
      name: "category",
      label: "Item characteristics",
      strength,
      score,
      maxScore: 25,
      detail,
    },
  }
}
