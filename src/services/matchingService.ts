import type { Item } from "../types/items"
import type { MatchResult, MatchConfidence } from "../types/matches"
import { calculateCategoryScore } from "../logic/matching/categoryScore"
import { calculateDescriptionScore } from "../logic/matching/descriptionScore"
import { calculateLocationScore } from "../logic/matching/locationScore"
import { calculateTimeScore } from "../logic/matching/timeScore"
import { calculateCharacteristicScore } from "../logic/matching/characteristicScore"
import { storageService } from "./storageService"

export const matchingService = {
  /**
   * Evaluates a lost item against a single candidate found item.
   * Produces explainable signal breakdown (0–100 total).
   */
  scorePair(lostItem: Item, foundItem: Item): MatchResult {
    const cat = calculateCategoryScore(lostItem.category, foundItem.category)
    const desc = calculateDescriptionScore(
      lostItem.description,
      foundItem.description,
      lostItem.title,
      foundItem.title,
    )
    const loc = calculateLocationScore(
      lostItem.location,
      foundItem.location,
      lostItem.latitude,
      lostItem.longitude,
      foundItem.latitude,
      foundItem.longitude,
    )
    const time = calculateTimeScore(
      lostItem.date,
      lostItem.time,
      foundItem.date,
      foundItem.time,
    )
    const char = calculateCharacteristicScore(
      lostItem.characteristics,
      foundItem.characteristics,
      lostItem.title,
      foundItem.title,
    )

    const totalScore = cat.score + desc.score + loc.score + time.score + char.score

    let confidenceLabel: MatchConfidence = "Low signal"
    if (totalScore >= 80) {
      confidenceLabel = "Strong potential match"
    } else if (totalScore >= 60) {
      confidenceLabel = "Possible match"
    }

    return {
      lostItemId: lostItem.id,
      foundItemId: foundItem.id,
      score: totalScore,
      confidenceLabel,
      signals: [cat.signal, loc.signal, time.signal, desc.signal, char.signal],
      createdAt: new Date().toISOString(),
    }
  },

  /**
   * Compares a lost item against candidate found items and returns sorted matches.
   */
  findPotentialMatches(
    lostItem: Item,
    candidateFoundItems: Item[],
    minThreshold = 55,
  ): MatchResult[] {
    const results = candidateFoundItems
      .filter((found) => found.type === "found" && found.status !== "reclaimed")
      .map((found) => this.scorePair(lostItem, found))
      .filter((res) => res.score >= minThreshold)
      .sort((a, b) => b.score - a.score)

    return results
  },

  /**
   * Helper to find all potential matches for a lost item from storage.
   */
  findMatchesForLost(
    lostItemOrId: string | Item,
    minThreshold = 55,
  ): { match: MatchResult; foundItem: Item }[] {
    const lostItem =
      typeof lostItemOrId === "string"
        ? storageService.getItemById(lostItemOrId)
        : lostItemOrId
    if (!lostItem) return []

    const allItems = storageService.getItems()
    const foundItems = allItems.filter((i) => i.type === "found" && i.status !== "reclaimed")

    const rankedResults = this.findPotentialMatches(lostItem, foundItems, minThreshold)

    return rankedResults
      .map((res) => {
        const found = foundItems.find((f) => f.id === res.foundItemId)
        if (!found) return null
        return { match: res, foundItem: found }
      })
      .filter((x): x is { match: MatchResult; foundItem: Item } => x !== null)
  },

  /**
   * Helper to find all potential matches for a found item from storage.
   */
  findMatchesForFound(
    foundItemOrId: string | Item,
    minThreshold = 55,
  ): { match: MatchResult; lostItem: Item }[] {
    const foundItem =
      typeof foundItemOrId === "string"
        ? storageService.getItemById(foundItemOrId)
        : foundItemOrId
    if (!foundItem) return []

    const allItems = storageService.getItems()
    const lostItems = allItems.filter((i) => i.type === "lost" && i.status !== "reclaimed")

    const results = lostItems
      .map((lost) => ({ match: this.scorePair(lost, foundItem), lostItem: lost }))
      .filter((x) => x.match.score >= minThreshold)
      .sort((a, b) => b.match.score - a.match.score)

    return results
  },
}
