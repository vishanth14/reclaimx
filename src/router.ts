import { useState, useEffect, useCallback } from "react"
import { useAuth } from "./context/AuthContext"

export type AppRoute = "/" | "/login" | "/signup" | `/app/${string}`

export function useRouter() {
  const { isAuthenticated, isLoading } = useAuth()

  // Normalize initial pathname
  const getInitialPath = (): string => {
    if (typeof window === "undefined") return "/"
    const path = window.location.pathname
    return path || "/"
  }

  const [currentPath, setCurrentPath] = useState<string>(getInitialPath)

  // Navigate to a new route
  const navigate = useCallback((to: string) => {
    if (typeof window !== "undefined") {
      if (window.location.pathname !== to) {
        window.history.pushState(null, "", to)
      }
    }
    setCurrentPath(to)
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [])

  // Listen to popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || "/")
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  // Guard /app routes: redirect unauthenticated users to /login
  useEffect(() => {
    if (!isLoading) {
      if (currentPath.startsWith("/app") && !isAuthenticated) {
        navigate("/login")
      }
    }
  }, [currentPath, isAuthenticated, isLoading, navigate])

  return {
    currentPath,
    navigate,
    isPublic:
      currentPath === "/" ||
      currentPath === "/login" ||
      currentPath === "/signup",
  }
}
