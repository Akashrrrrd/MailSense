// Test WhatsApp notification setup
// Run with: node test-whatsapp.js

const fetch = require('node:fetch');

async function testWhatsApp() {
    console.log('🧪 Testing MailSense WhatsApp Setup...\n');

    // Check environment variables
    const requiredEnvVars = [
        'TWILIO_ACCOUNT_SID',
        'TWILIO_AUTH_TOKEN',
        'TWILIO_WHATSAPP_NUMBER',
        'PERPLEXITY_API_KEY'
    ];

    console.log('📋 Checking environment variables:');
    let missingVars = [];

    requiredEnvVars.forEach(varName => {
        const value = process.env[varName];
        if (value) {
            console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
        } else {
            console.log(`❌ ${varName}: Missing`);
            missingVars.push(varName);
        }
    });

    if (missingVars.length > 0) {
        console.log(`\n❌ Missing environment variables: ${missingVars.join(', ')}`);
        console.log('Please add these to your .env.local file or Vercel environment variables.');
        return;
    }

    console.log('\n✅ All environment variables are set!');

    // Test message
    const testMessage = `🔔 MailSense Test
High Priority Email

From: MailSense Team
Subject: WhatsApp Setup Test
Time: ${new Date().toLocaleTimeString()}

AI Summary:
This is a test message to verify your WhatsApp setup.
Your MailSense notifications are working perfectly!

Priority: HIGH | Powered by MailSense AI
Setup completed successfully ✅`;

    // Get phone number from command line or use default
    const phoneNumber = process.argv[2] || '+1234567890';

    console.log(`\n📱 Sending test message to: ${phoneNumber}`);
    console.log('💡 Usage: node test-whatsapp.js +1234567890\n');

    try {
        // Test the API endpoint
        const response = await fetch('http://localhost:3000/api/send-whatsapp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: phoneNumber,
                message: testMessage
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ WhatsApp test message sent successfully!');
            console.log(`📧 Message ID: ${result.id}`);
            console.log('\n🎉 Your MailSense WhatsApp setup is working perfectly!');
        } else {
            const error = await response.json();
            console.log('❌ Failed to send WhatsApp message:');
            console.log(`Status: ${response.status}`);
            console.log(`Error: ${error.error}`);
            if (error.details) {
                console.log(`Details: ${error.details}`);
            }
        }
    } catch (error) {
        console.log('❌ Network error:', error.message);
        console.log('Make sure your Next.js server is running on http://localhost:3000');
    }
}

// Run the test
testWhatsApp().catch(console.error);