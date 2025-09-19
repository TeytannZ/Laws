"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loginUser } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, Home, Shield, User } from "lucide-react"

export function LoginForm() {
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!name.trim()) {
      setError("يرجى إدخال الاسم")
      setLoading(false)
      return
    }

    if (isAdmin && !password) {
      setError("يرجى إدخال كلمة مرور المدير")
      setLoading(false)
      return
    }

    const result = await loginUser(name.trim(), isAdmin ? password : undefined, isAdmin)

    if (result.success && result.user) {
      login(result.user)
    } else {
      setError(result.error || "حدث خطأ غير متوقع")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-xl mb-6">
            <Home className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">قواعد المنزل</h1>
          <p className="text-muted-foreground text-lg">نظام إدارة قواعد المنزل</p>
        </div>

        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm enhanced-card">
          <CardHeader className="text-center space-y-4 pb-6">
            <CardTitle className="text-2xl font-bold text-primary leading-tight">تسجيل الدخول</CardTitle>
            <CardDescription className="text-base text-muted-foreground leading-relaxed">
              مرحباً بك، يرجى تسجيل الدخول للمتابعة
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-base font-semibold flex items-center space-x-2 space-x-reverse">
                  <User className="h-4 w-4 text-primary" />
                  <span>الاسم</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="أدخل اسمك"
                  className="text-right h-12 text-base border-2 focus:border-primary/50 transition-colors"
                  disabled={loading}
                  dir="rtl"
                />
              </div>

              <div className="flex items-center space-x-3 space-x-reverse py-3 px-4 bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="admin"
                  checked={isAdmin}
                  onCheckedChange={(checked) => {
                    setIsAdmin(checked as boolean)
                    if (!checked) {
                      setPassword("")
                    }
                  }}
                  disabled={loading}
                  className="w-5 h-5 border-2"
                />
                <Label
                  htmlFor="admin"
                  className="text-base font-medium cursor-pointer flex items-center space-x-2 space-x-reverse flex-1"
                >
                  <Shield className="h-4 w-4 text-primary" />
                  <span>تسجيل دخول كمدير</span>
                </Label>
              </div>

              {isAdmin && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                  <Label
                    htmlFor="password"
                    className="text-base font-semibold flex items-center space-x-2 space-x-reverse"
                  >
                    <Shield className="h-4 w-4 text-primary" />
                    <span>كلمة مرور المدير</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة مرور المدير"
                    className="text-right h-12 text-base border-2 focus:border-primary/50 transition-colors"
                    disabled={loading}
                    dir="rtl"
                  />
                </div>
              )}

              {error && (
                <Alert variant="destructive" className="border-2 animate-in slide-in-from-top-2 duration-300">
                  <AlertDescription className="leading-relaxed text-base">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>جاري تسجيل الدخول...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Home className="h-5 w-5" />
                    <span>تسجيل الدخول</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border/50">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>للمستخدمين العاديين:</strong> أدخل اسمك فقط
                </p>
                <p className="text-sm text-muted-foreground">
                  🔐 <strong>للمديرين:</strong> فعّل خيار المدير وأدخل كلمة المرور
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>نظام إدارة قواعد المنزل</p>
          <p className="mt-1">مصمم لتنظيم وإدارة قواعد المنزل بسهولة</p>
        </div>
      </div>
    </div>
  )
}
