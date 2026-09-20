import { T } from "../tokens"
import { ShieldIcon, ArrowRightIcon, CheckIcon } from "./Icons"
import type { Screen } from "../App"
import { storageService } from "../services/storageService"

interface ContextPanelProps {
  current: Screen
  onNavigate: (s: Screen) => void
}

export function ContextPanel({ current, onNavigate }: ContextPanelProps) {
  return (
    <aside
      className="rx-context-panel"
      style={{
        width: 300,
        minWidth: 300,
        height: "100vh",
        background: T.surface,
        borderLeft: `1px solid ${T.border}`,
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        overflowY: "auto",
        padding: "24px 20px",
        boxSizing: "border-box",
        fontSize: 13,
      }}
    >
      {/* Header section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: T.accent2,
              animation: "pulse-dot 2.4s infinite",
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: T.text,
            }}
          >
            Recovery Intelligence
          </span>
        </div>
        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>
          v2.4
        </span>
      </div>

      {/* Dynamic contextual content depending on active screen */}
      {renderContent(current, onNavigate)}

      {/* Sitewide Privacy Guarantee Footer */}
      <div
        style={{
          marginTop: "auto",
          paddingTop: 20,
          borderTop: `1px solid ${T.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 6,
          }}
        >
          <span
            style={{ display: "flex", alignItems: "center", color: T.accent }}
          >
            <ShieldIcon size={14} />
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: T.text2,
            }}
          >
            Zero-Knowledge Proof
          </span>
        </div>
        <p style={{ fontSize: 11, color: T.muted, lineHeight: 1.5, margin: 0 }}>
          Finder proof locker clues are sealed with cryptographic hashes.
          Private evidence is never exposed to claimants or search indexes.
        </p>
      </div>
    </aside>
  )
}

function renderContent(current: Screen, onNavigate: (s: Screen) => void) {
  switch (current) {
    case "home": {
      const lostCount = storageService.getLost().length
      const foundCount = storageService.getFound().length
      const proofLockersCount = Object.keys(storageService.getProofLockers()).length

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: T.muted,
                marginBottom: 12,
              }}
            >
              Network Overview
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <StatCard label="Total Items" value={`${lostCount + foundCount}`} />
              <StatCard label="Proof Lockers" value={`${proofLockersCount}`} />
              <StatCard label="Active Lost" value={`${lostCount} items`} />
              <StatCard label="Active Found" value={`${foundCount} items`} />
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: T.muted,
                marginBottom: 12,
              }}
            >
              Protocol Status
            </div>
            <div
              style={{
                background: T.surface2,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 12, color: T.text, fontWeight: 500 }}>
                  Proof Locker Enclave
                </span>
                <span
                  style={{
                    fontSize: 9,
                    color: T.accent2,
                    fontFamily: T.mono,
                    padding: "2px 6px",
                    background: `${T.accent2}18`,
                    borderRadius: 3,
                  }}
                >
                  ONLINE
                </span>
              </div>
              <p
                style={{
                  fontSize: 11,
                  color: T.text2,
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                Sealed evidence challenges active. Cryptographic proof validation
                protects private clues without disclosure.
              </p>
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: T.muted,
                marginBottom: 10,
              }}
            >
              Quick Action
            </div>
            <button
              onClick={() => onNavigate("how-it-works")}
              className="rx-context-btn"
              style={{
                width: "100%",
                background: "none",
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                padding: "9px 12px",
                color: T.text2,
                fontSize: 12,
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "border-color 150ms ease-out, color 150ms ease-out",
              }}
            >
              <span>How ownership verification works</span>
              <ArrowRightIcon size={13} />
            </button>
          </div>
        </div>
      )
    }

    case "discover":
    case "lost":
    case "found":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: T.muted,
                marginBottom: 12,
              }}
            >
              Feed Scope
            </div>
            <p
              style={{
                fontSize: 12,
                color: T.text2,
                lineHeight: 1.6,
                margin: "0 0 12px",
              }}
            >
              Public recovery feed displaying verified campus and municipal
              reports within active regional hubs.
            </p>
            <div
              style={{
                background: T.surface2,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: T.text,
                  marginBottom: 4,
                }}
              >
                What is kept private?
              </div>
              <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>
                Unique identifying marks, internal tags, serial suffixes, and
                contents are hidden from search listings to safeguard claims.
              </div>
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: T.muted,
                marginBottom: 12,
              }}
            >
              Filters Active
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  padding: "6px 0",
                  borderBottom: `1px solid ${T.border}`,
                }}
              >
                <span style={{ color: T.muted }}>Region</span>
                <span style={{ color: T.text }}>
                  All registered campus zones
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  padding: "6px 0",
                  borderBottom: `1px solid ${T.border}`,
                }}
              >
                <span style={{ color: T.muted }}>Time Window</span>
                <span style={{ color: T.text }}>Last 30 days</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  padding: "6px 0",
                }}
              >
                <span style={{ color: T.muted }}>Sealed Clues</span>
                <span style={{ color: T.accent2 }}>Protected</span>
              </div>
            </div>
          </div>
        </div>
      )

    case "item-detail":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: T.muted,
                marginBottom: 12,
              }}
            >
              Claim Protocol
            </div>
            <div
              style={{
                background: T.surface2,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                padding: "14px",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.text,
                  marginBottom: 6,
                }}
              >
                Before you claim:
              </div>
              <ol
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  fontSize: 11,
                  color: T.text2,
                  lineHeight: 1.6,
                }}
              >
                <li>Review the public characteristics and location.</li>
                <li>
                  You will be presented with 3 private verification prompts.
                </li>
                <li>Private evidence from the finder is never revealed.</li>
              </ol>
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: T.muted,
                marginBottom: 10,
              }}
            >
              Match Confidence Notice
            </div>
            <p
              style={{
                fontSize: 11,
                color: T.muted,
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Match confidence helps identify potential matches across time,
              location, and visual traits. It does not prove ownership until
              verified.
            </p>
          </div>
        </div>
      )

    case "report-found":
    case "report-lost":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: T.muted,
                marginBottom: 12,
              }}
            >
              Reporting Security
            </div>
            <div
              style={{
                background: T.surface2,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                padding: "14px",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: T.accent2,
                  marginBottom: 6,
                }}
              >
                The Proof Locker Rule
              </div>
              <p
                style={{
                  fontSize: 11,
                  color: T.text2,
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                Always reserve at least one distinctive detail (a scratch,
                custom sticker, keychain, or specific interior item) for your
                Proof Locker. This ensures only the genuine owner can claim it.
              </p>
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: T.muted,
                marginBottom: 8,
              }}
            >
              Data Separation
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div
                style={{
                  padding: "8px 10px",
                  background: T.surface3,
                  borderRadius: 6,
                  borderLeft: `2px solid ${T.muted}`,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: T.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Public Feed
                </div>
                <div style={{ fontSize: 11, color: T.text2 }}>
                  General item type, place, time
                </div>
              </div>
              <div
                style={{
                  padding: "8px 10px",
                  background: T.surface3,
                  borderRadius: 6,
                  borderLeft: `2px solid ${T.accent}`,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: T.accent,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Sealed Clues
                </div>
                <div style={{ fontSize: 11, color: T.text }}>
                  Hidden ownership criteria
                </div>
              </div>
            </div>
          </div>
        </div>
      )

    case "verify":
    case "matching":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: T.muted,
                marginBottom: 12,
              }}
            >
              Verification Integrity
            </div>
            <div
              style={{
                background: T.surface2,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                padding: "14px",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: T.text,
                  marginBottom: 6,
                }}
              >
                Blind Evaluation Active
              </div>
              <p
                style={{
                  fontSize: 11,
                  color: T.text2,
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                Answers are evaluated against sealed cryptographic criteria upon
                final submission. No per-keystroke validation hints are
                revealed.
              </p>
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: T.muted,
                marginBottom: 8,
              }}
            >
              Verification Rules
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: 16,
                fontSize: 11,
                color: T.muted,
                lineHeight: 1.6,
              }}
            >
              <li>Be as specific as you remember.</li>
              <li>Generic answers will require secondary review.</li>
              <li>Finder contact is withheld until verified.</li>
            </ul>
          </div>
        </div>
      )

    case "handover":
    case "reclaimed":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: T.muted,
                marginBottom: 12,
              }}
            >
              Handover Protocol
            </div>
            <div
              style={{
                background: T.surface2,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                padding: "14px",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.accent2,
                  marginBottom: 6,
                }}
              >
                Split Monospace Code
              </div>
              <p
                style={{
                  fontSize: 11,
                  color: T.text2,
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                The code is split in two halves. When finder and claimant meet
                and confirm both sides, the codes merge and the recovery record
                is permanently sealed.
              </p>
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: T.muted,
                marginBottom: 8,
              }}
            >
              Safety Protocol
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                fontSize: 11,
                color: T.text2,
              }}
            >
              <div
                style={{
                  padding: "7px 10px",
                  background: T.surface3,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <CheckIcon size={12} color={T.accent2} />
                <span>Always meet in well-lit public areas</span>
              </div>
              <div
                style={{
                  padding: "7px 10px",
                  background: T.surface3,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <CheckIcon size={12} color={T.accent2} />
                <span>Inspect physical item condition</span>
              </div>
              <div
                style={{
                  padding: "7px 10px",
                  background: T.surface3,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <CheckIcon size={12} color={T.accent2} />
                <span>Confirm handover on your device</span>
              </div>
            </div>
          </div>
        </div>
      )

    case "claims":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: T.muted,
                marginBottom: 12,
              }}
            >
              Status Lifecycle
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                {
                  status: "Searching",
                  color: T.muted,
                  desc: "Listening for reported matches",
                },
                {
                  status: "Potential Match",
                  color: T.accent,
                  desc: "Signals detected across network",
                },
                {
                  status: "Verification Required",
                  color: "#F0A86B",
                  desc: "Proof locker challenge pending",
                },
                {
                  status: "Verified",
                  color: T.accent2,
                  desc: "Ownership criteria confirmed",
                },
                {
                  status: "Handover Pending",
                  color: "#F0A86B",
                  desc: "Code exchange awaiting meeting",
                },
                {
                  status: "Reclaimed",
                  color: T.accent2,
                  desc: "Returned to genuine owner",
                },
              ].map((s) => (
                <div
                  key={s.status}
                  style={{
                    padding: "6px 8px",
                    background: T.surface2,
                    borderRadius: 5,
                    borderLeft: `2px solid ${s.color}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: s.color,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {s.status}
                  </div>
                  <div style={{ fontSize: 10, color: T.muted }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    default:
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              background: T.surface2,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: "14px",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: T.text,
                marginBottom: 6,
              }}
            >
              ReclaimX Network
            </div>
            <p
              style={{
                fontSize: 11,
                color: T.muted,
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              Trust, precision, and privacy in lost-and-found recovery.
            </p>
          </div>
        </div>
      )
  }
}

function StatCard({
  label,
  value,
  trend,
}: {
  label: string
  value: string
  trend?: string
}) {
  return (
    <div
      style={{
        background: T.surface2,
        border: `1px solid ${T.border}`,
        borderRadius: 7,
        padding: "10px 12px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: T.muted,
          marginBottom: 4,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: T.text,
          fontFamily: T.mono,
        }}
      >
        {value}
      </div>
      {trend && (
        <div
          style={{
            fontSize: 9,
            color: T.accent2,
            marginTop: 2,
            fontFamily: T.mono,
          }}
        >
          {trend}
        </div>
      )}
    </div>
  )
}
