'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { apiService } from '@/lib/api'

interface TransactionEvent {
  type: 'transaction.created' | 'transaction.updated' | 'transaction.deleted' | 'connection.established'
  data: any
  timestamp: string
}

interface UseTransactionEventsOptions {
  onTransactionCreated?: (transaction: any) => void
  onTransactionUpdated?: (transaction: any) => void
  onTransactionDeleted?: (transactionId: string) => void
  enableNotifications?: boolean
}

export function useTransactionEvents(options: UseTransactionEventsOptions = {}) {
  const {
    onTransactionCreated,
    onTransactionUpdated,
    onTransactionDeleted,
    enableNotifications = true
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = () => {
    const token = apiService.getAuthToken()
    if (!token) {
      console.log('No token available for SSE connection')
      return
    }

    try {
      // Cerrar conexión existente si existe
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
      // Enviar token como query parameter ya que EventSource no soporta headers personalizados
      const url = `${baseUrl}/transactions/events?token=${encodeURIComponent(token)}`
      
      const eventSource = new EventSource(url, {
        withCredentials: true
      })
      
      eventSource.onopen = () => {
        console.log('SSE connection established')
        setIsConnected(true)
        setConnectionError(null)
        reconnectAttempts.current = 0
      }

      eventSource.onmessage = (event) => {
        try {
          const eventData: TransactionEvent = JSON.parse(event.data)
          console.log('Received SSE event:', eventData)

          switch (eventData.type) {
            case 'connection.established':
              console.log('SSE connection confirmed:', eventData.data.message)
              break

            case 'transaction.created':
              if (enableNotifications) {
                showTransactionCreatedNotification(eventData.data)
              }
              onTransactionCreated?.(eventData.data)
              break

            case 'transaction.updated':
              if (enableNotifications) {
                showTransactionUpdatedNotification(eventData.data)
              }
              onTransactionUpdated?.(eventData.data)
              break

            case 'transaction.deleted':
              if (enableNotifications) {
                showTransactionDeletedNotification(eventData.data.id)
              }
              onTransactionDeleted?.(eventData.data.id)
              break

            default:
              console.log('Unknown event type:', eventData.type)
          }
        } catch (error) {
          console.error('Error parsing SSE event:', error)
        }
      }

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error)
        setIsConnected(false)
        setConnectionError('Error de conexión con el servidor')
        
        // Intentar reconectar con backoff exponencial
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000 // 1s, 2s, 4s, 8s, 16s
          reconnectAttempts.current++
          
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        } else {
          console.error('Max reconnection attempts reached')
          setConnectionError('No se pudo establecer conexión con el servidor')
        }
      }

      eventSourceRef.current = eventSource

    } catch (error) {
      console.error('Error creating SSE connection:', error)
      setConnectionError('Error al crear conexión SSE')
    }
  }

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    setIsConnected(false)
    setConnectionError(null)
    reconnectAttempts.current = 0
  }

  // Notificaciones visuales bonitas
  const showTransactionCreatedNotification = (transaction: any) => {
    const isIncome = transaction.tipo === 'ingreso'
    const emoji = isIncome ? '💰' : '💸'
    const amount = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: transaction.moneda || 'COP'
    }).format(transaction.monto)

    toast.success(
      `${emoji} ${isIncome ? 'Nuevo Ingreso' : 'Nuevo Gasto'}: ${transaction.descripcion} - ${amount}`,
      {
        duration: 5000,
        id: `transaction-created-${transaction.id}`
      }
    )
  }

  const showTransactionUpdatedNotification = (transaction: any) => {
    const amount = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: transaction.moneda || 'COP'
    }).format(transaction.monto)

    toast.success(
      `✏️ Transacción Actualizada: ${transaction.descripcion} - ${amount}`,
      {
        duration: 4000,
        id: `transaction-updated-${transaction.id}`
      }
    )
  }

  const showTransactionDeletedNotification = (transactionId: string) => {
    toast.success(
      '🗑️ Transacción eliminada exitosamente',
      {
        duration: 3000,
        id: `transaction-deleted-${transactionId}`
      }
    )
  }

  useEffect(() => {
    if (apiService.isAuthenticated()) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [])

  return {
    isConnected,
    connectionError,
    connect,
    disconnect
  }
}