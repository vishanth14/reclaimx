export type ItemType = "lost" | "found"
export type ItemStatus = "active" | "potential_match" | "claim_in_progress" | "reclaimed"

export interface Item {
  id: string
  type: ItemType
  category: string
  title: string
  description: string
  location: string
  latitude?: number
  longitude?: number
  date: string
  time: string
  image?: string
  imageUrl?: string
  imageAlt?: string
  imageSource?: string
  imageLicense?: string
  status: ItemStatus
  createdAt: string
  userId: string
  isDemo?: boolean
  proofLockerId?: string
  matchIds?: string[]
  characteristics?: {
    color?: string
    brand?: string
    marks?: string
    accessories?: string
    contents?: string
    material?: string
  }
}
