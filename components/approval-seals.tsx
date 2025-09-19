"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Calendar, Crown } from "lucide-react"
import { getAllApprovals } from "@/lib/auth"
import Image from "next/image"

interface Approval {
  userName: string
  approvedAt: string
  timestamp: number
}

export function ApprovalSeals() {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadApprovals = async () => {
      try {
        console.log("[v0] Loading approvals...")
        const allApprovals = await getAllApprovals()
        console.log("[v0] Loaded approvals:", allApprovals)
        setApprovals(Array.isArray(allApprovals) ? allApprovals : [])
        setLoading(false)
      } catch (error) {
        console.error("[v0] Error loading approvals:", error)
        setApprovals([])
        setLoading(false)
      }
    }

    loadApprovals()
  }, [])

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse text-right">
            <Shield className="h-5 w-5 text-primary" />
            <span>أختام الموافقة</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">جاري التحميل...</p>
        </CardContent>
      </Card>
    )
  }

  if (approvals.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse text-right">
            <Shield className="h-5 w-5 text-primary" />
            <span>أختام الموافقة</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">لا توجد موافقات بعد</p>
        </CardContent>
      </Card>
    )
  }

  const adminApprovals = approvals.filter((approval) => approval.userName === "Ahmed")
  const regularApprovals = approvals.filter((approval) => approval.userName !== "Ahmed")

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse text-right">
          <Shield className="h-5 w-5 text-primary" />
          <span>أختام الموافقة الرسمية</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {adminApprovals.map((approval, index) => (
            <div key={`admin-${approval.userName}`} className="relative group">
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-4 border-2 border-amber-300 dark:border-amber-600 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 flex items-center justify-center">
                      <Image
                        src="/images/approved.png"
                        alt="Approved"
                        width={96}
                        height={96}
                        className="object-contain"
                      />
                    </div>
                  </div>

                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-end space-x-2 space-x-reverse mb-1">
                      <Crown className="h-5 w-5 text-amber-600" />
                      <h3 className="font-bold text-xl text-amber-800 dark:text-amber-200">{approval.userName}</h3>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100 text-sm px-3 py-1 mb-2"
                    >
                      المدير - موافقة رسمية
                    </Badge>
                    <div className="flex items-center justify-end space-x-1 space-x-reverse text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(approval.approvedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="absolute top-2 right-2">
                  <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    <Crown className="h-4 w-4" />
                  </div>
                </div>

                <div className="absolute inset-0 rounded-xl border-2 border-dashed border-amber-400 dark:border-amber-500 opacity-40 pointer-events-none"></div>
              </div>
            </div>
          ))}

          {regularApprovals.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {regularApprovals.map((approval, index) => (
                <div key={approval.userName} className="relative group">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-3 md:p-4 border-2 border-emerald-200 dark:border-emerald-700 hover:shadow-lg transition-all duration-200">
                    <div className="flex justify-center mb-2 md:mb-3">
                      <div className="relative">
                        <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
                          <Image
                            src="/images/approved.png"
                            alt="Approved"
                            width={80}
                            height={80}
                            className="object-contain md:w-[96px] md:h-[96px]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="text-center mb-2">
                      <h3 className="font-bold text-sm md:text-base text-emerald-800 dark:text-emerald-200 truncate">
                        {approval.userName}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100 text-xs px-2 py-1"
                      >
                        موافق
                      </Badge>
                    </div>

                    <div className="hidden md:flex items-center justify-center space-x-1 space-x-reverse text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(approval.approvedAt).toLocaleDateString("ar-SA", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="absolute top-1 right-1 md:top-2 md:right-2">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        #{adminApprovals.length + index + 1}
                      </div>
                    </div>

                    <div className="absolute inset-0 rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-600 opacity-30 pointer-events-none"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
          <div className="flex items-center justify-center space-x-2 space-x-reverse">
            <Shield className="h-5 w-5 text-emerald-600" />
            <span className="font-semibold text-emerald-800 dark:text-emerald-200">
              إجمالي الموافقات: {approvals.length} موافقة رسمية
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
