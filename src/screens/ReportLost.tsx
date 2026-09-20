import { useState } from "react"
import { T } from "../tokens"
import { CATEGORIES } from "../services/mockData"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  PlusIcon,
} from "../components/Icons"
import { MagneticButton } from "../components/MagneticButton"
import { itemsService } from "../services/itemsService"
import { useToast } from "../context/ToastContext"
import type { Screen } from "../App"

const defaultTimeline = [
  { place: "Cafeteria", time: "1:20 PM" },
  { place: "Library", time: "1:35 PM" },
  { place: "Bus Stop", time: "1:50 PM" },
]

export function ReportLost({
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
  const [color, setColor] = useState("")
  const [brand, setBrand] = useState("")
  const [marks, setMarks] = useState("")
  const [accessories, setAccessories] = useState("")
  const [contents, setContents] = useState("")
  const [timeline, setTimeline] = useState(defaultTimeline)
  const [newPlace, setNewPlace] = useState("")
  const [newTime, setNewTime] = useState("")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  const handleSubmit = () => {
    const { item, matches } = itemsService.createLostItem({
      category: category || "Bags",
      title: itemName || `${category || "Lost"} item`,
      description: description || "Lost item reported on campus",
      location: location || "Central Library",
      date: date || "Today",
      time: time || "Just now",
      imageUrl: uploadedImage || undefined,
      imageAlt: itemName ? `User reference photo of ${itemName}` : undefined,
      characteristics: {
        color,
        brand,
        marks,
        accessories,
        contents,
      },
    })

    if (typeof window !== "undefined") {
      localStorage.setItem("reclaimx_active_lost_id", item.id)
    }

    toast(
      matches.length > 0
        ? `Report registered — ${matches.length} potential matches identified`
        : "Report registered in recovery network",
      "success",
    )
    onNavigate("matching")
  }

  const steps = [
    "ITEM",
    "LOCATION",
    "CHARACTERISTICS",
    "RECOVERY TIMELINE",
    "REVIEW",
  ]

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

  function addTimelinePoint() {
    if (!newPlace.trim() || !newTime.trim()) return
    setTimeline((prev) => [
      ...prev,
      { place: newPlace.trim(), time: newTime.trim() },
    ])
    setNewPlace("")
    setNewTime("")
  }

  return (
    <div style={{ padding: "40px 48px", maxWidth: 680 }}>
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

      {/* Progress Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          marginBottom: 40,
          flexWrap: "wrap",
          rowGap: 10,
        }}
      >
        {steps.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center" }}>
            <div
              onClick={() => i < step && setStep(i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
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
                    "background 260ms cubic-bezier(0.22, 1, 0.36, 1), border-color 260ms",
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
                  width: 20,
                  height: 1,
                  background: i < step ? `${T.accent}88` : T.border,
                  margin: "0 10px",
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
          <h2 style={hStyle}>What did you lose?</h2>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Category</label>
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
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Item name</label>
            <input
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Leather wallet, Wireless earbuds..."
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the lost item in detail..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
            />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Item Photograph (Optional)</label>
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
                  alt="Uploaded reference"
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
                  + Upload reference photograph
                </span>
                <span style={{ fontSize: 10, color: T.muted }}>
                  PNG, JPG, or WebP up to 5MB
                </span>
              </label>
            )}
          </div>
          <button
            onClick={() => setStep(1)}
            disabled={!category || !itemName.trim()}
            className="rx-btn-primary"
            style={btnPrimary(!category || !itemName.trim())}
          >
            <span>Continue to Location</span>
            <ArrowRightIcon size={14} />
          </button>
        </div>
      )}

      {/* Step 1: Location */}
      {step === 1 && (
        <div className="rx-step-content">
          <div style={eyebrowStyle}>02 LOCATION</div>
          <h2 style={hStyle}>Where did you lose it?</h2>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Last known location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Central Library, Cafeteria, Sports Complex..."
              style={inputStyle}
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 28,
            }}
          >
            <div>
              <label style={labelStyle}>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Approximate time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(0)} style={btnSecondary}>
              <ArrowLeftIcon size={14} />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={!location.trim()}
              className="rx-btn-primary"
              style={btnPrimary(!location.trim())}
            >
              <span>Continue to Characteristics</span>
              <ArrowRightIcon size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Characteristics */}
      {step === 2 && (
        <div className="rx-step-content">
          <div style={eyebrowStyle}>03 CHARACTERISTICS</div>
          <h2 style={hStyle}>Distinctive details</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div>
              <label style={labelStyle}>Color</label>
              <input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Dark brown, Matte black..."
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Brand / Manufacturer</label>
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Bellroy, Apple, Sony..."
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Distinctive marks</label>
            <input
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              placeholder="e.g. Small scratch on left corner, sticker on back..."
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Accessories</label>
            <input
              value={accessories}
              onChange={(e) => setAccessories(e.target.value)}
              placeholder="e.g. Red keychain attached, carabiner..."
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Contents</label>
            <input
              value={contents}
              onChange={(e) => setContents(e.target.value)}
              placeholder="e.g. Blue notebook, student ID card inside..."
              style={inputStyle}
            />
          </div>
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
              <span>Continue to Recovery Timeline</span>
              <ArrowRightIcon size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Recovery Timeline */}
      {step === 3 && (
        <div className="rx-step-content">
          <div style={eyebrowStyle}>04 RECOVERY TIMELINE</div>
          <h2 style={hStyle}>Your movements</h2>
          <p style={{ fontSize: 13, color: T.text2, margin: "0 0 24px" }}>
            Adding points along your path helps the matching engine
            cross-reference where finders reported items.
          </p>

          <div
            style={{
              background: T.surface2,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: "20px",
              marginBottom: 24,
            }}
          >
            {timeline.map((point, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "flex-start", gap: 14 }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: T.accent,
                      marginTop: 4,
                    }}
                  />
                  {i < timeline.length - 1 && (
                    <div
                      style={{
                        width: 1,
                        height: 36,
                        background: `${T.accent}66`,
                        margin: "4px 0",
                      }}
                    />
                  )}
                </div>
                <div
                  style={{
                    paddingBottom: i < timeline.length - 1 ? 16 : 0,
                    flex: 1,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 500, color: T.text }}>
                    {point.place}
                  </div>
                  <div
                    style={{ fontSize: 11, fontFamily: T.mono, color: T.muted }}
                  >
                    {point.time}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
            <input
              value={newPlace}
              onChange={(e) => setNewPlace(e.target.value)}
              placeholder="Campus point (e.g. Student Center)"
              style={{ ...inputStyle, flex: 1 }}
            />
            <input
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              placeholder="Time (e.g. 2:10 PM)"
              style={{ ...inputStyle, width: 140 }}
            />
            <button
              onClick={addTimelinePoint}
              style={{
                ...btnPrimary(false),
                padding: "11px 16px",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <PlusIcon size={14} />
              <span>Add</span>
            </button>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(2)} style={btnSecondary}>
              <ArrowLeftIcon size={14} />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(4)}
              className="rx-btn-primary"
              style={btnPrimary(false)}
            >
              <span>Review Report</span>
              <ArrowRightIcon size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="rx-step-content">
          <div style={eyebrowStyle}>05 REVIEW</div>
          <h2 style={hStyle}>Review report</h2>

          <div
            style={{
              background: T.surface2,
              border: `1px solid ${T.border}`,
              borderRadius: 9,
              overflow: "hidden",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                padding: "12px 18px",
                background: T.surface3,
                borderBottom: `1px solid ${T.border}`,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: T.muted,
                }}
              >
                Lost Item Summary
              </span>
            </div>
            <div
              style={{
                padding: "16px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {[
                { k: "Item", v: itemName },
                { k: "Category", v: category },
                { k: "Description", v: description },
                { k: "Last seen", v: location },
                {
                  k: "Date / Time",
                  v: `${date || "Today"} ${time ? `· ${time}` : ""}`,
                },
                { k: "Color", v: color },
                { k: "Brand", v: brand },
                { k: "Distinctive Marks", v: marks },
                { k: "Accessories", v: accessories },
                { k: "Contents", v: contents },
                { k: "Timeline Points", v: `${timeline.length} points logged` },
              ].map((r) => (
                <div
                  key={r.k}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "150px 1fr",
                    gap: 8,
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: T.muted }}>{r.k}</span>
                  <span style={{ color: T.text }}>{r.v || "—"}</span>
                </div>
              ))}
            </div>

            {uploadedImage && (
              <div style={{ padding: "0 18px 18px" }}>
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: T.muted,
                    marginBottom: 8,
                  }}
                >
                  Uploaded Reference Photo
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 160,
                    borderRadius: 8,
                    overflow: "hidden",
                    border: `1px solid ${T.border}`,
                  }}
                >
                  <img
                    src={uploadedImage}
                    alt="Uploaded Item Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(3)} style={btnSecondary}>
              <ArrowLeftIcon size={14} />
              <span>Back</span>
            </button>
            <MagneticButton
              variant="primary"
              dataCursor="report"
              onClick={handleSubmit}
              style={{
                padding: "11px 24px",
                borderRadius: 7,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <span>Submit Report & Find Matches</span>
              <ArrowRightIcon size={14} />
            </MagneticButton>
          </div>
        </div>
      )}
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

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: T.muted,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  display: "block",
  marginBottom: 8,
  fontWeight: 500,
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
