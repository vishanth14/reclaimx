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
import { scorePair, BackendItem } from "../../logic/matching"

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod
  const path = event.path
  const sub = event.requestContext?.authorizer?.claims?.sub || event.requestContext?.authorizer?.jwt?.claims?.sub || "anonymous"

  try {
    // ── GET /items or GET /items/{id} ───────────────────────────────────────
    if (method === "GET") {
      const id = event.pathParameters?.id
      if (id) {
        const res = await docClient.send(
          new GetCommand({
            TableName: TABLES.ITEMS,
            Key: { id },
          }),
        )
        if (!res.Item) {
          return errorResponse(`Item with ID ${id} not found`, 404)
        }
        return successResponse(res.Item)
      }

      // Query or scan all items
      const queryParams = event.queryStringParameters || {}
      const itemType = queryParams.type
      const status = queryParams.status
      const userOnly = queryParams.userOnly === "true"

      let items: BackendItem[] = []

      if (userOnly) {
        const res = await docClient.send(
          new QueryCommand({
            TableName: TABLES.ITEMS,
            IndexName: "byUser",
            KeyConditionExpression: "userId = :uid",
            ExpressionAttributeValues: { ":uid": sub },
          }),
        )
        items = (res.Items as BackendItem[]) || []
      } else if (itemType) {
        const res = await docClient.send(
          new QueryCommand({
            TableName: TABLES.ITEMS,
            IndexName: "byTypeStatus",
            KeyConditionExpression: "#t = :type",
            ExpressionAttributeNames: { "#t": "type" },
            ExpressionAttributeValues: { ":type": itemType },
          }),
        )
        items = (res.Items as BackendItem[]) || []
      } else {
        const res = await docClient.send(
          new ScanCommand({
            TableName: TABLES.ITEMS,
          }),
        )
        items = (res.Items as BackendItem[]) || []
      }

      if (status) {
        items = items.filter((i) => i.status === status)
      }

      return successResponse(items)
    }

    // ── POST /items/lost ───────────────────────────────────────────────────
    if (method === "POST" && path.endsWith("/lost")) {
      const body = JSON.parse(event.body || "{}")
      const itemId = `RX-${Math.floor(1000 + Math.random() * 9000)}-${body.category ? body.category.charAt(0).toUpperCase() : "X"}`
      const now = new Date().toISOString()

      const newItem: BackendItem = {
        id: itemId,
        type: "lost",
        category: body.category,
        title: body.title,
        description: body.description,
        location: body.location,
        date: body.date,
        time: body.time,
        imageUrl: body.imageUrl,
        characteristics: body.characteristics || {},
        status: "active",
        userId: sub,
        isDemo: false,
        createdAt: now,
      }

      await docClient.send(
        new PutCommand({
          TableName: TABLES.ITEMS,
          Item: newItem,
        }),
      )

      // Find potential matches against existing found items
      const foundItemsRes = await docClient.send(
        new QueryCommand({
          TableName: TABLES.ITEMS,
          IndexName: "byTypeStatus",
          KeyConditionExpression: "#t = :type",
          ExpressionAttributeNames: { "#t": "type" },
          ExpressionAttributeValues: { ":type": "found" },
        }),
      )

      const candidateFound = (foundItemsRes.Items as BackendItem[]) || []
      const matches = candidateFound
        .filter((f) => f.status !== "reclaimed")
        .map((f) => ({ match: scorePair(newItem, f), foundItem: f }))
        .filter((m) => m.match.score >= 55)
        .sort((a, b) => b.match.score - a.match.score)

      return successResponse({ item: newItem, matches }, 201)
    }

    // ── POST /items/found ──────────────────────────────────────────────────
    if (method === "POST" && path.endsWith("/found")) {
      const body = JSON.parse(event.body || "{}")
      const itemId = `RX-${Math.floor(1000 + Math.random() * 9000)}-${body.category ? body.category.charAt(0).toUpperCase() : "X"}`
      const lockerId = `locker-${Date.now()}`
      const now = new Date().toISOString()

      const newItem: BackendItem = {
        id: itemId,
        type: "found",
        category: body.category,
        title: body.title,
        description: body.description,
        location: body.location,
        date: body.date,
        time: body.time,
        imageUrl: body.imageUrl,
        characteristics: body.characteristics || {},
        status: "active",
        userId: sub,
        isDemo: false,
        createdAt: now,
      }

      // Save item in reclaimx-items
      await docClient.send(
        new PutCommand({
          TableName: TABLES.ITEMS,
          Item: newItem,
        }),
      )

      // STRICT SECURITY BOUNDARY: Store clues with expected answers in reclaimx-proof-lockers
      const clues = (body.clues || []).map((c: { question?: string; text: string }, idx: number) => ({
        id: `clue-${idx + 1}`,
        question: c.question || `Verification Question ${idx + 1}`,
        type: "text",
        expectedAnswer: c.text,
      }))

      await docClient.send(
        new PutCommand({
          TableName: TABLES.PROOF_LOCKERS,
          Item: {
            itemId,
            id: lockerId,
            clues,
            sealedAt: now,
            createdBy: sub,
          },
        }),
      )

      // Return ONLY public proof locker metadata (never the clues with expectedAnswer!)
      return successResponse(
        {
          item: newItem,
          proofLocker: {
            id: lockerId,
            itemId,
            sealedAt: now,
            clueCount: clues.length,
          },
        },
        201,
      )
    }

    // ── PATCH /items/{id}/status ───────────────────────────────────────────
    if (method === "PATCH" && path.includes("/status")) {
      const id = event.pathParameters?.id
      if (!id) return errorResponse("Item ID required", 400)
      const body = JSON.parse(event.body || "{}")

      const res = await docClient.send(
        new UpdateCommand({
          TableName: TABLES.ITEMS,
          Key: { id },
          UpdateExpression: "SET #st = :status",
          ExpressionAttributeNames: { "#st": "status" },
          ExpressionAttributeValues: { ":status": body.status },
          ReturnValues: "ALL_NEW",
        }),
      )

      return successResponse(res.Attributes)
    }

    return errorResponse(`Unsupported route: ${method} ${path}`, 404)
  } catch (err: unknown) {
    console.error("Items handler error:", err)
    return errorResponse(err instanceof Error ? err.message : "Internal server error", 500)
  }
}
