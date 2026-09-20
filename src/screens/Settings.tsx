import { useState } from "react"
import { T } from "../tokens"
import type { Screen } from "../App"
import { ShieldIcon, LayersIcon, CheckIcon } from "../components/Icons"
import { useToast } from "../context/ToastContext"
import { MagneticButton } from "../components/MagneticButton"
import { storageService } from "../services/storageService"

interface SettingsProps {
  onNavigate?: (s: Screen) => void
}

export function Settings({ onNavigate }: SettingsProps) {
  // Settings state
  const [blindMesh, setBlindMesh] = useState(true)
  const [instantAlerts, setInstantAlerts] = useState(true)
  const [autoSeal, setAutoSeal] = useState(true)
  const [geofence, setGeofence] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [clearingCache, setClearingCache] = useState(false)
  const [cacheCleared, setCacheCleared] = useState(false)
  const [restoringDemo, setRestoringDemo] = useState(false)
  const [demoRestored, setDemoRestored] = useState(false)

  const { toast } = useToast()

  const handleResetUserData = () => {
    if (clearingCache) return
    setClearingCache(true)
    setTimeout(() => {
      storageService.resetUserData()
      setClearingCache(false)
      setCacheCleared(true)
      toast("Current user activity cleared", "success")
      setTimeout(() => setCacheCleared(false), 2000)
    }, 500)
  }

  const handleResetDemoData = () => {
    if (restoringDemo) return
    setRestoringDemo(true)
    setTimeout(() => {
      storageService.resetDemoData()
      setRestoringDemo(false)
      setDemoRestored(true)
      toast("Demo dataset restored", "success")
      setTimeout(() => setDemoRestored(false), 2000)
    }, 500)
  }

  return (
    <div style={{ padding: "40px 48px", maxWidth: 740 }}>
      <style>{`
        .rx-settings-section {
          transition: border-color var(--dur-standard) var(--ease-out-quint),
                      background var(--dur-standard) var(--ease-out-quint);
        }
        .rx-settings-section:hover {
          border-color: #2e3541;
          background: #0f1217;
        }
        .rx-setting-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          border-bottom: 1px solid ${T.border};
          transition: background 150ms ease-out;
        }
        .rx-setting-row:last-child {
          border-bottom: none;
        }
      `}</style>

      {/* Header */}
      <div className="rx-page-title-enter" style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: T.text,
            margin: "0 0 8px",
          }}
        >
          Network & Privacy Settings
        </h1>
        <p style={{ fontSize: 13, color: T.text2, margin: 0 }}>
          Configure zero-knowledge recovery preferences, campus telemetry, and
          cryptographic verification rules.
        </p>
      </div>

      {/* Privacy & Zero-Knowledge Section */}
      <div
        className="rx-settings-section rx-stagger-item rx-delay-1"
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: "20px 24px",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            fontWeight: 600,
            color: T.text,
            marginBottom: 16,
          }}
        >
          <ShieldIcon size={14} color={T.accent} />
          <span>Zero-Knowledge & Privacy Protocol</span>
        </div>

        <div className="rx-setting-row">
          <div style={{ paddingRight: 24 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: T.text,
                marginBottom: 3,
              }}
            >
              Blind Mesh Discovery
            </div>
            <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.4 }}>
              Hashes item identifiers before broadcasting over campus Bluetooth
              beacons. Prevents eavesdropping on lost valuables.
            </div>
          </div>
          <button
            type="button"
            className={`rx-toggle ${blindMesh ? "active" : ""}`}
            onClick={() => setBlindMesh(!blindMesh)}
            aria-label="Toggle Blind Mesh Discovery"
          />
        </div>

        <div className="rx-setting-row">
          <div style={{ paddingRight: 24 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: T.text,
                marginBottom: 3,
              }}
            >
              Auto-Seal Proof Locker on Submission
            </div>
            <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.4 }}>
              Automatically seals serial numbers, engravings, and private
              markings with client-side SHA-256 before upload.
            </div>
          </div>
          <button
            type="button"
            className={`rx-toggle ${autoSeal ? "active" : ""}`}
            onClick={() => setAutoSeal(!autoSeal)}
            aria-label="Toggle Auto-Seal Proof Locker"
          />
        </div>

        <div className="rx-setting-row">
          <div style={{ paddingRight: 24 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: T.text,
                marginBottom: 3,
              }}
            >
              Campus Geofence Matching
            </div>
            <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.4 }}>
              Restrict potential matches strictly to verified perimeter
              boundaries of the local institution.
            </div>
          </div>
          <button
            type="button"
            className={`rx-toggle ${geofence ? "active" : ""}`}
            onClick={() => setGeofence(!geofence)}
            aria-label="Toggle Geofence"
          />
        </div>
      </div>

      {/* Notifications & System Preferences */}
      <div
        className="rx-settings-section rx-stagger-item rx-delay-2"
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: "20px 24px",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            fontWeight: 600,
            color: T.text,
            marginBottom: 16,
          }}
        >
          <LayersIcon size={14} color={T.accent2} />
          <span>System & Interaction Preferences</span>
        </div>

        <div className="rx-setting-row">
          <div style={{ paddingRight: 24 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: T.text,
                marginBottom: 3,
              }}
            >
              High-Precision Push Notifications
            </div>
            <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.4 }}>
              Notify immediately when a match signal confidence exceeds 85%.
            </div>
          </div>
          <button
            type="button"
            className={`rx-toggle ${instantAlerts ? "active" : ""}`}
            onClick={() => setInstantAlerts(!instantAlerts)}
            aria-label="Toggle instant alerts"
          />
        </div>

        <div className="rx-setting-row">
          <div style={{ paddingRight: 24 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: T.text,
                marginBottom: 3,
              }}
            >
              Prefer Reduced Motion (Accessibility Override)
            </div>
            <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.4 }}>
              Dampens or disables UI entrance animations, parallax blobs, and
              cursor scale dynamics.
            </div>
          </div>
          <button
            type="button"
            className={`rx-toggle ${reducedMotion ? "active" : ""}`}
            onClick={() => setReducedMotion(!reducedMotion)}
            aria-label="Toggle reduced motion"
          />
        </div>
      </div>

      {/* Danger / Local Storage Utilities */}
      <div
        className="rx-stagger-item rx-delay-3"
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 16,
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: T.text,
                marginBottom: 3,
              }}
            >
              Clear Current User Activity
            </div>
            <div style={{ fontSize: 12, color: T.muted }}>
              Clears your reported items, personal claims, and matches while preserving demo items for browsing.
            </div>
          </div>
          <MagneticButton
            type="button"
            variant="secondary"
            onClick={handleResetUserData}
            disabled={clearingCache}
            style={{
              color: cacheCleared ? "#38A169" : T.text2,
              padding: "8px 16px",
              borderRadius: 6,
              fontSize: 12,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {cacheCleared && <CheckIcon size={12} />}
            <span>{cacheCleared ? "Cleared" : clearingCache ? "Clearing..." : "Clear User Activity"}</span>
          </MagneticButton>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: T.text,
                marginBottom: 3,
              }}
            >
              Restore Seeded Demo Dataset
            </div>
            <div style={{ fontSize: 12, color: T.muted }}>
              Reloads the 10 fictional campus items and Proof Lockers for platform demonstration.
            </div>
          </div>
          <MagneticButton
            type="button"
            variant="secondary"
            onClick={handleResetDemoData}
            disabled={restoringDemo}
            style={{
              color: demoRestored ? "#38A169" : T.text2,
              padding: "8px 16px",
              borderRadius: 6,
              fontSize: 12,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {demoRestored && <CheckIcon size={12} />}
            <span>{demoRestored ? "Restored" : restoringDemo ? "Restoring..." : "Restore Demo Data"}</span>
          </MagneticButton>
        </div>
      </div>
    </div>
  )
}
