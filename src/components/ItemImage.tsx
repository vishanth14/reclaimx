import { useState } from "react"
import { T } from "../tokens"
import { PackageIcon, LayersIcon, ShieldIcon } from "./Icons"

interface ItemImageProps {
  src?: string
  alt?: string
  className?: string
  style?: React.CSSProperties
  fallbackCategory?: string
  aspectRatio?: string
  width?: string | number
  height?: string | number
  borderRadius?: number | string
  zoomOnHover?: boolean
}

function getCategoryIcon(category?: string) {
  switch (category?.toLowerCase()) {
    case "electronics":
    case "academic":
      return <LayersIcon size={16} />
    case "backpack":
    case "bags":
    case "luggage":
      return <PackageIcon size={16} />
    case "keys":
    case "documents":
    case "wallet":
      return <ShieldIcon size={16} />
    default:
      return <PackageIcon size={16} />
  }
}

export function ItemImage({
  src,
  alt = "Campus item photograph",
  className = "",
  style = {},
  fallbackCategory,
  aspectRatio,
  width = "100%",
  height = "100%",
  borderRadius = 8,
  zoomOnHover = true,
}: ItemImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  const isUnavailable = !src || error

  return (
    <div
      className={`rx-item-image-wrapper ${className}`}
      style={{
        position: "relative",
        overflow: "hidden",
        width,
        height,
        aspectRatio,
        borderRadius,
        background: T.surface3,
        border: `1px solid ${T.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        ...style,
      }}
    >
      {/* Loading Skeleton Shimmer */}
      {!loaded && !isUnavailable && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(90deg, ${T.surface2} 25%, ${T.surface3} 50%, ${T.surface2} 75%)`,
            backgroundSize: "400px 100%",
            animation: "skeleton-shimmer 1.6s ease-in-out infinite",
          }}
        />
      )}

      {/* Actual Image */}
      {!isUnavailable ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={zoomOnHover ? "rx-item-image-zoom" : ""}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            opacity: loaded ? 1 : 0,
            transition: "opacity 300ms ease-out, transform 260ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      ) : (
        /* Premium Neutral Fallback */
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            padding: 8,
            color: T.muted,
            background: `radial-gradient(ellipse at center, ${T.surface3} 0%, ${T.surface} 100%)`,
            textAlign: "center",
            userSelect: "none",
          }}
        >
          <div style={{ opacity: 0.6 }}>{getCategoryIcon(fallbackCategory)}</div>
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 8,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: T.muted,
              opacity: 0.8,
            }}
          >
            IMAGE UNAVAILABLE
          </span>
        </div>
      )}

      <style>{`
        .rx-item-image-wrapper:hover .rx-item-image-zoom {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  )
}
