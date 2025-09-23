'use client'

import { useState } from 'react'
import { Check, Star, Crown, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { WorkInProgressModal } from './work-in-progress-modal'
import { SUBSCRIPTION_PLANS } from '@/types'

interface SubscriptionPlansProps {
  selectedPlan?: string
  onPlanSelect: (planId: string) => void
  className?: string
}

/**
 * Componente para mostrar y seleccionar planes de suscripción
 */
export function SubscriptionPlans({ selectedPlan, onPlanSelect, className }: SubscriptionPlansProps) {
  const [showWipModal, setShowWipModal] = useState(false)
  const [selectedPaidPlan, setSelectedPaidPlan] = useState<any>(null)

  const handlePlanSelect = (plan: any) => {
    if (plan.tipo === 'free') {
      onPlanSelect(plan.tipo)
    } else {
      // Para planes de pago, mostrar modal WIP
      setSelectedPaidPlan(plan)
      setShowWipModal(true)
    }
  }

  const handleSelectFree = () => {
    onPlanSelect('free')
  }

  return (
    <>
      <div className={`grid gap-6 md:grid-cols-3 ${className}`}>
        {SUBSCRIPTION_PLANS.map((plan) => (
          <PlanCard
            key={plan.tipo}
            plan={plan}
            isSelected={selectedPlan === plan.tipo}
            onSelect={() => handlePlanSelect(plan)}
          />
        ))}
      </div>

      {/* Modal WIP para planes de pago */}
      <WorkInProgressModal
        isOpen={showWipModal}
        onClose={() => setShowWipModal(false)}
        planName={selectedPaidPlan?.nombre || ''}
        onSelectFree={handleSelectFree}
      />
    </>
  )
}

// Derivar el tipo del elemento del arreglo SUBSCRIPTION_PLANS
type Plan = (typeof SUBSCRIPTION_PLANS)[number]

interface PlanCardProps {
  plan: Plan
  isSelected: boolean
  onSelect: () => void
}

function PlanCard({ plan, isSelected, onSelect }: PlanCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
  className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 ${
    isSelected
      ? 'ring-2 ring-primary shadow-lg'
      : 'hover:shadow-md'
  }`}
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
  onClick={onSelect}
>

      {/* Eliminado badge de "Más Popular" ya que no existe la propiedad popular en el nuevo esquema */}

      <CardHeader className="text-center pb-4">
        <div className="space-y-2">
          <h3 className="text-xl font-bold">
            {plan.nombre}
          </h3>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-bold">
              ${plan.precio}
            </span>
            {plan.precio > 0 && (
              <span className="text-muted-foreground">/mes</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground px-2">
            {plan.descripcion}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Características */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-foreground">Qué incluye:</h4>
          <ul className="space-y-2">
            {plan.caracteristicas.map((feature: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Limitaciones */}
        {plan.limitaciones && plan.limitaciones.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">Limitaciones:</h4>
            <ul className="space-y-1">
              {plan.limitaciones.map((limitation: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>{limitation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Botón de selección */}
        <Button
          variant={isSelected ? 'default' : 'outline'}
          className={`w-full mt-4 transition-all duration-200 ${
            isSelected
              ? 'bg-primary text-primary-foreground'
              : isHovered
              ? 'border-primary text-primary'
              : ''
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