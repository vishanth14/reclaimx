import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { successResponse, errorResponse } from "../../utils/response"

const region = process.env.AWS_REGION || "ap-south-1"
const bucketName = process.env.MEDIA_BUCKET || "reclaimx-media-assets"
const s3Client = new S3Client({ region })

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod
  const path = event.path

  try {
    // ── GET /uploads/download-url?key=items/... ──────────────────────────────
    if (method === "GET") {
      const key = event.queryStringParameters?.key
      if (!key) {
        return errorResponse("S3 object key is required as query parameter (?key=...)", 400)
      }

      // Security: Only allow retrieving keys within items/ prefix
      if (!key.startsWith("items/")) {
        return errorResponse("Access denied: only items/ objects may be retrieved", 403)
      }

      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      })

      // Generate presigned GET URL valid for 2 hours (7200 seconds)
      const downloadUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 7200 })

      return successResponse({
        imageKey: key,
        downloadUrl,
      })
    }

    // ── POST /uploads/presigned-url ──────────────────────────────────────────
    if (method === "POST") {
      const body = JSON.parse(event.body || "{}")
      const { contentType = "image/webp", filename = "item.webp" } = body

      const extension = filename.split(".").pop() || "webp"
      const imageKey = `items/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`

      // 1. Presigned PUT for secure private upload directly to S3
      const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: imageKey,
        ContentType: contentType,
      })
      const uploadUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: 900 })

      // 2. Presigned GET for initial display (private bucket access)
      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: imageKey,
      })
      const downloadUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 86400 })

      return successResponse({
        uploadUrl,
        imageKey,
        downloadUrl,
      })
    }

    return errorResponse(`Method ${method} not allowed on ${path}`, 405)
  } catch (err: unknown) {
    console.error("Upload handler error:", err)
    return errorResponse(err instanceof Error ? err.message : "Internal server error", 500)
  }
}
