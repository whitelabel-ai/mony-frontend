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
import { Plus, RefreshCw } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useUserSubscriptions } from '@/hooks/use-user-subscriptions'
import {
  SubscriptionCard,
  SubscriptionForm,
  SubscriptionsSummary,
  SubscriptionsFilters,
  UpcomingPayments
} from '@/components/subscriptions'
import { UserSubscription, CreateUserSubscriptionDto, UpdateUserSubscriptionDto } from '@/types'
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from '@/components/ui/pagination'

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
    pagination,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    toggleSubscription,
    markAsPaid,
    duplicateSubscription,
    updateFilters,
    changePage,
    search,
    refresh
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

  const handleDeleteSubscription = async () => {
    if (!deletingSubscription) return
    
    try {
      await deleteSubscription(deletingSubscription.id)
      setDeletingSubscription(null)
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

  const handleMarkAsPaid = async (id: string) => {
    try {
      await markAsPaid(id)
    } catch (error) {
      // Error ya manejado en el hook
    }
  }

  const handleDuplicateSubscription = async (id: string) => {
    try {
      await duplicateSubscription(id)
    } catch (error) {
      // Error ya manejado en el hook
    }
  }

  // Funciones wrapper para el SubscriptionCard
  const handleEditClick = (subscription: UserSubscription) => {
    setEditingSubscription(subscription)
  }

  const handleDeleteClick = (id: string) => {
    const subscription = subscriptions.find(s => s.id === id)
    if (subscription) {
      setDeletingSubscription(subscription)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Suscripciones</h1>
          <p className="text-muted-foreground">
            Controla todos tus servicios recurrentes. Nunca más olvides una suscripción y optimiza tus gastos mensuales.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          
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

      {/* Filtros */}
      <SubscriptionsFilters
        onSearch={search}
        onFilterChange={updateFilters}
        onClearFilters={() => updateFilters({})}
        loading={loading}
      />

      {/* Lista de suscripciones */}
      <div className="space-y-4">
        {loading && subscriptions.length === 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No hay suscripciones</h3>
            <p className="text-muted-foreground mb-4">
              Comienza agregando tu primera suscripción para llevar control de tus gastos recurrentes.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Primera Suscripción
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subscriptions.map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onToggle={handleToggleSubscription}
                  onDuplicate={handleDuplicateSubscription}
                  onMarkAsPaid={handleMarkAsPaid}
                />
              ))}
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (pagination.page > 1) changePage(pagination.page - 1)
                        }}
                        className={pagination.page <= 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            changePage(page)
                          }}
                          isActive={page === pagination.page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (pagination.page < pagination.totalPages) changePage(pagination.page + 1)
                        }}
                        className={pagination.page >= pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
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