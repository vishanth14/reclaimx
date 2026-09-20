import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import {
  docClient,
  TABLES,
  GetCommand,
  UpdateCommand,
} from "../../utils/dynamo"
import { successResponse, errorResponse } from "../../utils/response"

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod
  const path = event.path
  const claimId = event.pathParameters?.claimId

  if (!claimId) {
    return errorResponse("Claim ID required in path", 400)
  }

  try {
    // ── POST /handover/{claimId}/confirm-finder ───────────────────────────────
    if (method === "POST" && path.includes("/confirm-finder")) {
      const res = await docClient.send(
        new UpdateCommand({
          TableName: TABLES.CLAIMS,
          Key: { id: claimId },
          UpdateExpression: "SET finderConfirmed = :fc",
          ExpressionAttributeValues: { ":fc": true },
          ReturnValues: "ALL_NEW",
        }),
      )
      return successResponse(res.Attributes)
    }

    // ── POST /handover/{claimId}/confirm-owner ────────────────────────────────
    if (method === "POST" && path.includes("/confirm-owner")) {
      const res = await docClient.send(
        new UpdateCommand({
          TableName: TABLES.CLAIMS,
          Key: { id: claimId },
          UpdateExpression: "SET ownerConfirmed = :oc",
          ExpressionAttributeValues: { ":oc": true },
          ReturnValues: "ALL_NEW",
        }),
      )
      return successResponse(res.Attributes)
    }

    // ── POST /handover/{claimId}/complete ─────────────────────────────────────
    if (method === "POST" && path.includes("/complete")) {
      // 1. Fetch current claim
      const claimRes = await docClient.send(
        new GetCommand({
          TableName: TABLES.CLAIMS,
          Key: { id: claimId },
        }),
      )

      const claim = claimRes.Item
      if (!claim) {
        return errorResponse(`Claim ${claimId} not found`, 404)
      }

      const resolvedAt = new Date().toISOString()

      // 2. Mark claim completed
      const updatedClaimRes = await docClient.send(
        new UpdateCommand({
          TableName: TABLES.CLAIMS,
          Key: { id: claimId },
          UpdateExpression: "SET #st = :status, resolvedAt = :ra, ownerConfirmed = :oc, finderConfirmed = :fc",
          ExpressionAttributeNames: { "#st": "status" },
          ExpressionAttributeValues: {
            ":status": "completed",
            ":ra": resolvedAt,
            ":oc": true,
            ":fc": true,
          },
          ReturnValues: "ALL_NEW",
        }),
      )

      // 3. Mark found item as reclaimed
      if (claim.foundItemId) {
        await docClient.send(
          new UpdateCommand({
            TableName: TABLES.ITEMS,
            Key: { id: claim.foundItemId },
            UpdateExpression: "SET #st = :status",
            ExpressionAttributeNames: { "#st": "status" },
            ExpressionAttributeValues: { ":status": "reclaimed" },
          }),
        )
      }

      // 4. Mark lost item as reclaimed (if linked)
      if (claim.lostItemId) {
        await docClient.send(
          new UpdateCommand({
            TableName: TABLES.ITEMS,
            Key: { id: claim.lostItemId },
            UpdateExpression: "SET #st = :status",
            ExpressionAttributeNames: { "#st": "status" },
            ExpressionAttributeValues: { ":status": "reclaimed" },
          }),
        )
      }

      return successResponse({
        claim: updatedClaimRes.Attributes,
        itemReclaimed: true,
      })
    }

    return errorResponse(`Unsupported handover route: ${method} ${path}`, 404)
  } catch (err: unknown) {
    console.error("Handover handler error:", err)
    return errorResponse(err instanceof Error ? err.message : "Internal server error", 500)
  }
}
