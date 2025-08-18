import { type NextRequest, NextResponse } from "next/server"
import { AIEmailSummarizer } from "@/lib/ai-summarizer"

export async function POST(request: NextRequest) {
  try {
    const { emailContent, from, subject } = await request.json()

    if (!emailContent || !from || !subject) {
      return NextResponse.json(
        {
          error: "Missing required fields: emailContent, from, subject",
        },
        { status: 400 },
      )
    }

    const summarizer = new AIEmailSummarizer()
    const summary = await summarizer.summarizeEmail(emailContent, from, subject)
    const whatsappMessage = summarizer.formatWhatsAppMessage(summary)

    return NextResponse.json({
      success: true,
      summary,
      whatsappMessage,
    })
  } catch (error) {
    console.error("Email summarization error:", error)
    return NextResponse.json(
      {
        error: "Failed to summarize email",
      },
      { status: 500 },
    )
  }
}
