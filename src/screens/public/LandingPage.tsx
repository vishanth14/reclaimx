import { useState, useEffect, useRef } from "react"
import { T } from "../../tokens"
import { LogoMark } from "../../components/LogoMark"
import { HeroBackgroundPaths } from "../../components/HeroBackgroundPaths"
import { RecoveryJourneyPublic } from "../../components/RecoveryJourneyPublic"
import { RecoveryPathVisual } from "../../components/RecoveryPathVisual"
import { MagneticButton } from "../../components/MagneticButton"
import {
  ArrowRightIcon,
  LockIcon,
  CheckIcon,
} from "../../components/Icons"

interface LandingPageProps {
  onNavigate: (route: string) => void
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [scrollY, setScrollY] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [reducedMotion] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  )
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const sy = window.scrollY
      setScrollY(sy)
      setScrolled(sy > 40)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const headlineParallax = reducedMotion ? 0 : Math.min(scrollY * 0.06, 24)
  const visualParallax = reducedMotion ? 0 : Math.min(scrollY * 0.03, 12)

  const sampleItems = [
    {
      title: "Matte Black Aer Travel Pack",
      location: "Gates CS · 2nd Floor Lounge",
      category: "Backpacks",
      status: "RECLAIMED",
      statusColor: T.accent2,
      proofHash: "0x8F4A...B92D",
      time: "Recovered 2h ago",
      verifiedDetails: "Unique internal zipper carabiner matched owner proof",
    },
    {
      title: "Bose QuietComfort 45",
      location: "Green Library · Wing B",
      category: "Electronics",
      status: "VERIFIED",
      statusColor: T.gold,
      proofHash: "0x3C11...7E40",
      time: "Awaiting Pickup",
      verifiedDetails: "Bluetooth MAC prefix and scratch on right hinge verified",
    },
    {
      title: "Solid Brass Keyring",
      location: "Tressider Memorial Union",
      category: "Keys",
      status: "MATCHED",
      statusColor: T.accent,
      proofHash: "0x91D0...4A82",
      time: "Matching in progress",
      verifiedDetails: "Distinctive engraved initial sealed in proof locker",
    },
    {
      title: "TI-84 Plus CE Calculator",
      location: "Hewlett Teaching Center · 200",
      category: "Calculators",
      status: "RECLAIMED",
      statusColor: T.accent2,
      proofHash: "0x5E08...1C39",
      time: "Recovered yesterday",
      verifiedDetails: "Custom engraved initials on battery panel verified",
    },
  ]

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: T.bg,
        color: T.text,
        fontFamily: T.sans,
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @keyframes rx-line-reveal {
          from { clip-path: inset(0 0 100% 0); transform: translateY(18px); opacity: 0; }
          to   { clip-path: inset(0 0 0% 0); transform: translateY(0); opacity: 1; }
        }
        .rx-line-reveal { animation: rx-line-reveal 0.75s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .rx-lra { animation-delay: 0.15s; }
        .rx-lrb { animation-delay: 0.32s; }
        .rx-lrc { animation-delay: 0.48s; }
        @keyframes rx-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rx-fu1 { animation: rx-fade-up 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both; }
        .rx-fu2 { animation: rx-fade-up 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.65s both; }
        .rx-fu3 { animation: rx-fade-up 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.85s both; }
        .rx-fu4 { animation: rx-fade-up 0.65s cubic-bezier(0.16, 1, 0.3, 1) 1.05s both; }
        @keyframes rx-visual-in {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .rx-visual-in { animation: rx-visual-in 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both; }
        @keyframes rx-stage-r {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rx-stage-item { opacity: 0; }
        .rx-stage-item.visible { animation: rx-stage-r 0.55s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .rx-feed-card {
          transition: background 220ms ease, border-color 220ms ease, transform 220ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .rx-feed-card:hover { transform: translateY(-2px); }
        @keyframes rx-glow-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.08); }
        }
        @media (prefers-reduced-motion: reduce) {
          .rx-line-reveal, .rx-fu1, .rx-fu2, .rx-fu3, .rx-fu4, .rx-visual-in, .rx-stage-item.visible {
            animation: none !important; opacity: 1 !important; transform: none !important; clip-path: none !important;
          }
        }
      `}</style>

      {/* Background */}
      <HeroBackgroundPaths />

      {/* ── NAVIGATION ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          width: "100%",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          backgroundColor: scrolled ? "rgba(9,11,15,0.92)" : "rgba(9,11,15,0.65)",
          borderBottom: `1px solid ${scrolled ? T.border : T.border + "55"}`,
          transition: "background 200ms ease, border-color 200ms ease",
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "0 32px",
            height: scrolled ? 52 : 62,
            transition: "height 300ms cubic-bezier(0.16,1,0.3,1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            onClick={() => onNavigate("/")}
            className="rx-interactive rx-fu1"
            style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
          >
            <LogoMark size={26} />
            <span
              className="rx-wordmark"
              style={{ fontSize: 16, fontWeight: 800, letterSpacing: "0.16em", color: T.text }}
            >
              RECLAIMX
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => onNavigate("/login")}
              className="rx-link rx-interactive"
              style={{
                background: "none",
                border: "none",
                color: T.text2,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                padding: "8px 14px",
              }}
            >
              Sign In
            </button>
            <MagneticButton
              onClick={() => onNavigate("/signup")}
              dataCursor="cta"
              className="rx-btn-primary"
              style={{
                background: T.accent,
                color: "#FFF",
                border: `1px solid ${T.accent}`,
                borderRadius: 7,
                padding: "8px 18px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Get Started
              <ArrowRightIcon size={13} />
            </MagneticButton>
          </div>
        </div>
      </header>

      {/* ── HERO — ASYMMETRIC EDITORIAL ── */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          zIndex: 10,
          minHeight: "calc(100vh - 62px)",
          display: "flex",
          alignItems: "stretch",
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0 32px",
        }}
      >
        {/* LEFT COLUMN 58% */}
        <div
          style={{
            flex: "0 0 58%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: 80,
            paddingBottom: 80,
            paddingRight: 48,
            transform: `translateY(-${headlineParallax}px)`,
            transition: reducedMotion ? "none" : "transform 100ms linear",
          }}
        >
          {/* Eyebrow */}
          <div
            className="rx-fu1"
            style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}
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
            <span
              style={{
                fontFamily: T.mono,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: T.gold,
              }}
            >
              Smart Recovery Network
            </span>
          </div>

          {/* Headline — stagger reveal */}
          <h1
            className="rx-retro-display"
            style={{
              fontSize: "clamp(60px, 7.5vw, 96px)",
              fontWeight: 700,
              lineHeight: 0.96,
              letterSpacing: "-0.02em",
              color: T.text,
              margin: "0 0 32px",
              textShadow: "0 0 60px rgba(118,87,255,0.18), 0 2px 24px rgba(0,0,0,0.8)",
            }}
          >
            <span className="rx-line-reveal rx-lra" style={{ display: "block" }}>
              LOST
            </span>
            <span className="rx-line-reveal rx-lrb" style={{ display: "block" }}>
              {"ISN\u2019T"}
            </span>
            <span
              className="rx-line-reveal rx-lrc"
              style={{ display: "block", color: T.text2 }}
            >
              THE END.
            </span>
          </h1>

          {/* Description */}
          <p
            className="rx-fu2"
            style={{
              fontSize: "clamp(15px, 1.6vw, 17px)",
              lineHeight: 1.65,
              color: T.text2,
              maxWidth: 520,
              margin: "0 0 36px",
            }}
          >
            ReclaimX connects lost things with the people who found them
            {" \u2014 "}then verifies ownership before they change hands.
          </p>

          {/* CTAs */}
          <div
            className="rx-fu3"
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 14,
              marginBottom: 40,
            }}
          >
            <MagneticButton
              onClick={() => onNavigate("/signup")}
              dataCursor="cta"
              className="rx-btn-primary rx-cta"
              style={{
                background: T.accent,
                color: "#FFF",
                border: `1px solid ${T.accent}`,
                borderRadius: 8,
                padding: "13px 28px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: `0 4px 20px ${T.accent}38`,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Get Started
              <ArrowRightIcon size={15} />
            </MagneticButton>
            <MagneticButton
              onClick={() => onNavigate("/signup")}
              dataCursor="hover"
              className="rx-btn-secondary"
              style={{
                background: "transparent",
                color: T.text,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                padding: "13px 26px",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              I Found Something
            </MagneticButton>
          </div>

          {/* Tagline */}
          <div
            className="rx-fu4"
            style={{
              fontFamily: T.displaySerif,
              fontSize: 17,
              fontStyle: "italic",
              letterSpacing: "0.03em",
              color: T.gold,
              opacity: 0.85,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 32,
                height: 1,
                background: `linear-gradient(to right, ${T.gold}88, transparent)`,
              }}
            />
            Find it. Prove it. Reclaim it.
          </div>

          {/* Trust signals */}
          <div
            style={{
              marginTop: 56,
              paddingTop: 28,
              borderTop: `1px solid ${T.border}44`,
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
              alignItems: "center",
            }}
          >
            {[
              { label: "Privacy-first", sub: "No public serials" },
              { label: "Cryptographic proof", sub: "SHA-256 sealed" },
              { label: "Campus mesh", sub: "Live recovery net" },
            ].map((item) => (
              <div
                key={item.label}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <div
                  style={{
                    width: 1,
                    height: 28,
                    background: `linear-gradient(to bottom, transparent, ${T.border}, transparent)`,
                  }}
                />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: T.muted,
                      fontFamily: T.mono,
                      letterSpacing: "0.06em",
                    }}
                  >
                    {item.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN 42% — Recovery Visualization */}
        <div
          className="rx-visual-in"
          data-cursor="explore"
          style={{
            flex: "0 0 42%",
            position: "relative",
            transform: `translateY(-${visualParallax}px)`,
            transition: reducedMotion ? "none" : "transform 100ms linear",
            minHeight: 500,
          }}
        >
          {/* Vertical divider rule */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "15%",
              bottom: "15%",
              width: 1,
              background: `linear-gradient(to bottom, transparent, ${T.border}55, transparent)`,
            }}
          />

          <RecoveryPathVisual scrollY={scrollY} reducedMotion={reducedMotion} />

          {/* Floating item thumbnail: backpack */}
          <div
            data-cursor="view"
            style={{
              position: "absolute",
              bottom: "22%",
              left: "8%",
              width: 68,
              height: 68,
              borderRadius: 10,
              overflow: "hidden",
              border: `1px solid ${T.border}88`,
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              cursor: "pointer",
              transition: "transform 240ms cubic-bezier(0.16,1,0.3,1)",
              background: T.surface2,
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLElement).style.transform =
                "scale(1.06) rotate(-1deg)"
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.transform = "scale(1)"
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=140&q=80"
              alt="Lost backpack"
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>

          {/* Floating item thumbnail: earbuds */}
          <div
            data-cursor="view"
            style={{
              position: "absolute",
              top: "28%",
              left: "12%",
              width: 52,
              height: 52,
              borderRadius: 8,
              overflow: "hidden",
              border: `1px solid ${T.border}66`,
              boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
              cursor: "pointer",
              transition: "transform 240ms cubic-bezier(0.16,1,0.3,1)",
              background: T.surface2,
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLElement).style.transform = "scale(1.08)"
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.transform = "scale(1)"
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=120&q=80"
              alt="Wireless earbuds"
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        </div>
      </section>

      {/* Horizontal rule */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0 32px",
        }}
      >
        <div
          style={{
            height: 1,
            background: `linear-gradient(to right, transparent, ${T.border}55 20%, ${T.border}55 80%, transparent)`,
          }}
        />
      </div>

      {/* ── PIPELINE SECTION ── */}
      <section
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 1400,
          margin: "0 auto",
          padding: "96px 32px 80px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.5fr",
            gap: 48,
            alignItems: "flex-start",
            marginBottom: 72,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: T.mono,
                fontSize: 56,
                fontWeight: 700,
                color: T.surface3,
                lineHeight: 1,
                marginBottom: 12,
                letterSpacing: "-0.02em",
                userSelect: "none",
              }}
            >
              01
            </div>
            <div
              style={{
                fontFamily: T.mono,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: T.gold,
                marginBottom: 12,
              }}
            >
              The Recovery Pipeline
            </div>
            <div
              style={{
                width: 40,
                height: 1,
                background: `linear-gradient(to right, ${T.gold}, transparent)`,
              }}
            />
          </div>
          <div>
            <h2
              className="rx-retro-display"
              style={{
                fontSize: "clamp(36px, 4.5vw, 58px)",
                fontWeight: 700,
                lineHeight: 1.0,
                letterSpacing: "-0.02em",
                color: T.text,
                margin: "0 0 20px",
              }}
            >
              FROM LOSS
              <br />
              TO CERTAINTY.
            </h2>
            <p
              style={{
                fontSize: 15,
                color: T.text2,
                lineHeight: 1.65,
                maxWidth: 480,
                margin: 0,
              }}
            >
              A transparent four-stage protocol engineered so ownership is
              mathematically proven before property changes hands.
            </p>
          </div>
        </div>
        <PipelineStages />
      </section>

      {/* ── PROOF LOCKER SECTION ── */}
      <section
        style={{
          position: "relative",
          zIndex: 10,
          borderTop: `1px solid ${T.border}55`,
          backgroundColor: "rgba(15,18,23,0.5)",
        }}
      >
        <div
          style={{ maxWidth: 1400, margin: "0 auto", padding: "96px 32px" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 56,
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: 10,
                  color: T.gold,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    backgroundColor: T.gold,
                  }}
                />
                Privacy-First Ownership Verification
              </div>
              <h3
                style={{
                  fontFamily: T.displaySerif,
                  fontSize: "clamp(28px, 3.5vw, 40px)",
                  fontWeight: 400,
                  color: T.text,
                  margin: "0 0 18px",
                  lineHeight: 1.2,
                }}
              >
                Your ownership proof stays private.
              </h3>
              <p
                style={{
                  fontSize: 15,
                  color: T.text2,
                  lineHeight: 1.65,
                  marginBottom: 28,
                }}
              >
                Unlike public lost-and-found boards where serial numbers and
                personal details are exposed, ReclaimX seals all identifying
                clues inside a client-side Proof Locker.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  "Blind Feature Hashing: Serial numbers never visible to public",
                  "Cryptographic Challenge Questions: Answered only by the true owner",
                  "Zero Contact Sharing: Identity protected until handover confirmation",
                ].map((point, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      fontSize: 13,
                      color: T.text2,
                    }}
                  >
                    <span
                      style={{
                        marginTop: 1,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        backgroundColor: `${T.gold}18`,
                        border: `1px solid ${T.gold}44`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <CheckIcon size={9} color={T.gold} />
                    </span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Proof Locker card */}
            <div
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 14,
                padding: "28px 24px",
                boxShadow: "0 20px 48px rgba(0,0,0,0.55)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                  borderBottom: `1px solid ${T.border}55`,
                  paddingBottom: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <LockIcon size={15} color={T.gold} />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: T.text,
                    }}
                  >
                    Proof Locker #RX-884
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: T.mono,
                    fontSize: 10,
                    color: T.gold,
                    backgroundColor: `${T.gold}14`,
                    padding: "3px 8px",
                    borderRadius: 4,
                    border: `1px solid ${T.gold}33`,
                  }}
                >
                  SEALED
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  {
                    q: "What is engraved inside the inner clasp?",
                    status: "Sealed (Hash Verified)",
                    color: T.gold,
                  },
                  {
                    q: "Which sticker is on the underside lid?",
                    status: "Solved by Claimant",
                    color: T.accent2,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      background: T.surface2,
                      borderRadius: 8,
                      padding: "12px 14px",
                      border: `1px solid ${T.border}44`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: T.muted,
                        marginBottom: 4,
                      }}
                    >
                      Challenge Question {i + 1}
                    </div>
                    <div style={{ fontSize: 13, color: T.text }}>
                      &ldquo;{item.q}&rdquo;
                    </div>
                    <div
                      style={{
                        fontFamily: T.mono,
                        fontSize: 11,
                        color: item.color,
                        marginTop: 6,
                      }}
                    >
                      Status: {item.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RECOVERIES FEED ── */}
      <section
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 1400,
          margin: "0 auto",
          padding: "80px 32px 96px",
        }}
      >
        <div
          style={{
            marginBottom: 48,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: T.mono,
                fontSize: 10,
                color: T.text2,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              ACTIVE CAMPUS RESOLUTIONS
            </div>
            <h3
              style={{
                fontFamily: T.displaySerif,
                fontSize: "clamp(24px, 3vw, 34px)",
                fontWeight: 400,
                color: T.text,
                margin: 0,
                lineHeight: 1.15,
              }}
            >
              Recent recoveries in the mesh.
            </h3>
          </div>
          <button
            onClick={() => onNavigate("/signup")}
            className="rx-interactive"
            style={{
              background: "none",
              border: `1px solid ${T.border}`,
              color: T.text2,
              fontSize: 12,
              padding: "8px 16px",
              borderRadius: 6,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: T.sans,
            }}
          >
            View All
            <ArrowRightIcon size={11} />
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {sampleItems.map((item, idx) => (
            <div
              key={idx}
              data-cursor="explore"
              className="rx-feed-card rx-interactive"
              onClick={() => onNavigate("/login")}
              style={{
                backgroundColor: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                padding: "20px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = item.statusColor + "44"
                el.style.background = T.surface2
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = T.border
                el.style.background = T.surface
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: T.mono,
                      color: item.statusColor,
                      backgroundColor: `${item.statusColor}14`,
                      border: `1px solid ${item.statusColor}33`,
                      padding: "2px 7px",
                      borderRadius: 3,
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                    }}
                  >
                    {item.status}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: T.muted,
                      fontFamily: T.mono,
                    }}
                  >
                    {item.time}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: T.text,
                    marginBottom: 4,
                    lineHeight: 1.35,
                  }}
                >
                  {item.title}
                </div>
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 12 }}>
                  {item.location}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: T.text2,
                    lineHeight: 1.5,
                    padding: "8px 10px",
                    borderRadius: 5,
                    backgroundColor: T.surface2,
                    borderLeft: `2px solid ${item.statusColor}88`,
                  }}
                >
                  {item.verifiedDetails}
                </div>
              </div>
              <div
                style={{
                  borderTop: `1px solid ${T.border}44`,
                  paddingTop: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 10,
                  fontFamily: T.mono,
                  color: T.muted,
                }}
              >
                <span>Proof: {item.proofHash}</span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    color: T.text2,
                  }}
                >
                  {item.category}
                  <ArrowRightIcon size={10} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recovery Journey section */}
      <section
        style={{
          position: "relative",
          zIndex: 10,
          borderTop: `1px solid ${T.border}55`,
          backgroundColor: "rgba(15,18,23,0.4)",
        }}
      >
        <RecoveryJourneyPublic />
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: `1px solid ${T.border}`,
          backgroundColor: T.surface,
          padding: "48px 32px 40px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <div>
            <div
              className="rx-wordmark"
              style={{
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: "0.16em",
                color: T.text,
                marginBottom: 6,
              }}
            >
              RECLAIMX
            </div>
            <div
              className="rx-retro-display"
              style={{
                fontSize: 14,
                fontStyle: "italic",
                color: T.gold,
                letterSpacing: "0.02em",
                opacity: 0.8,
              }}
            >
              Find it. Prove it. Reclaim it.
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              fontSize: 12,
              color: T.muted,
            }}
          >
            {[
              { label: "Sign In", action: () => onNavigate("/login") },
              { label: "Create Account", action: () => onNavigate("/signup") },
            ].map((link) => (
              <span
                key={link.label}
                onClick={link.action}
                className="rx-link rx-interactive"
                style={{ cursor: "pointer" }}
              >
                {link.label}
              </span>
            ))}
            <span>Zero-Knowledge Recovery</span>
            <span>{"© "}{new Date().getFullYear()} ReclaimX</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ── Pipeline Stages — scroll-reveal editorial component ───────────────────────
function PipelineStages() {
  const stagesRef = useRef<HTMLDivElement>(null)
  const [visibleStages, setVisibleStages] = useState<number[]>([])

  const STAGES = [
    {
      num: "01",
      title: "LOST",
      desc: "Item signaled into the mesh. Distinctive serials and visual signatures are hashed into private clues.",
      color: T.accent,
      protocol: "SHA-256 Clue Sealing",
    },
    {
      num: "02",
      title: "MATCHED",
      desc: "Deterministic feature overlap without revealing private clues. Confidence matrix hits threshold.",
      color: T.accent,
      protocol: "Vector Similarity & Spatial Bounding",
    },
    {
      num: "03",
      title: "VERIFIED",
      desc: "Claimant answers sealed challenge questions. Proof Locker verifies ownership before identity is shared.",
      color: T.gold,
      protocol: "ZK-Proof Verification",
    },
    {
      num: "04",
      title: "RECLAIMED",
      desc: "Direct handover code or campus safe locker unlocked. Recovery journey finalized.",
      color: T.accent2,
      protocol: "One-Time Handover Code",
    },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(
              (entry.target as HTMLElement).dataset.idx || "0"
            )
            setVisibleStages((prev) =>
              prev.includes(idx) ? prev : [...prev, idx]
            )
          }
        })
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    )
    const items = stagesRef.current?.querySelectorAll("[data-idx]")
    items?.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={stagesRef} style={{ position: "relative" }}>
      {/* Connecting line */}
      <div
        style={{
          position: "absolute",
          top: 22,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(to right, ${T.border}33, ${T.border}99 20%, ${T.border}99 80%, ${T.border}33)`,
          zIndex: 0,
        }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        {STAGES.map((stage, idx) => {
          const isVisible = visibleStages.includes(idx)
          const isGold = stage.title === "VERIFIED"
          return (
            <div
              key={stage.num}
              data-idx={idx}
              className={`rx-stage-item ${isVisible ? "visible" : ""}`}
              style={{
                animationDelay: `${idx * 100}ms`,
                paddingTop: 48,
                paddingRight: idx < 3 ? 32 : 0,
                borderRight:
                  idx < 3 ? `1px solid ${T.border}33` : "none",
                paddingLeft: idx > 0 ? 32 : 0,
              }}
            >
              {/* Node on the connecting line */}
              <div
                style={{
                  position: "absolute",
                  top: 15,
                  left: `calc(${idx * 25}% + ${idx === 0 ? 0 : 10}px)`,
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: T.surface,
                  border: `1.5px solid ${stage.color}`,
                  boxShadow: isVisible ? `0 0 8px ${stage.color}55` : "none",
                  transition: "box-shadow 400ms ease",
                  zIndex: 2,
                }}
              />

              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: 10,
                  color: T.muted,
                  letterSpacing: "0.12em",
                  marginBottom: 14,
                }}
              >
                STAGE {stage.num}
              </div>

              <div
                style={{
                  fontFamily: T.cinzel,
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: isGold ? T.gold : T.text,
                  marginBottom: 8,
                  lineHeight: 1,
                  textShadow: isGold ? `0 0 16px ${T.gold}33` : "none",
                }}
              >
                {stage.title}
              </div>

              <p
                style={{
                  fontSize: 12,
                  lineHeight: 1.6,
                  color: T.muted,
                  margin: "0 0 16px",
                }}
              >
                {stage.desc}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 10,
                  fontFamily: T.mono,
                  color: T.text2,
                }}
              >
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    backgroundColor: stage.color,
                    flexShrink: 0,
                  }}
                />
                {stage.protocol}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

