import { useState, type ReactNode } from "react"
import { T } from "../tokens"
import { LogoMark } from "./LogoMark"
import { MagneticButton } from "./MagneticButton"
import {
  HomeIcon,
  DiscoverIcon,
  PackageIcon,
  CheckIcon,
  LayersIcon,
  PlusIcon,
  ShieldIcon,
  UserIcon,
  SettingsIcon,
} from "./Icons"
import type { Screen } from "../App"

type NavItem = {
  id: Screen
  label: string
  icon: (size?: number) => ReactNode
}

const primary: NavItem[] = [
  { id: "home", label: "Home", icon: (s) => <HomeIcon size={s} /> },
  { id: "discover", label: "Discover", icon: (s) => <DiscoverIcon size={s} /> },
  { id: "lost", label: "Lost", icon: (s) => <PackageIcon size={s} /> },
  { id: "found", label: "Found", icon: (s) => <ShieldIcon size={s} /> },
  { id: "claims", label: "My Claims", icon: (s) => <LayersIcon size={s} /> },
]

const actions: NavItem[] = [
  {
    id: "report-lost",
    label: "Report Lost",
    icon: (s) => <PackageIcon size={s} />,
  },
  {
    id: "report-found",
    label: "Report Found",
    icon: (s) => <PlusIcon size={s} />,
  },
]

interface Props {
  current: Screen
  onNavigate: (s: Screen) => void
  onLogout?: () => void
}

export function Sidebar({ current, onNavigate, onLogout }: Props) {
  return (
    <aside
      style={{
        width: 220,
        minWidth: 220,
        height: "100vh",
        background: T.surface,
        borderRight: `1px solid ${T.border}`,
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {/* Top brand */}
      <div
        style={{
          padding: "18px 16px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <LogoMark size={24} />
        <span
          className="rx-wordmark"
          style={{
            fontSize: 15,
            fontWeight: 800,
            letterSpacing: "0.14em",
            color: T.text,
          }}
        >
          RECLAIMX
        </span>
      </div>

      {/* Main navigation */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px 0",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <NavGroup items={primary} current={current} onNavigate={onNavigate} />
        <Divider />
        <NavGroup items={actions} current={current} onNavigate={onNavigate} />
        <Divider />
        <NavItemComp
          id="how-it-works"
          label="How It Works"
          icon={(s) => <CheckIcon size={s} />}
          current={current}
          onNavigate={onNavigate}
        />
      </div>

      {/* Report CTA */}
      <div style={{ padding: "12px 14px", borderTop: `1px solid ${T.border}` }}>
        <MagneticButton
          onClick={() => onNavigate("report-lost")}
          dataCursor="report"
          className="rx-btn-primary rx-cta"
          style={{
            width: "100%",
            background: T.accent,
            border: `1px solid ${T.accent}`,
            color: "#fff",
            fontSize: 12,
            fontWeight: 500,
            padding: "9px 12px",
            borderRadius: 7,
            cursor: "pointer",
            letterSpacing: "0.01em",
            fontFamily: T.sans,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            boxShadow: `0 2px 8px ${T.accent}33`,
          }}
        >
          <PlusIcon size={14} />
          <span>Report Item</span>
        </MagneticButton>
      </div>

      {/* Bottom: profile + settings */}
      <div
        style={{ padding: "8px 0 12px", borderTop: `1px solid ${T.border}` }}
      >
        <NavItemComp
          id="profile"
          label="Profile"
          icon={(s) => <UserIcon size={s} />}
          current={current}
          onNavigate={onNavigate}
        />
        <NavItemComp
          id="settings"
          label="Settings"
          icon={(s) => <SettingsIcon size={s} />}
          current={current}
          onNavigate={onNavigate}
        />
        {onLogout && (
          <div style={{ padding: "4px 14px 0" }}>
            <button
              onClick={onLogout}
              className="rx-link"
              style={{
                background: "none",
                border: "none",
                color: T.muted,
                fontSize: 11,
                cursor: "pointer",
                padding: "6px 8px",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: T.mono,
              }}
            >
              <span>← Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

function Divider() {
  return <div style={{ height: 1, background: T.border, margin: "8px 14px" }} />
}

function NavGroup({
  items,
  current,
  onNavigate,
}: {
  items: NavItem[]
  current: Screen
  onNavigate: (s: Screen) => void
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {items.map((item) => (
        <NavItemComp
          key={item.id}
          {...item}
          current={current}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  )
}

interface NavItemCompProps extends NavItem {
  current: Screen
  onNavigate: (s: Screen) => void
}

function NavItemComp({
  id,
  label,
  icon,
  current,
  onNavigate,
}: NavItemCompProps) {
  const active = current === id
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={() => onNavigate(id as Screen)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rx-interactive"
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 14px",
        border: "none",
        borderLeft: `2px solid ${
          active ? T.accent : hovered ? `${T.accent}44` : "transparent"
        }`,
        background: active ? T.surface2 : hovered ? "#14181E" : "transparent",
        color: active || hovered ? T.text : T.text2,
        fontSize: 13,
        cursor: "pointer",
        textAlign: "left",
        transition:
          "background 180ms ease, color 180ms ease, border-color 180ms ease",
        fontFamily: T.sans,
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 16,
          color: active ? T.accent : hovered ? T.text : T.muted,
          transform: hovered ? "translateX(2px)" : "translateX(0)",
          transition: "transform 200ms cubic-bezier(0.16, 1, 0.3, 1), color 150ms ease",
          flexShrink: 0,
        }}
      >
        {icon(15)}
      </span>
      <span
        style={{
          transform: hovered ? "translateX(2px)" : "translateX(0)",
          transition: "transform 200ms cubic-bezier(0.16, 1, 0.3, 1), color 150ms ease",
        }}
      >
        {label}
      </span>
    </button>
  )
}
