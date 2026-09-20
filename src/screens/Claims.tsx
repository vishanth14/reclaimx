import { useState, useEffect } from "react"
import { T } from "../tokens"
import type { Screen } from "../App"
import { storageService } from "../services/storageService"
import { matchingService } from "../services/matchingService"
import type { Claim } from "../types/claims"
import type { Item } from "../types/items"

type Status = "Searching" | "Potential Match" | "Verification Required" | "Verified" | "Handover Pending" | "Reclaimed"

const statusColor = (s: Status): string =>
  ({
    Searching: T.muted,
    "Potential Match": T.accent,
    "Verification Required": "#F0A86B",
    Verified: T.accent2,
    "Handover Pending": "#F0A86B",
    Reclaimed: T.accent2,
  })[s]

interface ClaimRecord {
  id: string
  type: string
  date: string
  loc: string
  status: Status
  targetScreen?: Screen
  originalItemId?: string
  originalClaimId?: string
  isDemo?: boolean
}

const tabs = ["Lost", "Found", "Claims"] as const
type Tab = typeof tabs[number]

export function Claims({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [tab, setTab] = useState<Tab>("Lost")
  const [lostList, setLostList] = useState<ClaimRecord[]>([])
  const [foundList, setFoundList] = useState<ClaimRecord[]>([])
  const [claimList, setClaimList] = useState<ClaimRecord[]>([])

  useEffect(() => {
    const currentUser = storageService.getCurrentUser()
    const lostItems = storageService.getLost()
    const foundItems = storageService.getFound()
    const allClaims = storageService.getClaims()

    const mappedLost: ClaimRecord[] = lostItems.map((item: Item) => {
      let status: Status = "Searching"
      let targetScreen: Screen = "item-detail"

      if (item.status === "reclaimed") {
        status = "Reclaimed"
        targetScreen = "reclaimed"
      } else {
        const matches = matchingService.findMatchesForLost(item)
        if (matches.length > 0) {
          status = "Potential Match"
          targetScreen = "matching"
        }
      }

      return {
        id: item.id,
        type: item.title,
        date: item.date,
        loc: item.location,
        status,
        targetScreen,
        originalItemId: item.id,
        isDemo: item.isDemo,
      }
    })

    const mappedFound: ClaimRecord[] = foundItems.map((item: Item) => {
      let status: Status = "Searching"
      let targetScreen: Screen = "item-detail"

      if (item.status === "reclaimed") {
        status = "Reclaimed"
        targetScreen = "reclaimed"
      } else {
        const relatedClaim = allClaims.find(c => c.foundItemId === item.id)
        if (relatedClaim) {
          if (relatedClaim.status === "handover_ready") {
            status = "Handover Pending"
            targetScreen = "handover"
          } else if (relatedClaim.status === "verified") {
            status = "Verified"
            targetScreen = "handover"
          } else if (relatedClaim.status === "verification") {
            status = "Verification Required"
            targetScreen = "verify"
          }
        }
      }

      return {
        id: item.id,
        type: item.title,
        date: item.date,
        loc: item.location,
        status,
        targetScreen,
        originalItemId: item.id,
        isDemo: item.isDemo,
      }
    })

    // Show claims belonging to current user
    const userClaims = allClaims.filter(
      (c) => c.claimantId === currentUser.id || c.finderId === currentUser.id,
    )

    const mappedClaims: ClaimRecord[] = userClaims.map((claim) => {
      const foundItem = storageService.getItemById(claim.foundItemId)
      let status: Status = "Searching"
      let targetScreen: Screen = "item-detail"

      if (claim.status === "completed") {
        status = "Reclaimed"
        targetScreen = "reclaimed"
      } else if (claim.status === "handover_ready") {
        status = "Handover Pending"
        targetScreen = "handover"
      } else if (claim.status === "verified") {
        status = "Verified"
        targetScreen = "handover"
      } else if (claim.status === "verification" || claim.status === "rejected") {
        status = "Verification Required"
        targetScreen = "verify"
      } else {
        status = "Potential Match"
        targetScreen = "matching"
      }

      return {
        id: claim.id,
        type: foundItem?.title || "Claimed Item",
        date: new Date(claim.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        loc: foundItem?.location || "Campus",
        status,
        targetScreen,
        originalClaimId: claim.id,
        originalItemId: foundItem?.id,
        isDemo: claim.isDemo,
      }
    })

    setLostList(mappedLost)
    setFoundList(mappedFound)
    setClaimList(mappedClaims)
  }, [])

  const handleRowClick = (item: ClaimRecord) => {
    if (item.originalClaimId) {
      localStorage.setItem("reclaimx_active_claim_id", item.originalClaimId)
    }
    if (item.originalItemId) {
      localStorage.setItem("reclaimx_active_item_id", item.originalItemId)
      localStorage.setItem("reclaimx_active_found_id", item.originalItemId)
      if (tab === "Lost") {
        localStorage.setItem("reclaimx_active_lost_id", item.originalItemId)
      }
    }
    onNavigate(item.targetScreen || "item-detail")
  }

  const data = tab === "Lost" ? lostList : tab === "Found" ? foundList : claimList

  return (
    <div style={{ padding: "40px 48px", maxWidth: 780 }}>
      {/* Title */}
      <h1
        style={{
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: T.text,
          margin: "0 0 8px",
        }}
      >
        My Claims
      </h1>
      <p style={{ fontSize: 14, color: T.text2, margin: "0 0 28px" }}>
        Track your reported items, network matches, and pending handovers.
      </p>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: `1px solid ${T.border}`,
          marginBottom: 24,
          gap: 4,
        }}
      >
        {tabs.map((t) => {
          const active = tab === t
          const count =
            t === "Lost"
              ? lostList.length
              : t === "Found"
                ? foundList.length
                : claimList.length
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: "none",
                border: "none",
                borderBottom: `2px solid ${active ? T.accent : "transparent"}`,
                color: active ? T.text : T.text2,
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                padding: "10px 18px",
                cursor: "pointer",
                fontFamily: T.sans,
                marginBottom: -1,
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition:
                  "color var(--dur-micro) ease-out, border-color var(--dur-micro) ease-out",
              }}
            >
              <span>{t}</span>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: T.mono,
                  color: active ? T.text : T.muted,
                  background: active ? `${T.accent}20` : "transparent",
                  padding: "1px 6px",
                  borderRadius: 10,
                }}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Column Headers (Desktop/Tablet) */}
      <div
        className="rx-claims-header"
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(180px, 1fr) 90px minmax(120px, 150px) 180px",
          gap: 16,
          padding: "0 8px 12px",
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        {["Item", "Date", "Location", "Status"].map((h) => (
          <span
            key={h}
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: T.muted,
            }}
          >
            {h}
          </span>
        ))}
      </div>

      {/* List Feed */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {data.map((item) => {
          const color = statusColor(item.status)
          return (
            <div
              key={item.id}
              data-cursor="view"
              className="rx-row-interactive rx-interactive"
              onClick={() => handleRowClick(item)}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(180px, 1fr) 90px minmax(120px, 150px) 180px",
                gap: 16,
                padding: "16px 8px",
                borderBottom: `1px solid ${T.border}`,
                cursor: "pointer",
                borderRadius: 6,
                alignItems: "center",
              }}
            >
              {/* Item column */}
              <div>
                <div
                  className="rx-row-title"
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: T.text,
                    marginBottom: 3,
                    transition: "color var(--dur-micro) var(--ease-out-quint)",
                  }}
                >
                  {item.type}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}
                  >
                    {item.id}
                  </span>
                  {item.isDemo && (
                    <span
                      style={{
                        fontSize: 8,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: T.muted,
                        padding: "1px 5px",
                        border: `1px solid ${T.border}`,
                        borderRadius: 3,
                        background: T.surface3,
                      }}
                    >
                      DEMO DATA
                    </span>
                  )}
                </div>
              </div>

              {/* Date column */}
              <span
                className="rx-row-meta"
                style={{ fontSize: 12, color: T.text2 }}
              >
                {item.date}
              </span>

              {/* Location column */}
              <span
                className="rx-row-meta"
                style={{ fontSize: 12, color: T.text2 }}
              >
                {item.loc}
              </span>

              {/* Status column with action arrow affordance */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: color,
                    padding: "3px 8px",
                    border: `1px solid ${color}44`,
                    borderRadius: 4,
                    background: `${color}12`,
                    whiteSpace: "nowrap",
                    transition: "filter var(--dur-micro) var(--ease-out-quint)",
                  }}
                >
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: color,
                    }}
                  />
                  {item.status}
                </span>
                <span
                  className="rx-row-arrow"
                  style={{
                    color: T.muted,
                    fontSize: 13,
                    opacity: 0.6,
                    display: "inline-flex",
                  }}
                >
                  →
                </span>
              </div>
            </div>
          )
        })}

        {data.length === 0 && (
          <div style={{ padding: "48px 0", textAlign: "center" }}>
            <div style={{ fontSize: 13, color: T.muted }}>
              No {tab.toLowerCase()} items recorded.
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .rx-claims-header {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
