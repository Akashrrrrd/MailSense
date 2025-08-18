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
  connectionStatus: 'idle' | 'testing' | 'connected' | 'failed'
}

export function useGmail(): UseGmailReturn {
  const { user, getAccessToken } = useAuth()
  const [emails, setEmails] = useState<EmailSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)
  const [storedImportantEmails, setStoredImportantEmails] = useState<EmailSummary[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'failed'>('idle')

  const classifier = new EmailClassifier()

  useEffect(() => {
    const stored = EmailStorage.getStoredEmails()
    setStoredImportantEmails(stored)
  }, [])

  // Test Gmail connection on mount
  useEffect(() => {
    if (user && getAccessToken()) {
      testGmailConnection()
    }
  }, [user, getAccessToken])

  const testGmailConnection = async () => {
    const accessToken = getAccessToken()
    if (!accessToken) return

    setConnectionStatus('testing')
    try {
      const gmailAPI = new GmailAPI(accessToken)
      const isConnected = await gmailAPI.testConnection()
      setConnectionStatus(isConnected ? 'connected' : 'failed')
    } catch (error) {
      console.error('Gmail connection test failed:', error)
      setConnectionStatus('failed')
    }
  }

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
      console.log('[useGmail] Starting email fetch...')
      const gmailAPI = new GmailAPI(accessToken)
      
      // Test connection first
      const connectionOk = await gmailAPI.testConnection()
      if (!connectionOk) {
        throw new Error('Gmail connection failed. Please check your authentication.')
      }

      const rawEmails = await gmailAPI.fetchEmails(50)
      console.log(`[useGmail] Fetched ${rawEmails.length} raw emails`)

      if (rawEmails.length === 0) {
        console.log('[useGmail] No unread emails found')
        setEmails([])
        return
      }

      const parsedEmails = rawEmails.map((email) => {
        const summary = parseEmailMessage(email)
        const classification = classifier.classifyEmail(summary)
        return {
          ...summary,
          priority: classification.priority,
        }
      })

      console.log(`[useGmail] Parsed ${parsedEmails.length} emails`)

      // Store important emails
      const importantEmails = parsedEmails.filter((email) => 
        email.priority === "high" || email.isImportant
      )
      
      console.log(`[useGmail] Found ${importantEmails.length} important emails`)
      
      importantEmails.forEach((email) => {
        EmailStorage.storeImportantEmail(email)
      })

      // Update stored emails state
      const updatedStoredEmails = EmailStorage.getStoredEmails()
      setStoredImportantEmails(updatedStoredEmails)

      // Handle new email notifications
      const currentTime = Date.now()
      const newEmails = parsedEmails.filter((email) => email.date.getTime() > lastFetchTime)

      if (newEmails.length > 0) {
        console.log(`[useGmail] Found ${newEmails.length} new emails`)
        const newHighPriorityEmails = newEmails.filter((email) => 
          email.priority === "high" || email.isImportant
        )

        if (newHighPriorityEmails.length > 0) {
          console.log(`[useGmail] Sending notifications for ${newHighPriorityEmails.length} high-priority emails`)
          
          if (newHighPriorityEmails.length === 1) {
            await notificationService.showNotification(newHighPriorityEmails[0])
          } else {
            // Use the fixed showBulkNotification method
            await notificationService.showBulkNotification(newHighPriorityEmails)
          }
        }
      }

      setEmails(parsedEmails)
      setLastFetchTime(currentTime)
      setConnectionStatus('connected')
      
    } catch (err: any) {
      console.error("Error fetching emails:", err)
      
      // Handle specific error types
      let errorMessage = "Failed to fetch emails"
      
      if (err.message?.includes('token expired') || err.message?.includes('401')) {
        errorMessage = "Gmail access expired. Please sign in again."
        setConnectionStatus('failed')
      } else if (err.message?.includes('Network error') || err.message?.includes('Failed to fetch')) {
        errorMessage = "Network error. Please check your internet connection and try again."
      } else if (err.message?.includes('403')) {
        errorMessage = "Gmail access denied. Please check your permissions."
        setConnectionStatus('failed')
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user, getAccessToken, classifier, lastFetchTime])

  const markAsRead = useCallback(
    async (emailId: string): Promise<boolean> => {
      const accessToken = getAccessToken()
      if (!accessToken) {
        console.error('No access token for marking as read')
        return false
      }

      try {
        const gmailAPI = new GmailAPI(accessToken)
        const success = await gmailAPI.markAsRead(emailId)

        if (success) {
          setEmails((prev) => prev.map((email) => (email.id === emailId ? { ...email, isRead: true } : email)))
          console.log(`[useGmail] Marked email ${emailId} as read`)
        }

        return success
      } catch (err: any) {
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

  // Auto-refresh emails periodically
  useEffect(() => {
    if (!user || connectionStatus === 'failed') return

    const interval = setInterval(
      async () => {
        console.log('[useGmail] Auto-refreshing emails...')
        try {
          await notificationService.processQueuedNotifications()
          await fetchEmails()
        } catch (error) {
          console.error('[useGmail] Auto-refresh failed:', error)
        }
      },
      2 * 60 * 1000, // Every 2 minutes
    )

    return () => clearInterval(interval)
  }, [user, fetchEmails, connectionStatus])

  // Cleanup old emails periodically
  useEffect(() => {
    const cleanup = () => {
      EmailStorage.clearOldEmails(30)
    }

    cleanup()
    const cleanupInterval = setInterval(cleanup, 24 * 60 * 60 * 1000)

    return () => clearInterval(cleanupInterval)
  }, [])

  const highPriorityEmails = emails.filter((email) => email.priority === "high" || email.isImportant)
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
    connectionStatus,
  }
}