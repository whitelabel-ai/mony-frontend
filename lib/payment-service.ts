import { apiService } from './api'

export interface PaymentRequest {
  planId: string
  currentPlanId?: string
  discountCode?: string
  paymentMethod?: 'card' | 'bank_transfer' | 'cash'
  country?: string
  currency?: string
}

export interface PaymentResponse {
  success: boolean
  paymentUrl?: string
  paymentId?: string
  redirectUrl?: string
  message?: string
  error?: string
}

export interface PaymentStatus {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  amount: number
  currency: string
  planId: string
  createdAt: string
  completedAt?: string
  failureReason?: string
}

class PaymentService {
  /**
   * Inicia el proceso de pago para una suscripción
   */
  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await apiService.post<PaymentResponse>('/payments/initiate', request)
      return response
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al procesar el pago'
      }
    }
  }

  /**
   * Verifica el estado de un pago
   */
  async checkPaymentStatus(paymentId: string): Promise<PaymentStatus | null> {
    try {
      const response = await apiService.get<PaymentStatus>(`/payments/${paymentId}/status`)
      return response
    } catch (error: any) {
      console.error('Error checking payment status:', error)
      return null
    }
  }

  /**
   * Procesa el upgrade de suscripción
   */
  async upgradeSubscription(planId: string, currentPlanId?: string): Promise<PaymentResponse> {
    return this.initiatePayment({
      planId,
      currentPlanId,
      paymentMethod: 'card' // Por defecto tarjeta
    })
  }

  /**
   * Procesa la renovación de suscripción
   */
  async renewSubscription(planId: string): Promise<PaymentResponse> {
    return this.initiatePayment({
      planId,
      paymentMethod: 'card'
    })
  }

  /**
   * Aplica un código de descuento
   */
  async applyDiscountCode(discountCode: string, planId: string): Promise<{
    valid: boolean
    discount?: {
      type: 'percentage' | 'fixed'
      value: number
      description: string
    }
    error?: string
  }> {
    try {
      const response = await apiService.post('/payments/validate-discount', {
        discountCode,
        planId
      }) as { discount: { type: 'percentage' | 'fixed'; value: number; description: string } }
      return { valid: true, discount: response.discount }
    } catch (error: any) {
      return {
        valid: false,
        error: error.response?.data?.message || 'Código de descuento inválido'
      }
    }
  }

  /**
   * Obtiene los métodos de pago disponibles para un país
   */
  async getAvailablePaymentMethods(country: string): Promise<{
    methods: Array<{
      id: string
      name: string
      type: 'card' | 'bank_transfer' | 'cash' | 'digital_wallet'
      icon?: string
      description?: string
    }>
  }> {
    try {
      const response = await apiService.get(`/payments/methods/${country}`) as {
        methods: Array<{
          id: string
          name: string
          type: 'card' | 'bank_transfer' | 'cash' | 'digital_wallet'
          icon?: string
          description?: string
        }>
      }
      return response
    } catch (error: any) {
      // Métodos por defecto si falla la consulta
      return {
        methods: [
          {
            id: 'card',
            name: 'Tarjeta de Crédito/Débito',
            type: 'card',
            description: 'Visa, Mastercard, American Express'
          }
        ]
      }
    }
  }

  /**
   * Obtiene el historial de pagos del usuario
   */
  async getPaymentHistory(limit: number = 10): Promise<PaymentStatus[]> {
    try {
      const response = await apiService.get<{ payments: PaymentStatus[] }>(`/payments/history?limit=${limit}`)
      return response.payments || []
    } catch (error: any) {
      console.error('Error fetching payment history:', error)
      return []
    }
  }

  /**
   * Cancela un pago pendiente
   */
  async cancelPayment(paymentId: string): Promise<{ success: boolean; message?: string }> {
    try {
      await apiService.post(`/payments/${paymentId}/cancel`)
      return { success: true, message: 'Pago cancelado exitosamente' }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al cancelar el pago'
      }
    }
  }

  /**
   * Redirige al usuario a la URL de pago de dLocal
   */
  redirectToPayment(paymentUrl: string): void {
    // Verificar que la URL sea válida
    if (!paymentUrl || !paymentUrl.startsWith('http')) {
      throw new Error('URL de pago inválida')
    }

    // Guardar información del pago en localStorage para el retorno
    localStorage.setItem('payment_in_progress', 'true')
    localStorage.setItem('payment_timestamp', Date.now().toString())

    // Redirigir a dLocal
    window.location.href = paymentUrl
  }

  /**
   * Verifica si hay un pago en progreso al regresar de dLocal
   */
  checkReturnFromPayment(): {
    wasPaymentInProgress: boolean
    shouldCheckStatus: boolean
  } {
    const paymentInProgress = localStorage.getItem('payment_in_progress')
    const paymentTimestamp = localStorage.getItem('payment_timestamp')

    if (paymentInProgress === 'true' && paymentTimestamp) {
      const timestamp = parseInt(paymentTimestamp)
      const now = Date.now()
      const timeDiff = now - timestamp

      // Si han pasado menos de 30 minutos, verificar el estado
      const shouldCheck = timeDiff < 30 * 60 * 1000

      // Limpiar el localStorage
      localStorage.removeItem('payment_in_progress')
      localStorage.removeItem('payment_timestamp')

      return {
        wasPaymentInProgress: true,
        shouldCheckStatus: shouldCheck
      }
    }

    return {
      wasPaymentInProgress: false,
      shouldCheckStatus: false
    }
  }

  /**
   * Calcula el precio con descuento
   */
  calculateDiscountedPrice(originalPrice: number, discount: {
    type: 'percentage' | 'fixed'
    value: number
  }): number {
    if (discount.type === 'percentage') {
      return originalPrice * (1 - discount.value / 100)
    } else {
      return Math.max(0, originalPrice - discount.value)
    }
  }

  /**
   * Formatea el precio para mostrar
   */
  formatPrice(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2
    }).format(amount)
  }
}

export const paymentService = new PaymentService()