'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Eye, EyeOff, Wallet, ArrowLeft } from 'lucide-react'
import { useGuestGuard } from '@/hooks'
import { Button, Input, Label, Card, CardHeader, CardContent, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { apiService } from '@/lib/api'
import { CURRENCIES } from '@/types'
import { isValidEmail, isValidWhatsApp } from '@/lib/utils'

/**
 * Schema de validación para el formulario de registro
 */
const registerSchema = z.object({
  nombreCompleto: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  email: z
    .string()
    .email('Ingresa un email válido')
    .refine((email) => isValidEmail(email), 'Formato de email inválido'),
  numeroWhatsapp: z
    .string()
    .min(10, 'El número debe tener al menos 10 dígitos')
    .max(15, 'El número no puede exceder 15 dígitos')
    .refine((phone) => isValidWhatsApp(phone), 'Formato de WhatsApp inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  confirmPassword: z.string(),
  monedaDefecto: z.string().min(1, 'Selecciona una moneda'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

/**
 * Página de registro de usuarios
 */
export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { loading: authLoading } = useGuestGuard()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      monedaDefecto: 'COP',
    },
  })

  const selectedCurrency = watch('monedaDefecto')

  /**
   * Manejar el envío del formulario
   */
  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true)
      await apiService.register(data)
      // La redirección se maneja en el hook useAuth
    } catch (error) {
      // El error se maneja en el servicio de API
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver al inicio
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Wallet className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">Mony</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Crear cuenta</h1>
          <p className="text-muted-foreground mt-2">
            Comienza a gestionar tus finanzas hoy
          </p>
        </div>

        {/* Formulario */}
        <Card>
          <CardHeader className="space-y-1">
            <h2 className="text-xl font-semibold text-center">Registro</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Nombre completo */}
              <div className="space-y-2">
                <Label htmlFor="nombreCompleto">Nombre completo</Label>
                <Input
                  id="nombreCompleto"
                  type="text"
                  placeholder="Ingresa tu nombre completo"
                  {...register('nombreCompleto')}
                  className={errors.nombreCompleto ? 'border-destructive' : ''}
                />
                {errors.nombreCompleto && (
                  <p className="text-sm text-destructive">
                    {errors.nombreCompleto.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <Label htmlFor="numeroWhatsapp">Número de WhatsApp</Label>
                <Input
                  id="numeroWhatsapp"
                  type="tel"
                  placeholder="+57 300 123 4567"
                  {...register('numeroWhatsapp')}
                  className={errors.numeroWhatsapp ? 'border-destructive' : ''}
                />
                {errors.numeroWhatsapp && (
                  <p className="text-sm text-destructive">
                    {errors.numeroWhatsapp.message}
                  </p>
                )}
              </div>

              {/* Moneda */}
              <div className="space-y-2">
                <Label htmlFor="monedaDefecto">Moneda por defecto</Label>
                <Select
                  value={selectedCurrency}
                  onValueChange={(value) => setValue('monedaDefecto', value)}
                >
                  <SelectTrigger className={errors.monedaDefecto ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Selecciona tu moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name} ({currency.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.monedaDefecto && (
                  <p className="text-sm text-destructive">
                    {errors.monedaDefecto.message}
                  </p>
                )}
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Crea una contraseña segura"
                    {...register('password')}
                    className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Confirmar contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirma tu contraseña"
                    {...register('confirmPassword')}
                    className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Botón de registro */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>
            </form>

            {/* Link a login */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                ¿Ya tienes una cuenta?{' '}
                <Link
                  href="/auth/login"
                  className="font-medium text-primary hover:underline"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}