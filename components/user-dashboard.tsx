"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Home, MessageSquare, Send, LogOut, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getRules, type Rule } from "@/lib/rules"
import { sendMessage } from "@/lib/messages"
import { ApprovalSeals } from "@/components/approval-seals"

export function UserDashboard() {
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [messageContent, setMessageContent] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { user, logout } = useAuth()

  useEffect(() => {
    loadRules()
  }, [])

  const loadRules = async () => {
    try {
      console.log("[v0] Loading rules for user dashboard...")
      const rulesData = await getRules()
      console.log("[v0] User dashboard loaded rules:", rulesData.length)
      setRules(rulesData)
    } catch (error) {
      console.error("Error loading rules:", error)
      setError("حدث خطأ في تحميل القواعد")
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !user) {
      setError("يرجى كتابة رسالة")
      return
    }

    setSending(true)
    setError("")

    const success = await sendMessage(user.name, messageContent.trim())

    if (success) {
      setSuccess("تم إرسال الرسالة بنجاح")
      setMessageContent("")
      setIsMessageDialogOpen(false)
    } else {
      setError("حدث خطأ أثناء إرسال الرسالة")
    }

    setSending(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل القواعد...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Home className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-primary">مرحباً {user?.name}</CardTitle>
                  <CardDescription>لوحة تحكم المستخدم - قواعد المنزل</CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center space-x-2 space-x-reverse bg-transparent">
                      <MessageSquare className="h-4 w-4" />
                      <span>إرسال رسالة للمدير</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md" dir="rtl">
                    <DialogHeader>
                      <DialogTitle className="text-right">إرسال رسالة للمدير</DialogTitle>
                      <DialogDescription className="text-right">اكتب رسالتك وسيتم إرسالها للمدير</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="message" className="text-right">
                          الرسالة
                        </Label>
                        <Textarea
                          id="message"
                          value={messageContent}
                          onChange={(e) => setMessageContent(e.target.value)}
                          placeholder="اكتب رسالتك هنا..."
                          className="text-right min-h-32"
                          disabled={sending}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleSendMessage} disabled={sending} className="w-full">
                        {sending ? (
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            <span>جاري الإرسال...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Send className="h-4 w-4" />
                            <span>إرسال الرسالة</span>
                          </div>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" onClick={logout} className="flex items-center space-x-2 space-x-reverse">
                  <LogOut className="h-4 w-4" />
                  <span>تسجيل خروج</span>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription className="text-right">{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-right text-emerald-800 dark:text-emerald-200">{success}</AlertDescription>
          </Alert>
        )}

        {/* Approval seals display */}
        <ApprovalSeals />

        {/* Rules Display */}
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 space-x-reverse text-right">
              <Home className="h-5 w-5 text-primary" />
              <span>قواعد المنزل</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[70vh] rounded-lg border bg-background/50 p-4">
              <div className="space-y-6">
                {rules.map((rule, index) => (
                  <div key={rule.id} className="space-y-3">
                    <div className="flex items-center justify-end space-x-3 space-x-reverse" dir="rtl">
                      <h3 className="text-2xl font-bold text-primary leading-relaxed text-right flex-1">
                        {rule.title}
                      </h3>
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-lg font-bold shadow-lg">
                        {rule.order}
                      </div>
                    </div>
                    <div>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="text-foreground leading-relaxed" dir="rtl">
                          {rule.content.split("\n").map((line, lineIndex) => {
                            const trimmedLine = line.trim()
                            if (!trimmedLine) return <br key={lineIndex} />

                            if (
                              trimmedLine.startsWith("•") ||
                              trimmedLine.startsWith("-") ||
                              trimmedLine.startsWith("→")
                            ) {
                              return (
                                <div
                                  key={lineIndex}
                                  className="flex items-start space-x-3 space-x-reverse mb-3 p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/20 shadow-sm"
                                >
                                  <span className="text-primary font-bold mt-1 text-lg">•</span>
                                  <span
                                    className="flex-1 text-right font-semibold"
                                    dangerouslySetInnerHTML={{
                                      __html: trimmedLine
                                        .replace(/^[•\-→]\s*/, "")
                                        .replace(/<b>(.*?)<\/b>/g, '<strong class="font-bold text-primary">$1</strong>')
                                        .replace(
                                          /<mark>(.*?)<\/mark>/g,
                                          '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>',
                                        )
                                        .replace(/<i>(.*?)<\/i>/g, '<em class="italic text-accent">$1</em>')
                                        .replace(
                                          /<u>(.*?)<\/u>/g,
                                          '<span class="underline decoration-primary">$1</span>',
                                        ),
                                    }}
                                  />
                                </div>
                              )
                            }

                            // Regular line (sub-titles and normal text)
                            return (
                              <p
                                key={lineIndex}
                                className="mb-2 text-right font-semibold"
                                dangerouslySetInnerHTML={{
                                  __html: trimmedLine
                                    .replace(/<b>(.*?)<\/b>/g, '<strong class="font-bold text-primary">$1</strong>')
                                    .replace(
                                      /<mark>(.*?)<\/mark>/g,
                                      '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>',
                                    )
                                    .replace(/<i>(.*?)<\/i>/g, '<em class="italic text-accent">$1</em>')
                                    .replace(/<u>(.*?)<\/u>/g, '<span class="underline decoration-primary">$1</span>'),
                                }}
                              />
                            )
                          })}
                        </div>
                      </div>
                    </div>
                    {index < rules.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
