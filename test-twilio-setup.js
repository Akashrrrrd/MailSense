const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function testTwilioSetup() {
  console.log('🔍 Testing Twilio WhatsApp Setup...\n');
  
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  
  console.log('📋 Configuration:');
  console.log(`Account SID: ${accountSid ? '✅ Set' : '❌ Missing'}`);
  console.log(`Auth Token: ${authToken ? '✅ Set' : '❌ Missing'}`);
  console.log(`WhatsApp Number: ${whatsappNumber || '❌ Not set'}`);
  console.log(`Phone Number: ${phoneNumber || '❌ Not set'}`);
  
  if (!accountSid || !authToken) {
    console.log('\n❌ Missing required Twilio credentials');
    console.log('Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env.local');
    return;
  }
  
  // Test Twilio API connection
  console.log('\n🔗 Testing Twilio API Connection...');
  try {
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`, {
      headers: {
        'Authorization': `Basic ${credentials}`
      }
    });
    
    if (response.ok) {
      const account = await response.json();
      console.log('✅ Twilio API connection successful');
      console.log(`   Account Status: ${account.status}`);
      console.log(`   Account Type: ${account.type}`);
    } else {
      console.log('❌ Twilio API connection failed');
      console.log(`   Status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Twilio API test failed:', error.message);
  }
  
  // Check WhatsApp number format
  console.log('\n📱 WhatsApp Number Analysis:');
  if (!whatsappNumber) {
    console.log('❌ WhatsApp number not configured');
    console.log('   Set TWILIO_WHATSAPP_NUMBER in .env.local');
    console.log('   Format: whatsapp:+14155238886 (Twilio Sandbox)');
  } else if (whatsappNumber === 'whatsapp:+14155238886') {
    console.log('⚠️ Using Twilio WhatsApp Sandbox');
    console.log('   This is for testing only');
    console.log('   For production, you need an approved WhatsApp Business number');
  } else {
    console.log('✅ Custom WhatsApp number configured');
    console.log('   Make sure this number is approved for WhatsApp Business API');
  }
  
  // Check SMS number
  console.log('\n📞 SMS Number Analysis:');
  if (!phoneNumber) {
    console.log('❌ SMS number not configured');
    console.log('   Set TWILIO_PHONE_NUMBER for SMS fallback');
  } else {
    console.log('✅ SMS number configured for fallback');
    console.log(`   Number: ${phoneNumber}`);
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('==============');
  
  if (!accountSid || !authToken) {
    console.log('1. 🔑 Get Twilio credentials from https://console.twilio.com');
    console.log('2. 📝 Add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to .env.local');
  }
  
  if (!whatsappNumber) {
    console.log('3. 📱 Set up WhatsApp Sandbox: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn');
    console.log('4. 📝 Add TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886 to .env.local');
  }
  
  if (!phoneNumber) {
    console.log('5. 📞 Get a Twilio phone number for SMS fallback');
    console.log('6. 📝 Add TWILIO_PHONE_NUMBER to .env.local');
  }
  
  console.log('7. 🧪 Run: node test-twilio-whatsapp.js');
  console.log('8. 🚀 Test your MailSense notifications!');
}

testTwilioSetup().catch(console.error);