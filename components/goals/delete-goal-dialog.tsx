'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SavingGoal } from '@/types';
import { deleteSavingGoal } from '@/lib/api/saving-goals';
import { useToast } from '@/hooks/use-toast';

interface DeleteGoalDialogProps {
  goal: SavingGoal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalDeleted: (goalId: string) => void;
}

export function DeleteGoalDialog({ goal, open, onOpenChange, onGoalDeleted }: DeleteGoalDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      
      const response = await deleteSavingGoal(goal.id);
      
      if (response.success) {
        onGoalDeleted(goal.id);
        onOpenChange(false);
        
        toast({
          title: 'Meta eliminada',
          description: `La meta "${goal.nombre}" ha sido eliminada exitosamente`,
        });
      } else {
        throw new Error(response.error || 'Error al eliminar la meta');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al eliminar la meta',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const hasProgress = goal.montoActual > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Eliminar Meta
          </DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. La meta será eliminada permanentemente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Información de la meta */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-semibold">{goal.nombre}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Ahorrado</p>
                <p className="font-medium">{formatCurrency(goal.montoActual)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Objetivo</p>
                <p className="font-medium">{formatCurrency(goal.montoObjetivo)}</p>
              </div>
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground">Estado</p>
              <p className="font-medium capitalize">{goal.estado}</p>
            </div>
          </div>

          {/* Advertencia si hay progreso */}
          {hasProgress && (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-800">
                  ¡Atención!
                </p>
                <p className="text-sm text-yellow-700">
                    Esta meta tiene {formatCurrency(goal.montoActual)} ahorrados. 
                    Al eliminarla, perderás el registro de este progreso.
                  </p>
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            ¿Estás seguro de que quieres eliminar la meta "{goal.nombre}"?
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Eliminar Meta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}