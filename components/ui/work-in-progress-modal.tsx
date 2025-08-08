'use client'

import { useState } from 'react'
import { X, Construction, ArrowLeft } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardHeader } from './card'

interface WorkInProgressModalProps {
  isOpen: boolean
  onClose: () => void
  planName: string
  onSelectFree: () => void
}

/**
 * Modal que se muestra cuando el usuario selecciona un plan de pago
 * Informa que está en construcción y sugiere usar el plan gratuito
 */
export function WorkInProgressModal({ isOpen, onClose, planName, onSelectFree }: WorkInProgressModalProps) {
  if (!isOpen) return null

  const handleSelectFree = () => {
    onSelectFree()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-md mx-auto bg-background border shadow-xl">
        {/* Header */}
        <CardHeader className="text-center pb-4">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
              <Construction className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-foreground">
            ¡Próximamente!
          </h2>
          <p className="text-muted-foreground text-sm mt-2">
            El <span className="font-semibold text-foreground">{planName}</span> estará disponible muy pronto
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Mensaje principal */}
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Estamos trabajando arduamente para traerte todas las funcionalidades premium. 
              Mientras tanto, puedes disfrutar de nuestro plan gratuito.
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>¡Buenas noticias!</strong> El Plan Free incluye todas las funcionalidades 
                esenciales para gestionar tus finanzas personales.
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="space-y-3">
            <Button 
              onClick={handleSelectFree}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continuar con Plan Free
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Volver a seleccionar
            </Button>
          </div>

          {/* Nota adicional */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Te notificaremos por email cuando los planes premium estén disponibles
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default WorkInProgressModal