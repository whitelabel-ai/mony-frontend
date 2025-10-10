'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import { useGuestGuard } from '@/hooks'
import { Button, Input, Label, Card, CardHeader, CardContent } from '@/components/ui'
import { isValidEmail } from '@/lib/utils'
import { apiService } from '@/lib/api'

/**
 * Schema de validación para el formulario de forgot password
 */
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Ingresa un email válido')
    .refine((email) => isValidEmail(email), 'Formato de email inválido'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

/**
 * Página de recuperación de contraseña
 */
export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [email, setEmail] = useState('')
  const { loading: authLoading } = useGuestGuard()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  /**
   * Manejar el envío del formulario
   */
  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true)
      console.log('🚀 Iniciando proceso de forgot-password...')
      
      const response = await apiService.forgotPassword(data.email)
      
      console.log('✅ Proceso completado exitosamente:', response)
      setEmail(data.email)
      setIsSuccess(true)
    } catch (error: any) {
      console.error('❌ Error al enviar email de recuperación:', error)
      // TODO: Mostrar toast de error con el mensaje específico
      console.error('📝 Mensaje de error:', error.message)
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

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-primary mb-3 sm:mb-4"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Volver al login
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
          </div>

          {/* Success Card */}
          <Card>
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                ¡Email enviado!
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                Hemos enviado un enlace de recuperación a:
              </p>
              <p className="text-sm sm:text-base font-medium text-foreground mb-6">
                {email}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mb-6">
                Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
                Si no ves el email, revisa tu carpeta de spam.
              </p>
              <div className="space-y-3">
                <Link href="/auth/login">
                  <Button className="w-full">
                    Volver al login
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsSuccess(false)
                    setEmail('')
                  }}
                >
                  Enviar a otro email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link
            href="/auth/login"
            className="inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-primary mb-3 sm:mb-4"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Volver al login
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
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">¿Olvidaste tu contraseña?</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 px-2 sm:px-0">
            No te preocupes, te ayudamos a recuperarla
          </p>
        </div>

        {/* Formulario */}
        <Card>
          <CardHeader className="space-y-1 p-4 sm:p-6">
            <div className="flex justify-center mb-2">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-center">Recuperar contraseña</h2>
            <p className="text-sm text-muted-foreground text-center">
              Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
            </p>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
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

              {/* Botón de envío */}
              <Button
                type="submit"
                className="w-full h-10 sm:h-11 text-sm sm:text-base mt-6"
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </Button>
            </form>

            {/* Link de vuelta al login */}
            <div className="text-center mt-6">
              <Link
                href="/auth/login"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                ¿Recordaste tu contraseña? <span className="font-medium">Inicia sesión</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}