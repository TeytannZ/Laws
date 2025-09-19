"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "@/lib/auth"
import { hasUserApproved, resetAllFirestoreData } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  error: string | null
  resetAllData: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("[v0] Starting auth initialization...")

        const dataResetFlag = localStorage.getItem("dataReset")
        if (dataResetFlag === "true") {
          // Clear all local data when external database is reset
          localStorage.removeItem("houseRulesUser")
          localStorage.removeItem("houseRulesApprovals")
          localStorage.removeItem("houseRulesMessages")
          localStorage.removeItem("dataReset")
          console.log("[v0] Data reset detected - cleared all local storage")
        }

        const savedUserStr = localStorage.getItem("houseRulesUser")
        if (savedUserStr) {
          const userData = JSON.parse(savedUserStr)
          console.log("[v0] Checking approval status for user:", userData.name)
          const hasApproved = await hasUserApproved(userData.name)
          const updatedUser = { ...userData, hasApprovedRules: hasApproved }
          setUser(updatedUser)

          localStorage.setItem("houseRulesUser", JSON.stringify(updatedUser))
          console.log("[v0] Loaded user with Firebase approval status:", hasApproved)
        }

        console.log("[v0] Auth initialization completed")
      } catch (error) {
        console.error("[v0] Error initializing auth:", error)
        setError("خطأ في تهيئة النظام")
      } finally {
        setIsInitialized(true)
      }
    }

    initializeApp()
  }, [])

  const login = (userData: User) => {
    console.log("[v0] Logging in user:", userData.name)
    setUser(userData)
    localStorage.setItem("houseRulesUser", JSON.stringify(userData))
    setError(null)
  }

  const logout = () => {
    console.log("[v0] Logging out user")
    setUser(null)
    localStorage.removeItem("houseRulesUser")
    setError(null)
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      console.log("[v0] Updating user:", updatedUser.name)
      setUser(updatedUser)
      localStorage.setItem("houseRulesUser", JSON.stringify(updatedUser))
    }
  }

  const resetAllData = async () => {
    try {
      await resetAllFirestoreData()
      localStorage.removeItem("houseRulesUser")
      window.location.reload()
    } catch (error) {
      console.error("[v0] Error resetting data:", error)
      setError("خطأ في إعادة تعيين البيانات")
    }
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, error, resetAllData }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
