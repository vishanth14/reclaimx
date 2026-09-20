export type SignalStrength =
  | "Strong"
  | "Very close"
  | "Within expected window"
  | "Similar"
  | "Moderate"
  | "Nearby"
  | "Plausible"
  | "Partial"
  | "Low"

export interface MatchSignal {
  name: "category" | "description" | "location" | "time" | "characteristics"
  label: string
  strength: SignalStrength
  score: number
  maxScore: number
  detail: string
}

export type MatchConfidence = "Strong potential match" | "Possible match" | "Low signal"

export interface MatchResult {
  lostItemId: string
  foundItemId: string
  score: number // 0 to 100
  confidenceLabel: MatchConfidence
  signals: MatchSignal[]
  createdAt: string
}
