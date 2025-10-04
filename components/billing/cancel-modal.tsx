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
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  AlertTriangle, 
  XCircle, 
  Calendar,
  Gift,
  Loader2,
  Heart,
  DollarSign
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { apiService } from '@/lib/api'
import { type SubscriptionPlan } from '@/types'

interface UserSubscription {
  id: string
  planId: string
  status: 'active' | 'cancelled' | 'expired'
  startDate: string
  endDate: string
  autoRenew: boolean
  plan: SubscriptionPlan
}

interface CancelModalProps {
  isOpen: boolean
  onClose: () => void
  subscription: UserSubscription | null
  onSuccess: () => void
}

const CANCEL_REASONS = [
  { id: 'too_expensive', label: 'Muy costoso' },
  { id: 'not_using', label: 'No lo uso lo suficiente' },
  { id: 'missing_features', label: 'Le faltan funciones que necesito' },
  { id: 'found_alternative', label: 'Encontré una alternativa mejor' },
  { id: 'temporary', label: 'Es temporal, volveré más tarde' },
  { id: 'other', label: 'Otro motivo' }
]

export function CancelModal({ 
  isOpen, 
  onClose, 
  subscription, 
  onSuccess 
}: CancelModalProps) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'confirm' | 'feedback' | 'processing'>('confirm')
  const [selectedReason, setSelectedReason] = useState('')
  const [feedback, setFeedback] = useState('')

  if (!subscription) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleConfirmCancel = () => {
    setStep('feedback')
  }

  const handleSubmitFeedback = async () => {
    try {
      setLoading(true)
      setStep('processing')

      await apiService.post('/subscriptions/cancel', {
        subscriptionId: subscription.id,
        reason: selectedReason,
        feedback: feedback.trim()
      })

      onSuccess()
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      toast.error('Error al cancelar la suscripción. Inténtalo de nuevo.')
      setStep('feedback')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setStep('confirm')
      setSelectedReason('')
      setFeedback('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-700">
            <XCircle className="h-5 w-5" />
            Cancelar Suscripción
          </DialogTitle>
          <DialogDescription>
            Lamentamos que quieras cancelar tu suscripción
          </DialogDescription>
        </DialogHeader>

        {step === 'confirm' && (
          <div className="space-y-6">
            {/* Información de la suscripción */}
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-red-900">{subscription.plan.nombre}</h3>
                    <p className="text-sm text-red-700">Plan actual</p>
                  </div>
                  <Badge variant="destructive">
                    ${subscription.plan.precio}/mes
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm text-red-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Activo hasta: {formatDate(subscription.endDate)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advertencia */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <h4 className="font-medium text-yellow-800 mb-1">
                    ¿Estás seguro de que quieres cancelar?
                  </h4>
                  <ul className="text-yellow-700 space-y-1">
                    <li>• Perderás acceso a todas las funciones premium</li>
                    <li>• Tu cuenta volverá al plan gratuito</li>
                    <li>• Podrás seguir usando Mony hasta {formatDate(subscription.endDate)}</li>
                    <li>• Puedes reactivar tu suscripción en cualquier momento</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Oferta de retención */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">
                      ¡Espera! Tenemos una oferta especial para ti
                    </h4>
                    <p className="text-sm text-blue-800 mb-3">
                      Antes de cancelar, ¿qué te parece un 50% de descuento en tu próximo mes?
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-700">
                        Solo ${(subscription.plan.precio / 2).toFixed(0)} por el próximo mes
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botones de acción */}
            <div className="flex flex-col gap-3">
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Heart className="h-4 w-4 mr-2" />
                Aceptar descuento y mantener suscripción
              </Button>
              
              <Button 
                variant="destructive" 
                onClick={handleConfirmCancel}
                className="bg-red-600 hover:bg-red-700"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Continuar con la cancelación
              </Button>
            </div>
          </div>
        )}

        {step === 'feedback' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ayúdanos a mejorar</h3>
              <p className="text-muted-foreground text-sm">
                Tu opinión es muy valiosa para nosotros
              </p>
            </div>

            {/* Razones de cancelación */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                ¿Cuál es el motivo principal de tu cancelación?
              </Label>
              <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
                {CANCEL_REASONS.map((reason) => (
                  <div key={reason.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={reason.id} id={reason.id} />
                    <Label htmlFor={reason.id} className="text-sm cursor-pointer">
                      {reason.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Comentarios adicionales */}
            <div>
              <Label htmlFor="feedback" className="text-sm font-medium mb-2 block">
                Comentarios adicionales (opcional)
              </Label>
              <Textarea
                id="feedback"
                placeholder="Cuéntanos cómo podríamos mejorar..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setStep('confirm')} 
                className="flex-1"
              >
                Volver
              </Button>
              <Button 
                onClick={handleSubmitFeedback}
                disabled={!selectedReason || loading}
                variant="destructive"
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Confirmar Cancelación
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Procesando cancelación...</h3>
            <p className="text-muted-foreground">
              Estamos procesando tu solicitud. Esto tomará solo un momento.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}