"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, TrendingUp, Target, Zap, AlertCircle, Mail } from "lucide-react"
import type { EmailSummary } from "@/lib/gmail-api"
import { EmailClassifier } from "@/lib/ai-classifier"

interface ClassificationInsightsProps {
  emails: EmailSummary[]
}

export function ClassificationInsights({ emails }: ClassificationInsightsProps) {
  const classifier = new EmailClassifier()
  const stats = classifier.getClassificationStats(emails)
  const priorityBreakdown = classifier.getEmailsByPriority(emails)

  const getPriorityPercentage = (count: number) => {
    return stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "High Confidence"
    if (confidence >= 0.6) return "Medium Confidence"
    return "Low Confidence"
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Classification Overview */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center text-base sm:text-lg leading-tight">
            <Brain className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600 flex-shrink-0" />
            AI Classification Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="text-center space-y-2 sm:space-y-3">
              <div className="text-xl sm:text-2xl font-bold text-red-600 leading-tight">{stats.high}</div>
              <div className="text-xs sm:text-sm text-gray-600 leading-relaxed">High Priority</div>
              <Progress value={getPriorityPercentage(stats.high)} className="h-2" />
            </div>
            <div className="text-center space-y-2 sm:space-y-3">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600 leading-tight">{stats.medium}</div>
              <div className="text-xs sm:text-sm text-gray-600 leading-relaxed">Medium Priority</div>
              <Progress value={getPriorityPercentage(stats.medium)} className="h-2" />
            </div>
            <div className="text-center space-y-2 sm:space-y-3">
              <div className="text-xl sm:text-2xl font-bold text-gray-600 leading-tight">{stats.low}</div>
              <div className="text-xs sm:text-sm text-gray-600 leading-relaxed">Low Priority</div>
              <Progress value={getPriorityPercentage(stats.low)} className="h-2" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <Target className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium leading-relaxed">Average Confidence:</span>
              <Badge variant="outline" className={`${getConfidenceColor(stats.averageConfidence)} px-2 py-1`}>
                {Math.round(stats.averageConfidence * 100)}%
              </Badge>
            </div>
            <Badge variant="secondary" className="px-3 py-1 text-xs">
              {getConfidenceLabel(stats.averageConfidence)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Top Keywords */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center text-base sm:text-lg leading-tight">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600 flex-shrink-0" />
            Classification Keywords
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {stats.topKeywords.length > 0 ? (
              stats.topKeywords.map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                  {keyword}
                </Badge>
              ))
            ) : (
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">No keywords detected yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Priority Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm flex items-center leading-tight">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-red-500 flex-shrink-0" />
              High Priority ({stats.high})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {priorityBreakdown.high.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {priorityBreakdown.high.slice(0, 3).map((email) => (
                  <div key={email.id} className="p-2 sm:p-3 bg-red-50 rounded border border-red-200">
                    <p className="text-xs font-medium line-clamp-1 leading-relaxed mb-1">{email.subject}</p>
                    <p className="text-xs text-gray-600 line-clamp-1 leading-relaxed">
                      {email.from.split("<")[0].replace(/"/g, "")}
                    </p>
                  </div>
                ))}
                {priorityBreakdown.high.length > 3 && (
                  <p className="text-xs text-gray-500 text-center leading-relaxed">
                    +{priorityBreakdown.high.length - 3} more
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-600 leading-relaxed">No high priority emails</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm flex items-center leading-tight">
              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-yellow-500 flex-shrink-0" />
              Medium Priority ({stats.medium})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {priorityBreakdown.medium.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {priorityBreakdown.medium.slice(0, 3).map((email) => (
                  <div key={email.id} className="p-2 sm:p-3 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-xs font-medium line-clamp-1 leading-relaxed mb-1">{email.subject}</p>
                    <p className="text-xs text-gray-600 line-clamp-1 leading-relaxed">
                      {email.from.split("<")[0].replace(/"/g, "")}
                    </p>
                  </div>
                ))}
                {priorityBreakdown.medium.length > 3 && (
                  <p className="text-xs text-gray-500 text-center leading-relaxed">
                    +{priorityBreakdown.medium.length - 3} more
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-600 leading-relaxed">No medium priority emails</p>
            )}
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm flex items-center leading-tight">
              <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-500 flex-shrink-0" />
              Low Priority ({stats.low})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {priorityBreakdown.low.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {priorityBreakdown.low.slice(0, 3).map((email) => (
                  <div key={email.id} className="p-2 sm:p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs font-medium line-clamp-1 leading-relaxed mb-1">{email.subject}</p>
                    <p className="text-xs text-gray-600 line-clamp-1 leading-relaxed">
                      {email.from.split("<")[0].replace(/"/g, "")}
                    </p>
                  </div>
                ))}
                {priorityBreakdown.low.length > 3 && (
                  <p className="text-xs text-gray-500 text-center leading-relaxed">
                    +{priorityBreakdown.low.length - 3} more
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-600 leading-relaxed">No low priority emails</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
