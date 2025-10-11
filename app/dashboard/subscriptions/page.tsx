'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useUserSubscriptions } from '@/hooks/use-user-subscriptions'
import {
  SubscriptionCard,
  SubscriptionForm,
  SubscriptionsSummary,
  UpcomingPayments
} from '@/components/subscriptions'
import { UserSubscription, CreateUserSubscriptionDto, UpdateUserSubscriptionDto } from '@/types'

export default function SubscriptionsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<UserSubscription | null>(null)
  const [deletingSubscription, setDeletingSubscription] = useState<UserSubscription | null>(null)

  const {
    subscriptions,
    summary,
    upcomingPayments,
    loading,
    error,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    toggleSubscription,
    markAsPaid,
    duplicateSubscription
  } = useUserSubscriptions()

  const handleCreateSubscription = async (data: CreateUserSubscriptionDto) => {
    try {
      await createSubscription(data)
      setShowCreateDialog(false)
    } catch (error) {
      // Error ya manejado en el hook
    }
  }

  const handleUpdateSubscription = async (data: UpdateUserSubscriptionDto) => {
    if (!editingSubscription) return
    
    try {
      await updateSubscription(editingSubscription.id, data)
      setEditingSubscription(null)
    } catch (error) {
      // Error ya manejado en el hook
    }
  }

  const handleToggleSubscription = async (id: string, activa: boolean) => {
    try {
      await toggleSubscription(id, activa)
    } catch (error) {
      // Error ya manejado en el hook
    }
  }

  const handleMarkAsPaid = async (subscriptionId: string) => {
    try {
      await markAsPaid(subscriptionId, new Date())
    } catch (error) {
      // Error ya manejado en el hook
    }
  }

  const handleDuplicateSubscription = async (subscriptionId: string) => {
    try {
      const subscription = subscriptions.find(s => s.id === subscriptionId)
      if (subscription) {
        await duplicateSubscription(subscription)
      }
    } catch (error) {
      // Error ya manejado en el hook
    }
  }

  const handleDeleteSubscription = async () => {
    if (!deletingSubscription) return
    
    try {
      await deleteSubscription(deletingSubscription.id)
      setDeletingSubscription(null)
    } catch (error) {
      // Error ya manejado en el hook
    }
  }

  const handleDeleteClick = (subscriptionId: string) => {
    const subscription = subscriptions.find(s => s.id === subscriptionId)
    if (subscription) {
      setDeletingSubscription(subscription)
    }
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Error al cargar las suscripciones: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Intentar de nuevo
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suscripciones</h1>
          <p className="text-muted-foreground">
            Gestiona tus suscripciones y pagos recurrentes
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Suscripción
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nueva Suscripción</DialogTitle>
              </DialogHeader>
              <SubscriptionForm
                onSubmit={handleCreateSubscription as (data: CreateUserSubscriptionDto | UpdateUserSubscriptionDto) => Promise<void>}
                onCancel={() => setShowCreateDialog(false)}
                loading={loading}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Resumen */}
      <SubscriptionsSummary summary={summary} loading={loading} />

      {/* Próximos pagos */}
      {upcomingPayments.length > 0 && (
        <UpcomingPayments
          payments={upcomingPayments}
          onMarkAsPaid={handleMarkAsPaid}
          loading={loading}
        />
      )}

      {/* Lista de suscripciones */}
      <div className="space-y-4">
        {loading && subscriptions.length === 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No tienes suscripciones registradas</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crear tu primera suscripción
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onEdit={setEditingSubscription}
                onDelete={handleDeleteClick}
                onToggle={handleToggleSubscription}
                onDuplicate={handleDuplicateSubscription}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialog para editar */}
      <Dialog open={!!editingSubscription} onOpenChange={() => setEditingSubscription(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Suscripción</DialogTitle>
          </DialogHeader>
          {editingSubscription && (
            <SubscriptionForm
              subscription={editingSubscription}
              onSubmit={handleUpdateSubscription as (data: CreateUserSubscriptionDto | UpdateUserSubscriptionDto) => Promise<void>}
              onCancel={() => setEditingSubscription(null)}
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar eliminación */}
      <AlertDialog open={!!deletingSubscription} onOpenChange={() => setDeletingSubscription(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar suscripción?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la suscripción 
              "{deletingSubscription?.nombre}" y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubscription}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}