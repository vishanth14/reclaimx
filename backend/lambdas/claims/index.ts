import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import {
  docClient,
  TABLES,
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  ScanCommand,
} from "../../utils/dynamo"
import { successResponse, errorResponse } from "../../utils/response"

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod
  const sub = event.requestContext?.authorizer?.claims?.sub || event.requestContext?.authorizer?.jwt?.claims?.sub || "anonymous"

  try {
    // ── GET /claims or GET /claims/{id} ─────────────────────────────────────
    if (method === "GET") {
      const id = event.pathParameters?.id
      if (id) {
        const res = await docClient.send(
          new GetCommand({
            TableName: TABLES.CLAIMS,
            Key: { id },
          }),
        )
        if (!res.Item) {
          return errorResponse(`Claim ${id} not found`, 404)
        }
        return successResponse(res.Item)
      }

      // Query by claimant or scan
      const queryParams = event.queryStringParameters || {}
      const claimantId = queryParams.claimantId || (queryParams.userOnly === "true" ? sub : undefined)

      if (claimantId) {
        const res = await docClient.send(
          new QueryCommand({
            TableName: TABLES.CLAIMS,
            IndexName: "byClaimant",
            KeyConditionExpression: "claimantId = :cid",
            ExpressionAttributeValues: { ":cid": claimantId },
          }),
        )
        return successResponse(res.Items || [])
      }

      const res = await docClient.send(
        new ScanCommand({
          TableName: TABLES.CLAIMS,
        }),
      )
      return successResponse(res.Items || [])
    }

    // ── POST /claims ─────────────────────────────────────────────────────────
    if (method === "POST") {
      const body = JSON.parse(event.body || "{}")
      const { lostItemId, foundItemId } = body

      if (!foundItemId) {
        return errorResponse("foundItemId is required", 400)
      }

      // Lookup found item to attach finderId
      const itemRes = await docClient.send(
        new GetCommand({
          TableName: TABLES.ITEMS,
          Key: { id: foundItemId },
        }),
      )

      const foundItem = itemRes.Item
      const finderId = foundItem?.userId || "finder-user-1"
      const claimId = `claim-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      const now = new Date().toISOString()

      const newClaim = {
        id: claimId,
        lostItemId: lostItemId || null,
        foundItemId,
        claimantId: sub,
        finderId,
        status: "verification",
        isDemo: false,
        createdAt: now,
      }

      await docClient.send(
        new PutCommand({
          TableName: TABLES.CLAIMS,
          Item: newClaim,
        }),
      )

      return successResponse(newClaim, 201)
    }

    // ── PATCH /claims/{id} ───────────────────────────────────────────────────
    if (method === "PATCH") {
      const id = event.pathParameters?.id
      if (!id) return errorResponse("Claim ID required", 400)
      const body = JSON.parse(event.body || "{}")

      const updates = Object.keys(body)
      if (updates.length === 0) {
        return errorResponse("No fields to update", 400)
      }

      const updateExpressionParts: string[] = []
      const expressionAttributeNames: Record<string, string> = {}
      const expressionAttributeValues: Record<string, unknown> = {}

      updates.forEach((key, index) => {
        const attrName = `#attr${index}`
        const attrVal = `:val${index}`
        updateExpressionParts.push(`${attrName} = ${attrVal}`)
        expressionAttributeNames[attrName] = key
        expressionAttributeValues[attrVal] = body[key]
      })

      const res = await docClient.send(
        new UpdateCommand({
          TableName: TABLES.CLAIMS,
          Key: { id },
          UpdateExpression: `SET ${updateExpressionParts.join(", ")}`,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: "ALL_NEW",
        }),
      )

      return successResponse(res.Attributes)
    }

    return errorResponse(`Unsupported method: ${method}`, 405)
  } catch (err: unknown) {
    console.error("Claims handler error:", err)
    return errorResponse(err instanceof Error ? err.message : "Internal server error", 500)
  }
}
