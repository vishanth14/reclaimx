import type { Claim, ClaimStatus, ClaimAnswer, VerificationResult } from "../types/claims"
import { storageService } from "./storageService"
import { verificationService } from "./verificationService"

export const claimsService = {
  getClaims: (userId?: string): Claim[] => storageService.getClaims(userId),

  getClaimById: (id: string): Claim | undefined => storageService.getClaimById(id),

  createClaim: (lostItemId: string, foundItemId: string): Claim => {
    const user = storageService.getCurrentUser()
    const foundItem = storageService.getItemById(foundItemId)

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

    storageService.saveClaim(newClaim)
    return newClaim
  },

  submitVerification: async (
    claimId: string,
    answers: ClaimAnswer[],
  ): Promise<{ claim: Claim; evaluation: ReturnType<typeof verificationService.evaluateVerification> extends Promise<infer U> ? U : never }> => {
    const claim = storageService.getClaimById(claimId)
    if (!claim) {
      throw new Error(`Claim ${claimId} not found`)
    }

    const evaluation = await verificationService.evaluateVerification(
      claim.foundItemId,
      answers,
    )

    const newStatus: ClaimStatus = evaluation.passed ? "handover_ready" : "rejected"

    // Generate handover code if passed
    const handoverCode = evaluation.passed
      ? `RX-${Math.floor(10 + Math.random() * 90)}${Math.floor(10 + Math.random() * 90)}`
      : undefined

    const updatedClaim: Claim = {
      ...claim,
      status: newStatus,
      answers,
      verificationResult: {
        status: evaluation.status,
        matchedCount: evaluation.matchedCount,
        requiredCount: evaluation.requiredCount,
        message: evaluation.message,
        matchedSignals: evaluation.matchedCategories,
      },
      handoverCode,
      handoverExpiresAt: evaluation.passed
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        : undefined,
    }

    storageService.saveClaim(updatedClaim)
    return { claim: updatedClaim, evaluation }
  },

  updateClaimStatus: (claimId: string, status: ClaimStatus): Claim | undefined => {
    return storageService.updateClaim(claimId, { status })
  },
}
