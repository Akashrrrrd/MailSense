"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { AuthGuard } from "@/components/auth-guard"
import { PrivacyBadge } from "@/components/privacy-badge"
import { SecurityFAQ } from "@/components/security-faq"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Brain, Shield, Zap, ArrowRight, Lock, Eye } from "lucide-react"

export default function HomePage() {
  const { login, loading, error } = useAuth()

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Section */}
            <div className="mb-8 sm:mb-12">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
                Mail<span className="text-blue-600">Sense</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto px-4 sm:px-0">
                AI-powered email intelligence with privacy-first design. Your emails stay in Gmail, always.
              </p>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-4 mb-6 sm:mb-8">
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-full border border-green-200">
                  <Lock className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">No Email Storage</span>
                </div>
                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-full border border-blue-200">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Google OAuth Secure</span>
                </div>
                <div className="flex items-center space-x-2 bg-purple-50 px-3 py-2 rounded-full border border-purple-200">
                  <Eye className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Read-Only Access</span>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <Brain className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
                  <CardTitle className="text-lg sm:text-xl">AI Classification</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm sm:text-base">
                    Advanced AI algorithms automatically prioritize your emails with 94% accuracy.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 mx-auto mb-3 sm:mb-4" />
                  <CardTitle className="text-lg sm:text-xl">Privacy-First Security</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm sm:text-base">
                    Zero email storage. Google OAuth security. Read-only access. Your emails never leave Gmail.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow sm:col-span-2 lg:col-span-1">
                <CardHeader className="pb-4">
                  <Zap className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-600 mx-auto mb-3 sm:mb-4" />
                  <CardTitle className="text-lg sm:text-xl">Smart Notifications</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm sm:text-base">
                    Get notified only about high-priority emails that truly matter to you.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Privacy Badge */}
            <div className="mb-8">
              <PrivacyBadge />
            </div>

            {/* CTA Section */}
            <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur mb-8">
              <CardContent className="p-6 sm:p-8 lg:p-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Ready to Transform Your Email Experience?
                </h2>
                <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg px-2 sm:px-0">
                  Connect securely with Google OAuth. Your emails are processed in real-time and never stored.
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 mx-2 sm:mx-0">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  onClick={login}
                  disabled={loading}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto min-h-[48px]"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Shield className="mr-2 h-5 w-5" />
                  )}
                  {loading ? "Connecting Securely..." : "Secure Sign-in with Google"}
                  {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                </Button>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                  <p className="text-xs sm:text-sm text-gray-500">
                    🔒 Read-only access • No email storage • Revoke anytime
                  </p>
                  <Link href="/how-it-works">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      How It Works →
                    </Button>
                  </Link>
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
