// Gmail API integration utilities
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
}

export interface EmailSummary {
  id: string
  subject: string
  from: string
  snippet: string
  date: Date
  priority: "high" | "medium" | "low"
  isRead: boolean
}

export class GmailAPI {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  async fetchEmails(maxResults = 50): Promise<EmailMessage[]> {
    try {
      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=is:unread`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Gmail API error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.messages) {
        return []
      }

      // Fetch detailed information for each message
      const emailPromises = data.messages.map((msg: { id: string }) => this.fetchEmailDetails(msg.id))

      const emails = await Promise.all(emailPromises)
      return emails.filter((email) => email !== null) as EmailMessage[]
    } catch (error) {
      console.error("Error fetching emails:", error)
      throw error
    }
  }

  private async fetchEmailDetails(messageId: string): Promise<EmailMessage | null> {
    try {
      const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        return null
      }

      return await response.json()
    } catch (error) {
      console.error(`Error fetching email ${messageId}:`, error)
      return null
    }
  }

  async markAsRead(messageId: string): Promise<boolean> {
    try {
      const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          removeLabelIds: ["UNREAD"],
        }),
      })

      return response.ok
    } catch (error) {
      console.error("Error marking email as read:", error)
      return false
    }
  }
}

export function parseEmailMessage(message: EmailMessage): EmailSummary {
  const headers = message.payload.headers
  const subject = headers.find((h) => h.name === "Subject")?.value || "No Subject"
  const from = headers.find((h) => h.name === "From")?.value || "Unknown Sender"
  const date = new Date(Number.parseInt(message.internalDate))

  return {
    id: message.id,
    subject,
    from,
    snippet: message.snippet,
    date,
    priority: "medium", // Will be determined by AI classification
    isRead: false,
  }
}
