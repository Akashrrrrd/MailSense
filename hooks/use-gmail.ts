"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "./use-auth"
import { GmailAPI, parseEmailMessage, type EmailSummary } from "@/lib/gmail-api"
import { EmailClassifier } from "@/lib/ai-classifier"
import { notificationService } from "@/lib/notification-service"
import { EmailStorage } from "@/lib/email-storage"

export interface UseGmailReturn {
  emails: EmailSummary[]
  loading: boolean
  error: string | null
  highPriorityEmails: EmailSummary[]
  unreadCount: number
  totalCount: number
  refreshEmails: () => Promise<void>
  markAsRead: (emailId: string) => Promise<boolean>
  classifyEmails: () => void
  storedImportantEmails: EmailSummary[]
}

export function useGmail(): UseGmailReturn {
  const { user, getAccessToken } = useAuth()
  const [emails, setEmails] = useState<EmailSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)
  const [storedImportantEmails, setStoredImportantEmails] = useState<EmailSummary[]>([])

  const classifier = new EmailClassifier()

  useEffect(() => {
    const stored = EmailStorage.getStoredEmails()
    setStoredImportantEmails(stored)
  }, [])

  const fetchEmails = useCallback(async () => {
    if (!user) {
      setError("User not authenticated")
      return
    }

    const accessToken = getAccessToken()
    if (!accessToken) {
      setError("No access token available. Please sign in again.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const gmailAPI = new GmailAPI(accessToken)
      const rawEmails = await gmailAPI.fetchEmails(50)

      const parsedEmails = rawEmails.map((email) => {
        const summary = parseEmailMessage(email)
        const classification = classifier.classifyEmail(summary)
        return {
          ...summary,
          priority: classification.priority,
        }
      })

      const importantEmails = parsedEmails.filter((email) => email.priority === "high")
      importantEmails.forEach((email) => {
        EmailStorage.storeImportantEmail(email)
      })

      const updatedStoredEmails = EmailStorage.getStoredEmails()
      setStoredImportantEmails(updatedStoredEmails)

      const currentTime = Date.now()
      const newEmails = parsedEmails.filter((email) => email.date.getTime() > lastFetchTime)

      if (newEmails.length > 0) {
        const newHighPriorityEmails = newEmails.filter((email) => email.priority === "high")

        if (newHighPriorityEmails.length === 1) {
          await notificationService.showNotification(newHighPriorityEmails[0])
        } else if (newHighPriorityEmails.length > 1) {
          await notificationService.showBulkNotification(newHighPriorityEmails)
        }
      }

      setEmails(parsedEmails)
      setLastFetchTime(currentTime)
    } catch (err: any) {
      console.error("Error fetching emails:", err)
      setError(err.message || "Failed to fetch emails")
    } finally {
      setLoading(false)
    }
  }, [user, getAccessToken, classifier, lastFetchTime])

  const markAsRead = useCallback(
    async (emailId: string): Promise<boolean> => {
      const accessToken = getAccessToken()
      if (!accessToken) return false

      try {
        const gmailAPI = new GmailAPI(accessToken)
        const success = await gmailAPI.markAsRead(emailId)

        if (success) {
          setEmails((prev) => prev.map((email) => (email.id === emailId ? { ...email, isRead: true } : email)))
        }

        return success
      } catch (err) {
        console.error("Error marking email as read:", err)
        return false
      }
    },
    [getAccessToken],
  )

  const classifyEmails = useCallback(() => {
    setEmails((prev) =>
      prev.map((email) => {
        const classification = classifier.classifyEmail(email)
        return {
          ...email,
          priority: classification.priority,
        }
      }),
    )
  }, [classifier])

  useEffect(() => {
    if (user && getAccessToken()) {
      fetchEmails()
    }
  }, [user, fetchEmails, getAccessToken])

  useEffect(() => {
    if (!user) return

    const interval = setInterval(
      () => {
        notificationService.processQueuedNotifications()
        fetchEmails()
      },
      2 * 60 * 1000,
    )

    return () => clearInterval(interval)
  }, [user, fetchEmails])

  useEffect(() => {
    const cleanup = () => {
      EmailStorage.clearOldEmails(30)
    }

    cleanup()
    const cleanupInterval = setInterval(cleanup, 24 * 60 * 60 * 1000)

    return () => clearInterval(cleanupInterval)
  }, [])

  const highPriorityEmails = emails.filter((email) => email.priority === "high")
  const unreadCount = emails.filter((email) => !email.isRead).length
  const totalCount = emails.length

  return {
    emails,
    loading,
    error,
    highPriorityEmails,
    unreadCount,
    totalCount,
    refreshEmails: fetchEmails,
    markAsRead,
    classifyEmails,
    storedImportantEmails,
  }
}
