"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Shield, Lock, Eye, Trash2, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const faqs = [
  {
    icon: Eye,
    question: "Can MailSense read my private emails?",
    answer: "MailSense only processes email metadata (sender, subject, date) to classify priority. The actual email content is analyzed in real-time and immediately discarded. We never store or read your private email content."
  },
  {
    icon: Trash2,
    question: "Do you store my emails on your servers?",
    answer: "No, never. MailSense uses a zero-storage architecture. Your emails are processed in real-time through Gmail's API and only metadata (like sender and subject) is temporarily cached for 2 minutes to improve performance."
  },
  {
    icon: Lock,
    question: "How secure is the Gmail connection?",
    answer: "MailSense uses Google OAuth, the same security system used by Google Workspace and other enterprise applications. All connections are encrypted with HTTPS and we only request read-only permissions."
  },
  {
    icon: Settings,
    question: "Can I revoke MailSense's access to my Gmail?",
    answer: "Yes, absolutely. You can revoke access anytime through your Google Account settings (myaccount.google.com → Security → Third-party apps). MailSense will immediately stop working and all cached data is automatically deleted."
  },
  {
    icon: Shield,
    question: "What permissions does MailSense need?",
    answer: "MailSense only needs 'gmail.readonly' (to read emails) and 'gmail.modify' (to mark emails as read). We cannot send emails, delete emails, or access other Google services. These are the minimal permissions needed for the service to work."
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
      <CardContent className="space-y-3">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded-lg">
            <Button
              variant="ghost"
              className="w-full p-4 justify-between text-left h-auto"
              onClick={() => toggleFAQ(index)}
            >
              <div className="flex items-center space-x-3">
                <faq.icon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span className="font-medium text-sm">{faq.question}</span>
              </div>
              {openIndex === index ? (
                <ChevronUp className="h-4 w-4 text-gray-500 flex-shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
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
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 text-sm">Still have security concerns?</h4>
              <p className="text-blue-800 text-xs mt-1">
                Contact our security team at security@mailsense.com or review our detailed 
                <a href="/privacy" className="underline ml-1">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}