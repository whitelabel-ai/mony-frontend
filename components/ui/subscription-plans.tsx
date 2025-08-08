'use client'

import { useState } from 'react'
import { Check, Star } from 'lucide-react'
import { Card, CardContent, CardHeader } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { WorkInProgressModal } from './work-in-progress-modal'
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/types'

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
  const [selectedPaidPlan, setSelectedPaidPlan] = useState<SubscriptionPlan | null>(null)

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    if (plan.id === 'free') {
      onPlanSelect(plan.id)
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
            key={plan.id}
            plan={plan}
            isSelected={selectedPlan === plan.id}
            onSelect={() => handlePlanSelect(plan)}
          />
        ))}
      </div>

      {/* Modal WIP para planes de pago */}
      <WorkInProgressModal
        isOpen={showWipModal}
        onClose={() => setShowWipModal(false)}
        planName={selectedPaidPlan?.name || ''}
        onSelectFree={handleSelectFree}
      />
    </>
  )
}

interface PlanCardProps {
  plan: SubscriptionPlan
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
      } ${plan.popular ? 'border-primary' : ''}`}
      style={{
        borderColor: isSelected ? plan.color : undefined,
        boxShadow: isSelected ? `0 0 20px ${plan.color}20` : undefined
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-3 py-1 flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            Más Popular
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div className="space-y-2">
          <h3 className="text-xl font-bold" style={{ color: plan.color }}>
            {plan.name}
          </h3>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-bold">
              ${plan.price}
            </span>
            {plan.price > 0 && (
              <span className="text-muted-foreground">/{plan.interval === 'month' ? 'mes' : 'año'}</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground px-2">
            {plan.description}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Características */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-foreground">Qué incluye:</h4>
          <ul className="space-y-2">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Limitaciones */}
        {plan.limitations && plan.limitations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">Limitaciones:</h4>
            <ul className="space-y-1">
              {plan.limitations.map((limitation, index) => (
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
          style={{
            backgroundColor: isSelected ? plan.color : undefined,
            borderColor: isHovered && !isSelected ? plan.color : undefined,
            color: isHovered && !isSelected ? plan.color : undefined
          }}
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