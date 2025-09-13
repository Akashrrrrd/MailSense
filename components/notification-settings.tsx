"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, BellOff, Volume2, VolumeX, Clock, Shield, MessageCircle, Phone, Sparkles, Mail, RefreshCw } from "lucide-react"
import { notificationService, type NotificationPreferences, type Email } from "@/lib/notification-service"

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(notificationService.getPreferences())
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | "unsupported">("default")
  const [testNotificationSent, setTestNotificationSent] = useState(false)
  const [whatsappTestStatus, setWhatsappTestStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
  const [whatsappError, setWhatsappError] = useState<string>("")
  const [availableEmails, setAvailableEmails] = useState<Email[]>([])
  const [selectedEmailForTest, setSelectedEmailForTest] = useState<string>("")

  useEffect(() => {
    setPermissionStatus(notificationService.getPermissionStatus())
    loadAvailableEmails()
  }, [])

  const loadAvailableEmails = () => {
    try {
      const storedEmails = localStorage.getItem('mailsense-emails')
      if (storedEmails) {
        const emails: Email[] = JSON.parse(storedEmails)
        // Filter for high-priority or important emails
        const priorityEmails = emails.filter(email => 
          email.priority === "high" || email.isImportant
        ).slice(0, 5) // Limit to 5 for dropdown
        setAvailableEmails(priorityEmails)
        if (priorityEmails.length > 0 && !selectedEmailForTest) {
          setSelectedEmailForTest(priorityEmails[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to load emails:', error)
    }
  }

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: any) => {
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)
    notificationService.updatePreferences({ [key]: value })
  }

  const handleQuietHoursChange = (key: "start" | "end" | "enabled", value: any) => {
    const newQuietHours = { ...preferences.quietHours, [key]: value }
    const newPreferences = { ...preferences, quietHours: newQuietHours }
    setPreferences(newPreferences)
    notificationService.updatePreferences({ quietHours: newQuietHours })
  }

  const requestPermission = async () => {
    const granted = await notificationService.requestPermission()
    setPermissionStatus(granted ? "granted" : "denied")
  }

  const sendTestNotification = async () => {
    setWhatsappTestStatus("sending")
    setWhatsappError("")
    setTestNotificationSent(false)

    try {
      if (selectedEmailForTest && availableEmails.length > 0) {
        // Use selected real email
        console.log('[Test] Using real email for test:', selectedEmailForTest)
        await notificationService.triggerNotificationForEmail(selectedEmailForTest)
      } else {
        // Fallback to the service's test function
        console.log('[Test] Using service test notification')
        await notificationService.sendTestNotification()
      }
      
      setTestNotificationSent(true)
      setWhatsappTestStatus("success")
      setTimeout(() => {
        setTestNotificationSent(false)
        setWhatsappTestStatus("idle")
      }, 3000)
    } catch (error: any) {
      console.error("Test notification error:", error)
      setWhatsappTestStatus("error")

      if (error.message?.includes("Daily message limit reached") || error.message?.includes("TRIAL_LIMIT_EXCEEDED")) {
        setWhatsappError(
          "🚨 Twilio trial limit reached. Upgrade to paid account for unlimited messages or wait until tomorrow."
        )
      } else if (error.message?.includes("Rate limit exceeded")) {
        setWhatsappError(
          "⏰ Rate limit exceeded. Please wait a few minutes before sending another test message."
        )
      } else if (error.message?.includes("Twilio configuration missing")) {
        setWhatsappError(
          "Twilio credentials not configured. Please add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER to your environment variables."
        )
      } else if (error.message?.includes("Failed to send WhatsApp notification")) {
        setWhatsappError(
          "Failed to send WhatsApp message. Please check your Twilio configuration and phone number format."
        )
      } else if (error.message?.includes("No emails found")) {
        setWhatsappError(
          "No emails found in storage. Please fetch some emails first, then try testing."
        )
      } else {
        setWhatsappError(error.message || "Test notification failed. Please try again.")
      }

      setTimeout(() => {
        setWhatsappTestStatus("idle")
        setWhatsappError("")
      }, 5000)
    }
  }

  const clearProcessedEmails = () => {
    notificationService.clearProcessedEmails()
    alert('Processed emails cleared. You will now receive notifications for all high-priority emails again.')
  }

  const getPermissionBadge = () => {
    switch (permissionStatus) {
      case "granted":
        return (
          <Badge variant="default" className="bg-green-600 px-3 py-1">
            <Shield className="h-3 w-2 mr-1" />
            Granted
          </Badge>
        )
      case "denied":
        return (
          <Badge variant="destructive" className="px-3 py-1">
            <BellOff className="h-3 w-3 mr-1" />
            Denied
          </Badge>
        )
      case "unsupported":
        return (
          <Badge variant="secondary" className="px-3 py-1">
            <BellOff className="h-3 w-3 mr-1" />
            Unsupported
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="px-3 py-1">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
            Not Requested
          </Badge>
        )
    }
  }

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "")
    if (digits.length > 0 && !value.startsWith("+")) {
      return "+" + digits
    }
    return value
  }

  const handleTestWhatsApp = async () => {
    if (!preferences.whatsappNumber) {
      setWhatsappError("Please enter a valid WhatsApp number")
      return
    }

    setWhatsappTestStatus("sending")
    setWhatsappError("")

    try {
      const response = await fetch('/api/send-twilio-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: preferences.whatsappNumber,
          message: 'This is a test message from MailSense. Your WhatsApp notifications via Twilio are working correctly! 🎉'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send WhatsApp message')
      }

      setWhatsappTestStatus("success")
      setTimeout(() => setWhatsappTestStatus("idle"), 3000)
    } catch (error) {
      console.error('Error sending WhatsApp test via Twilio:', error)
      setWhatsappError(error instanceof Error ? error.message : 'Failed to send test message')
      setWhatsappTestStatus("error")
      setTimeout(() => {
        setWhatsappTestStatus("idle")
        setWhatsappError("")
      }, 5000)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Permission Status */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 text-base sm:text-lg">
            <span className="flex items-center">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
              Notification Permission
            </span>
            {getPermissionBadge()}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Browser permission is required to show desktop notifications for important emails.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {permissionStatus === "unsupported" ? (
            <p className="text-gray-600 text-sm">Your browser does not support desktop notifications.</p>
          ) : permissionStatus === "denied" ? (
            <div className="space-y-3">
              <p className="text-gray-600 text-sm">
                Notifications are blocked. Please enable them in your browser settings.
              </p>
              <Button
                onClick={requestPermission}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto min-h-[44px] bg-transparent"
              >
                Request Permission Again
              </Button>
            </div>
          ) : permissionStatus === "granted" ? (
            <div className="space-y-3">
              <p className="text-green-600 text-sm">Notifications are enabled and working!</p>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <div className="flex-1 flex items-center gap-2">
                  <Button
                    onClick={clearProcessedEmails}
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Notifications
                  </Button>
                  <Button
                    onClick={sendTestNotification}
                    disabled={whatsappTestStatus === 'sending'}
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    {whatsappTestStatus === 'sending' ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Test WhatsApp
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button onClick={requestPermission} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto min-h-[44px]">
              Enable Notifications
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Email Status */}
      {availableEmails.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
              Available High-Priority Emails
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {availableEmails.length} high-priority email(s) available for notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {availableEmails.slice(0, 3).map((email) => (
                <div key={email.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{email.subject}</p>
                    <p className="text-xs text-gray-500 truncate">{email.from}</p>
                  </div>
                  <Badge 
                    variant={email.priority === "high" ? "destructive" : "secondary"} 
                    className={`ml-2 ${email.priority === "high" ? "bg-red-600 text-white" : ""}`}
                  >
                    {email.priority}
                  </Badge>
                </div>
              ))}
              
              <Button
                onClick={clearProcessedEmails}
                variant="ghost"
                size="sm"
                className="w-full text-xs"
              >
                Clear Notification History (Re-enable notifications for all emails)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* WhatsApp Notifications */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center text-base sm:text-lg">
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600 flex-shrink-0" />
            WhatsApp Notifications
            <Badge variant="secondary" className="ml-2 text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Enhanced
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Receive intelligent email summaries via WhatsApp for priority communications.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-4 sm:space-y-6">
          {/* Main Setup Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base flex items-center">
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp Configuration
            </h4>
            
            {/* Step 1: Phone Number */}
            <div className="space-y-3 mb-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="whatsapp-number">WhatsApp Number (Twilio)</Label>
                  <Input
                    id="whatsapp-number"
                    type="tel"
                    placeholder="+1234567890"
                    value={preferences.whatsappNumber}
                    onChange={(e) => handlePreferenceChange("whatsappNumber", e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Include country code (e.g., +1 for US, +44 for UK)
                  </p>
                </div>

                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestWhatsApp}
                    disabled={whatsappTestStatus === "sending" || !preferences.whatsappNumber}
                    className="w-full"
                  >
                    {whatsappTestStatus === "sending" ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Sending Test...
                      </>
                    ) : whatsappTestStatus === "success" ? (
                      <>
                        <MessageCircle className="mr-2 h-4 w-4 text-green-500" />
                        Test Sent via Twilio!
                      </>
                    ) : whatsappTestStatus === "error" ? (
                      <>
                        <MessageCircle className="mr-2 h-4 w-4 text-red-500" />
                        Failed to Send
                      </>
                    ) : (
                      <>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Test WhatsApp
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/send-twilio-sms', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            to: preferences.whatsappNumber,
                            message: 'MailSense SMS Test: Your email notifications are working! Use SMS while applying for WhatsApp Business.'
                          })
                        });
                        const result = await response.json();
                        if (response.ok) {
                          alert('SMS sent successfully! Check your phone.');
                        } else {
                          alert('SMS failed: ' + result.error);
                        }
                      } catch (error) {
                        alert('SMS error: ' + error.message);
                      }
                    }}
                    disabled={!preferences.whatsappNumber}
                    className="w-full"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Test SMS (Works Immediately)
                  </Button>
                </div>
                {whatsappTestStatus === "error" && whatsappError && (
                  <p className="text-sm text-red-500">
                    {whatsappError}
                    {whatsappError.includes('credentials') && (
                      <span className="block mt-1">
                        Please check your Twilio API credentials in the environment variables.
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Step 2: Enable Toggle */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
              <div className="flex-1">
                <Label htmlFor="whatsapp-enabled" className="text-sm font-medium cursor-pointer">
                  Enable WhatsApp Notifications
                </Label>
                <p className="text-xs text-gray-600 mt-1">
                  Activate notifications for priority emails
                </p>
              </div>
              <Switch
                id="whatsapp-enabled"
                checked={preferences.whatsappEnabled}
                onCheckedChange={(checked) => handlePreferenceChange("whatsappEnabled", checked)}
                className="flex-shrink-0"
              />
            </div>

            {/* Status Indicator */}
            <div className="mt-3 p-3 bg-white rounded border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    preferences.whatsappEnabled && preferences.whatsappNumber 
                      ? 'bg-green-500 animate-pulse' 
                      : 'bg-gray-400'
                  }`}></div>
                  <span className="text-xs font-medium">
                    {preferences.whatsappEnabled && preferences.whatsappNumber 
                      ? 'WhatsApp notifications active' 
                      : 'WhatsApp notifications disabled'}
                  </span>
                </div>
                {preferences.whatsappEnabled && preferences.whatsappNumber && (
                  <span className="text-xs text-green-600 font-mono">
                    {preferences.whatsappNumber}
                  </span>
                )}
              </div>
              {preferences.whatsappEnabled && preferences.whatsappNumber && (
                <div className="mt-2 text-xs text-green-700">
                  Monitoring active • Priority emails only
                </div>
              )}
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base flex items-center">
              <Sparkles className="h-4 w-4 mr-1" />
              How MailSense Works
            </h4>
            <div className="space-y-2 text-xs sm:text-sm text-blue-800">
              <div className="flex items-start space-x-2">
                <span className="font-bold text-blue-600">1.</span>
                <span>You receive an email in Gmail</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-bold text-blue-600">2.</span>
                <span>MailSense AI analyzes if it's high-priority (important)</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-bold text-blue-600">3.</span>
                <span>If important, AI creates a smart 2-line summary</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-bold text-blue-600">4.</span>
                <span>You get instant WhatsApp notification with summary</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-bold text-blue-600">5.</span>
                <span>No spam - only truly important emails reach your phone</span>
              </div>
            </div>
          </div>

          {/* Message Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base flex items-center">
              <MessageCircle className="h-4 w-4 mr-1" />
              WhatsApp Message Preview
            </h4>
            <div className="bg-white border rounded-lg p-3 font-mono text-xs shadow-sm">
              <div className="text-green-600 font-bold">🔔 MailSense Alert</div>
              <div className="text-gray-500 italic">High Priority Email</div>
              <div className="my-2 border-t border-gray-200"></div>
              <div><strong>From:</strong> HR Team (company.com)</div>
              <div><strong>Subject:</strong> Interview Confirmation - Software Engineer</div>
              <div className="my-2 border-t border-gray-200"></div>
              <div><strong>AI Summary:</strong></div>
              <div className="text-gray-700">Your final interview is scheduled for tomorrow at 2 PM.</div>
              <div className="text-gray-700">Please prepare technical questions on React and APIs.</div>
              <div className="my-2 border-t border-gray-200"></div>
              <div className="text-gray-500 italic text-xs">Priority: HIGH | Powered by MailSense AI</div>
            </div>
          </div>

          {/* Test Section */}
          {preferences.whatsappEnabled && preferences.whatsappNumber && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-3 text-sm sm:text-base flex items-center">
                <Sparkles className="h-4 w-4 mr-1" />
                Test Your Setup
              </h4>
              
              {availableEmails.length > 0 && (
                <div className="space-y-3 mb-4">
                  <Label className="text-sm font-medium">Select a high-priority email to test with:</Label>
                  <Select value={selectedEmailForTest} onValueChange={setSelectedEmailForTest}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose an email for testing" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEmails.map((email) => (
                        <SelectItem key={email.id} value={email.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{email.subject.substring(0, 50)}...</span>
                            <span className="text-xs text-gray-500">From: {email.from.split('<')[0].trim()}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={sendTestNotification}
                  disabled={testNotificationSent || whatsappTestStatus === "sending"}
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none min-h-[44px] bg-white border-yellow-300 hover:bg-yellow-50"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {whatsappTestStatus === "sending"
                    ? "Sending Test..."
                    : whatsappTestStatus === "success"
                    ? "✅ Test Sent!"
                    : whatsappTestStatus === "error"
                    ? "❌ Test Failed"
                    : "📱 Send Test WhatsApp"}
                </Button>
                
                <Button
                  onClick={loadAvailableEmails}
                  variant="ghost"
                  size="sm"
                  className="min-h-[44px] hover:bg-yellow-50"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>

              <p className="text-xs text-yellow-700 mt-2">
                💡 Test will send a real WhatsApp message to {preferences.whatsappNumber}
              </p>
            </div>
          )}

          {/* Error Display */}
          {whatsappError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-900 mb-2 text-sm flex items-center">
                <MessageCircle className="h-4 w-4 mr-1" />
                WhatsApp Setup Required
              </h4>
              <p className="text-xs sm:text-sm text-red-800 mb-3">{whatsappError}</p>
              
              {whatsappError.includes('WhatsApp Business Account Required') ? (
                <div className="text-xs text-red-700">
                  <strong>WhatsApp Business Account Setup:</strong>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Go to Twilio Console → Messaging → WhatsApp</li>
                    <li>Apply for WhatsApp Business Account</li>
                    <li>Submit business verification documents</li>
                    <li>Wait 1-7 days for approval</li>
                    <li>Update TWILIO_WHATSAPP_NUMBER with verified number</li>
                  </ol>
                  <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                    <strong className="text-blue-800">Temporary Solution:</strong>
                    <p className="text-blue-700">Use SMS notifications while waiting for WhatsApp approval. SMS works immediately!</p>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-red-700">
                  <strong>Common solutions:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Check your phone number format (+1234567890)</li>
                    <li>Ensure Twilio credentials are configured</li>
                    <li>Verify your WhatsApp number is registered</li>
                    <li>Try refreshing and testing again</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Success Message */}
          {whatsappTestStatus === "success" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2 text-sm flex items-center">
                <MessageCircle className="h-4 w-4 mr-1" />
                ✅ Test Successful!
              </h4>
              <p className="text-xs sm:text-sm text-green-800">
                WhatsApp notification sent successfully! Check your phone for the test message.
              </p>
              <p className="text-xs text-green-700 mt-2">
                🎉 Your MailSense setup is working perfectly. You'll now receive WhatsApp alerts for high-priority emails.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Desktop Notification Preferences</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Customize when and how you receive browser notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-4 sm:space-y-6">
          {/* Master Toggle */}
          <div className="flex items-start justify-between space-x-4">
            <div className="flex-1 min-w-0">
              <Label htmlFor="notifications-enabled" className="text-sm sm:text-base font-medium cursor-pointer">
                Enable Desktop Notifications
              </Label>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Turn browser notifications on or off</p>
            </div>
            <Switch
              id="notifications-enabled"
              checked={preferences.enabled}
              onCheckedChange={(checked) => handlePreferenceChange("enabled", checked)}
              className="flex-shrink-0"
            />
          </div>

          {preferences.enabled && (
            <>
              {/* High Priority Only */}
              <div className="flex items-start justify-between space-x-4">
                <div className="flex-1 min-w-0">
                  <Label htmlFor="high-priority-only" className="text-sm sm:text-base font-medium cursor-pointer">
                    High Priority Only
                  </Label>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Only notify for AI-classified high priority emails
                  </p>
                </div>
                <Switch
                  id="high-priority-only"
                  checked={preferences.highPriorityOnly}
                  onCheckedChange={(checked) => handlePreferenceChange("highPriorityOnly", checked)}
                  className="flex-shrink-0"
                />
              </div>

              {/* Desktop Notifications */}
              <div className="flex items-start justify-between space-x-4">
                <div className="flex-1 min-w-0">
                  <Label htmlFor="desktop-enabled" className="text-sm sm:text-base font-medium cursor-pointer">
                    Desktop Notifications
                  </Label>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Show browser notifications</p>
                </div>
                <Switch
                  id="desktop-enabled"
                  checked={preferences.desktopEnabled}
                  onCheckedChange={(checked) => handlePreferenceChange("desktopEnabled", checked)}
                  className="flex-shrink-0"
                />
              </div>

              {/* Sound */}
              <div className="flex items-start justify-between space-x-4">
                <div className="flex items-start flex-1 min-w-0">
                  {preferences.soundEnabled ? (
                    <Volume2 className="h-4 w-4 mr-2 text-blue-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <VolumeX className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <Label htmlFor="sound-enabled" className="text-sm sm:text-base font-medium cursor-pointer">
                      Notification Sound
                    </Label>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Play sound with notifications</p>
                  </div>
                </div>
                <Switch
                  id="sound-enabled"
                  checked={preferences.soundEnabled}
                  onCheckedChange={(checked) => handlePreferenceChange("soundEnabled", checked)}
                  className="flex-shrink-0"
                />
              </div>

              {/* Quiet Hours */}
              <div className="space-y-4">
                <div className="flex items-start justify-between space-x-4">
                  <div className="flex items-start flex-1 min-w-0">
                    <Clock className="h-4 w-4 mr-2 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <Label htmlFor="quiet-hours-enabled" className="text-sm sm:text-base font-medium cursor-pointer">
                        Quiet Hours
                      </Label>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        Pause desktop notifications during specified hours (WhatsApp alerts for high priority emails
                        will still be sent)
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="quiet-hours-enabled"
                    checked={preferences.quietHours.enabled}
                    onCheckedChange={(checked) => handleQuietHoursChange("enabled", checked)}
                    className="flex-shrink-0"
                  />
                </div>

                {preferences.quietHours.enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-0 sm:ml-6">
                    <div>
                      <Label htmlFor="quiet-start" className="text-sm font-medium">
                        Start Time
                      </Label>
                      <Input
                        id="quiet-start"
                        type="time"
                        value={preferences.quietHours.start}
                        onChange={(e) => handleQuietHoursChange("start", e.target.value)}
                        className="mt-2 h-12 text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quiet-end" className="text-sm font-medium">
                        End Time
                      </Label>
                      <Input
                        id="quiet-end"
                        type="time"
                        value={preferences.quietHours.end}
                        onChange={(e) => handleQuietHoursChange("end", e.target.value)}
                        className="mt-2 h-12 text-base"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
