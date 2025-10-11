'use client'

import React from 'react'
import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TransactionForm } from './transaction-form'
import type { Transaction } from '@/types'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transaction?: Transaction | null
  mode?: 'create' | 'edit' | 'view'
  onSuccess?: () => void
}

export function TransactionModal({
  isOpen,
  onClose,
  transaction,
  mode = 'create',
  onSuccess
}: TransactionModalProps) {
  const handleSuccess = () => {
    onSuccess?.()
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  if (mode === 'view' && transaction) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose} modal={false}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Detalles de la Transacción
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                <p className="text-sm">
                  {transaction.tipo === 'Ingreso' ? 'Ingreso' : 'Gasto'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Monto</label>
                <p className="text-sm font-semibold">
                  ${transaction.monto.toLocaleString('es-CO', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} {transaction.moneda}
                </p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Descripción</label>
              <p className="text-sm">{transaction.descripcion}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Categoría</label>
                <div className="flex items-center gap-2">
                  {transaction.categoria?.icono && <span>{transaction.categoria.icono}</span>}
                  <p className="text-sm">{transaction.categoria?.nombre || 'Sin categoría'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fecha</label>
                <p className="text-sm">
                  {new Date(transaction.fechaTransaccion).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            {transaction.notas && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Notas</label>
                <p className="text-sm">{transaction.notas}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Creado</span>
                <p>{new Date(transaction.fechaCreacion).toLocaleString('es-CO')}</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={false}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {mode === 'edit' ? 'Editar Transacción' : 'Nueva Transacción'}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <TransactionForm
          transaction={transaction || undefined}
          mode={mode}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  )
}