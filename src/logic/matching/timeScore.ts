import type { MatchSignal } from "../../types/matches"

// Parses dates like "Sep 20", "2026-09-20", or relative dates into an approximate epoch
function parseDateTimeToMinutes(dateStr: string, timeStr: string): number | null {
  try {
    let hour = 12
    let minute = 0

    if (timeStr) {
      const match = timeStr.trim().match(/(\d+):?(\d+)?\s*(am|pm)?/i)
      if (match) {
        let h = parseInt(match[1], 10)
        const m = match[2] ? parseInt(match[2], 10) : 0
        const meridian = match[3]?.toLowerCase()
        if (meridian === "pm" && h < 12) h += 12
        if (meridian === "am" && h === 12) h = 0
        hour = h
        minute = m
      }
    }

    // Day offset from current month
    let dayNumber = 20
    const dayMatch = dateStr.match(/\d+/)
    if (dayMatch) {
      dayNumber = parseInt(dayMatch[0], 10)
    }

    return dayNumber * 24 * 60 + hour * 60 + minute
  } catch {
    return null
  }
}

export function calculateTimeScore(
  lostDate: string,
  lostTime: string,
  foundDate: string,
  foundTime: string,
): { score: number; signal: MatchSignal } {
  const lostMin = parseDateTimeToMinutes(lostDate, lostTime)
  const foundMin = parseDateTimeToMinutes(foundDate, foundTime)

  if (lostMin === null || foundMin === null) {
    return {
      score: 6,
      signal: {
        name: "time",
        label: "Time window",
        strength: "Plausible",
        score: 6,
        maxScore: 15,
        detail: "Unspecified timestamps",
      },
    }
  }

  // Lost should normally be before or approximately at found time
  const diffMinutes = Math.abs(foundMin - lostMin)

  if (diffMinutes <= 30) {
    return {
      score: 15,
      signal: {
        name: "time",
        label: "Time window",
        strength: "Within expected window",
        score: 15,
        maxScore: 15,
        detail: "Reported ~15–30 min apart",
      },
    }
  }

  if (diffMinutes <= 120) {
    return {
      score: 12,
      signal: {
        name: "time",
        label: "Time window",
        strength: "Within expected window",
        score: 12,
        maxScore: 15,
        detail: "Within ~2 hours",
      },
    }
  }

  if (diffMinutes <= 360) {
    return {
      score: 8,
      signal: {
        name: "time",
        label: "Time window",
        strength: "Plausible",
        score: 8,
        maxScore: 15,
        detail: "Same-day window (~4–6h)",
      },
    }
  }

  if (diffMinutes <= 1440) {
    return {
      score: 4,
      signal: {
        name: "time",
        label: "Time window",
        strength: "Moderate",
        score: 4,
        maxScore: 15,
        detail: "Within 24 hours",
      },
    }
  }

  return {
    score: 1,
    signal: {
      name: "time",
      label: "Time window",
      strength: "Low",
      score: 1,
      maxScore: 15,
      detail: "Disparate dates (>24h)",
    },
  }
}
