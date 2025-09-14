"use client"

import { useAuth } from "@/hooks/use-auth"
import { useAIAssistant } from "@/hooks/use-ai-assistant"
import { AuthGuard } from "@/components/auth-guard"
import { NotificationSettings } from "@/components/notification-settings"
import { Navigation } from "@/components/navigation"
import { AIAssistant } from "@/components/ai-assistant"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Settings, User, Bell } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { emails, showAIAssistant, toggleAIAssistant, isAvailable } = useAIAssistant()

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Container with proper max-width and centering */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          
          {/* Header Section */}
          <div className="mb-8 lg:mb-10">
            <div className="flex flex-col space-y-4 sm:space-y-6">
              
              {/* Top Navigation Bar */}
              <div className="flex items-center justify-between">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50 border-gray-200">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
                
                <div className="flex items-center space-x-4">
                  <div className="hidden sm:block">
                    <Navigation />
                  </div>
                  <Button onClick={logout} variant="outline" size="sm" className="bg-white hover:bg-gray-50 border-gray-200">
                    Sign Out
                  </Button>
                </div>
              </div>

              {/* Page Title */}
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                  <img 
                    src="/logo.png" 
                    alt="MailSense Logo" 
                    className="h-7 w-7 sm:h-8 sm:w-8 mr-3 flex-shrink-0"
                  />
                  MailSense Settings
                </h1>
                <p className="text-base text-gray-600 max-w-2xl">
                  Manage your MailSense preferences and notifications
                </p>
              </div>

              {/* Mobile Navigation */}
              <div className="sm:hidden">
                <Navigation />
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Settings Content - Takes up 2/3 on desktop */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <NotificationSettings />
            </div>

            {/* Sidebar - Takes up 1/3 on desktop */}
            <div className="space-y-6 order-1 lg:order-2">
              
              {/* User Profile Card */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Account</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center space-x-4 mb-6">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-12 h-12 rounded-full border-2 border-gray-100 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 text-white" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{user?.displayName}</p>
                      <p className="text-sm text-gray-600 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full bg-white hover:bg-gray-50 border-gray-200">
                    <User className="h-4 w-4 mr-2" />
                    Manage Google Account
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Settings Card */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0" />
                    Quick Settings
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Common notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-700">Current Status:</span>
                      <span className="text-sm text-gray-600 text-right">Notifications enabled for high priority emails</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-700">Quiet Hours:</span>
                      <span className="text-sm text-gray-600">10:00 PM - 8:00 AM</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-700">Processing Status:</span>
                      <span className="text-sm text-green-600 font-medium">Active and monitoring</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* AI Assistant */}
        {isAvailable && (
          <AIAssistant 
            emails={emails}
            isVisible={showAIAssistant}
            onToggle={toggleAIAssistant}
          />
        )}
      </div>
    </AuthGuard>
  )
}
