import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json()

    // Validate required environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !phoneNumber) {
      console.error('[Twilio SMS] Missing required environment variables')
      return NextResponse.json(
        { 
          error: 'Twilio SMS configuration missing',
          details: 'Please configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER'
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

    console.log(`[Twilio SMS] Sending SMS to ${to}`)

    // Create Twilio client credentials
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

    // Send SMS via Twilio API
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: phoneNumber,
        To: to,
        Body: message,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('[Twilio SMS] API Error:', response.status, errorData)
      
      // Parse Twilio error response
      let errorMessage = 'Failed to send SMS'
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
          provider: 'twilio-sms'
        },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log(`[Twilio SMS] Message sent successfully:`, result.sid)

    return NextResponse.json({
      success: true,
      id: result.sid,
      status: result.status,
      provider: 'twilio-sms',
      to: to,
      from: phoneNumber
    })

  } catch (error: any) {
    console.error('[Twilio SMS] Unexpected error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message,
        provider: 'twilio-sms'
      },
      { status: 500 }
    )
  }
}