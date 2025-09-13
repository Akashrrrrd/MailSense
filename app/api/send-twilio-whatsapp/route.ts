import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json()

    // Validate required environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER

    if (!accountSid || !authToken || !whatsappNumber) {
      console.error('[Twilio] Missing required environment variables')
      return NextResponse.json(
        { 
          error: 'Twilio configuration missing',
          details: 'Please configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER'
        },
        { status: 500 }
      )
    }

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to and message' },
        { status: 400 }
      )
    }

    // Format WhatsApp number (ensure it starts with whatsapp:)
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
    const formattedFrom = whatsappNumber.startsWith('whatsapp:') ? whatsappNumber : `whatsapp:${whatsappNumber}`

    console.log(`[Twilio] Sending WhatsApp message to ${formattedTo}`)

    // Create Twilio client credentials
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

    // Send WhatsApp message via Twilio API
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: formattedFrom,
        To: formattedTo,
        Body: message,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('[Twilio] API Error:', response.status, errorData)
      
      // Parse Twilio error response
      let errorMessage = 'Failed to send WhatsApp message'
      try {
        const errorJson = JSON.parse(errorData)
        errorMessage = errorJson.message || errorMessage
      } catch (e) {
        // Keep default error message if parsing fails
      }

      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorData,
          provider: 'twilio'
        },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log(`[Twilio] WhatsApp message sent successfully:`, result.sid)

    return NextResponse.json({
      success: true,
      id: result.sid,
      status: result.status,
      provider: 'twilio',
      to: formattedTo,
      from: formattedFrom
    })

  } catch (error: any) {
    console.error('[Twilio] Unexpected error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message,
        provider: 'twilio'
      },
      { status: 500 }
    )
  }
}