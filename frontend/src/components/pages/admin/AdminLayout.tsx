'use client'

import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from 'next-themes'
import { cn } from "@/lib/utils"
import { Home, Users, FileText, Settings, LogOut, Menu, Sun, Moon } from 'lucide-react'

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Requests",
    href: "/admin/requests",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('admin')
    navigate('/login')
  }

  const NavContent = () => (
    <>
      <div className="flex items-center h-16 px-4 border-b border-gray-700 bg-gray-900 dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-white">Admin Panel</h2>
      </div>
      <ScrollArea className="flex-1">
        <nav className="flex-1 space-y-1 p-4">
          {sidebarNavItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                location.pathname === item.href
                  ? "bg-gray-900 text-white dark:bg-gray-700 dark:text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5 mr-2" />
              {item.title}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="p-4 border-t border-gray-700 dark:border-gray-600">
        <Button 
          variant="outline" 
          className="w-full text-gray-300  bg-green-600 hover:bg-green-700 text-white hover:border-white rounded"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-gray-800 dark:bg-gray-900">
        <NavContent />
      </aside>

      {/* Mobile Menu Button */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden fixed top-4 left-4 z-40"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="left" 
          className="w-64 p-0 bg-gray-800 dark:bg-gray-900"
        >
          <NavContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto py-6 px-4">
          <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
          <div className="lg:hidden h-12" /> {/* Spacer for mobile menu button */}
          {children}
        </div>
      </main>
    </div>
  )
}