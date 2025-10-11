'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Crown, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  ArrowUpCircle,
  Gift,
  CreditCard
} from 'lucide-react'
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

interface CurrentSubscriptionCardProps {
  subscription: UserSubscription | null
  currentPlan: SubscriptionPlan
  onUpgrade: (plan: SubscriptionPlan) => void
  onCancel: () => void
}

export function CurrentSubscriptionCard({ 
  subscription, 
  currentPlan, 
  onUpgrade, 
  onCancel 
}: CurrentSubscriptionCardProps) {
  const isFreePlan = currentPlan.id === 'free'
  const isActive = subscription?.status === 'active'
  const isCancelled = subscription?.status === 'cancelled'

  const getStatusBadge = () => {
    if (isFreePlan) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Gift className="h-3 w-3" />
          Plan Gratuito
        </Badge>
      )
    }

    if (isActive) {
      return (
        <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3" />
          Activo
        </Badge>
      )
    }

    if (isCancelled) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Cancelado
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        Expirado
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDaysUntilExpiry = () => {
    if (!subscription?.endDate) return null
    const endDate = new Date(subscription.endDate)
    const now = new Date()
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysUntilExpiry = getDaysUntilExpiry()

  // Función para obtener el siguiente plan disponible
  const getNextAvailablePlan = (): SubscriptionPlan | null => {
    const currentIndex = SUBSCRIPTION_PLANS.findIndex(plan => plan.id === currentPlan.id)
    const nextPlan = SUBSCRIPTION_PLANS[currentIndex + 1]
    return nextPlan || null
  }

  // Verificar si hay un plan superior disponible
  const hasUpgradeAvailable = (): boolean => {
    return getNextAvailablePlan() !== null
  }

  // Obtener el texto del botón de upgrade
  const getUpgradeButtonText = (): string => {
    const nextPlan = getNextAvailablePlan()
    if (!nextPlan) return 'Plan Máximo'
    
    if (currentPlan.id === 'free') {
      return 'Actualizar a Premium'
    } else if (currentPlan.id === 'premium') {
      return 'Actualizar a Pro'
    }
    return 'Actualizar Plan'
  }

  return (
    <Card className="relative overflow-hidden">
      {/* Decoración para planes premium */}
      {!isFreePlan && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-yellow-400 to-yellow-600 transform rotate-45 translate-x-8 -translate-y-8">
          <Crown className="h-4 w-4 text-white absolute bottom-2 left-2 transform -rotate-45" />
        </div>
      )}

      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {!isFreePlan && <Crown className="h-5 w-5 text-yellow-600" />}
              {currentPlan.nombre}
            </CardTitle>
            <CardDescription>
              {isFreePlan 
                ? 'Disfruta de las funciones básicas de Mony'
                : 'Tu suscripción premium activa'
              }
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Información del plan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Precio:</span>
              <span className="text-2xl font-bold text-primary">
                ${currentPlan.precio}
                {!isFreePlan && <span className="text-sm font-normal text-muted-foreground">/mes</span>}
              </span>
            </div>
            
            {subscription && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Inicio:</span>
                <span>{formatDate(subscription.startDate)}</span>
              </div>
            )}
          </div>

          {subscription && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {isCancelled ? 'Expira:' : 'Renovación:'}
                </span>
                <span className={daysUntilExpiry && daysUntilExpiry <= 7 ? 'text-orange-600 font-medium' : ''}>
                  {formatDate(subscription.endDate)}
                </span>
              </div>
              
              {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
                <div className="text-sm text-muted-foreground">
                  {daysUntilExpiry === 1 
                    ? 'Expira mañana' 
                    : `${daysUntilExpiry} días restantes`
                  }
                </div>
              )}
            </div>
          )}
        </div>

        {/* Características principales del plan */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Características incluidas:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {currentPlan.caracteristicas?.slice(0, 4).map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            )) || []}
          </div>
          {currentPlan.caracteristicas && currentPlan.caracteristicas.length > 4 && (
            <p className="text-sm text-muted-foreground mt-2">
              +{currentPlan.caracteristicas.length - 4} características más
            </p>
          )}
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {isFreePlan ? (
            // Plan gratuito - mostrar ambas opciones de upgrade
            <>
              <Button 
                onClick={() => {
                  const premiumPlan = SUBSCRIPTION_PLANS.find(plan => plan.id === 'premium')
                  if (premiumPlan) onUpgrade(premiumPlan)
                }} 
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <ArrowUpCircle className="h-4 w-4 mr-2" />
                Actualizar a Premium
              </Button>
              <Button 
                onClick={() => {
                  const proPlan = SUBSCRIPTION_PLANS.find(plan => plan.id === 'pro')
                  if (proPlan) onUpgrade(proPlan)
                }} 
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              >
                <Crown className="h-4 w-4 mr-2" />
                Actualizar a Pro
              </Button>
            </>
          ) : (
            <>
              {/* Botón de upgrade solo si hay un plan superior disponible */}
              {hasUpgradeAvailable() ? (
                <Button 
                  onClick={() => {
                    const nextPlan = getNextAvailablePlan()
                    if (nextPlan) onUpgrade(nextPlan)
                  }} 
                  variant="default"
                  className="flex-1"
                >
                  <ArrowUpCircle className="h-4 w-4 mr-2" />
                  {isCancelled ? 'Reactivar' : getUpgradeButtonText()}
                </Button>
              ) : (
                // Plan Pro - mostrar badge de plan máximo
                <div className="flex-1 flex items-center justify-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <Crown className="h-4 w-4 mr-2 text-green-600" />
                  <span className="text-green-700 font-medium">Plan Máximo Alcanzado</span>
                </div>
              )}
              
              {isActive && (
                <Button 
                  onClick={onCancel} 
                  variant="outline"
                  className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar Suscripción
                </Button>
              )}
            </>
          )}
        </div>

        {/* Mensaje motivacional para plan gratuito */}
        {isFreePlan && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <Crown className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">¿Listo para más?</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Desbloquea funciones avanzadas, reportes detallados y soporte prioritario con nuestros planes premium.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}