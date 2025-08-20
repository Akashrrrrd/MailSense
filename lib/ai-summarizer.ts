interface EmailSummary {
  from: string
  subject: string
  summary: string
  priority: "HIGH" | "MEDIUM" | "LOW"
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export class AIEmailSummarizer {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || ""
  }

  async summarizeEmail(emailContent: string, from: string, subject: string): Promise<EmailSummary> {
    try {
      if (!this.apiKey) {
        throw new Error("OpenAI API key not configured")
      }

      const prompt = `
        Create a clear 2-line WhatsApp summary for this email:
        
        From: ${from}
        Subject: ${subject}
        Content: ${emailContent}
        
        Requirements:
        - Exactly 2 complete lines (no truncation with ...)
        - Each line 60-80 characters for readability
        - First line: Main message or action
        - Second line: Important details or context
        - Use complete sentences, no cutting off mid-word
        - Professional and clear language
        - Focus on key information the user needs to know
        
        Examples:
        "Your account security settings have been updated successfully"
        "This change was made from a new device in California"
        
        OR
        
        "Meeting invitation for project review tomorrow at 3 PM"
        "Please confirm your attendance and prepare status update"
        
        Return only the 2-line summary with complete sentences.
      `

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that summarizes emails concisely for WhatsApp notifications."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 200,
          temperature: 0.3
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("OpenAI API error:", errorData)
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
      }

      const data: OpenAIResponse = await response.json()
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
    // Clean content first
    const cleanContent = content
      .replace(/\[image:.*?\]/gi, '') // Remove image references
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
    
    // Look for key patterns
    const urgentPatterns = /\b(urgent|asap|emergency|critical|important|deadline|security|alert)\b/i
    const actionPatterns = /\b(meeting|interview|call|appointment|review|approval|confirm|schedule|verify)\b/i
    const timePatterns = /\b(today|tomorrow|this week|monday|tuesday|wednesday|thursday|friday|deadline|due)\b/i
    
    const isUrgent = urgentPatterns.test(cleanContent)
    const hasAction = actionPatterns.test(cleanContent)
    const hasTime = timePatterns.test(cleanContent)
    
    // Extract meaningful sentences
    const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 15)
    
    let firstLine = ''
    let secondLine = ''
    
    if (sentences.length >= 2) {
      // Use complete sentences without truncation
      firstLine = sentences[0].trim()
      secondLine = sentences[1].trim()
      
      // Ensure reasonable length but keep complete words
      if (firstLine.length > 80) {
        const words = firstLine.split(' ')
        const cutPoint = words.findIndex((_, i) => 
          words.slice(0, i + 1).join(' ').length > 75
        )
        firstLine = words.slice(0, cutPoint > 0 ? cutPoint : words.length).join(' ')
      }
      
      if (secondLine.length > 80) {
        const words = secondLine.split(' ')
        const cutPoint = words.findIndex((_, i) => 
          words.slice(0, i + 1).join(' ').length > 75
        )
        secondLine = words.slice(0, cutPoint > 0 ? cutPoint : words.length).join(' ')
      }
    } else if (sentences.length === 1) {
      // Split single sentence intelligently
      const words = sentences[0].trim().split(' ')
      if (words.length > 8) {
        const midPoint = Math.ceil(words.length / 2)
        firstLine = words.slice(0, midPoint).join(' ')
        secondLine = words.slice(midPoint).join(' ')
      } else {
        firstLine = sentences[0].trim()
        secondLine = "Please check your email for complete details"
      }
    } else {
      // Create contextual summary
      if (cleanContent.toLowerCase().includes('security') || cleanContent.toLowerCase().includes('alert')) {
        firstLine = "Security notification received"
        secondLine = "Please review your account activity and settings"
      } else if (isUrgent) {
        firstLine = "Important email requires your attention"
        secondLine = "Please review urgently for required actions"
      } else if (hasAction) {
        firstLine = "Action may be required for this email"
        secondLine = "Please check for dates and deadlines"
      } else {
        firstLine = "Important email received"
        secondLine = "Please check your email for complete information"
      }
    }
    
    return `${firstLine}\n${secondLine}`
  }

  formatWhatsAppMessage(summary: EmailSummary): string {
    const timeStamp = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
    
    return `🔔 *MailSense Alert*
_High Priority Email_

*From:* ${summary.from}
*Subject:* ${summary.subject}
*Time:* ${timeStamp}

*AI Summary:*
${summary.summary}

_Priority: ${summary.priority} | Powered by MailSense AI_
_Check Gmail or MailSense dashboard for full details_`
  }
}
