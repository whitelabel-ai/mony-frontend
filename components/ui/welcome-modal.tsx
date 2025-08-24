'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Clock, Sparkles, ArrowRight } from 'lucide-react'
import { apiService } from '@/lib/api'
import { UsersCountResponse } from '@/types'

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
  userName: string
}

export function WelcomeModal({ isOpen, onClose, userName }: WelcomeModalProps) {
  const [usersCount, setUsersCount] = useState<number>(0)
  const [timeLeft, setTimeLeft] = useState(10)
  const [isLoading, setIsLoading] = useState(true)

  // Obtener contador de usuarios
  useEffect(() => {
    const fetchUsersCount = async () => {
      try {
        const response = await apiService.getUsersCount()
        setUsersCount(response.totalUsers)
      } catch (error) {
        console.error('Error fetching users count:', error)
        setUsersCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      fetchUsersCount()
    }
  }, [isOpen])

  // Temporizador de 10 segundos
  useEffect(() => {
    if (!isOpen) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onClose()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, onClose])

  // Reiniciar temporizador cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(5)
    }
  }, [isOpen])

  const handleContinue = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            ¡Bienvenido a Mony!
            <Sparkles className="h-5 w-5 text-yellow-500" />
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Saludo personalizado */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-primary mb-2">
              ¡Hola, {userName}!
            </h3>
            <p className="text-sm text-muted-foreground">
              Tu cuenta ha sido creada exitosamente. Estás listo para comenzar a gestionar tus finanzas de manera inteligente.
            </p>
          </div>

          {/* Contador de usuarios */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-4">
            <div className="flex items-center justify-center gap-3">
              <Users className="h-6 w-6 text-blue-600" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  🎉 ¡Eres el usuario número:
                </p>
                <div className="flex items-center gap-2 justify-center">
                  {isLoading ? (
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  ) : (
                    <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                       {(usersCount).toLocaleString()}
                    </Badge>
                  )}
                  <span className="text-sm font-medium"> de 300 usuarios!</span>
                </div>
              </div>
            </div>
          </div>

          {/* Temporizador */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Redirigiendo automáticamente en {timeLeft} segundos</span>
          </div>

          {/* Botón de continuar */}
          <Button 
            onClick={handleContinue} 
            className="w-full"
            size="lg"
          >
            Continuar
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}