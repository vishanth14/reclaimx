import { useState } from "react"
import { T } from "../tokens"
import { useToast } from "../context/ToastContext"
import { CATEGORIES, LOCATIONS } from "../services/mockData"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  LockIcon,
  PlusIcon,
  CrossIcon,
} from "../components/Icons"
import { MagneticButton } from "../components/MagneticButton"
import { itemsService } from "../services/itemsService"
import type { Screen } from "../App"

interface Clue {
  text: string
  sealed: boolean
  sealing: boolean
}

export function ReportFound({
  onNavigate,
}: {
  onNavigate: (s: Screen) => void
}) {
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const [category, setCategory] = useState("")
  const [itemName, setItemName] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [clues, setClues] = useState<Clue[]>([
    { text: "Red keychain attached", sealed: false, sealing: false },
  ])
  const [newClue, setNewClue] = useState("")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  const steps = ["ITEM", "DETAILS", "PROOF", "REVIEW"]

  function addClue() {
    if (!newClue.trim()) return
    setClues((c) => [
      ...c,
      { text: newClue.trim(), sealed: false, sealing: false },
    ])
    setNewClue("")
  }

  function sealClue(i: number) {
    // Mechanical latch seal: 350ms transition
    setClues((c) =>
      c.map((cl, idx) => (idx === i ? { ...cl, sealing: true } : cl)),
    )
    setTimeout(() => {
      setClues((c) =>
        c.map((cl, idx) =>
          idx === i ? { ...cl, sealing: false, sealed: true } : cl,
        ),
      )
    }, 360)
  }

  function removeClue(i: number) {
    setClues((c) => c.filter((_, idx) => idx !== i))
  }

  function publish() {
    const { item, proofLocker } = itemsService.createFoundItem({
      category: category || "Bags",
      title: itemName || `${category || "Found"} item`,
      description: description || "Found item registered on campus",
      location: location || "Central Library",
      date: date || "Today",
      time: time || "Just now",
      imageUrl: uploadedImage || undefined,
      imageAlt: itemName ? `Photo of found ${itemName}` : undefined,
      clues: clues.map((c, i) => ({
        question: `Private ownership detail ${i + 1}`,
        text: c.text,
      })),
    })

    toast(
      `Found item published — Proof Locker #${proofLocker.id.slice(-6).toUpperCase()} sealed`,
      "success",
    )
    onNavigate("discover")
  }

  return (
    <div style={{ padding: "40px 48px", maxWidth: 680 }}>
      <style>{`
        @keyframes mechanical-latch {
          0%   { transform: rotate(0deg) translateY(0); }
          30%  { transform: rotate(-14deg) translateY(-1px); }
          70%  { transform: rotate(4deg) translateY(0); }
          100% { transform: rotate(0deg) translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes mechanical-latch { from{} to{} }
        }
      `}</style>

      <button
        onClick={() => onNavigate("home")}
        style={{
          background: "none",
          border: "none",
          color: T.muted,
          fontSize: 12,
          cursor: "pointer",
          padding: 0,
          marginBottom: 32,
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontFamily: T.sans,
        }}
      >
        <ArrowLeftIcon size={14} />
        <span>Return to Home</span>
      </button>

      {/* Multi-step progress header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          marginBottom: 40,
        }}
      >
        {steps.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center" }}>
            <div
              onClick={() => i < step && setStep(i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: i < step ? "pointer" : "default",
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: i <= step ? T.accent : T.surface3,
                  border: `1px solid ${i <= step ? T.accent : T.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  color: i <= step ? "#fff" : T.muted,
                  fontWeight: 600,
                  transition:
                    "background 260ms cubic-bezier(0.22,1,0.36,1), border-color 260ms",
                }}
              >
                {i < step ? (
                  <CheckIcon size={11} strokeWidth={2.5} />
                ) : (
                  `0${i + 1}`
                )}
              </div>
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  color: i === step ? T.text : T.muted,
                  fontWeight: i === step ? 600 : 400,
                  textTransform: "uppercase",
                }}
              >
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  width: 28,
                  height: 1,
                  background: i < step ? `${T.accent}88` : T.border,
                  margin: "0 12px",
                  transition: "background 300ms ease-out",
                }}
              />
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes rx-step-fade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rx-step-content {
          animation: rx-step-fade var(--dur-standard) var(--ease-out-quint) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .rx-step-content { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      {/* Step 0: Item */}
      {step === 0 && (
        <div className="rx-step-content">
          <div style={eyebrowStyle}>01 ITEM</div>
          <h2 style={hStyle}>What did you find?</h2>

          <Field label="Category">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  style={{
                    background: category === c ? `${T.accent}24` : T.surface2,
                    border: `1px solid ${category === c ? T.accent : T.border}`,
                    color: category === c ? T.text : T.text2,
                    fontSize: 12,
                    padding: "7px 14px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontFamily: T.sans,
                    transition: "all 150ms ease-out",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Item name">
            <input
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Black backpack, Wireless earbuds, Scientific calculator..."
              style={inputStyle}
            />
          </Field>

          <div
            style={{
              padding: "12px 14px",
              background: T.surface2,
              borderRadius: 7,
              border: `1px solid ${T.border}`,
              marginBottom: 28,
            }}
          >
            <span style={{ fontSize: 12, color: T.muted }}>
              You will specify location, date, and private Proof Locker clues
              next.
            </span>
          </div>

          <button
            onClick={() => setStep(1)}
            disabled={!category || !itemName.trim()}
            className="rx-btn-primary"
            style={btnPrimary(!category || !itemName.trim())}
          >
            <span>Continue to Details</span>
            <ArrowRightIcon size={14} />
          </button>
        </div>
      )}

      {/* Step 1: Details & Public Preview */}
      {step === 1 && (
        <div className="rx-step-content">
          <div style={eyebrowStyle}>02 DETAILS</div>
          <h2 style={hStyle}>Found Details</h2>
          <p style={{ fontSize: 13, color: T.text2, margin: "0 0 24px" }}>
            This general information will be discoverable on the public campus
            recovery network.
          </p>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe general traits and where it was discovered..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
            />
          </Field>

          <Field label="Location">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ ...inputStyle, appearance: "none" }}
            >
              <option value="">Select campus location...</option>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </Field>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <Field label="Date">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="Approximate time">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={inputStyle}
              />
            </Field>
          </div>

          <Field label="Item Photograph (Optional)">
            {uploadedImage ? (
              <div
                style={{
                  position: "relative",
                  borderRadius: 8,
                  overflow: "hidden",
                  border: `1px solid ${T.border}`,
                  background: T.surface2,
                  maxHeight: 180,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={uploadedImage}
                  alt="Uploaded found item preview"
                  style={{
                    width: "100%",
                    height: 180,
                    objectFit: "cover",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setUploadedImage(null)}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    background: "rgba(10, 12, 16, 0.8)",
                    border: `1px solid ${T.border}`,
                    color: T.text,
                    fontSize: 11,
                    padding: "4px 8px",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                >
                  Remove Photo
                </button>
              </div>
            ) : (
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "18px 16px",
                  background: T.surface2,
                  border: `1px dashed ${T.border}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  gap: 6,
                  color: T.muted,
                  transition: "border-color 150ms ease",
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = () => {
                      if (typeof reader.result === "string") setUploadedImage(reader.result)
                    }
                    reader.readAsDataURL(file)
                  }}
                  style={{ display: "none" }}
                />
                <span style={{ fontSize: 12, color: T.text2 }}>
                  + Upload photograph of found item
                </span>
                <span style={{ fontSize: 10, color: T.muted }}>
                  PNG, JPG, or WebP up to 5MB
                </span>
              </label>
            )}
          </Field>

          {/* PUBLIC PREVIEW */}
          <div
            style={{
              background: T.surface2,
              border: `1px solid ${T.border}`,
              borderRadius: 9,
              padding: "18px 20px",
              marginBottom: 28,
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: T.muted,
                marginBottom: 10,
              }}
            >
              Public Feed Preview
            </div>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              {uploadedImage ? (
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    overflow: "hidden",
                    border: `1px solid ${T.border}`,
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={uploadedImage}
                    alt="Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              ) : null}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: T.text,
                    marginBottom: 4,
                  }}
                >
                  {itemName || "Item name"}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: T.text2,
                    marginBottom: 6,
                    lineHeight: 1.5,
                  }}
                >
                  {description ||
                    "Public description of the item will appear here."}
                </div>
                <div style={{ fontSize: 11, color: T.muted }}>
                  {location || "Central Library"} · {date || "Today"}{" "}
                  {time ? `· ${time}` : ""}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(0)} style={btnSecondary}>
              <ArrowLeftIcon size={14} />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={!description.trim() || !location}
              className="rx-btn-primary"
              style={btnPrimary(!description.trim() || !location)}
            >
              <span>Continue to Proof Locker</span>
              <ArrowRightIcon size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Proof Locker */}
      {step === 2 && (
        <div className="rx-step-content">
          <div style={eyebrowStyle}>03 PROOF</div>
          <h2 style={hStyle}>Keep one detail private.</h2>
          <p
            style={{
              fontSize: 13,
              color: T.text2,
              lineHeight: 1.6,
              margin: "0 0 24px",
            }}
          >
            Add details only the genuine owner is likely to know. These details
            will never appear in public search results.
          </p>

          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <input
              value={newClue}
              onChange={(e) => setNewClue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addClue()}
              placeholder='e.g. "Red keychain attached", "Tear on right strap", "Blue notebook inside"'
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={addClue}
              style={{
                ...btnPrimary(false),
                padding: "11px 18px",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <PlusIcon size={14} />
              <span>Add Clue</span>
            </button>
          </div>

          {/* Clues list with UNSEALED -> SEALED mechanical interaction */}
          {clues.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginBottom: 24,
              }}
            >
              {clues.map((clue, i) => (
                <ClueItem
                  key={i}
                  clue={clue}
                  onSeal={() => sealClue(i)}
                  onRemove={() => removeClue(i)}
                />
              ))}
            </div>
          )}

          {clues.length === 0 && (
            <div
              style={{
                padding: 24,
                border: `1px dashed ${T.border}`,
                borderRadius: 8,
                marginBottom: 24,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 13, color: T.muted }}>
                No private clues added yet.
              </div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
                Examples: "Small tear on right strap", "Red keychain attached",
                "Blue notebook inside"
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(1)} style={btnSecondary}>
              <ArrowLeftIcon size={14} />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="rx-btn-primary"
              style={btnPrimary(false)}
            >
              <span>Review & Publish</span>
              <ArrowRightIcon size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="rx-step-content">
          <div style={eyebrowStyle}>04 REVIEW</div>
          <h2 style={hStyle}>Review report</h2>
          <p style={{ fontSize: 13, color: T.text2, margin: "0 0 24px" }}>
            Verify the separation between public directory listings and sealed
            ownership evidence.
          </p>

          <ReviewBlock label="PUBLIC INFORMATION">
            <Row k="Item" v={itemName} />
            <Row k="Category" v={category} />
            <Row k="Description" v={description} />
            <Row k="Location" v={location} />
            <Row
              k="Date / Time"
              v={`${date || "Today"} ${time ? `· ${time}` : ""}`}
            />
            {uploadedImage && (
              <div style={{ marginTop: 12 }}>
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: T.muted,
                    marginBottom: 8,
                  }}
                >
                  Uploaded Found Item Photo
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 140,
                    borderRadius: 8,
                    overflow: "hidden",
                    border: `1px solid ${T.border}`,
                  }}
                >
                  <img
                    src={uploadedImage}
                    alt="Found Item Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              </div>
            )}
          </ReviewBlock>

          <ReviewBlock label="PRIVATE INFORMATION (PROOF LOCKER)" accent>
            {clues.length === 0 ? (
              <div style={{ fontSize: 12, color: T.muted }}>
                No private clues registered.
              </div>
            ) : (
              clues.map((c, i) => (
                <Row
                  key={i}
                  k={`Private Clue ${i + 1}`}
                  v={c.sealed ? "●●●●●●●●●● (Sealed in Proof Locker)" : c.text}
                  mono={c.sealed}
                />
              ))
            )}
          </ReviewBlock>

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={() => setStep(2)} style={btnSecondary}>
              <ArrowLeftIcon size={14} />
              <span>Back</span>
            </button>
            <MagneticButton
              variant="primary"
              dataCursor="report"
              onClick={publish}
              style={{
                padding: "11px 24px",
                borderRadius: 7,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <span>Publish Found Item</span>
              <ArrowRightIcon size={14} />
            </MagneticButton>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Clue item with mechanical latch sealing interaction ───────────────────────
function ClueItem({
  clue,
  onSeal,
  onRemove,
}: {
  clue: Clue
  onSeal: () => void
  onRemove: () => void
}) {
  const { sealed, sealing, text } = clue

  return (
    <div
      className="rx-interactive"
      style={{
        position: "relative",
        borderRadius: 8,
        padding: "14px 16px",
        background: sealed ? "#0B0E13" : T.surface2,
        border: sealed
          ? `1px solid ${T.gold}66`
          : sealing
            ? `1px solid ${T.accent2}88`
            : `1px dashed ${T.border}`,
        transition:
          "background 450ms cubic-bezier(0.22, 1, 0.36, 1), border 450ms ease-out, box-shadow 450ms ease-out",
        boxShadow: sealed ? `0 0 16px ${T.gold}14` : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
        {/* Physical latch lock icon */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 26,
            height: 26,
            borderRadius: 5,
            background: sealed ? `${T.gold}20` : `${T.border}44`,
            color: sealed ? T.gold : T.muted,
            transform: sealed
              ? "scale(1)"
              : sealing
                ? "scale(0.95) rotate(-10deg)"
                : "scale(1)",
            transition: "all 400ms cubic-bezier(0.22, 1, 0.36, 1)",
            flexShrink: 0,
          }}
        >
          <LockIcon size={14} locked={sealed || sealing} />
        </div>

        {/* Text shifts muted -> primary color */}
        <div>
          <div
            style={{
              fontSize: 13,
              color: sealed ? T.text : T.muted,
              fontFamily: sealed ? T.mono : T.sans,
              transition: "color 350ms cubic-bezier(0.22, 1, 0.36, 1)",
              letterSpacing: sealed ? "0.04em" : "normal",
            }}
          >
            {sealed ? `[SEALED EVIDENCE] ${text}` : text}
          </div>
          <div
            style={{
              fontSize: 10,
              fontFamily: T.mono,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: sealed ? T.gold : sealing ? T.accent2 : T.muted,
              marginTop: 2,
              fontWeight: sealed ? 600 : 400,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {sealed && (
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  backgroundColor: T.gold,
                }}
              />
            )}
            {sealed ? "SEALED" : sealing ? "LATCHING EVIDENCE..." : "UNSEALED"}
          </div>
        </div>
      </div>

      <div
        style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}
      >
        {!sealed && !sealing && (
          <button
            onClick={onSeal}
            style={{
              background: `${T.accent}1c`,
              border: `1px solid ${T.accent}55`,
              color: T.accent,
              fontSize: 11,
              fontWeight: 500,
              padding: "5px 12px",
              borderRadius: 5,
              cursor: "pointer",
              fontFamily: T.sans,
              transition: "all 150ms ease-out",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = `${T.accent}33`)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = `${T.accent}1c`)
            }
          >
            Seal Clue
          </button>
        )}

        <button
          onClick={onRemove}
          title="Remove clue"
          style={{
            background: "none",
            border: "none",
            color: T.muted,
            cursor: "pointer",
            padding: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CrossIcon size={14} />
        </button>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: T.muted,
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

function ReviewBlock({
  label,
  children,
  accent,
}: {
  label: string
  children: React.ReactNode
  accent?: boolean
}) {
  return (
    <div
      style={{
        background: T.surface2,
        border: `1px solid ${accent ? `${T.accent}44` : T.border}`,
        borderRadius: 9,
        padding: "18px 20px",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: accent ? T.accent : T.muted,
          marginBottom: 12,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {children}
      </div>
    </div>
  )
}

interface RowProps {
  k: string
  v: string
  mono?: boolean
}

function Row({ k, v, mono }: RowProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "130px 1fr",
        gap: 8,
        fontSize: 12,
        padding: "4px 0",
        borderBottom: `1px solid ${T.border}44`,
      }}
    >
      <span style={{ color: T.muted }}>{k}</span>
      <span style={{ color: T.text, fontFamily: mono ? T.mono : T.sans }}>
        {v || "—"}
      </span>
    </div>
  )
}

const eyebrowStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: T.muted,
  marginBottom: 12,
}

const hStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 600,
  letterSpacing: "-0.02em",
  color: T.text,
  margin: "0 0 16px",
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: T.surface2,
  border: `1px solid ${T.border}`,
  borderRadius: 7,
  padding: "11px 14px",
  color: T.text,
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: T.sans,
}

const btnPrimary = (disabled: boolean): React.CSSProperties => ({
  background: disabled ? T.surface3 : T.accent,
  border: "none",
  color: disabled ? T.muted : "#fff",
  fontSize: 13,
  fontWeight: 500,
  padding: "11px 22px",
  borderRadius: 7,
  cursor: disabled ? "not-allowed" : "pointer",
  fontFamily: T.sans,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  transition:
    "filter var(--dur-micro) var(--ease-out-quint), background 200ms ease-out",
})

const btnSecondary: React.CSSProperties = {
  background: "none",
  border: `1px solid ${T.border}`,
  color: T.text2,
  fontSize: 13,
  fontWeight: 500,
  padding: "11px 18px",
  borderRadius: 7,
  cursor: "pointer",
  fontFamily: T.sans,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
}
