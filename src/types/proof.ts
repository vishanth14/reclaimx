export type ProofClueType = "text" | "number" | "choice"

export interface ProofClue {
  id: string
  question: string
  expectedAnswer: string
  type?: ProofClueType
  sealed?: boolean
}

export interface ProofLocker {
  id: string
  itemId: string
  sealedAt: string
  clues: ProofClue[]
  hash?: string
  isDemo?: boolean
}

/**
 * Public facing question schema.
 * Notice: expectedAnswer is intentionally omitted so claimants never receive answers.
 */
export interface PublicProofQuestion {
  id: string
  question: string
  type?: ProofClueType
  placeholder?: string
}
