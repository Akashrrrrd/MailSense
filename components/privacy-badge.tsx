"use client"

import { Shield, Lock, Eye, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function PrivacyBadge() {
  return (
    <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Shield className="h-6 w-6 text-green-600" />
          <h3 className="font-semibold text-green-900">Privacy-First Design</h3>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Zero Storage
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4 text-green-600" />
            <span className="text-green-800">Read-only Gmail access</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Trash2 className="h-4 w-4 text-green-600" />
            <span className="text-green-800">No email storage ever</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4 text-green-600" />
            <span className="text-green-800">Google OAuth security</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-green-800">Revoke access anytime</span>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-green-200">
          <p className="text-xs text-green-700">
            ✅ Your emails are processed in real-time and never stored on our servers
          </p>
        </div>
      </CardContent>
    </Card>
  )
}