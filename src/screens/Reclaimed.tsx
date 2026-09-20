import { useState, useEffect } from "react"
import { T } from "../tokens"
import { CheckIcon, ArrowRightIcon, ShieldIcon } from "../components/Icons"
import { MagneticButton } from "../components/MagneticButton"
import type { Screen } from "../App"
import { storageService } from "../services/storageService"
import type { Claim } from "../types/claims"
import type { Item } from "../types/items"

const journey = [
  { label: "Reported", done: true },
  { label: "Matched", done: true },
  { label: "Verified", done: true },
  { label: "Reclaimed", done: true, final: true },
]

export function Reclaimed({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  // Moment 6: The four-stage journey resolves into one collapsed, solid indicator over ~600ms
  const [collapsed, setCollapsed] = useState(false)
  const [claim, setClaim] = useState<Claim | null>(null)
  const [item, setItem] = useState<Item | null>(null)

  useEffect(() => {
    const claimId = localStorage.getItem("reclaimx_active_completed_claim_id") ||
      localStorage.getItem("reclaimx_active_claim_id")
    const allClaims = storageService.getClaims()
    const activeClaim = (claimId ? storageService.getClaimById(claimId) : null) ||
      allClaims.find(c => c.status === "completed") ||
      allClaims[0] ||
      null

    if (activeClaim) {
      setClaim(activeClaim)
      const it = storageService.getItemById(activeClaim.foundItemId) ||
        (activeClaim.lostItemId ? storageService.getItemById(activeClaim.lostItemId) : null)
      if (it) setItem(it)
    }

    const timer = setTimeout(() => {
      setCollapsed(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      style={{
        minHeight: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "72px 32px",
        maxWidth: 680,
        margin: "0 auto",
      }}
    >
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        {/* Subtle Completion Node */}
        <div
          style={{
            marginBottom: 28,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              border: `1.5px solid ${T.accent2}66`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `${T.accent2}12`,
              color: T.accent2,
            }}
          >
            <CheckIcon size={24} strokeWidth={2.4} />
          </div>
        </div>

        {/* Milestone Title & Subtext with 1980s supernatural editorial display typography */}
        <h1
          className="rx-milestone-title"
          style={{
            fontSize: "clamp(34px, 4.5vw, 46px)",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: T.text,
            lineHeight: 1.1,
            margin: "0 0 10px",
            textShadow: `0 0 30px rgba(118, 87, 255, 0.25)`,
          }}
        >
          RECLAIMED
        </h1>

        <p
          className="rx-retro-display"
          style={{
            fontSize: 21,
            fontStyle: "italic",
            color: T.gold,
            lineHeight: 1.6,
            margin: "0 0 36px",
            letterSpacing: "0.02em",
            textShadow: `0 0 16px ${T.gold}44`,
          }}
        >
          Back where it belongs.
        </p>

        {/* Moment 6: Resolving journey into one collapsed, solid indicator over ~600ms */}
        <div
          style={{
            background: T.surface2,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: "22px 24px",
            marginBottom: 28,
            transition: "border-color 600ms ease-out",
            borderColor: collapsed ? `${T.accent2}44` : T.border,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: T.muted,
                textAlign: "left",
              }}
            >
              Recovery Journey Resolution
            </div>
            {collapsed && (
              <span
                style={{
                  fontSize: 10,
                  fontFamily: T.mono,
                  color: T.accent2,
                  letterSpacing: "0.06em",
                }}
              >
                RESOLVED · 100%
              </span>
            )}
          </div>

          {/* Collapsing state visual */}
          <div
            style={{
              position: "relative",
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Expanded 4 stages — fades and collapses smoothly */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                opacity: collapsed ? 0 : 1,
                transform: collapsed ? "scaleX(0.85)" : "scaleX(1)",
                transition:
                  "opacity 500ms ease-out, transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
                pointerEvents: collapsed ? "none" : "auto",
              }}
            >
              {journey.map((step, i) => (
                <div
                  key={step.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flex: i < journey.length - 1 ? 1 : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: T.accent2,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 10,
                        color: T.muted,
                        textTransform: "uppercase",
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < journey.length - 1 && (
                    <div
                      style={{
                        flex: 1,
                        height: 1,
                        background: `${T.accent2}66`,
                        margin: "0 8px",
                        marginBottom: 16,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Collapsed unified solid indicator: resolves over 600ms */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: collapsed ? 1 : 0,
                transform: collapsed ? "scale(1)" : "scale(0.96)",
                transition:
                  "opacity 600ms cubic-bezier(0.22, 1, 0.36, 1), transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  background: T.surface3,
                  borderRadius: 6,
                  padding: "10px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: `1px solid ${T.accent2}33`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ShieldIcon size={14} color={T.accent2} />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: T.text,
                      letterSpacing: "0.04em",
                    }}
                  >
                    Reported → Matched → Verified → Reclaimed
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: T.accent2,
                    background: `${T.accent2}18`,
                    padding: "3px 8px",
                    borderRadius: 4,
                  }}
                >
                  Completed
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Item Summary Card */}
        <div
          style={{
            background: T.surface2,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: "20px 24px",
            marginBottom: 32,
            textAlign: "left",
          }}
        >
          {[
            { label: "Item", value: item?.title || "Black backpack" },
            { label: "Claim ID", value: claim?.id || "RX-1041-A", mono: true },
            { label: "Handover Code", value: claim?.handoverCode || "RX-4821", mono: true },
            { label: "Resolved At", value: `${item?.location || "Central Library"} · Secure Exchange` },
            {
              label: "Certificate",
              value: "Cryptographically Sealed & Verified",
              mono: false,
              highlight: true,
            },
          ].map((r, idx, arr) => (
            <div
              key={r.label}
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr",
                gap: 8,
                padding: "8px 0",
                borderBottom:
                  idx < arr.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <span style={{ fontSize: 11, color: T.muted }}>{r.label}</span>
              <span
                style={{
                  fontSize: 12,
                  color: r.highlight ? T.accent2 : T.text,
                  fontFamily: r.mono ? T.mono : T.sans,
                }}
              >
                {r.value}
              </span>
            </div>
          ))}
        </div>

        {/* Restrained Actions */}
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <MagneticButton
            variant="secondary"
            onClick={() => onNavigate("claims")}
            style={{
              padding: "10px 22px",
              borderRadius: 7,
              fontSize: 13,
            }}
          >
            My Claims
          </MagneticButton>
          <MagneticButton
            variant="secondary"
            onClick={() => onNavigate("home")}
            style={{
              padding: "10px 22px",
              borderRadius: 7,
              fontSize: 13,
            }}
          >
            Return to Home
          </MagneticButton>
        </div>
      </div>
    </div>
  )
}
