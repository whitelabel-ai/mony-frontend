'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { userSubscriptionsService } from '@/lib/user-subscriptions-api'
import { 
  UserSubscription, 
  CreateUserSubscriptionDto, 
  UpdateUserSubscriptionDto,
  UserSubscriptionsResponse,
  SubscriptionSummary 
} from '@/types'

interface UseUserSubscriptionsState {
  subscriptions: UserSubscription[]
  summary: SubscriptionSummary | null
  upcomingPayments: UserSubscription[]
  loading: boolean
  error: string | null
}

interface UseUserSubscriptionsFilters {
  activa?: boolean
  frecuencia?: 'DIARIA' | 'SEMANAL' | 'MENSUAL' | 'ANUAL'
  categoryId?: string
  moneda?: string
  fechaProximoPagoAntes?: string
  fechaProximoPagoDespues?: string
}

export function useUserSubscriptions(initialFilters?: UseUserSubscriptionsFilters) {
  const [state, setState] = useState<UseUserSubscriptionsState>({
    subscriptions: [],
    summary: null,
    upcomingPayments: [],
    loading: true,
    error: null
  })

  const [filters, setFilters] = useState<UseUserSubscriptionsFilters>(initialFilters || {})

  /**
   * Cargar suscripciones con filtros actuales
   */
  const loadSubscriptions = useCallback(async (newFilters?: UseUserSubscriptionsFilters) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const currentFilters = newFilters || filters
      const response = await userSubscriptionsService.getSubscriptions(currentFilters)
      
      setState(prev => ({
        ...prev,
        subscriptions: response.subscriptions,
        summary: response.summary,
        loading: false
      }))
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }))
      toast.error(error.message)
    }
  }, [filters])



  /**
   * Cargar próximos pagos
   */
  const loadUpcomingPayments = useCallback(async (days: number = 7) => {
    try {
      const upcomingPayments = await userSubscriptionsService.getUpcomingPayments(days)
      setState(prev => ({ ...prev, upcomingPayments }))
    } catch (error: any) {
      console.error('Error loading upcoming payments:', error.message)
    }
  }, [])

  /**
   * Crear nueva suscripción
   */
  const createSubscription = async (data: CreateUserSubscriptionDto): Promise<UserSubscription> => {
    try {
      const newSubscription = await userSubscriptionsService.createSubscription(data)
      toast.success('Suscripción creada exitosamente')
      
      // Recargar datos
      await Promise.all([
        loadSubscriptions(),
        loadUpcomingPayments()
      ])
      
      return newSubscription
    } catch (error: any) {
      toast.error(error.message)
      throw error
    }
  }

  /**
   * Actualizar suscripción existente
   */
  const updateSubscription = async (id: string, data: UpdateUserSubscriptionDto): Promise<UserSubscription> => {
    try {
      const updatedSubscription = await userSubscriptionsService.updateSubscription(id, data)
      toast.success('Suscripción actualizada exitosamente')
      
      // Recargar datos
      await Promise.all([
        loadSubscriptions(),
        loadUpcomingPayments()
      ])
      
      return updatedSubscription
    } catch (error: any) {
      toast.error(error.message)
      throw error
    }
  }

  /**
   * Eliminar suscripción
   */
  const deleteSubscription = async (id: string): Promise<void> => {
    try {
      await userSubscriptionsService.deleteSubscription(id)
      toast.success('Suscripción eliminada exitosamente')
      
      // Recargar datos
      await Promise.all([
        loadSubscriptions(),
        loadUpcomingPayments()
      ])
    } catch (error: any) {
      toast.error(error.message)
      throw error
    }
  }

  /**
   * Activar/Desactivar suscripción
   */
  const toggleSubscription = async (id: string, activa: boolean): Promise<void> => {
    try {
      await userSubscriptionsService.toggleSubscription(id, activa)
      toast.success(`Suscripción ${activa ? 'activada' : 'desactivada'} exitosamente`)
      
      // Recargar datos
      await Promise.all([
        loadSubscriptions(),
        loadUpcomingPayments()
      ])
    } catch (error: any) {
      toast.error(error.message)
      throw error
    }
  }

  /**
   * Marcar suscripción como pagada
   */
  const markAsPaid = async (id: string): Promise<void> => {
    try {
      await userSubscriptionsService.markAsPaid(id)
      toast.success('Suscripción marcada como pagada')
      
      // Recargar datos
      await Promise.all([
        loadSubscriptions(),
        loadUpcomingPayments()
      ])
    } catch (error: any) {
      toast.error(error.message)
      throw error
    }
  }

  /**
   * Duplicar suscripción
   */
  const duplicateSubscription = async (id: string, newName?: string): Promise<void> => {
    try {
      await userSubscriptionsService.duplicateSubscription(id, newName)
      toast.success('Suscripción duplicada exitosamente')
      
      // Recargar datos
      await loadSubscriptions()
    } catch (error: any) {
      toast.error(error.message)
      throw error
    }
  }

  /**
   * Actualizar filtros y recargar
   */
  const updateFilters = (newFilters: Partial<UseUserSubscriptionsFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    loadSubscriptions(updatedFilters)
  }

  /**
   * Cambiar página
   */
  const changePage = (page: number) => {
    updateFilters({ page })
  }

  /**
   * Cambiar límite por página
   */
  const changeLimit = (limit: number) => {
    updateFilters({ limit, page: 1 })
  }

  /**
   * Buscar suscripciones
   */
  const search = (searchTerm: string) => {
    updateFilters({ search: searchTerm, page: 1 })
  }

  /**
   * Limpiar filtros
   */
  const clearFilters = () => {
    const defaultFilters = { page: 1, limit: 10 }
    setFilters(defaultFilters)
    loadSubscriptions(defaultFilters)
  }

  /**
   * Refrescar todos los datos
   */
  const refresh = async () => {
    await Promise.all([
      loadSubscriptions(),
      loadUpcomingPayments()
    ])
  }

  // Cargar datos iniciales
  useEffect(() => {
    Promise.all([
      loadSubscriptions(),
      loadUpcomingPayments()
    ])
  }, [])

  return {
    // Estado
    subscriptions: state.subscriptions,
    summary: state.summary,
    upcomingPayments: state.upcomingPayments,
    loading: state.loading,
    error: state.error,
    filters,

    // Acciones CRUD
    createSubscription,
    updateSubscription,
    deleteSubscription,
    toggleSubscription,
    markAsPaid,
    duplicateSubscription,

    // Navegación y filtros
    updateFilters,
    changePage,
    changeLimit,
    search,
    clearFilters,

    // Utilidades
    refresh,
    loadSubscriptions,
    loadUpcomingPayments
  }
}