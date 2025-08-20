"use client"

import { useAuth } from "@/hooks/use-auth"
import { AuthGuard } from "@/components/auth-guard"
import { NotificationSettings } from "@/components/notification-settings"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Settings, User, Bell } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const { user, logout } = useAuth()

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-full max-w-[100vw] overflow-x-hidden px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          {/* Header */}
          <div className="flex flex-col space-y-4 sm:space-y-0 mb-6 sm:mb-8">
            <div className="flex flex-col space-y-3 w-full">
              <div className="w-full flex justify-between items-center">
                <Link href="/dashboard" className="w-auto">
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Back to Dashboard</span>
                  </Button>
                </Link>
                <div className="sm:hidden">
                  <Navigation />
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
                  <Settings className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                  <span className="truncate">Settings</span>
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Manage your MailSense preferences and notifications
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center justify-between w-full">
              <div className="flex-1">
                <Navigation />
              </div>
              <Button onClick={logout} variant="outline" size="sm" className="bg-transparent">
                Sign Out
              </Button>
            </div>
          </div>


          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 -mx-2 sm:mx-0">
            {/* Settings Content */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <NotificationSettings />
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
              {/* User Profile */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg">Account</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL || "/placeholder.svg"}
                        alt="Profile"
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base truncate">{user?.displayName}</p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full bg-transparent min-h-[36px]">
                    <User className="h-4 w-4 mr-2" />
                    <span className="text-xs sm:text-sm">Manage Google Account</span>
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Settings */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                    <span className="truncate">Quick Settings</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Common notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-2 sm:space-y-3">
                  <div className="text-xs sm:text-sm">
                    <p className="font-medium mb-1">Current Status:</p>
                    <p className="text-gray-600">Notifications enabled for high priority emails</p>
                  </div>
                  <div className="text-xs sm:text-sm">
                    <p className="font-medium mb-1">Quiet Hours:</p>
                    <p className="text-gray-600">10:00 PM - 8:00 AM</p>
                  </div>
                  <div className="text-xs sm:text-sm">
                    <p className="font-medium mb-1">AI Classification:</p>
                    <p className="text-gray-600">94% accuracy rate</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
