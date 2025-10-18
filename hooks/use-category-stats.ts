'use client'

import { useState, useEffect, useCallback } from 'react'
import { categoriesApi } from '@/lib/api/categories-api'
import type { CategoryStats, TopCategory } from '@/types'

interface UseCategoryStatsReturn {
  stats: CategoryStats[]
  topCategories: TopCategory[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  refreshStats: () => Promise<void>
}

export function useCategoryStats(): UseCategoryStatsReturn {
  const [stats, setStats] = useState<CategoryStats[]>([])
  const [topCategories, setTopCategories] = useState<TopCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [statsData, topCategoriesData] = await Promise.all([
        categoriesApi.getCategoryStats(),
        categoriesApi.getTopCategories(5)
      ])
      
      setStats(statsData)
      setTopCategories(topCategoriesData)
    } catch (err: any) {
      console.error('Error al cargar estadísticas de categorías:', err)
      setError(err.response?.data?.message || 'Error al cargar las estadísticas')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshStats = useCallback(async () => {
    await fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    topCategories,
    loading,
    error,
    refetch: fetchStats,
    refreshStats
  }
}