'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Lock, Save, Loader2, Check, AlertCircle, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiService } from '@/lib/api'
import { useUserProfile } from '@/hooks/use-auth'
import { toast } from 'react-hot-toast'
import type { ChangePasswordData } from '@/types'

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Debe contener al menos una mayúscula, una minúscula y un número'),
  confirmPassword: z.string().min(1, 'Confirma tu nueva contraseña'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

type PasswordFormData = z.infer<typeof passwordSchema>

interface PasswordStrength {
  score: number
  label: string
  color: string
  requirements: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    number: boolean
    match: boolean
  }
}

export function PasswordSettings() {
  const { profile } = useUserProfile()
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty }
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  })

  const newPassword = watch('newPassword')
  const confirmPassword = watch('confirmPassword')

  const getPasswordStrength = (password: string): PasswordStrength => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      match: password === confirmPassword && password.length > 0
    }

    const score = Object.values(requirements).filter(Boolean).length
    
    let label = 'Muy débil'
    let color = 'text-red-500'
    
    if (score >= 4) {
      label = 'Fuerte'
      color = 'text-green-500'
    } else if (score >= 3) {
      label = 'Moderada'
      color = 'text-yellow-500'
    } else if (score >= 2) {
      label = 'Débil'
      color = 'text-orange-500'
    }

    return { score, label, color, requirements }
  }

  const passwordStrength = getPasswordStrength(newPassword || '')

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const onSubmit = async (data: PasswordFormData) => {
    if (!profile?.id) {
      toast.error('Error: Usuario no encontrado')
      return
    }

    setIsLoading(true)
    try {
      const changePasswordData: ChangePasswordData = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      }

      await apiService.changePassword(profile.id, changePasswordData)
      toast.success('¡Contraseña actualizada correctamente! 🔒', {
        duration: 3000,
        icon: '✅'
      })
      reset()
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Error al cambiar la contraseña. Verifica tu contraseña actual.', {
        duration: 4000,
        icon: '❌'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Cambiar Contraseña
        </CardTitle>
        <CardDescription>
          Actualiza tu contraseña para mantener tu cuenta segura
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Shield className="h-4 w-4" />
            <span>Mantén tu cuenta segura con una contraseña fuerte</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Contraseña actual */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña actual</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    {...register('currentPassword')}
                    placeholder="Ingresa tu contraseña actual"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

              {/* Nueva contraseña */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva contraseña</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    {...register('newPassword')}
                    placeholder="Ingresa tu nueva contraseña"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                {/* Indicador de fortaleza de contraseña */}
                {newPassword && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Fortaleza:</span>
                      <span className={`text-sm font-medium ${passwordStrength.color}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.score >= 4 ? 'bg-green-500' :
                          passwordStrength.score >= 3 ? 'bg-yellow-500' :
                          passwordStrength.score >= 2 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Requisitos de contraseña */}
                {newPassword && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Requisitos:</p>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className={`flex items-center gap-1 ${passwordStrength.requirements.length ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordStrength.requirements.length ? <Check className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border border-gray-300" />}
                        <span>8+ caracteres</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.requirements.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordStrength.requirements.uppercase ? <Check className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border border-gray-300" />}
                        <span>Mayúscula</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.requirements.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordStrength.requirements.lowercase ? <Check className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border border-gray-300" />}
                        <span>Minúscula</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.requirements.number ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordStrength.requirements.number ? <Check className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border border-gray-300" />}
                        <span>Número</span>
                      </div>
                    </div>
                  </div>
                )}

                {errors.newPassword && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirmar contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    placeholder="Confirma tu nueva contraseña"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                {/* Indicador de coincidencia */}
                {confirmPassword && newPassword && (
                  <div className={`flex items-center gap-1 text-xs ${
                    passwordStrength.requirements.match ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {passwordStrength.requirements.match ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Las contraseñas coinciden</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3" />
                        <span>Las contraseñas no coinciden</span>
                      </>
                    )}
                  </div>
                )}

                {errors.confirmPassword && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Botón de guardar */}
            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={!isDirty || isLoading || passwordStrength.score < 4}
                className="min-w-[140px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Cambiando...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Cambiar contraseña
                  </>
                )}
              </Button>
            </div>
            
            {passwordStrength.score < 4 && newPassword && (
              <p className="text-xs text-muted-foreground text-center">
                Completa todos los requisitos para habilitar el cambio de contraseña
              </p>
            )}
          </form>
        </div>
      </CardContent>
    </Card>
  )
}