"use client"

import { useAuth } from "@/contexts/auth-context"
import { LoginForm } from "@/components/login-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { RulesApproval } from "@/components/rules-approval"
import { Dashboard } from "@/components/dashboard"

export default function HomePage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <>
        <ThemeToggle />
        <LoginForm />
      </>
    )
  }

  if (!user.hasApprovedRules) {
    return (
      <>
        <ThemeToggle />
        <RulesApproval />
      </>
    )
  }

  return (
    <>
      <ThemeToggle />
      <Dashboard />
    </>
  )
}
