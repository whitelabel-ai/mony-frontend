'use client'

import { Search, Filter, X, SortAsc, SortDesc } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CategoryFiltersProps {
  search: string
  type: 'all' | 'Ingreso' | 'Gasto'
  status: 'all' | 'active' | 'inactive'
  sortBy: 'name' | 'type' | 'created' | 'budget'
  sortOrder: 'asc' | 'desc'
  onSearchChange: (search: string) => void
  onTypeChange: (type: 'all' | 'Ingreso' | 'Gasto') => void
  onStatusChange: (status: 'all' | 'active' | 'inactive') => void
  onSortByChange: (sortBy: 'name' | 'type' | 'created' | 'budget') => void
  onSortOrderChange: (sortOrder: 'asc' | 'desc') => void
  onResetFilters: () => void
  hasActiveFilters: boolean
  totalCategories: number
  filteredCount: number
}

export function CategoryFilters({
  search,
  type,
  status,
  sortBy,
  sortOrder,
  onSearchChange,
  onTypeChange,
  onStatusChange,
  onSortByChange,
  onSortOrderChange,
  onResetFilters,
  hasActiveFilters,
  totalCategories,
  filteredCount
}: CategoryFiltersProps) {
  const getSortLabel = (sortBy: string) => {
    switch (sortBy) {
      case 'name': return 'Nombre'
      case 'type': return 'Tipo'
      case 'created': return 'Fecha de creación'
      case 'budget': return 'Presupuesto'
      default: return 'Nombre'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'all': return 'Todos los tipos'
      case 'Ingreso': return 'Ingresos'
      case 'Gasto': return 'Gastos'
      default: return 'Todos los tipos'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'all': return 'Todos los estados'
      case 'active': return 'Activas'
      case 'inactive': return 'Inactivas'
      default: return 'Todos los estados'
    }
  }

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y filtros principales */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar categorías..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={type} onValueChange={onTypeChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Ingreso">Ingresos</SelectItem>
              <SelectItem value="Gasto">Gastos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activas</SelectItem>
              <SelectItem value="inactive">Inactivas</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                <span className="ml-2 hidden sm:inline">Ordenar</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onSortByChange('name')}>
                Nombre
                {sortBy === 'name' && (
                  <span className="ml-auto">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortByChange('type')}>
                Tipo
                {sortBy === 'type' && (
                  <span className="ml-auto">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortByChange('created')}>
                Fecha de creación
                {sortBy === 'created' && (
                  <span className="ml-auto">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortByChange('budget')}>
                Presupuesto
                {sortBy === 'budget' && (
                  <span className="ml-auto">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}>
                {sortOrder === 'asc' ? 'Descendente' : 'Ascendente'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filtros activos y estadísticas */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {hasActiveFilters && (
            <>
              {search && (
                <Badge variant="secondary" className="gap-1">
                  Búsqueda: "{search}"
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onSearchChange('')}
                  />
                </Badge>
              )}
              {type !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {getTypeLabel(type)}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onTypeChange('all')}
                  />
                </Badge>
              )}
              {status !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {getStatusLabel(status)}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onStatusChange('all')}
                  />
                </Badge>
              )}
              {(sortBy !== 'name' || sortOrder !== 'asc') && (
                <Badge variant="secondary" className="gap-1">
                  {getSortLabel(sortBy)} {sortOrder === 'asc' ? '↑' : '↓'}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => {
                      onSortByChange('name')
                      onSortOrderChange('asc')
                    }}
                  />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetFilters}
                className="h-6 px-2 text-xs"
              >
                Limpiar filtros
              </Button>
            </>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          {filteredCount === totalCategories ? (
            `${totalCategories} categoría${totalCategories !== 1 ? 's' : ''}`
          ) : (
            `${filteredCount} de ${totalCategories} categoría${totalCategories !== 1 ? 's' : ''}`
          )}
        </div>
      </div>
    </div>
  )
}