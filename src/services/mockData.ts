// Canonical mock exports — forward from centralized dataset
export {
  DEMO_ITEMS as ITEMS,
  DEMO_CLAIMS as CLAIMS,
  LOCATIONS,
  CATEGORIES,
} from "../data/demoItems"

export type { Item, ItemStatus } from "../types/items"
export type { Claim, ClaimStatus } from "../types/claims"
export type { MatchSignal } from "../types/matches"

export const MATCH_SIGNALS = [
  { label: "Item characteristics", strength: "Strong", score: 88 },
  { label: "Location proximity", strength: "Very close", score: 95 },
  { label: "Time proximity", strength: "Within expected window", score: 72 },
  { label: "Description similarity", strength: "Similar", score: 65 },
]
