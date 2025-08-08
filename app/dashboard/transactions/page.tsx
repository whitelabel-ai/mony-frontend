'use client'

import { CreditCard } from 'lucide-react'
import { WIPPlaceholder } from '@/components/ui'

export default function TransactionsPage() {
  return (
    <WIPPlaceholder
      title="Gestión de Transacciones"
      description="Aquí podrás registrar, editar y visualizar todas tus transacciones de ingresos y gastos de manera detallada."
      icon={<CreditCard className="h-16 w-16 text-primary" />}
    />
  )
}