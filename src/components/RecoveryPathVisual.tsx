import { useEffect, useRef, useState } from "react"
import { T } from "../tokens"

interface RecoveryPathVisualProps {
  scrollY?: number
  reducedMotion?: boolean
}

export function RecoveryPathVisual({ scrollY = 0, reducedMotion = false }: RecoveryPathVisualProps) {
  const [phase, setPhase] = useState(0)
  const rafRef = useRef<number>(0)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    if (reducedMotion) { setPhase(1); return }
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current
      setPhase(Math.min(1, elapsed / 1800))
      if (elapsed < 1800) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [reducedMotion])

  const bgShift = reducedMotion ? 0 : scrollY * 0.025
  const pathShift = reducedMotion ? 0 : scrollY * 0.045
  const fgShift = reducedMotion ? 0 : scrollY * 0.06

  const pathALen = 520
  const pathBLen = 500
  const pathOutLen = 300

  const dashOffsetA = pathALen * (1 - phase)
  const dashOffsetB = pathBLen * (1 - phase)
  const dashOffsetOut = pathOutLen * (1 - Math.max(0, (phase - 0.55) / 0.45))
  const outOpacity = Math.max(0, (phase - 0.55) / 0.45)

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", pointerEvents: "none" }}>
      <div style={{
        position: "absolute", inset: 0,
        transform: `translateY(${bgShift}px)`,
        background: `radial-gradient(ellipse 70% 60% at 30% 60%, ${T.accent}0D 0%, transparent 65%), radial-gradient(ellipse 55% 50% at 85% 40%, ${T.accent2}09 0%, transparent 60%), radial-gradient(ellipse 45% 35% at 60% 80%, ${T.gold}06 0%, transparent 50%)`,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        transform: `translateY(${pathShift * 0.6}px)`,
        opacity: 0.06,
        backgroundImage: `linear-gradient(to right, ${T.border} 1px, transparent 1px), linear-gradient(to bottom, ${T.border} 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
        pointerEvents: "none",
      }} />
      <svg
        viewBox="0 0 520 580" fill="none"
        preserveAspectRatio="xMidYMid meet"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: `translateY(${pathShift}px)`, transition: reducedMotion ? "none" : "transform 80ms linear" }}
      >
        <defs>
          <linearGradient id="rpv-gradA" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={T.accent} stopOpacity="0.15" />
            <stop offset="55%" stopColor={T.accent} stopOpacity="0.7" />
            <stop offset="80%" stopColor={T.gold} stopOpacity="0.9" />
            <stop offset="100%" stopColor={T.gold} stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="rpv-gradB" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={T.accent2} stopOpacity="0.12" />
            <stop offset="50%" stopColor={T.accent2} stopOpacity="0.65" />
            <stop offset="78%" stopColor={T.gold} stopOpacity="0.85" />
            <stop offset="100%" stopColor={T.gold} stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="rpv-gradOut" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor={T.gold} stopOpacity="0.8" />
            <stop offset="60%" stopColor={T.accent2} stopOpacity="0.6" />
            <stop offset="100%" stopColor={T.accent2} stopOpacity="0.1" />
          </linearGradient>
          <filter id="rpv-x-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <clipPath id="rpv-clip">
            <rect x="0" y="0" width="520" height="580" />
          </clipPath>
        </defs>
        <g clipPath="url(#rpv-clip)">
          <path d="M 40 80 C 100 130, 180 200, 290 295" stroke={T.accent} strokeWidth="1" strokeDasharray="4 6" strokeOpacity="0.15" strokeLinecap="round" />
          <path d="M 40 80 C 100 130, 180 200, 290 295" stroke="url(#rpv-gradA)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray={pathALen} strokeDashoffset={dashOffsetA} />
          <path d="M 50 500 C 110 450, 200 380, 290 295" stroke={T.accent2} strokeWidth="1" strokeDasharray="4 6" strokeOpacity="0.12" strokeLinecap="round" />
          <path d="M 50 500 C 110 450, 200 380, 290 295" stroke="url(#rpv-gradB)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray={pathBLen} strokeDashoffset={dashOffsetB} />
          <path d="M 290 295 C 370 230, 430 160, 490 100" stroke="url(#rpv-gradOut)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray={pathOutLen} strokeDashoffset={dashOffsetOut} />
          <path d="M 290 295 C 370 360, 430 420, 490 470" stroke="url(#rpv-gradOut)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray={pathOutLen} strokeDashoffset={dashOffsetOut} />
          <circle cx="120" cy="155" r="2.5" fill={T.accent} fillOpacity={phase * 0.7} />
          <circle cx="120" cy="155" r="6" stroke={T.accent} strokeWidth="0.5" strokeOpacity={phase * 0.2} fill="none" />
          <circle cx="200" cy="220" r="3" fill={T.accent} fillOpacity={phase * 0.85} />
          <circle cx="115" cy="455" r="2.5" fill={T.accent2} fillOpacity={phase * 0.7} />
          <circle cx="115" cy="455" r="6" stroke={T.accent2} strokeWidth="0.5" strokeOpacity={phase * 0.18} fill="none" />
          <circle cx="205" cy="370" r="3" fill={T.accent2} fillOpacity={phase * 0.82} />
          <circle cx="290" cy="295" r="32" stroke={T.gold} strokeWidth="0.5" strokeOpacity={phase * 0.18} fill="none" strokeDasharray="3 5" />
          <circle cx="290" cy="295" r="20" stroke={T.gold} strokeWidth="0.75" strokeOpacity={phase * 0.32} fill="none" />
          <circle cx="290" cy="295" r="7" fill={T.gold} fillOpacity={phase * 0.9} filter="url(#rpv-x-glow)">
            {!reducedMotion && (
              <>
                <animate attributeName="r" values="6;8.5;6" dur="3.5s" repeatCount="indefinite" />
                <animate attributeName="fill-opacity" values={`${phase * 0.7};${phase};${phase * 0.7}`} dur="3.5s" repeatCount="indefinite" />
              </>
            )}
          </circle>
          <line x1="278" y1="283" x2="302" y2="307" stroke={T.gold} strokeWidth="1.5" strokeOpacity={phase * 0.8} strokeLinecap="round" />
          <line x1="302" y1="283" x2="278" y2="307" stroke={T.gold} strokeWidth="1.5" strokeOpacity={phase * 0.8} strokeLinecap="round" />
          <circle cx="420" cy="165" r="3" fill={T.gold} fillOpacity={outOpacity * 0.8} />
          <circle cx="420" cy="165" r="8" stroke={T.gold} strokeWidth="0.5" strokeOpacity={outOpacity * 0.2} fill="none" />
          <circle cx="420" cy="415" r="3" fill={T.accent2} fillOpacity={outOpacity * 0.8} />
          <circle cx="420" cy="415" r="8" stroke={T.accent2} strokeWidth="0.5" strokeOpacity={outOpacity * 0.2} fill="none" />
        </g>
      </svg>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${fgShift}px)`, transition: reducedMotion ? "none" : "transform 80ms linear", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "12%", left: "5%", opacity: phase, transition: reducedMotion ? "none" : "opacity 0.6s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: T.accent }} />
            <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: T.accent, fontWeight: 600 }}>LOST</span>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, letterSpacing: "0.08em" }}>SIGNAL ACTIVE</div>
        </div>
        <div style={{ position: "absolute", bottom: "13%", left: "5%", opacity: phase, transition: reducedMotion ? "none" : "opacity 0.6s ease 0.3s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: T.accent2 }} />
            <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: T.accent2, fontWeight: 600 }}>FOUND</span>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, letterSpacing: "0.08em" }}>PROOF SEALED</div>
        </div>
        <div style={{ position: "absolute", top: "43%", left: "38%", transform: "translateY(-50%)", opacity: phase * 0.85, transition: reducedMotion ? "none" : "opacity 0.6s ease 0.6s" }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: T.gold, fontWeight: 600, marginBottom: 2 }}>MATCHED</div>
          <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, letterSpacing: "0.06em" }}>88% CONFIDENCE</div>
        </div>
        <div style={{ position: "absolute", top: "16%", right: "4%", opacity: outOpacity, transition: reducedMotion ? "none" : "opacity 0.6s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: T.gold }} />
            <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: T.gold, fontWeight: 600 }}>VERIFIED</span>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, letterSpacing: "0.08em" }}>ZK-PROOF PASSED</div>
        </div>
        <div style={{ position: "absolute", bottom: "18%", right: "4%", opacity: outOpacity, transition: reducedMotion ? "none" : "opacity 0.6s ease 0.2s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: T.accent2 }} />
            <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: T.accent2, fontWeight: 600 }}>RECLAIMED</span>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, letterSpacing: "0.08em" }}>HANDOVER COMPLETE</div>
        </div>
        <div style={{ position: "absolute", top: "43%", left: "56%", transform: "translateY(-50%)", opacity: phase * 0.6, transition: reducedMotion ? "none" : "opacity 0.8s ease 0.8s" }}>
          <div style={{ fontFamily: T.mono, fontSize: 8, color: T.gold, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>PRIVATE PROOF</div>
        </div>
      </div>
    </div>
  )
}
