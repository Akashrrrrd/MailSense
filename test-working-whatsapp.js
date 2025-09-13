require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

async function quickTest() {
  console.log('📱 Quick WhatsApp Test...');
  
  try {
    const response = await fetch('http://localhost:3000/api/send-twilio-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'whatsapp:+919655667171',
        message: '🎉 MailSense WhatsApp Test via Twilio! Working perfectly! 📧'
      })
    });
    
    const result = await response.json();
    console.log(response.ok ? `✅ Success: ${result.id}` : `❌ Failed: ${result.error}`);
  } catch (error) {
    console.log('❌ Error:', error.message.includes('ECONNREFUSED') ? 'Server not running' : error.message);
  }
}

quickTest();