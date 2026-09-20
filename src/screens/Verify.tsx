import { useState, useEffect } from "react"
import { T } from "../tokens"
import { verificationService } from "../services/verificationService"
import { claimsService } from "../services/claimsService"
import { storageService } from "../services/storageService"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ShieldIcon,
} from "../components/Icons"
import { MagneticButton } from "../components/MagneticButton"
import type { Screen } from "../App"

export function Verify({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [activeFoundId, setActiveFoundId] = useState("RX-8834-B")
  const [questions, setQuestions] = useState<
    { id: string; q: string; placeholder: string }[]
  >([
    {
      id: "clue-1",
      q: "What was attached to the backpack?",
      placeholder: "Describe any keychains, attachments, tags, or clips…",
    },
    {
      id: "clue-2",
      q: "Where was the distinctive damage or mark?",
      placeholder: "Describe the tear, zipper condition, markings…",
    },
    {
      id: "clue-3",
      q: "What was inside the main or front compartment?",
      placeholder: "Notebooks, adapters, electronics, documents…",
    },
  ])

  useEffect(() => {
    const foundId =
      (typeof window !== "undefined" &&
        (localStorage.getItem("reclaimx_active_found_id") ||
          localStorage.getItem("reclaimx_active_item_id"))) ||
      "RX-8834-B"
    setActiveFoundId(foundId)

    const publicQs = verificationService.getPublicQuestions(foundId)
    if (publicQs && publicQs.length > 0) {
      setQuestions(
        publicQs.map((q) => ({
          id: q.id,
          q: q.question,
          placeholder: q.placeholder || "Enter details known only to the true owner…",
        })),
      )
    }
  }, [])

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>(["", "", ""])
  const [submitting, setSubmitting] = useState(false)
  const [evalPhase, setEvalPhase] = useState(0)
  const [result, setResult] = useState<"pass" | "fail" | null>(null)
  const [matchedCategories, setMatchedCategories] = useState<string[]>([])

  // Keep answers array size in sync with questions
  useEffect(() => {
    setAnswers((prev) =>
      questions.map((_, i) => prev[i] || ""),
    )
  }, [questions])

  const phases = [
    "Preparing verification",
    "Checking evidence",
    "Evaluating criteria",
    "Verification complete",
  ]

  async function handleSubmit() {
    setSubmitting(true)
    setEvalPhase(0)
    await new Promise((r) => setTimeout(r, 220))
    setEvalPhase(1)
    await new Promise((r) => setTimeout(r, 240))
    setEvalPhase(2)

    const formattedAnswers = questions.map((q, i) => ({
      clueId: q.id,
      question: q.q,
      answer: answers[i] || "",
    }))

    const evaluation = await verificationService.evaluateVerification(
      activeFoundId,
      formattedAnswers,
    )

    setEvalPhase(3)
    await new Promise((r) => setTimeout(r, 200))
    setSubmitting(false)

    if (evaluation.passed) {
      setMatchedCategories(evaluation.matchedCategories)
      // Create or update active claim
      const activeLostId =
        (typeof window !== "undefined" &&
          localStorage.getItem("reclaimx_active_lost_id")) ||
        "RX-LOST-101"

      const existingClaims = claimsService.getClaims()
      let claim = existingClaims.find(
        (c) => c.foundItemId === activeFoundId && c.status !== "completed",
      )

      if (!claim) {
        claim = claimsService.createClaim(activeLostId, activeFoundId)
      }

      await claimsService.submitVerification(claim.id, formattedAnswers)
      if (typeof window !== "undefined") {
        localStorage.setItem("reclaimx_active_claim_id", claim.id)
      }
      setResult("pass")
    } else {
      setResult("fail")
    }
  }

  if (result === "pass") return <VerifyPass onNavigate={onNavigate} />
  if (result === "fail") {
    return (
      <VerifyFail
        onNavigate={onNavigate}
        onRetry={() => {
          setResult(null)
          setAnswers(["", "", ""])
          setStep(0)
        }}
      />
    )
  }

  return (
    <div style={{ padding: "40px 48px", maxWidth: 620 }}>
      <style>{`
        @keyframes indeterminate-eval {
          0%   { left: -30%; width: 25%; }
          50%  { left: 35%; width: 45%; }
          100% { left: 105%; width: 25%; }
        }
        @keyframes question-slide {
          from { opacity: 0; transform: translateX(8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes indeterminate-eval { 0%,100% { left:0; width:100%; } }
          @keyframes question-slide { from { opacity: 0; } to { opacity: 1; } }
        }
      `}</style>

      <button
        onClick={() => onNavigate("item-detail")}
        style={{
          background: "none",
          border: "none",
          color: T.muted,
          fontSize: 12,
          cursor: "pointer",
          padding: 0,
          marginBottom: 28,
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontFamily: T.sans,
        }}
      >
        <ArrowLeftIcon size={14} />
        <span>Cancel Claim</span>
      </button>

      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: T.muted,
          marginBottom: 12,
        }}
      >
        PRIVATE VERIFICATION
      </div>
      <h1
        style={{
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: T.text,
          margin: "0 0 10px",
        }}
      >
        Prove it's yours.
      </h1>
      <p
        style={{
          fontSize: 13,
          color: T.text2,
          lineHeight: 1.65,
          margin: "0 0 32px",
        }}
      >
        Answer using what you remember. Private evidence submitted by the finder
        is never revealed.
      </p>

      {/* Step progress indicators */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 32,
          alignItems: "center",
        }}
      >
        {questions.map((_, i) => (
          <div
            key={i}
            style={{
              height: 2,
              flex: 1,
              borderRadius: 1,
              background: i <= step ? T.accent : T.surface3,
              transition: "background 260ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        ))}
        <span
          style={{
            fontFamily: T.mono,
            fontSize: 11,
            color: T.muted,
            whiteSpace: "nowrap",
            marginLeft: 12,
          }}
        >
          0{step + 1} / 0{questions.length}
        </span>
      </div>

      {/* Question container with quiet horizontal slide */}
      <div
        key={step}
        style={{
          animation: "question-slide 220ms var(--ease-out-quint) forwards",
        }}
      >
        <label
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: T.text,
            display: "block",
            marginBottom: 14,
            lineHeight: 1.4,
          }}
        >
          {questions[step].q}
        </label>
        <textarea
          value={answers[step]}
          onChange={(e) =>
            setAnswers((a) =>
              a.map((v, i) => (i === step ? e.target.value : v)),
            )
          }
          placeholder={questions[step].placeholder}
          rows={3}
          style={{
            width: "100%",
            background: T.surface2,
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            padding: "12px 14px",
            color: T.text,
            fontSize: 13,
            outline: "none",
            resize: "vertical",
            lineHeight: 1.55,
            boxSizing: "border-box",
            fontFamily: T.sans,
          }}
        />
      </div>

      {/* Navigation Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 24,
        }}
      >
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rx-btn-secondary"
          style={{
            background: "none",
            border: `1px solid ${step === 0 ? T.surface3 : T.border}`,
            color: step === 0 ? T.muted : T.text2,
            fontSize: 13,
            padding: "10px 18px",
            borderRadius: 7,
            cursor: step === 0 ? "default" : "pointer",
            fontFamily: T.sans,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <ArrowLeftIcon size={14} />
          <span>Previous</span>
        </button>

        {step < questions.length - 1 ? (
          <MagneticButton
            variant="primary"
            onClick={() => setStep((s) => s + 1)}
            disabled={!answers[step].trim()}
            style={{
              padding: "10px 22px",
              borderRadius: 7,
              fontSize: 13,
            }}
          >
            <span>Next</span>
            <ArrowRightIcon size={14} />
          </MagneticButton>
        ) : (
          <MagneticButton
            variant="primary"
            onClick={handleSubmit}
            disabled={submitting || !answers[step].trim()}
            style={{
              padding: "10px 24px",
              borderRadius: 7,
              fontSize: 13,
            }}
          >
            <span>
              {submitting ? "Evaluating evidence…" : "Submit Answers"}
            </span>
            {!submitting && <ArrowRightIcon size={14} />}
          </MagneticButton>
        )}
      </div>

      {/* Evaluating State: Thin horizontal animated progress line */}
      {submitting && (
        <div style={{ marginTop: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
              fontSize: 12,
              fontFamily: T.mono,
              color: evalPhase === 3 ? T.gold : T.accent2,
              transition: "color var(--dur-micro) ease",
            }}
          >
            <span>{phases[evalPhase]}</span>
            <span>{Math.round(((evalPhase + 1) / phases.length) * 100)}%</span>
          </div>
          <div
            style={{
              position: "relative",
              height: 2,
              background: T.surface3,
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${((evalPhase + 1) / phases.length) * 100}%`,
                background: `linear-gradient(to right, ${T.accent}, ${T.gold})`,
                borderRadius: 1,
                transition: "width 220ms ease-out",
              }}
            />
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: 24,
          padding: "12px 14px",
          background: T.surface2,
          border: `1px solid ${T.border}`,
          borderRadius: 7,
        }}
      >
        <span style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>
          Answers are hashed and evaluated against sealed criteria upon final
          submission. No feedback is given while you type.
        </span>
      </div>
    </div>
  )
}

function VerifyPass({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div style={{ padding: "40px 48px", maxWidth: 560 }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: `1.5px solid ${T.accent2}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
          background: `${T.accent2}14`,
          color: T.accent2,
        }}
      >
        <CheckIcon size={20} strokeWidth={2.2} />
      </div>

      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: T.accent2,
          marginBottom: 12,
        }}
      >
        VERIFICATION SUCCESSFUL
      </div>

      <h1
        className="rx-milestone-title"
        style={{
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: T.gold,
          margin: "0 0 10px",
          textShadow: `0 0 24px ${T.gold}44`,
        }}
      >
        OWNERSHIP VERIFIED
      </h1>

      <p
        style={{
          fontSize: 14,
          color: T.text2,
          lineHeight: 1.65,
          margin: "0 0 28px",
        }}
      >
        Ownership evidence matched the verification criteria.
      </p>

      {/* Evidence categories breakdown */}
      <div
        style={{
          background: T.surface2,
          border: `1px solid ${T.border}`,
          borderRadius: 8,
          padding: "16px 20px",
          marginBottom: 28,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: T.muted,
            marginBottom: 12,
          }}
        >
          Matched Evidence Categories
        </div>
        {[
          "Item characteristics",
          "Private details",
          "Time consistency",
          "Location consistency",
        ].map((e, idx, arr) => (
          <div
            key={e}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom:
                idx < arr.length - 1 ? `1px solid ${T.border}` : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: T.accent2,
                }}
              />
              <span style={{ fontSize: 13, color: T.text }}>{e}</span>
            </div>
            <span
              style={{ fontSize: 11, fontFamily: T.mono, color: T.accent2 }}
            >
              CONFIRMED
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: "12px 14px",
          background: T.surface2,
          border: `1px solid ${T.border}`,
          borderRadius: 7,
          marginBottom: 28,
        }}
      >
        <span style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>
          Ownership verified through sealed evidence criteria matching. Handover
          code is prepared.
        </span>
      </div>

      <MagneticButton
        variant="primary"
        dataCursor="claim"
        onClick={() => onNavigate("handover")}
        style={{
          padding: "12px 26px",
          borderRadius: 7,
          fontSize: 13,
        }}
      >
        <span>Request Handover</span>
        <ArrowRightIcon size={14} />
      </MagneticButton>
    </div>
  )
}

function VerifyFail({
  onNavigate,
  onRetry,
}: {
  onNavigate: (s: Screen) => void
  onRetry: () => void
}) {
  return (
    <div style={{ padding: "40px 48px", maxWidth: 560 }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: `1.5px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
          background: T.surface2,
          color: T.muted,
        }}
      >
        <ShieldIcon size={20} />
      </div>

      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: T.muted,
          marginBottom: 12,
        }}
      >
        VERIFICATION STATUS
      </div>

      <h1
        style={{
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: T.text,
          margin: "0 0 10px",
        }}
      >
        Verification needs more evidence.
      </h1>

      <p
        style={{
          fontSize: 14,
          color: T.text2,
          lineHeight: 1.65,
          margin: "0 0 32px",
        }}
      >
        Some of the information did not match the verification criteria.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <MagneticButton
          variant="primary"
          onClick={onRetry}
          style={{
            padding: "11px 24px",
            borderRadius: 7,
            fontSize: 13,
          }}
        >
          Try Again
        </MagneticButton>
        <MagneticButton
          variant="secondary"
          onClick={() => onNavigate("discover")}
          style={{
            padding: "11px 20px",
            borderRadius: 7,
            fontSize: 13,
          }}
        >
          Cancel Claim
        </MagneticButton>
      </div>
    </div>
  )
}
