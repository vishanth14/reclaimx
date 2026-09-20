import { useEffect, useState } from "react"
import { T } from "../tokens"

export function HeroBackgroundPaths() {
  const [scrollY, setScrollY] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mq.matches)

    const handleScroll = () => {
      // Calculate subtle scroll offset clamped to max 10px displacement
      const sy = window.scrollY
      setScrollY(sy)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Parallax displacement factors (Background: 0.92 movement, Path: 0.97 movement)
  // Max displacement ~6-10px as requested
  const bgOffsetY = reducedMotion
    ? 0
    : Math.min(10, Math.max(-10, scrollY * 0.04))
  const pathOffsetY = reducedMotion
    ? 0
    : Math.min(8, Math.max(-8, scrollY * 0.02))

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {/* Background Gradient Mesh (Layer 1 - deep ambient) */}
      <div
        style={{
          position: "absolute",
          inset: "-5%",
          transform: `translate3d(0, ${bgOffsetY}px, 0)`,
          transition: reducedMotion ? "none" : "transform 100ms linear",
          background: `
            radial-gradient(ellipse 65% 55% at 50% 20%, ${T.accent}12 0%, transparent 70%),
            radial-gradient(ellipse 50% 45% at 85% 65%, ${T.accent2}0A 0%, transparent 65%),
            radial-gradient(ellipse 40% 40% at 15% 75%, ${T.gold}08 0%, transparent 60%),
            #090B0F
          `,
        }}
      />

      {/* Subtle Grain Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.028,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* SVG Abstract Recovery Paths (Layer 2 - Reconnecting paths) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate3d(0, ${pathOffsetY}px, 0)`,
          transition: reducedMotion ? "none" : "transform 100ms linear",
        }}
      >
        <svg
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          style={{
            width: "100%",
            height: "100%",
            opacity: 0.85,
          }}
        >
          <defs>
            <linearGradient id="pathGradA" x1="0%" y1="20%" x2="100%" y2="80%">
              <stop offset="0%" stopColor={T.accent} stopOpacity="0.05" />
              <stop offset="45%" stopColor={T.accent} stopOpacity="0.35" />
              <stop offset="68%" stopColor={T.gold} stopOpacity="0.6" />
              <stop offset="100%" stopColor={T.accent2} stopOpacity="0.15" />
            </linearGradient>

            <linearGradient id="pathGradB" x1="100%" y1="10%" x2="0%" y2="90%">
              <stop offset="0%" stopColor={T.accent2} stopOpacity="0.05" />
              <stop offset="50%" stopColor={T.accent2} stopOpacity="0.3" />
              <stop offset="68%" stopColor={T.gold} stopOpacity="0.65" />
              <stop offset="100%" stopColor={T.accent} stopOpacity="0.1" />
            </linearGradient>

            <filter
              id="subtleGlow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Path 1: Lost Item Journey (Drifting from top left toward center convergence) */}
          <path
            d="M 120 180 C 340 220, 520 440, 720 450 C 920 460, 1100 320, 1340 380"
            stroke="url(#pathGradA)"
            strokeWidth="1.2"
            strokeDasharray="6 8"
            strokeLinecap="round"
            className="anim-stagger-path"
          />

          {/* Path 2: Finder Journey (Drifting from bottom right and converging at central reconciliation) */}
          <path
            d="M 100 680 C 380 620, 560 480, 720 450 C 880 420, 1080 580, 1360 520"
            stroke="url(#pathGradB)"
            strokeWidth="1.4"
            strokeLinecap="round"
            className="anim-stagger-path"
          />

          {/* Subtle convergence junction ring */}
          <circle
            cx="720"
            cy="450"
            r="18"
            stroke={T.gold}
            strokeWidth="0.75"
            strokeOpacity="0.35"
            strokeDasharray="2 3"
          />

          {/* Convergence Node (Reconnection point) */}
          <circle
            cx="720"
            cy="450"
            r="4"
            fill={T.gold}
            filter="url(#subtleGlow)"
          >
            <animate
              attributeName="r"
              values="3.5; 5; 3.5"
              dur="4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6; 1; 0.6"
              dur="4s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Faint Auxiliary Nodes */}
          <circle cx="340" cy="220" r="2" fill={T.accent} fillOpacity="0.4" />
          <circle cx="520" cy="440" r="2.5" fill={T.accent} fillOpacity="0.6" />
          <circle
            cx="560"
            cy="480"
            r="2.5"
            fill={T.accent2}
            fillOpacity="0.6"
          />
          <circle
            cx="920"
            cy="460"
            r="2.5"
            fill={T.accent2}
            fillOpacity="0.5"
          />
          <circle cx="1100" cy="320" r="2" fill={T.accent} fillOpacity="0.35" />
        </svg>
      </div>
    </div>
  )
}
