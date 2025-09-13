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
  include_granted_scopes: "true", // Include previously granted scopes
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
      
      // Store access token and expiry time in localStorage
      localStorage.setItem("gmail_access_token", accessToken)
      
      // OAuth tokens typically expire in 1 hour, but we'll be conservative and use 50 minutes
      const expiryTime = Date.now() + (50 * 60 * 1000) // 50 minutes from now
      localStorage.setItem("gmail_token_expiry", expiryTime.toString())
      
      // Note: Browser-based OAuth doesn't provide refresh tokens
      // This is a limitation of the current OAuth flow
      console.log('[Auth] Access token stored (refresh tokens not available in browser OAuth)')
      
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
    // Clear all stored tokens and session data
    localStorage.removeItem("gmail_access_token")
    localStorage.removeItem("gmail_refresh_token")
    localStorage.removeItem("gmail_token_expiry")
    localStorage.removeItem("gmail_token_last_validation")
    localStorage.removeItem("mailsense-login-time")
    localStorage.removeItem("mailsense-last-fetch")
    localStorage.removeItem("mailsense-emails")
    localStorage.removeItem("mailsense-processed-emails")
    localStorage.removeItem("mailsense-whatsapp-sent-emails")
    console.log("Successfully signed out and cleared all session data")
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

export const getStoredRefreshToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("gmail_refresh_token")
  }
  return null
}

export const getTokenExpiry = (): number | null => {
  if (typeof window !== "undefined") {
    const expiry = localStorage.getItem("gmail_token_expiry")
    return expiry ? parseInt(expiry) : null
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

export const isTokenExpired = (): boolean => {
  const expiry = getTokenExpiry()
  if (!expiry) return true
  
  // Consider token expired if it expires within the next 2 minutes (more conservative)
  const twoMinutesFromNow = Date.now() + (2 * 60 * 1000)
  return expiry <= twoMinutesFromNow
}

export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    console.log('[Auth] Attempting to refresh access token...')
    
    // For Google OAuth, we need to use Firebase's built-in token refresh
    // Get the current user and force token refresh
    const currentUser = auth.currentUser
    if (!currentUser) {
      console.error('[Auth] No current user for token refresh')
      return null
    }
    
    // Force refresh the Firebase ID token, which should also refresh OAuth tokens
    const idTokenResult = await currentUser.getIdTokenResult(true)
    console.log('[Auth] Firebase token refreshed successfully')
    
    // For Gmail API, we need to re-authenticate to get a fresh access token
    // This is a limitation of the current OAuth flow - we'll need to re-sign in
    console.log('[Auth] Gmail access token refresh requires re-authentication')
    return null
    
  } catch (error) {
    console.error('[Auth] Token refresh failed:', error)
    return null
  }
}

// Get a valid access token, refreshing if necessary
export const getValidAccessToken = async (): Promise<string | null> => {
  const currentToken = getStoredAccessToken()
  
  // If no token exists, user needs to sign in
  if (!currentToken) {
    console.log('[Auth] No access token found')
    return null
  }
  
  // Check if token is expired
  if (isTokenExpired()) {
    console.log('[Auth] Access token is expired')
    
    // Clear expired tokens
    localStorage.removeItem("gmail_access_token")
    localStorage.removeItem("gmail_refresh_token")
    localStorage.removeItem("gmail_token_expiry")
    
    console.log('[Auth] Token expired - user needs to re-authenticate')
    return null
  }
  
  // For non-expired tokens, do a quick validation
  // Skip validation if token was validated recently (within 5 minutes)
  const lastValidation = localStorage.getItem("gmail_token_last_validation")
  const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
  
  if (lastValidation && parseInt(lastValidation) > fiveMinutesAgo) {
    // Token was validated recently, assume it's still valid
    return currentToken
  }
  
  // Validate token
  const isValid = await isTokenValid(currentToken)
  if (!isValid) {
    console.log('[Auth] Token validation failed - clearing invalid token')
    localStorage.removeItem("gmail_access_token")
    localStorage.removeItem("gmail_refresh_token")
    localStorage.removeItem("gmail_token_expiry")
    localStorage.removeItem("gmail_token_last_validation")
    return null
  }
  
  // Store validation timestamp
  localStorage.setItem("gmail_token_last_validation", Date.now().toString())
  
  return currentToken
}

// Force a fresh sign-in to get new tokens
export const refreshGmailAccess = async (): Promise<AuthUser> => {
  console.log('[Auth] Refreshing Gmail access - forcing new sign-in...')
  
  // Clear all existing tokens
  localStorage.removeItem("gmail_access_token")
  localStorage.removeItem("gmail_refresh_token")
  localStorage.removeItem("gmail_token_expiry")
  
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
