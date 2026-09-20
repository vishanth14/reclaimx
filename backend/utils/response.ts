export interface ApiResponse {
  statusCode: number
  headers: Record<string, string>
  body: string
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,PATCH,DELETE",
  "Content-Type": "application/json",
}

export function successResponse(data: unknown, statusCode = 200): ApiResponse {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(data),
  }
}

export function errorResponse(message: string, statusCode = 500, details?: unknown): ApiResponse {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      error: message,
      details,
      timestamp: new Date().toISOString(),
    }),
  }
}
