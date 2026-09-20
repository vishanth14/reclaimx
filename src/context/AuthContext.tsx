import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react"
import { Amplify } from "aws-amplify"
import {
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  signOut as amplifySignOut,
  getCurrentUser as getAmplifyUser,
  fetchUserAttributes,
} from "aws-amplify/auth"
import { APP_CONFIG } from "../config"

export interface User {
  name: string
  email: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password?: string) => Promise<boolean>
  signup: (name: string, email: string, password?: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = "reclaimx_mock_auth"

// Initialize Amplify if backend is AWS and credentials exist
const isAwsConfigured =
  APP_CONFIG.backend === "aws" &&
  Boolean(APP_CONFIG.cognitoUserPoolId) &&
  Boolean(APP_CONFIG.cognitoClientId)

if (isAwsConfigured) {
  try {
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: APP_CONFIG.cognitoUserPoolId,
          userPoolClientId: APP_CONFIG.cognitoClientId,
        },
      },
    })
  } catch (err) {
    console.warn("Failed to initialize AWS Amplify Auth:", err)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      if (isAwsConfigured) {
        try {
          const ampUser = await getAmplifyUser()
          const attrs = await fetchUserAttributes()
          const resolvedUser: User = {
            name: attrs.fullname || attrs.name || ampUser.username,
            email: attrs.email || `${ampUser.username}@campus.edu`,
          }
          setUser(resolvedUser)
          setIsLoading(false)
          return
        } catch {
          // Not logged in to Cognito
        }
      }

      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          setUser(JSON.parse(stored))
        }
      } catch {
        // Ignore local storage parse errors
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password?: string): Promise<boolean> => {
    if (isAwsConfigured && password) {
      try {
        await amplifySignIn({
          username: email.trim().toLowerCase(),
          password,
        })
        const attrs = await fetchUserAttributes()
        const resolvedUser: User = {
          name: attrs.fullname || attrs.name || email.split("@")[0],
          email: email.trim().toLowerCase(),
        }
        setUser(resolvedUser)
        return true
      } catch (err) {
        console.warn("Amplify sign-in failed, falling back to demo session:", err)
      }
    }

    // Local / fallback authentication
    const nameFromEmail = email.split("@")[0] || "Recovery Agent"
    const formattedName =
      nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1)
    const newUser: User = {
      name: formattedName.includes(".")
        ? formattedName
            .split(".")
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(" ")
        : formattedName,
      email: email.trim().toLowerCase(),
    }
    setUser(newUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    return true
  }

  const signup = async (
    name: string,
    email: string,
    password?: string,
  ): Promise<boolean> => {
    if (isAwsConfigured && password) {
      try {
        await amplifySignUp({
          username: email.trim().toLowerCase(),
          password,
          options: {
            userAttributes: {
              email: email.trim().toLowerCase(),
              fullname: name.trim(),
            },
          },
        })
      } catch (err) {
        console.warn("Amplify sign-up failed, falling back to local session:", err)
      }
    }

    const newUser: User = {
      name: name.trim() || "Recovery Agent",
      email: email.trim().toLowerCase(),
    }
    setUser(newUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    return true
  }

  const logout = () => {
    if (isAwsConfigured) {
      amplifySignOut().catch((err) => console.warn("Amplify sign-out warning:", err))
    }
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
