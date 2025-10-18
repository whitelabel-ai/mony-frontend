'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CATEGORY_ICONS, CATEGORY_COLORS } from '@/types'
import type { Categoria, CreateCategoryDto, UpdateCategoryDto } from '@/types'
import { CategoryIcon } from '@/components/ui/category-icon'

const categorySchema = z.object({
  nombre: z.string()
    .min(1, 'El nombre es requerido')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  tipo: z.enum(['Ingreso', 'Gasto'], {
    required_error: 'El tipo es requerido'
  }),
  icono: z.string().min(1, 'El ícono es requerido'),
  color: z.string().min(1, 'El color es requerido'),
  presupuestoMensual: z.number()
    .min(0, 'El presupuesto debe ser mayor o igual a 0')
    .optional(),
  descripcion: z.string()
    .max(200, 'La descripción no puede exceder 200 caracteres')
    .optional(),
  activa: z.boolean().default(true)
}).refine((data) => {
  // Si es tipo Ingreso, el presupuesto mensual no es requerido
  if (data.tipo === 'Ingreso') {
    return true
  }
  // Si es tipo Gasto, el presupuesto mensual es opcional pero si se proporciona debe ser válido
  return true
}, {
  message: 'Datos de categoría inválidos'
})

type CategoryFormData = z.infer<typeof categorySchema>

interface CategoryFormProps {
  category?: Categoria
  onSubmit: (data: CreateCategoryDto | UpdateCategoryDto) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function CategoryForm({ 
  category, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: CategoryFormProps) {
  const [selectedIcon, setSelectedIcon] = useState(category?.icono || CATEGORY_ICONS[0])
  const [selectedColor, setSelectedColor] = useState(category?.color || CATEGORY_COLORS[0])

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nombre: category?.nombre || '',
      tipo: category?.tipo || 'Gasto',
      icono: category?.icono || CATEGORY_ICONS[0],
      color: category?.color || CATEGORY_COLORS[0],
      presupuestoMensual: category?.presupuestoMensual || undefined,
      descripcion: category?.descripcion || '',
      activa: category?.activa ?? true
    }
  })

  useEffect(() => {
    form.setValue('icono', selectedIcon)
  }, [selectedIcon, form])

  useEffect(() => {
    form.setValue('color', selectedColor)
  }, [selectedColor, form])

  // Limpiar presupuesto mensual cuando se cambia a tipo Ingreso
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'tipo' && value.tipo === 'Ingreso') {
        form.setValue('presupuestoMensual', undefined)
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  const handleSubmit = async (data: CategoryFormData) => {
    try {
      // Convertir null a undefined para compatibilidad con DTOs
      const submitData = {
        ...data,
        presupuestoMensual: data.presupuestoMensual === null ? undefined : data.presupuestoMensual
      }
      await onSubmit(submitData)
    } catch (error) {
      console.error('Error al enviar formulario:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ej: Alimentación, Salario..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo *</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-row space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Gasto" id="gasto" />
                      <Label htmlFor="gasto">Gasto</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Ingreso" id="ingreso" />
                      <Label htmlFor="ingreso">Ingreso</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Ícono *</Label>
            <div className="grid grid-cols-6 gap-2">
              {CATEGORY_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${
                    selectedIcon === icon
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <CategoryIcon iconName={icon} className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color *</Label>
            <div className="grid grid-cols-6 gap-2">
              {CATEGORY_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    selectedColor === color
                      ? 'ring-2 ring-primary ring-offset-2'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

{form.watch('tipo') === 'Gasto' && (
          <FormField
            control={form.control}
            name="presupuestoMensual"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Presupuesto mensual</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      field.onChange(value === '' ? null : parseFloat(value))
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descripción opcional de la categoría..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="activa"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Categoría activa</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Las categorías inactivas no aparecerán en los formularios
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : category ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Form>
  )
}