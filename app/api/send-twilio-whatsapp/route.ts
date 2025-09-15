import { NextRequest, NextResponse } from "next/server"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json()

    // 🔑 Check environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER

    if (!accountSid || !authToken || !whatsappNumber) {
      console.error("[Twilio] Missing environment variables")
      return NextResponse.json(
        {
          error: "Twilio configuration missing",
          details:
            "Please configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER",
        },
        { status: 500, headers: corsHeaders }
      )
    }

    // 🔑 Validate inputs
    if (!to || !message) {
      return NextResponse.json(
        { error: "Missing required fields: to and message" },
        { status: 400, headers: corsHeaders }
      )
    }

    // Format WhatsApp numbers
    const formattedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`
    const formattedFrom = whatsappNumber.startsWith("whatsapp:")
      ? whatsappNumber
      : `whatsapp:${whatsappNumber}`

    console.log(`[Twilio] Sending WhatsApp message to ${formattedTo}`)

    // Twilio Basic Auth
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString(
      "base64"
    )

    // Send message
    const twilioRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: formattedFrom,
          To: formattedTo,
          Body: message,
        }),
      }
    )

    // 🔴 If Twilio responds with error
    if (!twilioRes.ok) {
      const errorText = await twilioRes.text()
      console.error("[Twilio] API Error:", twilioRes.status, errorText)

      let errorMessage = "Failed to send WhatsApp message"
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || errorMessage
      } catch {
        // keep default message
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: errorText,
          provider: "twilio",
        },
        { status: twilioRes.status, headers: corsHeaders }
      )
    }

    // ✅ Success
    const result = await twilioRes.json()
    console.log(`[Twilio] WhatsApp message sent:`, result.sid)

    return NextResponse.json(
      {
        success: true,
        id: result.sid,
        status: result.status,
        provider: "twilio",
        to: formattedTo,
        from: formattedFrom,
      },
      { headers: corsHeaders }
    )
  } catch (error: any) {
    console.error("[Twilio] Unexpected error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
        provider: "twilio",
      },
      { status: 500, headers: corsHeaders }
    )
  }
}
