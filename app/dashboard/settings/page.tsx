'use client'

import { Settings } from 'lucide-react'
import { WIPPlaceholder } from '@/components/ui'

export default function SettingsPage() {
  return (
    <WIPPlaceholder
      title="Configuración"
      description="Personaliza tu experiencia en Mony. Ajusta preferencias, gestiona tu perfil y configura notificaciones."
      icon={<Settings className="h-16 w-16 text-primary" />}
    />
  )
}