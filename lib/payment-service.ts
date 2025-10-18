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
  dLocalPaymentId: string | null
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'PAYMENT_CONFIRMED' | 'SUBSCRIPTION_CONFIRMED' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'payment_confirmed' | 'subscription_confirmed'
  eventType: string
  amount: string | number
  currency: string
  planId: string
  planName: string
  processedAt: string | null
  errorMessage: string | null
}

// Nuevas interfaces para dLocal Go
export interface DLocalGoPaymentRequest {
  planId: string
  country: string
  currency: string
  paymentMethod?: string
  discountCode?: string
}

export interface DLocalGoPaymentResponse {
  success: boolean
  paymentId: string
  dLocalGoUrl: string
  amount: number
  currency: string
  planName: string
  expiresAt: string
}

export interface PaymentMonitoringData {
  upcomingExpirations: Array<{
    id: string
    userId: string
    planName: string
    expiresAt: string
    daysUntilExpiration: number
  }>
  expiredSubscriptions: Array<{
    id: string
    userId: string
    planName: string
    expiredAt: string
    daysSinceExpiration: number
  }>
  pendingPayments: Array<{
    id: string
    userId: string
    amount: number
    currency: string
    planName: string
    createdAt: string
    status: string
  }>
}

export interface PaymentStatusReport {
  summary: {
    activeSubscriptions: number
    expiredSubscriptions: number
    upcomingExpirations: number
    pendingPayments: number
    monthlyRevenue: number
  }
  details: PaymentMonitoringData
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
   * Inicia un pago específicamente con dLocal Go
   */
  async initiateDLocalGoPayment(request: DLocalGoPaymentRequest): Promise<DLocalGoPaymentResponse | null> {
    try {
      const response = await apiService.post<DLocalGoPaymentResponse>('/payments/dlocal-go/initiate', request)
      return response
    } catch (error: any) {
      console.error('Error initiating dLocal Go payment:', error)
      return null
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
   * Consulta activa a la API de dLocal para verificar el estado del pago
   */
  async queryDLocalPaymentStatus(paymentId: string): Promise<any> {
    try {
      const response = await apiService.get(`/payments/${paymentId}/dlocal-status`)
      return response
    } catch (error: any) {
      console.error('Error querying dLocal payment status:', error)
      return null
    }
  }

  /**
   * Maneja el callback de éxito del pago
   */
  async handlePaymentSuccess(paymentId: string, additionalData?: any): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiService.post(`/payments/${paymentId}/success`, additionalData || {})
      return { success: true, message: 'Pago procesado exitosamente' }
    } catch (error: any) {
      console.error('Error handling payment success:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al procesar el callback de éxito'
      }
    }
  }

  /**
   * Maneja el callback de cancelación del pago
   */
  async handlePaymentCancel(paymentId: string, reason?: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiService.post(`/payments/${paymentId}/cancel`, { reason: reason || 'User cancelled' })
      return { success: true, message: 'Pago cancelado exitosamente' }
    } catch (error: any) {
      console.error('Error handling payment cancellation:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al procesar la cancelación'
      }
    }
  }

  /**
   * Obtiene datos de monitoreo de pagos y suscripciones
   */
  async getPaymentMonitoringData(): Promise<PaymentMonitoringData | null> {
    try {
      const response = await apiService.get<PaymentMonitoringData>('/payments/monitoring/data')
      return response
    } catch (error: any) {
      console.error('Error fetching payment monitoring data:', error)
      return null
    }
  }

  /**
   * Obtiene suscripciones próximas a vencer
   */
  async getUpcomingExpirations(days: number = 7): Promise<any[]> {
    try {
      const response = await apiService.get<{ subscriptions: any[] }>(`/payments/monitoring/upcoming-expirations?days=${days}`)
      return response.subscriptions || []
    } catch (error: any) {
      console.error('Error fetching upcoming expirations:', error)
      return []
    }
  }

  /**
   * Obtiene suscripciones vencidas
   */
  async getExpiredSubscriptions(): Promise<any[]> {
    try {
      const response = await apiService.get<{ subscriptions: any[] }>('/payments/monitoring/expired-subscriptions')
      return response.subscriptions || []
    } catch (error: any) {
      console.error('Error fetching expired subscriptions:', error)
      return []
    }
  }

  /**
   * Genera un reporte de estado de pagos y suscripciones
   */
  async generateStatusReport(): Promise<PaymentStatusReport | null> {
    try {
      const response = await apiService.get<PaymentStatusReport>('/payments/monitoring/status-report')
      return response
    } catch (error: any) {
      console.error('Error generating status report:', error)
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
      const response = await apiService.get<{ 
        success: boolean
        data: { 
          payments: PaymentStatus[]
          pagination: {
            total: number
            limit: number
            offset: number
            hasMore: boolean
          }
        }
        message: string 
      }>(`/payments/history?limit=${limit}`)
      return response.data?.payments || []
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
   * Redirige específicamente a dLocal Go
   */
  redirectToDLocalGo(dLocalGoUrl: string, paymentId: string): void {
    // Verificar que la URL sea válida
    if (!dLocalGoUrl || !dLocalGoUrl.startsWith('http')) {
      throw new Error('URL de dLocal Go inválida')
    }

    // Guardar información específica del pago dLocal Go
    localStorage.setItem('dlocal_payment_in_progress', 'true')
    localStorage.setItem('dlocal_payment_id', paymentId)
    localStorage.setItem('dlocal_payment_timestamp', Date.now().toString())

    // Redirigir a dLocal Go
    window.location.href = dLocalGoUrl
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
   * Verifica si hay un pago de dLocal Go en progreso al regresar
   */
  checkReturnFromDLocalGo(): {
    wasPaymentInProgress: boolean
    shouldCheckStatus: boolean
    paymentId?: string
  } {
    const paymentInProgress = localStorage.getItem('dlocal_payment_in_progress')
    const paymentId = localStorage.getItem('dlocal_payment_id')
    const paymentTimestamp = localStorage.getItem('dlocal_payment_timestamp')

    if (paymentInProgress === 'true' && paymentTimestamp && paymentId) {
      const timestamp = parseInt(paymentTimestamp)
      const now = Date.now()
      const timeDiff = now - timestamp

      // Si han pasado menos de 30 minutos, verificar el estado
      const shouldCheck = timeDiff < 30 * 60 * 1000

      // Limpiar el localStorage
      localStorage.removeItem('dlocal_payment_in_progress')
      localStorage.removeItem('dlocal_payment_id')
      localStorage.removeItem('dlocal_payment_timestamp')

      return {
        wasPaymentInProgress: true,
        shouldCheckStatus: shouldCheck,
        paymentId
      }
    }

    return {
      wasPaymentInProgress: false,
      shouldCheckStatus: false
    }
  }

  /**
   * Maneja el retorno desde dLocal Go y procesa el resultado
   */
  async handleDLocalGoReturn(urlParams: URLSearchParams): Promise<{
    success: boolean
    paymentId?: string
    status?: string
    message?: string
  }> {
    const returnCheck = this.checkReturnFromDLocalGo()
    
    if (!returnCheck.wasPaymentInProgress || !returnCheck.paymentId) {
      return {
        success: false,
        message: 'No se encontró información de pago en progreso'
      }
    }

    const paymentId = returnCheck.paymentId
    
    // Verificar parámetros de la URL para determinar el resultado
    const status = urlParams.get('status')
    const success = urlParams.get('success')
    
    if (success === 'true' || status === 'success') {
      // Manejar éxito
      const result = await this.handlePaymentSuccess(paymentId, {
        returnUrl: window.location.href,
        urlParams: Object.fromEntries(urlParams.entries())
      })
      
      return {
        success: result.success,
        paymentId,
        status: 'success',
        message: result.message
      }
    } else if (success === 'false' || status === 'cancelled' || status === 'failed') {
      // Manejar cancelación o fallo
      const result = await this.handlePaymentCancel(paymentId, status || 'unknown')
      
      return {
        success: false,
        paymentId,
        status: status || 'cancelled',
        message: result.message
      }
    } else if (returnCheck.shouldCheckStatus) {
      // Verificar estado del pago
      const paymentStatus = await this.checkPaymentStatus(paymentId)
      
      return {
        success: paymentStatus?.status === 'completed' || paymentStatus?.status === 'payment_confirmed',
        paymentId,
        status: paymentStatus?.status,
        message: paymentStatus?.status === 'completed' ? 'Pago completado exitosamente' : 'Verificando estado del pago...'
      }
    }

    return {
      success: false,
      paymentId,
      message: 'No se pudo determinar el estado del pago'
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
      minimumFractionDigits: 0
    }).format(amount)
  }

  /**
   * Utilidad para polling del estado de pago
   */
  async pollPaymentStatus(
    paymentId: string, 
    maxAttempts: number = 10, 
    intervalMs: number = 3000
  ): Promise<PaymentStatus | null> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.checkPaymentStatus(paymentId)
      
      if (status && ['completed', 'failed', 'cancelled', 'payment_confirmed', 'subscription_confirmed'].includes(status.status)) {
        return status
      }
      
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, intervalMs))
      }
    }
    
    return null
  }
}

export const paymentService = new PaymentService()