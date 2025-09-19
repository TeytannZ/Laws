"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { AdminDashboard } from "./admin-dashboard"
import { UserDashboard } from "./user-dashboard"
import { MessagesView } from "./messages-view"

export function Dashboard() {
  const { user } = useAuth()
  const [showMessages, setShowMessages] = useState(false)

  if (!user) return null

  if (showMessages && user.isAdmin) {
    return <MessagesView onBack={() => setShowMessages(false)} />
  }

  if (user.isAdmin) {
    return <AdminDashboard onShowMessages={() => setShowMessages(true)} />
  }

  return <UserDashboard />
}
