"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, MessageSquare, CheckCheck, User, Clock } from "lucide-react"
import { getMessages, markMessageAsRead, markAllMessagesAsRead, type Message } from "@/lib/messages"

interface MessagesViewProps {
  onBack: () => void
}

export function MessagesView({ onBack }: MessagesViewProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    try {
      const messagesData = await getMessages()
      setMessages(messagesData)
    } catch (error) {
      console.error("Error loading messages:", error)
      setError("حدث خطأ في تحميل الرسائل")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (messageId: string) => {
    const success = await markMessageAsRead(messageId)
    if (success) {
      setMessages(messages.map((msg) => (msg.id === messageId ? { ...msg, isRead: true } : msg)))
    }
  }

  const handleMarkAllAsRead = async () => {
    const success = await markAllMessagesAsRead()
    if (success) {
      setMessages(messages.map((msg) => ({ ...msg, isRead: true })))
      setSuccess("تم تمييز جميع الرسائل كمقروءة")
    } else {
      setError("حدث خطأ أثناء تمييز الرسائل")
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل الرسائل...</p>
        </div>
      </div>
    )
  }

  const unreadCount = messages.filter((msg) => !msg.isRead).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Button variant="ghost" onClick={onBack} className="p-2">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <MessageSquare className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-2xl">الرسائل</CardTitle>
                  <CardDescription>رسائل المستخدمين</CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Badge variant="secondary">{messages.length} رسالة إجمالي</Badge>
                {unreadCount > 0 && <Badge variant="destructive">{unreadCount} غير مقروءة</Badge>}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Action Buttons */}
        {unreadCount > 0 && (
          <div className="flex justify-end">
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              className="flex items-center space-x-2 space-x-reverse bg-transparent"
            >
              <CheckCheck className="h-4 w-4" />
              <span>تمييز الكل كمقروء</span>
            </Button>
          </div>
        )}

        {/* Alerts */}
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

        {/* Messages List */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <MessageSquare className="h-5 w-5" />
              <span>جميع الرسائل</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد رسائل حتى الآن</p>
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`border rounded-lg p-4 space-y-3 transition-colors ${
                        !message.isRead
                          ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                          : "bg-card"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{message.senderName}</span>
                          {!message.isRead && (
                            <Badge variant="destructive" className="text-xs">
                              جديد
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(message.createdAt)}</span>
                        </div>
                      </div>

                      <p className="text-foreground leading-relaxed whitespace-pre-line">{message.content}</p>

                      {!message.isRead && (
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead(message.id)}
                            className="flex items-center space-x-1 space-x-reverse"
                          >
                            <CheckCheck className="h-3 w-3" />
                            <span>تمييز كمقروء</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
