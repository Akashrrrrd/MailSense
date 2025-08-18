// Create this as /api/check-message-status/route.ts

import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  console.log('[Message Status] Starting status check...')
  
  const { searchParams } = new URL(request.url)
  const messageSid = searchParams.get('sid')
  
  if (!messageSid) {
    return NextResponse.json(
      { error: "Missing message SID. Use ?sid=YOUR_MESSAGE_SID" },
      { status: 400 }
    )
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN

  if (!accountSid || !authToken) {
    return NextResponse.json(
      { error: "Missing Twilio credentials" },
      { status: 500 }
    )
  }

  try {
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages/${messageSid}.json`
    
    console.log('[Message Status] Fetching status for:', messageSid)
    
    const response = await fetch(twilioUrl, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        'User-Agent': 'MailSense-Status-Check/1.0'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Message Status] API error:', response.status, errorText)
      return NextResponse.json(
        { error: "Failed to fetch message status", details: errorText },
        { status: response.status }
      )
    }

    const messageData = await response.json()
    
    // Enhanced status information
    const statusInfo = {
      sid: messageData.sid,
      status: messageData.status,
      direction: messageData.direction,
      from: messageData.from,
      to: messageData.to,
      body: messageData.body?.substring(0, 100) + (messageData.body?.length > 100 ? '...' : ''),
      dateCreated: messageData.date_created,
      dateUpdated: messageData.date_updated,
      dateSent: messageData.date_sent,
      errorCode: messageData.error_code,
      errorMessage: messageData.error_message,
      price: messageData.price,
      priceUnit: messageData.price_unit,
      uri: messageData.uri,
      // WhatsApp specific fields
      messagingServiceSid: messageData.messaging_service_sid,
      accountSid: messageData.account_sid
    }

    // Interpret the status
    const statusExplanation = getStatusExplanation(messageData.status, messageData.error_code)
    
    console.log('[Message Status] Status retrieved:', messageData.status)
    
    return NextResponse.json({
      message: statusInfo,
      explanation: statusExplanation,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('[Message Status] Error:', error.message)
    return NextResponse.json(
      { error: "Failed to check message status", details: error.message },
      { status: 500 }
    )
  }
}

// POST method to check multiple message IDs
export async function POST(request: NextRequest) {
  try {
    const { messageIds } = await request.json()
    
    if (!messageIds || !Array.isArray(messageIds)) {
      return NextResponse.json(
        { error: "Provide an array of message IDs in the 'messageIds' field" },
        { status: 400 }
      )
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: "Missing Twilio credentials" },
        { status: 500 }
      )
    }

    const results = []

    for (const messageSid of messageIds) {
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages/${messageSid}.json`
        
        const response = await fetch(twilioUrl, {
          method: 'GET',
          headers: {
            Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
            'User-Agent': 'MailSense-Status-Check/1.0'
          }
        })

        if (response.ok) {
          const messageData = await response.json()
          results.push({
            sid: messageSid,
            status: messageData.status,
            errorCode: messageData.error_code,
            errorMessage: messageData.error_message,
            dateSent: messageData.date_sent,
            explanation: getStatusExplanation(messageData.status, messageData.error_code)
          })
        } else {
          results.push({
            sid: messageSid,
            error: `HTTP ${response.status}`,
            explanation: "Failed to fetch message status"
          })
        }
      } catch (error: any) {
        results.push({
          sid: messageSid,
          error: error.message,
          explanation: "Network error while checking status"
        })
      }
    }

    return NextResponse.json({
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: "Invalid request format", details: error.message },
      { status: 400 }
    )
  }
}

function getStatusExplanation(status: string, errorCode?: string) {
  const explanations: Record<string, any> = {
    'queued': {
      status: '⏳ Queued',
      description: 'Message is queued for delivery',
      action: 'Wait for processing'
    },
    'sending': {
      status: '📤 Sending',
      description: 'Message is being sent to WhatsApp',
      action: 'Wait for delivery confirmation'
    },
    'sent': {
      status: '✅ Sent',
      description: 'Message was sent to WhatsApp successfully',
      action: 'Should appear in recipient\'s WhatsApp soon'
    },
    'delivered': {
      status: '📱 Delivered',
      description: 'Message was delivered to recipient\'s device',
      action: 'Message should be visible in WhatsApp'
    },
    'read': {
      status: '👀 Read',
      description: 'Recipient has read the message',
      action: 'Message was successfully received and read'
    },
    'failed': {
      status: '❌ Failed',
      description: 'Message delivery failed',
      action: 'Check error code and retry'
    },
    'undelivered': {
      status: '⚠️ Undelivered',
      description: 'Message could not be delivered',
      action: 'Check recipient number and WhatsApp status'
    }
  }

  const baseExplanation = explanations[status] || {
    status: `❓ ${status}`,
    description: 'Unknown status',
    action: 'Check Twilio documentation'
  }

  // Add error code explanation if present
  if (errorCode) {
    const errorExplanations: Record<string, string> = {
      '63016': 'Recipient not in WhatsApp sandbox - they need to join first',
      '63017': 'Message template not approved or invalid',
      '63024': 'Recipient number is not WhatsApp enabled',
      '21610': 'Message content rejected by WhatsApp',
      '21614': 'Message body is required',
      '21211': 'Invalid phone number format'
    }

    baseExplanation.errorCode = errorCode
    baseExplanation.errorExplanation = errorExplanations[errorCode] || 'Unknown error code'
  }

  return baseExplanation
}