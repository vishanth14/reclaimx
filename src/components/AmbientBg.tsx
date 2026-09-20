import { T } from "../tokens"

type Tier = 1 | 2

// Constellation node positions (% of container)
const nodes = [
  { cx: 15, cy: 25 },
  { cx: 42, cy: 12 },
  { cx: 68, cy: 30 },
  { cx: 85, cy: 18 },
  { cx: 28, cy: 65 },
  { cx: 55, cy: 78 },
  { cx: 80, cy: 70 },
  { cx: 10, cy: 82 },
]

// Edges — pairs that form "two paths reconnecting"
const edges = [
  [0, 1],
  [1, 2],
  [2, 3], // upper path
  [7, 4],
  [4, 5],
  [5, 6], // lower path
  [2, 5], // reconnection bridge
]

export function AmbientBg({ tier = 1 }: { tier?: Tier }) {
  const blobOpacity = tier === 1 ? 0.07 : 0.03
  const lineOpacity = tier === 1 ? 0.045 : 0.02
  const blobDuration = tier === 1 ? 28 : 44
  const lineDuration = tier === 1 ? 34 : 50

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .rx-ambient-blob, .rx-constellation { animation: none !important; }
        }
        @keyframes rx-drift-a {
          0%, 100% { transform: translate(0,0) scale(1); }
          33%       { transform: translate(38px, 28px) scale(1.04); }
          66%       { transform: translate(-18px, 48px) scale(0.97); }
        }
        @keyframes rx-drift-b {
          0%, 100% { transform: translate(0,0) scale(1); }
          40%       { transform: translate(-46px, -28px) scale(1.05); }
          72%       { transform: translate(18px, -46px) scale(0.96); }
        }
        @keyframes rx-constellation-drift {
          0%, 100% { transform: translate(0, 0); }
          50%       { transform: translate(12px, 8px); }
        }
      `}</style>

      {/* Gradient blob A — top-left */}
      <div
        className="rx-ambient-blob"
        style={{
          position: "absolute",
          top: tier === 2 ? "-25%" : "-8%",
          left: tier === 2 ? "-20%" : "-4%",
          width: 640,
          height: 640,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${T.accent} 0%, transparent 70%)`,
          opacity: blobOpacity,
          animation: `rx-drift-a ${blobDuration}s ease-in-out infinite`,
          willChange: "transform",
        }}
      />

      {/* Gradient blob B — bottom-right */}
      <div
        className="rx-ambient-blob"
        style={{
          position: "absolute",
          bottom: tier === 2 ? "-25%" : "-4%",
          right: tier === 2 ? "-20%" : "-4%",
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${T.accent2} 0%, transparent 70%)`,
          opacity: blobOpacity * 0.8,
          animation: `rx-drift-b ${blobDuration * 1.3}s ease-in-out infinite`,
          willChange: "transform",
        }}
      />

      {/* Constellation lines — "two paths reconnecting" brand concept */}
      {tier === 1 && (
        <div
          className="rx-constellation"
          style={{
            position: "absolute",
            inset: 0,
            animation: `rx-constellation-drift ${lineDuration}s ease-in-out infinite`,
            willChange: "transform",
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
            style={{ opacity: lineOpacity }}
          >
            {/* Lines */}
            {edges.map(([a, b], i) => (
              <line
                key={i}
                x1={`${nodes[a].cx}%`}
                y1={`${nodes[a].cy}%`}
                x2={`${nodes[b].cx}%`}
                y2={`${nodes[b].cy}%`}
                stroke={i === edges.length - 1 ? T.accent2 : T.accent}
                strokeWidth="0.15"
              />
            ))}
            {/* Nodes */}
            {nodes.map((n, i) => (
              <circle
                key={i}
                cx={`${n.cx}%`}
                cy={`${n.cy}%`}
                r="0.35"
                fill={T.accent}
                opacity={0.6}
              />
            ))}
          </svg>
        </div>
      )}

      {/* Tier 2: faint edges-only constellation fragments */}
      {tier === 2 && (
        <svg
          className="rx-constellation"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: lineOpacity,
            animation: `rx-constellation-drift ${lineDuration}s ease-in-out infinite`,
          }}
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          <line
            x1="0%"
            y1="8%"
            x2="18%"
            y2="2%"
            stroke={T.accent}
            strokeWidth="0.1"
          />
          <line
            x1="82%"
            y1="94%"
            x2="100%"
            y2="88%"
            stroke={T.accent2}
            strokeWidth="0.1"
          />
          <circle cx="18%" cy="2%" r="0.25" fill={T.accent} opacity="0.5" />
          <circle cx="82%" cy="94%" r="0.25" fill={T.accent2} opacity="0.5" />
        </svg>
      )}
    </div>
  )
}
