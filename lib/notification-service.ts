// lib/notification-service.ts - Fixed version with proper high-priority email testing
import type { EmailSummary } from "@/lib/gmail-api"
import { EmailStorage } from "@/lib/email-storage"

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
      
      // Send WhatsApp message via Twilio
      const response = await fetch('/api/send-twilio-whatsapp', {
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
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('[WhatsApp] Twilio API error:', errorData)
        
        // Try SMS fallback if WhatsApp fails
        console.log('[WhatsApp] WhatsApp failed, trying SMS fallback...')
        const smsResponse = await fetch('/api/send-twilio-sms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: this.preferences.whatsappNumber.replace('whatsapp:', ''), // Remove whatsapp: prefix for SMS
            message: `📧 MailSense Alert (SMS Fallback)\n\n${whatsappMessage}`,
          }),
        })

        if (!smsResponse.ok) {
          throw new Error(`Both WhatsApp and SMS failed: ${errorData.error}`)
        }

        const smsResult = await smsResponse.json()
        console.log(`[SMS] Fallback message sent successfully:`, smsResult.id)
        return
      }

      const result = await response.json()
      console.log(`[WhatsApp] Message sent successfully via Twilio:`, result.id || 'No message ID received')
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
    const senderName = this.extractSenderName(email.from)
    const subject = email.subject.toLowerCase()
    const content = email.body || email.snippet
    
    // Smart fallback based on email type and sender
    if (this.isJobAlert(email)) {
      return this.createJobAlertSummary(email)
    } else if (this.isSecurityAlert(email)) {
      return this.createSecurityAlertSummary(email)
    } else if (this.isNewsletterOrPromo(email)) {
      return this.createNewsletterSummary(email)
    } else if (this.isMeetingOrCalendar(email)) {
      return this.createMeetingSummary(email)
    }
    
    // Try to extract clean content
    const cleanContent = this.extractCleanContent(content)
    const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 15)
    
    if (sentences.length >= 2) {
      const firstLine = this.cleanLine(sentences[0])
      const secondLine = this.cleanLine(sentences[1])
      
      if (firstLine.length > 10 && secondLine.length > 10) {
        return `${firstLine}\n${secondLine}`
      }
    }
    
    // Generic fallback based on sender and subject
    return this.createGenericSummary(email)
  }

  private isJobAlert(email: Email): boolean {
    const indicators = ['indeed', 'linkedin jobs', 'job alert', 'career', 'hiring', 'apply to jobs']
    const text = `${email.from} ${email.subject}`.toLowerCase()
    return indicators.some(indicator => text.includes(indicator))
  }

  private isSecurityAlert(email: Email): boolean {
    const indicators = ['security', 'alert', 'suspicious', 'login', 'password', 'verification']
    const text = `${email.from} ${email.subject}`.toLowerCase()
    return indicators.some(indicator => text.includes(indicator))
  }

  private isNewsletterOrPromo(email: Email): boolean {
    const indicators = ['newsletter', 'unsubscribe', 'promotion', 'deal', 'offer', 'sale']
    const text = `${email.from} ${email.subject}`.toLowerCase()
    return indicators.some(indicator => text.includes(indicator))
  }

  private isMeetingOrCalendar(email: Email): boolean {
    const indicators = ['meeting', 'calendar', 'invitation', 'appointment', 'schedule', 'zoom', 'teams']
    const text = `${email.from} ${email.subject}`.toLowerCase()
    return indicators.some(indicator => text.includes(indicator))
  }

  private isAcademicEmail(email: Email): boolean {
    const indicators = ['professor', 'assistant professor', 'institute', 'university', 'college', 'academic', 'edu', 'test mail', 'placement']
    const text = `${email.from} ${email.subject}`.toLowerCase()
    return indicators.some(indicator => text.includes(indicator))
  }

  private createJobAlertSummary(email: Email): string {
    const senderName = this.extractSenderName(email.from)
    
    // Extract job count if possible
    const content = email.body || email.snippet
    const jobCountMatch = content.match(/(\d+)\s+(?:new\s+)?(?:job|position|opening)/i)
    const jobCount = jobCountMatch ? jobCountMatch[1] : 'New'
    
    // Extract location if possible
    const locationMatch = content.match(/(?:in|at)\s+([A-Za-z\s,]+?)(?:\s|,|$)/i)
    const location = locationMatch ? locationMatch[1].trim().split(',')[0] : 'your area'
    
    return `${jobCount} job opportunities available from ${senderName}\nCheck positions in ${location} and apply directly`
  }

  private createSecurityAlertSummary(email: Email): string {
    const senderName = this.extractSenderName(email.from)
    return `Security notification from ${senderName}\nPlease review your account activity and settings`
  }

  private createNewsletterSummary(email: Email): string {
    const senderName = this.extractSenderName(email.from)
    return `Newsletter update from ${senderName}\nCheck latest news and updates in your email`
  }

  private createMeetingSummary(email: Email): string {
    const senderName = this.extractSenderName(email.from)
    return `Meeting or calendar update from ${senderName}\nPlease check for schedule changes or new appointments`
  }

  private createGenericSummary(email: Email): string {
    const senderName = this.extractSenderName(email.from)
    const subject = email.subject.length > 50 ? email.subject.substring(0, 47) + '...' : email.subject
    return `Important email from ${senderName}\nSubject: ${subject}`
  }

  private extractCleanContent(content: string): string {
    return content
      .replace(/\[image:.*?\]/gi, '') // Remove image references
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
      .replace(/utm_[^&\s]+/g, '') // Remove UTM parameters
      .replace(/[?&][a-zA-Z0-9_]+=[\w%.-]+/g, '') // Remove URL parameters
      .replace(/\b[A-Z0-9]{10,}\b/g, '') // Remove long codes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
  }

  private formatWhatsAppMessage(email: Email, aiSummary: string): string {
    const fromName = this.extractSenderName(email.from)
    const fromDomain = this.extractDomain(email.from)
    const timeAgo = this.getTimeAgo(email.date)
    
    // Create a clean, professional summary
    let cleanSummary = this.createProfessionalSummary(email, aiSummary)
    
    // Clean, professional WhatsApp message format (NO EMOJIS)
    return `*MailSense Email Alert*

*From:* ${fromName}${fromDomain ? ` (${fromDomain})` : ''}
*Subject:* ${email.subject}
*Received:* ${timeAgo}

*Summary:*
${cleanSummary}

Powered by MailSense AI`
  }

  private createProfessionalSummary(email: Email, aiSummary: string): string {
    const senderName = this.extractSenderName(email.from)
    const subject = email.subject
    
    // Always use clean, predictable summaries instead of messy AI content
    // Determine email type and create appropriate professional summary
    
    if (this.isJobAlert(email)) {
      return `New job opportunities available from ${senderName}.\nCheck the latest positions and apply directly.`
    }
    
    if (this.isSecurityAlert(email)) {
      return `Security notification from ${senderName}.\nPlease review your account activity immediately.`
    }
    
    if (this.isMeetingOrCalendar(email)) {
      return `Meeting or calendar update from ${senderName}.\nCheck for schedule changes or new appointments.`
    }
    
    if (this.isNewsletterOrPromo(email)) {
      return `Newsletter update from ${senderName}.\nNew content and updates are available.`
    }
    
    // Check if it's an academic/educational email
    if (this.isAcademicEmail(email)) {
      return `Academic communication from ${senderName}.\nPlease check your email for important details.`
    }
    
    // Generic professional summary - always clean and readable
    const shortSubject = subject.length > 50 ? subject.substring(0, 47) + '...' : subject
    return `New message from ${senderName}.\nRegarding: ${shortSubject}`
  }

  private cleanAISummary(summary: string): string {
    if (!summary || typeof summary !== 'string') {
      return null
    }
    
    // Clean up the AI summary
    let cleaned = summary
      .replace(/\[image:.*?\]/gi, '') // Remove [image: ...] references
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
      .replace(/utm_[^&\s]+/g, '') // Remove UTM parameters
      .replace(/[?&][a-zA-Z0-9_]+=[\w%.-]+/g, '') // Remove URL parameters
      .replace(/\b[A-Z0-9]{10,}\b/g, '') // Remove long codes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/^\W+|\W+$/g, '') // Remove leading/trailing non-word chars
      .trim()
    
    // If too short or messy, return null
    if (cleaned.length < 20 || this.isMessyContent(cleaned)) {
      return null
    }
    
    // Create clean, readable summary (max 2 lines, 120 chars total)
    const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 10)
    
    if (sentences.length >= 2) {
      const line1 = this.cleanLine(sentences[0])
      const line2 = this.cleanLine(sentences[1])
      
      if (line1.length > 15 && line2.length > 15) {
        return `${line1}.\n${line2}.`
      }
    }
    
    // Single sentence - split intelligently
    if (cleaned.length > 60) {
      const words = cleaned.split(' ')
      const midPoint = Math.ceil(words.length / 2)
      const line1 = words.slice(0, midPoint).join(' ')
      const line2 = words.slice(midPoint).join(' ')
      
      if (line1.length > 15 && line2.length > 15) {
        return `${line1.trim()}.\n${line2.trim()}.`
      }
    }
    
    // Return single line if it's good quality
    if (cleaned.length >= 20 && cleaned.length <= 80) {
      return cleaned + '.'
    }
    
    return null
  }

  private isMessyContent(content: string): boolean {
    // Check if content contains too many technical artifacts
    const messyPatterns = [
      /[?&=]{3,}/, // Multiple URL parameter characters
      /\b[A-Z0-9]{8,}\b.*\b[A-Z0-9]{8,}\b/, // Multiple long codes
      /utm_|tmtk=|alid=/, // Tracking parameters
      /\b\w+%\d+/, // URL encoded content
      /(?:%[0-9A-F]{2}){3,}/, // Multiple URL encoded sequences (fixed regex)
    ]
    
    return messyPatterns.some(pattern => pattern.test(content))
  }

  private cleanLine(line: string): string {
    return line
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/^\W+|\W+$/g, '') // Remove leading/trailing punctuation
      .substring(0, 60) // Max 60 chars per line for WhatsApp readability
      .trim()
  }

  private extractSenderName(from: string): string {
    // Extract clean sender name
    const nameMatch = from.match(/^(.+?)\s*</) || from.match(/^([^@]+)/)
    if (nameMatch) {
      return nameMatch[1].replace(/"/g, '').trim()
    }
    return from.split('@')[0] || 'Unknown Sender'
  }

  private extractDomain(from: string): string {
    // Extract domain for context
    const emailMatch = from.match(/<(.+)>/) || from.match(/(.+@.+)/)
    if (emailMatch) {
      const email = emailMatch[1] || emailMatch[0]
      const domain = email.split('@')[1]
      if (domain) {
        // Clean up common domains
        if (domain.includes('gmail.com')) return 'Gmail'
        if (domain.includes('outlook.com') || domain.includes('hotmail.com')) return 'Outlook'
        if (domain.includes('yahoo.com')) return 'Yahoo'
        return domain.split('.')[0]
      }
    }
    return ''
  }

  private getTimeAgo(date: Date | string): string {
    const now = new Date()
    const emailDate = typeof date === 'string' ? new Date(date) : date
    
    // Handle invalid dates
    if (isNaN(emailDate.getTime())) {
      return 'Recently'
    }
    
    const diffInMinutes = Math.floor((now.getTime() - emailDate.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return emailDate.toLocaleDateString()
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
      
      // Normalize emails to ensure dates are Date objects
      const normalizedEmails = emails.map(email => ({
        ...email,
        date: typeof email.date === 'string' ? new Date(email.date) : email.date
      }))
      
      // Filter for high-priority emails ONLY
      const highPriorityEmails = normalizedEmails.filter(email => {
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
      const message = `*MailSense Email Alert*
Multiple High Priority Emails

*${emails.length} Important Emails Received*

${emails.slice(0, 5).map((email, index) => {
  const fromName = this.extractSenderName(email.from)
  const fromDomain = this.extractDomain(email.from)
  const timeAgo = this.getTimeAgo(email.date)
  return `${index + 1}. *${fromName}*${fromDomain ? ` (${fromDomain})` : ''}
   Subject: ${email.subject.substring(0, 45)}${email.subject.length > 45 ? '...' : ''}
   Received: ${timeAgo}`
}).join('\n\n')}

${emails.length > 5 ? `\n...and ${emails.length - 5} more important emails` : ''}

All emails classified as HIGH priority by MailSense AI.
Check your Gmail or MailSense dashboard for details.`
      
      console.log(`[WhatsApp] Sending bulk notification for ${emails.length} emails`)
      
      // Send bulk WhatsApp message via Twilio
      const response = await fetch('/api/send-twilio-whatsapp', {
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
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('[WhatsApp] Twilio bulk API error:', errorData)
        
        // Try SMS fallback for bulk notifications
        console.log('[WhatsApp] Bulk WhatsApp failed, trying SMS fallback...')
        const smsResponse = await fetch('/api/send-twilio-sms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: this.preferences.whatsappNumber.replace('whatsapp:', ''),
            message: `📧 MailSense Bulk Alert (SMS Fallback)\n\n${message}`,
          }),
        })

        if (!smsResponse.ok) {
          throw new Error(`Both bulk WhatsApp and SMS failed: ${errorData.error}`)
        }

        const smsResult = await smsResponse.json()
        console.log(`[SMS] Bulk fallback message sent successfully:`, smsResult.id)
        return
      }

      const result = await response.json()
      const provider = result.provider || 'twilio'
      console.log(`[WhatsApp] Bulk message sent successfully via ${provider}:`, result.id)
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
      
      // Normalize the email date to ensure it's a Date object
      const normalizedEmail = {
        ...email,
        date: typeof email.date === 'string' ? new Date(email.date) : email.date
      }
      
      // Verify it's actually high priority
      if (normalizedEmail.priority !== "high" && !normalizedEmail.isImportant) {
        throw new Error('Selected email is not high priority. Please select a high-priority email for testing.')
      }
      
      // Force notification even if already processed
      this.processedEmails.delete(normalizedEmail.id)
      await this.showNotification(normalizedEmail)
      this.processedEmails.add(normalizedEmail.id)
      this.saveProcessedEmails()
    } catch (error) {
      console.error('Failed to trigger notification for email:', error)
      throw error
    }
  }
}

export const notificationService = new NotificationService()