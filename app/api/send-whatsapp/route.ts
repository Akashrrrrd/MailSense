import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  // Debugging setup
  const startTime = Date.now()
  console.log('[WhatsApp] Starting request processing')

  try {
    const { to, message } = await request.json()
    console.log('[WhatsApp] Request data:', { to, message: message?.length > 50 ? message.substring(0, 50) + '...' : message })

    if (!to || !message) {
      console.log('[WhatsApp] Validation failed - missing fields')
      return NextResponse.json(
        { error: "Missing required fields: to, message" },
        { status: 400 }
      )
    }

    // Environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER

    if (!accountSid || !authToken || !fromNumber) {
      console.error('[WhatsApp] Missing Twilio credentials')
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    // Number formatting
    const formattedFrom = fromNumber.startsWith("whatsapp:") 
      ? fromNumber 
      : `whatsapp:${fromNumber.replace(/[^\d+]/g, "")}`

    const cleanTo = to.replace(/[^\d+]/g, "")
    const formattedTo = cleanTo.startsWith("+")
      ? `whatsapp:${cleanTo}`
      : `whatsapp:+${cleanTo}`

    if (!/^whatsapp:\+\d{10,15}$/.test(formattedTo)) {
      console.log('[WhatsApp] Invalid phone number format:', formattedTo)
      return NextResponse.json(
        { error: "Invalid phone number format. Use international format (+1234567890)" },
        { status: 400 }
      )
    }

    // Test DNS resolution first
    console.log('[WhatsApp] Testing DNS resolution...')
    try {
      const dns = await import('dns').then(m => m.promises)
      await dns.lookup('api.twilio.com')
      console.log('[WhatsApp] DNS resolution successful')
    } catch (dnsError: any) {
      console.error('[WhatsApp] DNS resolution failed:', dnsError.message)
      return NextResponse.json(
        { 
          error: "DNS resolution failed",
          details: "Cannot resolve api.twilio.com",
          solution: "Check your internet connection and DNS settings"
        },
        { status: 503 }
      )
    }

    // API Configuration with enhanced options
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    const controller = new AbortController()
    const timeout = 30000 // Increased to 30 seconds
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    console.log('[WhatsApp] Preparing to send to:', {
      from: formattedFrom,
      to: formattedTo,
      messageLength: message.length
    })

    try {
      const fetchStart = Date.now()
      console.log('[WhatsApp] Starting Twilio API call...')

      // Enhanced fetch options for better connectivity
      const response = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "MailSense-WhatsApp/1.0",
          "Accept": "application/json",
          "Connection": "close", // Force connection close to avoid keep-alive issues
        },
        body: new URLSearchParams({
          From: formattedFrom,
          To: formattedTo,
          Body: message.substring(0, 1600),
        }),
        signal: controller.signal,
        // Additional fetch options for better reliability
        keepalive: false,
        redirect: 'follow',
      })

      clearTimeout(timeoutId)
      const fetchDuration = Date.now() - fetchStart
      console.log(`[WhatsApp] Twilio response received in ${fetchDuration}ms`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[WhatsApp] Twilio API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        })
        
        // Handle specific Twilio error codes
        if (response.status === 401) {
          return NextResponse.json(
            { error: "Authentication failed", details: "Check your Twilio credentials" },
            { status: 401 }
          )
        } else if (response.status === 400) {
          return NextResponse.json(
            { error: "Bad request", details: errorText },
            { status: 400 }
          )
        } else if (response.status === 429) {
          // Handle rate limiting
          const isTrialLimit = errorText.includes('daily messages limit') || errorText.includes('63038')
          
          if (isTrialLimit) {
            return NextResponse.json(
              { 
                error: "Daily message limit reached", 
                details: "Twilio trial account has reached the 9 messages/day limit.",
                code: "TRIAL_LIMIT_EXCEEDED",
                solutions: [
                  "Upgrade to Twilio paid account for unlimited messages",
                  "Wait until tomorrow (limit resets at midnight UTC)",
                  "Use a different Twilio account for testing"
                ],
                upgradeUrl: "https://console.twilio.com/billing"
              },
              { status: 429 }
            )
          } else {
            return NextResponse.json(
              { 
                error: "Rate limit exceeded", 
                details: "Too many requests. Please wait before sending another message.",
                code: "RATE_LIMIT_EXCEEDED"
              },
              { status: 429 }
            )
          }
        }
        
        return NextResponse.json(
          { error: "Message delivery failed", details: errorText },
          { status: 502 }
        )
      }

      const result = await response.json()
      console.log('[WhatsApp] Message sent successfully:', result.sid)
      return NextResponse.json({ success: true, id: result.sid })

    } catch (error: any) {
      clearTimeout(timeoutId)
      const errorType = error.name || 'UnknownError'
      console.error('[WhatsApp] API call failed:', {
        error: errorType,
        message: error.message,
        code: error.code,
        errno: error.errno,
        syscall: error.syscall,
        stack: error.stack?.split('\n').slice(0, 3).join('\n') // Limit stack trace
      })

      // Enhanced error handling
      if (errorType === 'AbortError') {
        return NextResponse.json(
          { 
            error: "Connection timeout",
            solution: "The request took too long. Check your network connection and Twilio service status"
          },
          { status: 504 }
        )
      }

      // Handle specific Node.js network errors
      if (error.code === 'ENOTFOUND') {
        return NextResponse.json(
          { 
            error: "DNS lookup failed",
            details: "Cannot resolve api.twilio.com",
            solution: "Check your internet connection and DNS settings"
          },
          { status: 503 }
        )
      }

      if (error.code === 'ECONNREFUSED') {
        return NextResponse.json(
          { 
            error: "Connection refused",
            details: "Twilio server refused the connection",
            solution: "Check if Twilio services are operational"
          },
          { status: 503 }
        )
      }

      if (error.code === 'ECONNRESET') {
        return NextResponse.json(
          { 
            error: "Connection reset",
            details: "Connection was reset by Twilio",
            solution: "Retry the request or check network stability"
          },
          { status: 503 }
        )
      }

      if (error.code === 'ETIMEDOUT') {
        return NextResponse.json(
          { 
            error: "Connection timeout",
            details: "Request timed out before completion",
            solution: "Check your network connection speed"
          },
          { status: 504 }
        )
      }

      return NextResponse.json(
        { 
          error: "Network error",
          details: error.message,
          code: error.code,
          solution: "Verify your server can reach api.twilio.com and check your network configuration"
        },
        { status: 503 }
      )
    }

  } catch (error: any) {
    console.error('[WhatsApp] Unexpected error:', {
      error: error.name,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n') // Limit stack trace
    })
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  } finally {
    console.log(`[WhatsApp] Request completed in ${Date.now() - startTime}ms`)
  }
}