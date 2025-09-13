"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { AuthGuard } from "@/components/auth-guard"
import { PrivacyBadge } from "@/components/privacy-badge"
import { SecurityFAQ } from "@/components/security-faq"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Brain, Shield, MessageCircle, ArrowRight, Lock, Eye } from "lucide-react"

export default function HomePage() {
  const { login, loading, error } = useAuth()

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Section */}
            <div className="mb-8 sm:mb-12">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
                Mail<span className="text-blue-600">Sense</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto px-4 sm:px-0">
                Professional email summarization with AI-powered insights delivered directly to WhatsApp.
              </p>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-4 mb-6 sm:mb-8">
                <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                  <Lock className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Secure Processing</span>
                </div>
                <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                  <Shield className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Enterprise Security</span>
                </div>
                <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                  <Eye className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Read-Only Access</span>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <Card className="border border-gray-200 hover:border-gray-300 transition-colors">
                <CardHeader className="pb-4">
                  <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle className="text-xl">AI Summarization</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600">
                    Advanced AI processes your emails and delivers concise, actionable summaries.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 hover:border-gray-300 transition-colors">
                <CardHeader className="pb-4">
                  <MessageCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <CardTitle className="text-xl">WhatsApp Delivery</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600">
                    Receive intelligent email summaries directly on WhatsApp for instant access.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 hover:border-gray-300 transition-colors sm:col-span-2 lg:col-span-1">
                <CardHeader className="pb-4">
                  <Shield className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <CardTitle className="text-xl">Enterprise Security</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600">
                    Bank-level security with Google OAuth and zero data storage architecture.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Privacy Badge */}
            <div className="mb-8">
              <PrivacyBadge />
            </div>

            {/* CTA Section */}
            <Card className="border border-gray-200 bg-white mb-8">
              <CardContent className="p-8 lg:p-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Get Started with MailSense
                </h2>
                <p className="text-gray-600 mb-8 text-lg">
                  Connect your Gmail account to start receiving AI-powered email summaries on WhatsApp.
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  onClick={login}
                  disabled={loading}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg min-h-[48px]"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Mail className="mr-2 h-5 w-5" />
                  )}
                  {loading ? "Connecting..." : "Connect Gmail Account"}
                  {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                </Button>

                <div className="flex items-center justify-center gap-6 mt-6">
                  <p className="text-sm text-gray-500">
                    Read-only access • Secure processing • Revoke anytime
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Security FAQ */}
            <SecurityFAQ />
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
