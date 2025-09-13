const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function testTwilioSMS() {
  console.log('📱 Testing Twilio SMS (Fallback)...\n');
  
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  
  const testNumber = '+919655667171'; // Your phone number
  
  if (!accountSid || !authToken || !phoneNumber) {
    console.log('❌ Missing Twilio SMS configuration');
    console.log('Please run: node test-twilio-setup.js first');
    return;
  }
  
  console.log('📋 Test Configuration:');
  console.log(`From: ${phoneNumber}`);
  console.log(`To: ${testNumber}`);
  console.log('');
  
  try {
    console.log('📤 Sending test SMS...');
    
    const response = await fetch('http://localhost:3000/api/send-twilio-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: testNumber,
        message: `📧 MailSense SMS Test

This is a test SMS from your MailSense application!

✅ Twilio SMS integration is working
📱 This serves as WhatsApp fallback
🤖 Powered by AI email classification

Time: ${new Date().toLocaleString()}

SMS fallback is ready! 🚀`
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ SMS sent successfully!');
      console.log(`   Message ID: ${result.id}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Provider: ${result.provider}`);
      console.log('');
      console.log('💡 SMS Fallback Benefits:');
      console.log('• Works when WhatsApp fails');
      console.log('• No sandbox restrictions');
      console.log('• Immediate delivery');
      console.log('• Universal phone support');
      
    } else {
      console.log('❌ SMS failed');
      console.log(`   Error: ${result.error}`);
      console.log(`   Details: ${result.details}`);
      
      if (result.error?.includes('phone number')) {
        console.log('');
        console.log('💡 Phone Number Issues:');
        console.log('1. Verify your Twilio phone number is active');
        console.log('2. Check if the destination number is valid');
        console.log('3. Ensure you have SMS credits in Twilio');
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('');
      console.log('💡 Server not running:');
      console.log('1. Start your Next.js server: npm run dev');
      console.log('2. Wait for server to start on http://localhost:3000');
      console.log('3. Run this test again');
    }
  }
}

testTwilioSMS().catch(console.error);