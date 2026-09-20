import { useState, FormEvent } from "react"
import { T } from "../../tokens"
import { LogoMark } from "../../components/LogoMark"
import { HeroBackgroundPaths } from "../../components/HeroBackgroundPaths"
import { LockIcon, ArrowRightIcon } from "../../components/Icons"
import { MagneticButton } from "../../components/MagneticButton"
import { useAuth } from "../../context/AuthContext"

interface LoginProps {
  onNavigate: (route: string) => void
}

export function Login({ onNavigate }: LoginProps) {
  const { login } = useAuth()
  const [email, setEmail] = useState("alex.chen@stanford.edu")
  const [password, setPassword] = useState("••••••••••••")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError("Please enter your academic or recovery email.")
      return
    }

    setLoading(true)
    setError("")
    try {
      await login(email, password)
      onNavigate("/app/home")
    } catch {
      setError("Authentication failed. Please try again.")
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
              PORTAL ACCESS
            </div>

            <h1
              style={{
                fontFamily: T.displaySerif,
                fontSize: "clamp(38px, 5vw, 56px)",
                fontWeight: 400,
                lineHeight: 1.1,
                color: T.text,
                margin: "0 0 16px",
              }}
            >
              Welcome back.
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
              Continue your recovery journey across campus meshes and verified
              lockers.
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
              <LockIcon size={14} color={T.gold} />
              <span>Zero-knowledge ownership credentials enabled</span>
            </div>
          </div>

          {/* Footer reassurance */}
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

        {/* RIGHT COLUMN: Sign In Form */}
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
                Sign In
              </h2>
              <p style={{ fontSize: 13, color: T.text2, margin: 0 }}>
                Enter your credentials to access your recovery dashboard.
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
              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 500,
                    color: T.text2,
                    marginBottom: 6,
                  }}
                >
                  Email Address
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

              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: T.text2,
                    }}
                  >
                    Password
                  </label>
                  <span
                    onClick={() =>
                      alert("Password reset link sent to demo email")
                    }
                    className="rx-link rx-interactive"
                    style={{
                      fontSize: 12,
                      color: T.accent,
                      cursor: "pointer",
                    }}
                  >
                    Forgot password?
                  </span>
                </div>
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
                {loading ? "Authenticating..." : "Sign In"}
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
                New to ReclaimX?{" "}
              </span>
              <button
                onClick={() => onNavigate("/signup")}
                className="rx-link rx-interactive"
                style={{
                  background: "none",
                  border: "none",
                  color: T.gold,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Create account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
