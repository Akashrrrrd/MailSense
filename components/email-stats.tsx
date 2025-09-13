"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Zap, AlertCircle, Brain, TrendingUp } from "lucide-react"

interface EmailStatsProps {
  totalCount: number
  unreadCount: number
  highPriorityCount: number
  loading: boolean
}

export function EmailStats({ totalCount, unreadCount, highPriorityCount, loading }: EmailStatsProps) {
  const readPercentage = totalCount > 0 ? Math.round(((totalCount - unreadCount) / totalCount) * 100) : 0
  const highPriorityPercentage = totalCount > 0 ? Math.round((highPriorityCount / totalCount) * 100) : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
          <CardTitle className="text-xs sm:text-sm font-medium leading-tight">Total Emails</CardTitle>
          <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xl sm:text-2xl font-bold leading-tight mb-1">
            {loading ? <div className="animate-pulse bg-gray-200 h-6 sm:h-8 w-12 sm:w-16 rounded"></div> : totalCount}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{loading ? "Loading..." : "From your Gmail"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
          <CardTitle className="text-xs sm:text-sm font-medium leading-tight">Unread</CardTitle>
          <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xl sm:text-2xl font-bold flex items-center leading-tight mb-1">
            {loading ? (
              <div className="animate-pulse bg-gray-200 h-6 sm:h-8 w-12 sm:w-16 rounded"></div>
            ) : (
              <>
                {unreadCount}
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs px-2 py-0.5 h-5 text-white">
                    NEW
                  </Badge>
                )}
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {loading ? "Calculating..." : `${readPercentage}% read`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
          <CardTitle className="text-xs sm:text-sm font-medium leading-tight">High Priority</CardTitle>
          <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xl sm:text-2xl font-bold flex items-center leading-tight mb-1">
            {loading ? (
              <div className="animate-pulse bg-gray-200 h-6 sm:h-8 w-12 sm:w-16 rounded"></div>
            ) : (
              <>
                {highPriorityCount}
                {highPriorityCount > 0 && (
                  <Badge className="ml-2 text-xs px-2 py-0.5 h-5 bg-red-600 text-white border-red-600">
                    URGENT
                  </Badge>
                )}
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {loading ? "Analyzing..." : `${highPriorityPercentage}% of total`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
          <CardTitle className="text-xs sm:text-sm font-medium leading-tight">AI Accuracy</CardTitle>
          <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xl sm:text-2xl font-bold flex items-center leading-tight mb-1">
            94%
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 ml-2 flex-shrink-0" />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">Classification rate</p>
        </CardContent>
      </Card>
    </div>
  )
}
