"use client"

import { useAuth } from "@/hooks/use-auth"
import { useGmail } from "@/hooks/use-gmail"
import { AuthGuard } from "@/components/auth-guard"
import { ClassificationInsights } from "@/components/classification-insights"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Brain, BarChart3, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function InsightsPage() {
  const { user } = useAuth()
  const { emails, loading, error, refreshEmails } = useGmail()

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
                  <Brain className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                  <span className="truncate">AI Classification Insights</span>
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Deep analysis of your email patterns and AI performance
                </p>
              </div>
            </div>
            <Button
              onClick={refreshEmails}
              disabled={loading}
              variant="outline"
              className="w-full sm:w-auto bg-transparent min-h-[36px]"
            >
              <span className="text-xs sm:text-sm">{loading ? "Refreshing..." : "Refresh Data"}</span>
            </Button>
          </div>

          {/* Content */}
          {error ? (
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-red-600 text-base sm:text-lg">Error Loading Data</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">{error}</p>
                <Button onClick={refreshEmails} variant="outline" className="w-full sm:w-auto bg-transparent">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : loading && emails.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto mb-3 sm:mb-4"></div>
                <p className="text-gray-600 text-sm sm:text-base">Loading email data for analysis...</p>
              </CardContent>
            </Card>
          ) : emails.length === 0 ? (
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                  No Data Available
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  No emails found to analyze. Try syncing your Gmail account first.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Link href="/dashboard">
                  <Button className="w-full sm:w-auto">Go to Dashboard</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium">Total Analyzed</CardTitle>
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xl sm:text-2xl font-bold">{emails.length}</div>
                    <p className="text-xs text-muted-foreground">Emails processed</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium">AI Accuracy</CardTitle>
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xl sm:text-2xl font-bold">94%</div>
                    <p className="text-xs text-muted-foreground">Classification rate</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium">Processing Speed</CardTitle>
                    <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xl sm:text-2xl font-bold">0.2s</div>
                    <p className="text-xs text-muted-foreground">Per email average</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium">User</CardTitle>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-blue-600 flex-shrink-0"></div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-base sm:text-lg font-bold line-clamp-1">{user?.displayName}</div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{user?.email}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Insights */}
              <ClassificationInsights emails={emails} />
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
