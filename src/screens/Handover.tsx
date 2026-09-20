import { useState, useEffect } from "react"
import { T } from "../tokens"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ShieldIcon,
} from "../components/Icons"
import { MagneticButton } from "../components/MagneticButton"
import type { Screen } from "../App"
import { storageService } from "../services/storageService"
import { handoverService } from "../services/handoverService"
import type { Claim } from "../types/claims"
import type { Item } from "../types/items"

export function Handover({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [claim, setClaim] = useState<Claim | null>(null)
  const [item, setItem] = useState<Item | null>(null)
  const [ownerConfirmed, setOwnerConfirmed] = useState(false)
  const [finderConfirmed, setFinderConfirmed] = useState(false)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const claimId = localStorage.getItem("reclaimx_active_claim_id")
    const allClaims = storageService.getClaims()
    const activeClaim = (claimId ? storageService.getClaimById(claimId) : null) || allClaims[0] || null

    if (activeClaim) {
      setClaim(activeClaim)
      setOwnerConfirmed(Boolean(activeClaim.ownerConfirmed))
      setFinderConfirmed(Boolean(activeClaim.finderConfirmed))

      if (activeClaim.expiresAt && new Date(activeClaim.expiresAt).getTime() < Date.now()) {
        setIsExpired(true)
      }

      const activeItem = storageService.getItemById(activeClaim.foundItemId) ||
        (activeClaim.lostItemId ? storageService.getItemById(activeClaim.lostItemId) : null)
      if (activeItem) {
        setItem(activeItem)
      }
    }
  }, [])

  const code = claim?.handoverCode || "RX-4821"
  const codeParts = code.includes("-")
    ? [code.split("-")[0] + "-", code.split("-")[1] || ""]
    : [code.slice(0, Math.ceil(code.length / 2)), code.slice(Math.ceil(code.length / 2))]

  const handleFinderToggle = () => {
    if (!claim) return
    const next = !finderConfirmed
    setFinderConfirmed(next)
    if (next) {
      handoverService.confirmFinder(claim.id)
    }
  }

  const handleOwnerToggle = () => {
    if (!claim) return
    const next = !ownerConfirmed
    setOwnerConfirmed(next)
    if (next) {
      handoverService.confirmOwner(claim.id)
    }
  }

  const handleComplete = () => {
    if (!claim) {
      onNavigate("reclaimed")
      return
    }
    const res = handoverService.completeHandover(claim.id)
    localStorage.setItem("reclaimx_active_completed_claim_id", claim.id)
    onNavigate("reclaimed")
  }

  const merged = ownerConfirmed && finderConfirmed

  return (
    <div style={{ padding: "40px 48px", maxWidth: 640 }}>
      <button
        onClick={() => onNavigate("claims")}
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
        <span>My Claims</span>
      </button>

      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: T.muted,
          marginBottom: 12,
        }}
      >
        SECURE EXCHANGE
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
        Ready to return.
      </h1>
      <p style={{ fontSize: 14, color: T.text2, margin: "0 0 32px" }}>
        Ownership is verified. Confirm the split handover code when meeting in
        person.
      </p>

      {isExpired && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            borderRadius: 8,
            padding: "12px 16px",
            color: "#ef4444",
            fontSize: 13,
            marginBottom: 24,
          }}
        >
          This handover code has expired. Please contact support or request a code renewal.
        </div>
      )}

      {/* Item + parties + safe location */}
      <div
        style={{
          background: T.surface2,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: 22,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 16,
          }}
        >
          {[
            { label: "Item", value: item?.title || "Black backpack" },
            { label: "Finder", value: "Verified Finder" },
            { label: "Claimant", value: "Verified Claimant (Owner)" },
          ].map((r) => (
            <div key={r.label}>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: T.muted,
                  marginBottom: 4,
                }}
              >
                {r.label}
              </div>
              <div style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>
                {r.value}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: `1px solid ${T.border}`,
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: T.muted,
              marginBottom: 4,
            }}
          >
            Designated Exchange Location
          </div>
          <div style={{ fontSize: 13, color: T.text2 }}>
            {item?.location || "Central Library"} — Main Information Desk, First Floor
          </div>
        </div>
      </div>

      {/* Handover code signature interaction */}
      <div
        style={{
          background: T.surface2,
          border: `1px solid ${merged ? `${T.accent2}55` : T.border}`,
          borderRadius: 10,
          padding: "28px 24px",
          marginBottom: 32,
          textAlign: "center",
          transition: "border-color 500ms ease-out",
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: T.muted,
            marginBottom: 18,
          }}
        >
          HANDOVER CODE
        </div>

        {/* Split code halves: shifts toward each other over 500ms when both confirm */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 24px",
            borderRadius: 8,
            background: T.surface3,
            border: `1px solid ${merged ? `${T.accent2}33` : T.border}`,
          }}
        >
          {/* Left half — Finder */}
          <div
            style={{
              transform: merged ? "translateX(3px)" : "translateX(0)",
              transition: "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: T.mono,
                fontSize: 34,
                fontWeight: 500,
                letterSpacing: "0.08em",
                color: finderConfirmed ? T.text : T.text2,
                transition: "color 400ms ease-out",
              }}
            >
              {codeParts[0]}
            </span>
            <span
              style={{
                fontSize: 9,
                color: finderConfirmed ? T.accent2 : T.muted,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginTop: 4,
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <span>Finder Half</span>
              {finderConfirmed && <CheckIcon size={10} strokeWidth={2.5} />}
            </span>
          </div>

          {/* Thin vertical divider — fades out over 500ms upon both confirming */}
          <div
            style={{
              width: 1,
              height: 38,
              background: T.border,
              margin: "0 18px",
              opacity: merged ? 0 : 1,
              transform: merged ? "scaleY(0.4)" : "scaleY(1)",
              transition: "opacity 500ms ease-out, transform 500ms ease-out",
            }}
          />

          {/* Right half — Claimant */}
          <div
            style={{
              transform: merged ? "translateX(-3px)" : "translateX(0)",
              transition: "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: T.mono,
                fontSize: 34,
                fontWeight: 500,
                letterSpacing: "0.08em",
                color: ownerConfirmed ? T.text : T.text2,
                transition: "color 400ms ease-out",
              }}
            >
              {codeParts[1]}
            </span>
            <span
              style={{
                fontSize: 9,
                color: ownerConfirmed ? T.accent2 : T.muted,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginTop: 4,
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <span>Claimant Half</span>
              {ownerConfirmed && <CheckIcon size={10} strokeWidth={2.5} />}
            </span>
          </div>
        </div>

        {merged ? (
          <div
            style={{
              marginTop: 18,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              className="rx-milestone-title"
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: T.gold,
                letterSpacing: "0.14em",
                textShadow: `0 0 16px ${T.gold}55`,
                padding: "4px 14px",
                borderRadius: 4,
                backgroundColor: `${T.gold}14`,
                border: `1px solid ${T.gold}44`,
              }}
            >
              RECLAIMED
            </span>
            <span style={{ fontSize: 12, color: T.text2 }}>
              Codes reconnected — ownership return verified & authorized.
            </span>
          </div>
        ) : (
          <div style={{ marginTop: 16 }}>
            <span
              style={{
                fontSize: 10,
                fontFamily: T.mono,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: T.muted,
                padding: "3px 8px",
                borderRadius: 4,
                backgroundColor: T.surface3,
              }}
            >
              READY TO RETURN
            </span>
            <div style={{ marginTop: 8, color: T.muted, fontSize: 11 }}>
              Both parties must confirm receipt on their devices to merge the
              code.
            </div>
          </div>
        )}
      </div>

      {/* Confirmation triggers */}
      {!merged ? (
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={handleFinderToggle}
            className="rx-btn-secondary"
            style={{
              flex: 1,
              background: finderConfirmed ? `${T.accent2}18` : T.surface2,
              border: `1px solid ${finderConfirmed ? T.accent2 : T.border}`,
              color: finderConfirmed ? T.accent2 : T.text2,
              fontSize: 12,
              fontWeight: 500,
              padding: "12px 16px",
              borderRadius: 7,
              cursor: "pointer",
              fontFamily: T.sans,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {finderConfirmed && <CheckIcon size={14} />}
            <span>
              {finderConfirmed ? "Finder Confirmed" : "Confirm as Finder"}
            </span>
          </button>

          <button
            onClick={handleOwnerToggle}
            className="rx-btn-secondary"
            style={{
              flex: 1,
              background: ownerConfirmed ? `${T.accent2}18` : T.surface2,
              border: `1px solid ${ownerConfirmed ? T.accent2 : T.border}`,
              color: ownerConfirmed ? T.accent2 : T.text2,
              fontSize: 12,
              fontWeight: 500,
              padding: "12px 16px",
              borderRadius: 7,
              cursor: "pointer",
              fontFamily: T.sans,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {ownerConfirmed && <CheckIcon size={14} />}
            <span>
              {ownerConfirmed ? "Claimant Confirmed" : "Confirm as Claimant"}
            </span>
          </button>
        </div>
      ) : (
        <MagneticButton
          variant="primary"
          dataCursor="claim"
          onClick={handleComplete}
          style={{
            width: "100%",
            padding: "13px 24px",
            borderRadius: 7,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <span>Complete Recovery & Seal Record</span>
          <ArrowRightIcon size={16} />
        </MagneticButton>
      )}
    </div>
  )
}
