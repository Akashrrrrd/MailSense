import type { EmailSummary } from "@/lib/gmail-api"

interface StoredEmail extends EmailSummary {
  storedAt: Date
  notificationSent: boolean
  aiSummary?: string
}

export class EmailStorage {
  private static readonly STORAGE_KEY = "mailsense_important_emails"
  private static readonly MAX_STORED_EMAILS = 100

  static getStoredEmails(): StoredEmail[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []

      const emails = JSON.parse(stored)
      return emails.map((email: any) => ({
        ...email,
        date: new Date(email.date),
        storedAt: new Date(email.storedAt),
      }))
    } catch (error) {
      console.error("Error reading stored emails:", error)
      return []
    }
  }

  static storeImportantEmail(email: EmailSummary): void {
    try {
      const storedEmails = this.getStoredEmails()

      // Check if email already exists
      const existingIndex = storedEmails.findIndex((stored) => stored.id === email.id)

      const newStoredEmail: StoredEmail = {
        ...email,
        storedAt: new Date(),
        notificationSent: false,
      }

      if (existingIndex >= 0) {
        // Update existing email
        storedEmails[existingIndex] = newStoredEmail
      } else {
        // Add new email
        storedEmails.unshift(newStoredEmail)
      }

      // Keep only the most recent emails
      const trimmedEmails = storedEmails.slice(0, this.MAX_STORED_EMAILS)

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedEmails))
    } catch (error) {
      console.error("Error storing important email:", error)
    }
  }

  static markNotificationSent(emailId: string): void {
    try {
      const storedEmails = this.getStoredEmails()
      const updatedEmails = storedEmails.map((email) =>
        email.id === emailId ? { ...email, notificationSent: true } : email,
      )

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedEmails))
    } catch (error) {
      console.error("Error marking notification as sent:", error)
    }
  }

  static updateAISummary(emailId: string, aiSummary: string): void {
    try {
      const storedEmails = this.getStoredEmails()
      const updatedEmails = storedEmails.map((email) => (email.id === emailId ? { ...email, aiSummary } : email))

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedEmails))
    } catch (error) {
      console.error("Error updating AI summary:", error)
    }
  }

  static getPendingNotifications(): StoredEmail[] {
    return this.getStoredEmails().filter((email) => !email.notificationSent)
  }

  static clearOldEmails(daysOld = 30): void {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const storedEmails = this.getStoredEmails()
      const recentEmails = storedEmails.filter((email) => email.storedAt > cutoffDate)

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentEmails))
    } catch (error) {
      console.error("Error clearing old emails:", error)
    }
  }
}
