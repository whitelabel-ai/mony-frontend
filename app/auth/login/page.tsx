'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Wallet, ArrowLeft } from 'lucide-react'
import { useGuestGuard, useAuth } from '@/hooks'
import { Button, Input, Label, Card, CardHeader, CardContent } from '@/components/ui'
import { isValidEmail } from '@/lib/utils'

/**
 * Schema de validación para el formulario de login
 */
const loginSchema = z.object({
  email: z
    .string()
    .email('Ingresa un email válido')
    .refine((email) => isValidEmail(email), 'Formato de email inválido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida'),
})

type LoginFormData = z.infer<typeof loginSchema>

/**
 * Página de inicio de sesión
 */
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { loading: authLoading } = useGuestGuard()
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  /**
   * Manejar el envío del formulario
   */
  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      await login(data)
      // La redirección se maneja automáticamente en el hook useAuth
    } catch (error) {
      // El error se maneja en el hook useAuth
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-primary mb-3 sm:mb-4"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Volver al inicio
          </Link>
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <Image
              src="/logo-mony.png"
              alt="Mony Logo"
              width={120}
              height={40}
              className="h-8 sm:h-10 w-auto"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Bienvenido de vuelta</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 px-2 sm:px-0">
            Inicia sesión para continuar gestionando tus finanzas
          </p>
        </div>

        {/* Formulario */}
        <Card>
          <CardHeader className="space-y-1 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-center">Iniciar Sesión</h2>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
              {/* Email */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="email" className="text-sm sm:text-base">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  autoComplete="email"
                  {...register('email')}
                  className={`w-full h-10 sm:h-11 text-sm sm:text-base ${errors.email ? 'border-destructive' : ''}`}
                />
                {errors.email && (
                  <p className="text-xs sm:text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Contraseña */}
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm sm:text-base">Contraseña</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs sm:text-sm text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ingresa tu contraseña"
                    autoComplete="current-password"
                    {...register('password')}
                    className={`w-full h-10 sm:h-11 text-sm sm:text-base pr-10 ${errors.password ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground touch-manipulation"
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    ) : (
                      <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs sm:text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Botón de login */}
              <Button
                type="submit"
                className="w-full h-10 sm:h-11 text-sm sm:text-base mt-4 sm:mt-6"
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-4 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  ¿No tienes cuenta?
                </span>
              </div>
            </div>

            {/* Link a registro */}
            <div className="text-center">
              <Link href="/auth/register">
                <Button variant="outline" className="w-full h-10 sm:h-11 text-sm sm:text-base">
                  Crear cuenta nueva
                </Button>
              </Link>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}