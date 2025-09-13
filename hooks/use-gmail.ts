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

  // Load stored emails on mount
  useEffect(() => {
    const stored = EmailStorage.getStoredEmails()
    setStoredImportantEmails(stored)
  }, [])

  const loadCachedEmails = () => {
    try {
      const cachedEmails = localStorage.getItem('mailsense-emails')
      const lastFetch = localStorage.getItem('mailsense-last-fetch')
      
      if (cachedEmails && lastFetch) {
        const emails = JSON.parse(cachedEmails).map((email: any) => ({
          ...email,
          date: new Date(email.date) // Ensure dates are Date objects
        }))
        
        console.log(`[useGmail] Loaded ${emails.length} cached emails`)
        setEmails(emails)
        setLastFetchTime(parseInt(lastFetch))
        
        // Show cache age to user
        const cacheAge = Math.round((Date.now() - parseInt(lastFetch)) / 1000)
        if (cacheAge < 60) {
          console.log(`[useGmail] Cache is ${cacheAge} seconds old`)
        } else {
          console.log(`[useGmail] Cache is ${Math.round(cacheAge / 60)} minutes old`)
        }
      }
    } catch (error) {
      console.error('[useGmail] Failed to load cached emails:', error)
    }
  }

  const testGmailConnection = async () => {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      setConnectionStatus('failed')
      return
    }

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

    const accessToken = await getAccessToken()
    if (!accessToken) {
      setError("Gmail access expired. Please sign out and sign in again to reconnect.")
      setConnectionStatus('failed')
      
      // Clear cached emails when token is invalid
      localStorage.removeItem('mailsense-emails')
      localStorage.removeItem('mailsense-last-fetch')
      setEmails([])
      
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
        // Clear potentially invalid token
        localStorage.removeItem("gmail_access_token")
        throw new Error('Gmail authentication failed. Please sign out and sign in again to grant Gmail permissions.')
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

      // For first load, don't send notifications for existing emails
      if (lastFetchTime === 0) {
        console.log('[useGmail] First load - not sending notifications for existing emails')
        setEmails(parsedEmails)
        setLastFetchTime(currentTime)
        setConnectionStatus('connected')
        return
      }

      // Process new emails for notifications
      const newEmails = parsedEmails.filter((email) => email.date.getTime() > lastFetchTime)

      if (newEmails.length > 0) {
        console.log(`[useGmail] Found ${newEmails.length} new emails since last fetch`)

        // Convert to notification service format and process
        const emailsForNotification = newEmails.map(email => ({
          ...email,
          body: email.snippet, // Use snippet as body for notifications
        }))

        // Process all new emails through notification service
        await notificationService.processNewEmails(emailsForNotification)
        
        // Show immediate browser notification for high-priority emails
        const highPriorityNewEmails = newEmails.filter(email => 
          email.priority === 'high' || email.isImportant
        )
        
        if (highPriorityNewEmails.length > 0) {
          console.log(`[useGmail] ${highPriorityNewEmails.length} new high-priority emails - showing immediate notification`)
          
          // Show browser notification for immediate feedback
          if ('Notification' in window && Notification.permission === 'granted') {
            if (highPriorityNewEmails.length === 1) {
              const email = highPriorityNewEmails[0]
              new Notification(`📧 New High-Priority Email`, {
                body: `From: ${email.from.split('<')[0].trim()}\n${email.subject}`,
                icon: '/favicon.ico',
                tag: 'mailsense-new-email',
                requireInteraction: true
              })
            } else {
              new Notification(`📧 ${highPriorityNewEmails.length} New High-Priority Emails`, {
                body: `Check MailSense for important emails`,
                icon: '/favicon.ico',
                tag: 'mailsense-bulk-emails',
                requireInteraction: true
              })
            }
          }
        }
      }

      // Store emails in localStorage for persistence between page navigations
      try {
        localStorage.setItem('mailsense-emails', JSON.stringify(parsedEmails))
        localStorage.setItem('mailsense-last-fetch', currentTime.toString())
      } catch (error) {
        console.error('Failed to store emails in localStorage:', error)
      }

      setEmails(parsedEmails)
      setLastFetchTime(currentTime)
      setConnectionStatus('connected')

    } catch (err: any) {
      console.error("Error fetching emails:", err)

      // Handle specific error types
      let errorMessage = "Failed to fetch emails"

      if (err.message?.includes('token expired') || err.message?.includes('401') || err.message?.includes('authentication failed')) {
        errorMessage = "Gmail access expired or invalid. Please sign out and sign in again to reconnect Gmail."
        setConnectionStatus('failed')
        // Clear invalid token
        localStorage.removeItem("gmail_access_token")
      } else if (err.message?.includes('Network error') || err.message?.includes('Failed to fetch')) {
        errorMessage = "Network error. Please check your internet connection and try again."
      } else if (err.message?.includes('403')) {
        errorMessage = "Gmail access denied. Please sign out and sign in again to grant proper permissions."
        setConnectionStatus('failed')
        // Clear invalid token
        localStorage.removeItem("gmail_access_token")
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user, getAccessToken, classifier, lastFetchTime])

  // Load cached emails on mount and only fetch if cache is stale
  useEffect(() => {
    if (user) {
      // Load cached emails immediately for fast UI
      loadCachedEmails()
      
      // Test connection and fetch fresh emails if needed
      const initializeGmail = async () => {
        // First check if we have a valid token
        const accessToken = await getAccessToken()
        if (!accessToken) {
          console.log('[useGmail] No valid access token - user needs to reconnect')
          setError("Gmail access expired. Please sign out and sign in again to reconnect.")
          setConnectionStatus('failed')
          
          // Clear cached emails when token is invalid
          localStorage.removeItem('mailsense-emails')
          localStorage.removeItem('mailsense-last-fetch')
          setEmails([])
          return
        }
        
        await testGmailConnection()
        
        // Only fetch if cache is stale (older than 2 minutes) AND we have a valid token
        const lastFetch = localStorage.getItem('mailsense-last-fetch')
        const cacheAge = lastFetch ? Date.now() - parseInt(lastFetch) : Infinity
        const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes
        
        if (cacheAge > CACHE_DURATION) {
          console.log('[useGmail] Cache is stale, fetching fresh emails...')
          await fetchEmails()
        } else {
          console.log('[useGmail] Using cached emails, cache age:', Math.round(cacheAge / 1000), 'seconds')
          setConnectionStatus('connected') // Mark as connected if using valid cache
        }
      }
      
      initializeGmail()
    }
  }, [user]) // Removed fetchEmails from dependencies to prevent re-fetching

  const markAsRead = useCallback(
    async (emailId: string): Promise<boolean> => {
      const accessToken = await getAccessToken()
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

  // Smart auto-refresh with dynamic frequency based on WhatsApp notifications
  useEffect(() => {
    if (!user || connectionStatus === 'failed') return

    let interval: NodeJS.Timeout

    const startAutoRefresh = () => {
      // Check if WhatsApp notifications are enabled for more frequent checks
      const preferences = notificationService.getPreferences()
      const isWhatsAppEnabled = preferences.whatsappEnabled && preferences.whatsappNumber
      
      // More frequent checks if WhatsApp is enabled (1 minute vs 2 minutes)
      const refreshInterval = isWhatsAppEnabled ? 1 * 60 * 1000 : 2 * 60 * 1000
      
      console.log(`[useGmail] Starting auto-refresh every ${refreshInterval / 1000} seconds (WhatsApp: ${isWhatsAppEnabled ? 'enabled' : 'disabled'})`)
      
      interval = setInterval(
        async () => {
          // Only auto-refresh if document is visible (tab is active)
          if (document.visibilityState === 'visible') {
            console.log('[useGmail] Auto-refreshing emails (tab active)...')
            try {
              await notificationService.processQueuedNotifications()
              await fetchEmails()
            } catch (error) {
              console.error('[useGmail] Auto-refresh failed:', error)
            }
          } else {
            // Even when tab is not active, still check for new emails if WhatsApp is enabled
            if (isWhatsAppEnabled) {
              console.log('[useGmail] Background check for WhatsApp notifications...')
              try {
                await fetchEmails()
              } catch (error) {
                console.error('[useGmail] Background check failed:', error)
              }
            } else {
              console.log('[useGmail] Skipping auto-refresh (tab not active, WhatsApp disabled)')
            }
          }
        },
        refreshInterval
      )
    }

    // Start auto-refresh
    startAutoRefresh()

    // Pause/resume auto-refresh based on tab visibility
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[useGmail] Tab became active - resuming auto-refresh')
        if (!interval) startAutoRefresh()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (interval) clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user, connectionStatus]) // Removed fetchEmails from dependencies

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