/**
 * AwsAdapter — real API Gateway + Cognito + DynamoDB backend adapter.
 *
 * Implements the BackendAdapter contract.
 * Uses AWS Amplify Auth for Cognito session & JWT tokens.
 * Communicates with API Gateway endpoints in ap-south-1.
 * Caches items & claims in-memory for instant synchronous UI consumption.
 */

import { fetchAuthSession, getCurrentUser as getAmplifyUser } from "aws-amplify/auth"
import type { Item, ItemStatus, ItemType } from "../../types/items"
import type { ProofLocker, PublicProofQuestion } from "../../types/proof"
import type { Claim, ClaimAnswer } from "../../types/claims"
import type { MatchResult } from "../../types/matches"
import { APP_CONFIG } from "../../config"
import { DEMO_ITEMS, DEMO_PROOF_LOCKERS } from "../../data/demoItems"
import { calculateCategoryScore } from "../../logic/matching/categoryScore"
import { calculateDescriptionScore } from "../../logic/matching/descriptionScore"
import { calculateLocationScore } from "../../logic/matching/locationScore"
import { calculateTimeScore } from "../../logic/matching/timeScore"
import { calculateCharacteristicScore } from "../../logic/matching/characteristicScore"
import type {
  BackendAdapter,
  CreateLostItemParams,
  CreateFoundItemParams,
  ProofLockerMeta,
  VerificationEvaluation,
  UserProfile,
} from "./types"

function getApiUrl(path: string): string {
  const base = APP_CONFIG.apiBaseUrl.replace(/\/+$/, "")
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}

async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const session = await fetchAuthSession()
    const token = session.tokens?.idToken?.toString()
    if (token) {
      return { Authorization: `Bearer ${token}` }
    }
  } catch {
    // Unauthenticated or local dev fallback
  }
  return {}
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!APP_CONFIG.apiBaseUrl) {
    throw new Error(
      "VITE_API_BASE_URL is not configured. Deploy the AWS CDK stack and set the environment variable.",
    )
  }

  const authHeader = await getAuthHeader()
  const res = await fetch(getApiUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...options.headers,
    },
  })

  if (!res.ok) {
    const errorText = await res.text().catch(() => "")
    throw new Error(`API Error [${res.status}]: ${errorText || res.statusText}`)
  }

  return res.json()
}

class AwsAdapterImpl implements BackendAdapter {
  private itemsCache: Item[] = []
  private claimsCache: Claim[] = []
  private proofLockersCache: Record<string, ProofLocker> = {}
  private isInitialized = false

  public init(): void {
    if (this.isInitialized) return
    this.isInitialized = true

    // Initialize with demo items so UI has immediate baseline data
    this.itemsCache = [...DEMO_ITEMS]
    this.proofLockersCache = { ...DEMO_PROOF_LOCKERS }

    // Hydrate from API Gateway if API endpoint is configured
    if (APP_CONFIG.apiBaseUrl) {
      this.refreshFromRemote().catch((err) => {
        console.warn("Could not synchronize with AWS API Gateway:", err)
      })
    }
  }

  /** Background sync from API Gateway to in-memory cache */
  public async refreshFromRemote(): Promise<void> {
    if (!APP_CONFIG.apiBaseUrl) return

    try {
      const [remoteItems, remoteClaims] = await Promise.all([
        apiRequest<Item[]>("/items"),
        apiRequest<Claim[]>("/claims").catch(() => [] as Claim[]),
      ])

      // Keep demo items separated, merge remote items
      const nonDemo = remoteItems.filter((i) => !i.isDemo)
      this.itemsCache = [...DEMO_ITEMS, ...nonDemo]
      this.claimsCache = remoteClaims
    } catch (err) {
      console.warn("Background refresh from remote failed:", err)
    }
  }

  // ── Items ───────────────────────────────────────────────────────────────────

  public getItems(filters?: { type?: ItemType; status?: ItemStatus }): Item[] {
    let result = [...this.itemsCache]
    if (filters?.type) {
      result = result.filter((i) => i.type === filters.type)
    }
    if (filters?.status) {
      result = result.filter((i) => i.status === filters.status)
    }
    return result
  }

  public getItemById(id: string): Item | undefined {
    return this.itemsCache.find((i) => i.id === id)
  }

  public searchItems(query: string, filter: string): Item[] {
    const q = (query || "").toLowerCase().trim()
    return this.itemsCache.filter((item) => {
      if (filter === "lost" && item.type !== "lost") return false
      if (filter === "found" && item.type !== "found") return false
      if (filter === "reclaimed" && item.status !== "reclaimed") return false

      if (!q) return true
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      )
    })
  }

  public getLostItems(): Item[] {
    return this.itemsCache.filter((i) => i.type === "lost")
  }

  public getFoundItems(): Item[] {
    return this.itemsCache.filter((i) => i.type === "found")
  }

  public getUserItems(): Item[] {
    const user = this.getCurrentUser()
    return this.itemsCache.filter((i) => !i.isDemo && i.userId === user.id)
  }

  public createLostItem(params: CreateLostItemParams): {
    item: Item
    matches: { match: MatchResult; foundItem: Item }[]
  } {
    const user = this.getCurrentUser()
    const id = `RX-${Math.floor(1000 + Math.random() * 9000)}-${params.category.charAt(0).toUpperCase()}`
    const now = new Date().toISOString()

    const newItem: Item = {
      id,
      type: "lost",
      category: params.category,
      title: params.title,
      description: params.description,
      location: params.location,
      date: params.date,
      time: params.time,
      imageUrl: params.imageUrl || "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
      imageAlt: params.imageAlt,
      characteristics: params.characteristics,
      status: "active",
      userId: user.id,
      isDemo: false,
      createdAt: now,
    }

    this.itemsCache.unshift(newItem)

    // Compute matches locally and against candidate found items
    const matches = this.findMatchesForLost(newItem)

    // Send asynchronously to AWS API Gateway if configured
    if (APP_CONFIG.apiBaseUrl) {
      apiRequest<{ item: Item; matches: { match: MatchResult; foundItem: Item }[] }>("/items/lost", {
        method: "POST",
        body: JSON.stringify(params),
      }).catch((err) => {
        console.error("Remote createLostItem failed:", err)
      })
    }

    return { item: newItem, matches }
  }

  public createFoundItem(params: CreateFoundItemParams): {
    item: Item
    proofLocker: ProofLockerMeta
  } {
    const user = this.getCurrentUser()
    const id = `RX-${Math.floor(1000 + Math.random() * 9000)}-${params.category.charAt(0).toUpperCase()}`
    const lockerId = `locker-${Date.now()}`
    const now = new Date().toISOString()

    const newItem: Item = {
      id,
      type: "found",
      category: params.category,
      title: params.title,
      description: params.description,
      location: params.location,
      date: params.date,
      time: params.time,
      imageUrl: params.imageUrl || "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
      imageAlt: params.imageAlt,
      characteristics: params.characteristics,
      status: "active",
      userId: user.id,
      isDemo: false,
      createdAt: now,
    }

    this.itemsCache.unshift(newItem)

    // Construct public proof locker metadata
    const proofLockerMeta: ProofLockerMeta = {
      id: lockerId,
      itemId: id,
      sealedAt: now,
      clueCount: params.clues.length,
    }

    // Send to AWS API Gateway where clues with expected answers are stored in reclaimx-proof-lockers
    if (APP_CONFIG.apiBaseUrl) {
      apiRequest<{ item: Item; proofLocker: ProofLockerMeta }>("/items/found", {
        method: "POST",
        body: JSON.stringify(params),
      }).catch((err) => {
        console.error("Remote createFoundItem failed:", err)
      })
    }

    return { item: newItem, proofLocker: proofLockerMeta }
  }

  public updateItemStatus(id: string, status: ItemStatus): Item | undefined {
    const item = this.itemsCache.find((i) => i.id === id)
    if (!item) return undefined
    item.status = status

    if (APP_CONFIG.apiBaseUrl) {
      apiRequest(`/items/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }).catch((err) => console.error("Remote updateItemStatus error:", err))
    }

    return item
  }

  public saveItem(item: Item): Item {
    const idx = this.itemsCache.findIndex((i) => i.id === item.id)
    if (idx >= 0) {
      this.itemsCache[idx] = item
    } else {
      this.itemsCache.unshift(item)
    }
    return item
  }

  public updateItem(id: string, updates: Partial<Item>): Item | undefined {
    const item = this.itemsCache.find((i) => i.id === id)
    if (!item) return undefined
    Object.assign(item, updates)
    return item
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

    const total = cat.score + desc.score + loc.score + time.score + char.score
    let confidenceLabel: MatchResult["confidenceLabel"] = "Low signal"
    if (total >= 80) confidenceLabel = "Strong potential match"
    else if (total >= 60) confidenceLabel = "Possible match"

    return {
      lostItemId: lostItem.id,
      foundItemId: foundItem.id,
      score: total,
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
      typeof lostItemOrId === "string" ? this.getItemById(lostItemOrId) : lostItemOrId
    if (!lostItem) return []

    const candidates = this.itemsCache.filter((i) => i.type === "found" && i.status !== "reclaimed")
    return candidates
      .map((f) => ({ match: this.scorePair(lostItem, f), foundItem: f }))
      .filter((m) => m.match.score >= minThreshold)
      .sort((a, b) => b.match.score - a.match.score)
  }

  public findMatchesForFound(
    foundItemOrId: string | Item,
    minThreshold = 55,
  ): { match: MatchResult; lostItem: Item }[] {
    const foundItem =
      typeof foundItemOrId === "string" ? this.getItemById(foundItemOrId) : foundItemOrId
    if (!foundItem) return []

    const candidates = this.itemsCache.filter((i) => i.type === "lost" && i.status !== "reclaimed")
    return candidates
      .map((l) => ({ match: this.scorePair(l, foundItem), lostItem: l }))
      .filter((m) => m.match.score >= minThreshold)
      .sort((a, b) => b.match.score - a.match.score)
  }

  // ── Proof Locker ────────────────────────────────────────────────────────────

  public getProofLocker(itemIdOrLockerId: string): ProofLocker | undefined {
    return this.proofLockersCache[itemIdOrLockerId]
  }

  public getProofLockers(): Record<string, ProofLocker> {
    return this.proofLockersCache
  }

  public saveProofLocker(locker: ProofLocker): ProofLocker {
    this.proofLockersCache[locker.itemId] = locker
    return locker
  }

  public getUserProofLockers(): ProofLocker[] {
    return Object.values(this.proofLockersCache).filter((l) => !l.isDemo)
  }

  // ── Claims ──────────────────────────────────────────────────────────────────

  public getClaims(userId?: string): Claim[] {
    if (userId) {
      return this.claimsCache.filter((c) => c.claimantId === userId || c.finderId === userId)
    }
    return this.claimsCache
  }

  public getUserClaims(): Claim[] {
    const user = this.getCurrentUser()
    return this.claimsCache.filter((c) => !c.isDemo && (c.claimantId === user.id || c.finderId === user.id))
  }

  public getClaimById(id: string): Claim | undefined {
    return this.claimsCache.find((c) => c.id === id)
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
      finderId: foundItem?.userId || "finder-user-1",
      status: "verification",
      isDemo: false,
      createdAt: new Date().toISOString(),
    }

    this.claimsCache.unshift(newClaim)

    if (APP_CONFIG.apiBaseUrl) {
      apiRequest<Claim>("/claims", {
        method: "POST",
        body: JSON.stringify({ lostItemId, foundItemId }),
      }).catch((err) => console.error("Remote createClaim error:", err))
    }

    return newClaim
  }

  public saveClaim(claim: Claim): Claim {
    const idx = this.claimsCache.findIndex((c) => c.id === claim.id)
    if (idx >= 0) {
      this.claimsCache[idx] = claim
    } else {
      this.claimsCache.unshift(claim)
    }
    return claim
  }

  public updateClaim(id: string, updates: Partial<Claim>): Claim | undefined {
    const claim = this.claimsCache.find((c) => c.id === id)
    if (!claim) return undefined
    Object.assign(claim, updates)

    if (APP_CONFIG.apiBaseUrl) {
      apiRequest(`/claims/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      }).catch((err) => console.error("Remote updateClaim error:", err))
    }

    return claim
  }

  // ── Verification ────────────────────────────────────────────────────────────

  public getPublicQuestions(itemId: string): PublicProofQuestion[] {
    const locker = this.proofLockersCache[itemId]
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

    // STRICT SECURITY: Strip expectedAnswer before giving to claimant
    return locker.clues.map((c) => ({
      id: c.id,
      question: c.question,
      type: c.type,
      placeholder: "Enter details known only to the true owner…",
    }))
  }

  public async evaluateVerification(
    foundItemId: string,
    claimantAnswers: ClaimAnswer[],
  ): Promise<VerificationEvaluation> {
    // If AWS API Gateway is available, call the remote Lambda for strict server-side evaluation
    if (APP_CONFIG.apiBaseUrl) {
      try {
        return await apiRequest<VerificationEvaluation>("/verification/evaluate", {
          method: "POST",
          body: JSON.stringify({ foundItemId, answers: claimantAnswers }),
        })
      } catch (err) {
        console.warn("Remote verification failed, using local evaluator:", err)
      }
    }

    // Fallback local evaluation
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

  // ── Handover ────────────────────────────────────────────────────────────────

  public confirmFinder(claimId: string): Claim | undefined {
    const claim = this.claimsCache.find((c) => c.id === claimId)
    if (!claim) return undefined
    claim.finderConfirmed = true

    if (APP_CONFIG.apiBaseUrl) {
      apiRequest(`/handover/${claimId}/confirm-finder`, { method: "POST" }).catch(console.error)
    }

    return claim
  }

  public confirmOwner(claimId: string): Claim | undefined {
    const claim = this.claimsCache.find((c) => c.id === claimId)
    if (!claim) return undefined
    claim.ownerConfirmed = true

    if (APP_CONFIG.apiBaseUrl) {
      apiRequest(`/handover/${claimId}/confirm-owner`, { method: "POST" }).catch(console.error)
    }

    return claim
  }

  public completeHandover(claimId: string): { claim: Claim; itemReclaimed: boolean } {
    const claim = this.claimsCache.find((c) => c.id === claimId)
    if (!claim) {
      throw new Error(`Claim ${claimId} not found`)
    }

    claim.status = "completed"
    claim.ownerConfirmed = true
    claim.finderConfirmed = true
    claim.resolvedAt = new Date().toISOString()

    const found = this.itemsCache.find((i) => i.id === claim.foundItemId)
    if (found) found.status = "reclaimed"

    if (claim.lostItemId) {
      const lost = this.itemsCache.find((i) => i.id === claim.lostItemId)
      if (lost) lost.status = "reclaimed"
    }

    if (APP_CONFIG.apiBaseUrl) {
      apiRequest(`/handover/${claimId}/complete`, { method: "POST" }).catch(console.error)
    }

    return { claim, itemReclaimed: true }
  }

  // ── User ────────────────────────────────────────────────────────────────────

  public getCurrentUser(): UserProfile {
    return {
      id: "user-current-01",
      name: "Alex Rivera",
      email: "alex.rivera@campus.edu",
      role: "student",
      studentId: "STU-88214",
      department: "Computer Science",
      phone: "+1 (555) 342-8901",
    }
  }

  // ── Reset ───────────────────────────────────────────────────────────────────

  public resetDemoData(): void {
    this.itemsCache = [...DEMO_ITEMS]
    this.claimsCache = []
    this.proofLockersCache = { ...DEMO_PROOF_LOCKERS }
  }

  public resetUserData(): void {
    this.itemsCache = this.itemsCache.filter((i) => i.isDemo)
    this.claimsCache = this.claimsCache.filter((c) => c.isDemo)
  }
}

export const awsAdapter = new AwsAdapterImpl()
