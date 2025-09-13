const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function testTwilioWhatsApp() {
  console.log('📱 Testing Twilio WhatsApp Integration...\n');
  
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  
  const testNumber = '+919655667171'; // Your WhatsApp number
  
  if (!accountSid || !authToken || !whatsappNumber) {
    console.log('❌ Missing Twilio configuration');
    console.log('Please run: node test-twilio-setup.js first');
    return;
  }
  
  console.log('📋 Test Configuration:');
  console.log(`From: ${whatsappNumber}`);
  console.log(`To: whatsapp:${testNumber}`);
  console.log('');
  
  try {
    console.log('📤 Sending test WhatsApp message...');
    
    const response = await fetch('http://localhost:3000/api/send-twilio-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: `whatsapp:${testNumber}`,
        message: `🎉 MailSense WhatsApp Test

This is a test message from your MailSense application!

✅ Twilio WhatsApp integration is working
📧 You'll receive important email notifications here
🤖 Powered by AI email classification

Time: ${new Date().toLocaleString()}

If you received this message, your setup is complete! 🚀`
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ WhatsApp message sent successfully!');
      console.log(`   Message ID: ${result.id}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Provider: ${result.provider}`);
      console.log('');
      console.log('💡 Next Steps:');
      console.log('1. ✅ WhatsApp is working - you should receive the test message');
      console.log('2. 🔔 Enable WhatsApp notifications in MailSense settings');
      console.log('3. 📧 Test with real email notifications');
      console.log('4. 🎯 Configure your notification preferences');
      
    } else {
      console.log('❌ WhatsApp message failed');
      console.log(`   Error: ${result.error}`);
      console.log(`   Details: ${result.details}`);
      
      if (result.error?.includes('sandbox')) {
        console.log('');
        console.log('💡 Sandbox Setup Required:');
        console.log('1. Go to: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn');
        console.log('2. Send "join <sandbox-keyword>" to +1 415 523 8886');
        console.log('3. Wait for confirmation message');
        console.log('4. Try this test again');
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

testTwilioWhatsApp().catch(console.error);