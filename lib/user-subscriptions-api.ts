'use client'

import { apiService } from './api'
import { 
  UserSubscription, 
  CreateUserSubscriptionDto, 
  UpdateUserSubscriptionDto,
  UserSubscriptionsResponse,
  SubscriptionSummary 
} from '@/types'

/**
 * Servicio para gestión de suscripciones de servicios del usuario
 * (Netflix, Spotify, etc. - NO planes de pago de Mony)
 */
class UserSubscriptionsService {
  private readonly baseUrl = '/user-subscriptions'

  /**
   * Obtener todas las suscripciones del usuario con filtros y paginación
   */
  async getSubscriptions(params?: {
    activa?: boolean
    frecuencia?: 'diario' | 'semanal' | 'mensual' | 'trimestral' | 'anual' | 'nunca'
    categoryId?: string
    moneda?: string
    fechaProximoPagoAntes?: string
    fechaProximoPagoDespues?: string
  }): Promise<UserSubscriptionsResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.activa !== undefined) queryParams.append('activa', params.activa.toString())
      if (params?.frecuencia) queryParams.append('frecuencia', params.frecuencia)
      if (params?.categoryId) queryParams.append('categoryId', params.categoryId)
      if (params?.moneda) queryParams.append('moneda', params.moneda)
      if (params?.fechaProximoPagoAntes) queryParams.append('fechaProximoPagoAntes', params.fechaProximoPagoAntes)
      if (params?.fechaProximoPagoDespues) queryParams.append('fechaProximoPagoDespues', params.fechaProximoPagoDespues)

      const url = queryParams.toString() ? `${this.baseUrl}?${queryParams}` : this.baseUrl
      const response = await apiService.get<UserSubscriptionsResponse>(url)
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener las suscripciones')
    }
  }

  /**
   * Obtener una suscripción específica por ID
   */
  async getSubscription(id: string): Promise<UserSubscription> {
    try {
      const response = await apiService.get<UserSubscription>(`${this.baseUrl}/${id}`)
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener la suscripción')
    }
  }

  /**
   * Crear una nueva suscripción de servicio
   */
  async createSubscription(data: CreateUserSubscriptionDto): Promise<UserSubscription> {
    try {
      const response = await apiService.post<UserSubscription>(this.baseUrl, data)
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear la suscripción')
    }
  }

  /**
   * Actualizar una suscripción existente
   */
  async updateSubscription(id: string, data: UpdateUserSubscriptionDto): Promise<UserSubscription> {
    try {
      const response = await apiService.patch<UserSubscription>(`${this.baseUrl}/${id}`, data)
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar la suscripción')
    }
  }

  /**
   * Eliminar una suscripción
   */
  async deleteSubscription(id: string): Promise<void> {
    try {
      await apiService.delete(`${this.baseUrl}/${id}`)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar la suscripción')
    }
  }

  /**
   * Activar/Desactivar una suscripción
   */
  async toggleSubscription(id: string, activa: boolean): Promise<UserSubscription> {
    try {
      const response = await apiService.patch<UserSubscription>(`${this.baseUrl}/${id}`, { activa })
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al cambiar el estado de la suscripción')
    }
  }



  /**
   * Obtener próximos pagos (suscripciones que vencen pronto)
   */
  async getUpcomingPayments(days: number = 7): Promise<UserSubscription[]> {
    try {
      const response = await apiService.get<{
        upcomingPayments: UserSubscription[]
        totalCount: number
        daysAhead: number
      }>(`${this.baseUrl}/upcoming-payments?days=${days}`)
      return response.upcomingPayments
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener los próximos pagos')
    }
  }

  /**
   * Marcar una suscripción como pagada (actualizar fecha próximo pago)
   */
  async markAsPaid(id: string): Promise<UserSubscription> {
    try {
      const response = await apiService.post<UserSubscription>(`${this.baseUrl}/${id}/mark-paid`)
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al marcar como pagada')
    }
  }

  /**
   * Duplicar una suscripción (útil para crear suscripciones similares)
   */
  async duplicateSubscription(id: string, newName?: string): Promise<UserSubscription> {
    try {
      const response = await apiService.post<UserSubscription>(`${this.baseUrl}/${id}/duplicate`, {
        nombre: newName
      })
      return response
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al duplicar la suscripción')
    }
  }
}

// Instancia única del servicio
export const userSubscriptionsService = new UserSubscriptionsService()

// Exportar métodos específicos para facilitar el uso
export const {
  getSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  toggleSubscription,
  getUpcomingPayments,
  markAsPaid,
  duplicateSubscription
} = userSubscriptionsService