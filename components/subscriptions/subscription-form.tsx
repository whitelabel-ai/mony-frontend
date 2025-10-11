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
import { UserSubscription, CreateUserSubscriptionDto, UpdateUserSubscriptionDto, Categoria } from '@/types'
import { transactionsApi } from '@/lib/transactions-api'
import { toast } from 'react-hot-toast'

const subscriptionSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  descripcion: z.string().optional(),
  monto: z.number().min(0, 'El monto debe ser mayor a 0'),
  frecuencia: z.enum(['diario', 'semanal', 'mensual', 'trimestral', 'anual', 'nunca']),
  fechaInicio: z.date(),
  activa: z.boolean().default(true),
  categoryId: z.string().optional()
})

type SubscriptionFormData = z.infer<typeof subscriptionSchema>

interface SubscriptionFormProps {
  subscription?: UserSubscription
  onSubmit: (data: CreateUserSubscriptionDto | UpdateUserSubscriptionDto) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

const frequencyOptions = [
  { value: 'diario', label: 'Diario' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensual', label: 'Mensual' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'anual', label: 'Anual' },
  { value: 'nunca', label: 'Nunca' }
]

export function SubscriptionForm({
  subscription,
  onSubmit,
  onCancel,
  loading = false
}: SubscriptionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Categoria[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)

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
      frecuencia: 'mensual',
      fechaInicio: new Date(),
      activa: true,
      categoryId: ''
    }
  })

  const watchedValues = watch()

  // Cargar categorías de tipo "Gasto"
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true)
        const data = await transactionsApi.getCategories()
        // Filtrar solo categorías de tipo "Gasto" para suscripciones
        const expenseCategories = data.filter(cat => cat.tipo === 'Gasto')
        setCategories(expenseCategories)
      } catch (error) {
        console.error('Error al cargar categorías:', error)
        toast.error('Error al cargar las categorías')
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  // Cargar datos de suscripción existente
  useEffect(() => {
    if (subscription) {
      reset({
        nombre: subscription.nombre,
        descripcion: subscription.descripcion || '',
        monto: subscription.monto,
        frecuencia: subscription.frecuencia,
        fechaInicio: new Date(subscription.fechaInicio),
        activa: subscription.activa,
        categoryId: subscription.categoria?.id?.toString() || ''
      })
    }
  }, [subscription, reset])

  const handleFormSubmit = async (data: SubscriptionFormData) => {
    setIsSubmitting(true)
    try {
      const submitData = {
        nombre: data.nombre,
        descripcion: data.descripcion || undefined,
        monto: data.monto,
        frecuencia: data.frecuencia,
        fechaInicio: data.fechaInicio.toISOString(),
        activa: data.activa,
        categoryId: data.categoryId && data.categoryId !== 'none' ? data.categoryId : undefined
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
        <div>
          <Label>Fecha de inicio *</Label>
          <DatePicker
            value={watchedValues.fechaInicio}
            onChange={(date: Date | undefined) => setValue('fechaInicio', date || new Date())}
            placeholder="Seleccionar fecha de inicio"
          />
          <p className="text-sm text-gray-500 mt-1">
            El próximo pago se calculará automáticamente basado en la frecuencia seleccionada
          </p>
        </div>

        {/* Categoría */}
        <div>
          <Label>Categoría</Label>
          <Select
            value={watchedValues.categoryId}
            onValueChange={(value) => setValue('categoryId', value)}
            disabled={loadingCategories}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                loadingCategories 
                  ? "Cargando categorías..." 
                  : "Seleccionar categoría (opcional)"
              } />
            </SelectTrigger>
            <SelectContent>
               <SelectItem value="none">Sin categoría</SelectItem>
               {categories.map((category) => (
                 <SelectItem key={category.id} value={category.id.toString()}>
                   {category.nombre}
                 </SelectItem>
               ))}
             </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-1">
            Las suscripciones se categorizan como gastos automáticamente
          </p>
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