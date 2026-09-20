import { useState } from "react"
import { T } from "../tokens"
import type { Screen } from "../App"
import { UserIcon, ShieldIcon, CheckIcon } from "../components/Icons"
import { useToast } from "../context/ToastContext"
import { MagneticButton } from "../components/MagneticButton"

interface ProfileProps {
  onNavigate?: (s: Screen) => void
}

export function Profile({ onNavigate }: ProfileProps) {
  const [name, setName] = useState("Alex Vance")
  const [email, setEmail] = useState("a.vance@campus.edu")
  const [studentId, setStudentId] = useState("ST-892402")
  const [department, setDepartment] = useState("Cognitive & Computing Systems")
  const [phone, setPhone] = useState("+1 (555) 019-2834")
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const { toast } = useToast()
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle",
  )

  const handleSave = () => {
    if (saveState !== "idle") return
    setSaveState("saving")
    setTimeout(() => {
      setSaveState("saved")
      toast("Settings saved", "success")
      setTimeout(() => {
        setSaveState("idle")
      }, 2000)
    }, 600)
  }

  return (
    <div style={{ padding: "40px 48px", maxWidth: 740 }}>
      <style>{`
        .rx-profile-card {
          transition: border-color var(--dur-standard) var(--ease-out-quint),
                      background var(--dur-standard) var(--ease-out-quint);
        }
        .rx-profile-card:hover {
          border-color: #2e3541;
          background: #0f1217;
        }
        .rx-field-input {
          transition: border-color 150ms var(--ease-out-quint), box-shadow 150ms var(--ease-out-quint);
        }
        .rx-field-input:hover {
          border-color: #3b424e !important;
        }
        .rx-field-input:focus {
          border-color: ${T.accent} !important;
          box-shadow: 0 0 0 1px ${T.accent}44 !important;
          outline: none;
        }
      `}</style>

      {/* Header */}
      <div className="rx-page-title-enter" style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <h1
            style={{
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: T.text,
              margin: 0,
            }}
          >
            Profile & Credentials
          </h1>
          <span
            style={{
              fontSize: 10,
              fontFamily: T.mono,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "3px 8px",
              borderRadius: 4,
              background: "rgba(214, 179, 106, 0.12)",
              color: "#D6B36A",
              border: "1px solid rgba(214, 179, 106, 0.3)",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <ShieldIcon size={11} />
            Verified Identity
          </span>
        </div>
        <p style={{ fontSize: 13, color: T.text2, margin: 0 }}>
          Manage your verified campus credentials and recovery contact points.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div
        className="rx-profile-card rx-stagger-item rx-delay-1"
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: 24,
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: T.surface2,
            border: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: T.accent,
            flexShrink: 0,
          }}
        >
          <UserIcon size={26} />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: T.text,
              marginBottom: 4,
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: 12,
              color: T.text2,
              fontFamily: T.mono,
              marginBottom: 6,
            }}
          >
            {studentId} · {department}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span
              style={{
                fontSize: 10,
                color: T.accent2,
                background: `${T.accent2}14`,
                padding: "2px 7px",
                borderRadius: 3,
                border: `1px solid ${T.accent2}33`,
              }}
            >
              8 Recoveries Completed
            </span>
            <span
              style={{
                fontSize: 10,
                color: T.muted,
                background: T.surface2,
                padding: "2px 7px",
                borderRadius: 3,
              }}
            >
              Trust Score: 99.4%
            </span>
          </div>
        </div>
      </div>

      {/* Editable Fields Grid */}
      <div
        className="rx-stagger-item rx-delay-2"
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: 24,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: T.text,
            marginBottom: 20,
            letterSpacing: "-0.01em",
          }}
        >
          Personal & Academic Details
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginBottom: 20,
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: T.muted,
                marginBottom: 6,
              }}
            >
              Full Name
            </label>
            <input
              className="rx-field-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                background: T.surface2,
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                padding: "9px 12px",
                color: T.text,
                fontSize: 13,
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: T.muted,
                marginBottom: 6,
              }}
            >
              Student / Staff ID
            </label>
            <input
              className="rx-field-input"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              style={{
                width: "100%",
                background: T.surface2,
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                padding: "9px 12px",
                color: T.text,
                fontSize: 13,
                fontFamily: T.mono,
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: T.muted,
                marginBottom: 6,
              }}
            >
              Institutional Email
            </label>
            <input
              className="rx-field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                background: T.surface2,
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                padding: "9px 12px",
                color: T.text,
                fontSize: 13,
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: T.muted,
                marginBottom: 6,
              }}
            >
              Department / Faculty
            </label>
            <input
              className="rx-field-input"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              style={{
                width: "100%",
                background: T.surface2,
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                padding: "9px 12px",
                color: T.text,
                fontSize: 13,
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: T.muted,
              marginBottom: 6,
            }}
          >
            Handover Notification Number
          </label>
          <input
            className="rx-field-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{
              width: "100%",
              background: T.surface2,
              border: `1px solid ${T.border}`,
              borderRadius: 6,
              padding: "9px 12px",
              color: T.text,
              fontSize: 13,
              fontFamily: T.mono,
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Telegram/SMS Toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 14px",
            background: T.surface2,
            borderRadius: 6,
            border: `1px solid ${T.border}`,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: T.text,
                marginBottom: 2,
              }}
            >
              SMS Instant Verification Alerts
            </div>
            <div style={{ fontSize: 11, color: T.muted }}>
              Receive cryptographically signed OTPs when an item matching your
              claim is located.
            </div>
          </div>
          <button
            type="button"
            className={`rx-toggle ${notificationsEnabled ? "active" : ""}`}
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            aria-label="Toggle notifications"
          />
        </div>
      </div>

      {/* Save Action Buttons */}
      <div
        className="rx-stagger-item rx-delay-3"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 12,
        }}
      >
        {onNavigate && (
          <button
            type="button"
            className="rx-btn-secondary"
            onClick={() => onNavigate("home")}
            style={{
              background: "none",
              border: `1px solid ${T.border}`,
              color: T.text2,
              padding: "9px 18px",
              borderRadius: 6,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        )}
        <MagneticButton
          type="button"
          variant="primary"
          onClick={handleSave}
          disabled={saveState === "saving"}
          style={{
            background: saveState === "saved" ? "#38A169" : T.accent,
            padding: "9px 22px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {saveState === "saving" && (
            <span
              style={{
                width: 12,
                height: 12,
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "#fff",
                borderRadius: "50%",
                animation: "spin 0.6s linear infinite",
              }}
            />
          )}
          {saveState === "saved" && <CheckIcon size={13} />}
          <span>
            {saveState === "saving"
              ? "Saving..."
              : saveState === "saved"
                ? "Saved ✓"
                : "Save Changes"}
          </span>
        </MagneticButton>
      </div>
    </div>
  )
}
