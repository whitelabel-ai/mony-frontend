'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CreditCard, 
  Calendar, 
  Crown, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { type SubscriptionPlan } from '@/types'
import { CurrentSubscriptionCard } from '@/components/billing/current-subscription-card'
import { PlansComparison } from '@/components/billing/plans-comparison'
import { UpgradeModal } from '@/components/billing/upgrade-modal'
import { CancelModal } from '@/components/billing/cancel-modal'
import { PaymentReturnHandler } from '@/components/billing/payment-return-handler'
import { PaymentHistory } from '@/components/billing/payment-history'
import { useSubscription } from '@/hooks/use-subscription'
import { useBillingNotifications } from '@/hooks/use-billing-notifications'
import { paymentService } from '@/lib/payment-service'

export default function BillingPage() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [showPaymentReturn, setShowPaymentReturn] = useState(false)

  const searchParams = useSearchParams()
  
  const { 
    subscription, 
    currentPlan, 
    loading, 
    loadSubscription,
    availableUpgrades,
    isSubscriptionExpiringSoon
  } = useSubscription()

  // Activar notificaciones de facturación
  useBillingNotifications({
    enableExpiryWarnings: true,
    enableUpgradePrompts: true,
    expiryWarningDays: 7
  })

  // Verificar si venimos de un retorno de pago
  useEffect(() => {
    const { wasPaymentInProgress } = paymentService.checkReturnFromPayment()
    const hasPaymentParams = searchParams.get('payment_id') || 
                            searchParams.get('status') || 
                            searchParams.get('id')
    
    if (wasPaymentInProgress || hasPaymentParams) {
      setShowPaymentReturn(true)
    }
  }, [searchParams])

  const handleUpgrade = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setShowUpgradeModal(true)
  }

  const handleCancelSubscription = () => {
    setShowCancelModal(true)
  }

  const onUpgradeSuccess = () => {
    setShowUpgradeModal(false)
    setSelectedPlan(null)
    loadSubscription()
  }

  const onCancelSuccess = () => {
    setShowCancelModal(false)
    loadSubscription()
  }

  // Mostrar el componente de retorno de pago si es necesario
  if (showPaymentReturn) {
    return (
      <div className="container mx-auto p-6 min-h-screen flex items-center justify-center">
        <PaymentReturnHandler 
          onComplete={() => setShowPaymentReturn(false)}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facturación</h1>
          <p className="text-muted-foreground">
            Gestiona tu suscripción y métodos de pago
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Pagos seguros con dLocal
          </span>
        </div>
      </div>

      {/* Alerta de expiración próxima */}
      {isSubscriptionExpiringSoon() && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800">
                  Tu suscripción expira pronto
                </p>
                <p className="text-sm text-orange-600">
                  Tu plan {currentPlan.nombre} expira el{' '}
                  {subscription?.endDate && new Date(subscription.endDate).toLocaleDateString('es-ES')}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-auto border-orange-300 text-orange-700 hover:bg-orange-100"
                onClick={() => handleUpgrade(currentPlan)}
              >
                Renovar ahora
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suscripción actual */}
      <CurrentSubscriptionCard 
        subscription={subscription}
        currentPlan={currentPlan}
        onUpgrade={handleUpgrade}
        onCancel={handleCancelSubscription}
      />

      <Separator />

      {/* Comparación de planes */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Planes disponibles</h2>
          <p className="text-muted-foreground">
            Elige el plan que mejor se adapte a tus necesidades
          </p>
        </div>
        
        <PlansComparison 
          currentPlan={currentPlan}
          onSelectPlan={handleUpgrade}
          availableUpgrades={availableUpgrades}
        />
      </div>

      {/* Payment History */}
      <PaymentHistory limit={5} />

      {/* Modales */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        selectedPlan={selectedPlan}
        currentPlan={currentPlan}
        onSuccess={onUpgradeSuccess}
      />

      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        subscription={subscription}
        onSuccess={onCancelSuccess}
      />
    </div>
  )
}