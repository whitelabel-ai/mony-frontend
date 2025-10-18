'use client'

import { useState, useMemo, useCallback } from 'react'
import type { Categoria } from '@/types'

interface CategoryFilters {
  search: string
  type: 'all' | 'Ingreso' | 'Gasto'
  status: 'all' | 'active' | 'inactive'
  sortBy: 'name' | 'type' | 'created' | 'budget'
  sortOrder: 'asc' | 'desc'
}

interface UseCategoryFiltersReturn {
  filters: CategoryFilters
  filteredCategories: Categoria[]
  setSearch: (search: string) => void
  setType: (type: CategoryFilters['type']) => void
  setStatus: (status: CategoryFilters['status']) => void
  setSortBy: (sortBy: CategoryFilters['sortBy']) => void
  setSortOrder: (sortOrder: CategoryFilters['sortOrder']) => void
  resetFilters: () => void
  hasActiveFilters: boolean
}

const defaultFilters: CategoryFilters = {
  search: '',
  type: 'all',
  status: 'all',
  sortBy: 'name',
  sortOrder: 'asc'
}

export function useCategoryFilters(categories: Categoria[]): UseCategoryFiltersReturn {
  const [filters, setFilters] = useState<CategoryFilters>(defaultFilters)

  const setSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }))
  }, [])

  const setType = useCallback((type: CategoryFilters['type']) => {
    setFilters(prev => ({ ...prev, type }))
  }, [])

  const setStatus = useCallback((status: CategoryFilters['status']) => {
    setFilters(prev => ({ ...prev, status }))
  }, [])

  const setSortBy = useCallback((sortBy: CategoryFilters['sortBy']) => {
    setFilters(prev => ({ ...prev, sortBy }))
  }, [])

  const setSortOrder = useCallback((sortOrder: CategoryFilters['sortOrder']) => {
    setFilters(prev => ({ ...prev, sortOrder }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== '' ||
      filters.type !== 'all' ||
      filters.status !== 'all' ||
      filters.sortBy !== 'name' ||
      filters.sortOrder !== 'asc'
    )
  }, [filters])

  const filteredCategories = useMemo(() => {
    let result = [...categories]

    // Filtrar por búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(category =>
        category.nombre.toLowerCase().includes(searchLower) ||
        category.descripcion?.toLowerCase().includes(searchLower)
      )
    }

    // Filtrar por tipo
    if (filters.type !== 'all') {
      result = result.filter(category => category.tipo === filters.type)
    }

    // Filtrar por estado
    if (filters.status !== 'all') {
      const isActive = filters.status === 'active'
      result = result.filter(category => category.activa === isActive)
    }

    // Ordenar
    result.sort((a, b) => {
      let comparison = 0

      switch (filters.sortBy) {
        case 'name':
          comparison = a.nombre.localeCompare(b.nombre)
          break
        case 'type':
          comparison = a.tipo.localeCompare(b.tipo)
          break
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'budget':
          const budgetA = a.presupuestoMensual || 0
          const budgetB = b.presupuestoMensual || 0
          comparison = budgetA - budgetB
          break
        default:
          comparison = 0
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison
    })

    return result
  }, [categories, filters])

  return {
    filters,
    filteredCategories,
    setSearch,
    setType,
    setStatus,
    setSortBy,
    setSortOrder,
    resetFilters,
    hasActiveFilters
  }
}