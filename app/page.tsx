"use client"

import { useAuth } from "@/hooks/use-auth"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Brain, Shield, Zap, ArrowRight } from "lucide-react"

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
              <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 sm:px-0">
                Transform your Gmail experience with AI-powered email intelligence. Never miss important emails again.
              </p>
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
                  <CardTitle className="text-lg sm:text-xl">Secure Integration</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm sm:text-base">
                    Direct Gmail API integration with Google OAuth. Your data stays secure and private.
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

            {/* CTA Section */}
            <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur">
              <CardContent className="p-6 sm:p-8 lg:p-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Ready to Transform Your Email Experience?
                </h2>
                <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg px-2 sm:px-0">
                  Connect your Google Workspace account and start experiencing intelligent email management today.
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
                    <Mail className="mr-2 h-5 w-5" />
                  )}
                  {loading ? "Connecting..." : "Sign in with Google"}
                  {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                </Button>

                <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                  Secure authentication powered by Google OAuth
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
