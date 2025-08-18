import { type NextRequest, NextResponse } from "next/server"
import { AIEmailSummarizer } from "@/lib/ai-summarizer"

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log('[AI Summarizer] Starting email summarization request')

  try {
    const { emailContent, from, subject, body } = await request.json()
    console.log('[AI Summarizer] Request data:', { 
      from, 
      subject, 
      contentLength: emailContent?.length || body?.length || 0 
    })

    // Accept both emailContent and body for flexibility
    const content = emailContent || body
    
    if (!content || !from || !subject) {
      console.log('[AI Summarizer] Validation failed - missing required fields')
      return NextResponse.json(
        {
          error: "Missing required fields: emailContent (or body), from, subject",
          received: { 
            hasContent: !!content, 
            hasFrom: !!from, 
            hasSubject: !!subject 
          }
        },
        { status: 400 },
      )
    }

    // Validate content length
    if (content.length < 10) {
      console.log('[AI Summarizer] Content too short for meaningful summarization')
      return NextResponse.json({
        success: true,
        summary: {
          from: from.split('<')[0].trim() || from.split('@')[0],
          subject: subject.length > 60 ? subject.substring(0, 57) + "..." : subject,
          summary: `New email from ${from.split('<')[0].trim()}\nPlease check your inbox`,
          priority: "HIGH"
        },
        whatsappMessage: `*MailSense*\n_Business Account_\n\n*From:* ${from.split('<')[0].trim()}\n*Sub:* ${subject}\n\n*Content:*\nNew email received\nPlease check your inbox\n\n_Priority: HIGH_`
      })
    }

    console.log('[AI Summarizer] Initializing AI summarizer...')
    const summarizer = new AIEmailSummarizer()
    
    console.log('[AI Summarizer] Calling AI summarization service...')
    const summary = await summarizer.summarizeEmail(content, from, subject)
    const whatsappMessage = summarizer.formatWhatsAppMessage(summary)

    console.log('[AI Summarizer] Summarization completed successfully')
    return NextResponse.json({
      success: true,
      summary,
      whatsappMessage,
      processingTime: Date.now() - startTime
    })

  } catch (error: any) {
    console.error("[AI Summarizer] Error:", {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    })

    // Provide fallback summary on AI failure
    try {
      const { emailContent, from, subject, body } = await request.json().catch(() => ({}))
      const content = emailContent || body || ""
      
      const fallbackSummary = {
        from: from?.split('<')[0]?.trim() || from?.split('@')[0] || "Unknown Sender",
        subject: subject?.length > 60 ? subject.substring(0, 57) + "..." : subject || "No Subject",
        summary: content.length > 100 
          ? `${content.substring(0, 50)}...\n${content.substring(50, 100)}...`
          : content || "Email content not available",
        priority: "HIGH" as const
      }

      const fallbackMessage = `*MailSense*\n_Business Account_\n\n*From:* ${fallbackSummary.from}\n*Sub:* ${fallbackSummary.subject}\n\n*Content:*\n${fallbackSummary.summary}\n\n_Priority: HIGH_`

      return NextResponse.json({
        success: true,
        summary: fallbackSummary,
        whatsappMessage: fallbackMessage,
        fallback: true,
        error: "AI summarization failed, using fallback",
        processingTime: Date.now() - startTime
      })
    } catch (fallbackError) {
      console.error("[AI Summarizer] Fallback also failed:", fallbackError)
      return NextResponse.json(
        {
          error: "Failed to summarize email and fallback failed",
          details: error.message,
          processingTime: Date.now() - startTime
        },
        { status: 500 },
      )
    }
  } finally {
    console.log(`[AI Summarizer] Request completed in ${Date.now() - startTime}ms`)
  }
}
