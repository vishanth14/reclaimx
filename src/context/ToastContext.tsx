import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react"
import { T } from "../tokens"

interface Toast {
  id: number
  message: string
  type: "success" | "info" | "error"
  duration: number
}

interface ToastCtx {
  toast: (message: string, type?: Toast["type"], duration?: number) => void
}

const Ctx = createContext<ToastCtx>({ toast: () => {} })
export const useToast = () => useContext(Ctx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const toast = useCallback(
    (message: string, type: Toast["type"] = "info", duration = 3200) => {
      const id = ++counter.current
      setToasts((t) => [...t, { id, message, type, duration }])
      setTimeout(
        () => setToasts((t) => t.filter((x) => x.id !== id)),
        duration + 300,
      )
    },
    [],
  )

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} />
        ))}
      </div>
    </Ctx.Provider>
  )
}

function ToastItem({ message, type, duration }: Toast) {
  const accentColor =
    type === "success" ? T.accent2 : type === "error" ? "#E05555" : T.accent

  return (
    <div
      style={{
        background: T.surface2,
        border: `1px solid ${T.border}`,
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: 8,
        padding: "12px 16px",
        minWidth: 260,
        maxWidth: 360,
        pointerEvents: "all",
        position: "relative",
        overflow: "hidden",
        animation: "toast-enter 200ms cubic-bezier(0.22,1,0.36,1) forwards",
      }}
    >
      <style>{`
        @keyframes toast-enter {
          0%   { opacity: 0; transform: translateY(-12px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toast-countdown {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes toast-enter { from { opacity: 1; transform: none; } }
        }
      `}</style>
      <span style={{ fontSize: 13, color: T.text, lineHeight: 1.4 }}>
        {message}
      </span>
      {/* Countdown line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          right: 0,
          height: 2,
          background: `${accentColor}44`,
          transformOrigin: "left",
          animation: `toast-countdown ${duration}ms linear forwards`,
        }}
      />
    </div>
  )
}
