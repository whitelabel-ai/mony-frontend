'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { transactionsApi } from '@/lib/transactions-api'
import type { Transaction, CreateTransactionDto, UpdateTransactionDto, Categoria } from '@/types'
import { toast } from 'react-hot-toast'

// Schema de validación
const transactionSchema = z.object({
  monto: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  descripcion: z.string().min(1, 'La descripción es requerida').max(255, 'Máximo 255 caracteres'),
  tipo: z.enum(['INGRESO', 'GASTO'], {
    required_error: 'El tipo de transacción es requerido'
  }),
  idCategoria: z.string().min(1, 'La categoría es requerida'),
  fechaTransaccion: z.date({
    required_error: 'La fecha es requerida'
  }),
  moneda: z.string().default('COP'),
  notas: z.string().optional()
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  transaction?: Transaction
  onSuccess?: () => void
  onCancel?: () => void
  mode?: 'create' | 'edit' | 'view'
}

export function TransactionForm({ 
  transaction, 
  onSuccess, 
  onCancel, 
  mode = 'create' 
}: TransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Categoria[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction ? {
      monto: transaction.monto,
      descripcion: transaction.descripcion,
      tipo: transaction.tipo,
      idCategoria: transaction.categoria?.id || '',
      fechaTransaccion: new Date(transaction.fechaTransaccion),
      moneda: transaction.moneda || 'COP',
      notas: transaction.notas || ''
    } : {
      monto: 0,
      descripcion: '',
      tipo: 'GASTO',
      idCategoria: '',
      fechaTransaccion: new Date(),
      moneda: 'COP',
      notas: ''
    }
  })

  // Watch specific fields for reactive updates
  const watchedType = watch('tipo')
  const watchedDate = watch('fechaTransaccion')

  // Cargar categorías
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true)
        const data = await transactionsApi.getCategories()
        setCategories(data)
      } catch (error) {
        console.error('Error al cargar categorías:', error)
        toast.error('Error al cargar las categorías')
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  // Filter categories based on transaction type
  const filteredCategories = categories.filter(cat => {
    if (watchedType === 'INGRESO') {
      return cat.tipo === 'INGRESO'
    } else if (watchedType === 'GASTO') {
      return cat.tipo === 'GASTO'
    }
    return false
  })

  const onSubmit = async (data: TransactionFormData) => {
    try {
      setIsLoading(true)
      
      if (mode === 'edit' && transaction) {
        const updateData: UpdateTransactionDto = {
          monto: data.monto,
          descripcion: data.descripcion,
          tipo: data.tipo,
          idCategoria: data.idCategoria,
          fechaTransaccion: data.fechaTransaccion.toISOString(),
          moneda: data.moneda
        }
        await transactionsApi.updateTransaction(transaction.id, updateData)
        toast.success('Transacción actualizada exitosamente')
      } else {
        const createData: CreateTransactionDto = {
          descripcion: data.descripcion,
          monto: data.monto,
          moneda: data.moneda,
          tipo: data.tipo,
          fechaTransaccion: data.fechaTransaccion.toISOString(),
          idCategoria: data.idCategoria
        }
        await transactionsApi.createTransaction(createData)
        toast.success('Transacción creada exitosamente')
      }
      
      onSuccess?.()
    } catch (error: any) {
      console.error('Error al guardar transacción:', error)
      toast.error(error.response?.data?.message || 'Error al guardar la transacción')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    reset()
    onCancel?.()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === 'edit' ? 'Editar Transacción' : 'Nueva Transacción'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Tipo de transacción */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Transacción *</Label>
            <Select
              value={watchedType}
              onValueChange={(value) => {
                setValue('tipo', value as 'INGRESO' | 'GASTO')
                setValue('idCategoria', '') // Reset category when type changes
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INGRESO">Ingreso</SelectItem>
                <SelectItem value="GASTO">Gasto</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo && (
              <p className="text-sm text-red-500">{errors.tipo.message}</p>
            )}
          </div>

          {/* Monto */}
          <div className="space-y-2">
            <Label htmlFor="monto">Monto *</Label>
            <Input
              id="monto"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register('monto', { valueAsNumber: true })}
            />
            {errors.monto && (
              <p className="text-sm text-red-500">{errors.monto.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción *</Label>
            <Input
              id="descripcion"
              placeholder="Descripción de la transacción"
              {...register('descripcion')}
            />
            {errors.descripcion && (
              <p className="text-sm text-red-500">{errors.descripcion.message}</p>
            )}
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="idCategoria">Categoría *</Label>
            <Select
              value={watch('idCategoria')}
              onValueChange={(value) => setValue('idCategoria', value)}
              disabled={loadingCategories}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <span className="flex items-center gap-2">
                      <span>{category.icono}</span>
                      <span>{category.nombre}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.idCategoria && (
              <p className="text-sm text-red-500">{errors.idCategoria.message}</p>
            )}
            {loadingCategories && (
              <p className="text-sm text-muted-foreground">Cargando categorías...</p>
            )}
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <Label>Fecha *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !watchedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watchedDate ? (
                    format(watchedDate, "PPP", { locale: es })
                  ) : (
                    <span>Selecciona una fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={watchedDate}
                  onSelect={(date: Date | undefined) => date && setValue('fechaTransaccion', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.fechaTransaccion && (
              <p className="text-sm text-red-500">{errors.fechaTransaccion.message}</p>
            )}
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas (Opcional)</Label>
            <Textarea
              id="notas"
              placeholder="Notas adicionales sobre la transacción"
              rows={3}
              {...register('notas')}
            />
            {errors.notas && (
              <p className="text-sm text-red-500">{errors.notas.message}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'edit' ? 'Actualizar' : 'Crear'} Transacción
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}