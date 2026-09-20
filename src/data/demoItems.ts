import type { Item } from "../types/items"
import type { ProofLocker } from "../types/proof"
import type { Claim } from "../types/claims"

export interface DemoItem extends Item {
  reportedAt: string
  privateProof?: string[]
}

/**
 * EXACT 10 INITIAL DEMO ITEMS
 * 5 Lost, 5 Found
 * Matches:
 *  - Black Canvas Backpack (found) <-> Black Backpack (lost)
 *  - Wireless Earbuds Case (found) <-> Wireless Earbuds (lost)
 */
export const DEMO_ITEMS: Item[] = [
  // ─────────────────────────────────────────────────────────────
  // ITEM 01 — FOUND
  // ─────────────────────────────────────────────────────────────
  {
    id: "RX-8834-B",
    title: "Black Canvas Backpack",
    type: "found",
    category: "Backpack",
    location: "Central Library",
    latitude: 37.4275,
    longitude: -122.1697,
    date: "Sep 20, 2026",
    time: "6:15 PM",
    description: "Black canvas backpack found beside a library study chair.",
    status: "potential_match",
    imageUrl: "/images/items/black-canvas-backpack.webp",
    imageAlt: "Realistic photograph of a black canvas college backpack in a university library",
    isDemo: true,
    userId: "user-demo-finder-01",
    createdAt: "2026-09-20T18:15:00Z",
    proofLockerId: "locker-rx-8834-b",
    matchIds: ["RX-LOST-101"],
    characteristics: {
      color: "Black",
      material: "Canvas",
      marks: "Worn right shoulder strap, front zip pocket",
      accessories: "Front zip pocket",
    },
  },

  // ─────────────────────────────────────────────────────────────
  // ITEM 02 — LOST
  // ─────────────────────────────────────────────────────────────
  {
    id: "RX-LOST-101",
    title: "Black Backpack",
    type: "lost",
    category: "Backpack",
    location: "Central Library",
    latitude: 37.4275,
    longitude: -122.1697,
    date: "Sep 20, 2026",
    time: "6:00 PM",
    description: "Black backpack reported missing from the library seating area.",
    status: "potential_match",
    imageUrl: "/images/items/black-backpack.webp",
    imageAlt: "Realistic photograph of a similar black canvas backpack in a university library",
    isDemo: true,
    userId: "user-demo-owner-01",
    createdAt: "2026-09-20T18:00:00Z",
    matchIds: ["RX-8834-B"],
    characteristics: {
      color: "Black",
      material: "Canvas",
      marks: "Worn right strap, front zip pocket",
      accessories: "Front zip pocket",
    },
  },

  // ─────────────────────────────────────────────────────────────
  // ITEM 03 — FOUND
  // ─────────────────────────────────────────────────────────────
  {
    id: "RX-FOUND-202",
    title: "Wireless Earbuds Case",
    type: "found",
    category: "Electronics",
    location: "Cafeteria",
    latitude: 37.4250,
    longitude: -122.1702,
    date: "Sep 20, 2026",
    time: "1:35 PM",
    description: "Black wireless earbuds case found near a cafeteria table.",
    status: "potential_match",
    imageUrl: "/images/items/wireless-earbuds-case.webp",
    imageAlt: "Realistic photograph of a black wireless earbuds case on a campus cafeteria table",
    isDemo: true,
    userId: "user-demo-finder-02",
    createdAt: "2026-09-20T13:35:00Z",
    proofLockerId: "locker-rx-found-202",
    matchIds: ["RX-LOST-102"],
    characteristics: {
      color: "Matte black",
      marks: "Tiny scratch on lid, rectangular case",
      accessories: "Rectangular case",
    },
  },

  // ─────────────────────────────────────────────────────────────
  // ITEM 04 — LOST
  // ─────────────────────────────────────────────────────────────
  {
    id: "RX-LOST-102",
    title: "Wireless Earbuds",
    type: "lost",
    category: "Electronics",
    location: "Cafeteria",
    latitude: 37.4250,
    longitude: -122.1702,
    date: "Sep 20, 2026",
    time: "1:20 PM",
    description: "Black wireless earbuds reported missing around the cafeteria seating area.",
    status: "potential_match",
    imageUrl: "/images/items/wireless-earbuds.webp",
    imageAlt: "Realistic photograph of black wireless earbuds/case on a cafeteria table",
    isDemo: true,
    userId: "user-demo-owner-02",
    createdAt: "2026-09-20T13:20:00Z",
    matchIds: ["RX-FOUND-202"],
    characteristics: {
      color: "Black",
      marks: "Minor surface scratch, compact case",
      accessories: "Compact case",
    },
  },

  // ─────────────────────────────────────────────────────────────
  // ITEM 05 — FOUND
  // ─────────────────────────────────────────────────────────────
  {
    id: "RX-FOUND-203",
    title: "Scientific Calculator",
    type: "found",
    category: "Electronics",
    location: "Academic Block",
    latitude: 37.4285,
    longitude: -122.1740,
    date: "Sep 20, 2026",
    time: "10:45 AM",
    description: "Scientific calculator found on a classroom desk.",
    status: "active",
    imageUrl: "/images/items/scientific-calculator.webp",
    imageAlt: "Realistic scientific calculator on a university classroom desk",
    isDemo: true,
    userId: "user-demo-finder-03",
    createdAt: "2026-09-20T10:45:00Z",
    proofLockerId: "locker-rx-found-203",
    characteristics: {
      color: "Dark gray",
      marks: "Slightly worn buttons",
      accessories: "Scientific layout",
    },
  },

  // ─────────────────────────────────────────────────────────────
  // ITEM 06 — LOST
  // ─────────────────────────────────────────────────────────────
  {
    id: "RX-LOST-104",
    title: "Dark Gray Water Bottle",
    type: "lost",
    category: "Personal Item",
    location: "Sports Complex",
    latitude: 37.4310,
    longitude: -122.1620,
    date: "Sep 20, 2026",
    time: "4:30 PM",
    description: "Dark gray reusable metal bottle reported missing after a practice session.",
    status: "active",
    imageUrl: "/images/items/dark-gray-water-bottle.webp",
    imageAlt: "Realistic dark gray reusable bottle on a university sports-complex bench",
    isDemo: true,
    userId: "user-demo-owner-04",
    createdAt: "2026-09-20T16:30:00Z",
    characteristics: {
      color: "Dark gray",
      material: "Metal",
      marks: "Cylindrical with screw-top lid",
      accessories: "Screw-top lid",
    },
  },

  // ─────────────────────────────────────────────────────────────
  // ITEM 07 — FOUND
  // ─────────────────────────────────────────────────────────────
  {
    id: "RX-FOUND-204",
    title: "Three-Key Keyring",
    type: "found",
    category: "Keys",
    location: "Main Gate",
    latitude: 37.4340,
    longitude: -122.1700,
    date: "Sep 20, 2026",
    time: "8:10 AM",
    description: "Small set of metal keys found near the main gate.",
    status: "active",
    imageUrl: "/images/items/three-key-keyring.webp",
    imageAlt: "Realistic ordinary metal keys on a campus table",
    isDemo: true,
    userId: "user-demo-finder-04",
    createdAt: "2026-09-20T08:10:00Z",
    proofLockerId: "locker-rx-found-204",
    characteristics: {
      color: "Silver",
      material: "Metal",
      marks: "Three keys, black rubber tag",
      accessories: "Simple metal ring, black rubber tag",
    },
  },

  // ─────────────────────────────────────────────────────────────
  // ITEM 08 — LOST
  // ─────────────────────────────────────────────────────────────
  {
    id: "RX-LOST-105",
    title: "Blue Ruled Notebook",
    type: "lost",
    category: "Stationery",
    location: "Academic Block",
    latitude: 37.4285,
    longitude: -122.1740,
    date: "Sep 20, 2026",
    time: "11:30 AM",
    description: "Blue ruled notebook reported missing after a class.",
    status: "active",
    imageUrl: "/images/items/blue-notebook.webp",
    imageAlt: "Realistic blue notebook on a university classroom desk",
    isDemo: true,
    userId: "user-demo-owner-05",
    createdAt: "2026-09-20T11:30:00Z",
    characteristics: {
      color: "Blue",
      material: "Paper",
      marks: "Ruled pages, medium size",
    },
  },

  // ─────────────────────────────────────────────────────────────
  // ITEM 09 — FOUND
  // ─────────────────────────────────────────────────────────────
  {
    id: "RX-FOUND-205",
    title: "USB-C Adapter",
    type: "found",
    category: "Electronics",
    location: "Computer Lab",
    latitude: 37.4290,
    longitude: -122.1740,
    date: "Sep 20, 2026",
    time: "2:40 PM",
    description: "Small silver USB-C adapter found beside a workstation.",
    status: "active",
    imageUrl: "/images/items/usb-c-adapter.webp",
    imageAlt: "Realistic silver USB-C adapter beside a computer workstation",
    isDemo: true,
    userId: "user-demo-finder-05",
    createdAt: "2026-09-20T14:40:00Z",
    proofLockerId: "locker-rx-found-205",
    characteristics: {
      color: "Silver",
      material: "Metal",
      marks: "Compact USB-C connector",
      accessories: "USB-C connector",
    },
  },

  // ─────────────────────────────────────────────────────────────
  // ITEM 10 — LOST
  // ─────────────────────────────────────────────────────────────
  {
    id: "RX-LOST-106",
    title: "Dark Brown Wallet",
    type: "lost",
    category: "Personal Item",
    location: "Cafeteria",
    latitude: 37.4250,
    longitude: -122.1702,
    date: "Sep 20, 2026",
    time: "12:50 PM",
    description: "Dark brown wallet reported missing near the cafeteria seating area.",
    status: "active",
    imageUrl: "/images/items/dark-brown-wallet.webp",
    imageAlt: "Realistic dark brown wallet on a cafeteria table",
    isDemo: true,
    userId: "user-demo-owner-06",
    createdAt: "2026-09-20T12:50:00Z",
    characteristics: {
      color: "Dark brown",
      material: "Leather-style exterior",
      marks: "Compact leather-style exterior",
    },
  },
]

export const DEMO_PROOF_LOCKERS: Record<string, ProofLocker> = {
  "locker-rx-8834-b": {
    id: "locker-rx-8834-b",
    itemId: "RX-8834-B",
    sealedAt: "2026-09-20T18:15:30Z",
    hash: "0x7F4A...B92D",
    isDemo: true,
    clues: [
      {
        id: "clue-1",
        question: "What is attached inside the inner zipper?",
        expectedAnswer: "red keychain",
        type: "text",
        sealed: true,
      },
      {
        id: "clue-2",
        question: "What notebook or book is inside?",
        expectedAnswer: "blue notebook",
        type: "text",
        sealed: true,
      },
      {
        id: "clue-3",
        question: "What marking is stitched inside the pocket?",
        expectedAnswer: "small stitched marking",
        type: "text",
        sealed: true,
      },
    ],
  },
  "locker-rx-found-202": {
    id: "locker-rx-found-202",
    itemId: "RX-FOUND-202",
    sealedAt: "2026-09-20T13:36:00Z",
    hash: "0x89C1...44A2",
    isDemo: true,
    clues: [
      {
        id: "clue-1",
        question: "What small mark is on the lid?",
        expectedAnswer: "tiny scratch on lid",
        type: "text",
        sealed: true,
      },
      {
        id: "clue-2",
        question: "What distinctive marking is near the hinge?",
        expectedAnswer: "small red marking near hinge",
        type: "text",
        sealed: true,
      },
    ],
  },
  "locker-rx-found-203": {
    id: "locker-rx-found-203",
    itemId: "RX-FOUND-203",
    sealedAt: "2026-09-20T10:46:00Z",
    hash: "0x41E9...B01F",
    isDemo: true,
    clues: [
      {
        id: "clue-1",
        question: "What is placed underneath the calculator?",
        expectedAnswer: "small blue sticker",
        type: "text",
        sealed: true,
      },
      {
        id: "clue-2",
        question: "Where is a faint scratch located on the casing?",
        expectedAnswer: "faint scratch beside display",
        type: "text",
        sealed: true,
      },
    ],
  },
  "locker-rx-found-204": {
    id: "locker-rx-found-204",
    itemId: "RX-FOUND-204",
    sealedAt: "2026-09-20T08:11:00Z",
    hash: "0x51B9...38C0",
    isDemo: true,
    clues: [
      {
        id: "clue-1",
        question: "What is tied around the keyring?",
        expectedAnswer: "small blue thread tied around the keyring",
        type: "text",
        sealed: true,
      },
    ],
  },
  "locker-rx-found-205": {
    id: "locker-rx-found-205",
    itemId: "RX-FOUND-205",
    sealedAt: "2026-09-20T14:41:00Z",
    hash: "0x6E10...12DF",
    isDemo: true,
    clues: [
      {
        id: "clue-1",
        question: "What minor mark is on the connector housing?",
        expectedAnswer: "tiny scratch on connector housing",
        type: "text",
        sealed: true,
      },
    ],
  },
}

// User starts with empty claims so personal statistics are cleanly 0
export const DEMO_CLAIMS: Claim[] = []

export const LOCATIONS = [
  "Central Library",
  "Cafeteria",
  "Academic Block",
  "Sports Complex",
  "Main Gate",
  "Computer Lab",
  "Student Center",
  "Bus Stop — West Gate",
]

export const CATEGORIES = [
  "Backpack",
  "Electronics",
  "Personal Item",
  "Keys",
  "Stationery",
  "Academic",
  "Documents",
  "Other",
]
