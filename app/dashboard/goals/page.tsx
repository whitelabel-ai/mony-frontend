'use client'

import { Target } from 'lucide-react'
import { WIPPlaceholder } from '@/components/ui'

export default function GoalsPage() {
  return (
    <WIPPlaceholder
      title="Metas de Ahorro"
      description="Define y rastrea tus objetivos financieros. Crea metas personalizadas y monitorea tu progreso hacia la libertad financiera."
      icon={<Target className="h-16 w-16 text-primary" />}
    />
  )
}