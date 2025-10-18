'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { categoriesApi } from '@/lib/api/categories-api'
import type { Categoria, CreateCategoryDto, UpdateCategoryDto } from '@/types'

interface UseCategoriesReturn {
  categories: Categoria[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createCategory: (data: CreateCategoryDto) => Promise<Categoria | null>
  updateCategory: (id: number, data: UpdateCategoryDto) => Promise<Categoria | null>
  deleteCategory: (id: number) => Promise<boolean>
  toggleCategoryStatus: (id: number) => Promise<boolean>
  duplicateCategory: (id: number, newName?: string) => Promise<Categoria | null>
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await categoriesApi.getCategories()
      setCategories(data)
    } catch (err: any) {
      console.error('Error al cargar categorías:', err)
      setError(err.response?.data?.message || 'Error al cargar las categorías')
    } finally {
      setLoading(false)
    }
  }, [])

  const createCategory = useCallback(async (data: CreateCategoryDto): Promise<Categoria | null> => {
    try {
      const newCategory = await categoriesApi.createCategory(data)
      setCategories(prev => [...prev, newCategory])
      toast.success('Categoría creada exitosamente')
      return newCategory
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error al crear la categoría'
      toast.error(message)
      console.error('Error al crear categoría:', err)
      return null
    }
  }, [])

  const updateCategory = useCallback(async (id: number, data: UpdateCategoryDto): Promise<Categoria | null> => {
    try {
      const updatedCategory = await categoriesApi.updateCategory(id, data)
      setCategories(prev => prev.map(cat => cat.id === id ? updatedCategory : cat))
      toast.success('Categoría actualizada exitosamente')
      return updatedCategory
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error al actualizar la categoría'
      toast.error(message)
      console.error('Error al actualizar categoría:', err)
      return null
    }
  }, [])

  const deleteCategory = useCallback(async (id: number): Promise<boolean> => {
    try {
      // Verificar si se puede eliminar
      const { canDelete, transactionCount } = await categoriesApi.canDeleteCategory(id)
      
      if (!canDelete) {
        toast.error(`No se puede eliminar la categoría porque tiene ${transactionCount} transacciones asociadas`)
        return false
      }

      await categoriesApi.deleteCategory(id)
      setCategories(prev => prev.filter(cat => cat.id !== id))
      toast.success('Categoría eliminada exitosamente')
      return true
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error al eliminar la categoría'
      toast.error(message)
      console.error('Error al eliminar categoría:', err)
      return false
    }
  }, [])

  const toggleCategoryStatus = useCallback(async (id: number): Promise<boolean> => {
    try {
      const updatedCategory = await categoriesApi.toggleCategoryStatus(id)
      setCategories(prev => prev.map(cat => cat.id === id ? updatedCategory : cat))
      toast.success(`Categoría ${updatedCategory.activa ? 'activada' : 'desactivada'} exitosamente`)
      return true
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error al cambiar el estado de la categoría'
      toast.error(message)
      console.error('Error al cambiar estado de categoría:', err)
      return false
    }
  }, [])

  const duplicateCategory = useCallback(async (id: number, newName?: string): Promise<Categoria | null> => {
    try {
      const duplicatedCategory = await categoriesApi.duplicateCategory(id, newName)
      setCategories(prev => [...prev, duplicatedCategory])
      toast.success('Categoría duplicada exitosamente')
      return duplicatedCategory
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error al duplicar la categoría'
      toast.error(message)
      console.error('Error al duplicar categoría:', err)
      return null
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    duplicateCategory
  }
}