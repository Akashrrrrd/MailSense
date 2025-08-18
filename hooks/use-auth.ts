"use client"

import { useState, useEffect } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { signInWithGoogle, signOut, getStoredAccessToken } from "@/lib/firebase-auth"

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
      setError(error.message)
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

  const getAccessToken = () => {
    return getStoredAccessToken()
  }

  return {
    user,
    loading,
    error,
    login,
    logout,
    getAccessToken,
    isAuthenticated: !!user,
  }
}
