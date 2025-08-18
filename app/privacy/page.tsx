"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, Eye, Trash2, Clock, ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Your privacy is our priority. Here's exactly how we protect your data.
          </p>
          <div className="flex justify-center">
            <Link href="/">
              <Button variant="outline" className="bg-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Privacy Principles */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          <Card className="text-center border-green-200 bg-green-50">
            <CardContent className="p-6">
              <Trash2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-bold text-green-900 mb-2">Zero Storage</h3>
              <p className="text-sm text-green-800">
                We never store your email content on our servers
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <Eye className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-bold text-blue-900 mb-2">Read-Only</h3>
              <p className="text-sm text-blue-800">
                Only read permissions, cannot send or delete emails
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-purple-200 bg-purple-50">
            <CardContent className="p-6">
              <Lock className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-bold text-purple-900 mb-2">Encrypted</h3>
              <p className="text-sm text-purple-800">
                All connections use HTTPS encryption
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <Clock className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="font-bold text-orange-900 mb-2">Auto-Delete</h3>
              <p className="text-sm text-orange-800">
                Cached data automatically deleted after 2 minutes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Privacy Policy */}
        <div className="space-y-8">
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-6 w-6 text-blue-600 mr-3" />
                What Data We Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-green-800 mb-2">✅ What We DO Access:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Email metadata (sender, subject, date, read status)</li>
                  <li>• Gmail labels and importance flags</li>
                  <li>• Email content for real-time AI classification only</li>
                  <li>• Your Google account profile (name, email, photo)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-red-800 mb-2">❌ What We DON'T Access:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Your Google Drive, Calendar, or other services</li>
                  <li>• Ability to send emails on your behalf</li>
                  <li>• Ability to delete or modify your emails</li>
                  <li>• Your contacts or personal information beyond email</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trash2 className="h-6 w-6 text-green-600 mr-3" />
                Data Storage & Retention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Email Content:</h4>
                <p className="text-gray-700 mb-2">
                  <strong>Never stored.</strong> Email content is processed in real-time for AI classification and immediately discarded.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Email Metadata:</h4>
                <p className="text-gray-700 mb-2">
                  Temporarily cached in your browser for 2 minutes to improve performance. Automatically deleted after expiration.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Account Information:</h4>
                <p className="text-gray-700 mb-2">
                  Your Google account profile information is stored only while you're signed in. Deleted when you sign out.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-6 w-6 text-purple-600 mr-3" />
                Security Measures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Technical Security:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• HTTPS encryption for all connections</li>
                    <li>• Google OAuth 2.0 authentication</li>
                    <li>• No server-side email storage</li>
                    <li>• Automatic token expiration</li>
                    <li>• Regular security updates</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Access Controls:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Read-only Gmail permissions</li>
                    <li>• User-controlled access revocation</li>
                    <li>• No third-party data sharing</li>
                    <li>• Minimal permission requests</li>
                    <li>• Transparent permission explanations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Rights & Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Revoke Access:</h4>
                  <p className="text-gray-700">
                    You can revoke MailSense's access to your Gmail at any time through your 
                    <a href="https://myaccount.google.com/permissions" className="text-blue-600 underline ml-1" target="_blank" rel="noopener noreferrer">
                      Google Account settings
                    </a>. 
                    All cached data will be automatically deleted.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Data Deletion:</h4>
                  <p className="text-gray-700">
                    Since we don't store your email content, there's no data to delete. Any temporarily cached metadata 
                    is automatically deleted after 2 minutes or when you revoke access.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Contact Us:</h4>
                  <p className="text-gray-700">
                    For privacy questions or concerns, contact us at: 
                    <a href="mailto:privacy@mailsense.com" className="text-blue-600 underline ml-1">
                      privacy@mailsense.com
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Google Services:</h4>
                  <p className="text-gray-700">
                    MailSense uses Google's Gmail API and Firebase Authentication. These services are governed by 
                    <a href="https://policies.google.com/privacy" className="text-blue-600 underline ml-1" target="_blank" rel="noopener noreferrer">
                      Google's Privacy Policy
                    </a>.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">AI Processing:</h4>
                  <p className="text-gray-700">
                    Email summaries are generated using Perplexity AI. Only email content (not personal information) 
                    is sent for processing and is not stored by the AI service.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">WhatsApp Messaging:</h4>
                  <p className="text-gray-700">
                    WhatsApp notifications are sent through Twilio's messaging service. Only the notification content 
                    (not your email data) is transmitted.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Updates to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We may update this privacy policy from time to time. Any changes will be posted on this page with 
                an updated revision date. We encourage you to review this policy periodically.
              </p>
              <p className="text-gray-600 text-sm mt-4">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Card className="mt-12 text-center bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Questions About Privacy?
            </h2>
            <p className="text-gray-600 mb-6">
              We're committed to transparency. Contact us anytime with privacy questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:privacy@mailsense.com">
                <Button className="bg-green-600 hover:bg-green-700">
                  Contact Privacy Team
                </Button>
              </a>
              <Link href="/how-it-works">
                <Button variant="outline" className="bg-white">
                  How It Works
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}