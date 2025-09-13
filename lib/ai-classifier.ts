// AI-powered email classification system
import type { EmailSummary } from "./gmail-api"

export interface ClassificationResult {
  priority: "high" | "medium" | "low"
  reason: string
  keywords: string[]
  confidence: number
}

export class EmailClassifier {
  // Gmail's native label IDs for categories
  private readonly GMAIL_LABELS = {
    IMPORTANT: 'IMPORTANT',
    CATEGORY_PROMOTIONS: 'CATEGORY_PROMOTIONS',
    CATEGORY_SOCIAL: 'CATEGORY_SOCIAL',
    CATEGORY_UPDATES: 'CATEGORY_UPDATES',
    CATEGORY_FORUMS: 'CATEGORY_FORUMS',
    CATEGORY_PRIMARY: 'CATEGORY_PRIMARY',
    SPAM: 'SPAM',
    TRASH: 'TRASH'
  }

  // Fallback keywords for medium priority (when not in Gmail's important but still significant)
  private mediumPriorityKeywords = [
    "urgent",
    "asap",
    "emergency",
    "critical",
    "important",
    "deadline",
    "interview",
    "final round",
    "hr",
    "human resources",
    "contract",
    "payment",
    "invoice",
    "legal",
    "security",
    "alert",
    "warning",
    "action required",
    "time sensitive",
    "medical",
    "doctor",
    "appointment",
    "bank",
    "account",
    "verification",
    "confirm",
    "expire",
    "suspended",
    "meeting",
    "call",
    "conference",
    "client",
    "customer",
    "project",
    "proposal",
    "review",
    "approval",
    "decision"
  ]

  private lowPriorityKeywords = [
    "newsletter",
    "unsubscribe",
    "promotion",
    "marketing",
    "advertisement",
    "sale",
    "offer",
    "deal",
    "discount",
    "spam",
    "no-reply",
    "automated",
    "linkedin",
    "facebook",
    "twitter",
    "instagram",
    "social",
    "invitation to connect",
    "wants to connect",
    "viewed your profile",
    "job alert",
    "recommended for you",
    "trending",
    "weekly digest",
    "daily digest",
    "notification",
  ]

  private importantSenders = [
    "ceo",
    "manager",
    "director",
    "hr",
    "admin",
    "support",
    "team",
    "client",
    "customer",
    "partner",
    "vendor",
    "interview",
    "recruiter",
    "hiring",
    "bank",
    "payment",
    "billing",
    "security",
    "noreply@google",
    "noreply@microsoft",
    "noreply@apple",
  ]

  private domainImportanceMap = new Map([
    // High importance domains (like Gmail's important)
    ["gmail.com", 1],
    ["company.com", 3],
    ["work.com", 3],
    ["enterprise.com", 3],
    ["bank", 4],
    ["gov", 4],
    ["edu", 2],
    // Medium importance (Primary but not important)
    ["github.com", 1],
    ["stackoverflow.com", 1],
    ["paypal.com", 2],
    ["stripe.com", 2],
    // Low importance (Social/Promotional)
    ["linkedin.com", -2],
    ["facebook.com", -3],
    ["twitter.com", -3],
    ["instagram.com", -3],
    ["noreply", -2],
    ["no-reply", -2],
    ["marketing", -3],
    ["newsletter", -3],
    ["promo", -3],
    ["deals", -3],
  ])

  private timeBasedUrgencyKeywords = [
    "today",
    "tomorrow",
    "this week",
    "end of day",
    "eod",
    "asap",
    "immediately",
    "now",
    "quickly",
    "soon",
    "expires",
    "deadline",
    "due date",
  ]

  private businessKeywords = [
    "meeting",
    "call",
    "conference",
    "presentation",
    "project",
    "client",
    "customer",
    "proposal",
    "contract",
    "agreement",
    "invoice",
    "payment",
    "budget",
    "report",
    "review",
    "feedback",
    "approval",
    "decision",
    "interview",
    "job",
    "position",
    "offer",
    "salary",
    "benefits",
  ]

  private personalKeywords = [
    "family",
    "friend",
    "personal",
    "birthday",
    "anniversary",
    "vacation",
    "holiday",
    "weekend",
    "dinner",
    "lunch",
    "party",
    "event",
  ]

  private socialPatterns = [
    "wants to connect",
    "invitation to connect",
    "viewed your profile",
    "endorsed you",
    "shared a post",
    "commented on",
    "liked your",
    "tagged you",
    "mentioned you",
    "friend request",
    "follow request",
  ]

  private promotionalPatterns = [
    "% off",
    "discount",
    "sale",
    "deal",
    "offer",
    "coupon",
    "promo",
    "free shipping",
    "limited time",
    "act now",
    "don't miss",
    "exclusive",
    "special offer",
    "save money",
    "best price",
  ]

  classifyEmail(email: EmailSummary): ClassificationResult {
    const content = `${email.subject} ${email.snippet}`.toLowerCase()
    const fromLower = email.from.toLowerCase()
    const labels = email.labels || []
    const foundKeywords: string[] = []
    let reason = ""
    let confidence = 0.9 // High confidence since we're using Gmail's native classification

    // PRIMARY CLASSIFICATION: Use Gmail's native importance and categories
    
    // HIGH PRIORITY: Gmail's Important marker (this is Gmail's AI-powered importance detection)
    if (email.isImportant || labels.includes(this.GMAIL_LABELS.IMPORTANT)) {
      foundKeywords.push("Gmail Important")
      return {
        priority: "high",
        reason: "Gmail Important: Marked as important by Gmail's AI",
        keywords: foundKeywords,
        confidence: 0.95
      }
    }

    // LOW PRIORITY: Promotions, Social, and Spam categories
    if (labels.includes(this.GMAIL_LABELS.CATEGORY_PROMOTIONS)) {
      foundKeywords.push("Gmail Promotions")
      return {
        priority: "low",
        reason: "Promotions: Gmail categorized as promotional content",
        keywords: foundKeywords,
        confidence: 0.9
      }
    }

    if (labels.includes(this.GMAIL_LABELS.CATEGORY_SOCIAL)) {
      foundKeywords.push("Gmail Social")
      return {
        priority: "low",
        reason: "Social: Gmail categorized as social network content",
        keywords: foundKeywords,
        confidence: 0.9
      }
    }

    if (labels.includes(this.GMAIL_LABELS.SPAM) || labels.includes(this.GMAIL_LABELS.TRASH)) {
      foundKeywords.push("Gmail Spam/Trash")
      return {
        priority: "low",
        reason: "Spam: Gmail marked as spam or trash",
        keywords: foundKeywords,
        confidence: 0.95
      }
    }

    // MEDIUM PRIORITY: Primary category emails that aren't marked important
    // This includes most legitimate emails that aren't promotional/social
    if (labels.includes(this.GMAIL_LABELS.CATEGORY_PRIMARY) || 
        labels.includes(this.GMAIL_LABELS.CATEGORY_UPDATES) ||
        labels.includes(this.GMAIL_LABELS.CATEGORY_FORUMS)) {
      
      // Check for medium-priority keywords to potentially elevate importance
      let keywordScore = 0
      for (const keyword of this.mediumPriorityKeywords) {
        if (content.includes(keyword)) {
          keywordScore += 1
          foundKeywords.push(`keyword: ${keyword}`)
        }
      }

      // If email has urgent keywords but isn't marked important by Gmail, 
      // it's still medium priority (not high, since Gmail's AI didn't flag it)
      if (keywordScore >= 2) {
        foundKeywords.push("Gmail Primary + Keywords")
        return {
          priority: "medium",
          reason: "Primary with Keywords: Important keywords detected in primary email",
          keywords: foundKeywords,
          confidence: 0.8
        }
      }

      // Standard primary email
      if (labels.includes(this.GMAIL_LABELS.CATEGORY_PRIMARY)) {
        foundKeywords.push("Gmail Primary")
        return {
          priority: "medium",
          reason: "Primary: Gmail categorized as primary inbox email",
          keywords: foundKeywords,
          confidence: 0.85
        }
      }

      // Updates and Forums are typically medium priority
      if (labels.includes(this.GMAIL_LABELS.CATEGORY_UPDATES)) {
        foundKeywords.push("Gmail Updates")
        return {
          priority: "medium",
          reason: "Updates: Gmail categorized as updates/notifications",
          keywords: foundKeywords,
          confidence: 0.8
        }
      }

      if (labels.includes(this.GMAIL_LABELS.CATEGORY_FORUMS)) {
        foundKeywords.push("Gmail Forums")
        return {
          priority: "medium",
          reason: "Forums: Gmail categorized as forum/discussion content",
          keywords: foundKeywords,
          confidence: 0.75
        }
      }
    }

    // FALLBACK CLASSIFICATION: For emails without clear Gmail categories
    // This handles cases where Gmail hasn't categorized the email
    
    let fallbackScore = 0
    confidence = 0.6 // Lower confidence for fallback classification

    // Check for urgent keywords
    for (const keyword of this.mediumPriorityKeywords) {
      if (content.includes(keyword)) {
        fallbackScore += 1
        foundKeywords.push(`fallback-keyword: ${keyword}`)
      }
    }

    // Check for promotional patterns
    for (const pattern of this.promotionalPatterns) {
      if (content.includes(pattern)) {
        fallbackScore -= 2
        foundKeywords.push(`promotional: ${pattern}`)
      }
    }

    // Check for social patterns
    for (const pattern of this.socialPatterns) {
      if (content.includes(pattern)) {
        fallbackScore -= 2
        foundKeywords.push(`social: ${pattern}`)
      }
    }

    // Domain-based scoring for uncategorized emails
    const emailDomain = fromLower.split("@")[1] || ""
    for (const [domain, weight] of this.domainImportanceMap) {
      if (emailDomain.includes(domain) || fromLower.includes(domain)) {
        fallbackScore += weight
        foundKeywords.push(`domain: ${domain}`)
        break
      }
    }

    // Time-based urgency for uncategorized emails
    const hoursOld = (Date.now() - email.date.getTime()) / (1000 * 60 * 60)
    if (hoursOld < 1) {
      fallbackScore += 1
      foundKeywords.push("very recent")
    }

    // Determine priority based on fallback scoring
    if (fallbackScore >= 3) {
      return {
        priority: "medium",
        reason: "Fallback Medium: Multiple importance indicators detected",
        keywords: foundKeywords,
        confidence: 0.7
      }
    } else if (fallbackScore <= -2) {
      return {
        priority: "low",
        reason: "Fallback Low: Promotional or social patterns detected",
        keywords: foundKeywords,
        confidence: 0.75
      }
    } else {
      return {
        priority: "medium",
        reason: "Fallback Medium: Standard email without clear categorization",
        keywords: foundKeywords,
        confidence: 0.6
      }
    }
  }

  getHighPriorityEmails(emails: EmailSummary[]): EmailSummary[] {
    return emails
      .map((email) => ({
        ...email,
        ...this.classifyEmail(email),
      }))
      .filter((email) => email.priority === "high")
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  getEmailsByPriority(emails: EmailSummary[]): { high: EmailSummary[]; medium: EmailSummary[]; low: EmailSummary[] } {
    const classified = emails.map((email) => ({
      ...email,
      ...this.classifyEmail(email),
    }))

    return {
      high: classified.filter((email) => email.priority === "high").sort((a, b) => b.date.getTime() - a.date.getTime()),
      medium: classified
        .filter((email) => email.priority === "medium")
        .sort((a, b) => b.date.getTime() - a.date.getTime()),
      low: classified.filter((email) => email.priority === "low").sort((a, b) => b.date.getTime() - a.date.getTime()),
    }
  }

  getClassificationStats(emails: EmailSummary[]): {
    total: number
    high: number
    medium: number
    low: number
    averageConfidence: number
    topKeywords: string[]
  } {
    const classifications = emails.map((email) => this.classifyEmail(email))

    const stats = {
      total: emails.length,
      high: classifications.filter((c) => c.priority === "high").length,
      medium: classifications.filter((c) => c.priority === "medium").length,
      low: classifications.filter((c) => c.priority === "low").length,
      averageConfidence: classifications.reduce((sum, c) => sum + c.confidence, 0) / classifications.length,
      topKeywords: this.getTopKeywords(classifications),
    }

    return stats
  }

  private getTopKeywords(classifications: ClassificationResult[]): string[] {
    const keywordCount = new Map<string, number>()

    classifications.forEach((classification) => {
      classification.keywords.forEach((keyword) => {
        keywordCount.set(keyword, (keywordCount.get(keyword) || 0) + 1)
      })
    })

    return Array.from(keywordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword]) => keyword)
  }

  improvePrediction(email: EmailSummary, actualPriority: "high" | "medium" | "low"): void {
    const predicted = this.classifyEmail(email)

    if (predicted.priority !== actualPriority) {
      console.log(`Classification mismatch: predicted ${predicted.priority}, actual ${actualPriority}`)
    }
  }
}
