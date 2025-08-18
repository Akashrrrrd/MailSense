// lib/notification-service.ts - Fixed version with proper high-priority email testing

export interface Email {
  id: string
  subject: string
  from: string
  snippet: string
  body: string
  date: Date
  priority: "low" | "medium" | "high"
  isRead: boolean
  isImportant?: boolean // Gmail's important flag
  labels?: string[]
}

export interface NotificationPreferences {
  enabled: boolean
  desktopEnabled: boolean
  whatsappEnabled: boolean
  whatsappNumber: string
  soundEnabled: boolean
  highPriorityOnly: boolean
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

class NotificationService {
  private preferences: NotificationPreferences
  private processedEmails: Set<string> = new Set()

  constructor() {
    this.preferences = this.loadPreferences()
    this.initializeProcessedEmails()
  }

  private loadPreferences(): NotificationPreferences {
    if (typeof window === 'undefined') {
      return this.getDefaultPreferences()
    }

    try {
      const stored = localStorage.getItem('mailsense-notification-preferences')
      if (stored) {
        return { ...this.getDefaultPreferences(), ...JSON.parse(stored) }
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error)
    }
    
    return this.getDefaultPreferences()
  }

  private getDefaultPreferences(): NotificationPreferences {
    return {
      enabled: false,
      desktopEnabled: true,
      whatsappEnabled: false,
      whatsappNumber: '',
      soundEnabled: true,
      highPriorityOnly: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    }
  }

  private initializeProcessedEmails() {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem('mailsense-processed-emails')
      if (stored) {
        this.processedEmails = new Set(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load processed emails:', error)
    }
  }

  private saveProcessedEmails() {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem('mailsense-processed-emails', JSON.stringify([...this.processedEmails]))
    } catch (error) {
      console.error('Failed to save processed emails:', error)
    }
  }

  private shouldNotify(email: Email): boolean {
    if (this.processedEmails.has(email.id)) {
      return false
    }

    if (!this.preferences.enabled) {
      return false
    }

    if (email.isRead) {
      return false
    }

    if (this.preferences.highPriorityOnly) {
      if (email.priority !== "high" && !email.isImportant) {
        return false
      }
    }

    if (this.preferences.desktopEnabled && this.isInQuietHours()) {
      console.log('In quiet hours - skipping desktop notification')
      return false
    }

    return true
  }

  async processNewEmails(emails: Email[]): Promise<void> {
    console.log(`[Notifications] Processing ${emails.length} emails for notifications`)
    
    for (const email of emails) {
      if (this.shouldNotify(email)) {
        console.log(`[Notifications] Sending notification for email: ${email.id}`)
        await this.showNotification(email)
        this.processedEmails.add(email.id)
      }
    }
    
    this.saveProcessedEmails()
  }

  async showNotification(email: Email): Promise<void> {
    console.log(`[Notifications] Showing notification for: ${email.subject}`)

    const promises: Promise<void>[] = []

    if (this.preferences.desktopEnabled && !this.isInQuietHours()) {
      promises.push(this.showDesktopNotification(email))
    }

    if (this.preferences.whatsappEnabled && this.preferences.whatsappNumber) {
      promises.push(this.sendWhatsAppNotification(email))
    }

    await Promise.allSettled(promises)
  }

  private async showDesktopNotification(email: Email): Promise<void> {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return
    }

    try {
      const notification = new Notification(`New ${email.priority} priority email`, {
        body: `From: ${email.from}\nSubject: ${email.subject}\n\n${email.snippet}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: email.id,
        requireInteraction: email.priority === "high",
        silent: !this.preferences.soundEnabled
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      if (email.priority !== "high") {
        setTimeout(() => notification.close(), 10000)
      }
    } catch (error) {
      console.error('Failed to show desktop notification:', error)
    }
  }

  private async sendWhatsAppNotification(email: Email): Promise<void> {
    try {
      const aiSummary = await this.generateAISummary(email)
      const whatsappMessage = this.formatWhatsAppMessage(email, aiSummary)
      
      console.log(`[WhatsApp] Sending notification for email: ${email.id}`)
      
      const response = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: this.preferences.whatsappNumber,
          message: whatsappMessage
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      console.log(`[WhatsApp] Message sent successfully:`, result.id)
    } catch (error: any) {
      console.error('Failed to send WhatsApp notification:', error)
      throw new Error(`Failed to send WhatsApp notification: ${error.message}`)
    }
  }

  private async generateAISummary(email: Email): Promise<string> {
    try {
      const response = await fetch('/api/ai-summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: email.subject,
          body: email.body,
          from: email.from
        })
      })

      if (!response.ok) {
        console.error('AI summarization failed, using fallback')
        return this.createFallbackSummary(email)
      }

      const data = await response.json()
      return data.summary || this.createFallbackSummary(email)
    } catch (error) {
      console.error('AI summarization error:', error)
      return this.createFallbackSummary(email)
    }
  }

  private createFallbackSummary(email: Email): string {
    const words = email.snippet.split(' ')
    const firstLine = words.slice(0, 8).join(' ')
    const secondLine = words.slice(8, 16).join(' ')
    
    return `${firstLine}${firstLine.length < email.snippet.length ? '...' : ''}\n${secondLine}${words.length > 16 ? '...' : ''}`
  }

  private formatWhatsAppMessage(email: Email, aiSummary: string): string {
    const fromName = email.from.split('<')[0].trim() || email.from
    const priority = email.priority.toUpperCase()
    
    return `*MailSense*
_Business Account_

*From:* ${fromName}
*Sub:* ${email.subject}

*Content:*
${aiSummary}

_Priority: ${priority}_`
  }

  private isInQuietHours(): boolean {
    if (!this.preferences.quietHours.enabled) {
      return false
    }

    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const [startHour, startMin] = this.preferences.quietHours.start.split(':').map(Number)
    const [endHour, endMin] = this.preferences.quietHours.end.split(':').map(Number)
    
    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime
    } else {
      return currentTime >= startTime || currentTime <= endTime
    }
  }

  // FIXED: Enhanced method to get high-priority emails only
  private getHighPriorityTestEmail(): Email | null {
    if (typeof window === 'undefined') return null
    
    try {
      // Try multiple storage keys to find emails
      const storageKeys = ['mailsense-emails', 'mailsense_important_emails', 'gmail-emails']
      let emails: Email[] = []
      
      for (const key of storageKeys) {
        const storedEmails = localStorage.getItem(key)
        if (storedEmails) {
          try {
            const parsedEmails = JSON.parse(storedEmails)
            emails = Array.isArray(parsedEmails) ? parsedEmails : []
            console.log(`[Test] Found ${emails.length} emails in ${key}`)
            break
          } catch (e) {
            console.log(`[Test] Failed to parse emails from ${key}`)
            continue
          }
        }
      }
      
      if (emails.length === 0) {
        console.log('[Test] No emails found in any storage location')
        return null
      }
      
      // Filter for high-priority emails ONLY
      const highPriorityEmails = emails.filter(email => {
        const isHighPriority = email.priority === "high" || email.isImportant === true
        console.log(`[Test] Email "${email.subject}" - Priority: ${email.priority}, Important: ${email.isImportant}, IsHighPriority: ${isHighPriority}`)
        return isHighPriority
      })
      
      console.log(`[Test] Found ${highPriorityEmails.length} high-priority emails out of ${emails.length} total`)
      
      if (highPriorityEmails.length === 0) {
        console.log('[Test] No high-priority emails found')
        return null
      }
      
      // Return the most recent high-priority email
      const selectedEmail = highPriorityEmails[0]
      console.log(`[Test] Selected email: "${selectedEmail.subject}" from ${selectedEmail.from}`)
      return selectedEmail
      
    } catch (error) {
      console.error('Failed to get high-priority test email:', error)
      return null
    }
  }

  // FIXED: Updated test method to ONLY use high-priority emails
  async sendTestNotification(): Promise<void> {
    console.log('[Test] Starting test notification process')
    
    // Try to get a real high-priority email
    const realHighPriorityEmail = this.getHighPriorityTestEmail()
    
    if (realHighPriorityEmail) {
      console.log('[Test] Using real high-priority email:', realHighPriorityEmail.subject)
      await this.showNotification(realHighPriorityEmail)
    } else {
      // THROW ERROR instead of using sample - this forces proper setup
      throw new Error('No high-priority emails found in storage. Please fetch some emails first, then try testing.')
    }
  }

  getPreferences(): NotificationPreferences {
    return { ...this.preferences }
  }

  updatePreferences(updates: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...updates }
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('mailsense-notification-preferences', JSON.stringify(this.preferences))
      } catch (error) {
        console.error('Failed to save notification preferences:', error)
      }
    }
  }

  getPermissionStatus(): NotificationPermission | "unsupported" {
    if (typeof window === 'undefined' || !("Notification" in window)) {
      return "unsupported"
    }
    return Notification.permission
  }

  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !("Notification" in window)) {
      return false
    }

    if (Notification.permission === "granted") {
      return true
    }

    if (Notification.permission === "denied") {
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === "granted"
  }

  clearProcessedEmails(): void {
    this.processedEmails.clear()
    this.saveProcessedEmails()
  }

  // ADDED: Missing showBulkNotification method
  async showBulkNotification(emails: Email[]): Promise<void> {
    console.log(`[Notifications] Showing bulk notification for ${emails.length} high-priority emails`)

    if (emails.length === 0) return

    if (emails.length === 1) {
      await this.showNotification(emails[0])
      return
    }

    // For multiple emails, show a summary notification
    const promises: Promise<void>[] = []

    // Desktop notification for bulk
    if (this.preferences.desktopEnabled && !this.isInQuietHours()) {
      promises.push(this.showBulkDesktopNotification(emails))
    }

    // WhatsApp notification for bulk
    if (this.preferences.whatsappEnabled && this.preferences.whatsappNumber) {
      promises.push(this.sendBulkWhatsAppNotification(emails))
    }

    await Promise.allSettled(promises)
  }

  private async showBulkDesktopNotification(emails: Email[]): Promise<void> {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return
    }

    try {
      const notification = new Notification(`${emails.length} new high-priority emails`, {
        body: `New important emails from:\n${emails.slice(0, 3).map(e => e.from.split('<')[0].trim()).join(', ')}${emails.length > 3 ? '...' : ''}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'bulk-notification-' + Date.now(),
        requireInteraction: true,
        silent: !this.preferences.soundEnabled
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    } catch (error) {
      console.error('Failed to show bulk desktop notification:', error)
    }
  }

  private async sendBulkWhatsAppNotification(emails: Email[]): Promise<void> {
    try {
      const message = `*MailSense*
_Business Account_

*${emails.length} New High-Priority Emails*

${emails.slice(0, 5).map((email, index) => {
  const fromName = email.from.split('<')[0].trim() || email.from
  return `${index + 1}. *${fromName}*\n   ${email.subject.substring(0, 50)}${email.subject.length > 50 ? '...' : ''}`
}).join('\n\n')}

${emails.length > 5 ? `\n_...and ${emails.length - 5} more_` : ''}

_All emails marked as HIGH priority_`
      
      console.log(`[WhatsApp] Sending bulk notification for ${emails.length} emails`)
      
      const response = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: this.preferences.whatsappNumber,
          message: message
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      console.log(`[WhatsApp] Bulk message sent successfully:`, result.id)
    } catch (error: any) {
      console.error('Failed to send bulk WhatsApp notification:', error)
      throw new Error(`Failed to send bulk WhatsApp notification: ${error.message}`)
    }
  }

  // ADDED: Missing processQueuedNotifications method
  async processQueuedNotifications(): Promise<void> {
    try {
      const pendingEmails = EmailStorage.getPendingNotifications()
      
      if (pendingEmails.length === 0) {
        return
      }

      console.log(`[Notifications] Processing ${pendingEmails.length} queued notifications`)
      
      for (const email of pendingEmails) {
        if (this.shouldNotifyStored(email)) {
          await this.showNotification(email)
          EmailStorage.markNotificationSent(email.id)
        }
      }
    } catch (error) {
      console.error('Error processing queued notifications:', error)
    }
  }

  private shouldNotifyStored(email: EmailSummary): boolean {
    if (!this.preferences.enabled) {
      return false
    }

    if (this.preferences.highPriorityOnly) {
      if (email.priority !== "high" && !email.isImportant) {
        return false
      }
    }

    return true
  }

  async triggerNotificationForEmail(emailId: string): Promise<void> {
    if (typeof window === 'undefined') return
    
    try {
      // Try multiple storage locations
      const storageKeys = ['mailsense-emails', 'mailsense_important_emails', 'gmail-emails']
      let email: Email | undefined
      
      for (const key of storageKeys) {
        const storedEmails = localStorage.getItem(key)
        if (storedEmails) {
          try {
            const emails: Email[] = JSON.parse(storedEmails)
            email = emails.find(e => e.id === emailId)
            if (email) {
              console.log(`[Test] Found email in ${key}:`, email.subject)
              break
            }
          } catch (e) {
            continue
          }
        }
      }
      
      if (!email) {
        throw new Error('Email not found in storage')
      }
      
      // Verify it's actually high priority
      if (email.priority !== "high" && !email.isImportant) {
        throw new Error('Selected email is not high priority. Please select a high-priority email for testing.')
      }
      
      // Force notification even if already processed
      this.processedEmails.delete(email.id)
      await this.showNotification(email)
      this.processedEmails.add(email.id)
      this.saveProcessedEmails()
    } catch (error) {
      console.error('Failed to trigger notification for email:', error)
      throw error
    }
  }
}

export const notificationService = new NotificationService()