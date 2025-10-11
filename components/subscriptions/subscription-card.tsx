'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Copy, 
  Play, 
  Pause, 
  CheckCircle,
  Calendar,
  DollarSign,
  Building
} from 'lucide-react'
import { UserSubscription } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface SubscriptionCardProps {
  subscription: UserSubscription
  onEdit?: (subscription: UserSubscription) => void
  onDelete?: (id: string) => void
  onToggle?: (id: string, activa: boolean) => void
  onDuplicate?: (id: string) => void
  onMarkAsPaid?: (id: string) => void
  showActions?: boolean
  compact?: boolean
}

const frequencyLabels = {
  DIARIA: 'Diario',
  SEMANAL: 'Semanal', 
  MENSUAL: 'Mensual',
  ANUAL: 'Anual'
}

const frequencyColors = {
  DIARIA: 'bg-red-100 text-red-800',
  SEMANAL: 'bg-orange-100 text-orange-800',
  MENSUAL: 'bg-blue-100 text-blue-800',
  ANUAL: 'bg-green-100 text-green-800'
}

export function SubscriptionCard({
  subscription,
  onEdit,
  onDelete,
  onToggle,
  onDuplicate,
  onMarkAsPaid,
  showActions = true,
  compact = false
}: SubscriptionCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async (action: () => Promise<void> | void) => {
    setIsLoading(true)
    try {
      await action()
    } finally {
      setIsLoading(false)
    }
  }

  const isUpcoming = () => {
    if (!subscription.fechaProximoPago) return false
    const today = new Date()
    const nextPayment = new Date(subscription.fechaProximoPago)
    const diffDays = Math.ceil((nextPayment.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays >= 0
  }

  const isOverdue = () => {
    if (!subscription.fechaProximoPago) return false
    const today = new Date()
    const nextPayment = new Date(subscription.fechaProximoPago)
    return nextPayment < today
  }

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      !subscription.activa ? 'opacity-60' : ''
    } ${isOverdue() ? 'border-red-200 bg-red-50/50' : ''} ${
      isUpcoming() ? 'border-yellow-200 bg-yellow-50/50' : ''
    }`}>
      <CardHeader className={`pb-3 ${compact ? 'p-4' : ''}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg truncate">
                {subscription.nombre}
              </h3>
              {!subscription.activa && (
                <Badge variant="secondary" className="text-xs">
                  Pausada
                </Badge>
              )}
              {isOverdue() && (
                <Badge variant="destructive" className="text-xs">
                  Vencida
                </Badge>
              )}
              {isUpcoming() && (
                <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700">
                  Próximo pago
                </Badge>
              )}
            </div>
            
            {subscription.descripcion && !compact && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {subscription.descripcion}
              </p>
            )}
          </div>

          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  disabled={isLoading}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(subscription)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                )}
                
                {onToggle && (
                  <DropdownMenuItem 
                    onClick={() => handleAction(() => onToggle(subscription.id, !subscription.activa))}
                  >
                    {subscription.activa ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Activar
                      </>
                    )}
                  </DropdownMenuItem>
                )}

                {onMarkAsPaid && subscription.activa && (
                  <DropdownMenuItem 
                    onClick={() => handleAction(() => onMarkAsPaid(subscription.id))}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Marcar como pagada
                  </DropdownMenuItem>
                )}

                {onDuplicate && (
                  <DropdownMenuItem 
                    onClick={() => handleAction(() => onDuplicate(subscription.id))}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicar
                  </DropdownMenuItem>
                )}

                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => handleAction(() => onDelete(subscription.id))}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className={`pt-0 ${compact ? 'p-4 pt-0' : ''}`}>
        <div className="space-y-3">
          {/* Información principal */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-lg">
                {formatCurrency(subscription.monto)}
              </span>
            </div>
            
            <Badge 
              variant="outline" 
              className={frequencyColors[subscription.frecuencia]}
            >
              {frequencyLabels[subscription.frecuencia]}
            </Badge>
          </div>

          {/* Información adicional */}
          <div className="grid grid-cols-1 gap-2 text-sm">
            {subscription.fechaProximoPago && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Próximo pago:</span>
                <span className={`font-medium ${
                  isOverdue() ? 'text-red-600' : isUpcoming() ? 'text-yellow-600' : ''
                }`}>
                  {format(new Date(subscription.fechaProximoPago), 'dd MMM yyyy', { locale: es })}
                </span>
              </div>
            )}

            {subscription.categoria && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Categoría:</span>
                <span className="font-medium">{subscription.categoria.nombre}</span>
              </div>
            )}

            {subscription.sitioWeb && !compact && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Sitio web:</span>
                <a 
                  href={subscription.sitioWeb} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate"
                >
                  {subscription.sitioWeb}
                </a>
              </div>
            )}
          </div>

          {/* Notas */}
          {subscription.notas && !compact && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Notas:</span> {subscription.notas}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}