import { useState, useEffect, useCallback } from "react"
import type { Item } from "../types/items"
import { itemsService } from "../services/itemsService"
import { storageService } from "../services/storageService"

export function useItems(filter: string = "All", searchQuery: string = "") {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    const list = itemsService.search(searchQuery, filter)
    setItems(list)
    setLoading(false)
  }, [filter, searchQuery])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { items, loading, refresh, totalCount: storageService.getItems().length }
}
