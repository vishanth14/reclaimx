import { useState, useRef, type ReactNode, type MouseEvent, type CSSProperties } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  style?: CSSProperties;
  dataCursor?: "cta" | "claim" | "report" | "hover" | "view";
  strength?: number; // 0.1 to 0.35, default 0.22
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary";
}

export function MagneticButton({
  children,
  onClick,
  className = "",
  style = {},
  dataCursor = "cta",
  strength = 0.22,
  disabled = false,
  type = "button",
  variant = "primary",
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [sheenPos, setSheenPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled || typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const btn = buttonRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    // Cap at max 8px
    const maxShift = 8;
    const clampedX = Math.max(-maxShift, Math.min(maxShift, deltaX));
    const clampedY = Math.max(-maxShift, Math.min(maxShift, deltaY));

    setOffset({ x: clampedX, y: clampedY });

    // Sheen coordinates
    const sheenX = ((e.clientX - rect.left) / rect.width) * 100;
    const sheenY = ((e.clientY - rect.top) / rect.height) * 100;
    setSheenPos({ x: sheenX, y: sheenY });
  };

  const handleMouseEnter = () => {
    if (disabled) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsActive(false);
    setOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = () => {
    if (disabled) return;
    setIsActive(true);
  };

  const handleMouseUp = () => {
    setIsActive(false);
  };

  const currentScale = isActive ? 0.97 : isHovered ? 1.02 : 1;
  const transform = `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${currentScale})`;

  return (
    <button
      ref={buttonRef}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      data-cursor={dataCursor}
      className={`rx-magnetic-btn ${variant === "primary" ? "rx-btn-primary" : "rx-btn-secondary"} ${className}`}
      style={{
        ...style,
        transform,
        transition: isHovered
          ? "transform 80ms ease-out, box-shadow 200ms ease"
          : "transform 400ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 300ms ease",
        position: "relative",
        overflow: "hidden",
        willChange: "transform",
      }}
    >
      {/* Subtle dynamic sheen moving across button surface on hover */}
      {isHovered && !disabled && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `radial-gradient(circle 80px at ${sheenPos.x}% ${sheenPos.y}%, rgba(255, 255, 255, 0.16), transparent 70%)`,
            transition: "opacity 200ms ease",
          }}
        />
      )}
      <span style={{ position: "relative", zIndex: 2, display: "inline-flex", alignItems: "center", gap: "inherit" }}>
        {children}
      </span>
    </button>
  );
}
