"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, MessageCircle, Sparkles } from "lucide-react"

export function AIAssistantDemo() {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center text-blue-900">
          <Bot className="h-5 w-5 mr-2" />
          AI Assistant
          <Badge className="ml-2 bg-blue-600 text-white text-xs">NEW</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <p className="text-sm text-blue-800">
            Ask me anything about your emails! I can help you find specific messages, analyze patterns, and get insights.
          </p>
          
          <div className="space-y-2">
            <div className="text-xs font-medium text-blue-900 flex items-center">
              <Sparkles className="h-3 w-3 mr-1" />
              Try asking:
            </div>
            <div className="grid grid-cols-1 gap-1 text-xs">
              <div className="bg-white p-2 rounded border border-blue-200 text-gray-700">
                "Show me my high priority emails"
              </div>
              <div className="bg-white p-2 rounded border border-blue-200 text-gray-700">
                "Any emails from my boss today?"
              </div>
              <div className="bg-white p-2 rounded border border-blue-200 text-gray-700">
                "Summarize my unread emails"
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center pt-2">
            <div className="flex items-center text-xs text-blue-700">
              <MessageCircle className="h-3 w-3 mr-1" />
              Click the chat icon to get started
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}