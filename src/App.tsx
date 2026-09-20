import { useState } from "react"
import { T } from "./tokens"
import { Sidebar } from "./components/Sidebar"
import { ContextPanel } from "./components/ContextPanel"
import { AmbientBg } from "./components/AmbientBg"
import { ToastProvider } from "./context/ToastContext"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { useRouter } from "./router"
import { LandingPage } from "./screens/public/LandingPage"
import { Login } from "./screens/public/Login"
import { Signup } from "./screens/public/Signup"
import { CustomCursor } from "./components/CustomCursor"
import { Home } from "./screens/Home"
import { Discover } from "./screens/Discover"
import { ItemDetail } from "./screens/ItemDetail"
import { ReportFound } from "./screens/ReportFound"
import { ReportLost } from "./screens/ReportLost"
import { Matching } from "./screens/Matching"
import { Verify } from "./screens/Verify"
import { Handover } from "./screens/Handover"
import { Reclaimed } from "./screens/Reclaimed"
import { Claims } from "./screens/Claims"
import { HowItWorks } from "./screens/HowItWorks"
import { Profile } from "./screens/Profile"
import { Settings } from "./screens/Settings"
import { PageTransition } from "./components/PageTransition"
import {
  HomeIcon,
  DiscoverIcon,
  PlusIcon,
  LayersIcon,
  UserIcon,
} from "./components/Icons"

export type Screen = "home" | "discover" | "lost" | "found" | "claims" | "report-lost" | "report-found" | "how-it-works" | "item-detail" | "matching" | "verify" | "handover" | "reclaimed" | "profile" | "settings"

const VALID_SCREENS: Screen[] = [
  "home",
  "discover",
  "lost",
  "found",
  "claims",
  "report-lost",
  "report-found",
  "how-it-works",
  "item-detail",
  "matching",
  "verify",
  "handover",
  "reclaimed",
  "profile",
  "settings",
]

// Ambient tier per screen
const tier1Screens: Screen[] = ["home", "how-it-works", "reclaimed"]

function PlaceholderScreen({ title }: { title: string }) {
  return (
    <div style={{ padding: "40px 48px", maxWidth: 720 }}>
      <h1
        style={{
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: T.text,
          margin: 0,
        }}
      >
        {title}
      </h1>
      <p style={{ fontSize: 14, color: T.muted, marginTop: 12 }}>
        Under active development for the ReclaimX Recovery Network.
      </p>
    </div>
  )
}

// Mobile bottom nav items with modern SVG line icons
const mobileNav = [
  {
    id: "home" as Screen,
    label: "Home",
    renderIcon: (active: boolean) => (
      <HomeIcon size={16} color={active ? T.accent : T.muted} />
    ),
  },
  {
    id: "discover" as Screen,
    label: "Discover",
    renderIcon: (active: boolean) => (
      <DiscoverIcon size={16} color={active ? T.accent : T.muted} />
    ),
  },
  { id: "report-lost" as Screen, label: "Report", primary: true },
  {
    id: "claims" as Screen,
    label: "Claims",
    renderIcon: (active: boolean) => (
      <LayersIcon size={16} color={active ? T.accent : T.muted} />
    ),
  },
  {
    id: "profile" as Screen,
    label: "Profile",
    renderIcon: (active: boolean) => (
      <UserIcon size={16} color={active ? T.accent : T.muted} />
    ),
  },
]

function AppShell() {
  const { currentPath, navigate } = useRouter()
  const { isAuthenticated, isLoading, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // 1. PUBLIC ROUTES
  if (currentPath === "/") {
    return (
      <ToastProvider>
        <CustomCursor />
        <PageTransition transitionKey="/">
          <LandingPage onNavigate={navigate} />
        </PageTransition>
      </ToastProvider>
    )
  }

  if (currentPath === "/login") {
    return (
      <ToastProvider>
        <CustomCursor />
        <PageTransition transitionKey="/login">
          <Login onNavigate={navigate} />
        </PageTransition>
      </ToastProvider>
    )
  }

  if (currentPath === "/signup") {
    return (
      <ToastProvider>
        <CustomCursor />
        <PageTransition transitionKey="/signup">
          <Signup onNavigate={navigate} />
        </PageTransition>
      </ToastProvider>
    )
  }

  // 2. AUTHENTICATION PROTECTION
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: T.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      />
    )
  }

  if (!isAuthenticated) {
    // Unauthenticated user attempting to access /app/* -> redirect to /login
    navigate("/login")
    return null
  }

  // 3. AUTHENTICATED APPLICATION
  const rawSubScreen = currentPath.replace(/^\/app\/?/, "").split("/")[0]
  const currentScreen: Screen = VALID_SCREENS.includes(rawSubScreen as Screen)
    ? rawSubScreen as Screen
    : "home"

  const setScreen = (s: Screen) => {
    navigate(`/app/${s}`)
  }

  const ambientTier = tier1Screens.includes(currentScreen) ? 1 : 2

  function renderScreen() {
    switch (currentScreen) {
      case "home":
        return <Home onNavigate={setScreen} />
      case "discover":
        return <Discover onNavigate={setScreen} initialFilter="All" />
      case "lost":
        return <Discover onNavigate={setScreen} initialFilter="Lost" />
      case "found":
        return <Discover onNavigate={setScreen} initialFilter="Found" />
      case "item-detail":
        return <ItemDetail onNavigate={setScreen} />
      case "report-found":
        return <ReportFound onNavigate={setScreen} />
      case "report-lost":
        return <ReportLost onNavigate={setScreen} />
      case "matching":
        return <Matching onNavigate={setScreen} />
      case "verify":
        return <Verify onNavigate={setScreen} />
      case "handover":
        return <Handover onNavigate={setScreen} />
      case "reclaimed":
        return <Reclaimed onNavigate={setScreen} />
      case "claims":
        return <Claims onNavigate={setScreen} />
      case "how-it-works":
        return <HowItWorks />
      case "profile":
        return <Profile onNavigate={setScreen} />
      case "settings":
        return <Settings onNavigate={setScreen} />
      default:
        return <Home onNavigate={setScreen} />
    }
  }

  return (
    <ToastProvider>
      <CustomCursor />
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: T.bg,
          fontFamily: T.sans,
          position: "relative",
        }}
      >
        <style>{`
          /* Motion system tokens */
          :root {
            --ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);
            --ease-inout: cubic-bezier(0.45, 0, 0.55, 1);
            --dur-micro: 150ms;
            --dur-component: 260ms;
            --dur-screen: 450ms;
          }

          @keyframes rx-fade-in {
            from { opacity: 0; transform: translateY(4px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse-dot {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.35; }
          }

          @media (prefers-reduced-motion: reduce) {
            .rx-ambient-blob, .rx-constellation { animation: none !important; }
            .rx-screen-enter { animation: none !important; }
            * { transition-duration: 0ms !important; animation-duration: 0ms !important; }
          }

          .rx-screen-enter {
            animation: rx-fade-in var(--dur-screen) var(--ease-out-quint) forwards;
          }

          /* Responsive Shell Architecture */
          .rx-sidebar { display: flex; }
          .rx-context-panel { display: flex; }
          .rx-bottom-nav { display: none; }

          @media (max-width: 1180px) and (min-width: 769px) {
            .rx-sidebar { display: flex !important; }
            .rx-context-panel { display: none !important; }
            .rx-bottom-nav { display: none !important; }
          }

          @media (max-width: 768px) {
            .rx-sidebar { display: none !important; }
            .rx-context-panel { display: none !important; }
            .rx-bottom-nav { display: flex !important; }
            .rx-main-content { padding-bottom: 72px !important; }
          }

          /* Scrollbar */
          ::-webkit-scrollbar { width: 0; height: 0; }
          * { scrollbar-width: none; }

          ::selection { background: ${T.accent}40; color: ${T.text}; }

          textarea, input, button, select { font-family: inherit; }

          button {
            transition: filter var(--dur-micro) var(--ease-out-quint),
                        border-color var(--dur-micro) var(--ease-out-quint),
                        color var(--dur-micro) var(--ease-out-quint),
                        background var(--dur-micro) var(--ease-out-quint);
          }
          button:active {
            transform: scale(0.98);
            transition: transform 80ms ease-in;
          }

          .rx-btn-primary:hover {
            filter: brightness(1.04);
          }

          .rx-btn-secondary:hover {
            border-color: ${T.text2} !important;
            color: ${T.text} !important;
          }

          input, textarea, select {
            transition: border-color 150ms var(--ease-out-quint), box-shadow 150ms var(--ease-out-quint);
          }
          input:focus, textarea:focus, select:focus {
            outline: 1px solid ${T.accent}44 !important;
            border-color: ${T.accent} !important;
          }

          .rx-link {
            position: relative;
            text-decoration: none;
          }
          .rx-link::after {
            content: '';
            position: absolute;
            left: 0; bottom: -1px;
            width: 0; height: 1px;
            background: currentColor;
            transition: width 200ms var(--ease-out-quint);
          }
          .rx-link:hover::after { width: 100%; }

          .rx-card-interactive {
            transition: background var(--dur-component) var(--ease-out-quint),
                        transform var(--dur-component) var(--ease-out-quint),
                        border-color var(--dur-component) var(--ease-out-quint);
          }
          .rx-card-interactive:hover {
            background: ${T.surface3} !important;
            transform: translateY(-1px);
            border-color: ${T.accent}44;
          }

          input[type="date"]::-webkit-calendar-picker-indicator,
          input[type="time"]::-webkit-calendar-picker-indicator {
            filter: invert(0.4);
          }
        `}</style>

        {/* Sitewide Ambient Background */}
        <AmbientBg tier={ambientTier} />

        {/* Column 1: Left Navigation */}
        <div
          className="rx-sidebar"
          style={{ position: "relative", zIndex: 10 }}
        >
          <Sidebar
            current={currentScreen}
            onNavigate={setScreen}
            onLogout={() => {
              logout()
              navigate("/")
            }}
          />
        </div>

        {/* Column 2: Main Content */}
        <main
          id="rx-scroll"
          className="rx-main-content"
          style={{
            flex: 1,
            overflowY: "auto",
            minHeight: "100vh",
            position: "relative",
            zIndex: 1,
          }}
        >
          <PageTransition transitionKey={currentScreen}>
            {renderScreen()}
          </PageTransition>
        </main>

        {/* Column 3: Context Panel */}
        <ContextPanel current={currentScreen} onNavigate={setScreen} />

        {/* Mobile Action Sheet Modal for '+' */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(9, 11, 15, 0.75)",
              backdropFilter: "blur(4px)",
              zIndex: 150,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 360,
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                padding: "20px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                boxShadow: "0 12px 36px rgba(0,0,0,0.5)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: T.muted,
                  marginBottom: 4,
                  textAlign: "center",
                }}
              >
                Report an Item
              </div>
              <button
                onClick={() => {
                  setScreen("report-lost")
                  setMobileMenuOpen(false)
                }}
                style={{
                  background: T.accent,
                  border: "none",
                  color: "#fff",
                  padding: "12px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Report Lost Item
              </button>
              <button
                onClick={() => {
                  setScreen("report-found")
                  setMobileMenuOpen(false)
                }}
                style={{
                  background: T.surface2,
                  border: `1px solid ${T.border}`,
                  color: T.text,
                  padding: "12px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Report Found Item
              </button>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: T.muted,
                  padding: "8px",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation */}
        <nav
          className="rx-bottom-nav"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: 56,
            background: T.surface,
            borderTop: `1px solid ${T.border}`,
            zIndex: 100,
            alignItems: "center",
            justifyContent: "space-around",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          {mobileNav.map((item) => {
            const active = currentScreen === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.primary) {
                    setMobileMenuOpen(true)
                  } else {
                    setScreen(item.id)
                  }
                }}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                  height: "100%",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {item.primary ? (
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: T.accent,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      boxShadow: `0 2px 10px ${T.accent}40`,
                    }}
                  >
                    <PlusIcon size={18} strokeWidth={2.4} />
                  </div>
                ) : (
                  <>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {item.renderIcon?.(active)}
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        color: active ? T.text : T.muted,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        fontWeight: active ? 500 : 400,
                      }}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </ToastProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}
