import { NextRequest, NextResponse } from "next/server"
import type { EmailSummary } from "@/lib/gmail-api"

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIAssistantRequest {
  message: string
  emails: EmailSummary[]
  conversationHistory: Message[]
}

// Helper function to analyze emails based on user query
function analyzeEmails(query: string, emails: EmailSummary[]): string {
  try {
    const lowerQuery = query.toLowerCase()
    
    // Safety check for emails array
    if (!emails || emails.length === 0) {
      return "I don't see any emails in your inbox right now. Please make sure your emails are loaded in the dashboard."
    }
    
    // Email statistics with safety checks
    const totalEmails = emails.length
    const unreadEmails = emails.filter(email => email && !email.isRead).length
    const highPriorityEmails = emails.filter(email => email && email.priority === 'high').length
    const mediumPriorityEmails = emails.filter(email => email && email.priority === 'medium').length
    const lowPriorityEmails = emails.filter(email => email && email.priority === 'low').length
  
  // Time-based analysis
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const thisWeek = new Date(today)
  thisWeek.setDate(thisWeek.getDate() - 7)
  
  const todayEmails = emails.filter(email => {
    const emailDate = new Date(email.date)
    return emailDate.toDateString() === today.toDateString()
  })
  
  const yesterdayEmails = emails.filter(email => {
    const emailDate = new Date(email.date)
    return emailDate.toDateString() === yesterday.toDateString()
  })
  
  const thisWeekEmails = emails.filter(email => {
    const emailDate = new Date(email.date)
    return emailDate >= thisWeek
  })

  // Query analysis patterns
  if (lowerQuery.includes('high priority') || lowerQuery.includes('urgent') || lowerQuery.includes('important')) {
    if (highPriorityEmails === 0) {
      return "You don't have any high priority emails right now. Great job staying on top of important messages!"
    }
    
    const highPriorityList = emails
      .filter(email => email.priority === 'high')
      .slice(0, 5)
      .map(email => `• From: ${email.from} - "${email.subject}" (${email.isRead ? 'Read' : 'Unread'})`)
      .join('\n')
    
    return `You have ${highPriorityEmails} high priority email${highPriorityEmails > 1 ? 's' : ''}:\n\n${highPriorityList}${highPriorityEmails > 5 ? '\n\n...and more' : ''}`
  }
  
  if (lowerQuery.includes('unread') || lowerQuery.includes('new')) {
    if (unreadEmails === 0) {
      return "You're all caught up! No unread emails in your inbox. 🎉"
    }
    
    const unreadList = emails
      .filter(email => !email.isRead)
      .slice(0, 5)
      .map(email => `• From: ${email.from} - "${email.subject}" (${email.priority} priority)`)
      .join('\n')
    
    return `You have ${unreadEmails} unread email${unreadEmails > 1 ? 's' : ''}:\n\n${unreadList}${unreadEmails > 5 ? '\n\n...and more' : ''}`
  }
  
  if (lowerQuery.includes('today') || lowerQuery.includes('recent')) {
    if (todayEmails.length === 0) {
      return "You haven't received any emails today yet."
    }
    
    const todayList = todayEmails
      .slice(0, 5)
      .map(email => `• From: ${email.from} - "${email.subject}" (${email.priority} priority)`)
      .join('\n')
    
    return `You received ${todayEmails.length} email${todayEmails.length > 1 ? 's' : ''} today:\n\n${todayList}${todayEmails.length > 5 ? '\n\n...and more' : ''}`
  }
  
  if (lowerQuery.includes('yesterday')) {
    if (yesterdayEmails.length === 0) {
      return "You didn't receive any emails yesterday."
    }
    
    const yesterdayList = yesterdayEmails
      .slice(0, 5)
      .map(email => `• From: ${email.from} - "${email.subject}" (${email.priority} priority)`)
      .join('\n')
    
    return `You received ${yesterdayEmails.length} email${yesterdayEmails.length > 1 ? 's' : ''} yesterday:\n\n${yesterdayList}${yesterdayEmails.length > 5 ? '\n\n...and more' : ''}`
  }
  
  if (lowerQuery.includes('this week') || lowerQuery.includes('week')) {
    const weekList = thisWeekEmails
      .slice(0, 5)
      .map(email => `• From: ${email.from} - "${email.subject}" (${new Date(email.date).toLocaleDateString()})`)
      .join('\n')
    
    return `You received ${thisWeekEmails.length} email${thisWeekEmails.length > 1 ? 's' : ''} this week:\n\n${weekList}${thisWeekEmails.length > 5 ? '\n\n...and more' : ''}`
  }
  
  // Search for specific sender - enhanced patterns
  const fromMatch = lowerQuery.match(/from\s+([^?]+)/i) || 
                   lowerQuery.match(/emails?\s+from\s+([^?]+)/i) ||
                   lowerQuery.match(/received.*from\s+([^?]+)/i) ||
                   lowerQuery.match(/any.*from\s+([^?]+)/i) ||
                   lowerQuery.match(/^([a-zA-Z0-9\s&]+)$/i) // Match simple company names like "Accenture"
  
  if (fromMatch) {
    const senderQuery = fromMatch[1].trim().toLowerCase()
    console.log('[AI Assistant] Searching for sender:', senderQuery)
    
    const senderEmails = emails.filter(email => {
      if (!email || !email.from) return false
      const fromField = email.from.toLowerCase()
      return fromField.includes(senderQuery)
    })
    
    console.log('[AI Assistant] Found emails:', senderEmails.length)
    
    if (senderEmails.length === 0) {
      // Show available senders for debugging
      const availableSenders = emails
        .map(email => email.from)
        .filter((sender, index, arr) => arr.indexOf(sender) === index)
        .slice(0, 5)
        .join(', ')
      
      return `I couldn't find any emails from "${senderQuery}" in your current inbox. 

Available senders include: ${availableSenders}${emails.length > 5 ? '...' : ''}

Try using the exact name or email address as it appears in your inbox.`
    }
    
    const senderList = senderEmails
      .slice(0, 5)
      .map(email => `• "${email.subject}" - ${new Date(email.date).toLocaleDateString()} (${email.priority} priority, ${email.isRead ? 'Read' : 'Unread'})`)
      .join('\n')
    
    return `Found ${senderEmails.length} email${senderEmails.length > 1 ? 's' : ''} from "${senderQuery}":\n\n${senderList}${senderEmails.length > 5 ? '\n\n...and more' : ''}`
  }
  
  // Search for specific subject or content
  const aboutMatch = lowerQuery.match(/about\s+([^?]+)/i) || lowerQuery.match(/regarding\s+([^?]+)/i)
  if (aboutMatch) {
    const subjectQuery = aboutMatch[1].trim().toLowerCase()
    const subjectEmails = emails.filter(email => 
      email.subject.toLowerCase().includes(subjectQuery) ||
      email.snippet?.toLowerCase().includes(subjectQuery)
    )
    
    if (subjectEmails.length === 0) {
      return `I couldn't find any emails about "${subjectQuery}" in your current inbox.`
    }
    
    const subjectList = subjectEmails
      .slice(0, 5)
      .map(email => `• From: ${email.from} - "${email.subject}" (${new Date(email.date).toLocaleDateString()})`)
      .join('\n')
    
    return `Found ${subjectEmails.length} email${subjectEmails.length > 1 ? 's' : ''} about "${subjectQuery}":\n\n${subjectList}${subjectEmails.length > 5 ? '\n\n...and more' : ''}`
  }
  
  // General statistics query
  if (lowerQuery.includes('summary') || lowerQuery.includes('overview') || lowerQuery.includes('stats')) {
    return `Here's your email summary:
    
📧 Total emails: ${totalEmails}
📬 Unread: ${unreadEmails}
🔴 High priority: ${highPriorityEmails}
🟡 Medium priority: ${mediumPriorityEmails}
🟢 Low priority: ${lowPriorityEmails}

📅 Today: ${todayEmails.length} emails
📅 This week: ${thisWeekEmails.length} emails

${unreadEmails > 0 ? `\nYou have ${unreadEmails} unread emails that might need your attention.` : '\nYou\'re all caught up! 🎉'}`
  }
  
  // Handle specific questions about email patterns
  if (lowerQuery.includes('boss') || lowerQuery.includes('manager') || lowerQuery.includes('supervisor')) {
    const bossEmails = emails.filter(email => {
      const sender = email.from.toLowerCase()
      const subject = email.subject.toLowerCase()
      return sender.includes('manager') || sender.includes('boss') || 
             subject.includes('urgent') || subject.includes('asap') ||
             email.priority === 'high'
    })
    
    if (bossEmails.length === 0) {
      return "I don't see any emails that appear to be from your boss or manager based on sender names and urgency indicators."
    }
    
    const bossList = bossEmails
      .slice(0, 3)
      .map(email => `• From: ${email.from} - "${email.subject}" (${email.priority} priority)`)
      .join('\n')
    
    return `Found ${bossEmails.length} email${bossEmails.length > 1 ? 's' : ''} that might be from management or are high priority:\n\n${bossList}`
  }
  
  // Handle questions about email volume
  if (lowerQuery.includes('how many') || lowerQuery.includes('count')) {
    return `Here's your email count breakdown:
    
📧 Total emails: ${totalEmails}
📬 Unread emails: ${unreadEmails}
🔴 High priority: ${highPriorityEmails}
🟡 Medium priority: ${mediumPriorityEmails}
🟢 Low priority: ${lowPriorityEmails}

📅 Received today: ${todayEmails.length}
📅 This week: ${thisWeekEmails.length}`
  }
  
  // Handle questions about missing emails
  if (lowerQuery.includes('missing') || lowerQuery.includes('where is') || lowerQuery.includes("haven't received")) {
    return `If you're looking for a specific email, try asking me:
    
• "Emails from [specific person or company]"
• "Emails about [specific topic]"
• "Show me emails from today/yesterday/this week"

I can only search through the emails currently loaded in your dashboard. If an email isn't showing up, it might be:
• In a different folder (Spam, Promotions, etc.)
• Older than your current email fetch limit
• From a sender with a different name than expected`
  }
  
  // Default response for unrecognized queries
  return `I can help you with questions about your emails! Try asking me:

• "Show me my high priority emails"
• "Any unread emails?"
• "What emails did I get today?"
• "Emails from [person/company]"
• "Emails about [topic]"
• "Any emails from my boss?"
• "How many emails do I have?"
• "Give me a summary"

You currently have ${totalEmails} emails in your inbox with ${unreadEmails} unread and ${highPriorityEmails} high priority.`
  
  } catch (error) {
    console.error('[AI Assistant] Error in analyzeEmails:', error)
    return "I encountered an error while analyzing your emails. Please try asking your question in a different way."
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[AI Assistant] Processing request...')
    
    const body: AIAssistantRequest = await request.json()
    const { message, emails } = body

    console.log('[AI Assistant] Query:', message)
    console.log('[AI Assistant] Email count:', emails?.length || 0)

    if (!message || !Array.isArray(emails)) {
      console.error('[AI Assistant] Invalid request format:', { message: !!message, emails: Array.isArray(emails) })
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      )
    }

    // Analyze the user's query and generate a response
    const response = analyzeEmails(message, emails)
    
    console.log('[AI Assistant] Response generated successfully')

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("AI Assistant API error:", error)
    return NextResponse.json(
      { 
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}