'use client'

import { useEffect, useCallback } from 'react'
import { useTransactionEvents } from '@/hooks/use-transaction-events'
import { useAuth } from '@/hooks/use-auth'

interface TransactionEventsProviderProps {
  children: React.ReactNode
}

export function TransactionEventsProvider({ children }: TransactionEventsProviderProps) {
  const { user } = useAuth()

  // Función para forzar recarga de datos en componentes
  const triggerDataRefresh = useCallback(() => {
    // Disparar evento personalizado para que los componentes se actualicen
    window.dispatchEvent(new CustomEvent('transaction-data-changed'))
  }, [])

  // Configurar el hook SSE con callbacks para invalidar cache
  const { isConnected, connectionError } = useTransactionEvents({
    onTransactionCreated: (transaction) => {
      console.log('Nueva transacción creada:', transaction)
      triggerDataRefresh()
    },
    
    onTransactionUpdated: (transaction) => {
      console.log('Transacción actualizada:', transaction)
      triggerDataRefresh()
    },
    
    onTransactionDeleted: (transactionId) => {
      console.log('Transacción eliminada:', transactionId)
      triggerDataRefresh()
    },
    
    enableNotifications: true
  })

  // Mostrar estado de conexión en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (isConnected) {
        console.log('✅ SSE conectado - Eventos de transacciones en tiempo real activos')
      } else if (connectionError) {
        console.warn('❌ Error SSE:', connectionError)
      }
    }
  }, [isConnected, connectionError])

  // Solo mostrar indicador de conexión en desarrollo o si hay error
  const showConnectionStatus = process.env.NODE_ENV === 'development' || connectionError

  return (
    <>
      {children}
      
      {/* Indicador de estado de conexión SSE (solo en desarrollo o error) */}
      {showConnectionStatus && user && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`
            px-3 py-2 rounded-lg text-xs font-medium shadow-lg border
            ${isConnected 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : connectionError 
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
            }
          `}>
            <div className="flex items-center gap-2">
              <div className={`
                w-2 h-2 rounded-full
                ${isConnected 
                  ? 'bg-green-500 animate-pulse' 
                  : connectionError 
                    ? 'bg-red-500'
                    : 'bg-yellow-500 animate-pulse'
                }
              `} />
              <span>
                {isConnected 
                  ? 'Eventos en tiempo real' 
                  : connectionError 
                    ? 'Sin conexión en tiempo real'
                    : 'Conectando...'
                }
              </span>
            </div>
            {connectionError && (
              <div className="text-xs text-red-600 mt-1">
                {connectionError}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}