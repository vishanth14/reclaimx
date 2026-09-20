/**
 * BackendAdapter — the contract every backend implementation must fulfill.
 *
 * The frontend services delegate ALL persistence, retrieval, and
 * server-side logic through this interface.  Swap `localAdapter`
 * for `awsAdapter` without touching a single UI component.
 */

import type { Item, ItemType, ItemStatus } from "../../types/items"
import type { Claim, ClaimAnswer } from "../../types/claims"
import type { MatchResult } from "../../types/matches"
import type { ProofLocker, PublicProofQuestion } from "../../types/proof"

// ─── Param types ─────────────────────────────────────────────────────────────

export interface CreateLostItemParams {
  category: string
  title: string
  description: string
  location: string
  date: string
  time: string
  imageUrl?: string
  imageAlt?: string
  characteristics?: Record<string, string>
}

export interface CreateFoundItemParams {
  category: string
  title: string
  description: string
  location: string
  date: string
  time: string
  imageUrl?: string
  imageAlt?: string
  clues: { question?: string; text: string }[]
  characteristics?: Record<string, string>
}

export interface UploadUrlResult {
  uploadUrl: string
  imageKey: string
}

/** Proof Locker metadata returned to the frontend (never includes expectedAnswer) */
export interface ProofLockerMeta {
  id: string
  itemId: string
  sealedAt: string
  hash?: string
  clueCount: number
}

export interface VerificationEvaluation {
  passed: boolean
  status: "verified" | "rejected" | "incomplete"
  matchedCount: number
  requiredCount: number
  message: string
  matchedCategories: string[]
}

export interface DashboardStats {
  totalItems: number
  activeItems: number
  potentialMatches: number
  openClaims: number
  itemsReclaimed: number
}

export interface UserProfile {
  id: string
  name: string
  email: string
  role: "student" | "staff" | "security"
  studentId?: string
  department?: string
  phone?: string
}

// ─── Adapter interface ───────────────────────────────────────────────────────

export interface BackendAdapter {
  // ── Initialization ──────────────────────────────────────────────────────────
  init(): void

  // ── Items ───────────────────────────────────────────────────────────────────
  getItems(filters?: { type?: ItemType; status?: ItemStatus }): Item[]
  getItemById(id: string): Item | undefined
  searchItems(query: string, filter: string): Item[]
  getLostItems(): Item[]
  getFoundItems(): Item[]
  getUserItems(): Item[]
  createLostItem(params: CreateLostItemParams): { item: Item; matches: { match: MatchResult; foundItem: Item }[] }
  createFoundItem(params: CreateFoundItemParams): { item: Item; proofLocker: ProofLockerMeta }
  updateItemStatus(id: string, status: ItemStatus): Item | undefined
  saveItem(item: Item): Item
  updateItem(id: string, updates: Partial<Item>): Item | undefined

  // ── Matching ────────────────────────────────────────────────────────────────
  findMatchesForLost(lostItemOrId: string | Item, minThreshold?: number): { match: MatchResult; foundItem: Item }[]
  findMatchesForFound(foundItemOrId: string | Item, minThreshold?: number): { match: MatchResult; lostItem: Item }[]
  scorePair(lostItem: Item, foundItem: Item): MatchResult

  // ── Proof Locker ────────────────────────────────────────────────────────────
  getProofLocker(itemIdOrLockerId: string): ProofLocker | undefined
  getProofLockers(): Record<string, ProofLocker>
  saveProofLocker(locker: ProofLocker): ProofLocker
  getUserProofLockers(): ProofLocker[]

  // ── Claims ──────────────────────────────────────────────────────────────────
  getClaims(userId?: string): Claim[]
  getUserClaims(): Claim[]
  getClaimById(id: string): Claim | undefined
  createClaim(lostItemId: string, foundItemId: string): Claim
  saveClaim(claim: Claim): Claim
  updateClaim(id: string, updates: Partial<Claim>): Claim | undefined

  // ── Verification ────────────────────────────────────────────────────────────
  getPublicQuestions(itemId: string): PublicProofQuestion[]
  evaluateVerification(foundItemId: string, claimantAnswers: ClaimAnswer[]): Promise<VerificationEvaluation>

  // ── Handover ────────────────────────────────────────────────────────────────
  confirmFinder(claimId: string): Claim | undefined
  confirmOwner(claimId: string): Claim | undefined
  completeHandover(claimId: string): { claim: Claim; itemReclaimed: boolean }

  // ── User ────────────────────────────────────────────────────────────────────
  getCurrentUser(): UserProfile

  // ── Reset ───────────────────────────────────────────────────────────────────
  resetDemoData(): void
  resetUserData(): void
}
