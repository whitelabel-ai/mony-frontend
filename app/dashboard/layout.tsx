'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  LayoutDashboard,
  CreditCard,
  Target,
  Calendar,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Wallet,
} from 'lucide-react'
import { useAuth, useAuthGuard } from '@/hooks'
import { Button, Avatar, AvatarFallback, AvatarImage } from '@/components/ui'
import { cn, getGreeting } from '@/lib/utils'

// ✅ Tipo para los ítems de navegación
type NavigationItem = {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

// ✅ Lista de navegación
const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Transacciones',
    href: '/dashboard/transactions',
    icon: CreditCard,
  },
  {
    name: 'Metas de Ahorro',
    href: '/dashboard/goals',
    icon: Target,
  },
  {
    name: 'Suscripciones',
    href: '/dashboard/subscriptions',
    icon: Calendar,
  },
  {
    name: 'Configuración',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const { loading } = useAuthGuard()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-card border-r shadow-lg">
            <SidebarContent
              navigationItems={navigationItems}
              pathname={pathname}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Sidebar desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-card border-r shadow-sm">
          <SidebarContent
            navigationItems={navigationItems}
            pathname={pathname}
          />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex-1 lg:flex-none">
              <h1 className="text-lg font-semibold text-foreground">
                {getGreeting()}, {user?.nombreCompleto?.split(' ')[0] || 'Usuario'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user?.nombreCompleto || ''} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getUserInitials(user?.nombreCompleto || 'Usuario')}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-foreground">
                    {user?.nombreCompleto}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarContent({
  navigationItems,
  pathname,
  onClose,
}: {
  navigationItems: NavigationItem[]
  pathname: string
  onClose?: () => void
}) {
  return (
    <>
      <div className="flex h-16 items-center justify-between px-6 border-b">
        <div className="flex items-center space-x-2">
          <Wallet className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-primary">Mony</span>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t">
        <div className="flex items-center space-x-3 px-3 py-2">
          <User className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              Panel de Control
            </p>
            <p className="text-xs text-muted-foreground">
              Gestiona tus finanzas
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
