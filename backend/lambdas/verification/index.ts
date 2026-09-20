import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import {
  docClient,
  TABLES,
  GetCommand,
  UpdateCommand,
} from "../../utils/dynamo"
import { successResponse, errorResponse } from "../../utils/response"
import { compareAnswers } from "../../logic/verification"

interface Clue {
  id: string
  question: string
  type: string
  expectedAnswer: string
}

interface ProofLockerRecord {
  itemId: string
  id: string
  clues: Clue[]
  sealedAt: string
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod
  const path = event.path

  try {
    // ── GET /verification/questions/{itemId} ─────────────────────────────────
    if (method === "GET" && path.includes("/questions/")) {
      const itemId = event.pathParameters?.itemId
      if (!itemId) return errorResponse("Item ID is required", 400)

      const lockerRes = await docClient.send(
        new GetCommand({
          TableName: TABLES.PROOF_LOCKERS,
          Key: { itemId },
        }),
      )

      const locker = lockerRes.Item as ProofLockerRecord | undefined

      if (!locker || !locker.clues || locker.clues.length === 0) {
        // Fallback baseline questions if no specific locker clues configured
        return successResponse([
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
        ])
      }

      // STRICT SECURITY BOUNDARY: Strip expectedAnswer before sending to claimant!
      const publicQuestions = locker.clues.map((c) => ({
        id: c.id,
        question: c.question,
        type: c.type || "text",
        placeholder: "Enter details known only to the true owner…",
      }))

      return successResponse(publicQuestions)
    }

    // ── POST /verification/evaluate ──────────────────────────────────────────
    if (method === "POST" && path.endsWith("/evaluate")) {
      const body = JSON.parse(event.body || "{}")
      const { claimId, foundItemId, answers } = body

      if (!foundItemId || !Array.isArray(answers)) {
        return errorResponse("foundItemId and answers array required", 400)
      }

      // Fetch private locker strictly on the server
      const lockerRes = await docClient.send(
        new GetCommand({
          TableName: TABLES.PROOF_LOCKERS,
          Key: { itemId: foundItemId },
        }),
      )

      const locker = lockerRes.Item as ProofLockerRecord | undefined

      let matchedCount = 0
      let totalRequired = 3

      if (locker && locker.clues && locker.clues.length > 0) {
        totalRequired = locker.clues.length
        for (const clue of locker.clues) {
          const claimantEntry = answers.find(
            (a: { clueId?: string; question?: string; answer?: string }) =>
              a.clueId === clue.id || a.question === clue.question,
          )

          if (claimantEntry && compareAnswers(claimantEntry.answer || "", clue.expectedAnswer)) {
            matchedCount++
          }
        }
      } else {
        // Fallback evaluation for default questions
        matchedCount = answers.filter(
          (a: { answer?: string }) => (a.answer || "").trim().length >= 3,
        ).length
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

      const evaluation = {
        passed,
        status,
        matchedCount,
        requiredCount: totalRequired,
        message,
        matchedCategories,
      }

      // If claimId provided, update claim status and generate handover code
      if (claimId) {
        const handoverCode = passed
          ? `RX-${Math.floor(10 + Math.random() * 90)}${Math.floor(10 + Math.random() * 90)}`
          : null

        const handoverExpiresAt = passed
          ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          : null

        const newClaimStatus = passed ? "handover_ready" : "rejected"

        await docClient.send(
          new UpdateCommand({
            TableName: TABLES.CLAIMS,
            Key: { id: claimId },
            UpdateExpression:
              "SET #st = :status, answers = :answers, verificationResult = :vr, handoverCode = :hc, handoverExpiresAt = :hea",
            ExpressionAttributeNames: { "#st": "status" },
            ExpressionAttributeValues: {
              ":status": newClaimStatus,
              ":answers": answers,
              ":vr": {
                status,
                matchedCount,
                requiredCount: totalRequired,
                message,
                matchedSignals: matchedCategories,
              },
              ":hc": handoverCode,
              ":hea": handoverExpiresAt,
            },
          }),
        )
      }

      return successResponse(evaluation)
    }

    return errorResponse(`Unsupported verification route: ${method} ${path}`, 404)
  } catch (err: unknown) {
    console.error("Verification handler error:", err)
    return errorResponse(err instanceof Error ? err.message : "Internal server error", 500)
  }
}
