'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks'
import { Button } from '@/components/ui'
import Image from 'next/image'
import { Wallet, TrendingUp, Shield, Smartphone } from 'lucide-react'

/**
 * Página principal de la aplicación
 */
export default function HomePage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image
              src="/logo mony.png"
              alt="Mony Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
            <span className="text-2xl font-bold text-primary">Mony</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/auth/login')}
            >
              Iniciar Sesión
            </Button>
            <Button onClick={() => router.push('/auth/register')}>
              Registrarse
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Controla tus
            <span className="text-primary block">finanzas personales</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Mony te ayuda a gestionar tus ingresos, gastos y metas de ahorro de manera
            inteligente y sencilla. Toma el control de tu futuro financiero hoy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push('/auth/register')}
              className="text-lg px-8 py-3"
            >
              Comenzar Gratis
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/auth/login')}
              className="text-lg px-8 py-3"
            >
              Ya tengo cuenta
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ¿Por qué elegir Mony?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre las características que hacen de Mony la mejor opción para
            gestionar tus finanzas personales.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <div className="text-center p-6 rounded-lg bg-card border shadow-sm">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Análisis Inteligente</h3>
            <p className="text-muted-foreground">
              Obtén insights detallados sobre tus patrones de gasto y encuentra
              oportunidades de ahorro.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="text-center p-6 rounded-lg bg-card border shadow-sm">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Seguro y Privado</h3>
            <p className="text-muted-foreground">
              Tus datos están protegidos con encriptación de nivel bancario.
              Tu privacidad es nuestra prioridad.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="text-center p-6 rounded-lg bg-card border shadow-sm">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fácil de Usar</h3>
            <p className="text-muted-foreground">
              Interfaz intuitiva y moderna que hace que gestionar tus finanzas
              sea simple y agradable.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="text-center p-6 rounded-lg bg-card border shadow-sm">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Metas de Ahorro</h3>
            <p className="text-muted-foreground">
              Define y alcanza tus objetivos financieros con nuestro sistema
              de metas personalizadas.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-primary/5 rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ¿Listo para transformar tus finanzas?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Únete a miles de usuarios que ya están tomando el control de su
            futuro financiero con Mony.
          </p>
          <Button
            size="lg"
            onClick={() => router.push('/auth/register')}
            className="text-lg px-8 py-3"
          >
            Comenzar Ahora - Es Gratis
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="flex items-center justify-center space-x-2">
          <Wallet className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold text-primary">Mony</span>
          <span className="text-muted-foreground">© 2024 - Todos los derechos reservados</span>
        </div>
      </footer>
    </div>
  )
}