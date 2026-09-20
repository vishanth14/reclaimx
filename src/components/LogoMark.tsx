import { T } from "../tokens"

export function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <path
        d="M4 4 C4 4, 10 14, 14 14"
        stroke={T.accent}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M24 4 C24 4, 18 14, 14 14"
        stroke={T.accent}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M14 14 C14 14, 10 20, 6 24"
        stroke={T.accent2}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M14 14 C14 14, 18 20, 22 24"
        stroke={T.accent2}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="14" cy="14" r="2.5" fill={T.accent} />
    </svg>
  )
}
