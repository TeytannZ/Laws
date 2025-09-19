"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Plus, Edit, Trash2, Settings, MessageSquare, Home, LogOut, User, Shield, RotateCcw } from "lucide-react"
import { getRules, addRule, updateRule, deleteRule, type Rule } from "@/lib/rules"
import { getMessages, markMessageAsRead, markAllMessagesAsRead, type Message } from "@/lib/messages"
import { useAuth } from "@/contexts/auth-context"
import { getAllApprovals } from "@/lib/auth"

interface AdminDashboardProps {
  onShowMessages: () => void
}

export function AdminDashboard({ onShowMessages }: AdminDashboardProps) {
  const { user, logout, resetAllData } = useAuth()
  const [rules, setRules] = useState<Rule[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [approvals, setApprovals] = useState<Array<{ userName: string; approvedAt: string; timestamp: number }>>([])
  const [loading, setLoading] = useState(true)
  const [editingRule, setEditingRule] = useState<Rule | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [newRule, setNewRule] = useState({ title: "", content: "", order: 1 })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      console.log("[v0] Admin dashboard loading data...")
      const [rulesData, messagesData] = await Promise.all([getRules(), getMessages()])
      const approvalsData = await getAllApprovals()
      console.log("[v0] Admin dashboard loaded rules:", rulesData.length)
      console.log("[v0] Admin dashboard loaded messages:", messagesData.length)
      console.log("[v0] Admin dashboard loaded approvals:", approvalsData.length)
      setRules(rulesData)
      setMessages(messagesData)
      setApprovals(approvalsData)
    } catch (error) {
      console.error("Error loading data:", error)
      setError("حدث خطأ في تحميل البيانات")
    } finally {
      setLoading(false)
    }
  }

  const handleAddRule = async () => {
    if (!newRule.title.trim() || !newRule.content.trim()) {
      setError("يرجى ملء جميع الحقول")
      return
    }

    const success = await addRule(newRule)
    if (success) {
      setSuccess("تم إضافة القاعدة بنجاح")
      setNewRule({ title: "", content: "", order: 1 })
      setIsAddDialogOpen(false)
      loadData()
    } else {
      setError("حدث خطأ أثناء إضافة القاعدة")
    }
  }

  const handleEditRule = async () => {
    if (!editingRule || !editingRule.title.trim() || !editingRule.content.trim()) {
      setError("يرجى ملء جميع الحقول")
      return
    }

    const success = await updateRule(editingRule.id, {
      title: editingRule.title,
      content: editingRule.content,
      order: editingRule.order,
    })

    if (success) {
      setSuccess("تم تحديث القاعدة بنجاح")
      setEditingRule(null)
      setIsEditDialogOpen(false)
      loadData()
    } else {
      setError("حدث خطأ أثناء تحديث القاعدة")
    }
  }

  const handleDeleteRule = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه القاعدة؟")) return

    const success = await deleteRule(id)
    if (success) {
      setSuccess("تم حذف القاعدة بنجاح")
      loadData()
    } else {
      setError("حدث خطأ أثناء حذف القاعدة")
    }
  }

  const handleResetAllData = () => {
    setIsResetDialogOpen(false)
    resetAllData()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <header className="bg-gradient-to-r from-primary via-primary/90 to-accent shadow-xl border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl shadow-lg">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">لوحة تحكم المدير</h1>
                <p className="text-white/90 text-sm">إدارة قواعد المنزل والرسائل</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center space-x-2 space-x-reverse text-white/90 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={logout}
                className="flex items-center space-x-2 space-x-reverse bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm"
              >
                <LogOut className="h-4 w-4" />
                <span>تسجيل الخروج</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-emerald-50 to-teal-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="bg-emerald-500/20 p-3 rounded-xl shadow-lg">
                  <Home className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{rules.length}</p>
                  <p className="text-sm text-muted-foreground">قاعدة نشطة</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="bg-blue-500/20 p-3 rounded-xl shadow-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{messages.length}</p>
                  <p className="text-sm text-muted-foreground">إجمالي الرسائل</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-orange-50 to-amber-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="bg-orange-500/20 p-3 rounded-xl shadow-lg">
                  <MessageSquare className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{messages.filter((m) => !m.isRead).length}</p>
                  <p className="text-sm text-muted-foreground">رسائل غير مقروءة</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-emerald-50 to-green-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="bg-emerald-500/20 p-3 rounded-xl shadow-lg">
                  <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{approvals.length}</p>
                  <p className="text-sm text-muted-foreground">موافقة على القواعد</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {approvals.length > 0 && (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 enhanced-card">
            <CardHeader className="bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border-b">
              <CardTitle className="flex items-center space-x-3 space-x-reverse text-xl">
                <div className="bg-emerald-500/10 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-emerald-600" />
                </div>
                <span>الموافقات على القواعد</span>
                <Badge
                  variant="secondary"
                  className="bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100"
                >
                  {approvals.length} موافقة
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {approvals.map((approval, index) => {
                  const isCurrentAdmin = approval.userName === user?.name

                  return (
                    <div key={approval.userName} className="relative group">
                      <div
                        className={`rounded-xl p-4 border-2 hover:shadow-lg transition-all duration-200 ${
                          isCurrentAdmin
                            ? "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-300 dark:border-amber-600 ring-2 ring-amber-200 dark:ring-amber-700"
                            : "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-700"
                        }`}
                      >
                        <div className="flex items-center space-x-3 space-x-reverse mb-3">
                          <div className="w-16 h-16 flex items-center justify-center">
                            <Image
                              src="/images/approved.png"
                              alt="Approved"
                              width={60}
                              height={60}
                              className="object-contain"
                            />
                          </div>
                          <div>
                            <h3
                              className={`font-bold ${
                                isCurrentAdmin
                                  ? "text-amber-800 dark:text-amber-200"
                                  : "text-emerald-800 dark:text-emerald-200"
                              }`}
                            >
                              {approval.userName}
                              {isCurrentAdmin && " (أنت)"}
                            </h3>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${
                                isCurrentAdmin
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100"
                                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100"
                              }`}
                            >
                              {isCurrentAdmin ? "مدير موافق" : "موافق رسمياً"}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(approval.approvedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="absolute top-2 right-2">
                          <div
                            className={`w-6 h-6 text-white rounded-full flex items-center justify-center text-xs font-bold ${
                              isCurrentAdmin ? "bg-amber-600" : "bg-emerald-600"
                            }`}
                          >
                            #{index + 1}
                          </div>
                        </div>
                        {isCurrentAdmin && (
                          <div className="absolute -top-1 -right-1">
                            <div className="w-4 h-4 bg-amber-500 rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap gap-4">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2 space-x-reverse shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="h-4 w-4" />
                <span>إضافة قاعدة جديدة</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right text-xl">إضافة قاعدة جديدة</DialogTitle>
                <DialogDescription className="text-right">
                  أضف قاعدة جديدة لقواعد المنزل مع إمكانيات التنسيق المتقدمة
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="new-title" className="text-right text-lg font-semibold">
                    عنوان القاعدة
                  </Label>
                  <Input
                    id="new-title"
                    value={newRule.title}
                    onChange={(e) => setNewRule({ ...newRule, title: e.target.value })}
                    placeholder="أدخل عنوان القاعدة"
                    className="text-right text-lg p-4 mt-2"
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label htmlFor="new-content" className="text-right text-lg font-semibold">
                    محتوى القاعدة
                  </Label>
                  <div className="mt-2 space-y-3">
                    {/* Updated formatting tools for new rule */}
                    <div className="bg-muted/30 p-4 rounded-lg border">
                      <h4 className="font-semibold text-right mb-3 text-primary">أدوات التنسيق:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="bg-background p-3 rounded border">
                          <div className="font-bold text-right mb-1">• النقاط</div>
                          <div className="text-muted-foreground text-right">ابدأ السطر بـ • أو - أو →</div>
                        </div>
                        <div className="bg-background p-3 rounded border">
                          <div className="font-bold text-right mb-1">&lt;b&gt;نص&lt;/b&gt;</div>
                          <div className="text-muted-foreground text-right">للنص العريض</div>
                        </div>
                        <div className="bg-background p-3 rounded border">
                          <div className="font-bold text-right mb-1">&lt;mark&gt;نص&lt;/mark&gt;</div>
                          <div className="text-muted-foreground text-right">للتمييز</div>
                        </div>
                        <div className="bg-background p-3 rounded border">
                          <div className="font-bold text-right mb-1">&lt;i&gt;نص&lt;/i&gt;</div>
                          <div className="text-muted-foreground text-right">للنص المائل</div>
                        </div>
                      </div>
                    </div>
                    <Textarea
                      id="new-content"
                      value={newRule.content}
                      onChange={(e) => setNewRule({ ...newRule, content: e.target.value })}
                      placeholder="أدخل محتوى القاعدة&#10;&#10;مثال:&#10;<b>العنوان الفرعي الأول</b>&#10;&#10;• النقطة الأولى&#10;• <mark>النقطة المهمة</mark>&#10;→ النتيجة أو التوضيح&#10;&#10;<i>العنوان الفرعي الثاني</i>&#10;&#10;- نقطة أخرى&#10;- نقطة إضافية"
                      className="text-right min-h-48 text-base leading-relaxed p-4"
                      dir="rtl"
                    />
                    {newRule.content && (
                      <div className="bg-muted/20 p-4 rounded-lg border">
                        <h4 className="font-semibold text-right mb-3 text-primary">معاينة:</h4>
                        <div className="bg-background p-4 rounded border">
                          <div className="text-foreground leading-relaxed" dir="rtl">
                            {newRule.content.split("\n").map((line, lineIndex) => {
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
                                      className="flex-1 text-right"
                                      dangerouslySetInnerHTML={{
                                        __html: trimmedLine
                                          .replace(/^[•\-→]\s*/, "")
                                          .replace(
                                            /<b>(.*?)<\/b>/g,
                                            '<strong class="font-bold text-primary">$1</strong>',
                                          )
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

                              return (
                                <p
                                  key={lineIndex}
                                  className="mb-2 text-right font-medium"
                                  dangerouslySetInnerHTML={{
                                    __html: trimmedLine
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
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="new-order" className="text-right text-lg font-semibold">
                    ترتيب القاعدة
                  </Label>
                  <Input
                    id="new-order"
                    type="number"
                    value={newRule.order}
                    onChange={(e) => setNewRule({ ...newRule, order: Number.parseInt(e.target.value) || 1 })}
                    min="1"
                    className="text-right p-4 mt-2"
                  />
                </div>
              </div>
              <DialogFooter className="flex-row-reverse">
                <Button onClick={handleAddRule} className="px-8 py-3">
                  إضافة القاعدة
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="px-8 py-3">
                  إلغاء
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={onShowMessages}
            className="flex items-center space-x-2 space-x-reverse shadow-md hover:shadow-lg transition-all duration-200 bg-white/80 backdrop-blur-sm"
          >
            <MessageSquare className="h-4 w-4" />
            <span>عرض الرسائل ({messages.filter((m) => !m.isRead).length})</span>
          </Button>

          <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                className="flex items-center space-x-2 space-x-reverse shadow-md hover:shadow-lg transition-all duration-200"
              >
                <RotateCcw className="h-4 w-4" />
                <span>إعادة تعيين البيانات</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right">إعادة تعيين جميع البيانات</DialogTitle>
                <DialogDescription className="text-right">
                  هذا الإجراء سيحذف جميع الموافقات والرسائل وبيانات المستخدمين. هل أنت متأكد؟
                </DialogDescription>
              </DialogHeader>
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 my-4">
                <p className="text-sm text-destructive text-right">
                  تحذير: هذا الإجراء لا يمكن التراجع عنه وسيؤثر على جميع المستخدمين المتصلين حالياً.
                </p>
              </div>
              <DialogFooter className="flex-row-reverse">
                <Button
                  variant="destructive"
                  onClick={handleResetAllData}
                  className="flex items-center space-x-2 space-x-reverse"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>تأكيد الإعادة تعيين</span>
                </Button>
                <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                  إلغاء
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 enhanced-card">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-3 space-x-reverse text-xl">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <span>قواعد المنزل</span>
              </CardTitle>
              <div className="flex items-center space-x-3 space-x-reverse">
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/30 font-semibold px-4 py-2 text-sm"
                >
                  {rules.length}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingRule(null)
                    setIsEditDialogOpen(false)
                    setIsAddDialogOpen(true)
                  }}
                  className="shadow-sm hover:shadow-md transition-all duration-200 hover:bg-primary/5"
                >
                  <Plus className="h-4 w-4" />
                  <span>إضافة قاعدة جديدة</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ScrollArea className="h-[100vh]">
              <div className="space-y-6 overflow-y-auto custom-scrollbar">
                {rules.map((rule, index) => (
                  <div
                    key={rule.id}
                    className="border border-border/50 rounded-xl p-6 space-y-4 bg-gradient-to-r from-card to-card/80 dark:from-gray-800 dark:to-gray-700/80 shadow-sm hover:shadow-lg transition-all duration-300 enhanced-card"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <Badge
                          variant="outline"
                          className="bg-primary/10 text-primary border-primary/30 font-semibold px-4 py-2 text-sm"
                        >
                          {rule.order}
                        </Badge>
                        <h3 className="font-bold text-xl text-foreground">{rule.title}</h3>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingRule(rule)
                            setIsEditDialogOpen(true)
                          }}
                          className="shadow-sm hover:shadow-md transition-all duration-200 hover:bg-primary/5"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteRule(rule.id)}
                          className="shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="bg-muted/20 dark:bg-muted/10 p-5 rounded-lg border border-border/20">
                      <div className="text-foreground leading-relaxed text-base" dir="rtl">
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
                                  className="flex-1 text-right"
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

                          return (
                            <p
                              key={lineIndex}
                              className="mb-2 text-right"
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
                    {index < rules.length - 1 && <Separator className="mt-6 opacity-30" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 enhanced-card">
          <CardHeader className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-3 space-x-reverse text-xl">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <span>الرسائل المرسلة</span>
              </CardTitle>
              <div className="flex items-center space-x-3 space-x-reverse">
                <Badge
                  variant="secondary"
                  className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 px-3 py-1"
                >
                  {messages.length} رسالة إجمالي
                </Badge>
                <Badge
                  variant="destructive"
                  className="bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800 px-3 py-1"
                >
                  {messages.filter((m) => !m.isRead).length} غير مقروءة
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
              {messages.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <div className="bg-muted/20 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                    <MessageSquare className="h-16 w-16 opacity-40" />
                  </div>
                  <p className="text-xl font-medium">لا توجد رسائل حتى الآن</p>
                  <p className="text-sm mt-3 opacity-70">ستظهر الرسائل المرسلة من المستخدمين هنا</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`border rounded-xl p-6 space-y-4 shadow-sm hover:shadow-lg transition-all duration-300 enhanced-card ${
                        !message.isRead
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-700"
                          : "bg-gradient-to-r from-card to-card/80 dark:from-gray-800 dark:to-gray-700/80 border-border/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <Badge
                            variant={message.isRead ? "secondary" : "default"}
                            className={`px-4 py-2 font-medium text-sm ${
                              !message.isRead
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground"
                            }`}
                          >
                            {message.isRead ? "مقروءة" : "جديدة"}
                          </Badge>
                          <h3 className="font-bold text-lg text-foreground">{message.senderName}</h3>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground bg-muted/20 px-4 py-2 rounded-full border border-border/20">
                          <span>{new Date(message.createdAt).toLocaleDateString("en-US")}</span>
                          <span>•</span>
                          <span>
                            {new Date(message.createdAt).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="bg-muted/10 dark:bg-muted/5 p-5 rounded-lg border border-border/20">
                        <p className="text-foreground whitespace-pre-line leading-relaxed text-base">
                          {message.content}
                        </p>
                      </div>
                      {!message.isRead && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            const success = await markMessageAsRead(message.id)
                            if (success) {
                              loadData()
                            }
                          }}
                          className="shadow-sm hover:shadow-md transition-all duration-200 hover:bg-primary/5"
                        >
                          تحديد كمقروءة
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {messages.filter((m) => !m.isRead).length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={async () => {
                    const success = await markAllMessagesAsRead()
                    if (success) {
                      loadData()
                    }
                  }}
                  className="w-full shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-primary/5 to-accent/5"
                >
                  تحديد جميع الرسائل كمقروءة
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right text-xl">تعديل القاعدة</DialogTitle>
              <DialogDescription className="text-right">
                قم بتعديل القاعدة المحددة مع إمكانيات التنسيق المتقدمة
              </DialogDescription>
            </DialogHeader>
            {editingRule && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="edit-title" className="text-right text-lg font-semibold">
                    عنوان القاعدة
                  </Label>
                  <Input
                    id="edit-title"
                    value={editingRule.title}
                    onChange={(e) => setEditingRule({ ...editingRule, title: e.target.value })}
                    className="text-right text-lg p-4 mt-2"
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-content" className="text-right text-lg font-semibold">
                    محتوى القاعدة
                  </Label>
                  <div className="mt-2 space-y-3">
                    {/* Updated formatting tools for edit rule */}
                    <div className="bg-muted/30 p-4 rounded-lg border">
                      <h4 className="font-semibold text-right mb-3 text-primary">أدوات التنسيق:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="bg-background p-3 rounded border">
                          <div className="font-bold text-right mb-1">• النقاط</div>
                          <div className="text-muted-foreground text-right">ابدأ السطر بـ • أو - أو →</div>
                        </div>
                        <div className="bg-background p-3 rounded border">
                          <div className="font-bold text-right mb-1">&lt;b&gt;نص&lt;/b&gt;</div>
                          <div className="text-muted-foreground text-right">للنص العريض</div>
                        </div>
                        <div className="bg-background p-3 rounded border">
                          <div className="font-bold text-right mb-1">&lt;mark&gt;نص&lt;/mark&gt;</div>
                          <div className="text-muted-foreground text-right">للتمييز</div>
                        </div>
                        <div className="bg-background p-3 rounded border">
                          <div className="font-bold text-right mb-1">&lt;i&gt;نص&lt;/i&gt;</div>
                          <div className="text-muted-foreground text-right">للنص المائل</div>
                        </div>
                      </div>
                    </div>
                    <Textarea
                      id="edit-content"
                      value={editingRule.content}
                      onChange={(e) => setEditingRule({ ...editingRule, content: e.target.value })}
                      className="text-right min-h-48 text-base leading-relaxed p-4"
                      dir="rtl"
                    />
                    {editingRule.content && (
                      <div className="bg-muted/20 p-4 rounded-lg border">
                        <h4 className="font-semibold text-right mb-3 text-primary">معاينة:</h4>
                        <div className="bg-background p-4 rounded border">
                          <div className="text-foreground leading-relaxed" dir="rtl">
                            {/* Added HTML preview for edit rule */}
                            {editingRule.content.split("\n").map((line, lineIndex) => {
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
                                      className="flex-1 text-right"
                                      dangerouslySetInnerHTML={{
                                        __html: trimmedLine
                                          .replace(/^[•\-→]\s*/, "")
                                          .replace(
                                            /<b>(.*?)<\/b>/g,
                                            '<strong class="font-bold text-primary">$1</strong>',
                                          )
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

                              return (
                                <p
                                  key={lineIndex}
                                  className="mb-2 text-right font-medium"
                                  dangerouslySetInnerHTML={{
                                    __html: trimmedLine
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
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-order" className="text-right text-lg font-semibold">
                    ترتيب القاعدة
                  </Label>
                  <Input
                    id="edit-order"
                    type="number"
                    value={editingRule.order}
                    onChange={(e) => setEditingRule({ ...editingRule, order: Number.parseInt(e.target.value) || 1 })}
                    min="1"
                    className="text-right p-4 mt-2"
                  />
                </div>
              </div>
            )}
            <DialogFooter className="flex-row-reverse">
              <Button onClick={handleEditRule} className="px-8 py-3">
                حفظ التغييرات
              </Button>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="px-8 py-3">
                إلغاء
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
