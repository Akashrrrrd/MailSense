# WhatsApp Notifications Setup Guide

## 📱 Complete Setup Instructions for MailSense WhatsApp Notifications

### 🎯 Overview
MailSense uses Twilio's WhatsApp Business API to send you professional email alerts directly to your WhatsApp. This guide will walk you through the complete setup process.

---

## 🚀 Step-by-Step Setup

### Step 1: Save the Twilio WhatsApp Number
1. **Add to Contacts**: Save `+14155238886` in your phone contacts
2. **Contact Name**: Use "MailSense" or any name you prefer
3. **Verify**: Make sure the number is saved correctly with the + symbol

### Step 2: Join the WhatsApp Sandbox
1. **Open WhatsApp** on your phone
2. **Start a chat** with the saved contact (+14155238886)
3. **Send the message**: `join spin-order`
4. **Wait for confirmation**: You should receive a welcome message from Twilio

**Important**: The sandbox keyword `spin-order` is specific to our Twilio configuration. You must use this exact phrase.

### Step 3: Configure MailSense
1. **Go to Settings** → Notifications in your MailSense dashboard
2. **Enter your WhatsApp number** (include country code, e.g., +919655667171)
3. **Click "Test WhatsApp"** to verify the connection
4. **Enable notifications** by toggling the WhatsApp switch

---

## ✅ Verification Steps

### Test Message Format
When you click "Test WhatsApp", you should receive:

```
*MailSense Test Message*

Your WhatsApp notifications are working correctly!

You will now receive professional email alerts for high-priority messages.

Powered by MailSense AI
```

### Production Message Format
Real email notifications will look like:

```
*MailSense Email Alert*

*From:* John Doe (Company Name)
*Subject:* Important Project Update
*Received:* 5m ago

*Summary:*
Important message from John Doe.
Regarding: Important Project Update

Powered by MailSense AI
```

---

## 🔧 Troubleshooting

### Common Issues

**1. "Failed to send WhatsApp message"**
- ✅ Verify you sent `join spin-order` to +14155238886
- ✅ Check your phone number format (include country code with +)
- ✅ Ensure you're using the correct Twilio sandbox number

**2. "Rate limit exceeded"**
- ⏰ Wait 1-2 minutes between test messages
- 📊 Twilio has rate limits for sandbox accounts

**3. "Daily message limit reached"**
- 📅 Twilio sandbox has daily limits
- 💰 Consider upgrading to a paid Twilio account for production use

**4. Not receiving messages**
- 📱 Check if WhatsApp is working on your phone
- 🔄 Try sending `join spin-order` again
- 📞 Verify the phone number format

### Phone Number Format Examples
- ✅ US: +1234567890
- ✅ UK: +447123456789
- ✅ India: +919876543210
- ❌ Without +: 1234567890
- ❌ With spaces: +1 234 567 890

---

## 🎯 What You'll Receive

### High-Priority Emails Only
MailSense AI automatically filters emails and only sends WhatsApp notifications for:
- 🔴 **High Priority**: Important business communications
- ⭐ **Gmail Important**: Emails marked as important by Gmail
- 🚨 **Security Alerts**: Account security notifications
- 📅 **Meeting Invites**: Calendar and meeting requests

### Professional Format
- Clean, emoji-free messages
- Proper formatting with bold headers
- Concise, readable summaries
- Mobile-friendly structure

---

## 🔒 Privacy & Security

### Data Protection
- Only email metadata (sender, subject, time) is processed
- AI summaries are generated securely
- No email content is stored permanently
- WhatsApp messages use end-to-end encryption

### Twilio Sandbox Limitations
- **Development Use**: Sandbox is for testing and development
- **Message Limits**: Daily and rate limits apply
- **Approved Numbers**: Only pre-approved numbers can receive messages
- **Production**: Upgrade to paid Twilio account for production use

---

## 📞 Support

### Need Help?
1. **Check this guide** for common solutions
2. **Test the connection** using the "Test WhatsApp" button
3. **Verify setup steps** - especially the `join spin-order` message
4. **Check phone number format** - must include country code with +

### Twilio Sandbox Info
- **Number**: +14155238886
- **Join Code**: `join spin-order`
- **Leave Code**: `leave` (to stop receiving messages)
- **Status Check**: Send `status` to check your sandbox status

---

## 🎉 Success!

Once setup is complete, you'll receive:
- ✅ Instant WhatsApp notifications for important emails
- 📱 Professional, clean message format
- 🤖 AI-powered email summaries
- 🔔 Priority-based filtering

Your MailSense WhatsApp notifications are now ready! 🚀