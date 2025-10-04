'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { paymentService } from '@/lib/payment-service'
import { useSubscription } from '@/hooks/use-subscription'
import { useBillingNotifications } from '@/hooks/use-billing-notifications'

interface PaymentReturnHandlerProps {
  onComplete?: () => void
}

export function PaymentReturnHandler({ onComplete }: PaymentReturnHandlerProps) {
  const [status, setStatus] = useState<'checking' | 'success' | 'failed' | 'pending'>('checking')
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loadSubscription } = useSubscription()
  const { showSuccessNotification, showErrorNotification } = useBillingNotifications()

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // Verificar si venimos de un pago
        const { wasPaymentInProgress, shouldCheckStatus } = paymentService.checkReturnFromPayment()
        
        if (!wasPaymentInProgress && !searchParams.get('payment_id')) {
          // No hay pago para verificar
          onComplete?.()
          return
        }

        // Obtener el ID del pago desde los parámetros de la URL o localStorage
        const paymentId = searchParams.get('payment_id') || 
                          searchParams.get('id') || 
                          localStorage.getItem('current_payment_id')

        if (!paymentId) {
          setError('No se encontró información del pago')
          setStatus('failed')
          return
        }

        // Verificar el estado del pago
        const paymentStatus = await paymentService.checkPaymentStatus(paymentId)
        
        if (!paymentStatus) {
          setError('No se pudo verificar el estado del pago')
          setStatus('failed')
          return
        }

        setPaymentDetails(paymentStatus)

        switch (paymentStatus.status) {
          case 'completed':
            setStatus('success')
            showSuccessNotification('upgrade', paymentStatus.planId)
            // Recargar la suscripción para reflejar los cambios
            await loadSubscription()
            break
            
          case 'failed':
          case 'cancelled':
            setStatus('failed')
            setError(paymentStatus.failureReason || 'El pago no pudo ser procesado')
            showErrorNotification('El pago no pudo ser completado. Inténtalo de nuevo.')
            break
            
          case 'pending':
          case 'processing':
            setStatus('pending')
            // Verificar nuevamente en 5 segundos
            setTimeout(checkPaymentStatus, 5000)
            break
            
          default:
            setStatus('failed')
            setError('Estado de pago desconocido')
        }

        // Limpiar el ID del pago del localStorage
        localStorage.removeItem('current_payment_id')
        
      } catch (error: any) {
        console.error('Error checking payment status:', error)
        setError('Error al verificar el estado del pago')
        setStatus('failed')
      }
    }

    checkPaymentStatus()
  }, [searchParams, loadSubscription, showSuccessNotification, showErrorNotification, onComplete])

  const handleReturnToBilling = () => {
    router.push('/dashboard/billing')
    onComplete?.()
  }

  const handleRetryPayment = () => {
    router.push('/dashboard/billing')
    onComplete?.()
  }

  if (status === 'checking') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Clock className="h-6 w-6 text-blue-600 animate-spin" />
          </div>
          <CardTitle>Verificando pago...</CardTitle>
          <CardDescription>
            Estamos confirmando el estado de tu pago. Esto puede tomar unos momentos.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (status === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-green-900">¡Pago exitoso!</CardTitle>
          <CardDescription>
            Tu suscripción ha sido actualizada correctamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {paymentDetails && (
            <div className="text-sm text-gray-600 space-y-1">
              <p>Monto: {paymentService.formatPrice(paymentDetails.amount, paymentDetails.currency)}</p>
              <p>Plan: {paymentDetails.planId}</p>
              <p>Fecha: {new Date(paymentDetails.completedAt || paymentDetails.createdAt).toLocaleDateString('es-ES')}</p>
            </div>
          )}
          <Button onClick={handleReturnToBilling} className="w-full">
            Ir a Facturación
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (status === 'pending') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle className="text-yellow-900">Pago en proceso</CardTitle>
          <CardDescription>
            Tu pago está siendo procesado. Te notificaremos cuando esté completo.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {paymentDetails && (
            <div className="text-sm text-gray-600 space-y-1">
              <p>Monto: {paymentService.formatPrice(paymentDetails.amount, paymentDetails.currency)}</p>
              <p>Plan: {paymentDetails.planId}</p>
            </div>
          )}
          <div className="space-y-2">
            <Button onClick={handleReturnToBilling} variant="outline" className="w-full">
              Volver a Facturación
            </Button>
            <p className="text-xs text-gray-500">
              Verificaremos automáticamente el estado cada 5 segundos
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // status === 'failed'
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle className="text-red-900">Error en el pago</CardTitle>
        <CardDescription>
          {error || 'Hubo un problema al procesar tu pago.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {paymentDetails && (
          <div className="text-sm text-gray-600 space-y-1">
            <p>Monto: {paymentService.formatPrice(paymentDetails.amount, paymentDetails.currency)}</p>
            <p>Plan: {paymentDetails.planId}</p>
          </div>
        )}
        <div className="space-y-2">
          <Button onClick={handleRetryPayment} className="w-full">
            Intentar de nuevo
          </Button>
          <Button onClick={handleReturnToBilling} variant="outline" className="w-full">
            Volver a Facturación
          </Button>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800">
              <p className="font-medium">¿Necesitas ayuda?</p>
              <p>Si el problema persiste, contacta a nuestro soporte con el ID de pago: {paymentDetails?.id}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}