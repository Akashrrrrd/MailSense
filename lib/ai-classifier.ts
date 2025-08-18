// AI-powered email classification system
import type { EmailSummary } from "./gmail-api"

export interface ClassificationResult {
  priority: "high" | "medium" | "low"
  reason: string
  keywords: string[]
  confidence: number
}

export class EmailClassifier {
  private highPriorityKeywords = [
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
    let score = 0
    const foundKeywords: string[] = []
    let reason = ""
    let confidence = 0.5

    for (const pattern of this.socialPatterns) {
      if (content.includes(pattern)) {
        score -= 4
        foundKeywords.push(`social: ${pattern}`)
        confidence += 0.1
        reason = "Social network notification"
      }
    }

    for (const pattern of this.promotionalPatterns) {
      if (content.includes(pattern)) {
        score -= 3
        foundKeywords.push(`promotional: ${pattern}`)
        confidence += 0.1
        reason = "Promotional content"
      }
    }

    // Time-based urgency analysis (high priority)
    for (const keyword of this.timeBasedUrgencyKeywords) {
      if (content.includes(keyword)) {
        score += 4
        foundKeywords.push(`time-sensitive: ${keyword}`)
        confidence += 0.1
      }
    }

    // High priority keywords (Gmail's important patterns)
    for (const keyword of this.highPriorityKeywords) {
      if (content.includes(keyword)) {
        const weight = keyword === "urgent" || keyword === "emergency" || keyword === "interview" ? 5 : 3
        score += weight
        foundKeywords.push(keyword)
        confidence += 0.05
      }
    }

    // Business context analysis (medium to high priority)
    let businessScore = 0
    for (const keyword of this.businessKeywords) {
      if (content.includes(keyword)) {
        businessScore += 2
        foundKeywords.push(`business: ${keyword}`)
      }
    }
    score += Math.min(businessScore, 6)

    // Personal context (usually medium priority unless urgent)
    let personalScore = 0
    for (const keyword of this.personalKeywords) {
      if (content.includes(keyword)) {
        personalScore += 1
        foundKeywords.push(`personal: ${keyword}`)
      }
    }
    score += Math.min(personalScore, 3)

    // Domain-based scoring (Gmail-style)
    const emailDomain = fromLower.split("@")[1] || ""
    for (const [domain, weight] of this.domainImportanceMap) {
      if (emailDomain.includes(domain) || fromLower.includes(domain)) {
        score += weight
        foundKeywords.push(`domain: ${domain}`)
        confidence += weight > 0 ? 0.1 : -0.1
        break
      }
    }

    // Low priority keywords (negative scoring)
    for (const keyword of this.lowPriorityKeywords) {
      if (content.includes(keyword)) {
        score -= 3
        foundKeywords.push(`low-priority: ${keyword}`)
        confidence += 0.05
      }
    }

    // Sender importance analysis
    for (const sender of this.importantSenders) {
      if (fromLower.includes(sender)) {
        score += 3
        foundKeywords.push(`important sender: ${sender}`)
        confidence += 0.1
      }
    }

    // Subject line analysis
    if (email.subject.includes("RE:") || email.subject.includes("FW:")) {
      score += 2
      foundKeywords.push("ongoing conversation")
    }

    if (email.subject.toUpperCase() === email.subject && email.subject.length > 10) {
      score += 3
      foundKeywords.push("all caps subject")
      confidence += 0.1
    }

    // Length analysis
    const contentLength = content.length
    if (contentLength < 50) {
      score += 1
      foundKeywords.push("brief message")
    } else if (contentLength > 1000) {
      score += 2
      foundKeywords.push("detailed message")
    }

    // Time-based scoring
    const hoursOld = (Date.now() - email.date.getTime()) / (1000 * 60 * 60)
    if (hoursOld < 1) {
      score += 2
      foundKeywords.push("very recent")
    } else if (hoursOld < 4) {
      score += 1
      foundKeywords.push("recent")
    } else if (hoursOld > 72) {
      score -= 1
    }

    let priority: "high" | "medium" | "low"

    if (score >= 8) {
      priority = "high"
      confidence = Math.min(0.95, 0.7 + (score - 8) * 0.05)
      reason = "Gmail-style important: Multiple high-priority indicators"
    } else if (score >= 4) {
      priority = "high"
      confidence = Math.min(0.85, 0.6 + (score - 4) * 0.05)
      reason = "Gmail-style important: Contains urgent keywords or important sender"
    } else if (score <= -4) {
      priority = "low"
      confidence = Math.min(0.9, 0.6 + Math.abs(score + 4) * 0.05)
      reason = "Social/Promotional: LinkedIn invitations, promotions, or automated content"
    } else if (score <= -1) {
      priority = "low"
      confidence = Math.min(0.8, 0.5 + Math.abs(score + 1) * 0.1)
      reason = "Social/Promotional: Low priority indicators detected"
    } else {
      priority = "medium"
      confidence = Math.max(0.4, Math.min(0.7, 0.5 + Math.abs(score) * 0.05))
      reason = "Primary: Standard email in primary inbox but not marked important"
    }

    return {
      priority,
      reason,
      keywords: foundKeywords,
      confidence: Math.max(0.1, Math.min(0.99, confidence)),
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
