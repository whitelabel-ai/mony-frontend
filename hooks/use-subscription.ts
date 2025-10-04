'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { apiService } from '@/lib/api'
import { type SubscriptionPlan, SUBSCRIPTION_PLANS } from '@/types'

interface UserSubscription {
  id: string
  planId: string
  status: 'active' | 'cancelled' | 'expired'
  startDate: string
  endDate: string
  autoRenew: boolean
  plan: SubscriptionPlan
}

interface SubscriptionState {
  subscription: UserSubscription | null
  loading: boolean
  error: string | null
}

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>({
    subscription: null,
    loading: true,
    error: null
  })

  const loadSubscription = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await apiService.get<{ subscription: UserSubscription }>('/subscriptions/current')
      
      setState(prev => ({
        ...prev,
        subscription: response.subscription,
        loading: false
      }))
    } catch (error: any) {
      // Si no hay suscripción, no es un error
      if (error.response?.status === 404) {
        setState(prev => ({
          ...prev,
          subscription: null,
          loading: false,
          error: null
        }))
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.response?.data?.message || 'Error al cargar la suscripción'
        }))
      }
    }
  }

  const getCurrentPlan = (): SubscriptionPlan => {
    if (!state.subscription) {
      return SUBSCRIPTION_PLANS.find(plan => plan.id === 'free') || SUBSCRIPTION_PLANS[0]
    }
    return state.subscription.plan
  }

  const getAvailableUpgrades = (): SubscriptionPlan[] => {
    const currentPlan = getCurrentPlan()
    const currentIndex = SUBSCRIPTION_PLANS.findIndex(plan => plan.id === currentPlan.id)
    return SUBSCRIPTION_PLANS.slice(currentIndex + 1)
  }

  const isSubscriptionExpiringSoon = (days: number = 7): boolean => {
    if (!state.subscription || !state.subscription.endDate) return false
    
    const endDate = new Date(state.subscription.endDate)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    return daysUntilExpiry <= days && daysUntilExpiry > 0
  }

  const getDaysUntilExpiry = (): number | null => {
    if (!state.subscription?.endDate) return null
    
    const endDate = new Date(state.subscription.endDate)
    const now = new Date()
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays > 0 ? diffDays : 0
  }

  const upgradeSubscription = async (planId: string): Promise<{ paymentUrl?: string }> => {
    try {
      const { paymentService } = await import('@/lib/payment-service')
      
      const response = await paymentService.upgradeSubscription(planId, getCurrentPlan().id)
      
      if (!response.success) {
        throw new Error(response.error || 'Error al procesar el pago')
      }

      // Si hay URL de pago, no recargar aún (se hará después del pago)
      if (!response.paymentUrl) {
        await loadSubscription()
      }
      
      return { paymentUrl: response.paymentUrl }
    } catch (error: any) {
      const message = error.message || 'Error al actualizar la suscripción'
      toast.error(message)
      throw error
    }
  }

  const cancelSubscription = async (reason?: string, feedback?: string): Promise<void> => {
    try {
      if (!state.subscription) {
        throw new Error('No hay suscripción activa para cancelar')
      }

      await apiService.post('/subscriptions/cancel', {
        subscriptionId: state.subscription.id,
        reason,
        feedback
      })

      // Recargar la suscripción después de la cancelación
      await loadSubscription()
      
      toast.success('Suscripción cancelada exitosamente')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al cancelar la suscripción'
      toast.error(message)
      throw error
    }
  }

  const reactivateSubscription = async (): Promise<{ paymentUrl?: string }> => {
    try {
      if (!state.subscription) {
        throw new Error('No hay suscripción para reactivar')
      }

      const response = await apiService.post('/subscriptions/reactivate', {
        subscriptionId: state.subscription.id
      }) as { paymentUrl?: string }

      // Recargar la suscripción después de la reactivación
      await loadSubscription()
      
      return response
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al reactivar la suscripción'
      toast.error(message)
      throw error
    }
  }

  const applyDiscount = async (discountCode: string): Promise<void> => {
    try {
      await apiService.post('/subscriptions/apply-discount', {
        discountCode,
        subscriptionId: state.subscription?.id
      })

      // Recargar la suscripción después de aplicar el descuento
      await loadSubscription()
      
      toast.success('Descuento aplicado exitosamente')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al aplicar el descuento'
      toast.error(message)
      throw error
    }
  }

  // Cargar la suscripción al montar el hook
  useEffect(() => {
    loadSubscription()
  }, [])

  return {
    // Estado
    subscription: state.subscription,
    loading: state.loading,
    error: state.error,
    
    // Datos derivados
    currentPlan: getCurrentPlan(),
    availableUpgrades: getAvailableUpgrades(),
    isExpiringSoon: isSubscriptionExpiringSoon(),
    daysUntilExpiry: getDaysUntilExpiry(),
    
    // Acciones
    loadSubscription,
    upgradeSubscription,
    cancelSubscription,
    reactivateSubscription,
    applyDiscount,
    
    // Utilidades
    isSubscriptionExpiringSoon,
    getDaysUntilExpiry
  }
}