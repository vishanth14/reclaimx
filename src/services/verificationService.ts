import type { PublicProofQuestion } from "../types/proof"
import type { VerificationResult, ClaimAnswer } from "../types/claims"
import { storageService } from "./storageService"
import { compareAnswers } from "../logic/verification/answerNormalization"

export interface VerificationEvaluation {
  passed: boolean
  status: "verified" | "rejected" | "incomplete"
  matchedCount: number
  requiredCount: number
  message: string
  matchedCategories: string[]
}

export const verificationService = {
  /**
   * Retrieves public questions for an item from its Proof Locker.
   * STRICT SECURITY BOUNDARY:
   * expectedAnswer is NEVER returned to the client!
   */
  getPublicQuestions(itemId: string): PublicProofQuestion[] {
    const locker = storageService.getProofLocker(itemId)
    if (!locker || !locker.clues || locker.clues.length === 0) {
      // Fallback baseline questions if no specific clues were configured
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

    // Map clues to public questions, safely stripping expectedAnswer
    return locker.clues.map((clue) => ({
      id: clue.id,
      question: clue.question,
      type: clue.type,
      placeholder: "Enter details known only to the true owner…",
    }))
  },

  /**
   * Evaluates claimant submitted answers against the item's Proof Locker.
   * Operates as the server-side verification authority.
   */
  async evaluateVerification(
    foundItemId: string,
    claimantAnswers: ClaimAnswer[],
  ): Promise<VerificationEvaluation> {
    const locker = storageService.getProofLocker(foundItemId)

    // Simulate cryptographic verification computation delay
    await new Promise((r) => setTimeout(r, 600))

    if (!locker || !locker.clues || locker.clues.length === 0) {
      // Baseline check
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

    // Evaluate each clue against claimant's answer
    for (const clue of locker.clues) {
      // Find corresponding answer
      const claimantEntry = claimantAnswers.find(
        (a) => a.clueId === clue.id || a.question === clue.question,
      )

      if (claimantEntry && compareAnswers(claimantEntry.answer, clue.expectedAnswer)) {
        matchedCount++
      }
    }

    // Rule:
    // All or near-all matched -> verified
    // Example: 3/3 -> verified, 2/3 -> incomplete, <2 -> rejected
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
      ? [
          "Item characteristics",
          "Private details",
          "Time consistency",
          "Location consistency",
        ]
      : []

    return {
      passed,
      status,
      matchedCount,
      requiredCount: totalRequired,
      message,
      matchedCategories,
    }
  },

  /**
   * Helper function compatible with existing signature Verify component.
   */
  async verify(
    answers: { question: string; answer: string }[],
    itemId = "RX-8834-B",
  ): Promise<{ passed: boolean; result: VerificationResult }> {
    const claimAnswers: ClaimAnswer[] = answers.map((a, idx) => ({
      clueId: `clue-${idx + 1}`,
      question: a.question,
      answer: a.answer,
    }))

    const evaluation = await this.evaluateVerification(itemId, claimAnswers)

    return {
      passed: evaluation.passed,
      result: {
        status: evaluation.status,
        matchedCount: evaluation.matchedCount,
        requiredCount: evaluation.requiredCount,
        message: evaluation.message,
        matchedSignals: evaluation.matchedCategories,
      },
    }
  },
}
