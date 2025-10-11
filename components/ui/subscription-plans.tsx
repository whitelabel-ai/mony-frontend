'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Star, Users, Sparkles, Building2 } from 'lucide-react'
import { SUBSCRIPTION_PLANS } from '@/types'

// Derivar el tipo del elemento del arreglo SUBSCRIPTION_PLANS
type Plan = (typeof SUBSCRIPTION_PLANS)[number]

interface SubscriptionPlansProps {
  selectedPlan?: string
  onPlanSelect: (planId: string) => void
  onContinue?: () => void
  className?: string
}

/**
 * Componente para mostrar y seleccionar planes de suscripción
 */
export function SubscriptionPlans({ selectedPlan, onPlanSelect, onContinue, className }: SubscriptionPlansProps) {
  const [selectedPaidPlan, setSelectedPaidPlan] = useState<Plan | null>(null)

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPaidPlan(plan)
    onPlanSelect(plan.tipo)
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
      {/* <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Elige tu Plan de Suscripción
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Selecciona el plan que mejor se adapte a tus necesidades. Puedes cambiar o cancelar en cualquier momento.
        </p>
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 max-w-6xl mx-auto">
        {SUBSCRIPTION_PLANS.map((plan: Plan) => (
          <PlanCard
            key={plan.tipo}
            plan={plan}
            isSelected={selectedPlan === plan.tipo}
            onSelect={() => handlePlanSelect(plan)}
          />
        ))}
      </div>

      {selectedPaidPlan && onContinue && (
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Check className="h-5 w-5 text-green-500" />
            <p className="text-gray-700 font-medium">
              Has seleccionado el plan <strong className="text-gray-900">{selectedPaidPlan.nombre}</strong>
            </p>
          </div>
          <Button 
            onClick={onContinue}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            Continuar con {selectedPaidPlan.nombre}
          </Button>
        </div>
      )}
    </div>
  )
}

interface PlanCardProps {
  plan: Plan
  isSelected: boolean
  onSelect: () => void
}

function PlanCard({ plan, isSelected, onSelect }: PlanCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Configuración de colores y iconos por plan
  const getPlanConfig = (tipo: string) => {
    switch (tipo) {
      case 'free':
        return {
          color: 'from-gray-500 to-gray-600',
          borderColor: 'border-gray-200',
          icon: Users,
          bgGradient: 'bg-gradient-to-br from-gray-50 to-gray-100',
          popular: false
        }
      case 'premium':
        return {
          color: 'from-blue-500 to-blue-600',
          borderColor: 'border-blue-200',
          icon: Sparkles,
          bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
          popular: true
        }
      case 'pro':
        return {
          color: 'from-purple-500 to-purple-600',
          borderColor: 'border-purple-200',
          icon: Building2,
          bgGradient: 'bg-gradient-to-br from-purple-50 to-purple-100',
          popular: false
        }
      default:
        return {
          color: 'from-gray-500 to-gray-600',
          borderColor: 'border-gray-200',
          icon: Users,
          bgGradient: 'bg-gradient-to-br from-gray-50 to-gray-100',
          popular: false
        }
    }
  }

  const config = getPlanConfig(plan.tipo)
  const IconComponent = config.icon

  return (
    <Card
      className={`relative cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
        isSelected
          ? `ring-2 ring-offset-2 shadow-xl ${config.borderColor.replace('border-', 'ring-')}`
          : 'hover:shadow-lg'
      } ${config.popular ? 'border-2 border-blue-300 shadow-lg' : config.borderColor} ${config.bgGradient}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      {/* Badge de "Más Popular" */}
      {config.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 flex items-center gap-1 shadow-lg">
            <Star className="h-3 w-3 fill-current" />
            Más Popular
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-3 pt-6">
        <div className="space-y-3">
          {/* Icono del plan */}
          <div className="flex justify-center">
            <div className={`p-3 rounded-full bg-gradient-to-r ${config.color} shadow-lg`}>
              <IconComponent className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900">
            {plan.nombre}
          </h3>
          
          <div className="flex items-baseline justify-center gap-1">
            <span className={`text-3xl font-bold bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
              ${plan.precio}
            </span>
            {plan.precio > 0 && (
              <span className="text-gray-500 text-sm">/mes</span>
            )}
          </div>
          
          <p className="text-sm text-gray-600 px-2 leading-relaxed">
            {plan.lema}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-4 pb-6">
        {/* Dirigido a */}
        <div className="text-center">
          <span className="inline-block px-3 py-1 bg-white/70 rounded-full text-xs font-medium text-gray-700 border">
            {plan.dirigidoA}
          </span>
        </div>

        {/* Características principales (solo las primeras 4) */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            Características principales:
          </h4>
          <ul className="space-y-1.5">
            {plan.caracteristicas.slice(0, 4).map((feature: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                <span className="leading-relaxed">{feature}</span>
              </li>
            ))}
            {plan.caracteristicas.length > 4 && (
              <li className="text-xs text-gray-500 italic pl-3.5">
                +{plan.caracteristicas.length - 4} características más
              </li>
            )}
          </ul>
        </div>

        {/* Información adicional compacta */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white/50 rounded-lg p-2 text-center">
            <div className="font-semibold text-gray-800">
              {plan.registrosMensuales === -1 ? '∞' : plan.registrosMensuales}
            </div>
            <div className="text-gray-600">Registros/mes</div>
          </div>
          <div className="bg-white/50 rounded-lg p-2 text-center">
            <div className="font-semibold text-gray-800">
              {plan.perfilesFinancieros}
            </div>
            <div className="text-gray-600">Perfiles</div>
          </div>
        </div>

        {/* Botón de selección */}
        <Button
          variant={isSelected ? 'default' : 'outline'}
          className={`w-full mt-4 transition-all duration-200 font-semibold ${
            isSelected
              ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
              : `hover:bg-gradient-to-r hover:${config.color} hover:text-white border-2 ${config.borderColor}`
          }`}
        >
          {isSelected ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Seleccionado
            </>
          ) : (
            'Seleccionar Plan'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

export default SubscriptionPlans