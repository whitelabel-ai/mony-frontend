'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CreditCard, 
  CheckCircle, 
  Crown, 
  ArrowRight,
  Loader2,
  Shield,
  Zap
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { apiService } from '@/lib/api'
import { type SubscriptionPlan } from '@/types'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  selectedPlan: SubscriptionPlan | null
  currentPlan: SubscriptionPlan
  onSuccess: () => void
}

export function UpgradeModal({ 
  isOpen, 
  onClose, 
  selectedPlan, 
  currentPlan, 
  onSuccess 
}: UpgradeModalProps) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'confirm' | 'payment' | 'processing'>('confirm')

  if (!selectedPlan) return null

  const isUpgrade = selectedPlan.precio > currentPlan.precio
  const priceDifference = selectedPlan.precio - currentPlan.precio

  const handleConfirm = () => {
    setStep('payment')
  }

  const handlePayment = async () => {
    try {
      setLoading(true)
      setStep('processing')

      const { paymentService } = await import('@/lib/payment-service')
      
      const response = await paymentService.upgradeSubscription(selectedPlan.id, currentPlan.id)

      if (!response.success) {
        throw new Error(response.error || 'Error al procesar el pago')
      }

      if (response.paymentUrl) {
        // Redirigir a dLocal para el pago
        paymentService.redirectToPayment(response.paymentUrl)
      } else {
        // Si es un downgrade o cambio sin costo adicional
        toast.success('¡Suscripción actualizada exitosamente!')
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error upgrading subscription:', error)
      toast.error(error.message || 'Error al procesar la actualización. Inténtalo de nuevo.')
      setStep('payment')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setStep('confirm')
      onClose()
    }
  }

  const getNewFeatures = () => {
    return selectedPlan.caracteristicas?.filter((feature: string) => 
      !currentPlan.caracteristicas?.includes(feature)
    ) || []
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            {isUpgrade ? 'Actualizar Suscripción' : 'Cambiar Plan'}
          </DialogTitle>
          <DialogDescription>
            {isUpgrade 
              ? 'Desbloquea nuevas funcionalidades con tu nuevo plan'
              : 'Confirma los cambios en tu suscripción'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'confirm' && (
          <div className="space-y-6">
            {/* Comparación de planes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Plan actual */}
              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    Plan Actual
                    <Badge variant="outline">Actual</Badge>
                  </CardTitle>
                  <CardDescription>{currentPlan.nombre}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    ${currentPlan.precio}
                    {currentPlan.id !== 'free' && <span className="text-sm font-normal">/mes</span>}
                  </div>
                  <div className="space-y-1">
                    {currentPlan.caracteristicas?.slice(0, 3).map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Nuevo plan */}
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    Nuevo Plan
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {isUpgrade ? 'Upgrade' : 'Nuevo'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{selectedPlan.nombre}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2 text-green-700">
                    ${selectedPlan.precio}
                    {selectedPlan.id !== 'free' && <span className="text-sm font-normal">/mes</span>}
                  </div>
                  <div className="space-y-1">
                    {selectedPlan.caracteristicas?.slice(0, 3).map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Nuevas características */}
            {getNewFeatures().length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Nuevas funcionalidades que obtendrás:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {getNewFeatures().map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-blue-800">
                      <CheckCircle className="h-3 w-3 text-blue-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resumen de costos */}
            {isUpgrade && (
              <Card className="bg-gray-50">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Plan actual ({currentPlan.nombre})</span>
                      <span>${currentPlan.precio}/mes</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Nuevo plan ({selectedPlan.nombre})</span>
                      <span>${selectedPlan.precio}/mes</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Diferencia mensual</span>
                      <span className="text-green-600">+${priceDifference}/mes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleConfirm} className="flex-1 bg-gradient-to-r from-green-600 to-green-700">
                <ArrowRight className="h-4 w-4 mr-2" />
                Continuar
              </Button>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Procesar Pago</h3>
              <p className="text-muted-foreground">
                Serás redirigido a nuestro procesador de pagos seguro para completar la transacción.
              </p>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Pago 100% Seguro</span>
                </div>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• Procesado por dLocal, líder en pagos en Latinoamérica</p>
                  <p>• Encriptación SSL de nivel bancario</p>
                  <p>• No almacenamos información de tarjetas</p>
                </div>
              </CardContent>
            </Card>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total a pagar:</span>
                <span className="text-2xl font-bold text-green-600">
                  ${selectedPlan.precio}/mes
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Facturación mensual • Cancela en cualquier momento
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('confirm')} className="flex-1">
                Volver
              </Button>
              <Button 
                onClick={handlePayment} 
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Proceder al Pago
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Procesando...</h3>
            <p className="text-muted-foreground">
              Estamos preparando tu nueva suscripción. Por favor espera un momento.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}