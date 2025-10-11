'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { DatePicker } from '@/components/ui/date-picker'
import { Loader2 } from 'lucide-react'
import { UserSubscription, CreateUserSubscriptionDto, UpdateUserSubscriptionDto } from '@/types'

const subscriptionSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  descripcion: z.string().optional(),
  monto: z.number().min(0, 'El monto debe ser mayor a 0'),
  frecuencia: z.enum(['DIARIA', 'SEMANAL', 'MENSUAL', 'ANUAL']),
  fechaInicio: z.date(),
  fechaProximoPago: z.date().optional(),
  activa: z.boolean().default(true),
  sitioWeb: z.string().url('URL inválida').optional().or(z.literal('')),
  notas: z.string().optional(),
  categoryId: z.string().optional()
})

type SubscriptionFormData = z.infer<typeof subscriptionSchema>

interface SubscriptionFormProps {
  subscription?: UserSubscription
  onSubmit: (data: CreateUserSubscriptionDto | UpdateUserSubscriptionDto) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  categories?: Array<{ id: string; nombre: string }>
}

const frequencyOptions = [
  { value: 'DIARIA', label: 'Diario' },
  { value: 'SEMANAL', label: 'Semanal' },
  { value: 'MENSUAL', label: 'Mensual' },
  { value: 'ANUAL', label: 'Anual' }
]

export function SubscriptionForm({
  subscription,
  onSubmit,
  onCancel,
  loading = false,
  categories = []
}: SubscriptionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = !!subscription

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      monto: 0,
      frecuencia: 'MENSUAL',
      fechaInicio: new Date(),
      activa: true,
      sitioWeb: '',
      notas: '',
      categoryId: ''
    }
  })

  const watchedValues = watch()

  // Cargar datos de suscripción existente
  useEffect(() => {
    if (subscription) {
      reset({
        nombre: subscription.nombre,
        descripcion: subscription.descripcion || '',
        monto: subscription.monto,
        frecuencia: subscription.frecuencia,
        fechaInicio: new Date(subscription.fechaInicio),
        fechaProximoPago: subscription.fechaProximoPago ? new Date(subscription.fechaProximoPago) : undefined,
        activa: subscription.activa,
        sitioWeb: subscription.sitioWeb || '',
        notas: subscription.notas || '',
        categoryId: subscription.categoria?.id?.toString() || ''
      })
    }
  }, [subscription, reset])

  const handleFormSubmit = async (data: SubscriptionFormData) => {
    setIsSubmitting(true)
    try {
      const submitData = {
        ...data,
        fechaInicio: data.fechaInicio.toISOString(),
        fechaProximoPago: data.fechaProximoPago?.toISOString() || undefined,
        sitioWeb: data.sitioWeb || undefined,
        descripcion: data.descripcion || undefined,
        notas: data.notas || undefined,
        categoryId: data.categoryId || undefined
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Información básica */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="nombre">Nombre de la suscripción *</Label>
          <Input
            id="nombre"
            {...register('nombre')}
            placeholder="ej. Netflix, Spotify, Amazon Prime..."
            className={errors.nombre ? 'border-red-500' : ''}
          />
          {errors.nombre && (
            <p className="text-sm text-red-500 mt-1">{errors.nombre.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            {...register('descripcion')}
            placeholder="Descripción opcional del servicio..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="monto">Monto *</Label>
            <Input
              id="monto"
              type="number"
              step="0.01"
              min="0"
              {...register('monto', { valueAsNumber: true })}
              placeholder="0.00"
              className={errors.monto ? 'border-red-500' : ''}
            />
            {errors.monto && (
              <p className="text-sm text-red-500 mt-1">{errors.monto.message}</p>
            )}
          </div>

          <div>
            <Label>Frecuencia de pago *</Label>
            <Select
              value={watchedValues.frecuencia}
              onValueChange={(value) => setValue('frecuencia', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar frecuencia" />
              </SelectTrigger>
              <SelectContent>
                {frequencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Fecha de inicio *</Label>
            <DatePicker
              date={watchedValues.fechaInicio}
              onDateChange={(date) => setValue('fechaInicio', date || new Date())}
              placeholder="Seleccionar fecha de inicio"
              variant="default"
            />
          </div>

          <div>
            <Label>Próximo pago</Label>
            <DatePicker
              date={watchedValues.fechaProximoPago}
              onDateChange={(date) => setValue('fechaProximoPago', date)}
              placeholder="Seleccionar fecha de próximo pago (opcional)"
              variant="default"
            />
          </div>
        </div>

        {/* Categoría */}
        {categories.length > 0 && (
          <div>
            <Label>Categoría</Label>
            <Select
              value={watchedValues.categoryId}
              onValueChange={(value) => setValue('categoryId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin categoría</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Información adicional */}
        <div>
          <Label htmlFor="sitioWeb">Sitio web</Label>
          <Input
            id="sitioWeb"
            type="url"
            {...register('sitioWeb')}
            placeholder="https://ejemplo.com"
            className={errors.sitioWeb ? 'border-red-500' : ''}
          />
          {errors.sitioWeb && (
            <p className="text-sm text-red-500 mt-1">{errors.sitioWeb.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="notas">Notas</Label>
          <Textarea
            id="notas"
            {...register('notas')}
            placeholder="Notas adicionales sobre la suscripción..."
            rows={3}
          />
        </div>

        {/* Estado activo */}
        <div className="flex items-center space-x-2">
          <Switch
            id="activa"
            checked={watchedValues.activa}
            onCheckedChange={(checked) => setValue('activa', checked)}
          />
          <Label htmlFor="activa">Suscripción activa</Label>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || loading}
          >
            Cancelar
          </Button>
        )}
        
        <Button
          type="submit"
          disabled={isSubmitting || loading}
          className="min-w-[120px]"
        >
          {(isSubmitting || loading) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isEditing ? 'Actualizar' : 'Crear'} suscripción
        </Button>
      </div>
    </form>
  )
}