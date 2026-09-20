/**
 * Adapter resolver — returns the active BackendAdapter based on VITE_BACKEND.
 *
 * Default: 'local' (localStorage + in-memory, current behavior)
 * Future:  'aws'   (API Gateway + Cognito + DynamoDB)
 */

import { APP_CONFIG } from "../../config"
import type { BackendAdapter } from "./types"
import { localAdapter } from "./localAdapter"
import { awsAdapter } from "./awsAdapter"

export function getAdapter(): BackendAdapter {
  if (APP_CONFIG.backend === "aws") {
    return awsAdapter
  }
  return localAdapter
}

/** Singleton adapter instance used by all services */
export const adapter: BackendAdapter = getAdapter()

// Re-export types for convenience
export type { BackendAdapter } from "./types"
export type {
  CreateLostItemParams,
  CreateFoundItemParams,
  UploadUrlResult,
  ProofLockerMeta,
  VerificationEvaluation,
  DashboardStats,
  UserProfile,
} from "./types"
