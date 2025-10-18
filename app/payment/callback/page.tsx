'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Clock, AlertTriangle, Home } from 'lucide-react'
import { paymentService } from '@/lib/payment-service'
import { useSubscription } from '@/hooks/use-subscription'
import { useBillingNotifications } from '@/hooks/use-billing-notifications'

/**
 * Página para manejar los callbacks de dLocal Go
 * Esta página se activa cuando dLocal redirige al usuario después de un pago
 */
export default function PaymentCallbackPage() {
  const [status, setStatus] = useState<'processing' | 'success' | 'failed' | 'cancelled'>('processing')
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(5)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loadSubscription } = useSubscription()
  const { showSuccessNotification, showErrorNotification } = useBillingNotifications()

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Obtener parámetros de la URL
        const urlStatus = searchParams.get('status')
        const externalId = searchParams.get('external_id')
        const paymentId = searchParams.get('payment_id')
        const reason = searchParams.get('reason')
        const message = searchParams.get('message')

        console.log('Processing payment callback:', {
          urlStatus,
          externalId,
          paymentId,
          reason,
          message
        })

        // Si no hay parámetros relevantes, redirigir al dashboard
        if (!urlStatus && !externalId && !paymentId) {
          router.replace('/dashboard')
          return
        }

        // Procesar según el estado recibido
        if (urlStatus === 'success') {
          setStatus('success')
          
          // Si tenemos external_id, verificar el estado del pago
          if (externalId) {
            try {
              const paymentStatus = await paymentService.checkPaymentStatus(externalId)
              if (paymentStatus) {
                setPaymentDetails(paymentStatus)
              }
            } catch (error) {
              console.warn('Could not fetch payment details:', error)
            }
          }

          showSuccessNotification('upgrade', 'premium')
          await loadSubscription()
          
        } else if (urlStatus === 'failed') {
          setStatus('failed')
          setError(message || 'El pago no pudo ser procesado')
          showErrorNotification('El pago falló. Por favor, inténtalo de nuevo.')
          
        } else if (urlStatus === 'cancelled') {
          setStatus('cancelled')
          setError(reason || 'El pago fue cancelado por el usuario')
          showErrorNotification('El pago fue cancelado.')
          
        } else {
          // Estado desconocido o sin status, intentar verificar por external_id
          if (externalId) {
            const paymentStatus = await paymentService.checkPaymentStatus(externalId)
            if (paymentStatus) {
              setPaymentDetails(paymentStatus)
              
              switch (paymentStatus.status) {
                case 'completed':
                case 'payment_confirmed':
                case 'subscription_confirmed':
                  setStatus('success')
                  showSuccessNotification('upgrade', paymentStatus.planId)
                  await loadSubscription()
                  break
                case 'failed':
                case 'cancelled':
                  setStatus('failed')
                  setError(paymentStatus.errorMessage || 'El pago no pudo ser completado')
                  break
                default:
                  setStatus('processing')
                  // Verificar nuevamente en 3 segundos
                  setTimeout(processCallback, 3000)
                  return
              }
            } else {
              setStatus('failed')
              setError('No se pudo verificar el estado del pago')
            }
          } else {
            setStatus('failed')
            setError('Información de pago incompleta')
          }
        }

        // Limpiar localStorage
        localStorage.removeItem('current_payment_id')
        
      } catch (error: any) {
        console.error('Error processing payment callback:', error)
        setStatus('failed')
        setError('Error al procesar el callback de pago')
      }
    }

    processCallback()
  }, [searchParams, router, loadSubscription, showSuccessNotification, showErrorNotification])

  // Countdown para redirección automática
  useEffect(() => {
    if (status !== 'processing' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      router.replace('/dashboard/billing')
    }
  }, [status, countdown, router])

  const handleReturnToDashboard = () => {
    router.replace('/dashboard')
  }

  const handleReturnToBilling = () => {
    router.replace('/dashboard/billing')
  }

  const handleRetryPayment = () => {
    router.replace('/dashboard/billing')
  }

  if (status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Clock className="h-6 w-6 text-blue-600 animate-spin" />
            </div>
            <CardTitle>Procesando pago...</CardTitle>
            <CardDescription>
              Estamos verificando el estado de tu pago con dLocal. Esto puede tomar unos momentos.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-pulse text-sm text-gray-500">
              Verificando estado del pago...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
              <div className="text-sm text-gray-600 space-y-1 p-4 bg-green-50 rounded-lg">
                <p><strong>Monto:</strong> {paymentService.formatPrice(paymentDetails.amount, paymentDetails.currency)}</p>
                <p><strong>Plan:</strong> {paymentDetails.planName || paymentDetails.planId}</p>
                <p><strong>Fecha:</strong> {new Date(paymentDetails.processedAt || paymentDetails.createdAt).toLocaleDateString('es-ES')}</p>
                {paymentDetails.dLocalPaymentId && (
                  <p><strong>ID de pago:</strong> {paymentDetails.dLocalPaymentId}</p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Button onClick={handleReturnToDashboard} className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Ir al Dashboard
              </Button>
              <Button onClick={handleReturnToBilling} variant="outline" className="w-full">
                Ver Facturación
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Redirigiendo automáticamente en {countdown} segundos...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // status === 'failed' || status === 'cancelled'
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-red-900">
            {status === 'cancelled' ? 'Pago cancelado' : 'Error en el pago'}
          </CardTitle>
          <CardDescription>
            {error || (status === 'cancelled' 
              ? 'El pago fue cancelado.' 
              : 'Hubo un problema al procesar tu pago.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {paymentDetails && (
            <div className="text-sm text-gray-600 space-y-1 p-4 bg-red-50 rounded-lg">
              <p><strong>Monto:</strong> {paymentService.formatPrice(paymentDetails.amount, paymentDetails.currency)}</p>
              <p><strong>Plan:</strong> {paymentDetails.planName || paymentDetails.planId}</p>
              {paymentDetails.errorMessage && (
                <p><strong>Error:</strong> {paymentDetails.errorMessage}</p>
              )}
            </div>
          )}
          <div className="space-y-2">
            {status === 'failed' && (
              <Button onClick={handleRetryPayment} className="w-full">
                Intentar de nuevo
              </Button>
            )}
            <Button onClick={handleReturnToBilling} variant="outline" className="w-full">
              Volver a Facturación
            </Button>
            <Button onClick={handleReturnToDashboard} variant="ghost" className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Ir al Dashboard
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium">¿Necesitas ayuda?</p>
                <p>Si el problema persiste, contacta a nuestro soporte.</p>
                {paymentDetails?.id && (
                  <p>ID de referencia: {paymentDetails.id}</p>
                )}
              </div>
            </div>
          </div>
          
          <p className="text-xs text-gray-500">
            Redirigiendo automáticamente en {countdown} segundos...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}