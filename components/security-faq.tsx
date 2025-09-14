"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Shield, Lock, Eye, Trash2, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const faqs = [
  {
    icon: Eye,
    question: "What data does MailSense access?",
    answer: "MailSense accesses email metadata including sender, subject, and timestamp for summarization. Email content is processed in real-time and never stored on our servers."
  },
  {
    icon: Trash2,
    question: "Is my email data stored anywhere?",
    answer: "No. MailSense uses a zero-storage architecture. All email processing happens in real-time through secure APIs with no persistent data storage."
  },
  {
    icon: Lock,
    question: "How is my Gmail account secured?",
    answer: "MailSense uses Google OAuth 2.0, the same enterprise-grade security used by Google Workspace. All connections are encrypted and we maintain read-only access permissions."
  },
  {
    icon: Settings,
    question: "Can I revoke access at any time?",
    answer: "Yes. You can revoke MailSense access through your Google Account security settings at any time. All processing will immediately cease upon revocation."
  },
  {
    icon: Shield,
    question: "What permissions are required?",
    answer: "MailSense requires minimal read-only permissions to access email metadata for summarization. We cannot send, delete, or modify your emails in any way."
  }
]

export function SecurityFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Shield className="h-5 w-5 mr-2 text-blue-600" />
          Security & Privacy FAQ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              className="w-full p-3 sm:p-4 justify-between text-left h-auto"
              onClick={() => toggleFAQ(index)}
            >
              <div className="flex items-start space-x-2 sm:space-x-3 min-w-0 flex-1">
                <faq.icon className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="font-medium text-xs sm:text-sm text-left leading-tight">
                  {faq.question}
                </span>
              </div>
              {openIndex === index ? (
                <ChevronUp className="h-4 w-4 text-gray-500 flex-shrink-0 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0 ml-2" />
              )}
            </Button>
            
            {openIndex === index && (
              <div className="px-4 pb-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-900 text-sm">Additional Questions?</h4>
              <p className="text-gray-600 text-xs mt-1">
                Contact our support team or review our 
                <a href="/privacy" className="underline ml-1 text-blue-600">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}