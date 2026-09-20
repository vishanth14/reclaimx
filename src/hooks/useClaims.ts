import { useState, useEffect, useCallback } from "react"
import type { Claim } from "../types/claims"
import { claimsService } from "../services/claimsService"
import { storageService } from "../services/storageService"

export function useClaims() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    const user = storageService.getCurrentUser()
    const list = claimsService.getClaims(user.id)
    setClaims(list)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { claims, loading, refresh }
}
