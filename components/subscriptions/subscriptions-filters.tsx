'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal 
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface SubscriptionsFiltersProps {
  onSearch: (searchTerm: string) => void
  onFilterChange: (filters: FilterOptions) => void
  onClearFilters: () => void
  categories?: Array<{ id: string; nombre: string }>
  loading?: boolean
}

interface FilterOptions {
  activa?: boolean
  frecuencia?: 'DIARIA' | 'SEMANAL' | 'MENSUAL' | 'ANUAL'
  categoryId?: string
}

const frequencyOptions = [
  { value: 'diario', label: 'Diario' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensual', label: 'Mensual' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'anual', label: 'Anual' },
  { value: 'nunca', label: 'Nunca' }
]

export function SubscriptionsFilters({
  onSearch,
  onFilterChange,
  onClearFilters,
  categories = [],
  loading = false
}: SubscriptionsFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({})
  const [showFilters, setShowFilters] = useState(false)

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    onSearch(value)
  }

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilter = (key: keyof FilterOptions) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setFilters({})
    onSearch('')
    onClearFilters()
  }

  const activeFiltersCount = Object.keys(filters).filter(key => 
    filters[key as keyof FilterOptions] !== undefined
  ).length

  const hasActiveFilters = activeFiltersCount > 0 || searchTerm.length > 0

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar suscripciones..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
            disabled={loading}
          />
        </div>

        {/* Botón de filtros */}
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filtros</h4>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-auto p-1 text-xs"
                  >
                    Limpiar todo
                  </Button>
                )}
              </div>

              {/* Estado activo */}
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={filters.activa?.toString() || ''}
                  onValueChange={(value) => 
                    handleFilterChange('activa', value === '' ? undefined : value === 'true')
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los estados</SelectItem>
                    <SelectItem value="true">Solo activas</SelectItem>
                    <SelectItem value="false">Solo pausadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Frecuencia */}
              <div className="space-y-2">
                <Label>Frecuencia</Label>
                <Select
                  value={filters.frecuencia || ''}
                  onValueChange={(value) => 
                    handleFilterChange('frecuencia', value === '' ? undefined : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las frecuencias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las frecuencias</SelectItem>
                    {frequencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Categoría */}
              {categories.length > 0 && (
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select
                    value={filters.categoryId || ''}
                    onValueChange={(value) => 
                      handleFilterChange('categoryId', value === '' ? undefined : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las categorías</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Search className="h-3 w-3" />
              "{searchTerm}"
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => handleSearchChange('')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.activa !== undefined && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Filter className="h-3 w-3" />
              {filters.activa ? 'Activas' : 'Pausadas'}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => clearFilter('activa')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.frecuencia && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Filter className="h-3 w-3" />
              {frequencyOptions.find(f => f.value === filters.frecuencia)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => clearFilter('frecuencia')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.categoryId && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Filter className="h-3 w-3" />
              {categories.find(c => c.id === filters.categoryId)?.nombre}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => clearFilter('categoryId')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}