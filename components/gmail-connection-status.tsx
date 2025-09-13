"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, CheckCircle, AlertTriangle, Wifi, WifiOff } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getValidAccessToken, isTokenExpired } from "@/lib/firebase-auth"

interface GmailConnectionStatusProps {
  connectionStatus: 'idle' | 'testing' | 'connected' | 'failed'
  onReconnect?: () => void
}

export function GmailConnectionStatus({ connectionStatus, onReconnect }: GmailConnectionStatusProps) {
  const { user, refreshAccess } = useAuth()
  const [tokenStatus, setTokenStatus] = useState<'checking' | 'valid' | 'expired' | 'missing'>('checking')
  const [isReconnecting, setIsReconnecting] = useState(false)

  // Check token status periodically
  useEffect(() => {
    if (!user) {
      setTokenStatus('missing')
      return
    }

    const checkTokenStatus = async () => {
      try {
        const token = await getValidAccessToken()
        if (!token) {
          setTokenStatus(isTokenExpired() ? 'expired' : 'missing')
        } else {
          setTokenStatus('valid')
        }
      } catch (error) {
        setTokenStatus('expired')
      }
    }

    checkTokenStatus()

    // Check token status every 5 minutes
    const interval = setInterval(checkTokenStatus, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [user])

  const handleReconnect = async () => {
    setIsReconnecting(true)
    try {
      await refreshAccess()
      if (onReconnect) {
        onReconnect()
      }
    } catch (error) {
      console.error('Reconnection failed:', error)
    } finally {
      setIsReconnecting(false)
    }
  }

  // Don't show anything if user is not authenticated
  if (!user) {
    return null
  }

  // Show connection status based on both connection and token status
  const getStatusInfo = () => {
    if (connectionStatus === 'failed' || tokenStatus === 'expired' || tokenStatus === 'missing') {
      return {
        variant: 'destructive' as const,
        icon: <WifiOff className="h-4 w-4" />,
        title: 'Gmail Connection Issue',
        message: 'Please sign out and sign in again to reconnect your Gmail account.',
        showReconnect: true
      }
    }

    if (connectionStatus === 'testing' || tokenStatus === 'checking') {
      return {
        variant: 'default' as const,
        icon: <RefreshCw className="h-4 w-4 animate-spin" />,
        title: 'Checking Gmail Connection',
        message: 'Verifying your Gmail access...',
        showReconnect: false
      }
    }

    if (connectionStatus === 'connected' && tokenStatus === 'valid') {
      return {
        variant: 'default' as const,
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
        title: 'Gmail Connected',
        message: 'Your Gmail account is connected and working properly.',
        showReconnect: false
      }
    }

    return {
      variant: 'default' as const,
      icon: <Wifi className="h-4 w-4" />,
      title: 'Gmail Status',
      message: 'Checking connection status...',
      showReconnect: false
    }
  }

  const statusInfo = getStatusInfo()

  // Only show the alert if there's an issue or if explicitly checking
  if (connectionStatus === 'connected' && tokenStatus === 'valid') {
    return null // Don't show anything when everything is working
  }

  return (
    <Alert variant={statusInfo.variant} className="mb-4">
      <div className="flex items-center space-x-2">
        {statusInfo.icon}
        <div className="flex-1">
          <div className="font-medium">{statusInfo.title}</div>
          <AlertDescription className="mt-1">
            {statusInfo.message}
          </AlertDescription>
        </div>
        {statusInfo.showReconnect && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReconnect}
            disabled={isReconnecting}
            className="ml-auto"
          >
            {isReconnecting ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Reconnecting...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 mr-1" />
                Reconnect
              </>
            )}
          </Button>
        )}
      </div>
    </Alert>
  )
}