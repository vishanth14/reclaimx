import { useState, FormEvent } from "react"
import { T } from "../../tokens"
import { LogoMark } from "../../components/LogoMark"
import { HeroBackgroundPaths } from "../../components/HeroBackgroundPaths"
import { ShieldIcon, ArrowRightIcon } from "../../components/Icons"
import { MagneticButton } from "../../components/MagneticButton"
import { useAuth } from "../../context/AuthContext"

interface SignupProps {
  onNavigate: (route: string) => void
}

export function Signup({ onNavigate }: SignupProps) {
  const { signup } = useAuth()
  const [name, setName] = useState("Alex Chen")
  const [email, setEmail] = useState("alex.chen@stanford.edu")
  const [password, setPassword] = useState("••••••••••••")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError("Please complete all required fields.")
      return
    }

    setLoading(true)
    setError("")
    try {
      await signup(name, email, password)
      onNavigate("/app/home")
    } catch {
      setError("Account creation failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: T.bg,
        color: T.text,
        fontFamily: T.sans,
        display: "flex",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Animated Paths for Atmosphere */}
      <HeroBackgroundPaths />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          width: "100%",
          minHeight: "100vh",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* LEFT COLUMN: Cinematic Welcome & Brand */}
        <div
          style={{
            padding: "48px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderRight: `1px solid ${T.border}66`,
            backgroundColor: "rgba(9, 11, 15, 0.65)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Brand */}
          <div
            onClick={() => onNavigate("/")}
            className="rx-interactive"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
            }}
          >
            <LogoMark size={30} />
            <span
              className="rx-wordmark"
              style={{
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: "0.14em",
                color: T.text,
              }}
            >
              RECLAIMX
            </span>
          </div>

          {/* Cinematic Editorial Heading */}
          <div style={{ margin: "64px 0" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 11,
                fontFamily: T.mono,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: T.gold,
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  backgroundColor: T.gold,
                }}
              />
              NETWORK ENROLLMENT
            </div>

            <h1
              style={{
                fontFamily: T.displaySerif,
                fontSize: "clamp(34px, 4.5vw, 52px)",
                fontWeight: 400,
                lineHeight: 1.1,
                color: T.text,
                margin: "0 0 16px",
              }}
            >
              Create your ReclaimX account.
            </h1>

            <p
              style={{
                fontSize: 16,
                color: T.text2,
                lineHeight: 1.6,
                maxWidth: 400,
                margin: "0 0 32px",
              }}
            >
              Join the verified campus recovery network. Protect your items and
              claim what was lost without exposing private information.
            </p>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                borderRadius: 6,
                backgroundColor: `${T.surface2}`,
                border: `1px solid ${T.border}`,
                fontSize: 12,
                color: T.muted,
              }}
            >
              <ShieldIcon size={14} color={T.accent2} />
              <span>Campus affiliation verified upon first claim</span>
            </div>
          </div>

          {/* Footer Reassurance */}
          <div
            style={{
              fontSize: 12,
              color: T.muted,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ color: T.gold }}>✦</span>
            <span>Your ownership proof stays private.</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Sign Up Form */}
        <div
          style={{
            padding: "48px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(15, 18, 23, 0.8)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 380,
            }}
          >
            <div style={{ marginBottom: 32 }}>
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  color: T.text,
                  margin: "0 0 8px",
                }}
              >
                Enroll New Member
              </h2>
              <p style={{ fontSize: 13, color: T.text2, margin: 0 }}>
                Set up your profile to start reporting and reclaiming items.
              </p>
            </div>

            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 6,
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#FCA5A5",
                  fontSize: 12,
                  marginBottom: 20,
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 500,
                    color: T.text2,
                    marginBottom: 6,
                  }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Chen"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 8,
                    backgroundColor: T.surface,
                    border: `1px solid ${T.border}`,
                    color: T.text,
                    fontSize: 14,
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 500,
                    color: T.text2,
                    marginBottom: 6,
                  }}
                >
                  Academic / Recovery Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.chen@stanford.edu"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 8,
                    backgroundColor: T.surface,
                    border: `1px solid ${T.border}`,
                    color: T.text,
                    fontSize: 14,
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 500,
                    color: T.text2,
                    marginBottom: 6,
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 8,
                    backgroundColor: T.surface,
                    border: `1px solid ${T.border}`,
                    color: T.text,
                    fontSize: 14,
                  }}
                />
              </div>

              <MagneticButton
                type="submit"
                disabled={loading}
                dataCursor="cta"
                className="rx-btn-primary rx-cta rx-interactive"
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {loading ? "Creating Account..." : "Create Account"}
                <ArrowRightIcon size={15} />
              </MagneticButton>
            </form>

            <div
              style={{
                margin: "28px 0",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: `${T.border}88`,
                }}
              />
              <span
                style={{ fontSize: 11, color: T.muted, fontFamily: T.mono }}
              >
                OR
              </span>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: `${T.border}88`,
                }}
              />
            </div>

            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: 13, color: T.muted }}>
                Already have an account?{" "}
              </span>
              <button
                onClick={() => onNavigate("/login")}
                className="rx-link rx-interactive"
                style={{
                  background: "none",
                  border: "none",
                  color: T.accent2,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
