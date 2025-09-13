"use client"

import { Shield, Lock, Eye, Server } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function PrivacyBadge() {
  return (
    <Card className="border-gray-200 bg-gray-50">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-6 w-6 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Security & Privacy</h3>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Enterprise Grade
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-3">
            <Eye className="h-4 w-4 text-gray-600" />
            <span className="text-gray-700">Read-only access</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Server className="h-4 w-4 text-gray-600" />
            <span className="text-gray-700">Zero data storage</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Lock className="h-4 w-4 text-gray-600" />
            <span className="text-gray-700">Google OAuth</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Shield className="h-4 w-4 text-gray-600" />
            <span className="text-gray-700">Revocable access</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            Real-time processing with no persistent data storage
          </p>
        </div>
      </CardContent>
    </Card>
  )
}