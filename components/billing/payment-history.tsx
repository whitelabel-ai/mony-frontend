'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  CreditCard, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle
} from 'lucide-react'
import { paymentService, type PaymentStatus } from '@/lib/payment-service'

interface PaymentHistoryProps {
  limit?: number
}

export function PaymentHistory({ limit = 5 }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<PaymentStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPaymentHistory()
  }, [limit])

  const loadPaymentHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const history = await paymentService.getPaymentHistory(limit)
      setPayments(history)
    } catch (error: any) {
      setError('Error al cargar el historial de pagos')
      console.error('Error loading payment history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: PaymentStatus['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'pending':
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: PaymentStatus['status']) => {
    const variants = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200'
    }

    const labels = {
      completed: 'Completado',
      failed: 'Fallido',
      cancelled: 'Cancelado',
      pending: 'Pendiente',
      processing: 'Procesando'
    }

    return (
      <Badge 
        variant="outline" 
        className={variants[status] || variants.pending}
      >
        {labels[status] || status}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Historial de Pagos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Historial de Pagos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadPaymentHistory}
              className="mt-2"
            >
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Historial de Pagos
          </CardTitle>
          <CardDescription>
            Aquí aparecerán tus transacciones de suscripción
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No hay pagos registrados</p>
            <p className="text-sm text-gray-500 mt-1">
              Cuando realices tu primer pago, aparecerá aquí
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Historial de Pagos
        </CardTitle>
        <CardDescription>
          Últimas {payments.length} transacciones
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {payments.map((payment) => (
            <div 
              key={payment.id} 
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(payment.status)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {paymentService.formatPrice(payment.amount, payment.currency)}
                    </span>
                    <span className="text-sm text-gray-600">
                      - Plan {payment.planId}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(payment.createdAt)}
                  </div>
                  {payment.failureReason && (
                    <div className="text-xs text-red-600 mt-1">
                      {payment.failureReason}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {getStatusBadge(payment.status)}
                {payment.status === 'completed' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Descargar recibo"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {payments.length >= limit && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              Ver historial completo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}