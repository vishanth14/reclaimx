import type { Claim } from "../types/claims"
import { storageService } from "./storageService"

export const handoverService = {
  getClaim(claimId: string): Claim | undefined {
    return storageService.getClaimById(claimId)
  },

  confirmFinder(claimId: string): Claim | undefined {
    const claim = storageService.getClaimById(claimId)
    if (!claim) return undefined

    const updated = storageService.updateClaim(claimId, {
      finderConfirmed: true,
    })
    return updated
  },

  confirmOwner(claimId: string): Claim | undefined {
    const claim = storageService.getClaimById(claimId)
    if (!claim) return undefined

    const updated = storageService.updateClaim(claimId, {
      ownerConfirmed: true,
    })
    return updated
  },

  completeHandover(claimId: string): { claim: Claim; itemReclaimed: boolean } {
    const claim = storageService.getClaimById(claimId)
    if (!claim) {
      throw new Error("Claim not found")
    }

    const resolvedAt = new Date().toISOString()

    // 1. Update claim status to completed
    const updatedClaim = storageService.updateClaim(claimId, {
      status: "completed",
      ownerConfirmed: true,
      finderConfirmed: true,
      resolvedAt,
    })!

    // 2. Mark found and lost items as reclaimed
    storageService.updateItem(claim.foundItemId, { status: "reclaimed" })
    if (claim.lostItemId) {
      storageService.updateItem(claim.lostItemId, { status: "reclaimed" })
    }

    return { claim: updatedClaim, itemReclaimed: true }
  },
}
