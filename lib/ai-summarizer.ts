interface EmailSummary {
  from: string
  subject: string
  summary: string
  priority: "HIGH" | "MEDIUM" | "LOW"
}

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export class AIEmailSummarizer {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || ""
  }

  async summarizeEmail(emailContent: string, from: string, subject: string): Promise<EmailSummary> {
    try {
      if (!this.apiKey) {
        throw new Error("Perplexity API key not configured")
      }

      const prompt = `
        Summarize this email in exactly 2 lines for WhatsApp notification:
        
        From: ${from}
        Subject: ${subject}
        Content: ${emailContent}
        
        Requirements:
        - Maximum 2 lines (each line max 50 characters)
        - Focus on the most important information
        - Use clear, concise language
        - Maintain professional tone
        
        Return only the 2-line summary, nothing else.
      `

      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 100,
          temperature: 0.3,
        }),
      })

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`)
      }

      const data: PerplexityResponse = await response.json()
      const summary = data.choices[0]?.message?.content?.trim() || "Important email received"

      // Clean up the summary to ensure it's exactly 2 lines
      const lines = summary
        .split("\n")
        .filter((line) => line.trim())
        .slice(0, 2)
      const cleanSummary = lines.join("\n")

      return {
        from: this.extractCompanyName(from),
        subject: subject.length > 60 ? subject.substring(0, 57) + "..." : subject,
        summary: cleanSummary,
        priority: "HIGH", // Since we only process important emails
      }
    } catch (error) {
      console.error("AI summarization error:", error)

      // Fallback to basic summarization if AI fails
      return {
        from: this.extractCompanyName(from),
        subject: subject.length > 60 ? subject.substring(0, 57) + "..." : subject,
        summary: this.createBasicSummary(emailContent),
        priority: "HIGH",
      }
    }
  }

  private extractCompanyName(fromEmail: string): string {
    // Extract company name from email address
    const emailMatch = fromEmail.match(/<(.+)>/) || fromEmail.match(/(.+@.+)/)
    if (emailMatch) {
      const email = emailMatch[1] || emailMatch[0]
      const domain = email.split("@")[1]
      if (domain) {
        // Convert domain to company name (e.g., google.com -> Google)
        const companyName = domain.split(".")[0]
        return companyName.charAt(0).toUpperCase() + companyName.slice(1)
      }
    }
    return fromEmail.split("@")[0] || "Unknown"
  }

  private createBasicSummary(content: string): string {
    // Fallback basic summarization
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 10)
    const firstSentence = sentences[0]?.trim().substring(0, 50) || "Important email received"
    const secondSentence = sentences[1]?.trim().substring(0, 50) || "Please check your email"

    return `${firstSentence}\n${secondSentence}`
  }

  formatWhatsAppMessage(summary: EmailSummary): string {
    return `*MailSense*
_Business Account_

*From:* ${summary.from}
*Sub:* ${summary.subject}

*Content:*
${summary.summary}

_Priority: ${summary.priority}_`
  }
}
