import { T } from "../tokens"
import { LockIcon } from "../components/Icons"

const stages = [
  {
    num: "01",
    label: "REPORT",
    heading: "Register the item with dual privacy zones",
    body: "Submit public characteristics (category, location, approximate time) and seal private ownership clues in your Proof Locker. You receive a unique ReclaimX tracking ID.",
  },
  {
    num: "02",
    label: "MATCH",
    heading: "Signal cross-referencing",
    body: "When matching reports occur, the system evaluates item traits, location proximity, time windows, and descriptive similarity. Potential matches are flagged without revealing private clues.",
  },
  {
    num: "03",
    label: "PROVE",
    heading: "Zero-knowledge verification challenge",
    body: "The claimant proves ownership by answering blind verification challenges based on sealed evidence. The finder's private clues are never shown to the claimant, and the claimant's answers are never exposed to the public.",
  },
  {
    num: "04",
    label: "RECLAIM",
    heading: "Bifurcated code handover",
    body: "A unique two-part handover code (e.g. RX-48 | 21) is generated. When both parties meet in person and confirm their respective halves, the code merges, completing the recovery cycle.",
  },
]

export function HowItWorks() {
  return (
    <div style={{ padding: "40px 48px", maxWidth: 760 }}>
      {/* Eyebrow */}
      <div
        style={{
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: T.muted,
          marginBottom: 16,
        }}
      >
        How It Works
      </div>

      {/* Headline */}
      <h1
        style={{
          fontSize: "clamp(28px, 3.8vw, 42px)",
          fontWeight: 600,
          letterSpacing: "-0.025em",
          color: T.text,
          lineHeight: 1.1,
          margin: "0 0 16px",
        }}
      >
        Recovery is a process,
        <br />
        not a search result.
      </h1>

      <p
        style={{
          fontSize: 15,
          color: T.text2,
          lineHeight: 1.65,
          maxWidth: 540,
          margin: "0 0 52px",
        }}
      >
        ReclaimX connects lost things with the people who found them — then
        verifies ownership before they change hands.
      </p>

      {/* Four Stages */}
      <div style={{ borderTop: `1px solid ${T.border}`, marginBottom: 60 }}>
        {stages.map((stage) => (
          <div
            key={stage.num}
            className="rx-row-interactive rx-interactive"
            style={{
              display: "grid",
              gridTemplateColumns: "50px 120px 1fr",
              gap: 20,
              padding: "24px 12px",
              borderBottom: `1px solid ${T.border}`,
              alignItems: "start",
              borderRadius: 6,
            }}
          >
            <span
              style={{
                fontFamily: T.mono,
                fontSize: 12,
                color: stage.label === "PROVE" ? T.gold : T.muted,
                letterSpacing: "0.04em",
                paddingTop: 2,
              }}
            >
              {stage.num}
            </span>
            <span
              style={{
                fontFamily: stage.label === "PROVE" ? T.cinzel : "inherit",
                fontSize: 12,
                fontWeight: 600,
                color:
                  stage.label === "PROVE"
                    ? T.gold
                    : stage.label === "RECLAIM"
                      ? T.accent2
                      : T.accent,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                paddingTop: 2,
                textShadow:
                  stage.label === "PROVE" ? `0 0 10px ${T.gold}44` : "none",
              }}
            >
              {stage.label}
            </span>
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: T.text,
                  marginBottom: 8,
                  letterSpacing: "-0.01em",
                }}
              >
                {stage.heading}
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: T.text2,
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {stage.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Privacy Section */}
      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: T.muted,
            marginBottom: 16,
          }}
        >
          Privacy Architecture
        </div>

        <h2
          style={{
            fontSize: "clamp(22px, 2.5vw, 28px)",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: T.text,
            margin: "0 0 12px",
          }}
        >
          Your proof stays private.
        </h2>

        <p
          style={{
            fontSize: 14,
            color: T.text2,
            lineHeight: 1.65,
            margin: "0 0 32px",
            maxWidth: 540,
          }}
        >
          The public/private distinction is the foundation of ReclaimX. What the
          recovery network sees to identify a match is strictly separated from
          the private ownership evidence that proves who owns it.
        </p>

        {/* Public vs Private Comparison Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {/* Public Column */}
          <div
            style={{
              background: T.surface2,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: T.text2,
                }}
              >
                PUBLIC
              </span>
              <span
                style={{ fontSize: 10, fontFamily: T.mono, color: T.muted }}
              >
                DISCOVERABLE
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginBottom: 20,
              }}
            >
              {["Black backpack", "Library", "6:15 PM"].map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    background: T.surface3,
                    borderRadius: 6,
                    border: `1px solid ${T.border}`,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: T.muted,
                    }}
                  />
                  <span style={{ fontSize: 13, color: T.text }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.55 }}>
              Broad traits visible to everyone in search feeds to help finders
              and owners spot potential matches.
            </div>
          </div>

          {/* Private Column */}
          <div
            style={{
              background: T.surface2,
              border: `1px solid ${T.accent}44`,
              borderRadius: 10,
              padding: "24px",
              position: "relative",
              boxShadow: `0 0 20px ${T.accent}08`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: T.accent,
                  }}
                >
                  <LockIcon size={14} />
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: T.accent,
                  }}
                >
                  PRIVATE (PROOF LOCKER)
                </span>
              </div>
              <span
                style={{ fontSize: 10, fontFamily: T.mono, color: T.accent2 }}
              >
                SEALED
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginBottom: 20,
              }}
            >
              {["Red keychain", "Tear on strap", "Blue notebook"].map(
                (item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 12px",
                      background: `${T.accent}14`,
                      borderRadius: 6,
                      border: `1px solid ${T.accent}33`,
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: T.accent2,
                      }}
                    />
                    <span style={{ fontSize: 13, color: T.text }}>{item}</span>
                  </div>
                ),
              )}
            </div>

            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>
              Sealed ownership clues. Never displayed in public search feeds or
              exposed to prospective claimants.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
