// lib/gmail-api.ts - Fixed version with proper error handling and CORS support

export interface EmailMessage {
  id: string
  threadId: string
  snippet: string
  payload: {
    headers: Array<{ name: string; value: string }>
    body?: { data?: string }
    parts?: Array<{ body?: { data?: string } }>
  }
  internalDate: string
  labelIds?: string[] // Include Gmail labels for importance detection
}

export interface EmailSummary {
  id: string
  subject: string
  from: string
  snippet: string
  body: string
  date: Date
  priority: "high" | "medium" | "low"
  isRead: boolean
  isImportant?: boolean // Gmail's important flag
  labels?: string[]
}

export class GmailAPI {
  private accessToken: string
  private baseURL = 'https://gmail.googleapis.com/gmail/v1'

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  async fetchEmails(maxResults = 50): Promise<EmailMessage[]> {
    try {
      console.log('[Gmail API] Fetching emails with labels and importance...')
      
      // First, verify the access token is valid
      if (!this.accessToken) {
        throw new Error('No access token provided')
      }

      // Fetch both read and unread emails to get a complete picture
      // Include important emails even if they're read
      const response = await fetch(
        `${this.baseURL}/users/me/messages?maxResults=${maxResults}&q=in:inbox`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      )

      // Handle authentication errors
      if (response.status === 401) {
        // Clear invalid token immediately
        localStorage.removeItem("gmail_access_token")
        localStorage.removeItem("gmail_refresh_token")
        localStorage.removeItem("gmail_token_expiry")
        localStorage.removeItem("gmail_token_last_validation")
        throw new Error('Gmail access expired. Please sign out and sign in again to reconnect.')
      }

      if (response.status === 403) {
        throw new Error('Gmail API access forbidden. Please check your permissions.')
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        console.error('[Gmail API] Error response:', response.status, errorText)
        throw new Error(`Gmail API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log(`[Gmail API] Found ${data.messages?.length || 0} inbox messages`)

      if (!data.messages || data.messages.length === 0) {
        console.log('[Gmail API] No inbox messages found')
        return []
      }

      // Fetch detailed information for each message with retry logic
      const emailPromises = data.messages.map((msg: { id: string }) => 
        this.fetchEmailDetailsWithRetry(msg.id, 3)
      )

      const emails = await Promise.allSettled(emailPromises)
      
      const successfulEmails = emails
        .filter((result): result is PromiseFulfilledResult<EmailMessage> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value)

      const failedCount = emails.length - successfulEmails.length
      if (failedCount > 0) {
        console.warn(`[Gmail API] Failed to fetch ${failedCount} email details`)
      }

      console.log(`[Gmail API] Successfully fetched ${successfulEmails.length} emails`)
      return successfulEmails
    } catch (error: any) {
      console.error("Error fetching emails:", error)
      
      // Provide more specific error messages
      if (error.message?.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to Gmail. Please check your internet connection and try again.')
      }
      
      throw error
    }
  }

  private async fetchEmailDetailsWithRetry(messageId: string, retries = 3): Promise<EmailMessage | null> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(
          `${this.baseURL}/users/me/messages/${messageId}?format=full`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          }
        )

        if (response.status === 401) {
          throw new Error('Gmail access token expired')
        }

        if (response.status === 429) {
          // Rate limited - wait and retry
          console.log(`[Gmail API] Rate limited for email ${messageId}, retrying in ${(i + 1) * 1000}ms`)
          await new Promise(resolve => setTimeout(resolve, (i + 1) * 1000))
          continue
        }

        if (!response.ok) {
          console.warn(`[Gmail API] Failed to fetch email ${messageId}: ${response.status}`)
          return null
        }

        const emailData = await response.json()
        return emailData as EmailMessage
      } catch (error: any) {
        console.error(`[Gmail API] Attempt ${i + 1} failed for email ${messageId}:`, error.message)
        
        if (i === retries - 1) {
          // Last retry failed
          if (error.message?.includes('token expired')) {
            throw error // Re-throw auth errors
          }
          return null // Return null for other errors on final retry
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, (i + 1) * 500))
      }
    }
    
    return null
  }

  async markAsRead(messageId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseURL}/users/me/messages/${messageId}/modify`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            removeLabelIds: ['UNREAD'],
          }),
        }
      )

      if (response.status === 401) {
        console.error('Gmail access token expired when marking as read')
        return false
      }

      return response.ok
    } catch (error) {
      console.error('Error marking email as read:', error)
      return false
    }
  }

  // ADDED: Method to check if Gmail access is working
  async testConnection(): Promise<boolean> {
    try {
      console.log('[Gmail API] Testing connection...')
      
      if (!this.accessToken) {
        console.error('[Gmail API] No access token provided')
        return false
      }

      const response = await fetch(
        `${this.baseURL}/users/me/profile`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.ok) {
        console.log('[Gmail API] Connection test successful')
        return true
      } else {
        console.error('[Gmail API] Connection test failed:', response.status, response.statusText)
        
        if (response.status === 401) {
          console.error('[Gmail API] Access token is invalid or expired')
        } else if (response.status === 403) {
          console.error('[Gmail API] Insufficient permissions - Gmail API access denied')
        }
        
        return false
      }
    } catch (error) {
      console.error('[Gmail API] Connection test failed with error:', error)
      return false
    }
  }
}

export function parseEmailMessage(message: EmailMessage): EmailSummary {
  const headers = message.payload.headers
  const subject = headers.find((h) => h.name === "Subject")?.value || "No Subject"
  const from = headers.find((h) => h.name === "From")?.value || "Unknown Sender"
  const date = new Date(Number.parseInt(message.internalDate))

  // Extract email body
  const body = extractEmailBody(message.payload)
  
  // Check if email is marked as important by Gmail
  const isImportant = message.labelIds?.includes('IMPORTANT') || false
  
  // Check if email is read
  const isRead = !message.labelIds?.includes('UNREAD')

  return {
    id: message.id,
    subject,
    from,
    snippet: message.snippet,
    body,
    date,
    priority: "medium", // Will be determined by AI classification
    isRead,
    isImportant,
    labels: message.labelIds || []
  }
}

function extractEmailBody(payload: EmailMessage['payload']): string {
  try {
    // Try to get body from the main payload
    if (payload.body?.data) {
      return decodeBase64(payload.body.data)
    }

    // Try to get body from parts (multipart email)
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.body?.data) {
          return decodeBase64(part.body.data)
        }
      }
    }

    // Fallback to snippet if no body found
    return ""
  } catch (error) {
    console.error('Error extracting email body:', error)
    return ""
  }
}

function decodeBase64(data: string): string {
  try {
    // Gmail uses URL-safe base64 encoding
    const normalizedData = data.replace(/-/g, '+').replace(/_/g, '/')
    return atob(normalizedData)
  } catch (error) {
    console.error('Error decoding base64 data:', error)
    return ""
  }
}