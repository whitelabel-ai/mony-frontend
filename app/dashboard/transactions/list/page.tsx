'use client'

import React, { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TransactionsTable } from '@/components/transactions/transactions-table'
import type { Transaction } from '@/types'
import Link from 'next/link'

export default function TransactionsListPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    // TODO: Abrir modal de edición o navegar a página de edición
    console.log('Editar transacción:', transaction)
  }

  const handleView = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    // TODO: Abrir modal de vista detallada
    console.log('Ver transacción:', transaction)
  }

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/transactions">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lista de Transacciones</h1>
          <p className="text-muted-foreground">
            Gestiona todas tus transacciones de ingresos y gastos
          </p>
        </div>
      </div>

      {/* Tabla de transacciones */}
      <TransactionsTable
        onEdit={handleEdit}
        onView={handleView}
        refreshTrigger={refreshTrigger}
      />
    </div>
  )
}