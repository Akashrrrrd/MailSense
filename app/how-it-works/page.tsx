"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Mail,
  Shield,
  Brain,
  MessageCircle,
  Lock,
  Eye,
  CheckCircle,
  Database,
  Clock,
  AlertTriangle,
  Smartphone,
  Server
} from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">

        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <Link href="/" className="inline-block mb-8">
            <Button variant="outline" className="bg-white hover:bg-gray-50 border-gray-200 shadow-sm">
              ← Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            How MailSense Works
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Professional email summarization delivered to WhatsApp in four simple steps
          </p>
        </div>

        {/* Security Promise */}
        <Card className="mb-12 border-gray-200 bg-gray-50">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Security & Privacy</h2>
            <p className="text-gray-700 text-lg mb-4">
              Enterprise-grade security with real-time processing and zero data storage
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge className="bg-gray-100 text-gray-800 px-3 py-1">
                <Lock className="h-4 w-4 mr-1" />
                Zero Storage
              </Badge>
              <Badge className="bg-gray-100 text-gray-800 px-3 py-1">
                <Eye className="h-4 w-4 mr-1" />
                Read-Only
              </Badge>
              <Badge className="bg-gray-100 text-gray-800 px-3 py-1">
                <Database className="h-4 w-4 mr-1" />
                Auto-Cleanup
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Step-by-Step Process */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            How It Works
          </h2>

          <div className="space-y-6">

            {/* Step 1: Authentication */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 text-sm">
                    1
                  </div>
                  <Shield className="h-6 w-6 text-blue-600 mr-3" />
                  Secure Authentication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">What Happens:</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        You click "Sign in with Google"
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Google OAuth handles authentication
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        You grant read-only Gmail permissions
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Secure access token is created
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-gray-800">Security Features:</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Enterprise OAuth 2.0</li>
                      <li>• Read-only permissions</li>
                      <li>• No credential storage</li>
                      <li>• Revocable access</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Email Fetching */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 text-sm">
                    2
                  </div>
                  <Mail className="h-6 w-6 text-blue-600 mr-3" />
                  Smart Email Fetching
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">What Happens:</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Connects to Gmail API securely
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Fetches unread emails only
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Processes 50 most recent emails
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Extracts metadata (sender, subject, date)
                      </li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-blue-800">Privacy Protection:</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Email content processed in real-time</li>
                      <li>• No full email storage</li>
                      <li>• Only metadata cached temporarily</li>
                      <li>• Cache expires in 2 minutes</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 3: AI Classification */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 text-sm">
                    3
                  </div>
                  <Brain className="h-6 w-6 text-blue-600 mr-3" />
                  AI-Powered Classification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">What Happens:</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        AI analyzes sender, subject, and content
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Detects urgency and importance patterns
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Classifies as High/Medium/Low priority
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Filters out spam and promotions
                      </li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-gray-800">AI Capabilities:</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Advanced classification</li>
                      <li>• Priority detection</li>
                      <li>• Context awareness</li>
                      <li>• Time-sensitive recognition</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 4: WhatsApp Notifications */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 text-sm">
                    4
                  </div>
                  <MessageCircle className="h-6 w-6 text-blue-600 mr-3" />
                  Smart WhatsApp Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">What Happens:</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Only high-priority emails trigger alerts
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        AI creates 2-line smart summary
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        WhatsApp message sent instantly
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        No spam from social/promotional emails
                      </li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-gray-800">Message Format:</h4>
                    <div className="text-xs font-mono bg-white p-3 rounded border">
                      <div className="text-blue-600 font-bold">From: HR Team (company)</div>
                      <div className="text-gray-600">Subject: Interview Confirmation</div>
                      <div className="text-gray-600">Received: 5m ago</div>
                      <div className="mt-2 text-gray-800">
                        <div className="font-semibold">Summary:</div>
                        <div>Your final interview is tomorrow at 2 PM</div>
                        <div>Please prepare technical questions</div>
                      </div>
                      <div className="text-gray-500 text-xs mt-2">MailSense Professional</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Technical Architecture */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Technical Architecture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">

              {/* Your Device */}
              <div className="text-center">
                <div className="bg-blue-100 p-6 rounded-lg mb-4">
                  <Smartphone className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold">Your Device</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Secure browser connection</li>
                  <li>• Google OAuth authentication</li>
                  <li>• WhatsApp notifications</li>
                  <li>• Local data caching only</li>
                </ul>
              </div>

              {/* MailSense Servers */}
              <div className="text-center">
                <div className="bg-green-100 p-6 rounded-lg mb-4">
                  <Server className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold">MailSense Servers</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Real-time email processing</li>
                  <li>• AI classification engine</li>
                  <li>• WhatsApp message delivery</li>
                  <li>• Zero email storage</li>
                </ul>
              </div>

              {/* Gmail API */}
              <div className="text-center">
                <div className="bg-purple-100 p-6 rounded-lg mb-4">
                  <Mail className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold">Gmail API</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Secure API connection</li>
                  <li>• Read-only access</li>
                  <li>• Real-time email fetching</li>
                  <li>• Google's security standards</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start space-x-3">
                <Database className="h-6 w-6 text-gray-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Data Protection</h4>
                  <ul className="text-gray-700 text-sm mt-2 space-y-1">
                    <li>• No email content storage</li>
                    <li>• No private message access</li>
                    <li>• No third-party data sharing</li>
                    <li>• No advertising data mining</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Frequency & Performance */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                Check Frequency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">WhatsApp Disabled</span>
                  <Badge variant="outline">Every 2 minutes</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span className="font-medium">WhatsApp Enabled</span>
                  <Badge className="bg-green-600">Every 1 minute</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <span className="font-medium">Tab Inactive</span>
                  <Badge variant="secondary">Background checks</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                Performance Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Smart caching prevents unnecessary API calls</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Instant page navigation between Dashboard/Settings</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Background processing when tab is inactive</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Automatic cleanup of old cached data</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* User Control */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">You're Always in Control</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">

              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <Shield className="h-5 w-5 text-green-600 mr-2" />
                  Privacy Controls
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Revoke Access Anytime</div>
                      <div className="text-sm text-gray-600">Go to Google Account settings → Security → Third-party apps</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">View Cached Data</div>
                      <div className="text-sm text-gray-600">See exactly what metadata is temporarily stored</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Clear All Data</div>
                      <div className="text-sm text-gray-600">One-click deletion of all cached information</div>
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <MessageCircle className="h-5 w-5 text-blue-600 mr-2" />
                  Notification Controls
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Enable/Disable WhatsApp</div>
                      <div className="text-sm text-gray-600">Toggle notifications on/off anytime</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Change Phone Number</div>
                      <div className="text-sm text-gray-600">Update WhatsApp number in settings</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Test Notifications</div>
                      <div className="text-sm text-gray-600">Send test messages to verify setup</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="text-center bg-gray-50 border-gray-200">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Get Started with MailSense
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Professional email summarization for business users
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Mail className="mr-2 h-5 w-5" />
                  Connect Gmail Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/privacy">
                <Button variant="outline" size="lg" className="bg-white">
                  Privacy Policy
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}