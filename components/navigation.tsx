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
    <nav className="w-full">
      <div className="flex flex-wrap gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 -mx-2 sm:mx-0 px-2 sm:px-0">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href} className="flex-shrink-0">
              <Button
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "flex items-center space-x-1 sm:space-x-2 min-h-[40px] px-3 sm:px-4 whitespace-nowrap",
                  isActive && "bg-blue-600 text-white hover:bg-blue-700",
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">{item.name}</span>
              </Button>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
