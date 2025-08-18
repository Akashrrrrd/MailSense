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

// Set custom parameters for OAuth
googleProvider.setCustomParameters({
  prompt: "select_account",
})

export interface AuthUser extends User {
  accessToken?: string
}

export const signInWithGoogle = async (): Promise<AuthUser> => {
  try {
    const result = await signInWithPopup(auth, googleProvider)

    // Get the Google Access Token for Gmail API
    const credential = GoogleAuthProvider.credentialFromResult(result)
    const accessToken = credential?.accessToken

    const user = result.user as AuthUser
    if (accessToken) {
      user.accessToken = accessToken
      // Store access token in localStorage for API calls
      localStorage.setItem("gmail_access_token", accessToken)
    }

    console.log("Successfully signed in:", user.email)
    return user
  } catch (error: any) {
    console.error("Error signing in with Google:", error)

    // Handle specific error cases
    if (error.code === "auth/popup-closed-by-user") {
      throw new Error("Sign-in was cancelled. Please try again.")
    } else if (error.code === "auth/popup-blocked") {
      throw new Error("Pop-up was blocked. Please allow pop-ups and try again.")
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
    const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`)
    return response.ok
  } catch {
    return false
  }
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
