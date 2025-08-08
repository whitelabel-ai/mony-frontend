'use client'

import { Calendar } from 'lucide-react'
import { WIPPlaceholder } from '@/components/ui'

export default function SubscriptionsPage() {
  return (
    <WIPPlaceholder
      title="Gestión de Suscripciones"
      description="Controla todos tus servicios recurrentes. Nunca más olvides una suscripción y optimiza tus gastos mensuales."
      icon={<Calendar className="h-16 w-16 text-primary" />}
    />
  )
}