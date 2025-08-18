import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log('[AI Summarize] Processing email summarization request')

  try {
    const { subject, body, from } = await request.json()
    
    if (!subject || !from) {
      return NextResponse.json(
        { error: "Missing required fields: subject, from" },
        { status: 400 }
      )
    }

    const emailContent = body || subject
    const senderName = from.split('<')[0].trim() || from.split('@')[0]

    // Try AI summarization first
    try {
      const summaryResponse = await fetch(`${request.nextUrl.origin}/api/summarize-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailContent,
          from,
          subject
        })
      })

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json()
        if (summaryData.summary?.summary) {
          return NextResponse.json({
            success: true,
            summary: summaryData.summary.summary,
            processingTime: Date.now() - startTime,
            source: 'ai'
          })
        }
      }
    } catch (aiError) {
      console.log('[AI Summarize] AI service failed, using intelligent fallback')
    }

    // Intelligent fallback summary
    const intelligentSummary = createIntelligentSummary(subject, emailContent, senderName)
    
    return NextResponse.json({
      success: true,
      summary: intelligentSummary,
      fallback: true,
      processingTime: Date.now() - startTime,
      source: 'intelligent_fallback'
    })

  } catch (error: any) {
    console.error('[AI Summarize] Error:', error.message)
    
    // Basic fallback
    const basicSummary = `Important email received from ${from.split('<')[0].trim() || 'sender'}\nSubject: ${subject || 'No subject'}`
    
    return NextResponse.json({
      success: true,
      summary: basicSummary,
      fallback: true,
      processingTime: Date.now() - startTime,
      source: 'basic_fallback'
    })
  }
}

function createIntelligentSummary(subject: string, content: string, senderName: string): string {
  // Aggressive content cleaning for messy emails
  const cleanContent = content
    .replace(/\[image:.*?\]/gi, '') // Remove image references
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
    .replace(/utm_[^&\s]+/g, '') // Remove UTM parameters
    .replace(/[?&][a-zA-Z0-9_]+=[\w%.-]+/g, '') // Remove URL parameters
    .replace(/\b[A-Z0-9]{10,}\b/g, '') // Remove long alphanumeric codes
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
  
  // Check if this is a specific email type
  const emailType = detectEmailType(subject, senderName, cleanContent)
  
  if (emailType === 'job_alert') {
    return createJobAlertSummary(subject, cleanContent, senderName)
  } else if (emailType === 'security') {
    return createSecuritySummary(subject, cleanContent, senderName)
  } else if (emailType === 'newsletter') {
    return createNewsletterSummary(subject, cleanContent, senderName)
  } else if (emailType === 'meeting') {
    return createMeetingSummary(subject, cleanContent, senderName)
  }
  
  // Generic intelligent summary
  return createGenericSummary(subject, cleanContent, senderName)
}

function detectEmailType(subject: string, sender: string, content: string): string {
  const text = `${subject} ${sender} ${content}`.toLowerCase()
  
  if (text.includes('indeed') || text.includes('job alert') || text.includes('apply to jobs')) {
    return 'job_alert'
  } else if (text.includes('security') || text.includes('alert') || text.includes('suspicious')) {
    return 'security'
  } else if (text.includes('newsletter') || text.includes('unsubscribe') || text.includes('promotion')) {
    return 'newsletter'
  } else if (text.includes('meeting') || text.includes('calendar') || text.includes('invitation')) {
    return 'meeting'
  }
  
  return 'generic'
}

function createJobAlertSummary(subject: string, content: string, sender: string): string {
  // Extract job count
  const jobCountMatch = content.match(/(\d+)\s+(?:new\s+)?(?:job|position|opening)/i)
  const jobCount = jobCountMatch ? jobCountMatch[1] : 'New'
  
  // Extract location
  const locationMatch = content.match(/(?:in|at)\s+([A-Za-z\s,]+?)(?:\s|,|$)/i)
  const location = locationMatch ? locationMatch[1].trim().split(',')[0] : 'your area'
  
  return `${jobCount} job opportunities available from ${sender}\nCheck positions in ${location} and apply directly`
}

function createSecuritySummary(subject: string, content: string, sender: string): string {
  return `Security notification from ${sender}\nPlease review your account activity and settings`
}

function createNewsletterSummary(subject: string, content: string, sender: string): string {
  return `Newsletter update from ${sender}\nCheck latest news and updates in your email`
}

function createMeetingSummary(subject: string, content: string, sender: string): string {
  return `Meeting or calendar update from ${sender}\nPlease check for schedule changes or new appointments`
}

function createGenericSummary(subject: string, content: string, sender: string): string {
  // Extract meaningful sentences from cleaned content
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 15)
  
  if (sentences.length >= 2) {
    let firstLine = sentences[0].trim()
    let secondLine = sentences[1].trim()
    
    // Ensure reasonable length
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
    
    return `${firstLine}\n${secondLine}`
  }
  
  // Fallback to subject-based summary
  const shortSubject = subject.length > 50 ? subject.substring(0, 47) + '...' : subject
  return `Important email from ${sender}\nSubject: ${shortSubject}`
}