"use client"

import { useState, useEffect } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { signInWithGoogle, signOut, getValidAccessToken, refreshGmailAccess, isTokenValid } from "@/lib/firebase-auth"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user)
        setLoading(false)
        setError(null)
      },
      (error) => {
        setError(error.message)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  const login = async () => {
    try {
      setError(null)
      setLoading(true)
      await signInWithGoogle()
    } catch (error: any) {
      console.error('[Auth] Login error:', error)
      
      // Don't show error for user-cancelled actions
      if (error.message?.includes("cancelled") || error.message?.includes("interrupted")) {
        console.log('[Auth] User cancelled sign-in')
      } else {
        setError(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setError(null)
      await signOut()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const getAccessToken = async () => {
    try {
      const token = await getValidAccessToken()
      if (!token) {
        console.warn('[Auth] No valid access token available - user needs to re-authenticate')
        // Only set error if user is actually authenticated but token is invalid
        if (user) {
          setError("Gmail access expired. Please sign out and sign in again to reconnect.")
        }
      }
      return token
    } catch (error: any) {
      console.error('[Auth] Error getting access token:', error)
      if (user) {
        setError("Failed to get Gmail access. Please try signing in again.")
      }
      return null
    }
  }

  const refreshAccess = async () => {
    try {
      setError(null)
      setLoading(true)
      await refreshGmailAccess()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    error,
    login,
    logout,
    getAccessToken,
    refreshAccess,
    isAuthenticated: !!user,
  }
}
