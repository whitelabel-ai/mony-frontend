'use client'

import { useState, useEffect } from 'react'
import { transactionsApi } from '@/lib/transactions-api'
import type { Transaction, FilterTransactionsDto } from '@/types'

interface UseRecentTransactionsReturn {
  transactions: Transaction[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useRecentTransactions(limit: number = 6): UseRecentTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const filters: FilterTransactionsDto = {
        limite: limit,
        pagina: 1,
        ordenarPor: 'fechaTransaccion',
        direccion: 'desc'
      }
      
      const response = await transactionsApi.getTransactions(filters)
      setTransactions(response.transacciones || [])
    } catch (err) {
      console.error('Error al cargar transacciones recientes:', err)
      setError('Error al cargar las transacciones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [limit])

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions
  }
}