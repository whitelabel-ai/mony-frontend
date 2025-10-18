'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CategoryForm } from './category-form'
import type { Categoria, CreateCategoryDto, UpdateCategoryDto } from '@/types'

// Diálogo para crear/editar categoría
interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Categoria
  onSubmit: (data: CreateCategoryDto | UpdateCategoryDto) => Promise<void>
  isLoading?: boolean
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSubmit,
  isLoading = false
}: CategoryFormDialogProps) {
  const handleSubmit = async (data: CreateCategoryDto | UpdateCategoryDto) => {
    await onSubmit(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Editar Categoría' : 'Nueva Categoría'}
          </DialogTitle>
          <DialogDescription>
            {category 
              ? 'Modifica los datos de la categoría existente.'
              : 'Crea una nueva categoría para organizar tus transacciones.'
            }
          </DialogDescription>
        </DialogHeader>
        <CategoryForm
          category={category}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}

// Diálogo para eliminar categoría
interface DeleteCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Categoria
  onConfirm: () => Promise<void>
  isLoading?: boolean
}

export function DeleteCategoryDialog({
  open,
  onOpenChange,
  category,
  onConfirm,
  isLoading = false
}: DeleteCategoryDialogProps) {
  const handleConfirm = async () => {
    await onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará permanentemente la categoría "{category?.nombre}".
            {category?.tipo === 'Gasto' && Number(category?.presupuestoMensual) > 0 && (
              <span className="block mt-2 text-amber-600">
                Esta categoría tiene un presupuesto mensual de {Number(category.presupuestoMensual).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}. 
                Al eliminarla, se perderá esta configuración.
              </span>
            )}
            <span className="block mt-2 font-medium">
              Esta acción no se puede deshacer.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Diálogo para duplicar categoría
interface DuplicateCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Categoria
  onConfirm: (newName: string) => Promise<void>
  isLoading?: boolean
}

export function DuplicateCategoryDialog({
  open,
  onOpenChange,
  category,
  onConfirm,
  isLoading = false
}: DuplicateCategoryDialogProps) {
  const [newName, setNewName] = useState('')

  const handleConfirm = async () => {
    if (newName.trim()) {
      await onConfirm(newName.trim())
      onOpenChange(false)
      setNewName('')
    }
  }

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open)
    if (!open) {
      setNewName('')
    } else if (category) {
      setNewName(`${category.nombre} (Copia)`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Duplicar Categoría</DialogTitle>
          <DialogDescription>
            Se creará una nueva categoría con la misma configuración que "{category?.nombre}".
            Puedes cambiar el nombre de la nueva categoría.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-name">Nombre de la nueva categoría</Label>
            <Input
              id="new-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nombre de la categoría duplicada"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newName.trim()) {
                  handleConfirm()
                }
              }}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !newName.trim()}
          >
            {isLoading ? 'Duplicando...' : 'Duplicar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}