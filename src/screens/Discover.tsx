import { useState, useEffect } from "react"
import { T } from "../tokens"
import { itemsService } from "../services/itemsService"
import {
  SearchIcon,
  PackageIcon,
  LayersIcon,
  ShieldIcon,
  ArrowRightIcon,
  FilterIcon,
  ChevronDownIcon,
} from "../components/Icons"
import type { Item } from "../types/items"
import type { Screen } from "../App"
import { ItemImage } from "../components/ItemImage"

const filters = ["All", "Lost", "Found", "Nearby", "Recent"]

function getCategoryIcon(category: string) {
  switch (category) {
    case "Electronics":
    case "Academic":
      return <LayersIcon size={18} />
    case "Backpack":
    case "Bags":
    case "Luggage":
      return <PackageIcon size={18} />
    case "Documents":
    case "Personal Item":
      return <ShieldIcon size={18} />
    default:
      return <PackageIcon size={18} />
  }
}

function SkeletonRow() {
  return (
    <div style={{ borderBottom: `1px solid ${T.border}`, padding: "20px 6px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "48px 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        <div
          className="rx-skeleton"
          style={{ width: 48, height: 48, borderRadius: 8 }}
        />
        <div>
          <div
            className="rx-skeleton"
            style={{ width: 160, height: 13, borderRadius: 4, marginBottom: 8 }}
          />
          <div
            className="rx-skeleton"
            style={{
              width: 220,
              height: 11,
              borderRadius: 4,
              marginBottom: 10,
            }}
          />
          <div
            className="rx-skeleton"
            style={{ width: "80%", height: 11, borderRadius: 4 }}
          />
        </div>
      </div>
    </div>
  )
}

interface DiscoverProps {
  onNavigate: (s: Screen) => void
  initialFilter?: "All" | "Lost" | "Found"
}

export function Discover({ onNavigate, initialFilter = "All" }: DiscoverProps) {
  const [activeFilter, setActiveFilter] = useState<string>(initialFilter)
  const [search, setSearch] = useState("")
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setActiveFilter(initialFilter)
  }, [initialFilter])

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => {
      const results = itemsService.search(
        search,
        activeFilter === "Nearby" || activeFilter === "Recent"
          ? "All"
          : activeFilter,
      )
      setItems(results)
      setLoading(false)
    }, 200)
    return () => clearTimeout(t)
  }, [search, activeFilter])

  const pageTitle =
    initialFilter === "Lost"
      ? "Lost Items"
      : initialFilter === "Found"
        ? "Found Items"
        : "Discover"

  const pageSubtitle =
    initialFilter === "Lost"
      ? "Active reports for missing items waiting to be recovered across campus."
      : initialFilter === "Found"
        ? "Discovered possessions waiting in custody or with finders for verification."
        : "Explore recently reported lost and found items across campus."

  return (
    <div style={{ padding: "40px 48px", maxWidth: 780 }}>
      <style>{`
        @keyframes skeleton-shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .rx-skeleton {
          background: linear-gradient(90deg, ${T.surface2} 25%, ${T.surface3} 50%, ${T.surface2} 75%);
          background-size: 400px 100%;
          animation: skeleton-shimmer 1.6s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .rx-skeleton { animation: none !important; background: ${T.surface3}; }
        }
        .rx-discover-row {
          transition: transform 240ms cubic-bezier(0.16, 1, 0.3, 1),
                      background 200ms ease,
                      border-color 200ms ease,
                      box-shadow 240ms ease;
          will-change: transform;
        }
        .rx-discover-row:hover {
          transform: translateX(6px);
          background: #14181e !important;
          border-color: #3b424e !important;
        }
        .rx-discover-row .rx-discover-icon {
          transition: transform 260ms cubic-bezier(0.16, 1, 0.3, 1), border-color 200ms ease;
        }
        .rx-discover-row:hover .rx-discover-icon {
          transform: scale(1.04);
          border-color: #55c7d9;
        }
        .rx-discover-action {
          opacity: 0.7;
          transform: translateX(0);
          transition: opacity 200ms ease, transform 240ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .rx-discover-row:hover .rx-discover-action {
          opacity: 1;
          transform: translateX(6px);
          border-color: #9299a4 !important;
          color: #f5f5f0 !important;
        }
        .rx-discover-row:hover .rx-discover-meta {
          color: #9299a4 !important;
        }
        .rx-search-input {
          transition: border-color 150ms var(--ease-out-quint), box-shadow 150ms var(--ease-out-quint);
        }
        .rx-search-input:hover {
          border-color: #3b424e !important;
        }
        .rx-search-input:focus {
          border-color: ${T.accent} !important;
          box-shadow: 0 0 0 1px ${T.accent}44 !important;
          outline: none;
        }
      `}</style>

      <div className="rx-page-title-enter">
        <h1
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: T.text,
            margin: "0 0 6px",
          }}
        >
          {pageTitle}
        </h1>
        <p style={{ fontSize: 14, color: T.text2, margin: "0 0 28px" }}>
          {pageSubtitle}
        </p>
      </div>

      {/* Search Bar with SVG SearchIcon */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <span
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: T.muted,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
          }}
        >
          <SearchIcon size={15} />
        </span>
        <input
          className="rx-search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items, places or descriptions..."
          style={{
            width: "100%",
            background: T.surface2,
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            padding: "11px 14px 11px 36px",
            color: T.text,
            fontSize: 13,
            outline: "none",
            boxSizing: "border-box",
            fontFamily: T.sans,
          }}
        />
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 24,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              background: activeFilter === f ? `${T.accent}24` : "none",
              border: `1px solid ${activeFilter === f ? T.accent : T.border}`,
              color: activeFilter === f ? T.accent : T.text2,
              fontSize: 12,
              padding: "6px 14px",
              borderRadius: 20,
              cursor: "pointer",
              transition: "all 150ms ease-out",
              fontFamily: T.sans,
              fontWeight: activeFilter === f ? 500 : 400,
            }}
          >
            {f}
          </button>
        ))}
        <div
          style={{
            width: 1,
            height: 20,
            background: T.border,
            margin: "0 4px",
          }}
        />
        {["Category", "Location", "Date", "Distance"].map((f) => (
          <button
            key={f}
            style={{
              background: "none",
              border: `1px solid ${T.border}`,
              color: T.muted,
              fontSize: 12,
              padding: "5px 12px",
              borderRadius: 20,
              cursor: "pointer",
              fontFamily: T.sans,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span>{f}</span>
            <ChevronDownIcon size={11} />
          </button>
        ))}
      </div>

      <div
        style={{
          fontSize: 11,
          color: T.muted,
          marginBottom: 16,
          letterSpacing: "0.04em",
        }}
      >
        {loading
          ? "Scanning network…"
          : `${items.length} item${items.length !== 1 ? "s" : ""} reported`}
      </div>

      {/* Feed — strictly vertical feed, no ecommerce grid */}
      <div style={{ borderTop: `1px solid ${T.border}` }}>
        {loading
          ? [0, 1, 2, 3].map((i) => <SkeletonRow key={i} />)
          : items.map((item, index) => (
              <FeedRow
                key={item.id}
                item={item}
                index={index}
                onNavigate={onNavigate}
              />
            ))}
      </div>
    </div>
  )
}

function FeedRow({
  item,
  index = 0,
  onNavigate,
}: {
  item: Item
  index?: number
  onNavigate: (s: Screen) => void
}) {
  const isFound = item.type === "found"
  const color = isFound ? T.accent : T.accent2

  const handleSelect = () => {
    localStorage.setItem("reclaimx_active_item_id", item.id)
    if (item.type === "found") {
      localStorage.setItem("reclaimx_active_found_id", item.id)
    } else {
      localStorage.setItem("reclaimx_active_lost_id", item.id)
    }
    onNavigate("item-detail")
  }

  return (
    <div
      data-cursor="view"
      className={`rx-discover-row rx-interactive rx-stagger-item rx-delay-${Math.min(index + 1, 8)}`}
      onClick={handleSelect}
      style={{
        borderBottom: `1px solid ${T.border}`,
        padding: "20px 8px",
        cursor: "pointer",
        borderRadius: 6,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "48px 1fr auto",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* Realistic Item Photo or Category Line Icon */}
        <div
          className="rx-discover-icon"
          style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            overflow: "hidden",
            flexShrink: 0,
            border: `1px solid ${T.border}`,
            background: T.surface3,
          }}
        >
          <ItemImage
            src={item.imageUrl}
            alt={item.imageAlt || item.title}
            width={48}
            height={48}
            fallbackCategory={item.category}
          />
        </div>

        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 500, color: T.text }}>
              {item.title}
            </span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color,
                padding: "2px 6px",
                border: `1px solid ${color}44`,
                borderRadius: 3,
                background: `${color}14`,
              }}
            >
              {isFound ? "Found" : "Lost"}
            </span>
            {item.isDemo && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: T.muted,
                  padding: "2px 6px",
                  border: `1px solid ${T.border}`,
                  borderRadius: 3,
                  background: T.surface3,
                }}
              >
                DEMO DATA
              </span>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 8,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 11, color: T.muted }}>
              {item.category}
            </span>
            <span style={{ fontSize: 11, color: T.border }}>·</span>
            <span style={{ fontSize: 11, color: T.muted }}>
              {item.location}
            </span>
            <span style={{ fontSize: 11, color: T.border }}>·</span>
            <span style={{ fontSize: 11, color: T.muted }}>{item.date}</span>
          </div>

          <p
            style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, margin: 0 }}
          >
            {item.description}
          </p>
        </div>

        {/* Action — hidden at rest, revealed on row hover */}
        <button
          className="rx-discover-action rx-btn-secondary"
          onClick={(e) => {
            e.stopPropagation()
            handleSelect()
          }}
          style={{
            background: "none",
            border: `1px solid ${T.border}`,
            color: T.text2,
            fontSize: 12,
            padding: "6px 12px",
            borderRadius: 6,
            cursor: "pointer",
            whiteSpace: "nowrap",
            fontFamily: T.sans,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>View</span>
          <ArrowRightIcon size={11} />
        </button>
      </div>
    </div>
  )
}
