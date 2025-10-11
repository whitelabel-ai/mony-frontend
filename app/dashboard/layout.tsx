'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useThemeConfig } from '@/hooks/use-theme-config'
import {
  LayoutDashboard,
  CreditCard,
  Target,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Receipt,
} from 'lucide-react'
import { useAuth, useAuthGuard } from '@/hooks'
import { Button, Avatar, AvatarFallback, AvatarImage } from '@/components/ui'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn, getGreeting, getUserInitials } from '@/lib/utils'
import Image from 'next/image'

// ✅ Tipo para los ítems de navegación
type NavigationItem = {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

// ✅ Lista de navegación principal
const mainNavigationItems: NavigationItem[] = [
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
]

// ✅ Lista de navegación de configuración
const configNavigationItems: NavigationItem[] = [
  {
    name: 'Facturación',
    href: '/dashboard/billing',
    icon: Receipt,
  },
  {
    name: 'Configuración',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

// ✅ Componente reutilizable para secciones de navegación
function NavigationSection({
  title,
  items,
  pathname,
  onClose,
}: {
  title: string
  items: NavigationItem[]
  pathname: string
  onClose?: () => void
}) {
  return (
    <div className="space-y-2">
      <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-1">
        {items.map((item) => {
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
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useAuthGuard()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { toggleLightDark, isDark } = useThemeConfig()
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
    <div className="min-h-screen bg-muted">
      {/* Sidebar móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border shadow-lg">
            <SidebarContent
              mainNavigationItems={mainNavigationItems}
              configNavigationItems={configNavigationItems}
              pathname={pathname}
              user={user}
              logout={logout}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Sidebar desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-card border border-border shadow-sm">
          <SidebarContent
            mainNavigationItems={mainNavigationItems}
            configNavigationItems={configNavigationItems}
            pathname={pathname}
            user={user}
            logout={logout}
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
                onClick={toggleLightDark}
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
  mainNavigationItems,
  configNavigationItems,
  pathname,
  user,
  logout,
  onClose,
}: {
  mainNavigationItems: NavigationItem[]
  configNavigationItems: NavigationItem[]
  pathname: string
  user: any
  logout: () => void
  onClose?: () => void
}) {
  return (
    <>
      <div className="flex h-16 items-center justify-between px-6 border-b">
        <div className="flex items-center space-x-2">
          <Image
            src="/logo-mony.png"
            alt="Mony Logo"
            width={120}
            height={40}
            className="h-10 w-auto"
          />
          <span className="text-xl font-bold text-primary">Mony</span>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      <nav className="flex-1 px-4 py-6 flex flex-col">
        <NavigationSection
          title="Principal"
          items={mainNavigationItems}
          pathname={pathname}
          onClose={onClose}
        />
        
        {/* Espaciador para empujar configuraciones al final */}
        <div className="flex-1"></div>
        
        <div className="border-t border-border mb-4"></div>
        
        <NavigationSection
          title="Configuración"
          items={configNavigationItems}
          pathname={pathname}
          onClose={onClose}
        />
      </nav>
    </>
  )
}
