// Simple test script to verify API endpoints
const testWhatsApp = async () => {
  try {
    console.log('Testing WhatsApp API...')
    const response = await fetch('http://localhost:3001/api/send-whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: '+919655667171',
        message: 'Test message from MailSense API'
      })
    })
    
    const result = await response.json()
    console.log('WhatsApp API Response:', result)
  } catch (error) {
    console.error('WhatsApp API Error:', error.message)
  }
}

const testAISummarizer = async () => {
  try {
    console.log('Testing AI Summarizer API...')
    const response = await fetch('http://localhost:3001/api/summarize-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailContent: 'This is a test email about an important meeting tomorrow at 2 PM. Please confirm your attendance.',
        from: 'John Doe <john@company.com>',
        subject: 'Important Meeting Tomorrow'
      })
    })
    
    const result = await response.json()
    console.log('AI Summarizer Response:', result)
  } catch (error) {
    console.error('AI Summarizer Error:', error.message)
  }
}

// Run tests
console.log('Starting API tests...')
testWhatsApp()
testAISummarizer()