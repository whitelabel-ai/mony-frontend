'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check, Loader2, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiService } from '@/lib/api'
import { useUserProfile } from '@/hooks/use-auth'
import { toast } from 'react-hot-toast'
import type { UpdateUserProfileData, FrecuenciaNotificacion } from '@/types'
import { CURRENCIES, COUNTRY } from '@/types'

const profileSchema = z.object({
  nombreCompleto: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  numeroWhatsapp: z.string().min(10, 'Número de WhatsApp inválido'),
  pais: z.string().min(2, 'País requerido'),
  moneda: z.string(),
  frecuenciaRecordatorios: z.enum(['nunca', 'diario', 'semanal', 'mensual'] as const),
  frecuenciaInformes: z.enum(['nunca', 'diario', 'semanal', 'mensual'] as const),
})

type ProfileFormData = z.infer<typeof profileSchema>
type FieldName = keyof ProfileFormData

interface FieldState {
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
}

interface ProfileSettingsProps {
  onProfileUpdate?: () => void
}

export function ProfileSettings({ onProfileUpdate }: ProfileSettingsProps) {
  const { profile, refreshProfile } = useUserProfile()
  const [fieldStates, setFieldStates] = useState<Record<FieldName, FieldState>>({
    nombreCompleto: { isLoading: false, isSuccess: false, isError: false },
    email: { isLoading: false, isSuccess: false, isError: false },
    numeroWhatsapp: { isLoading: false, isSuccess: false, isError: false },
    pais: { isLoading: false, isSuccess: false, isError: false },
    moneda: { isLoading: false, isSuccess: false, isError: false },
    frecuenciaRecordatorios: { isLoading: false, isSuccess: false, isError: false },
    frecuenciaInformes: { isLoading: false, isSuccess: false, isError: false },
  })

  const {
    register,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nombreCompleto: '',
      email: '',
      numeroWhatsapp: '',
      pais: '',
      moneda: 'COP',
      frecuenciaRecordatorios: 'semanal',
      frecuenciaInformes: 'mensual'
    }
  })

  useEffect(() => {
    if (profile) {
      setValue('nombreCompleto', profile.nombreCompleto || '')
      setValue('email', profile.email || '')
      setValue('numeroWhatsapp', profile.numeroWhatsapp || '')
      setValue('pais', profile.pais || '')
      setValue('moneda', profile.moneda || 'COP')
      setValue('frecuenciaRecordatorios', profile.frecuenciaRecordatorios || 'semanal')
      setValue('frecuenciaInformes', profile.frecuenciaInformes || 'mensual')
    }
  }, [profile, setValue])

  const updateFieldState = (fieldName: FieldName, state: Partial<FieldState>) => {
    setFieldStates(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], ...state }
    }))
  }

  const clearFieldState = useCallback((fieldName: FieldName) => {
    setTimeout(() => {
      updateFieldState(fieldName, { isSuccess: false, isError: false })
    }, 2000)
  }, [])

  const updateSingleField = async (fieldName: FieldName, value: any) => {
    if (!profile?.id) {
      toast.error('Error: Usuario no encontrado')
      return
    }

    // Validar el campo individual
    try {
      const fieldSchema = profileSchema.pick({ [fieldName]: true } as any)
      fieldSchema.parse({ [fieldName]: value })
    } catch (error) {
      updateFieldState(fieldName, { isError: true })
      clearFieldState(fieldName)
      return
    }

    updateFieldState(fieldName, { isLoading: true, isError: false, isSuccess: false })

    try {
      const updateData: Partial<UpdateUserProfileData> = {
        [fieldName]: value
      }

      await apiService.updateUserProfile(profile.id, updateData)
      await refreshProfile()
      
      updateFieldState(fieldName, { isLoading: false, isSuccess: true })
      clearFieldState(fieldName)
      
      // Toast más sutil para cambios individuales
      toast.success(`${getFieldLabel(fieldName)} actualizado`, {
        duration: 2000,
        style: { fontSize: '14px' }
      })
      
      onProfileUpdate?.()
    } catch (error: any) {
      console.error(`Error updating ${fieldName}:`, error)
      updateFieldState(fieldName, { isLoading: false, isError: true })
      clearFieldState(fieldName)
      toast.error(`Error al actualizar ${getFieldLabel(fieldName).toLowerCase()}`)
    }
  }

  const getFieldLabel = (fieldName: FieldName): string => {
    const labels: Record<FieldName, string> = {
      nombreCompleto: 'Nombre',
      email: 'Email',
      numeroWhatsapp: 'WhatsApp',
      pais: 'País',
      moneda: 'Moneda',
      frecuenciaRecordatorios: 'Recordatorios',
      frecuenciaInformes: 'Informes'
    }
    return labels[fieldName]
  }

  const getFieldIcon = (fieldName: FieldName) => {
    const state = fieldStates[fieldName]
    if (state.isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
    }
    if (state.isSuccess) {
      return <Check className="h-4 w-4 text-green-500" />
    }
    if (state.isError) {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    return null
  }

  const handleInputBlur = (fieldName: FieldName, value: string) => {
    if (value !== profile?.[fieldName]) {
      updateSingleField(fieldName, value)
    }
  }

  const handleSelectChange = (fieldName: FieldName, value: any) => {
    setValue(fieldName, value)
    if (value !== profile?.[fieldName]) {
      updateSingleField(fieldName, value)
    }
  }

  const handleCountryChange = (countryCode: string) => {
    setValue('pais', countryCode)
    const country = COUNTRY.find(c => c.code === countryCode)
    if (country) {
      setValue('moneda', country.currency)
      // Update both fields
      if (countryCode !== profile?.pais) {
        updateSingleField('pais', countryCode)
      }
      if (country.currency !== profile?.moneda) {
        updateSingleField('moneda', country.currency)
      }
    } else {
      if (countryCode !== profile?.pais) {
        updateSingleField('pais', countryCode)
      }
    }
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Cargando información del perfil...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información Personal</CardTitle>
        <CardDescription>
          Los cambios se guardan automáticamente cuando termines de editar cada campo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre completo */}
          <div className="space-y-2">
            <Label htmlFor="nombreCompleto" className="flex items-center gap-2">
              Nombre completo
              {getFieldIcon('nombreCompleto')}
            </Label>
            <Input
              id="nombreCompleto"
              {...register('nombreCompleto')}
              placeholder="Tu nombre completo"
              onBlur={(e) => handleInputBlur('nombreCompleto', e.target.value)}
              disabled={fieldStates.nombreCompleto.isLoading}
            />
            {errors.nombreCompleto && (
              <p className="text-sm text-red-500">{errors.nombreCompleto.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              Correo electrónico
              {getFieldIcon('email')}
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="tu@email.com"
              onBlur={(e) => handleInputBlur('email', e.target.value)}
              disabled={fieldStates.email.isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="numeroWhatsapp" className="flex items-center gap-2">
              Número de WhatsApp
              {getFieldIcon('numeroWhatsapp')}
            </Label>
            <Input
              id="numeroWhatsapp"
              {...register('numeroWhatsapp')}
              placeholder="+57 300 123 4567"
              onBlur={(e) => handleInputBlur('numeroWhatsapp', e.target.value)}
              disabled={fieldStates.numeroWhatsapp.isLoading}
            />
            {errors.numeroWhatsapp && (
              <p className="text-sm text-red-500">{errors.numeroWhatsapp.message}</p>
            )}
          </div>

          {/* País */}
          <div className="space-y-2">
            <Label htmlFor="pais" className="flex items-center gap-2">
              País
              {getFieldIcon('pais')}
            </Label>
            <Select 
              value={watch('pais')} 
              onValueChange={handleCountryChange}
              disabled={fieldStates.pais.isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu país" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <div className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.pais && (
              <p className="text-sm text-red-500">{errors.pais.message}</p>
            )}
          </div>

          {/* Moneda */}
          <div className="space-y-2">
            <Label htmlFor="moneda" className="flex items-center gap-2">
              Moneda
              {getFieldIcon('moneda')}
            </Label>
            <Select 
              value={watch('moneda')} 
              onValueChange={(value) => handleSelectChange('moneda', value)}
              disabled={fieldStates.moneda.isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu moneda" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center gap-2">
                      <span>{currency.symbol}</span>
                      <span>{currency.name} ({currency.code})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.moneda && (
              <p className="text-sm text-red-500">{errors.moneda.message}</p>
            )}
          </div>

          {/* Frecuencia de recordatorios */}
          <div className="space-y-2">
            <Label htmlFor="frecuenciaRecordatorios" className="flex items-center gap-2">
              Frecuencia de recordatorios
              {getFieldIcon('frecuenciaRecordatorios')}
            </Label>
            <Select 
              value={watch('frecuenciaRecordatorios')} 
              onValueChange={(value: FrecuenciaNotificacion) => handleSelectChange('frecuenciaRecordatorios', value)}
              disabled={fieldStates.frecuenciaRecordatorios.isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la frecuencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nunca">Nunca</SelectItem>
                <SelectItem value="diario">Diario</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensual">Mensual</SelectItem>
              </SelectContent>
            </Select>
            {errors.frecuenciaRecordatorios && (
              <p className="text-sm text-red-500">{errors.frecuenciaRecordatorios.message}</p>
            )}
          </div>

          {/* Frecuencia de informes */}
          <div className="space-y-2">
            <Label htmlFor="frecuenciaInformes" className="flex items-center gap-2">
              Frecuencia de informes
              {getFieldIcon('frecuenciaInformes')}
            </Label>
            <Select 
              value={watch('frecuenciaInformes')} 
              onValueChange={(value: FrecuenciaNotificacion) => handleSelectChange('frecuenciaInformes', value)}
              disabled={fieldStates.frecuenciaInformes.isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la frecuencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nunca">Nunca</SelectItem>
                <SelectItem value="diario">Diario</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensual">Mensual</SelectItem>
              </SelectContent>
            </Select>
            {errors.frecuenciaInformes && (
              <p className="text-sm text-red-500">{errors.frecuenciaInformes.message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}