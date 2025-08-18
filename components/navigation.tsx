"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BarChart3, Settings, Home } from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Insights",
    href: "/insights",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

// Public navigation for non-authenticated users
export const publicNavigation = [
  {
    name: "How It Works",
    href: "/how-it-works",
  },
  {
    name: "Privacy",
    href: "/privacy",
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-1 sm:space-x-2">
      {navigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link key={item.name} href={item.href}>
            <Button
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className={cn(
                "flex items-center space-x-1 sm:space-x-2 min-h-[40px] px-2 sm:px-3",
                isActive && "bg-blue-600 text-white hover:bg-blue-700",
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline text-xs sm:text-sm">{item.name}</span>
            </Button>
          </Link>
        )
      })}
    </nav>
  )
}
