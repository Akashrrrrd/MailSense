"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, X, Calendar, User, Tag } from "lucide-react"
import type { EmailSummary } from "@/lib/gmail-api"

interface EmailSearchProps {
  emails: EmailSummary[]
  onFilteredEmails: (filtered: EmailSummary[]) => void
}

export function EmailSearch({ emails, onFilteredEmails }: EmailSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPriority, setSelectedPriority] = useState<"all" | "high" | "medium" | "low">("all")
  const [selectedStatus, setSelectedStatus] = useState<"all" | "read" | "unread">("all")
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all")

  const applyFilters = () => {
    let filtered = emails

    // Search term filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (email) =>
          email.subject.toLowerCase().includes(term) ||
          email.from.toLowerCase().includes(term) ||
          email.snippet.toLowerCase().includes(term),
      )
    }

    // Priority filter
    if (selectedPriority !== "all") {
      filtered = filtered.filter((email) => email.priority === selectedPriority)
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((email) => (selectedStatus === "read" ? email.isRead : !email.isRead))
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date()
      const filterDate = new Date()

      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0)
          break
        case "week":
          filterDate.setDate(now.getDate() - 7)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          break
      }

      filtered = filtered.filter((email) => email.date >= filterDate)
    }

    onFilteredEmails(filtered)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedPriority("all")
    setSelectedStatus("all")
    setDateFilter("all")
    onFilteredEmails(emails)
  }

  const hasActiveFilters =
    searchTerm.trim() || selectedPriority !== "all" || selectedStatus !== "all" || dateFilter !== "all"

  return (
    <Card className="mb-4 sm:mb-6">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center text-base sm:text-lg">
          <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
          Search & Filter
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4 sm:space-y-6">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search emails by subject, sender, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Priority Filter */}
            <div>
              <label className="text-sm font-medium mb-3 block">Priority</label>
              <div className="flex flex-wrap gap-2">
                {["all", "high", "medium", "low"].map((priority) => (
                  <Badge
                    key={priority}
                    variant={selectedPriority === priority ? "default" : "outline"}
                    className="cursor-pointer text-sm px-3 py-2 min-h-[36px] flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    onClick={() => setSelectedPriority(priority as any)}
                  >
                    <Tag className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span>{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium mb-3 block">Status</label>
              <div className="flex flex-wrap gap-2">
                {["all", "read", "unread"].map((status) => (
                  <Badge
                    key={status}
                    variant={selectedStatus === status ? "default" : "outline"}
                    className="cursor-pointer text-sm px-3 py-2 min-h-[36px] flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    onClick={() => setSelectedStatus(status as any)}
                  >
                    <User className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <label className="text-sm font-medium mb-3 block">Date</label>
              <div className="flex flex-wrap gap-2">
                {["all", "today", "week", "month"].map((date) => (
                  <Badge
                    key={date}
                    variant={dateFilter === date ? "default" : "outline"}
                    className="cursor-pointer text-sm px-3 py-2 min-h-[36px] flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    onClick={() => setDateFilter(date as any)}
                  >
                    <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span>{date.charAt(0).toUpperCase() + date.slice(1)}</span>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Button onClick={applyFilters} size="sm" className="w-full min-h-[44px] text-sm font-medium">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="w-full min-h-[44px] text-sm font-medium bg-transparent hover:bg-gray-50 active:bg-gray-100"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-3 sm:pt-4 border-t">
              <span className="text-sm font-medium">Active filters:</span>
              {searchTerm.trim() && (
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  Search: "{searchTerm}"
                </Badge>
              )}
              {selectedPriority !== "all" && (
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  Priority: {selectedPriority}
                </Badge>
              )}
              {selectedStatus !== "all" && (
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  Status: {selectedStatus}
                </Badge>
              )}
              {dateFilter !== "all" && (
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  Date: {dateFilter}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
