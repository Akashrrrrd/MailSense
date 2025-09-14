import { NextResponse } from 'next/server'

export async function GET() {
    const envVars = {
        TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Missing',
        TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Missing',
        TWILIO_WHATSAPP_NUMBER: process.env.TWILIO_WHATSAPP_NUMBER || '❌ Missing',
        TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '❌ Missing',
    }

    return NextResponse.json({
        message: 'Environment Variables Test',
        variables: envVars,
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    })
}