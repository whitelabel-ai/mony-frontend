'use client'

import React, { useState, useEffect } from 'react'
import { DateRange } from 'react-day-picker'
import { Search, Filter, X, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { DateRangePicker } from './date-range-picker'
import { Categoria } from '@/types'

export interface TransactionFilters {
  search?: string
  dateRange?: DateRange
  tipo?: 'Ingreso' | 'Gasto' | 'all'
  categoria?: string
  montoMin?: number
  montoMax?: number
  moneda?: string
}

interface TransactionFiltersProps {
  filters: TransactionFilters
  onFiltersChange: (filters: TransactionFilters) => void
  categories: Categoria[]
  className?: string
}

const tipoOptions = [
  { value: 'all', label: 'Todos los tipos', icon: DollarSign },
  { value: 'Ingreso', label: 'Ingresos', icon: TrendingUp },
  { value: 'Gasto', label: 'Gastos', icon: TrendingDown },
]

const monedaOptions = [
  { value: 'COP', label: 'COP - Peso Colombiano' },
  { value: 'USD', label: 'USD - Dólar Americano' },
  { value: 'EUR', label: 'EUR - Euro' },
]

export function TransactionFilters({
  filters,
  onFiltersChange,
  categories,
  className
}: TransactionFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<TransactionFilters>(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const updateFilter = (key: keyof TransactionFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters: TransactionFilters = {
      search: '',
      dateRange: undefined,
      tipo: 'all',
      categoria: '',
      montoMin: undefined,
      montoMax: undefined,
      moneda: ''
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (localFilters.search) count++
    if (localFilters.dateRange?.from) count++
    if (localFilters.tipo && localFilters.tipo !== 'all') count++
    if (localFilters.categoria) count++
    if (localFilters.montoMin !== undefined) count++
    if (localFilters.montoMax !== undefined) count++
    if (localFilters.moneda) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar transacciones..."
            value={localFilters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Type Filter */}
        <Select
          value={localFilters.tipo || 'all'}
          onValueChange={(value) => updateFilter('tipo', value === 'all' ? undefined : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            {tipoOptions.map((option) => {
              const Icon = option.icon
              return (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>

        {/* Advanced Filters Sheet */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Filtros Avanzados</SheetTitle>
              <SheetDescription>
                Configura filtros detallados para encontrar las transacciones que necesitas.
              </SheetDescription>
            </SheetHeader>
            
            <div className="grid gap-6 py-6">
              {/* Date Range */}
              <div className="space-y-2">
                <Label>Rango de Fechas</Label>
                <DateRangePicker
                  date={localFilters.dateRange}
                  onDateChange={(dateRange) => updateFilter('dateRange', dateRange)}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select
                  value={localFilters.categoria || ''}
                  onValueChange={(value) => updateFilter('categoria', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las categorías</SelectItem>
                    {categories.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id.toString()}>
                        {categoria.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Range */}
              <div className="space-y-2">
                <Label>Rango de Monto</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-sm text-gray-500">Mínimo</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={localFilters.montoMin || ''}
                      onChange={(e) => updateFilter('montoMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Máximo</Label>
                    <Input
                      type="number"
                      placeholder="Sin límite"
                      value={localFilters.montoMax || ''}
                      onChange={(e) => updateFilter('montoMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </div>
                </div>
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <Label>Moneda</Label>
                <Select
                  value={localFilters.moneda || ''}
                  onValueChange={(value) => updateFilter('moneda', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las monedas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las monedas</SelectItem>
                    {monedaOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar Filtros
                </Button>
                <Button 
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                >
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {localFilters.search && (
            <Badge variant="secondary" className="gap-1">
              Búsqueda: {localFilters.search}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('search', '')}
              />
            </Badge>
          )}
          {localFilters.dateRange?.from && (
            <Badge variant="secondary" className="gap-1">
              Fecha: {localFilters.dateRange.from.toLocaleDateString()}
              {localFilters.dateRange.to && ` - ${localFilters.dateRange.to.toLocaleDateString()}`}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('dateRange', undefined)}
              />
            </Badge>
          )}
          {localFilters.tipo && localFilters.tipo !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Tipo: {localFilters.tipo}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('tipo', 'all')}
              />
            </Badge>
          )}
          {localFilters.categoria && (
            <Badge variant="secondary" className="gap-1">
              Categoría: {categories.find(c => c.id.toString() === localFilters.categoria)?.nombre}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('categoria', '')}
              />
            </Badge>
          )}
          {(localFilters.montoMin !== undefined || localFilters.montoMax !== undefined) && (
            <Badge variant="secondary" className="gap-1">
              Monto: {localFilters.montoMin || 0} - {localFilters.montoMax || '∞'}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  updateFilter('montoMin', undefined)
                  updateFilter('montoMax', undefined)
                }}
              />
            </Badge>
          )}
          {localFilters.moneda && (
            <Badge variant="secondary" className="gap-1">
              Moneda: {localFilters.moneda}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('moneda', '')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

export default TransactionFilters