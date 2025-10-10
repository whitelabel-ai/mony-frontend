'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { useGuestGuard } from '@/hooks'
import { Button, Input, Label, Card, CardHeader, CardContent } from '@/components/ui'
import { apiService } from '@/lib/api'

/**
 * Schema de validación para el formulario de reset password
 */
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

/**
 * Página de restablecimiento de contraseña
 */
export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { loading: authLoading } = useGuestGuard()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  // Verificar token al cargar la página
  useEffect(() => {
    if (!token) {
      setIsValidToken(false)
      return
    }

    // Aquí podrías hacer una verificación del token con el backend
    // Por ahora asumimos que es válido si existe
    setIsValidToken(true)
  }, [token])

  /**
   * Manejar el envío del formulario
   */
  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return

    try {
      setIsLoading(true)
      console.log('🚀 Iniciando proceso de reset-password...')
      
      const response = await apiService.resetPassword(token, data.password)
      
      console.log('✅ Contraseña restablecida exitosamente:', response)
      setIsSuccess(true)
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
      
    } catch (error: any) {
      console.error('❌ Error al restablecer contraseña:', error)
      console.error('📝 Mensaje de error:', error.message)
      // TODO: Mostrar toast de error con el mensaje específico
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

  // Token inválido o no existe
  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-md">
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

          <Card>
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                Enlace inválido
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mb-6">
                El enlace de restablecimiento es inválido o ha expirado. 
                Por favor, solicita un nuevo enlace.
              </p>
              <div className="space-y-3">
                <Link href="/auth/forgot-password">
                  <Button className="w-full">
                    Solicitar nuevo enlace
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">
                    Volver al login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Éxito al restablecer contraseña
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 sm:mb-8">
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

          <Card>
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                ¡Contraseña restablecida!
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mb-6">
                Tu contraseña ha sido restablecida exitosamente. 
                Ahora puedes iniciar sesión con tu nueva contraseña.
              </p>
              <Link href="/auth/login">
                <Button className="w-full">
                  Iniciar sesión
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Verificando token
  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Formulario de restablecimiento
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
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Nueva contraseña</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 px-2 sm:px-0">
            Ingresa tu nueva contraseña
          </p>
        </div>

        {/* Formulario */}
        <Card>
          <CardHeader className="space-y-1 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-center">Restablecer contraseña</h2>
            <p className="text-sm text-muted-foreground text-center">
              Tu nueva contraseña debe ser segura y fácil de recordar
            </p>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Nueva contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm sm:text-base">Nueva contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ingresa tu nueva contraseña"
                    autoComplete="new-password"
                    {...register('password')}
                    className={`w-full h-10 sm:h-11 text-sm sm:text-base pr-10 ${errors.password ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
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

              {/* Confirmar contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm sm:text-base">Confirmar contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirma tu nueva contraseña"
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                    className={`w-full h-10 sm:h-11 text-sm sm:text-base pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    ) : (
                      <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs sm:text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Requisitos de contraseña */}
              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                <p className="font-medium mb-1">La contraseña debe contener:</p>
                <ul className="space-y-1">
                  <li>• Al menos 8 caracteres</li>
                  <li>• Una letra mayúscula</li>
                  <li>• Una letra minúscula</li>
                  <li>• Un número</li>
                  <li>• Un carácter especial</li>
                </ul>
              </div>

              {/* Botón de envío */}
              <Button
                type="submit"
                className="w-full h-10 sm:h-11 text-sm sm:text-base mt-6"
                disabled={isLoading}
              >
                {isLoading ? 'Restableciendo...' : 'Restablecer contraseña'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}