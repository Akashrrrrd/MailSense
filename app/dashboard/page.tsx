"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useGmail } from "@/hooks/use-gmail"
import { AuthGuard } from "@/components/auth-guard"
import { EmailPriorityTabs } from "@/components/email-priority-tabs"
import { EmailStats } from "@/components/email-stats"
import { EmailSearch } from "@/components/email-search"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, User, Brain, Zap, RefreshCw, Menu } from "lucide-react"
import type { EmailSummary } from "@/lib/gmail-api"

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const {
    emails,
    loading,
    error,
    highPriorityEmails,
    unreadCount,
    totalCount,
    refreshEmails,
    markAsRead,
    classifyEmails,
  } = useGmail()

  const [filteredEmails, setFilteredEmails] = useState<EmailSummary[]>([])
  const [showFiltered, setShowFiltered] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)

  const handleFilteredEmails = (filtered: EmailSummary[]) => {
    setFilteredEmails(filtered)
    setShowFiltered(true)
  }

  const displayEmails = showFiltered ? filteredEmails : emails

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                  MailSense Dashboard
                </h1>
                <p className="text-sm sm:text-base text-gray-600 truncate">
                  Welcome back, {user?.displayName || user?.email}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden flex-shrink-0 bg-transparent"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 w-full sm:w-auto">
              <div className="hidden sm:block">
                <Navigation />
              </div>
              <Button onClick={classifyEmails} variant="outline" size="sm" className="flex-shrink-0 bg-transparent">
                <Brain className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Re-classify</span>
              </Button>
              <Button
                onClick={refreshEmails}
                disabled={loading}
                variant="outline"
                size="sm"
                className="flex-shrink-0 bg-transparent"
              >
                <RefreshCw className={`h-4 w-4 sm:mr-2 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">{loading ? "Syncing..." : "Sync"}</span>
              </Button>
              <Button onClick={logout} variant="outline" size="sm" className="flex-shrink-0 bg-transparent">
                <span className="text-xs sm:text-sm">Sign Out</span>
              </Button>
            </div>
          </div>

          <div className="sm:hidden mb-4">
            <Navigation />
          </div>

          {/* Stats */}
          <div className="mb-6 sm:mb-8">
            <EmailStats
              totalCount={totalCount}
              unreadCount={unreadCount}
              highPriorityCount={highPriorityEmails.length}
              loading={loading}
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Email Content - Takes up 3 columns on desktop, full width on mobile */}
            <div className="lg:col-span-3 space-y-4 sm:space-y-6">
              {/* Search and Filter */}
              <EmailSearch emails={emails} onFilteredEmails={handleFilteredEmails} />

              {/* Email Tabs */}
              <EmailPriorityTabs
                emails={displayEmails}
                loading={loading}
                error={error}
                onMarkAsRead={markAsRead}
                onRefresh={refreshEmails}
              />
            </div>

            <div className={`space-y-4 sm:space-y-6 ${showSidebar ? "block" : "hidden"} lg:block`}>
              {/* User Profile */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg">Profile</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center space-x-3">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL || "/placeholder.svg"}
                        alt="Profile"
                        className="w-10 h-10 rounded-full flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base truncate">{user?.displayName}</p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{user?.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* High Priority Summary */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mr-2 flex-shrink-0" />
                    <span className="truncate">Urgent Emails</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Requires immediate attention</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {highPriorityEmails.length === 0 ? (
                    <div className="text-center py-3 sm:py-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                        <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <p className="text-gray-600 text-xs sm:text-sm">All caught up!</p>
                      <p className="text-xs text-gray-500">No urgent emails</p>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {highPriorityEmails.slice(0, 5).map((email) => (
                        <div key={email.id} className="p-2 sm:p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="destructive" className="text-xs">
                              URGENT
                            </Badge>
                            {!email.isRead && (
                              <Badge variant="default" className="text-xs bg-blue-600">
                                NEW
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium text-xs sm:text-sm line-clamp-1">{email.subject}</p>
                          <p className="text-xs text-gray-600 line-clamp-1">
                            {email.from.split("<")[0].replace(/"/g, "")}
                          </p>
                        </div>
                      ))}
                      {highPriorityEmails.length > 5 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{highPriorityEmails.length - 5} more urgent emails
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">Total Emails</span>
                    <Badge variant="outline" className="text-xs">
                      {totalCount}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">Unread</span>
                    <Badge variant="secondary" className="text-xs">
                      {unreadCount}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">High Priority</span>
                    <Badge variant="destructive" className="text-xs">
                      {highPriorityEmails.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">AI Accuracy</span>
                    <Badge variant="outline" className="text-green-600 text-xs">
                      94%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
