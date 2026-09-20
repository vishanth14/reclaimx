/**
 * LocalAdapter — localStorage + in-memory implementation.
 *
 * This is the EXISTING behavior extracted into the adapter pattern.
 * All logic from storageService, matchingService, verificationService,
 * handoverService, itemsService, and claimsService lives here.
 */

import type { Item, ItemStatus } from "../../types/items"
import type { ProofClue, ProofLocker, PublicProofQuestion } from "../../types/proof"
import type { Claim, ClaimAnswer, ClaimStatus } from "../../types/claims"
import type { MatchResult, MatchConfidence } from "../../types/matches"
import { SEED_ITEMS, SEED_PROOF_LOCKERS, SEED_CLAIMS } from "../../data/seedData"
import { getCurrentUser } from "../../types/users"
import { calculateCategoryScore } from "../../logic/matching/categoryScore"
import { calculateDescriptionScore } from "../../logic/matching/descriptionScore"
import { calculateLocationScore } from "../../logic/matching/locationScore"
import { calculateTimeScore } from "../../logic/matching/timeScore"
import { calculateCharacteristicScore } from "../../logic/matching/characteristicScore"
import { compareAnswers } from "../../logic/verification/answerNormalization"

import type {
  BackendAdapter,
  CreateLostItemParams,
  CreateFoundItemParams,
  VerificationEvaluation,
  UserProfile,
} from "./types"

// ─── Storage keys ────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  ITEMS: "reclaimx_items_v4",
  PROOF_LOCKERS: "reclaimx_proof_lockers_v4",
  CLAIMS: "reclaimx_claims_v4",
  INITIALIZED: "reclaimx_initialized_v4",
}

// ─── Local Adapter Implementation ────────────────────────────────────────────

class LocalAdapterImpl implements BackendAdapter {
  private inMemoryItems: Item[] = []
  private inMemoryProofLockers: Record<string, ProofLocker> = {}
  private inMemoryClaims: Claim[] = []

  constructor() {
    this.init()
  }

  private hasLocalStorage(): boolean {
    return typeof window !== "undefined" && !!window.localStorage
  }

  // ── Initialization ──────────────────────────────────────────────────────────

  public init() {
    if (!this.hasLocalStorage()) {
      this.inMemoryItems = [...SEED_ITEMS]
      this.inMemoryProofLockers = { ...SEED_PROOF_LOCKERS }
      this.inMemoryClaims = [...SEED_CLAIMS]
      return
    }

    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED)
    if (!initialized) {
      this.resetDemoData()
      return
    }

    try {
      const itemsRaw = localStorage.getItem(STORAGE_KEYS.ITEMS)
      this.inMemoryItems = itemsRaw ? JSON.parse(itemsRaw) : [...SEED_ITEMS]

      const lockersRaw = localStorage.getItem(STORAGE_KEYS.PROOF_LOCKERS)
      this.inMemoryProofLockers = lockersRaw
        ? JSON.parse(lockersRaw)
        : { ...SEED_PROOF_LOCKERS }

      const claimsRaw = localStorage.getItem(STORAGE_KEYS.CLAIMS)
      this.inMemoryClaims = claimsRaw ? JSON.parse(claimsRaw) : [...SEED_CLAIMS]
    } catch {
      this.resetDemoData()
    }
  }

  public resetDemoData() {
    this.inMemoryItems = JSON.parse(JSON.stringify(SEED_ITEMS))
    this.inMemoryProofLockers = JSON.parse(JSON.stringify(SEED_PROOF_LOCKERS))
    this.inMemoryClaims = JSON.parse(JSON.stringify(SEED_CLAIMS))

    if (this.hasLocalStorage()) {
      try {
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(this.inMemoryItems))
        localStorage.setItem(STORAGE_KEYS.PROOF_LOCKERS, JSON.stringify(this.inMemoryProofLockers))
        localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(this.inMemoryClaims))
        localStorage.setItem(STORAGE_KEYS.INITIALIZED, "true")
        localStorage.removeItem("reclaimx_active_lost_id")
        localStorage.removeItem("reclaimx_active_found_id")
        localStorage.removeItem("reclaimx_active_item_id")
        localStorage.removeItem("reclaimx_active_claim_id")
        localStorage.removeItem("reclaimx_active_completed_claim_id")
      } catch {
        // Fallback to in-memory if quota exceeded
      }
    }
  }

  public resetUserData() {
    this.inMemoryItems = this.inMemoryItems.filter((i) => i.isDemo === true)
    this.inMemoryProofLockers = Object.fromEntries(
      Object.entries(this.inMemoryProofLockers).filter(([_, l]) => l.isDemo === true),
    )
    this.inMemoryClaims = this.inMemoryClaims.filter((c) => c.isDemo === true)

    if (this.hasLocalStorage()) {
      try {
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(this.inMemoryItems))
        localStorage.setItem(STORAGE_KEYS.PROOF_LOCKERS, JSON.stringify(this.inMemoryProofLockers))
        localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(this.inMemoryClaims))
        localStorage.removeItem("reclaimx_active_lost_id")
        localStorage.removeItem("reclaimx_active_found_id")
        localStorage.removeItem("reclaimx_active_item_id")
        localStorage.removeItem("reclaimx_active_claim_id")
        localStorage.removeItem("reclaimx_active_completed_claim_id")
      } catch {
        // Fallback
      }
    }
  }

  // ── Items CRUD ──────────────────────────────────────────────────────────────

  public getItems(): Item[] {
    return [...this.inMemoryItems]
  }

  public getItemById(id: string): Item | undefined {
    return this.inMemoryItems.find((i) => i.id === id)
  }

  public getLostItems(): Item[] {
    return this.inMemoryItems.filter((i) => i.type === "lost")
  }

  public getFoundItems(): Item[] {
    return this.inMemoryItems.filter((i) => i.type === "found")
  }

  public getUserItems(): Item[] {
    const user = this.getCurrentUser()
    return this.inMemoryItems.filter((i) => !i.isDemo && i.userId === user.id)
  }

  public searchItems(query: string, filter: string): Item[] {
    const q = query.toLowerCase().trim()
    return this.inMemoryItems.filter((item) => {
      const matchesFilter =
        filter === "All" ||
        (filter === "Lost" && item.type === "lost") ||
        (filter === "Found" && item.type === "found")

      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)

      return matchesFilter && matchesQuery
    })
  }

  public saveItem(item: Item): Item {
    const existingIdx = this.inMemoryItems.findIndex((i) => i.id === item.id)
    if (existingIdx >= 0) {
      this.inMemoryItems[existingIdx] = { ...this.inMemoryItems[existingIdx], ...item }
    } else {
      this.inMemoryItems.unshift(item)
    }
    this.persistItems()
    return item
  }

  public updateItem(id: string, updates: Partial<Item>): Item | undefined {
    const idx = this.inMemoryItems.findIndex((i) => i.id === id)
    if (idx === -1) return undefined
    this.inMemoryItems[idx] = { ...this.inMemoryItems[idx], ...updates }
    this.persistItems()
    return this.inMemoryItems[idx]
  }

  public updateItemStatus(id: string, status: ItemStatus): Item | undefined {
    return this.updateItem(id, { status })
  }

  private persistItems() {
    if (this.hasLocalStorage()) {
      try {
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(this.inMemoryItems))
      } catch (e) {
        console.warn("Storage quota exceeded", e)
      }
    }
  }

  // ── Item creation with side effects ─────────────────────────────────────────

  public createLostItem(params: CreateLostItemParams) {
    const user = this.getCurrentUser()
    const id = `RX-LOST-${Math.floor(1000 + Math.random() * 9000)}`

    const newItem: Item = {
      id,
      type: "lost",
      category: params.category,
      title: params.title || `${params.category} item`,
      description: params.description,
      location: params.location,
      date: params.date || "Today",
      time: params.time || "Just now",
      status: "active",
      createdAt: new Date().toISOString(),
      userId: user.id,
      isDemo: false,
      imageUrl: params.imageUrl,
      imageAlt: params.imageAlt,
      characteristics: params.characteristics,
    }

    this.saveItem(newItem)

    // Calculate initial potential matches
    const matches = this.findMatchesForLost(newItem.id)
    if (matches.length > 0) {
      this.updateItem(newItem.id, {
        status: "potential_match",
        matchIds: matches.map((m) => m.foundItem.id),
      })
    }

    return { item: newItem, matches }
  }

  public createFoundItem(params: CreateFoundItemParams) {
    const user = this.getCurrentUser()
    const itemId = `RX-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`
    const lockerId = `locker-${itemId.toLowerCase()}`

    // 1. Create and seal Proof Locker with private clues
    const proofClues: ProofClue[] = params.clues
      .filter((c) => (c.text || "").trim().length > 0)
      .map((c, idx) => ({
        id: `clue-${idx + 1}`,
        question: c.question || `Private ownership detail ${idx + 1}`,
        expectedAnswer: c.text.trim(),
        type: "text" as const,
        sealed: true,
      }))

    const proofLocker: ProofLocker = {
      id: lockerId,
      itemId,
      sealedAt: new Date().toISOString(),
      hash: `0x${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
      isDemo: false,
      clues: proofClues,
    }
    this.saveProofLocker(proofLocker)

    // 2. Create public found item (NO private clues in Item object)
    const newItem: Item = {
      id: itemId,
      type: "found",
      category: params.category,
      title: params.title || `${params.category} item`,
      description: params.description,
      location: params.location,
      date: params.date || "Today",
      time: params.time || "Just now",
      status: "active",
      createdAt: new Date().toISOString(),
      userId: user.id,
      isDemo: false,
      imageUrl: params.imageUrl,
      imageAlt: params.imageAlt,
      proofLockerId: lockerId,
      characteristics: params.characteristics,
    }
    this.saveItem(newItem)

    // Check if any lost items match this newly reported found item
    const matches = this.findMatchesForFound(newItem.id)
    if (matches.length > 0) {
      this.updateItem(newItem.id, {
        status: "potential_match",
        matchIds: matches.map((m) => m.lostItem.id),
      })
    }

    return {
      item: newItem,
      proofLocker: {
        id: lockerId,
        itemId,
        sealedAt: proofLocker.sealedAt,
        hash: proofLocker.hash,
        clueCount: proofClues.length,
      },
    }
  }

  // ── Matching ────────────────────────────────────────────────────────────────

  public scorePair(lostItem: Item, foundItem: Item): MatchResult {
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
  }

  public findMatchesForLost(
    lostItemOrId: string | Item,
    minThreshold = 55,
  ): { match: MatchResult; foundItem: Item }[] {
    const lostItem =
      typeof lostItemOrId === "string"
        ? this.getItemById(lostItemOrId)
        : lostItemOrId
    if (!lostItem) return []

    const foundItems = this.inMemoryItems.filter(
      (i) => i.type === "found" && i.status !== "reclaimed",
    )

    return foundItems
      .map((found) => ({ match: this.scorePair(lostItem, found), foundItem: found }))
      .filter((x) => x.match.score >= minThreshold)
      .sort((a, b) => b.match.score - a.match.score)
  }

  public findMatchesForFound(
    foundItemOrId: string | Item,
    minThreshold = 55,
  ): { match: MatchResult; lostItem: Item }[] {
    const foundItem =
      typeof foundItemOrId === "string"
        ? this.getItemById(foundItemOrId)
        : foundItemOrId
    if (!foundItem) return []

    const lostItems = this.inMemoryItems.filter(
      (i) => i.type === "lost" && i.status !== "reclaimed",
    )

    return lostItems
      .map((lost) => ({ match: this.scorePair(lost, foundItem), lostItem: lost }))
      .filter((x) => x.match.score >= minThreshold)
      .sort((a, b) => b.match.score - a.match.score)
  }

  // ── Proof Locker ────────────────────────────────────────────────────────────

  public getProofLocker(itemIdOrLockerId: string): ProofLocker | undefined {
    if (this.inMemoryProofLockers[itemIdOrLockerId]) {
      return this.inMemoryProofLockers[itemIdOrLockerId]
    }
    return Object.values(this.inMemoryProofLockers).find(
      (l) => l.itemId === itemIdOrLockerId || l.id === itemIdOrLockerId,
    )
  }

  public getProofLockers(): Record<string, ProofLocker> {
    return this.inMemoryProofLockers
  }

  public saveProofLocker(locker: ProofLocker): ProofLocker {
    this.inMemoryProofLockers[locker.id] = locker
    if (this.hasLocalStorage()) {
      try {
        localStorage.setItem(
          STORAGE_KEYS.PROOF_LOCKERS,
          JSON.stringify(this.inMemoryProofLockers),
        )
      } catch (e) {
        console.warn("Storage quota exceeded", e)
      }
    }
    return locker
  }

  public getUserProofLockers(): ProofLocker[] {
    return Object.values(this.inMemoryProofLockers).filter((l) => !l.isDemo)
  }

  // ── Claims CRUD ─────────────────────────────────────────────────────────────

  public getClaims(userId?: string): Claim[] {
    if (!userId) return [...this.inMemoryClaims]
    return this.inMemoryClaims.filter(
      (c) => c.claimantId === userId || c.finderId === userId,
    )
  }

  public getUserClaims(): Claim[] {
    const user = this.getCurrentUser()
    return this.inMemoryClaims.filter(
      (c) => !c.isDemo && (c.claimantId === user.id || c.finderId === user.id),
    )
  }

  public getClaimById(id: string): Claim | undefined {
    return this.inMemoryClaims.find((c) => c.id === id)
  }

  public createClaim(lostItemId: string, foundItemId: string): Claim {
    const user = this.getCurrentUser()
    const foundItem = this.getItemById(foundItemId)

    const claimId = `claim-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    const newClaim: Claim = {
      id: claimId,
      lostItemId,
      foundItemId,
      claimantId: user.id,
      finderId: foundItem?.userId || "user-finder-01",
      status: "verification",
      isDemo: false,
      createdAt: new Date().toISOString(),
    }

    this.saveClaim(newClaim)
    return newClaim
  }

  public saveClaim(claim: Claim): Claim {
    const existingIdx = this.inMemoryClaims.findIndex((c) => c.id === claim.id)
    if (existingIdx >= 0) {
      this.inMemoryClaims[existingIdx] = { ...this.inMemoryClaims[existingIdx], ...claim }
    } else {
      this.inMemoryClaims.unshift(claim)
    }
    this.persistClaims()
    return claim
  }

  public updateClaim(id: string, updates: Partial<Claim>): Claim | undefined {
    const idx = this.inMemoryClaims.findIndex((c) => c.id === id)
    if (idx === -1) return undefined
    this.inMemoryClaims[idx] = { ...this.inMemoryClaims[idx], ...updates }
    this.persistClaims()
    return this.inMemoryClaims[idx]
  }

  private persistClaims() {
    if (this.hasLocalStorage()) {
      try {
        localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(this.inMemoryClaims))
      } catch (e) {
        console.warn("Storage quota exceeded", e)
      }
    }
  }

  // ── Verification ────────────────────────────────────────────────────────────

  public getPublicQuestions(itemId: string): PublicProofQuestion[] {
    const locker = this.getProofLocker(itemId)
    if (!locker || !locker.clues || locker.clues.length === 0) {
      return [
        {
          id: "default-1",
          question: "What was attached to the item?",
          type: "text",
          placeholder: "Describe any keychains, attachments, tags, or clips…",
        },
        {
          id: "default-2",
          question: "Where was the distinctive damage or mark?",
          type: "text",
          placeholder: "Describe the tear, zipper condition, markings…",
        },
        {
          id: "default-3",
          question: "What was inside the main or front compartment?",
          type: "text",
          placeholder: "Notebooks, adapters, electronics, documents…",
        },
      ]
    }

    return locker.clues.map((clue) => ({
      id: clue.id,
      question: clue.question,
      type: clue.type,
      placeholder: "Enter details known only to the true owner…",
    }))
  }

  public async evaluateVerification(
    foundItemId: string,
    claimantAnswers: ClaimAnswer[],
  ): Promise<VerificationEvaluation> {
    const locker = this.getProofLocker(foundItemId)

    // Simulate computation delay
    await new Promise((r) => setTimeout(r, 600))

    if (!locker || !locker.clues || locker.clues.length === 0) {
      const meaningfulCount = claimantAnswers.filter(
        (a) => (a.answer || "").trim().length >= 3,
      ).length

      const passed = meaningfulCount >= 2
      return {
        passed,
        status: passed ? "verified" : "rejected",
        matchedCount: meaningfulCount,
        requiredCount: 3,
        message: passed
          ? "Ownership evidence matched the verification criteria."
          : "Some of the provided information did not match the verification criteria.",
        matchedCategories: passed
          ? ["Item characteristics", "Private details", "Time consistency"]
          : [],
      }
    }

    let matchedCount = 0
    const totalRequired = locker.clues.length

    for (const clue of locker.clues) {
      const claimantEntry = claimantAnswers.find(
        (a) => a.clueId === clue.id || a.question === clue.question,
      )

      if (claimantEntry && compareAnswers(claimantEntry.answer, clue.expectedAnswer)) {
        matchedCount++
      }
    }

    let status: "verified" | "rejected" | "incomplete" = "rejected"
    let passed = false

    if (matchedCount === totalRequired || (totalRequired >= 3 && matchedCount >= totalRequired - 0)) {
      status = "verified"
      passed = true
    } else if (matchedCount >= 2 && totalRequired >= 3) {
      status = "incomplete"
      passed = false
    } else {
      status = "rejected"
      passed = false
    }

    const message = passed
      ? "Ownership evidence matched the verification criteria."
      : "Some of the provided information did not match the verification criteria."

    const matchedCategories = passed
      ? ["Item characteristics", "Private details", "Time consistency", "Location consistency"]
      : []

    return { passed, status, matchedCount, requiredCount: totalRequired, message, matchedCategories }
  }

  // ── Handover ────────────────────────────────────────────────────────────────

  public confirmFinder(claimId: string): Claim | undefined {
    return this.updateClaim(claimId, { finderConfirmed: true })
  }

  public confirmOwner(claimId: string): Claim | undefined {
    return this.updateClaim(claimId, { ownerConfirmed: true })
  }

  public completeHandover(claimId: string): { claim: Claim; itemReclaimed: boolean } {
    const claim = this.getClaimById(claimId)
    if (!claim) {
      throw new Error("Claim not found")
    }

    const resolvedAt = new Date().toISOString()

    const updatedClaim = this.updateClaim(claimId, {
      status: "completed",
      ownerConfirmed: true,
      finderConfirmed: true,
      resolvedAt,
    })!

    this.updateItem(claim.foundItemId, { status: "reclaimed" })
    if (claim.lostItemId) {
      this.updateItem(claim.lostItemId, { status: "reclaimed" })
    }

    return { claim: updatedClaim, itemReclaimed: true }
  }

  // ── User ────────────────────────────────────────────────────────────────────

  public getCurrentUser(): UserProfile {
    const user = getCurrentUser()
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      department: user.department,
      phone: user.phone,
    }
  }
}

// ─── Singleton export ────────────────────────────────────────────────────────

export const localAdapter = new LocalAdapterImpl()
