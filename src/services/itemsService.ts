/**
 * ItemsService — high-level item operations.
 * Delegates to the active BackendAdapter via storageService + adapter.
 */

import type { Item, ItemStatus } from "../types/items"
import { adapter } from "./adapters"
import { storageService } from "./storageService"

export const itemsService = {
  getAll: (): Item[] => adapter.getItems(),

  getById: (id: string): Item | undefined => adapter.getItemById(id),

  getLost: (): Item[] => adapter.getLostItems(),

  getFound: (): Item[] => adapter.getFoundItems(),

  createLostItem: (params: {
    category: string
    title: string
    description: string
    location: string
    date: string
    time: string
    imageUrl?: string
    imageAlt?: string
    characteristics?: Record<string, string>
  }) => adapter.createLostItem(params),

  createFoundItem: (params: {
    category: string
    title: string
    description: string
    location: string
    date: string
    time: string
    imageUrl?: string
    imageAlt?: string
    clues: { question?: string; text: string }[]
    characteristics?: Record<string, string>
  }) => adapter.createFoundItem(params),

  updateStatus: (id: string, status: ItemStatus): Item | undefined => {
    return adapter.updateItemStatus(id, status)
  },

  search: (query: string, filter: string): Item[] => {
    return adapter.searchItems(query, filter)
  },
}
