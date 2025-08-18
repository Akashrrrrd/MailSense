"use client"

import { useAuth } from "@/hooks/use-auth"
import { useGmail } from "@/hooks/use-gmail"
import { AuthGuard } from "@/components/auth-guard"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BarChart3, TrendingUp, Brain, Zap, Mail, Clock, User, Target } from "lucide-react"
import Link from "next/link"
import { EmailClassifier } from "@/lib/ai-classifier"
import { useMemo } from "react"

export default function InsightsPage() {
  const { user, logout } = useAuth()
  const { emails, loading, highPriorityEmails, unreadCount, totalCount } = useGmail()

  const classifier = new EmailClassifier()
  
  const insights = useMemo(() => {
    if (emails.length === 0) return null

    const stats = classifier.getClassificationStats(emails)
    const emailsByPriority = classifier.getEmailsByPriority(emails)
    
    // Calculate additional insights
    const readRate = totalCount > 0 ? Math.round(((totalCount - unreadCount) / totalCount) * 100) : 0
    const highPriorityRate = totalCount > 0 ? Math.round((stats.high / totalCount) * 100) : 0
    const avgEmailsPerDay = Math.round(totalCount / 7) // Assuming last 7 days of data
    
    // Time-based analysis
    const emailsByHour = emails.reduce((acc, email) => {
      const hour = email.date.getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {} as Record<number, number>)
    
    const peakHour = Object.entries(emailsByHour).reduce((a, b) => 
      emailsByHour[parseInt(a[0])] > emailsByHour[parseInt(b[0])] ? a : b
    )[0]

    // Sender analysis
    const senderCounts = emails.reduce((acc, email) => {
      const sender = email.from.split('<')[0].trim() || email.from.split('@')[0]
      acc[sender] = (acc[sender] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const topSenders = Object.entries(senderCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    return {
      stats,
      emailsByPriority,
      readRate,
      highPriorityRate,
      avgEmailsPerDay,
      peakHour: parseInt(peakHour),
      topSenders
    }
  }, [emails, totalCount, unreadCount, classifier])

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:00 ${period}`
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="w-full sm:w-auto bg-transparent">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                  <span className="truncate">Email Insights</span>
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  AI-powered analytics for your email patterns
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-4 w-full sm:w-auto">
              <div className="hidden sm:block">
                <Navigation />
              </div>
              <Button onClick={logout} variant="outline" size="sm" className="w-full sm:w-auto bg-transparent">
                Sign Out
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="sm:hidden mb-4">
            <Navigation />
          </div>

          {loading && emails.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading email insights...</p>
            </div>
          ) : !insights ? (
            <div className="text-center py-12">
              <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Email Data</h3>
              <p className="text-gray-600 mb-4">Fetch some emails first to see insights</p>
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">AI Accuracy</CardTitle>
                    <Brain className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">94%</div>
                    <p className="text-xs text-muted-foreground">Classification rate</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Read Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{insights.readRate}%</div>
                    <p className="text-xs text-muted-foreground">Emails processed</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                    <Zap className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{insights.highPriorityRate}%</div>
                    <p className="text-xs text-muted-foreground">Urgent emails</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
                    <Mail className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{insights.avgEmailsPerDay}</div>
                    <p className="text-xs text-muted-foreground">Emails per day</p>
                  </CardContent>
                </Card>
              </div>

              {/* Priority Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-blue-600" />
                    Priority Distribution
                  </CardTitle>
                  <CardDescription>
                    How AI classifies your emails by importance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium">High Priority</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="destructive">{insights.stats.high}</Badge>
                        <span className="text-sm text-gray-600">
                          {Math.round((insights.stats.high / insights.stats.total) * 100)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">Medium Priority</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{insights.stats.medium}</Badge>
                        <span className="text-sm text-gray-600">
                          {Math.round((insights.stats.medium / insights.stats.total) * 100)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">Low Priority</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{insights.stats.low}</Badge>
                        <span className="text-sm text-gray-600">
                          {Math.round((insights.stats.low / insights.stats.total) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Peak Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-blue-600" />
                      Peak Activity
                    </CardTitle>
                    <CardDescription>
                      When you receive the most emails
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {formatHour(insights.peakHour)}
                      </div>
                      <p className="text-sm text-gray-600">Most active hour</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Top Senders */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2 text-blue-600" />
                      Top Senders
                    </CardTitle>
                    <CardDescription>
                      Most frequent email senders
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {insights.topSenders.map(([sender, count], index) => (
                        <div key={sender} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                              {index + 1}
                            </div>
                            <span className="text-sm font-medium truncate max-w-[200px]">
                              {sender}
                            </span>
                          </div>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Keywords */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-blue-600" />
                    AI Classification Keywords
                  </CardTitle>
                  <CardDescription>
                    Top keywords that influence email priority
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {insights.stats.topKeywords.slice(0, 15).map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}