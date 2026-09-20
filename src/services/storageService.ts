/**
 * StorageService — facade over the active BackendAdapter.
 *
 * Preserves the exact same public API that every UI component
 * currently consumes.  Internally delegates to `adapter`.
 */

import type { Item } from "../types/items"
import type { ProofLocker } from "../types/proof"
import type { Claim } from "../types/claims"
import { adapter } from "./adapters"

class StorageService {
  constructor() {
    // adapter is already initialized by the time services are imported
  }

  public init() {
    adapter.init()
  }

  public resetDemoData() {
    adapter.resetDemoData()
  }

  public resetUserData() {
    adapter.resetUserData()
  }

  public getUserItems(): Item[] {
    return adapter.getUserItems()
  }

  public getUserClaims(): Claim[] {
    return adapter.getUserClaims()
  }

  public getUserProofLockers(): ProofLocker[] {
    return adapter.getUserProofLockers()
  }

  // ─── Items CRUD ─────────────────────────────────────────────────────────────

  public getItems(): Item[] {
    return adapter.getItems()
  }

  public getItemById(id: string): Item | undefined {
    return adapter.getItemById(id)
  }

  public getLost(): Item[] {
    return adapter.getLostItems()
  }

  public getFound(): Item[] {
    return adapter.getFoundItems()
  }

  public saveItem(item: Item): Item {
    return adapter.saveItem(item)
  }

  public updateItem(id: string, updates: Partial<Item>): Item | undefined {
    return adapter.updateItem(id, updates)
  }

  // ─── Proof Locker ───────────────────────────────────────────────────────────

  public getProofLocker(itemIdOrLockerId: string): ProofLocker | undefined {
    return adapter.getProofLocker(itemIdOrLockerId)
  }

  public getProofLockers(): Record<string, ProofLocker> {
    return adapter.getProofLockers()
  }

  public saveProofLocker(locker: ProofLocker): ProofLocker {
    return adapter.saveProofLocker(locker)
  }

  // ─── Claims CRUD ────────────────────────────────────────────────────────────

  public getClaims(userId?: string): Claim[] {
    return adapter.getClaims(userId)
  }

  public getClaimById(id: string): Claim | undefined {
    return adapter.getClaimById(id)
  }

  public saveClaim(claim: Claim): Claim {
    return adapter.saveClaim(claim)
  }

  public updateClaim(id: string, updates: Partial<Claim>): Claim | undefined {
    return adapter.updateClaim(id, updates)
  }

  public getCurrentUser() {
    return adapter.getCurrentUser()
  }
}

export const storageService = new StorageService()
