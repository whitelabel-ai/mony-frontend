'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Pause
} from 'lucide-react'
import { SubscriptionSummary } from '@/types'
import { useUserProfile } from '@/hooks/use-auth'
import { formatCurrency } from '@/lib/utils'

interface SubscriptionsSummaryProps {
  summary: SubscriptionSummary | null
  loading?: boolean
}

export function SubscriptionsSummary({ summary, loading }: SubscriptionsSummaryProps) {
  const { profile } = useUserProfile()
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-24 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-32 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">
              Sin suscripciones activas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suscripciones</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Ninguna suscripción registrada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Pagos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Sin pagos próximos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Anual</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">
              Proyección anual
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const monthlyTotal = summary.totalMonthlyAmount || 0
  const yearlyProjection = monthlyTotal * 12

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Mensual */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(monthlyTotal, profile?.moneda || 'COP')}
          </div>
          <p className="text-xs text-muted-foreground">
            {summary.active || 0} suscripciones activas
          </p>
        </CardContent>
      </Card>

      {/* Total de Suscripciones */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Suscripciones</CardTitle>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-600" />
            {summary.paused > 0 && (
              <Pause className="h-4 w-4 text-orange-600" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.total || 0}</div>
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="text-green-700 border-green-200">
              {summary.active || 0} activas
            </Badge>
            {summary.paused > 0 && (
              <Badge variant="outline" className="text-orange-700 border-orange-200">
                {summary.paused} pausadas
              </Badge>
            )}
            {summary.inactive > 0 && (
              <Badge variant="outline" className="text-gray-700 border-gray-200">
                {summary.inactive} inactivas
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Próximos Pagos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Próximos Pagos</CardTitle>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">-</div>
          <p className="text-xs text-muted-foreground">
            Ver próximos pagos
          </p>
        </CardContent>
      </Card>

      {/* Proyección Anual */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Proyección Anual</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(yearlyProjection, profile?.moneda || 'COP')}
          </div>
          <p className="text-xs text-muted-foreground">
            Basado en suscripciones activas
          </p>
        </CardContent>
      </Card>
    </div>
  )
}