export type ClaimStatus =
  | "pending"
  | "verification"
  | "verified"
  | "rejected"
  | "handover_ready"
  | "completed"

export interface ClaimAnswer {
  clueId: string
  question: string
  answer: string
}

export interface VerificationResult {
  status: "verified" | "rejected" | "incomplete"
  matchedCount: number
  requiredCount: number
  message: string
  matchedSignals?: string[]
}

export interface Claim {
  id: string
  lostItemId: string
  foundItemId: string
  claimantId: string
  finderId?: string
  isDemo?: boolean
  status: ClaimStatus
  answers?: ClaimAnswer[]
  verificationResult?: VerificationResult
  handoverCode?: string
  handoverExpiresAt?: string
  expiresAt?: string
  ownerConfirmed?: boolean
  finderConfirmed?: boolean
  createdAt: string
  resolvedAt?: string
}
