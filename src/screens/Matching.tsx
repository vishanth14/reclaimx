import { useState, useEffect } from "react"
import { T } from "../tokens"
import { ArrowLeftIcon, ArrowRightIcon, ShieldIcon } from "../components/Icons"
import { MagneticButton } from "../components/MagneticButton"
import { matchingService } from "../services/matchingService"
import { claimsService } from "../services/claimsService"
import { storageService } from "../services/storageService"
import { ItemImage } from "../components/ItemImage"
import type { Screen } from "../App"

const strengthColor = (s: string) => {
  if (s === "Strong" || s === "Very close") return T.accent2
  if (s === "Within expected window" || s === "Similar" || s === "Nearby") return T.accent
  return T.text2
}

export function Matching({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [activeLostId, setActiveLostId] = useState<string>("RX-LOST-101")
  const [matches, setMatches] = useState<
    {
      id: string
      type: string
      loc: string
      time: string
      desc: string
      score: number
      confidenceLabel: string
      isDemo?: boolean
      imageUrl?: string
      imageAlt?: string
      category?: string
      signals: { label: string; strength: string; score: number }[]
    }[]
  >([])

  useEffect(() => {
    const storedLostId =
      (typeof window !== "undefined" && localStorage.getItem("reclaimx_active_lost_id")) ||
      "RX-LOST-101"
    setActiveLostId(storedLostId)

    const realMatches = matchingService.findMatchesForLost(storedLostId, 50)
    if (realMatches.length > 0) {
      const mapped = realMatches.map(({ match, foundItem }) => ({
        id: foundItem.id,
        type: foundItem.title,
        loc: foundItem.location,
        time: `${foundItem.date} · ${foundItem.time}`,
        desc: foundItem.description,
        score: match.score,
        confidenceLabel: match.confidenceLabel,
        isDemo: foundItem.isDemo,
        imageUrl: foundItem.imageUrl,
        imageAlt: foundItem.imageAlt,
        category: foundItem.category,
        signals: match.signals.map((s) => ({
          label: s.label,
          strength: s.strength,
          score: Math.round((s.score / s.maxScore) * 100),
        })),
      }))
      setMatches(mapped)
    } else {
      // If no matches for this specific lost item, show top candidates from active found items
      const fallback = matchingService.findMatchesForLost("RX-LOST-101", 50)
      const mapped = fallback.map(({ match, foundItem }) => ({
        id: foundItem.id,
        type: foundItem.title,
        loc: foundItem.location,
        time: `${foundItem.date} · ${foundItem.time}`,
        desc: foundItem.description,
        score: match.score,
        confidenceLabel: match.confidenceLabel,
        isDemo: foundItem.isDemo,
        imageUrl: foundItem.imageUrl,
        imageAlt: foundItem.imageAlt,
        category: foundItem.category,
        signals: match.signals.map((s) => ({
          label: s.label,
          strength: s.strength,
          score: Math.round((s.score / s.maxScore) * 100),
        })),
      }))
      setMatches(mapped)
    }
  }, [])

  // Staggered sequential reveal: 70ms per bar filling 0 -> value over 300ms ease-out
  const [animatedScores, setAnimatedScores] = useState<Record<string, number[]>>({})

  useEffect(() => {
    matches.forEach((m) => {
      m.signals.forEach((sig, sIdx) => {
        setTimeout(
          () => {
            setAnimatedScores((prev) => ({
              ...prev,
              [m.id]:
                prev[m.id]?.map((v, idx) => (idx === sIdx ? sig.score : v)) ||
                m.signals.map((s, i) => (i === sIdx ? s.score : 0)),
            }))
          },
          100 + sIdx * 75,
        )
      })
    })
  }, [matches])

  const handleClaim = (foundId: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("reclaimx_active_item_id", foundId)
      localStorage.setItem("reclaimx_active_found_id", foundId)
    }
    claimsService.createClaim(activeLostId, foundId)
    onNavigate("verify")
  }

  const handleView = (foundId: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("reclaimx_active_item_id", foundId)
      localStorage.setItem("reclaimx_active_found_id", foundId)
    }
    onNavigate("item-detail")
  }

  return (
    <div style={{ padding: "40px 48px", maxWidth: 720 }}>
      <button
        onClick={() => onNavigate("home")}
        style={{
          background: "none",
          border: "none",
          color: T.muted,
          fontSize: 12,
          cursor: "pointer",
          padding: 0,
          marginBottom: 28,
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontFamily: T.sans,
        }}
      >
        <ArrowLeftIcon size={14} />
        <span>Return to Home</span>
      </button>

      <div className="rx-page-title-enter">
        <div
          style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: T.muted,
            marginBottom: 12,
          }}
        >
          Matching Engine
        </div>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: T.text,
            margin: "0 0 8px",
          }}
        >
          We found potential matches.
        </h1>
        <p
          style={{
            fontSize: 13,
            color: T.text2,
            margin: "0 0 24px",
            lineHeight: 1.6,
          }}
        >
          Potential match based on available signals. Private proof from finders
          is never revealed here.
        </p>

        {/* Active Lost Item Comparison Banner */}
        {(() => {
          const lostItem = storageService.getItemById(activeLostId)
          if (!lostItem) return null
          return (
            <div
              style={{
                background: T.surface2,
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                padding: "14px 18px",
                marginBottom: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 8,
                    overflow: "hidden",
                    border: `1px solid ${T.border}`,
                    flexShrink: 0,
                    background: T.surface3,
                  }}
                >
                  <ItemImage
                    src={lostItem.imageUrl}
                    alt={lostItem.imageAlt || lostItem.title}
                    width={50}
                    height={50}
                    fallbackCategory={lostItem.category}
                  />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: T.accent2,
                      fontWeight: 600,
                      marginBottom: 2,
                    }}
                  >
                    Your Reported Missing Item
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: T.text }}>
                    {lostItem.title}
                  </div>
                  <div style={{ fontSize: 11, color: T.muted }}>
                    {lostItem.location} · {lostItem.date} {lostItem.time}
                  </div>
                </div>
              </div>
              <span style={{ fontSize: 11, color: T.muted, fontFamily: T.mono }}>
                REF: {lostItem.id}
              </span>
            </div>
          )
        })()}
      </div>

      <style>{`
        @keyframes rx-match-stagger {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rx-match-card {
          animation: rx-match-stagger var(--dur-standard) var(--ease-out-quint) forwards;
          transition: background var(--dur-standard) var(--ease-out-quint), border-color var(--dur-standard) var(--ease-out-quint);
        }
        .rx-match-card:hover {
          background: #14181E !important;
          border-color: #3B424E !important;
        }
        .rx-match-card:hover .rx-arrow-hover {
          transform: translateX(3px);
          color: #F5F5F0;
        }
        @media (prefers-reduced-motion: reduce) {
          .rx-match-card { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {matches.map((match, i) => (
          <div
            key={match.id}
            data-cursor="view"
            className="rx-match-card rx-interactive"
            style={{
              background: T.surface,
              border: `1px solid ${i === 0 ? `${T.accent}44` : T.border}`,
              borderRadius: 10,
              overflow: "hidden",
              animationDelay: `${i * 90}ms`,
              opacity: 0,
            }}
          >
            {i === 0 && (
              <div
                style={{
                  padding: "8px 16px",
                  background: `${T.accent}14`,
                  borderBottom: `1px solid ${T.accent}33`,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <ShieldIcon size={12} color={T.accent} />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: T.accent,
                  }}
                >
                  Highest Signal Match
                </span>
              </div>
            )}
            <div style={{ padding: 24 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 12,
                  flexWrap: "wrap",
                  gap: 14,
                  alignItems: "flex-start",
                }}
              >
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 8,
                      overflow: "hidden",
                      border: `1px solid ${T.border}`,
                      flexShrink: 0,
                      background: T.surface3,
                    }}
                  >
                    <ItemImage
                      src={match.imageUrl}
                      alt={match.imageAlt || match.type}
                      width={52}
                      height={52}
                      fallbackCategory={match.category}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 500,
                        color: T.text,
                        marginBottom: 4,
                      }}
                    >
                      {match.type}
                    </div>
                    <div
                      style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}
                    >
                      <span
                        style={{
                          fontFamily: T.mono,
                          fontSize: 11,
                          color: T.muted,
                        }}
                      >
                        {match.id}
                      </span>
                      {match.isDemo && (
                        <span
                          style={{
                            fontSize: 9,
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
                      <span style={{ fontSize: 11, color: T.border }}>·</span>
                      <span style={{ fontSize: 11, color: T.muted }}>
                        {match.loc}
                      </span>
                      <span style={{ fontSize: 11, color: T.border }}>·</span>
                      <span style={{ fontSize: 11, color: T.muted }}>
                        {match.time}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleView(match.id)}
                  className="rx-btn-secondary rx-interactive"
                  style={{
                    background: "none",
                    border: `1px solid ${T.border}`,
                    color: T.text2,
                    fontSize: 12,
                    padding: "6px 14px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontFamily: T.sans,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span>View Details</span>
                  <span
                    className="rx-arrow-hover"
                    style={{
                      display: "inline-flex",
                      transition:
                        "transform var(--dur-micro) var(--ease-out-quint)",
                    }}
                  >
                    <ArrowRightIcon size={12} />
                  </span>
                </button>
              </div>

              <p
                style={{
                  fontSize: 13,
                  color: T.text2,
                  lineHeight: 1.5,
                  margin: "0 0 16px",
                }}
              >
                {match.desc}
              </p>

              {/* Why this match? */}
              <div
                style={{ borderTop: `1px solid ${T.border}`, paddingTop: 16 }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: T.muted,
                    marginBottom: 12,
                  }}
                >
                  WHY THIS MATCH?
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {match.signals.map((sig, sIdx) => {
                    const currentVal = animatedScores[match.id]?.[sIdx] ?? 0
                    return (
                      <div
                        key={sig.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <span style={{ fontSize: 12, color: T.text2 }}>
                          {sig.label}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              width: 80,
                              height: 2,
                              background: T.surface3,
                              borderRadius: 1,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${currentVal}%`,
                                background: strengthColor(sig.strength),
                                borderRadius: 1,
                                transition:
                                  "width 300ms cubic-bezier(0.22, 1, 0.36, 1)",
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 11,
                              color: strengthColor(sig.strength),
                              width: 150,
                              textAlign: "right",
                            }}
                          >
                            {sig.strength}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {i === 0 && (
                <div style={{ marginTop: 20 }}>
                  <MagneticButton
                    variant="primary"
                    dataCursor="claim"
                    onClick={() => handleClaim(match.id)}
                    style={{
                      padding: "10px 22px",
                      borderRadius: 7,
                      fontSize: 13,
                    }}
                  >
                    <span>Claim This Item</span>
                    <ArrowRightIcon size={14} />
                  </MagneticButton>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
