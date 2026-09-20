import { useEffect, useRef, useState } from "react"
import { T } from "../tokens"
import { ArrowRightIcon } from "../components/Icons"
import { MagneticButton } from "../components/MagneticButton"
import { AnimatedCounter } from "../components/AnimatedCounter"
import type { Screen } from "../App"
import { storageService } from "../services/storageService"
import { matchingService } from "../services/matchingService"
import type { Item } from "../types/items"

interface ActivityItem {
  id: string
  type: string
  status: string
  loc: string
  time: string
  color: string
  targetScreen: Screen
  originalItemId?: string
  originalClaimId?: string
}

const journeySteps = [
  { label: "Lost", color: T.muted },
  { label: "Matched", color: T.accent },
  { label: "Verified", color: "#F0A86B" },
  { label: "Reclaimed", color: T.accent2 },
]

// Active stage index for demo — "Matched" is the current live stage
const ACTIVE_STAGE = 1

export function Home({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const parallaxBgRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const [journeyFillProgress, setJourneyFillProgress] = useState(0)
  const [stats, setStats] = useState({
    potentialMatches: 0,
    openClaims: 0,
    itemsReclaimed: 0,
    proofSealed: 0,
  })
  const [activityList, setActivityList] = useState<ActivityItem[]>([])

  const [reducedMotion] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  )
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  useEffect(() => {
    const currentUser = storageService.getCurrentUser()
    const allItems = storageService.getItems()
    const allClaims = storageService.getClaims()
    const allProofLockers = storageService.getProofLockers()

    // Filter strictly for current user records (never count seeded demo data in personal stats)
    const userItems = allItems.filter(
      (i) => !i.isDemo && i.userId === currentUser.id,
    )
    const userClaims = allClaims.filter(
      (c) =>
        !c.isDemo &&
        (c.claimantId === currentUser.id || c.finderId === currentUser.id),
    )
    const userProofLockers = Object.values(allProofLockers).filter(
      (l) => !l.isDemo,
    )

    // Potential matches: only for the current user's active lost items
    const userLostItems = userItems.filter(
      (i) => i.type === "lost" && i.status !== "reclaimed",
    )
    let totalMatches = 0
    userLostItems.forEach((item) => {
      const m = matchingService.findMatchesForLost(item)
      totalMatches += m.length
    })

    const openClaims = userClaims.filter(
      (c) => c.status !== "completed" && c.status !== "rejected",
    ).length
    const itemsReclaimed = userItems.filter((i) => i.status === "reclaimed").length
    const proofSealed = userProofLockers.length

    setStats({
      potentialMatches: totalMatches,
      openClaims,
      itemsReclaimed,
      proofSealed,
    })

    const userActivity: ActivityItem[] = []

    userItems.forEach((it) => {
      let status = "Searching"
      let color: string = T.muted
      let targetScreen: Screen = "item-detail"

      if (it.status === "reclaimed") {
        status = "Reclaimed"
        color = T.accent2
        targetScreen = "reclaimed"
      } else if (it.type === "lost") {
        const matches = matchingService.findMatchesForLost(it)
        if (matches.length > 0) {
          status = "Potential Match"
          color = T.accent
          targetScreen = "matching"
        }
      } else if (it.type === "found") {
        const c = userClaims.find((cl) => cl.foundItemId === it.id)
        if (c?.status === "handover_ready" || c?.status === "verified") {
          status = "Verified"
          color = "#F0A86B"
          targetScreen = "handover"
        }
      }

      userActivity.push({
        id: it.id,
        type: it.title,
        status,
        loc: it.location,
        time: it.date || "Today",
        color,
        targetScreen,
        originalItemId: it.id,
      })
    })

    userClaims.forEach((c) => {
      const foundItem = storageService.getItemById(c.foundItemId)
      let status = "Verification"
      let color: string = "#F0A86B"
      let targetScreen: Screen = "verify"

      if (c.status === "completed") {
        status = "Reclaimed"
        color = T.accent2
        targetScreen = "reclaimed"
      } else if (c.status === "handover_ready" || c.status === "verified") {
        status = "Handover Ready"
        color = T.accent2
        targetScreen = "handover"
      }

      userActivity.push({
        id: c.id,
        type: foundItem?.title || "Claimed Item",
        status,
        loc: foundItem?.location || "Campus",
        time: "Recent",
        color,
        targetScreen,
        originalClaimId: c.id,
        originalItemId: foundItem?.id,
      })
    })

    setActivityList(userActivity.slice(0, 5))
  }, [])

  // Moment 1: Connecting line between stages fills over ~500ms when milestone is reached
  useEffect(() => {
    const timer = setTimeout(() => {
      setJourneyFillProgress(1)
    }, 250)
    return () => clearTimeout(timer)
  }, [])

  // Parallax: ONLY on the journey strip bg layer, only on Home, not on mobile
  useEffect(() => {
    if (reducedMotion || isMobile) return
    const scrollEl = document.getElementById("rx-scroll")
    if (!scrollEl || !parallaxBgRef.current || !sectionRef.current) return

    let ticking = false

    function onScroll() {
      if (!ticking) {
        rafRef.current = requestAnimationFrame(() => {
          if (!parallaxBgRef.current || !sectionRef.current) {
            ticking = false
            return
          }
          const scrollTop = scrollEl!.scrollTop
          const sectionTop = sectionRef.current.offsetTop
          const relativeScroll = scrollTop - sectionTop
          // bg layer moves at 0.92x (drifts 8% behind foreground, clamped strictly to +/- 8px)
          const offset = Math.max(-8, Math.min(8, relativeScroll * -0.08))
          parallaxBgRef.current.style.transform = `translateY(${offset}px)`
          ticking = false
        })
        ticking = true
      }
    }

    scrollEl.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      scrollEl.removeEventListener("scroll", onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [reducedMotion, isMobile])

  return (
    <div style={{ padding: "40px 48px", maxWidth: 780 }}>
      {/* Eyebrow */}
      <div
        style={{
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: T.muted,
          marginBottom: 20,
        }}
      >
        Smart Recovery Network
      </div>

      {/* Headline */}
      <h1
        style={{
          fontSize: "clamp(32px, 3.5vw, 48px)",
          fontWeight: 600,
          letterSpacing: "-0.025em",
          color: T.text,
          lineHeight: 1.05,
          margin: "0 0 14px",
        }}
      >
        Lost isn't the end.
      </h1>
      <p
        style={{
          fontSize: 15,
          color: T.text2,
          lineHeight: 1.7,
          maxWidth: 520,
          margin: "0 0 36px",
        }}
      >
        ReclaimX connects lost things with the people who found them — then
        verifies ownership before they change hands.
      </p>

      {/* CTAs with Magnetic Buttons */}
      <div
        style={{ display: "flex", gap: 12, marginBottom: 36, flexWrap: "wrap" }}
      >
        <MagneticButton
          onClick={() => onNavigate("report-lost")}
          dataCursor="report"
          className="rx-btn-primary rx-cta"
          style={{
            background: T.accent,
            border: "none",
            color: "#fff",
            fontSize: 13,
            fontWeight: 500,
            padding: "11px 22px",
            borderRadius: 7,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            boxShadow: `0 2px 10px ${T.accent}33`,
          }}
        >
          <span>Report Lost Item</span>
          <ArrowRightIcon size={14} />
        </MagneticButton>
        <MagneticButton
          onClick={() => onNavigate("report-found")}
          dataCursor="hover"
          className="rx-btn-secondary"
          style={{
            background: T.surface2,
            border: `1px solid ${T.border}`,
            color: T.text2,
            fontSize: 13,
            padding: "11px 22px",
            borderRadius: 7,
            cursor: "pointer",
          }}
        >
          I Found Something
        </MagneticButton>
      </div>

      {/* Recovery Telemetry Stats with AnimatedCounter */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 12,
          marginBottom: 44,
        }}
      >
        {[
          { label: "Potential Matches", val: stats.potentialMatches, prefix: "", suffix: "", decimals: 0 },
          { label: "Open Claims", val: stats.openClaims, prefix: "", suffix: "", decimals: 0 },
          { label: "Items Reclaimed", val: stats.itemsReclaimed, prefix: "", suffix: "", decimals: 0 },
          { label: "Proof Locker Records", val: stats.proofSealed, prefix: "", suffix: "", decimals: 0 },
        ].map((stat, idx) => (
          <div
            key={stat.label}
            className={`rx-stagger-item rx-delay-${idx + 1}`}
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                fontFamily: T.mono,
                fontSize: 20,
                fontWeight: 600,
                color: idx === 1 ? T.accent2 : idx === 3 ? T.gold : T.text,
                marginBottom: 2,
              }}
            >
              <AnimatedCounter
                to={stat.val}
                decimals={stat.decimals || 0}
                suffix={stat.suffix}
                prefix={stat.prefix}
              />
            </div>
            <div style={{ fontSize: 11, color: T.muted }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Journey strip — with 500ms line fill & parallax background */}
      <div
        ref={sectionRef}
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 10,
          marginBottom: 52,
        }}
      >
        {/* Parallax bg layer — drifts at 0.92x scroll */}
        <div
          ref={parallaxBgRef}
          aria-hidden
          style={{
            position: "absolute",
            inset: "-10px",
            background: `radial-gradient(ellipse at 20% 50%, ${T.accent}0a 0%, transparent 60%),
                         radial-gradient(ellipse at 80% 50%, ${T.accent2}08 0%, transparent 60%)`,
            willChange: "transform",
            pointerEvents: "none",
          }}
        />

        {/* Foreground journey content */}
        <div
          style={{
            position: "relative",
            padding: "20px 0",
            display: "flex",
            alignItems: "center",
            gap: 0,
          }}
        >
          {journeySteps.map((step, i) => {
            const isActive = i === ACTIVE_STAGE
            return (
              <div
                key={step.label}
                style={{ display: "flex", alignItems: "center" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: step.color,
                      // Imperceptible pulse (90-100%) only on active stage marker
                      animation:
                        isActive && !reducedMotion
                          ? "journey-dot-pulse 3s ease-in-out infinite"
                          : "none",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      color: step.color,
                    }}
                  >
                    {step.label}
                  </span>
                </div>
                {i < journeySteps.length - 1 && (
                  <div
                    style={{
                      width: 32,
                      height: 1,
                      background: T.border,
                      margin: "0 10px",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* 500ms smooth fill line */}
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: i < journeyFillProgress ? "100%" : "0%",
                        background: T.accent,
                        transition:
                          "width 500ms cubic-bezier(0.22, 1, 0.36, 1)",
                      }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <style>{`
          @keyframes journey-dot-pulse {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.90; }
          }
          @media (prefers-reduced-motion: reduce) {
            @keyframes journey-dot-pulse { 0%, 100% { opacity: 1; } }
          }
        `}</style>
      </div>

      {/* Recent Activity */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: T.muted,
            }}
          >
            Recent Activity
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: T.accent2,
                animation: "pulse-dot 2s infinite",
              }}
            />
            <span style={{ fontSize: 11, color: T.muted }}>Live</span>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${T.border}` }}>
          {activityList.length === 0 ? (
            <div
              style={{
                padding: "36px 16px",
                textAlign: "center",
                background: T.surface2,
                borderRadius: 8,
                border: `1px solid ${T.border}`,
                marginTop: 14,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: T.text,
                  fontWeight: 500,
                  marginBottom: 4,
                }}
              >
                No activity yet
              </div>
              <div style={{ fontSize: 11, color: T.muted }}>
                Reports you submit and active claims you initiate will appear here in real time.
              </div>
            </div>
          ) : (
            activityList.map((item, idx) => (
            <div
              key={item.id}
              data-cursor="view"
              className={`rx-row-interactive rx-interactive rx-stagger-item rx-delay-${Math.min(idx + 1, 8)}`}
              onClick={() => {
                if (item.originalItemId) {
                  localStorage.setItem("reclaimx_active_item_id", item.originalItemId)
                  localStorage.setItem("reclaimx_active_found_id", item.originalItemId)
                  localStorage.setItem("reclaimx_active_lost_id", item.originalItemId)
                }
                if (item.originalClaimId) {
                  localStorage.setItem("reclaimx_active_claim_id", item.originalClaimId)
                }
                onNavigate(item.targetScreen)
              }}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 16,
                alignItems: "center",
                padding: "14px 8px",
                borderBottom: `1px solid ${T.border}`,
                cursor: "pointer",
                borderRadius: 6,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 3,
                  }}
                >
                  <span
                    style={{ fontSize: 13, fontWeight: 500, color: T.text }}
                  >
                    {item.type}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: item.color,
                      padding: "2px 6px",
                      border: `1px solid ${item.color}44`,
                      borderRadius: 3,
                      background: `${item.color}14`,
                    }}
                  >
                    {item.status}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <span
                    style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}
                  >
                    {item.id}
                  </span>
                  <span style={{ fontSize: 11, color: T.border }}>·</span>
                  <span style={{ fontSize: 11, color: T.muted }}>
                    {item.loc}
                  </span>
                </div>
              </div>
              <span
                style={{ fontSize: 11, color: T.muted, whiteSpace: "nowrap" }}
              >
                {item.time}
              </span>
            </div>
          )))}
        </div>
      </div>
    </div>
  )
}
