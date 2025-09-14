"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import type { EmailSummary } from "@/lib/gmail-api"

export function useAIAssistant() {
  const { user } = useAuth()
  const [emails, setEmails] = useState<EmailSummary[]>([])
  const [showAIAssistant, setShowAIAssistant] = useState(false)

  // Get emails from localStorage if available (cached from dashboard)
  useEffect(() => {
    if (user && typeof window !== "undefined") {
      const cachedEmails = localStorage.getItem("mailsense-emails")
      if (cachedEmails) {
        try {
          const parsedEmails = JSON.parse(cachedEmails)
          setEmails(parsedEmails)
        } catch (error) {
          console.error("Failed to parse cached emails:", error)
        }
      }
    }
  }, [user])

  const toggleAIAssistant = () => {
    setShowAIAssistant(!showAIAssistant)
  }

  return {
    emails,
    showAIAssistant,
    toggleAIAssistant,
    isAvailable: user && emails.length > 0
  }
}