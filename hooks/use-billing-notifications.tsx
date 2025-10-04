'use client'

import { useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useSubscription } from './use-subscription'

interface NotificationOptions {
  enableExpiryWarnings?: boolean
  enableUpgradePrompts?: boolean
  enablePaymentReminders?: boolean
  expiryWarningDays?: number
}

export function useBillingNotifications(options: NotificationOptions = {}) {
  const {
    enableExpiryWarnings = true,
    enableUpgradePrompts = true,
    enablePaymentReminders = true,
    expiryWarningDays = 7
  } = options

  const { 
    subscription, 
    currentPlan, 
    isExpiringSoon, 
    daysUntilExpiry,
    loading 
  } = useSubscription()

  // Notificación de expiración próxima
  useEffect(() => {
    if (!enableExpiryWarnings || loading || !subscription) return

    const days = daysUntilExpiry
    if (days === null) return

    // Notificar cuando quedan exactamente los días configurados
    if (days === expiryWarningDays) {
      toast((t) => (
        <div className="flex flex-col gap-2">
          <div className="font-medium">⚠️ Tu suscripción expira pronto</div>
          <div className="text-sm text-gray-600">
            Tu plan {currentPlan.nombre} expira en {days} días. 
            Renueva ahora para mantener todas las funcionalidades.
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id)
                // Aquí podrías redirigir a la página de billing
                window.location.href = '/dashboard/billing'
              }}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
            >
              Renovar
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      ), {
        duration: 10000,
        id: `expiry-warning-${days}`
      })
    }

    // Notificación crítica cuando quedan 3 días o menos
    if (days <= 3 && days > 0) {
      toast.error((t) => (
        <div className="flex flex-col gap-2">
          <div className="font-medium">🚨 ¡Suscripción expira muy pronto!</div>
          <div className="text-sm">
            Solo quedan {days} día{days !== 1 ? 's' : ''} para que expire tu plan {currentPlan.nombre}.
          </div>
          <button
            onClick={() => {
              toast.dismiss(t.id)
              window.location.href = '/dashboard/billing'
            }}
            className="text-xs bg-red-600 text-white px-2 py-1 rounded w-fit"
          >
            Renovar Ahora
          </button>
        </div>
      ), {
        duration: 15000,
        id: `critical-expiry-${days}`
      })
    }

    // Notificación cuando ya expiró
    if (days === 0) {
      toast.error((t) => (
        <div className="flex flex-col gap-2">
          <div className="font-medium">❌ Tu suscripción ha expirado</div>
          <div className="text-sm">
            Tu plan {currentPlan.nombre} ha expirado. Has sido cambiado al plan gratuito.
          </div>
          <button
            onClick={() => {
              toast.dismiss(t.id)
              window.location.href = '/dashboard/billing'
            }}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded w-fit"
          >
            Reactivar Suscripción
          </button>
        </div>
      ), {
        duration: 20000,
        id: 'subscription-expired'
      })
    }
  }, [
    enableExpiryWarnings,
    loading,
    subscription,
    daysUntilExpiry,
    expiryWarningDays,
    currentPlan.nombre
  ])

  // Prompts de upgrade para usuarios del plan gratuito
  useEffect(() => {
    if (!enableUpgradePrompts || loading || !currentPlan) return

    // Solo mostrar para usuarios del plan gratuito después de cierto tiempo
    if (currentPlan.id === 'free') {
      const hasShownUpgradePrompt = localStorage.getItem('upgrade-prompt-shown')
      const lastShown = localStorage.getItem('upgrade-prompt-last-shown')
      
      // Mostrar cada 3 días
      const shouldShow = !hasShownUpgradePrompt || 
        (lastShown && Date.now() - parseInt(lastShown) > 3 * 24 * 60 * 60 * 1000)

      if (shouldShow) {
        setTimeout(() => {
          toast((t) => (
            <div className="flex flex-col gap-2">
              <div className="font-medium">🚀 ¡Desbloquea más funcionalidades!</div>
              <div className="text-sm text-gray-600">
                Actualiza a un plan premium y accede a análisis avanzados, 
                transacciones ilimitadas y más.
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    toast.dismiss(t.id)
                    window.location.href = '/dashboard/billing'
                  }}
                  className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded"
                >
                  Ver Planes
                </button>
                <button
                  onClick={() => {
                    toast.dismiss(t.id)
                    localStorage.setItem('upgrade-prompt-last-shown', Date.now().toString())
                  }}
                  className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded"
                >
                  Más tarde
                </button>
              </div>
            </div>
          ), {
            duration: 12000,
            id: 'upgrade-prompt'
          })

          localStorage.setItem('upgrade-prompt-shown', 'true')
          localStorage.setItem('upgrade-prompt-last-shown', Date.now().toString())
        }, 5000) // Mostrar después de 5 segundos
      }
    }
  }, [enableUpgradePrompts, loading, currentPlan])

  // Notificaciones de éxito para acciones completadas
  const showSuccessNotification = (type: 'upgrade' | 'cancel' | 'reactivate', planName?: string) => {
    const messages = {
      upgrade: `🎉 ¡Suscripción actualizada! Ahora tienes acceso a ${planName}`,
      cancel: '✅ Suscripción cancelada exitosamente. Has sido cambiado al plan gratuito.',
      reactivate: `🎉 ¡Suscripción reactivada! Bienvenido de vuelta a ${planName}`
    }

    toast.success(messages[type], {
      duration: 5000,
      icon: '✨'
    })
  }

  // Notificaciones de error
  const showErrorNotification = (message: string) => {
    toast.error(message, {
      duration: 6000
    })
  }

  // Notificación de procesamiento de pago
  const showPaymentProcessingNotification = () => {
    return toast.loading('Procesando pago...', {
      id: 'payment-processing'
    })
  }

  const dismissPaymentProcessingNotification = () => {
    toast.dismiss('payment-processing')
  }

  return {
    showSuccessNotification,
    showErrorNotification,
    showPaymentProcessingNotification,
    dismissPaymentProcessingNotification,
    
    // Estado de notificaciones
    isExpiringSoon,
    daysUntilExpiry,
    currentPlan
  }
}