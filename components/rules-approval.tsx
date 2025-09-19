"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Home, Shield } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { approveRules } from "@/lib/auth"
import { getRules, initializeRules, type Rule } from "@/lib/rules"

export function RulesApproval() {
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)
  const [error, setError] = useState("")
  const { user, updateUser } = useAuth()

  useEffect(() => {
    const loadRules = async () => {
      try {
        console.log("[v0] Loading rules...")
        await initializeRules()
        const rulesData = await getRules()
        console.log("[v0] Rules loaded:", rulesData.length)
        setRules(rulesData)
      } catch (error) {
        console.error("Error loading rules:", error)
        setError("حدث خطأ في تحميل القواعد")
      } finally {
        setLoading(false)
      }
    }

    loadRules()
  }, [])

  const handleApprove = async () => {
    if (!user) return

    setApproving(true)
    setError("")

    console.log("[v0] Approving rules for user:", user.name)
    const success = await approveRules(user.name)

    if (success) {
      console.log("[v0] Rules approved successfully")
      updateUser({ hasApprovedRules: true })
    } else {
      console.log("[v0] Rules approval failed")
      setError("حدث خطأ أثناء الموافقة على القواعد")
    }

    setApproving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground text-base sm:text-lg">جاري تحميل القواعد...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-3 sm:p-4"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center space-x-3 sm:space-x-4 space-x-reverse mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-primary/10 rounded-full">
              <Home className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-primary">قواعد المنزل</h1>
          </div>
          <p className="text-base sm:text-xl text-muted-foreground leading-relaxed px-2">
            مرحباً <span className="font-semibold text-primary">{user?.name}</span>، يرجى قراءة القواعد والموافقة عليها
            للمتابعة
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-card/50 backdrop-blur-sm mx-1 sm:mx-0">
          <CardContent className="p-4 sm:p-8">
            <ScrollArea className="h-[400px] sm:h-[500px] w-full rounded-lg border bg-background/50 p-3 sm:p-6">
              <div className="space-y-6 sm:space-y-8">
                {rules.map((rule, index) => (
                  <div key={rule.id} className="space-y-3 sm:space-y-4">
                    <div className="flex items-start space-x-3 sm:space-x-4 space-x-reverse">
                      <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-base sm:text-lg font-bold shadow-lg flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-primary mb-2 sm:mb-3 leading-relaxed">
                          {rule.title}
                        </h3>
                        <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                          <div className="text-foreground leading-relaxed text-sm sm:text-base" dir="rtl">
                            {rule.content.split("\n").map((line, lineIndex) => {
                              const trimmedLine = line.trim()
                              if (!trimmedLine) return <br key={lineIndex} />

                              // Check if line starts with bullet indicators
                              if (
                                trimmedLine.startsWith("•") ||
                                trimmedLine.startsWith("-") ||
                                trimmedLine.startsWith("→")
                              ) {
                                return (
                                  <div key={lineIndex} className="flex items-start space-x-2 space-x-reverse mb-2">
                                    <span className="text-primary font-bold mt-1 text-sm sm:text-base">•</span>
                                    <span className="flex-1">{trimmedLine.replace(/^[•\-→]\s*/, "")}</span>
                                  </div>
                                )
                              }

                              // Regular line
                              return (
                                <p key={lineIndex} className="mb-2">
                                  {trimmedLine}
                                </p>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < rules.length - 1 && <Separator className="my-4 sm:my-6" />}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {error && (
              <Alert variant="destructive" className="mt-4 sm:mt-6">
                <AlertDescription className="text-right text-sm sm:text-base">{error}</AlertDescription>
              </Alert>
            )}

            <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
              <Alert className="border-primary/20 bg-primary/5">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <AlertDescription className="text-right text-sm sm:text-base leading-relaxed">
                  بالموافقة على هذه القواعد، أتعهد بالالتزام بها واحترامها في جميع الأوقات. هذه القواعد وُضعت لضمان بيئة
                  مريحة ومحترمة للجميع.
                </AlertDescription>
              </Alert>

              <div className="flex justify-center">
                <Button
                  onClick={handleApprove}
                  disabled={approving}
                  size="lg"
                  className="w-full max-w-md h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {approving ? (
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
                      <span>جاري الموافقة...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>أوافق على القواعد</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
