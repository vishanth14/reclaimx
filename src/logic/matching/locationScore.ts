import type { MatchSignal } from "../../types/matches"

interface Coordinates {
  lat: number
  lng: number
}

// Campus landmarks with approximate reference coordinates
export const CAMPUS_LOCATIONS: Record<string, Coordinates> = {
  "central library": { lat: 37.4275, lng: -122.1697 },
  library: { lat: 37.4275, lng: -122.1697 },
  cafeteria: { lat: 37.4250, lng: -122.1702 },
  "tresidder union": { lat: 37.4250, lng: -122.1702 },
  "academic block": { lat: 37.4285, lng: -122.1740 },
  "academic block — room 204": { lat: 37.4285, lng: -122.1740 },
  "hewlett teaching center": { lat: 37.4288, lng: -122.1742 },
  "gates computer science": { lat: 37.4300, lng: -122.1730 },
  "student center": { lat: 37.4260, lng: -122.1700 },
  "bus stop": { lat: 37.4320, lng: -122.1780 },
  "bus stop — west gate": { lat: 37.4320, lng: -122.1780 },
  "main gate": { lat: 37.4340, lng: -122.1700 },
  "sports complex": { lat: 37.4310, lng: -122.1620 },
  gym: { lat: 37.4310, lng: -122.1620 },
  dorms: { lat: 37.4230, lng: -122.1670 },
}

// Haversine distance in meters
function haversineDistance(c1: Coordinates, c2: Coordinates): number {
  const R = 6371e3 // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(c2.lat - c1.lat)
  const dLng = toRad(c2.lng - c1.lng)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(c1.lat)) *
      Math.cos(toRad(c2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function resolveCoordinates(name: string, explicitLat?: number, explicitLng?: number): Coordinates | null {
  if (explicitLat !== undefined && explicitLng !== undefined) {
    return { lat: explicitLat, lng: explicitLng }
  }
  const clean = (name || "").toLowerCase().trim()
  if (!clean) return null

  // Direct map or substring
  for (const [key, coords] of Object.entries(CAMPUS_LOCATIONS)) {
    if (clean.includes(key) || key.includes(clean)) {
      return coords
    }
  }
  return null
}

export function calculateLocationScore(
  lostLoc: string,
  foundLoc: string,
  lostLat?: number,
  lostLng?: number,
  foundLat?: number,
  foundLng?: number,
): { score: number; signal: MatchSignal } {
  const normLost = (lostLoc || "").trim().toLowerCase()
  const normFound = (foundLoc || "").trim().toLowerCase()

  // Exact string match
  if (normLost && normFound && (normLost === normFound || normLost.includes(normFound) || normFound.includes(normLost))) {
    return {
      score: 20,
      signal: {
        name: "location",
        label: "Location proximity",
        strength: "Very close",
        score: 20,
        maxScore: 20,
        detail: `Matching campus area (${lostLoc || foundLoc})`,
      },
    }
  }

  const coordsLost = resolveCoordinates(lostLoc, lostLat, lostLng)
  const coordsFound = resolveCoordinates(foundLoc, foundLat, foundLng)

  if (coordsLost && coordsFound) {
    const distMeters = haversineDistance(coordsLost, coordsFound)

    if (distMeters <= 120) {
      return {
        score: 20,
        signal: {
          name: "location",
          label: "Location proximity",
          strength: "Very close",
          score: 20,
          maxScore: 20,
          detail: "Within ~100m proximity",
        },
      }
    }
    if (distMeters <= 350) {
      return {
        score: 16,
        signal: {
          name: "location",
          label: "Location proximity",
          strength: "Nearby",
          score: 16,
          maxScore: 20,
          detail: "Adjacent campus quadrant (~300m)",
        },
      }
    }
    if (distMeters <= 800) {
      return {
        score: 10,
        signal: {
          name: "location",
          label: "Location proximity",
          strength: "Moderate",
          score: 10,
          maxScore: 20,
          detail: "Same campus zone (~600m)",
        },
      }
    }
    return {
      score: 4,
      signal: {
        name: "location",
        label: "Location proximity",
        strength: "Low",
        score: 4,
        maxScore: 20,
        detail: "Distal campus location (>1km)",
      },
    }
  }

  // Fallback if coordinates unknown
  return {
    score: 2,
    signal: {
      name: "location",
      label: "Location proximity",
      strength: "Low",
      score: 2,
      maxScore: 20,
      detail: `Uncorrelated zones (${lostLoc || "?"} vs ${foundLoc || "?"})`,
    },
  }
}
