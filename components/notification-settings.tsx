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

      if (error.message?.includes("Twilio credentials not configured")) {
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
            <Shield className="h-3 w-3 mr-1" />
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
              
              {/* Test Email Selection */}
              {availableEmails.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Test with Real Email:</Label>
                  <Select value={selectedEmailForTest} onValueChange={setSelectedEmailForTest}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an email to test with" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEmails.map((email) => (
                        <SelectItem key={email.id} value={email.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{email.subject.substring(0, 50)}...</span>
                            <span className="text-xs text-gray-500">{email.from}</span>
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
                  className="flex-1 sm:flex-none min-h-[44px] bg-transparent flex items-center"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {whatsappTestStatus === "sending"
                    ? "Testing AI..."
                    : whatsappTestStatus === "success"
                    ? "AI Test Sent!"
                    : whatsappTestStatus === "error"
                    ? "Test Failed"
                    : testNotificationSent
                    ? "Test Sent!"
                    : availableEmails.length > 0
                    ? "Test with Real Email"
                    : "Test AI Notifications"}
                </Button>
                
                <Button
                  onClick={loadAvailableEmails}
                  variant="ghost"
                  size="sm"
                  className="min-h-[44px] flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh Emails
                </Button>
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
                  <Badge variant={email.priority === "high" ? "default" : "secondary"} className="ml-2">
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
            AI-Powered WhatsApp Notifications
            <Badge variant="secondary" className="ml-2 text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Enhanced
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Receive ONLY high-priority email alerts (Gmail's important emails) with AI-generated summaries directly on
            your WhatsApp instantly.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-4 sm:space-y-6">
          {/* WhatsApp Toggle */}
          <div className="flex items-start justify-between space-x-4">
            <div className="flex-1 min-w-0">
              <Label htmlFor="whatsapp-enabled" className="text-sm sm:text-base font-medium cursor-pointer">
                Enable AI WhatsApp Alerts
              </Label>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Send instant WhatsApp notifications with AI-generated 2-line summaries for high-priority emails only
              </p>
            </div>
            <Switch
              id="whatsapp-enabled"
              checked={preferences.whatsappEnabled}
              onCheckedChange={(checked) => handlePreferenceChange("whatsappEnabled", checked)}
              className="flex-shrink-0"
            />
          </div>

          {preferences.whatsappEnabled && (
            <>
              {/* Phone Number Input */}
              <div className="space-y-3">
                <Label htmlFor="whatsapp-number" className="text-sm font-medium flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  WhatsApp Number
                </Label>
                <Input
                  id="whatsapp-number"
                  type="tel"
                  placeholder="+919655667171"
                  value={preferences.whatsappNumber}
                  onChange={(e) => handlePreferenceChange("whatsappNumber", formatPhoneNumber(e.target.value))}
                  className="font-mono h-12 text-base"
                />
                <p className="text-xs text-gray-500">Include country code (e.g., +1 for US, +91 for India)</p>
              </div>

              {/* AI Features Info */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2 text-sm sm:text-base flex items-center">
                  <Sparkles className="h-4 w-4 mr-1" />
                  AI-Enhanced WhatsApp Messages
                </h4>
                <ul className="text-xs sm:text-sm text-purple-800 space-y-1">
                  <li>• AI analyzes email content and creates intelligent 2-line summaries</li>
                  <li>• Professional message format: MailSense → From → Subject → AI Summary</li>
                  <li>• Only HIGH priority emails (Gmail's important emails) trigger notifications</li>
                  <li>• Instant delivery when important emails arrive in your Gmail</li>
                  <li>• No spam from social media, promotions, or low-priority emails</li>
                </ul>
              </div>

              {/* WhatsApp Behavior Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2 text-sm sm:text-base flex items-center">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message Format Preview
                </h4>
                <div className="bg-white border rounded-lg p-3 font-mono text-xs">
                  <div className="text-green-600 font-bold">*MailSense*</div>
                  <div className="text-gray-500 italic">_Business Account_</div>
                  <br />
                  <div>
                    <strong>From:</strong> TechCorp
                  </div>
                  <div>
                    <strong>Sub:</strong> Final HR Interview - Software Engineer
                  </div>
                  <br />
                  <div>
                    <strong>Content:</strong>
                  </div>
                  <div>Final interview scheduled for tomorrow at 2 PM</div>
                  <div>Prepare for technical questions on React and Node.js</div>
                  <br />
                  <div className="text-gray-500 italic">_Priority: HIGH_</div>
                </div>
              </div>

              {/* Setup Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Required Environment Variables</h4>
                <p className="text-xs sm:text-sm text-blue-800 mb-3">
                  Add these to your Vercel project for full functionality:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-blue-900 mb-1">Twilio WhatsApp:</p>
                    <ul className="text-xs text-blue-700 space-y-1 font-mono">
                      <li>• TWILIO_ACCOUNT_SID</li>
                      <li>• TWILIO_AUTH_TOKEN</li>
                      <li>• TWILIO_WHATSAPP_NUMBER</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-900 mb-1">AI Summarization:</p>
                    <ul className="text-xs text-blue-700 space-y-1 font-mono">
                      <li>• PERPLEXITY_API_KEY</li>
                    </ul>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-3">
                  Get Twilio credentials from Twilio Console → WhatsApp → Senders
                  <br />
                  Get Perplexity API key from perplexity.ai → Settings → API
                </p>
              </div>

              {/* WhatsApp Test Error Display */}
              {whatsappError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-red-900 mb-2 text-sm flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    AI WhatsApp Test Failed
                  </h4>
                  <p className="text-xs sm:text-sm text-red-800">{whatsappError}</p>
                </div>
              )}
            </>
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
