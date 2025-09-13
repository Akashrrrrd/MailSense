"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { EmailList } from "./email-list"
import { Zap, AlertCircle, Mail } from "lucide-react"
import type { EmailSummary } from "@/lib/gmail-api"

interface EmailPriorityTabsProps {
  emails: EmailSummary[]
  loading: boolean
  error: string | null
  onMarkAsRead: (emailId: string) => Promise<boolean>
  onRefresh: () => Promise<void>
}

export function EmailPriorityTabs({ emails, loading, error, onMarkAsRead, onRefresh }: EmailPriorityTabsProps) {
  const highPriorityEmails = emails.filter((email) => email.priority === "high")
  const mediumPriorityEmails = emails.filter((email) => email.priority === "medium")
  const lowPriorityEmails = emails.filter((email) => email.priority === "low")

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-4 h-auto p-1">
        <TabsTrigger
          value="all"
          className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 px-1 sm:px-3"
        >
          <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="text-xs sm:text-sm">All</span>
          <Badge variant="secondary" className="text-xs px-1 py-0 h-4 min-w-[16px] flex items-center justify-center">
            {emails.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger
          value="high"
          className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 px-1 sm:px-3"
        >
          <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
          <span className="text-xs sm:text-sm">High</span>
          <Badge className="text-xs px-1 py-0 h-4 min-w-[16px] flex items-center justify-center bg-red-600 text-white border-red-600">
            {highPriorityEmails.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger
          value="medium"
          className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 px-1 sm:px-3"
        >
          <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0" />
          <span className="text-xs sm:text-sm">Med</span>
          <Badge variant="secondary" className="text-xs px-1 py-0 h-4 min-w-[16px] flex items-center justify-center">
            {mediumPriorityEmails.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger
          value="low"
          className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 px-1 sm:px-3"
        >
          <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
          <span className="text-xs sm:text-sm">Low</span>
          <Badge variant="outline" className="text-xs px-1 py-0 h-4 min-w-[16px] flex items-center justify-center">
            {lowPriorityEmails.length}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-4 sm:mt-6">
        <EmailList emails={emails} loading={loading} error={error} onMarkAsRead={onMarkAsRead} onRefresh={onRefresh} />
      </TabsContent>

      <TabsContent value="high" className="mt-4 sm:mt-6">
        <EmailList
          emails={highPriorityEmails}
          loading={loading}
          error={error}
          onMarkAsRead={onMarkAsRead}
          onRefresh={onRefresh}
        />
      </TabsContent>

      <TabsContent value="medium" className="mt-4 sm:mt-6">
        <EmailList
          emails={mediumPriorityEmails}
          loading={loading}
          error={error}
          onMarkAsRead={onMarkAsRead}
          onRefresh={onRefresh}
        />
      </TabsContent>

      <TabsContent value="low" className="mt-4 sm:mt-6">
        <EmailList
          emails={lowPriorityEmails}
          loading={loading}
          error={error}
          onMarkAsRead={onMarkAsRead}
          onRefresh={onRefresh}
        />
      </TabsContent>
    </Tabs>
  )
}
