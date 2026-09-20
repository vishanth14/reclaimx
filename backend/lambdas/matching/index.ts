import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import {
  docClient,
  TABLES,
  GetCommand,
  QueryCommand,
  ScanCommand,
} from "../../utils/dynamo"
import { successResponse, errorResponse } from "../../utils/response"
import { scorePair, BackendItem } from "../../logic/matching"

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod
  const path = event.path

  try {
    // ── POST /matching/score-pair ───────────────────────────────────────────
    if (method === "POST" && path.endsWith("/score-pair")) {
      const body = JSON.parse(event.body || "{}")
      const { lostItem, foundItem } = body
      if (!lostItem || !foundItem) {
        return errorResponse("lostItem and foundItem objects required", 400)
      }
      const result = scorePair(lostItem, foundItem)
      return successResponse(result)
    }

    // ── GET /matching/lost/{itemId} ─────────────────────────────────────────
    if (method === "GET" && path.includes("/matching/lost/")) {
      const itemId = event.pathParameters?.itemId
      if (!itemId) return errorResponse("Item ID required", 400)

      const lostRes = await docClient.send(
        new GetCommand({
          TableName: TABLES.ITEMS,
          Key: { id: itemId },
        }),
      )
      const lostItem = lostRes.Item as BackendItem | undefined
      if (!lostItem) return errorResponse(`Item ${itemId} not found`, 404)

      // Query candidate found items
      const foundRes = await docClient.send(
        new QueryCommand({
          TableName: TABLES.ITEMS,
          IndexName: "byTypeStatus",
          KeyConditionExpression: "#t = :type",
          ExpressionAttributeNames: { "#t": "type" },
          ExpressionAttributeValues: { ":type": "found" },
        }),
      )

      const candidates = (foundRes.Items as BackendItem[]) || []
      const results = candidates
        .filter((f) => f.status !== "reclaimed")
        .map((f) => ({ match: scorePair(lostItem, f), foundItem: f }))
        .filter((r) => r.match.score >= 55)
        .sort((a, b) => b.match.score - a.match.score)

      return successResponse(results)
    }

    // ── GET /matching/found/{itemId} ────────────────────────────────────────
    if (method === "GET" && path.includes("/matching/found/")) {
      const itemId = event.pathParameters?.itemId
      if (!itemId) return errorResponse("Item ID required", 400)

      const foundRes = await docClient.send(
        new GetCommand({
          TableName: TABLES.ITEMS,
          Key: { id: itemId },
        }),
      )
      const foundItem = foundRes.Item as BackendItem | undefined
      if (!foundItem) return errorResponse(`Item ${itemId} not found`, 404)

      // Query candidate lost items
      const lostRes = await docClient.send(
        new QueryCommand({
          TableName: TABLES.ITEMS,
          IndexName: "byTypeStatus",
          KeyConditionExpression: "#t = :type",
          ExpressionAttributeNames: { "#t": "type" },
          ExpressionAttributeValues: { ":type": "lost" },
        }),
      )

      const candidates = (lostRes.Items as BackendItem[]) || []
      const results = candidates
        .filter((l) => l.status !== "reclaimed")
        .map((l) => ({ match: scorePair(l, foundItem), lostItem: l }))
        .filter((r) => r.match.score >= 55)
        .sort((a, b) => b.match.score - a.match.score)

      return successResponse(results)
    }

    return errorResponse(`Unsupported matching route: ${method} ${path}`, 404)
  } catch (err: unknown) {
    console.error("Matching handler error:", err)
    return errorResponse(err instanceof Error ? err.message : "Internal server error", 500)
  }
}
