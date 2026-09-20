import { useState, useEffect, useRef } from "react"
import { T } from "../tokens"

interface Stage {
  id: string
  title: string
  label: string
  stepNumber: string
  color: string
  description: string
  protocol: string
  metadata: string
}

const STAGES: Stage[] = [
  {
    id: "lost",
    title: "LOST",
    label: "Telemetry Ingestion",
    stepNumber: "01",
    color: T.accent, // Violet
    description:
      "Item signaled into the mesh. Distinctive serials and visual signatures are hashed into private clues.",
    protocol: "SHA-256 Clue Sealing",
    metadata: "Blind ingestion • Zero metadata leaks",
  },
  {
    id: "matched",
    title: "MATCHED",
    label: "Neural & Attribute Intersection",
    stepNumber: "02",
    color: T.accent, // Violet / Active
    description:
      "Deterministic feature overlap without revealing private clues. Confidence matrix hits threshold.",
    protocol: "Vector Similarity & Spatial Bounding",
    metadata: "89% Confidence threshold • Ephemeral link",
  },
  {
    id: "verified",
    title: "VERIFIED",
    label: "Zero-Knowledge Proof",
    stepNumber: "03",
    color: T.gold, // Gold #D6B36A
    description:
      "Claimant answers sealed challenge questions. Proof Locker verifies ownership before identity is shared.",
    protocol: "ZK-Proof Verification",
    metadata: "3/3 Cryptographic challenges confirmed",
  },
  {
    id: "reclaimed",
    title: "RECLAIMED",
    label: "Custody Resolution",
    stepNumber: "04",
    color: T.accent2, // Cyan #55C7D9
    description:
      "Direct handover code or campus safe locker unlocked. Complete recovery journey finalized.",
    protocol: "One-Time Handover Code (OTP)",
    metadata: "Custody transferred • Record archived",
  },
]

export function RecoveryJourneyPublic() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0.4)
  const [activeStage, setActiveStage] = useState<number>(2) // Default to VERIFIED to highlight gold

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // Progress from 0 to 1 as the section travels through viewport
      const totalDist = windowHeight + rect.height
      const currentDist = windowHeight - rect.top
      const rawProgress = Math.max(0, Math.min(1, currentDist / totalDist))

      setScrollProgress(rawProgress)

      // Map progress to active stage 0..3
      if (rawProgress < 0.25) setActiveStage(0)
      else if (rawProgress < 0.5) setActiveStage(1)
      else if (rawProgress < 0.75) setActiveStage(2)
      else setActiveStage(3)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        padding: "72px 0 96px",
      }}
    >
      {/* Header with display typography */}
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: T.gold,
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              backgroundColor: T.gold,
              boxShadow: `0 0 8px ${T.gold}`,
            }}
          />
          The Cryptographic Pipeline
        </div>
        <h2
          style={{
            fontFamily: T.displaySerif,
            fontSize: "clamp(32px, 4.5vw, 46px)",
            fontWeight: 400,
            letterSpacing: "0.02em",
            color: T.text,
            margin: "0 0 16px",
            lineHeight: 1.15,
          }}
        >
          From loss to certainty.
        </h2>
        <p
          style={{
            fontSize: 15,
            color: T.text2,
            maxWidth: 580,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          A transparent, four-stage protocol engineered so ownership is
          mathematically proven before property changes hands.
        </p>
      </div>

      {/* Interactive Horizontal Track (Desktop & Tablet) */}
      <div
        style={{
          position: "relative",
          maxWidth: 1040,
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* Background Inactive Connecting Line */}
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 56,
            right: 56,
            height: 1,
            backgroundColor: `${T.border}88`,
            zIndex: 1,
          }}
        />

        {/* Progressively Illuminating Connecting Line */}
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 56,
            width: `calc((100% - 112px) * ${Math.min(1, scrollProgress * 1.3)})`,
            height: 2,
            background: `linear-gradient(to right, ${T.accent}, ${T.accent}, ${T.gold} 70%, ${T.accent2})`,
            boxShadow: `0 0 10px ${activeStage >= 2 ? T.gold : T.accent}66`,
            zIndex: 2,
            transition: "width 250ms ease-out",
          }}
        />

        {/* 4 Stages Grid */}
        <div
          style={{
            position: "relative",
            zIndex: 3,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
          }}
        >
          {STAGES.map((stage, idx) => {
            const isCurrent = activeStage === idx
            const isPassed = activeStage >= idx
            const isGold = stage.id === "verified"

            return (
              <div
                key={stage.id}
                onClick={() => setActiveStage(idx)}
                style={{
                  position: "relative",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                {/* Node with Ring */}
                <div
                  style={{
                    width: 48,
                    height: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                    position: "relative",
                  }}
                >
                  {/* Subtle Pulse Ring on Current Stage */}
                  {isCurrent && (
                    <div
                      style={{
                        position: "absolute",
                        inset: -4,
                        borderRadius: "50%",
                        border: `1px solid ${stage.color}66`,
                        animation: "rx-glow-pulse 2s infinite ease-in-out",
                      }}
                    />
                  )}

                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      backgroundColor: isPassed ? T.surface2 : T.surface,
                      border: `1.5px solid ${
                        isPassed ? stage.color : T.border
                      }`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: isCurrent
                        ? `0 0 14px ${stage.color}88`
                        : "none",
                      transition: "all 200ms ease",
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: isPassed ? stage.color : "transparent",
                        transition: "background-color 200ms ease",
                      }}
                    />
                  </div>
                </div>

                {/* Card Body */}
                <div
                  className="rx-card-interactive"
                  style={{
                    width: "100%",
                    padding: "20px 18px",
                    borderRadius: 10,
                    backgroundColor: isCurrent ? T.surface2 : T.surface,
                    border: `1px solid ${
                      isCurrent
                        ? isGold
                          ? `${T.gold}55`
                          : `${stage.color}44`
                        : `${T.border}`
                    }`,
                    boxShadow: isCurrent
                      ? `0 8px 24px rgba(0,0,0,0.35)`
                      : "none",
                    position: "relative",
                  }}
                >
                  {/* Stage Step Number */}
                  <div
                    style={{
                      fontFamily: T.mono,
                      fontSize: 10,
                      color: isPassed ? stage.color : T.muted,
                      letterSpacing: "0.1em",
                      marginBottom: 6,
                    }}
                  >
                    STAGE {stage.stepNumber}
                  </div>

                  {/* Title in Stranger Things-inspired Cinematic Serif */}
                  <div
                    style={{
                      fontFamily: T.cinzel,
                      fontSize: 18,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: isGold ? T.gold : isCurrent ? T.text : T.text2,
                      marginBottom: 4,
                      textShadow: isGold ? `0 0 12px ${T.gold}44` : "none",
                    }}
                  >
                    {stage.title}
                  </div>

                  {/* Label */}
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: T.text2,
                      marginBottom: 10,
                    }}
                  >
                    {stage.label}
                  </div>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: 12,
                      lineHeight: 1.55,
                      color: T.muted,
                      margin: "0 0 12px",
                    }}
                  >
                    {stage.description}
                  </p>

                  {/* Protocol metadata */}
                  <div
                    style={{
                      borderTop: `1px solid ${T.border}66`,
                      paddingTop: 10,
                      fontSize: 11,
                      fontFamily: T.mono,
                      color: isPassed ? (isGold ? T.gold : T.text2) : T.muted,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        backgroundColor: isPassed ? stage.color : T.muted,
                      }}
                    />
                    {stage.protocol}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
