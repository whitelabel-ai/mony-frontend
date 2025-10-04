'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Crown, 
  Star, 
  Zap,
  ArrowUpCircle,
  Sparkles
} from 'lucide-react'
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/types'

interface PlansComparisonProps {
  currentPlan: SubscriptionPlan
  onSelectPlan: (plan: SubscriptionPlan) => void
  availableUpgrades: SubscriptionPlan[]
}

export function PlansComparison({ currentPlan, onSelectPlan, availableUpgrades }: PlansComparisonProps) {
  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Star className="h-5 w-5" />
      case 'basic':
        return <Zap className="h-5 w-5" />
      case 'premium':
        return <Crown className="h-5 w-5" />
      case 'enterprise':
        return <Sparkles className="h-5 w-5" />
      default:
        return <Star className="h-5 w-5" />
    }
  }

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'free':
        return 'text-gray-600'
      case 'basic':
        return 'text-blue-600'
      case 'premium':
        return 'text-purple-600'
      case 'enterprise':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  const getPlanGradient = (planId: string) => {
    switch (planId) {
      case 'basic':
        return 'from-blue-600 to-blue-700'
      case 'premium':
        return 'from-purple-600 to-purple-700'
      case 'enterprise':
        return 'from-yellow-600 to-yellow-700'
      default:
        return 'from-gray-600 to-gray-700'
    }
  }

  const isCurrentPlan = (plan: SubscriptionPlan) => plan.id === currentPlan.id
  const canUpgrade = (plan: SubscriptionPlan) => availableUpgrades.some(upgrade => upgrade.id === plan.id)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {SUBSCRIPTION_PLANS.map((plan) => {
        const isCurrent = isCurrentPlan(plan)
        const isUpgrade = canUpgrade(plan)
        const isRecommended = plan.id === 'premium'

        return (
          <Card 
            key={plan.id} 
            className={`relative transition-all duration-200 ${
              isCurrent 
                ? 'ring-2 ring-primary shadow-lg' 
                : isUpgrade 
                  ? 'hover:shadow-lg hover:scale-105 cursor-pointer border-2 border-dashed border-green-300 hover:border-green-400' 
                  : 'opacity-75'
            } ${isRecommended ? 'border-purple-200 shadow-md' : ''}`}
          >
            {/* Badge de recomendado */}
            {isRecommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  Recomendado
                </Badge>
              </div>
            )}

            {/* Badge de plan actual */}
            {isCurrent && (
              <div className="absolute -top-3 right-4">
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                  Plan Actual
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className={`mx-auto mb-2 ${getPlanColor(plan.id)}`}>
                {getPlanIcon(plan.id)}
              </div>
              <CardTitle className="text-xl">{plan.nombre}</CardTitle>
              <CardDescription className="text-sm">{plan.descripcion}</CardDescription>
              
              <div className="mt-4">
                <div className="text-3xl font-bold">
                  ${plan.precio}
                  {plan.id !== 'free' && (
                    <span className="text-sm font-normal text-muted-foreground">/mes</span>
                  )}
                </div>
                {plan.id !== 'free' && (
                  <div className="text-sm text-muted-foreground">
                    Facturado mensualmente
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Características */}
              <div className="space-y-2">
                {plan.caracteristicas?.map((feature: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="leading-tight">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Botón de acción */}
              <div className="pt-4">
                {isCurrent ? (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    disabled
                  >
                    Plan Actual
                  </Button>
                ) : isUpgrade ? (
                  <Button 
                    onClick={() => onSelectPlan(plan)}
                    className={`w-full bg-gradient-to-r ${getPlanGradient(plan.id)} hover:opacity-90 transition-opacity`}
                  >
                    <ArrowUpCircle className="h-4 w-4 mr-2" />
                    Actualizar
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    className="w-full" 
                    disabled
                  >
                    No disponible
                  </Button>
                )}
              </div>

              {/* Mensaje motivacional para upgrades */}
              {isUpgrade && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 mt-3">
                  <div className="text-center">
                    <div className="text-sm font-medium text-green-800">
                      ¡Mejora tu experiencia!
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      Desbloquea nuevas funcionalidades
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}