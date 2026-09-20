import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb"

const region = process.env.AWS_REGION || "ap-south-1"

const client = new DynamoDBClient({ region })

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
})

export const TABLES = {
  ITEMS: process.env.ITEMS_TABLE || "reclaimx-items",
  PROOF_LOCKERS: process.env.PROOF_LOCKERS_TABLE || "reclaimx-proof-lockers",
  CLAIMS: process.env.CLAIMS_TABLE || "reclaimx-claims",
  MATCHES: process.env.MATCHES_TABLE || "reclaimx-matches",
}

export {
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
}
