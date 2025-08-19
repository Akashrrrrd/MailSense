import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log('[Vonage WhatsApp] Starting request processing')

  try {
    const { to, message } = await request.json()
    console.log('[Vonage WhatsApp] Request data:', { to, messageLength: message?.length })

    if (!to || !message) {
      console.log('[Vonage WhatsApp] Validation failed - missing fields')
      return NextResponse.json(
        { error: "Missing required fields: to, message" },
        { status: 400 }
      )
    }

    // Environment variables for Vonage
    const apiKey = process.env.VONAGE_API_KEY
    const apiSecret = process.env.VONAGE_API_SECRET
    const whatsappNumber = process.env.VONAGE_WHATSAPP_NUMBER

    if (!apiKey || !apiSecret || !whatsappNumber) {
      console.error('[Vonage WhatsApp] Missing Vonage credentials')
      return NextResponse.json(
        { 
          error: "Server configuration error",
          details: "Vonage credentials not configured. Please add VONAGE_API_KEY, VONAGE_API_SECRET, and VONAGE_WHATSAPP_NUMBER to environment variables."
        },
        { status: 500 }
      )
    }

    // Format phone numbers for Vonage
    const cleanTo = to.replace(/[^\d+]/g, "")
    const formattedTo = cleanTo.startsWith("+") ? cleanTo : `+${cleanTo}`

    if (!/^\+\d{10,15}$/.test(formattedTo)) {
      console.log('[Vonage WhatsApp] Invalid phone number format:', formattedTo)
      return NextResponse.json(
        { error: "Invalid phone number format. Use international format (+1234567890)" },
        { status: 400 }
      )
    }

    // Vonage Messages API endpoint
    const vonageUrl = 'https://api.nexmo.com/v1/messages'
    
    // Create JWT token for authentication
    const jwt = await createVonageJWT(apiKey, apiSecret)
    
    const controller = new AbortController()
    const timeout = 30000
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    console.log('[Vonage WhatsApp] Preparing to send message to:', formattedTo)

    try {
      const fetchStart = Date.now()
      console.log('[Vonage WhatsApp] Starting Vonage API call...')

      const response = await fetch(vonageUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${jwt}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
          "User-Agent": "MailSense-WhatsApp/1.0",
        },
        body: JSON.stringify({
          from: whatsappNumber,
          to: formattedTo,
          message_type: "text",
          text: message.substring(0, 4096), // WhatsApp limit
          channel: "whatsapp"
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const fetchDuration = Date.now() - fetchStart
      console.log(`[Vonage WhatsApp] Vonage response received in ${fetchDuration}ms`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[Vonage WhatsApp] Vonage API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        })
        
        // Handle specific Vonage error codes
        if (response.status === 401) {
          return NextResponse.json(
            { error: "Authentication failed", details: "Check your Vonage API credentials" },
            { status: 401 }
          )
        } else if (response.status === 400) {
          return NextResponse.json(
            { error: "Bad request", details: errorText },
            { status: 400 }
          )
        } else if (response.status === 429) {
          return NextResponse.json(
            { 
              error: "Rate limit exceeded", 
              details: "Vonage API rate limit reached. Please wait before sending another message.",
              code: "VONAGE_RATE_LIMIT"
            },
            { status: 429 }
          )
        }
        
        return NextResponse.json(
          { error: "Message delivery failed", details: errorText },
          { status: 502 }
        )
      }

      const result = await response.json()
      console.log('[Vonage WhatsApp] Message sent successfully:', result.message_uuid)
      return NextResponse.json({ 
        success: true, 
        id: result.message_uuid,
        provider: 'vonage'
      })

    } catch (error: any) {
      clearTimeout(timeoutId)
      const errorType = error.name || 'UnknownError'
      console.error('[Vonage WhatsApp] API call failed:', {
        error: errorType,
        message: error.message,
        code: error.code
      })

      // Enhanced error handling
      if (errorType === 'AbortError') {
        return NextResponse.json(
          { 
            error: "Connection timeout",
            solution: "The request took too long. Check your network connection and Vonage service status"
          },
          { status: 504 }
        )
      }

      if (error.code === 'ENOTFOUND') {
        return NextResponse.json(
          { 
            error: "DNS lookup failed",
            details: "Cannot resolve api.nexmo.com",
            solution: "Check your internet connection and DNS settings"
          },
          { status: 503 }
        )
      }

      return NextResponse.json(
        { 
          error: "Network error",
          details: error.message,
          code: error.code,
          solution: "Verify your server can reach api.nexmo.com"
        },
        { status: 503 }
      )
    }

  } catch (error: any) {
    console.error('[Vonage WhatsApp] Unexpected error:', {
      error: error.name,
      message: error.message
    })
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  } finally {
    console.log(`[Vonage WhatsApp] Request completed in ${Date.now() - startTime}ms`)
  }
}

// Helper function to create Vonage JWT
async function createVonageJWT(apiKey: string, apiSecret: string): Promise<string> {
  const header = {
    typ: "JWT",
    alg: "HS256"
  }

  const payload = {
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
    jti: crypto.randomUUID(),
    iss: apiKey
  }

  // Simple JWT creation (for production, consider using a JWT library)
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  
  const signature = await createHMAC(`${encodedHeader}.${encodedPayload}`, apiSecret)
  
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

// Helper function to create HMAC signature
async function createHMAC(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}