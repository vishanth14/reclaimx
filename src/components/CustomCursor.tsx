import { useEffect, useState, useRef } from "react";
import { T } from "../tokens";

type CursorType = "default" | "hover" | "cta" | "view" | "explore" | "claim" | "report";

export function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [cursorType, setCursorType] = useState<CursorType>("default");
  const [clicking, setClicking] = useState(false);
  const [visible, setVisible] = useState(false);

  // Mouse coordinates & smoothly interpolated follower coordinates
  const mouseRef = useRef({ x: -100, y: -100 });
  const followerRef = useRef({ x: -100, y: -100 });
  const dotElRef = useRef<HTMLDivElement>(null);
  const followerElRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Only enable on desktop with fine pointer and no reduced-motion preference
    if (typeof window === "undefined") return;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const isSmall = window.innerWidth < 768;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || isSmall || prefersReduced) return;

    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    const handleMouseEnter = () => {
      setVisible(true);
    };

    const handleMouseDown = () => {
      setClicking(true);
    };

    const handleMouseUp = () => {
      setClicking(false);
    };

    // Detect hovered element types and contextual tags
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // 1. Contextual tag checks
      const taggedEl = target.closest("[data-cursor]") as HTMLElement | null;
      if (taggedEl) {
        const val = taggedEl.getAttribute("data-cursor") as CursorType;
        if (["view", "explore", "claim", "report", "cta"].includes(val)) {
          setCursorType(val);
          return;
        }
      }

      // 2. Button / CTA / Interactive checks
      const isCta = target.closest("button.rx-cta, a.rx-cta, .rx-cta-btn");
      if (isCta) {
        setCursorType("cta");
        return;
      }

      const isInteractive = target.closest(
        "button, a, input, textarea, select, [role='button'], .rx-interactive"
      );
      if (isInteractive) {
        setCursorType("hover");
        return;
      }

      setCursorType("default");
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleMouseOver, { passive: true });

    // Animation loop for smooth follower lag (fluid kinetic motion)
    const loop = () => {
      // Immediate dot placement
      if (dotElRef.current) {
        dotElRef.current.style.transform = `translate3d(${mouseRef.current.x}px, ${mouseRef.current.y}px, 0)`;
      }

      // Smooth lag for follower (linear interpolation)
      const ease = 0.16;
      followerRef.current.x += (mouseRef.current.x - followerRef.current.x) * ease;
      followerRef.current.y += (mouseRef.current.y - followerRef.current.y) * ease;

      if (followerElRef.current) {
        followerElRef.current.style.transform = `translate3d(${followerRef.current.x}px, ${followerRef.current.y}px, 0)`;
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleMouseOver);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [visible]);

  if (!mounted) return null;

  // Compute sizing, styling, and label based on cursorType
  let ringSize = 28;
  let ringBorder = `1px solid ${T.accent}88`;
  let ringBg = "transparent";
  let ringText: string | null = null;
  let dotSize = 6;
  let dotBg: string = T.text;

  switch (cursorType) {
    case "hover":
      ringSize = 38;
      ringBorder = `1px solid ${T.accent}`;
      ringBg = `${T.accent}14`;
      dotSize = 4;
      dotBg = T.accent2;
      break;
    case "cta":
      ringSize = 46;
      ringBorder = `1.5px solid ${T.gold}`;
      ringBg = `${T.gold}16`;
      dotSize = 4;
      dotBg = T.gold;
      break;
    case "view":
      ringSize = 56;
      ringBorder = `1px solid ${T.accent2}`;
      ringBg = "rgba(9, 11, 15, 0.85)";
      ringText = "VIEW";
      dotSize = 0;
      break;
    case "explore":
      ringSize = 58;
      ringBorder = `1px solid ${T.accent}`;
      ringBg = "rgba(9, 11, 15, 0.85)";
      ringText = "EXPLORE";
      dotSize = 0;
      break;
    case "claim":
      ringSize = 58;
      ringBorder = `1.5px solid ${T.gold}`;
      ringBg = "rgba(9, 11, 15, 0.88)";
      ringText = "CLAIM";
      dotSize = 0;
      break;
    case "report":
      ringSize = 60;
      ringBorder = `1.5px solid ${T.accent}`;
      ringBg = "rgba(9, 11, 15, 0.88)";
      ringText = "REPORT";
      dotSize = 0;
      break;
    default:
      break;
  }

  if (clicking) {
    ringSize = Math.max(18, ringSize - 10);
    dotSize = Math.max(8, dotSize + 2);
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 99999,
        opacity: visible ? 1 : 0,
        transition: "opacity 200ms ease",
      }}
    >
      {/* Delayed circular follower */}
      <div
        ref={followerElRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: ringSize,
          height: ringSize,
          marginTop: -ringSize / 2,
          marginLeft: -ringSize / 2,
          borderRadius: "50%",
          border: ringBorder,
          backgroundColor: ringBg,
          boxShadow:
            cursorType === "claim" || cursorType === "cta"
              ? `0 0 16px ${T.gold}44`
              : cursorType === "view"
              ? `0 0 14px ${T.accent2}40`
              : cursorType === "hover"
              ? `0 0 10px ${T.accent}40`
              : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: ringText ? "blur(4px)" : "none",
          transition:
            "width 200ms cubic-bezier(0.16, 1, 0.3, 1), height 200ms cubic-bezier(0.16, 1, 0.3, 1), margin 200ms cubic-bezier(0.16, 1, 0.3, 1), border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease",
          willChange: "transform",
        }}
      >
        {ringText && (
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 8.5,
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: cursorType === "claim" ? T.gold : cursorType === "view" ? T.accent2 : "#fff",
              userSelect: "none",
            }}
          >
            {ringText}
          </span>
        )}
      </div>

      {/* Immediate center dot (hidden when contextual badge displays) */}
      {dotSize > 0 && (
        <div
          ref={dotElRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: dotSize,
            height: dotSize,
            marginTop: -dotSize / 2,
            marginLeft: -dotSize / 2,
            borderRadius: "50%",
            backgroundColor: dotBg,
            transition:
              "width 120ms ease, height 120ms ease, margin 120ms ease, background-color 150ms ease",
            willChange: "transform",
          }}
        />
      )}

      {/* Click ripple animation */}
      {clicking && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: `translate3d(${mouseRef.current.x}px, ${mouseRef.current.y}px, 0)`,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              marginTop: -19,
              marginLeft: -19,
              borderRadius: "50%",
              border: `1px solid ${cursorType === "claim" || cursorType === "cta" ? T.gold : T.accent}88`,
              animation: "rx-cursor-ripple 150ms ease-out forwards",
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes rx-cursor-ripple {
          0% { transform: scale(0.6); opacity: 0.85; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
