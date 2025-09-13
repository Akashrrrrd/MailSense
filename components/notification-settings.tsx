"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageCircle, RefreshCw } from "lucide-react"
import { notificationService, type NotificationPreferences } from "@/lib/notification-service"

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(notificationService.getPreferences())
  const [whatsappTestStatus, setWhatsappTestStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
  const [whatsappError, setWhatsappError] = useState<string>("")

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: any) => {
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)
    notificationService.updatePreferences({ [key]: value })
  }

  const handleTestWhatsApp = async () => {
    if (!preferences.whatsappNumber) {
      setWhatsappError("Please enter your WhatsApp number")
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
          message: '*MailSense Test Message*\n\nYour WhatsApp notifications are working correctly!\n\nYou will now receive professional email alerts for high-priority messages.\n\nPowered by MailSense AI'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send WhatsApp message')
      }

      setWhatsappTestStatus("success")
      setTimeout(() => setWhatsappTestStatus("idle"), 3000)
    } catch (error) {
      console.error('Error sending WhatsApp test:', error)
      setWhatsappError(error instanceof Error ? error.message : 'Failed to send test message')
      setWhatsappTestStatus("error")
      setTimeout(() => {
        setWhatsappTestStatus("idle")
        setWhatsappError("")
      }, 5000)
    }
  }

  return (
    <div className="space-y-6">
      {/* WhatsApp Notifications */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
            <MessageCircle className="h-6 w-6 mr-3 text-green-600" />
            WhatsApp Notifications
          </CardTitle>
          <CardDescription className="text-base text-gray-600 mt-2">
            Get instant alerts for high-priority emails only
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Quick Setup Guide */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
              Quick Setup
            </h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <p className="text-sm text-gray-700">
                  Save <code className="bg-white px-2 py-1 rounded border text-blue-600 font-mono">+14155238886</code> as "MailSense" in your contacts
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <p className="text-sm text-gray-700">
                  Send <code className="bg-white px-2 py-1 rounded border text-blue-600 font-mono">join spin-order</code> to that number on WhatsApp
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <p className="text-sm text-gray-700">
                  Enter your WhatsApp number below and test the connection
                </p>
              </div>
            </div>
          </div>

          {/* Configuration Section */}
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="whatsapp-number" className="text-sm font-medium text-gray-700">
                Your WhatsApp Number
              </Label>
              <Input
                id="whatsapp-number"
                type="tel"
                placeholder="+919876543210"
                value={preferences.whatsappNumber}
                onChange={(e) => handlePreferenceChange("whatsappNumber", e.target.value)}
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">Include country code (e.g., +91 for India, +1 for US)</p>
            </div>

            <Button
              onClick={handleTestWhatsApp}
              disabled={whatsappTestStatus === "sending" || !preferences.whatsappNumber}
              className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-medium"
            >
              {whatsappTestStatus === "sending" ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection...
                </>
              ) : whatsappTestStatus === "success" ? (
                <>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  ✓ Connection Working!
                </>
              ) : whatsappTestStatus === "error" ? (
                <>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Try Again
                </>
              ) : (
                <>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Test WhatsApp Connection
                </>
              )}
            </Button>

            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Switch
                  checked={preferences.whatsappEnabled}
                  onCheckedChange={(checked) => handlePreferenceChange("whatsappEnabled", checked)}
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Enable WhatsApp Alerts</span>
                  <p className="text-xs text-gray-600">Receive notifications for high-priority emails</p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                preferences.whatsappEnabled && preferences.whatsappNumber 
                  ? 'bg-green-500' 
                  : 'bg-gray-400'
              }`}></div>
            </div>

            {/* Status Messages */}
            {preferences.whatsappEnabled && preferences.whatsappNumber && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <p className="text-sm text-green-800 font-medium">
                      ✓ WhatsApp notifications active - High priority emails will be sent instantly
                    </p>
                  </div>
                  <p className="text-xs text-green-600">
                    {notificationService.getWhatsAppSentCount()} sent today
                  </p>
                </div>
              </div>
            )}

            {whatsappError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{whatsappError}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}