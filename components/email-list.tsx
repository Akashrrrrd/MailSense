"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Mail, Clock, User, Zap, AlertCircle, CheckCircle2 } from "lucide-react"
import type { EmailSummary } from "@/lib/gmail-api"

interface EmailListProps {
  emails: EmailSummary[]
  loading: boolean
  error: string | null
  onMarkAsRead: (emailId: string) => Promise<boolean>
  onRefresh: () => Promise<void>
}

export function EmailList({ emails, loading, error, onMarkAsRead, onRefresh }: EmailListProps) {
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null)

  const handleMarkAsRead = async (emailId: string) => {
    setMarkingAsRead(emailId)
    await onMarkAsRead(emailId)
    setMarkingAsRead(null)
  }

  const getPriorityIcon = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
      case "medium":
        return <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0" />
      case "low":
        return <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
    }
  }

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return { variant: "destructive" as const, className: "bg-red-600 text-white border-red-600" }
      case "medium":
        return { variant: "secondary" as const, className: "" }
      case "low":
        return { variant: "outline" as const, className: "" }
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const extractSenderName = (from: string) => {
    const match = from.match(/^(.+?)\s*</)
    return match ? match[1].replace(/"/g, "") : from.split("@")[0]
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center text-red-600 text-base sm:text-lg">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
            Error Loading Emails
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">{error}</p>
          <Button onClick={onRefresh} variant="outline" size="sm" className="w-full sm:w-auto bg-transparent">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
          <CardTitle className="flex items-center text-base sm:text-lg">
            <Mail className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
            Recent Emails ({emails.length})
          </CardTitle>
          <Button
            onClick={onRefresh}
            disabled={loading}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto bg-transparent"
          >
            {loading ? "Syncing..." : "Refresh"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading && emails.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto mb-3 sm:mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Loading your emails...</p>
          </div>
        ) : emails.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <Mail className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-600 text-sm sm:text-base">No emails found</p>
            <p className="text-xs sm:text-sm text-gray-500">Try refreshing or check your Gmail connection</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] sm:h-[500px] lg:h-[600px]">
            <div className="space-y-3 sm:space-y-4">
              {emails.map((email, index) => (
                <div key={email.id}>
                  <div
                    className={`p-3 sm:p-4 rounded-lg border transition-colors w-full ${
                      email.isRead ? "bg-gray-50" : "bg-white border-blue-200"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 space-y-2 sm:space-y-0">
                      <div className="flex items-center flex-1 min-w-0 flex-wrap gap-1">
                        {getPriorityIcon(email.priority)}
                        <Badge 
                          variant={getPriorityColor(email.priority).variant} 
                          className={`text-xs px-1 py-0 h-5 ${getPriorityColor(email.priority).className}`}
                        >
                          {email.priority.toUpperCase()}
                        </Badge>
                        {!email.isRead && (
                          <Badge variant="default" className="text-xs bg-blue-600 px-1 py-0 h-5">
                            NEW
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500 flex-shrink-0 ml-2">
                        <Clock className="h-3 w-3" />
                        {formatDate(email.date)}
                      </div>
                    </div>

                    <div className="mb-2 sm:mb-3 space-y-1">
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-xs sm:text-sm truncate flex-1 min-w-0">
                          {extractSenderName(email.from)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1 text-sm sm:text-base pl-5 -mt-1">
                        {email.subject}
                      </h3>
                    </div>

                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-3 pl-5 -mt-1">
                      {email.snippet}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                      <div className="text-xs text-gray-500">ID: {email.id.substring(0, 8)}...</div>
                      {!email.isRead && (
                        <Button
                          onClick={() => handleMarkAsRead(email.id)}
                          disabled={markingAsRead === email.id}
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto min-h-[36px]"
                        >
                          {markingAsRead === email.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-1"></div>
                          ) : (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          )}
                          <span className="text-xs sm:text-sm">Mark as Read</span>
                        </Button>
                      )}
                    </div>
                  </div>
                  {index < emails.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
