/**
 * Ejemplo de uso del servicio de pagos dLocal Go
 * Este archivo muestra cómo integrar las funciones de dLocal Go en tu aplicación
 */

import { paymentService, DLocalGoPaymentRequest } from '../lib/payment-service'

// Ejemplo 1: Iniciar un pago con dLocal Go
export async function initiatePaymentExample() {
  const paymentRequest: DLocalGoPaymentRequest = {
    planId: 'premium-monthly',
    country: 'CO', // Colombia
    currency: 'COP',
    paymentMethod: 'card',
    discountCode: 'DESCUENTO10'
  }

  try {
    const response = await paymentService.initiateDLocalGoPayment(paymentRequest)
    
    if (response) {
      console.log('Pago iniciado:', response)
      
      // Redirigir al usuario a dLocal Go
      paymentService.redirectToDLocalGo(response.dLocalGoUrl, response.paymentId)
    } else {
      console.error('Error al iniciar el pago')
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

// Ejemplo 2: Manejar el retorno desde dLocal Go
export async function handlePaymentReturnExample() {
  // Obtener parámetros de la URL
  const urlParams = new URLSearchParams(window.location.search)
  
  try {
    const result = await paymentService.handleDLocalGoReturn(urlParams)
    
    if (result.success) {
      console.log('Pago exitoso:', result)
      // Redirigir a página de éxito
      window.location.href = '/dashboard/billing?payment=success'
    } else {
      console.log('Pago fallido o cancelado:', result)
      // Redirigir a página de error
      window.location.href = '/dashboard/billing?payment=failed'
    }
  } catch (error) {
    console.error('Error manejando el retorno:', error)
  }
}

// Ejemplo 3: Verificar estado de pago con polling
export async function monitorPaymentExample(paymentId: string) {
  try {
    console.log('Monitoreando pago:', paymentId)
    
    const finalStatus = await paymentService.pollPaymentStatus(
      paymentId,
      15, // máximo 15 intentos
      5000 // cada 5 segundos
    )
    
    if (finalStatus) {
      console.log('Estado final del pago:', finalStatus)
      
      if (finalStatus.status === 'completed' || finalStatus.status === 'payment_confirmed') {
        console.log('¡Pago completado exitosamente!')
      } else {
        console.log('Pago no completado:', finalStatus.status)
      }
    } else {
      console.log('No se pudo determinar el estado final del pago')
    }
  } catch (error) {
    console.error('Error monitoreando el pago:', error)
  }
}

// Ejemplo 4: Obtener datos de monitoreo
export async function getMonitoringDataExample() {
  try {
    const monitoringData = await paymentService.getPaymentMonitoringData()
    
    if (monitoringData) {
      console.log('Datos de monitoreo:', monitoringData)
      
      // Mostrar suscripciones próximas a vencer
      if (monitoringData.upcomingExpirations.length > 0) {
        console.log('Suscripciones próximas a vencer:')
        monitoringData.upcomingExpirations.forEach(sub => {
          console.log(`- ${sub.planName} vence en ${sub.daysUntilExpiration} días`)
        })
      }
      
      // Mostrar pagos pendientes
      if (monitoringData.pendingPayments.length > 0) {
        console.log('Pagos pendientes:')
        monitoringData.pendingPayments.forEach(payment => {
          console.log(`- ${payment.planName}: ${payment.amount} ${payment.currency}`)
        })
      }
    }
  } catch (error) {
    console.error('Error obteniendo datos de monitoreo:', error)
  }
}

// Ejemplo 5: Generar reporte de estado
export async function generateStatusReportExample() {
  try {
    const report = await paymentService.generateStatusReport()
    
    if (report) {
      console.log('Reporte de estado:', report)
      
      const { summary } = report
      console.log(`
📊 Resumen de Pagos:
- Suscripciones activas: ${summary.activeSubscriptions}
- Suscripciones vencidas: ${summary.expiredSubscriptions}
- Próximas a vencer: ${summary.upcomingExpirations}
- Pagos pendientes: ${summary.pendingPayments}
- Ingresos mensuales: $${summary.monthlyRevenue}
      `)
    }
  } catch (error) {
    console.error('Error generando reporte:', error)
  }
}

// Ejemplo 6: Hook de React para manejar pagos
export function usePaymentFlow() {
  const initiatePayment = async (request: DLocalGoPaymentRequest) => {
    const response = await paymentService.initiateDLocalGoPayment(request)
    
    if (response) {
      paymentService.redirectToDLocalGo(response.dLocalGoUrl, response.paymentId)
      return { success: true, paymentId: response.paymentId }
    }
    
    return { success: false, error: 'Error al iniciar el pago' }
  }

  const checkReturnFromPayment = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    return await paymentService.handleDLocalGoReturn(urlParams)
  }

  const monitorPayment = async (paymentId: string) => {
    return await paymentService.pollPaymentStatus(paymentId)
  }

  return {
    initiatePayment,
    checkReturnFromPayment,
    monitorPayment
  }
}

// Ejemplo 7: Componente React para el flujo de pago
export const PaymentFlowExample = `
import React, { useEffect, useState } from 'react'
import { paymentService } from '../lib/payment-service'

export function PaymentFlow({ planId }: { planId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Verificar si regresamos de un pago
    const checkReturn = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.has('payment_return')) {
        const result = await paymentService.handleDLocalGoReturn(urlParams)
        
        if (result.success) {
          alert('¡Pago exitoso!')
        } else {
          alert('Pago fallido: ' + result.message)
        }
      }
    }
    
    checkReturn()
  }, [])

  const handlePayment = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await paymentService.initiateDLocalGoPayment({
        planId,
        country: 'CO',
        currency: 'COP'
      })

      if (response) {
        paymentService.redirectToDLocalGo(response.dLocalGoUrl, response.paymentId)
      } else {
        setError('Error al iniciar el pago')
      }
    } catch (err) {
      setError('Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button 
        onClick={handlePayment} 
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? 'Procesando...' : 'Pagar con dLocal Go'}
      </button>
      
      {error && (
        <div className="text-red-500 mt-2">{error}</div>
      )}
    </div>
  )
}
`