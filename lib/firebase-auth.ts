"use client"

import { useEffect } from "react"
import { useState } from "react"

// Firebase Authentication with Google OAuth and Gmail API integration
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
// Fixed import path to match the actual firebase.ts file
import { auth } from "./firebase"

// Configure Google OAuth provider with Gmail API scopes
const googleProvider = new GoogleAuthProvider()
googleProvider.addScope("https://www.googleapis.com/auth/gmail.readonly")
googleProvider.addScope("https://www.googleapis.com/auth/gmail.modify")
googleProvider.addScope("email")
googleProvider.addScope("profile")

// Set custom parameters for OAuth - force consent to ensure fresh tokens
googleProvider.setCustomParameters({
  prompt: "consent", // Changed from "select_account" to "consent" to force fresh permissions
  access_type: "offline", // Request refresh token
})

export interface AuthUser extends User {
  accessToken?: string
}

export const signInWithGoogle = async (): Promise<AuthUser> => {
  try {
    console.log('[Auth] Starting Google sign-in with Gmail permissions...')
    
    // Clear any existing tokens first
    localStorage.removeItem("gmail_access_token")
    
    const result = await signInWithPopup(auth, googleProvider)

    // Get the Google Access Token for Gmail API
    const credential = GoogleAuthProvider.credentialFromResult(result)
    const accessToken = credential?.accessToken

    console.log('[Auth] Sign-in successful, access token received:', !!accessToken)

    const user = result.user as AuthUser
    if (accessToken) {
      user.accessToken = accessToken
      // Store access token in localStorage for API calls
      localStorage.setItem("gmail_access_token", accessToken)
      
      // Validate the token immediately
      const isValid = await isTokenValid(accessToken)
      console.log('[Auth] Token validation result:', isValid)
      
      if (!isValid) {
        throw new Error("Received invalid access token. Please try signing in again.")
      }
    } else {
      throw new Error("No access token received. Please ensure you grant Gmail permissions.")
    }

    console.log("Successfully signed in with Gmail access:", user.email)
    return user
  } catch (error: any) {
    console.error("Error signing in with Google:", error)

    // Clear any potentially invalid tokens
    localStorage.removeItem("gmail_access_token")

    // Handle specific error cases
    if (error.code === "auth/popup-closed-by-user") {
      throw new Error("Sign-in was cancelled. Please try again.")
    } else if (error.code === "auth/popup-blocked") {
      throw new Error("Pop-up was blocked. Please allow pop-ups and try again.")
    } else if (error.message?.includes("invalid access token")) {
      throw new Error("Failed to get Gmail permissions. Please try again and ensure you grant all requested permissions.")
    } else {
      throw new Error("Failed to sign in. Please try again.")
    }
  }
}

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth)
    // Clear stored access token
    localStorage.removeItem("gmail_access_token")
    console.log("Successfully signed out")
  } catch (error) {
    console.error("Error signing out:", error)
    throw new Error("Failed to sign out. Please try again.")
  }
}

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}

export const getStoredAccessToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("gmail_access_token")
  }
  return null
}

export const isTokenValid = async (token: string): Promise<boolean> => {
  try {
    console.log('[Auth] Validating access token...')
    const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`)
    
    if (response.ok) {
      const tokenInfo = await response.json()
      console.log('[Auth] Token validation successful:', {
        scope: tokenInfo.scope,
        expires_in: tokenInfo.expires_in,
        audience: tokenInfo.audience
      })
      
      // Check if token has Gmail scopes
      const hasGmailScopes = tokenInfo.scope?.includes('gmail.readonly') && tokenInfo.scope?.includes('gmail.modify')
      if (!hasGmailScopes) {
        console.error('[Auth] Token missing required Gmail scopes')
        return false
      }
      
      return true
    } else {
      console.error('[Auth] Token validation failed:', response.status)
      return false
    }
  } catch (error) {
    console.error('[Auth] Token validation error:', error)
    return false
  }
}

// Force a fresh sign-in to get new tokens
export const refreshGmailAccess = async (): Promise<AuthUser> => {
  console.log('[Auth] Refreshing Gmail access - forcing new sign-in...')
  
  // Clear all existing tokens
  localStorage.removeItem("gmail_access_token")
  
  // Sign out first to clear Firebase auth state
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.log('[Auth] Sign out during refresh:', error)
  }
  
  // Force fresh sign-in with consent
  return await signInWithGoogle()
}

// Auth state management hook
export const useAuthState = () => {
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

  return { user, loading, error }
}
