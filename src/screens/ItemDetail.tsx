import { useState, useEffect } from "react"
import { T } from "../tokens"
import { MATCH_SIGNALS } from "../services/mockData"
import { storageService } from "../services/storageService"
import { claimsService } from "../services/claimsService"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ImageIcon,
  ShieldIcon,
} from "../components/Icons"
import { MagneticButton } from "../components/MagneticButton"
import { ItemImage } from "../components/ItemImage"
import type { Screen } from "../App"

export function ItemDetail({
  onNavigate,
}: {
  onNavigate: (s: Screen) => void
}) {
  const [claiming, setClaiming] = useState(false)
  const [activeItemId, setActiveItemId] = useState<string>("RX-8834-B")

  useEffect(() => {
    const stored =
      (typeof window !== "undefined" &&
        (localStorage.getItem("reclaimx_active_item_id") ||
          localStorage.getItem("reclaimx_active_found_id"))) ||
      "RX-8834-B"
    setActiveItemId(stored)
  }, [])

  const item = storageService.getItemById(activeItemId) || storageService.getItems()[0]

  const handleStartClaim = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("reclaimx_active_found_id", item.id)
    }
    const activeLostId =
      (typeof window !== "undefined" && localStorage.getItem("reclaimx_active_lost_id")) ||
      "RX-LOST-101"
    claimsService.createClaim(activeLostId, item.id)
    onNavigate("verify")
  }

  // Staggered sequential bar animation — each bar fills from 0 to its score over 300ms ease-out
  const [animatedScores, setAnimatedScores] = useState<number[]>(
    MATCH_SIGNALS.map(() => 0),
  )

  useEffect(() => {
    MATCH_SIGNALS.forEach((sig, i) => {
      setTimeout(
        () => {
          setAnimatedScores((prev) =>
            prev.map((v, idx) => (idx === i ? sig.score : v)),
          )
        },
        120 + i * 75,
      ) // 75ms stagger per bar
    })
  }, [])

  return (
    <div style={{ padding: "40px 48px", maxWidth: 720 }}>
      <button
        onClick={() => onNavigate("discover")}
        className="rx-interactive"
        style={{
          background: "none",
          border: "none",
          color: T.muted,
          fontSize: 12,
          cursor: "pointer",
          padding: 0,
          marginBottom: 28,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          transition: "color var(--dur-micro) var(--ease-out-quint)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = T.text
          const svg = e.currentTarget.querySelector("svg")
          if (svg) svg.style.transform = "translateX(-3px)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = T.muted
          const svg = e.currentTarget.querySelector("svg")
          if (svg) svg.style.transform = "translateX(0)"
        }}
      >
        <span
          style={{
            display: "inline-flex",
            transition: "transform var(--dur-micro) var(--ease-out-quint)",
          }}
        >
          <ArrowLeftIcon size={14} />
        </span>
        <span>Back to Discover</span>
      </button>

      <div
        className="rx-page-title-enter"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 10,
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: item.type === "found" ? T.accent : T.accent2,
                padding: "3px 8px",
                border: `1px solid ${item.type === "found" ? T.accent : T.accent2}44`,
                borderRadius: 4,
                background: `${item.type === "found" ? T.accent : T.accent2}14`,
              }}
            >
              {item.type === "found" ? "Found" : "Lost"}
            </span>
            <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>
              {item.id}
            </span>
            {item.isDemo && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: T.muted,
                  padding: "2px 6px",
                  border: `1px solid ${T.border}`,
                  borderRadius: 3,
                  background: T.surface3,
                }}
              >
                DEMO DATA
              </span>
            )}
          </div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: T.text,
              margin: 0,
            }}
          >
            {item.title}
          </h1>
        </div>
      </div>

      {/* Prominent Item Photography / Media Display */}
      <div
        data-cursor="view"
        style={{
          width: "100%",
          marginBottom: 24,
          borderRadius: 10,
          overflow: "hidden",
          border: `1px solid ${T.border}`,
          position: "relative",
        }}
      >
        <ItemImage
          src={item.imageUrl}
          alt={item.imageAlt || item.title}
          width="100%"
          height={260}
          borderRadius={10}
          fallbackCategory={item.category}
        />
        {item.imageSource && (
          <div
            style={{
              position: "absolute",
              bottom: 8,
              right: 12,
              background: "rgba(10, 12, 16, 0.75)",
              backdropFilter: "blur(6px)",
              padding: "3px 8px",
              borderRadius: 4,
              fontSize: 9,
              fontFamily: T.mono,
              color: T.muted,
              letterSpacing: "0.04em",
              pointerEvents: "none",
            }}
          >
            REF: {item.imageSource} · {item.imageLicense || "FREE USE"}
          </div>
        )}
      </div>

      <div
        style={{ display: "flex", gap: 32, marginBottom: 24, flexWrap: "wrap" }}
      >
        {[
          { label: "Category", value: item.category },
          { label: "Location", value: item.location },
          { label: "Reported", value: `${item.date} · ${item.time}` },
        ].map((m) => (
          <div key={m.label}>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: T.muted,
                marginBottom: 4,
              }}
            >
              {m.label}
            </div>
            <div style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      <p
        style={{
          fontSize: 14,
          color: T.text2,
          lineHeight: 1.65,
          margin: "0 0 36px",
          paddingBottom: 36,
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        {item.description}
      </p>

      {/* Match Signals — sequentially animated 60-80ms stagger */}
      <div style={{ marginBottom: 36 }}>
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
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              color: T.muted,
            }}
          >
            MATCH SIGNALS
          </div>
          <span style={{ fontSize: 11, color: T.muted }}>Potential Match</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {MATCH_SIGNALS.map((sig, i) => (
            <div key={sig.label}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 13, color: T.text }}>{sig.label}</span>
                <span
                  style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}
                >
                  {sig.score}%
                </span>
              </div>
              <div
                style={{
                  height: 2,
                  background: T.surface3,
                  borderRadius: 1,
                  marginBottom: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  className="rx-signal-bar"
                  style={{
                    height: "100%",
                    width: `${animatedScores[i]}%`,
                    background: sig.score > 80 ? T.accent2 : T.accent,
                    borderRadius: 1,
                    transition: "width 300ms cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                />
              </div>
              <div style={{ fontSize: 11, color: T.muted }}>{sig.strength}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 20,
            padding: "12px 14px",
            background: T.surface2,
            borderRadius: 7,
            border: `1px solid ${T.border}`,
          }}
        >
          <p
            style={{ fontSize: 12, color: T.muted, margin: 0, lineHeight: 1.5 }}
          >
            Match confidence helps identify potential matches. It does not prove
            ownership.
          </p>
        </div>
      </div>

      {/* Claim Flow */}
      {!claiming ? (
        <MagneticButton
          onClick={() => setClaiming(true)}
          dataCursor="claim"
          className="rx-btn-primary rx-cta"
          style={{
            background: T.accent,
            border: `1px solid ${T.accent}`,
            color: "#fff",
            fontSize: 14,
            fontWeight: 500,
            padding: "12px 28px",
            borderRadius: 8,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            boxShadow: `0 4px 16px ${T.accent}33`,
          }}
        >
          <span>Claim This Item</span>
          <ArrowRightIcon size={14} />
        </MagneticButton>
      ) : (
        <div
          style={{
            background: T.surface2,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: 28,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              color: T.muted,
              marginBottom: 12,
            }}
          >
            Before we connect you...
          </div>
          <p
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: T.text,
              marginBottom: 8,
            }}
          >
            The finder has provided private ownership evidence.
          </p>
          <p
            style={{
              fontSize: 13,
              color: T.text2,
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            We won't show it to you. Instead, you'll be asked to provide what
            you know about the item.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <MagneticButton
              onClick={handleStartClaim}
              dataCursor="claim"
              className="rx-btn-primary rx-cta"
              style={{
                background: T.accent,
                border: `1px solid ${T.accent}`,
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
                padding: "11px 22px",
                borderRadius: 7,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: `0 4px 16px ${T.accent}33`,
              }}
            >
              <span>Continue to Verification</span>
              <ArrowRightIcon size={14} />
            </MagneticButton>
            <button
              onClick={() => setClaiming(false)}
              className="rx-btn-secondary rx-interactive"
              style={{
                background: T.surface3,
                border: `1px solid ${T.border}`,
                color: T.text2,
                fontSize: 13,
                padding: "11px 20px",
                borderRadius: 7,
                cursor: "pointer",
                fontFamily: T.sans,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
