'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  CheckCircle, 
  AlertTriangle,
  Clock
} from 'lucide-react'
import { UserSubscription, UpcomingPayment } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { format, differenceInDays, isToday, isTomorrow, isPast } from 'date-fns'
import { es } from 'date-fns/locale'

type PaymentStatus = 'unknown' | 'overdue' | 'today' | 'tomorrow' | 'soon' | 'upcoming'

interface UpcomingPaymentsProps {
  payments: UserSubscription[]
  onMarkAsPaid?: (id: string) => void
  loading?: boolean
  compact?: boolean
}

export function UpcomingPayments({ 
  payments, 
  onMarkAsPaid, 
  loading = false,
  compact = false 
}: UpcomingPaymentsProps) {
  const getPaymentStatus = (payment: UserSubscription): PaymentStatus => {
    if (!payment.fechaProximoPago) return 'unknown'
    
    const paymentDate = new Date(payment.fechaProximoPago)
    const today = new Date()
    
    if (isPast(paymentDate) && !isToday(paymentDate)) {
      return 'overdue'
    }
    
    if (isToday(paymentDate)) {
      return 'today'
    }
    
    if (isTomorrow(paymentDate)) {
      return 'tomorrow'
    }
    
    const daysUntil = differenceInDays(paymentDate, today)
    if (daysUntil <= 3) {
      return 'soon'
    }
    
    return 'upcoming'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'overdue':
        return (
          <Badge variant="destructive" className="text-xs">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Vencido
          </Badge>
        )
      case 'today':
        return (
          <Badge variant="destructive" className="text-xs">
            <Clock className="mr-1 h-3 w-3" />
            Hoy
          </Badge>
        )
      case 'tomorrow':
        return (
          <Badge variant="outline" className="text-xs border-orange-500 text-orange-700">
            <Clock className="mr-1 h-3 w-3" />
            Mañana
          </Badge>
        )
      case 'soon':
        return (
          <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700">
            <Clock className="mr-1 h-3 w-3" />
            Próximamente
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-xs">
            <Calendar className="mr-1 h-3 w-3" />
            Programado
          </Badge>
        )
    }
  }

  const getDateText = (payment: UserSubscription) => {
    if (!payment.fechaProximoPago) return 'Sin fecha'
    
    const paymentDate = new Date(payment.fechaProximoPago)
    const status = getPaymentStatus(payment)
    
    if (status === 'today') return 'Hoy'
    if (status === 'tomorrow') return 'Mañana'
    
    const daysUntil = differenceInDays(paymentDate, new Date())
    
    if (status === 'overdue') {
      const daysOverdue = Math.abs(daysUntil)
      return `Hace ${daysOverdue} día${daysOverdue > 1 ? 's' : ''}`
    }
    
    if (daysUntil <= 7) {
      return `En ${daysUntil} día${daysUntil > 1 ? 's' : ''}`
    }
    
    return format(paymentDate, 'dd MMM', { locale: es })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Próximos Pagos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-6 w-16 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximos Pagos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No hay pagos programados en los próximos días
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Ordenar por fecha de pago
  const sortedPayments = [...payments].sort((a, b) => {
    if (!a.fechaProximoPago) return 1
    if (!b.fechaProximoPago) return -1
    return new Date(a.fechaProximoPago).getTime() - new Date(b.fechaProximoPago).getTime()
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximos Pagos
          </div>
          <Badge variant="outline">
            {payments.length} pago{payments.length > 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedPayments.map((payment) => {
            const status = getPaymentStatus(payment)
            
            return (
              <div
                key={payment.id}
                className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                  status === 'overdue' ? 'border-red-200 bg-red-50/50' :
                  status === 'today' ? 'border-orange-200 bg-orange-50/50' :
                  'hover:bg-muted/50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{payment.nombre}</h4>
                    {getStatusBadge(status)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">
                        {formatCurrency(payment.monto, payment.moneda)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{getDateText(payment)}</span>
                    </div>
                  </div>
                </div>

                {onMarkAsPaid && (status === 'today' || status === 'overdue') && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMarkAsPaid(payment.id)}
                    className="ml-2 shrink-0"
                  >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    {compact ? 'Pagado' : 'Marcar como pagado'}
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        {/* Resumen total */}
        {payments.length > 1 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total próximos pagos:</span>
              <span className="font-semibold">
                {formatCurrency(
                  payments.reduce((total, payment) => total + payment.monto, 0),
                  payments[0]?.moneda || 'COP'
                )}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}