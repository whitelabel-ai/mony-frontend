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

export function useUserSubscriptions() {
  const [state, setState] = useState<UseUserSubscriptionsState>({
    subscriptions: [],
    summary: null,
    upcomingPayments: [],
    loading: true,
    error: null
  })

  // Cargar todas las suscripciones sin filtros
  const loadSubscriptions = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await userSubscriptionsService.getSubscriptions()
      
      setState(prev => ({
        ...prev,
        subscriptions: response.subscriptions || [],
        summary: response.summary || null,
        loading: false
      }))
    } catch (error) {
      console.error('Error loading subscriptions:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error desconocido',
        loading: false
      }))
    }
  }, [])

  // Cargar próximos pagos
  const loadUpcomingPayments = useCallback(async () => {
    try {
      const upcomingPayments = await userSubscriptionsService.getUpcomingPayments()
      setState(prev => ({
        ...prev,
        upcomingPayments: upcomingPayments || []
      }))
    } catch (error) {
      console.error('Error loading upcoming payments:', error)
    }
  }, [])

  // Crear suscripción
  const createSubscription = useCallback(async (data: CreateUserSubscriptionDto) => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      await userSubscriptionsService.createSubscription(data)
      
      // Recargar datos después de crear
      await Promise.all([loadSubscriptions(), loadUpcomingPayments()])
      
      toast.success('Suscripción creada exitosamente')
    } catch (error) {
      console.error('Error creating subscription:', error)
      const message = error instanceof Error ? error.message : 'Error al crear la suscripción'
      toast.error(message)
      setState(prev => ({ ...prev, loading: false }))
      throw error
    }
  }, [loadSubscriptions, loadUpcomingPayments])

  // Actualizar suscripción
  const updateSubscription = useCallback(async (id: string, data: UpdateUserSubscriptionDto) => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      await userSubscriptionsService.updateSubscription(id, data)
      
      // Recargar datos después de actualizar
      await Promise.all([loadSubscriptions(), loadUpcomingPayments()])
      
      toast.success('Suscripción actualizada exitosamente')
    } catch (error) {
      console.error('Error updating subscription:', error)
      const message = error instanceof Error ? error.message : 'Error al actualizar la suscripción'
      toast.error(message)
      setState(prev => ({ ...prev, loading: false }))
      throw error
    }
  }, [loadSubscriptions, loadUpcomingPayments])

  // Eliminar suscripción
  const deleteSubscription = useCallback(async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      await userSubscriptionsService.deleteSubscription(id)
      
      // Recargar datos después de eliminar
      await Promise.all([loadSubscriptions(), loadUpcomingPayments()])
      
      toast.success('Suscripción eliminada exitosamente')
    } catch (error) {
      console.error('Error deleting subscription:', error)
      const message = error instanceof Error ? error.message : 'Error al eliminar la suscripción'
      toast.error(message)
      setState(prev => ({ ...prev, loading: false }))
      throw error
    }
  }, [loadSubscriptions, loadUpcomingPayments])

  // Activar/desactivar suscripción
  const toggleSubscription = useCallback(async (id: string, activa: boolean) => {
    try {
      await userSubscriptionsService.toggleSubscription(id, activa)
      
      // Recargar datos después del toggle
      await Promise.all([loadSubscriptions(), loadUpcomingPayments()])
      
      toast.success(`Suscripción ${activa ? 'activada' : 'desactivada'} exitosamente`)
    } catch (error) {
      console.error('Error toggling subscription:', error)
      const message = error instanceof Error ? error.message : 'Error al cambiar el estado de la suscripción'
      toast.error(message)
      throw error
    }
  }, [loadSubscriptions, loadUpcomingPayments])

  // Marcar como pagado
  const markAsPaid = useCallback(async (subscriptionId: string, paymentDate: Date) => {
    try {
      await userSubscriptionsService.markAsPaid(subscriptionId)
      
      // Recargar datos después de marcar como pagado
      await Promise.all([loadSubscriptions(), loadUpcomingPayments()])
      
      toast.success('Pago registrado exitosamente')
    } catch (error) {
      console.error('Error marking as paid:', error)
      const message = error instanceof Error ? error.message : 'Error al registrar el pago'
      toast.error(message)
      throw error
    }
  }, [loadSubscriptions, loadUpcomingPayments])

  // Duplicar suscripción
  const duplicateSubscription = useCallback(async (subscription: UserSubscription) => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      const newName = `${subscription.nombre} (Copia)`
      await userSubscriptionsService.duplicateSubscription(subscription.id, newName)
      
      // Recargar datos después de duplicar
      await Promise.all([loadSubscriptions(), loadUpcomingPayments()])
      
      toast.success('Suscripción duplicada exitosamente')
    } catch (error) {
      console.error('Error duplicating subscription:', error)
      const message = error instanceof Error ? error.message : 'Error al duplicar la suscripción'
      toast.error(message)
      setState(prev => ({ ...prev, loading: false }))
      throw error
    }
  }, [loadSubscriptions, loadUpcomingPayments])

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([loadSubscriptions(), loadUpcomingPayments()])
    }
    
    loadInitialData()
  }, [loadSubscriptions, loadUpcomingPayments])

  return {
    // Estado
    subscriptions: state.subscriptions,
    summary: state.summary,
    upcomingPayments: state.upcomingPayments,
    loading: state.loading,
    error: state.error,
    
    // Acciones
    createSubscription,
    updateSubscription,
    deleteSubscription,
    toggleSubscription,
    markAsPaid,
    duplicateSubscription
  }
}