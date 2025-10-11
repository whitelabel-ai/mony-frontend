'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks'
import { Button } from '@/components/ui'
import Image from 'next/image'
import { 
  Wallet, 
  TrendingUp, 
  Shield, 
  Smartphone, 
  Star, 
  Users, 
  DollarSign, 
  Target, 
  CheckCircle, 
  ArrowRight,
  Clock,
  Zap,
  Award,
  BarChart3,
  MessageCircle
} from 'lucide-react'

/**
 * Página principal de la aplicación - Landing optimizada para conversión
 */
export default function HomePage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [animatedStats, setAnimatedStats] = useState({ users: 0, savings: 0, transactions: 0 })

  useEffect(() => {
    if (!loading && isAuthenticated) {
      //router.push('/dashboard')
    }
  }, [isAuthenticated, loading, router])

  // Animación de estadísticas
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStats({ users: 15000, savings: 25000, transactions: 450000 })
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 overflow-hidden">
      {/* Header */}
      <header className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 relative z-50">
        <nav className="flex items-center justify-between backdrop-blur-md bg-white/95 rounded-2xl px-4 py-3 border border-white/20 shadow-xl">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Image
              src="/logo-mony.png"
              alt="Mony Logo"
              width={120}
              height={40}
              className="h-8 sm:h-10 w-auto"
              priority
            />
            <span className="text-lg sm:text-2xl font-bold text-primary">
              Mony
            </span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button asChild variant="ghost" className="text-xs sm:text-sm px-3 sm:px-4 py-2 text-gray-700 hover:text-primary hover:bg-primary/10 transition-all duration-300 font-medium">
              <Link href="/auth/login" prefetch>
                Iniciar Sesión
              </Link>
            </Button>
            <Button asChild className="text-xs sm:text-sm px-3 sm:px-6 py-2 bg-primary hover:secondary text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium">
              <Link href="/auth/register" prefetch>
                Comenzar Gratis
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section Mejorado */}
      <section className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 lg:py-16 text-center relative bg-gradient-to-br from-slate-50 to-green-50">
        {/* Elementos decorativos de fondo mejorados */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-25 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-100 rounded-full blur-3xl opacity-20 animate-spin" style={{animationDuration: '20s'}}></div>
          {/* Partículas flotantes */}
          <div className="absolute top-20 left-20 w-3 h-3 bg-green-500 rounded-full animate-bounce delay-300 opacity-60"></div>
          <div className="absolute top-40 right-32 w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-700 opacity-50"></div>
          <div className="absolute bottom-32 left-40 w-3 h-3 bg-green-600 rounded-full animate-bounce delay-1000 opacity-70"></div>
          <div className="absolute bottom-20 right-20 w-4 h-4 bg-blue-600 rounded-full animate-bounce delay-500 opacity-60"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Badge de WhatsApp */}
          <div className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg">
            <MessageCircle className="h-4 w-4" />
            <span>💬 Tu coach financiero personal por WhatsApp</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            <span className="block">Tu coach financiero</span>
            <span className="text-green-600">
              en WhatsApp
            </span>
            <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-2">
              al alcance de tu mano 📱
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto px-2 sm:px-0 leading-relaxed">
            Olvídate de apps complicadas. Con <strong className="text-gray-900">Mony</strong> tienes un coach financiero personal 
            que te acompaña por WhatsApp 24/7. <span className="text-green-600 font-semibold">Envía audios, fotos de facturas o simplemente chatea</span> - 
            Mony entiende todo y detecta automáticamente tus gastos hormiga, procesa tus compras y optimiza tus finanzas.
          </p>

          {/* Estadísticas animadas */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-8 max-w-2xl mx-auto">
            <div className="text-center bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-green-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 group cursor-pointer">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 group-hover:scale-110 transition-transform duration-300">
                {animatedStats.users.toLocaleString()}+
              </div>
              <div className="text-sm text-gray-600">Usuarios activos</div>
            </div>
            <div className="text-center bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-blue-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 group cursor-pointer">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 group-hover:scale-110 transition-transform duration-300">
                ${animatedStats.savings.toLocaleString()}M
              </div>
              <div className="text-sm text-gray-600">Ahorrados</div>
            </div>
            <div className="text-center bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-green-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 group cursor-pointer">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 group-hover:scale-110 transition-transform duration-300">
                {animatedStats.transactions.toLocaleString()}+
              </div>
              <div className="text-sm text-gray-600">Transacciones</div>
            </div>
          </div>

          {/* CTAs principales */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 sm:px-0 mb-8">
            <Button
              size="lg"
              onClick={() => window.open('https://wa.me/573143400476?text=¡Hola! Quiero conocer más sobre Mony y tener mi coach financiero personal 💰', '_blank')}
              className="text-base sm:text-lg lg:text-xl px-8 sm:px-12 py-4 sm:py-5 w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 group"
            >
              <MessageCircle className="mr-2 h-5 w-5 group-hover:animate-pulse" />
              💬 Hablar con mi Coach GRATIS
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                const element = document.getElementById('como-funciona');
                // Usar scroll suave sin bloquear hilo principal
                if (element) {
                  try {
                    element.scrollIntoView({ behavior: 'smooth' });
                  } catch (_) {
                    window.scrollTo({ top: element.offsetTop, behavior: 'smooth' })
                  }
                }
              }}
              className="text-base sm:text-lg lg:text-xl px-8 sm:px-12 py-4 sm:py-5 w-full sm:w-auto border-2 border-green-500/20 hover:border-green-500/40 hover:bg-green-500/5 transition-all duration-300"
            >
              ¿Cómo funciona?
            </Button>
          </div>

          {/* Garantía y urgencia */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>100% Gratis para siempre</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <span>Datos seguros y encriptados</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span>Configuración en 2 minutos</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sección "Cómo Funciona" con WhatsApp */}
      <section id="como-funciona" className="container mx-auto px-3 sm:px-4 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            Tu coach financiero personal en <span className="text-green-600">WhatsApp</span> 💬
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
            Olvídate de apps complicadas. Todo lo que necesitas está en una conversación simple y natural.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {/* Paso 1: Envía Audios */}
          <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-200 hover:border-green-300 hover:scale-105">
            <div className="bg-green-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-full inline-block mb-4">PASO 1</div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
              🎤 Envía Audios
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Habla naturalmente por WhatsApp. Mony entiende tus audios y analiza tus gastos automáticamente.
            </p>
            <div className="bg-white/80 p-4 rounded-2xl border border-green-200">
              <p className="text-green-700 text-sm italic">
                "Hola Mony, gasté $50K en almuerzo hoy" - Mony procesa tu audio al instante 🎯
              </p>
            </div>
          </div>

          {/* Paso 2: Fotos de Facturas */}
          <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-200 hover:border-blue-300 hover:scale-105">
            <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full inline-block mb-4">PASO 2</div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
              📸 Fotos de Facturas
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Toma una foto a tu factura y Mony procesa automáticamente la transacción y categoriza el gasto.
            </p>
            <div className="bg-white/80 p-4 rounded-2xl border border-blue-200">
              <p className="text-blue-700 text-sm italic">
                "Procesé tu factura: $120K en supermercado. Categorizado en 'Alimentación' 📊"
              </p>
            </div>
          </div>

          {/* Paso 3: Detecta Gastos Hormiga */}
          <div className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-200 hover:border-purple-300 hover:scale-105">
            <div className="bg-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <div className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full inline-block mb-4">PASO 3</div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
              🐜 Detecta Gastos Hormiga
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Mony identifica esos pequeños gastos que se acumulan y te ayuda a optimizar tu presupuesto.
            </p>
            <div className="bg-white/80 p-4 rounded-2xl border border-purple-200">
              <p className="text-purple-700 text-sm italic">
                "Detecté $300K en gastos hormiga este mes. Te muestro cómo ahorrar $200K 🏖️"
              </p>
            </div>
          </div>
        </div>

        {/* CTA de WhatsApp */}
        <div className="text-center mt-12">
          <Button
            size="lg"
            onClick={() => window.open('https://wa.me/573143400476?text=¡Hola! Quiero conocer cómo funciona mi coach financiero personal 🤖💰', '_blank')}
            className="text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 group"
          >
            <MessageCircle className="mr-3 h-6 w-6 group-hover:animate-pulse" />
            💬 Quiero mi Coach Financiero GRATIS
            <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Beneficios Principales */}
      <section className="container mx-auto px-3 sm:px-4 py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Resultados que <span className="text-green-600">SÍ verás</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Miles de usuarios ya están transformando sus finanzas con Mony
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Beneficio 1 */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 p-8 rounded-2xl border border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-3">
                    Ahorra automáticamente
                  </h3>
                  <p className="text-green-600 dark:text-green-300 mb-4 text-lg">
                    <strong>Promedio: $1M más al año</strong> sin esfuerzo extra
                  </p>
                  <ul className="space-y-2 text-green-600 dark:text-green-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Redondeo automático de compras</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Metas de ahorro inteligentes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Alertas de gastos innecesarios</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Beneficio 2 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 p-8 rounded-2xl border border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-3">
                    Control total de gastos
                  </h3>
                  <p className="text-blue-600 dark:text-blue-300 mb-4 text-lg">
                    <strong>Reduce gastos hasta 30%</strong> con insights inteligentes
                  </p>
                  <ul className="space-y-2 text-blue-600 dark:text-blue-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Categorización automática</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Reportes visuales claros</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Predicciones de gastos futuros</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Beneficio 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 p-8 rounded-2xl border border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-3">
                    Alcanza tus metas
                  </h3>
                  <p className="text-purple-600 dark:text-purple-300 mb-4 text-lg">
                    <strong>3x más probabilidad</strong> de cumplir objetivos financieros
                  </p>
                  <ul className="space-y-2 text-purple-600 dark:text-purple-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Metas personalizadas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Progreso visual motivador</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Recordatorios inteligentes</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Beneficio 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 p-8 rounded-2xl border border-orange-200 dark:border-orange-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-orange-700 dark:text-orange-400 mb-3">
                    Seguridad garantizada
                  </h3>
                  <p className="text-orange-600 dark:text-orange-300 mb-4 text-lg">
                    <strong>Encriptación bancaria</strong> y privacidad total
                  </p>
                  <ul className="space-y-2 text-orange-600 dark:text-orange-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Datos protegidos 24/7</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Sin acceso a cuentas bancarias</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Cumplimiento normativo</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios de la Experiencia WhatsApp */}
      <section className="container mx-auto px-3 sm:px-4 py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Lo que dicen sobre su <span className="text-green-600">coach por WhatsApp</span> 💬
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Experiencias reales de personas que transformaron sus finanzas conversando por WhatsApp
            </p>
          </div>

          {/* Estadísticas de impacto */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
              <div className="text-3xl font-bold text-green-600 mb-2">15K+</div>
              <div className="text-sm text-green-700 dark:text-green-400">Conversaciones diarias</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
              <div className="text-3xl font-bold text-blue-600 mb-2">$10B</div>
              <div className="text-sm text-blue-700 dark:text-blue-400">Ahorrado vía WhatsApp</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
              <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-sm text-purple-700 dark:text-purple-400">Disponibilidad</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 rounded-2xl border border-orange-200 dark:border-orange-800">
              <div className="text-3xl font-bold text-orange-600 mb-2">98%</div>
              <div className="text-sm text-orange-700 dark:text-orange-400">Satisfacción</div>
            </div>
          </div>

          {/* Testimonios con Conversaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Testimonio 1 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="bg-green-50 p-4 rounded-2xl mb-4 border border-green-200">
                <p className="text-green-700 text-sm italic mb-2">
                  "Mi coach me escribió: 'María, veo que puedes ahorrar $200K al mes sin afectar tu estilo de vida' 💰"
                </p>
              </div>
              <p className="text-gray-700 mb-6 italic">
                  "¡Es increíble! Solo le envío audios a Mony y él procesa todo. Me ayudó a ahorrar $3.2M en 6 meses detectando mis gastos hormiga. Súper fácil y natural."
                </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div>
                  <div className="font-semibold">María González</div>
                  <div className="text-sm text-gray-600">Profesora, Bogotá</div>
                </div>
              </div>
            </div>

            {/* Testimonio 2 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl mb-4 border border-blue-200">
                <p className="text-blue-700 text-sm italic mb-2">
                  "Le escribí: 'No sé en qué gasto mi dinero' y me mandó un análisis completo en 5 minutos 📊"
                </p>
              </div>
              <p className="text-gray-700 mb-6 italic">
                  "Solo le tomo foto a mis facturas y Mony las procesa automáticamente. Me ayudó a reducir gastos innecesarios en 40%. ¡Genial!"
                </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  C
                </div>
                <div>
                  <div className="font-semibold">Carlos Rodríguez</div>
                  <div className="text-sm text-gray-600">Ingeniero, Medellín</div>
                </div>
              </div>
            </div>

            {/* Testimonio 3 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="bg-purple-50 p-4 rounded-2xl mb-4 border border-purple-200">
                <p className="text-purple-700 text-sm italic mb-2">
                  "Le dije: 'Quiero viajar a Europa' y me creó un plan automático. ¡Ya tengo el 80%! ✈️"
                </p>
              </div>
              <p className="text-gray-700 mb-6 italic">
                  "Olvídate de apps complicadas. Le envío audios a Mony por WhatsApp y él detecta mis gastos hormiga. ¡Ya casi tengo mi viaje completo!"
                </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div>
                  <div className="font-semibold">Ana Martínez</div>
                  <div className="text-sm text-gray-600">Diseñadora, Cali</div>
                </div>
              </div>
            </div>
          </div>

          {/* Ejemplo de Conversación */}
          <div className="max-w-2xl mx-auto mb-16">
            <h3 className="text-xl font-bold text-center mb-6">💬 Así de fácil es conversar con tu coach:</h3>
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-green-200">
              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-green-500 text-white p-3 rounded-2xl rounded-br-md max-w-xs">
                    <p className="text-sm">Hola! Quiero ahorrar para unas vacaciones 🏖️</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-2xl rounded-bl-md max-w-xs">
                    <p className="text-sm">¡Perfecto! ¿Cuánto necesitas y para cuándo? Te ayudo a crear un plan automático 🎯</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-green-500 text-white p-3 rounded-2xl rounded-br-md max-w-xs">
                    <p className="text-sm">$8M para diciembre</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-2xl rounded-bl-md max-w-xs">
                    <p className="text-sm">¡Listo! Analizé tus gastos y puedes ahorrar $1M al mes automáticamente. ¡Tendrás tu viaje completo! 🚀</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Final */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={() => window.open('https://wa.me/573143400476?text=¡Hola! Quiero tener mi coach financiero personal por WhatsApp 💬💰', '_blank')}
              className="text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 group"
            >
              <MessageCircle className="mr-3 h-6 w-6 group-hover:animate-pulse" />
              💬 Quiero mi Coach por WhatsApp GRATIS
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section Final con Urgencia */}
      <section className="container mx-auto px-3 sm:px-4 py-12 sm:py-16 lg:py-20">
        <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-blue-600 to-green-600 rounded-3xl p-8 sm:p-12 lg:p-16 text-center text-white">
          {/* Elementos decorativos */}
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto">
            {/* Badge de urgencia */}
            <div className="inline-flex items-center gap-2 bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/40">
              <Clock className="h-4 w-4 animate-pulse" />
              <span>¡Oferta por tiempo limitado!</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="block">¡No esperes más!</span>
              <span className="block text-2xl sm:text-3xl lg:text-5xl mt-2">
                Tu futuro financiero comienza HOY
              </span>
            </h2>
            
            <p className="text-lg sm:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Únete a los <strong>15,000+ usuarios</strong> que ya están ahorrando automáticamente y 
              alcanzando sus metas financieras con Mony.
            </p>

            {/* Beneficios rápidos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-2xl font-bold mb-1">100%</div>
                <div className="text-sm opacity-90">Gratis para siempre</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-2xl font-bold mb-1">2 min</div>
                <div className="text-sm opacity-90">Configuración rápida</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-2xl font-bold mb-1">$1M</div>
                <div className="text-sm opacity-90">Ahorro promedio/año</div>
              </div>
            </div>

            {/* CTA principal */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                size="lg"
                onClick={() => router.push('/auth/register')}
                className="text-lg sm:text-xl lg:text-2xl px-8 sm:px-12 py-4 sm:py-6 w-full sm:w-auto bg-white text-primary hover:bg-white/90 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 group font-bold"
              >
                <Zap className="mr-3 h-6 w-6 group-hover:animate-pulse" />
                ¡COMENZAR GRATIS AHORA!
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Garantías finales */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm opacity-90">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span>Datos 100% seguros</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>15,000+ usuarios satisfechos</span>
              </div>
            </div>

            {/* Contador de urgencia */}
            <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 max-w-md mx-auto">
              <div className="text-sm opacity-90 mb-2">⚡ Últimas 24 horas:</div>
              <div className="text-lg font-bold">+247 nuevos usuarios se registraron</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 border-t">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2 text-center">
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="text-base sm:text-lg font-semibold text-primary">Mony</span>
          </div>
          <span className="text-sm sm:text-base text-muted-foreground">© 2025 - Todos los derechos reservados</span>
        </div>
      </footer>

      {/* Botón Flotante de Chat Personalizado */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Pulso animado */}
          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
          
          {/* Botón principal */}
          <button
            aria-label="Abrir chat del coach"
            title="Abrir chat del coach"
            onClick={() => {
              // Intentar abrir Chatwoot primero, si no está disponible, abrir WhatsApp
              if (typeof window !== 'undefined' && (window as any).$chatwoot && typeof (window as any).$chatwoot.toggle === 'function') {
                (window as any).$chatwoot.toggle();
              } else {
                window.open('https://wa.me/573143400476?text=¡Hola! Quiero hablar con mi coach financiero personal 💬', '_blank');
              }
            }}
            className="relative bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 group"
          >
            <MessageCircle className="h-6 w-6 group-hover:animate-pulse" />
          </button>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
              💬 Habla con tu coach
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}