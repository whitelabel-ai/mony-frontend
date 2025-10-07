'use client';

import { useState } from 'react';
import { Calendar, DollarSign, Edit, MoreHorizontal, Plus, Trash2, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SavingGoal } from '@/types';
import { EditGoalDialog } from './edit-goal-dialog';
import { AddAmountDialog } from './add-amount-dialog';
import { DeleteGoalDialog } from './delete-goal-dialog';

interface GoalCardProps {
  goal: SavingGoal;
  onUpdate: (goal: SavingGoal) => void;
  onDelete: (goalId: string) => void;
}

export function GoalCard({ goal, onUpdate, onDelete }: GoalCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addAmountDialogOpen, setAddAmountDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const progress = goal.montoObjetivo > 0 ? (goal.montoActual / goal.montoObjetivo) * 100 : 0;
  const isCompleted = progress >= 100;
  const daysLeft = Math.ceil((new Date(goal.fechaObjetivo).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const getStatusBadge = () => {
    switch (goal.estado) {
      case 'activa':
        return <Badge variant="default">Activa</Badge>;
      case 'completada':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completada</Badge>;
      case 'inactiva':
        return <Badge variant="outline">Inactiva</Badge>;
      case 'cancelada':
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{goal.estado}</Badge>;
    }
  };

  const getDaysLeftText = () => {
    if (isCompleted) return 'Meta alcanzada';
    if (daysLeft < 0) return `Venció hace ${Math.abs(daysLeft)} días`;
    if (daysLeft === 0) return 'Vence hoy';
    if (daysLeft === 1) return 'Vence mañana';
    return `${daysLeft} días restantes`;
  };

  const getDaysLeftColor = () => {
    if (isCompleted) return 'text-green-600';
    if (daysLeft < 0) return 'text-red-600';
    if (daysLeft <= 7) return 'text-orange-600';
    return 'text-muted-foreground';
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{goal.nombre}</CardTitle>
              <div className="flex items-center gap-2">
                {getStatusBadge()}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setAddAmountDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar dinero
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar meta
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progreso */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">{progress.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(progress, 100)} className="h-2" />
          </div>

          {/* Montos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Ahorrado</span>
              </div>
              <span className="font-semibold">{formatCurrency(goal.montoActual)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Objetivo</span>
              </div>
              <span className="font-semibold">{formatCurrency(goal.montoObjetivo)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Falta</span>
              <span className="font-semibold text-orange-600">
                {formatCurrency(Math.max(0, goal.montoObjetivo - goal.montoActual))}
              </span>
            </div>
          </div>

          {/* Fecha objetivo */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {formatDate(goal.fechaObjetivo)}
              </span>
            </div>
            <span className={`text-sm font-medium ${getDaysLeftColor()}`}>
              {getDaysLeftText()}
            </span>
          </div>

          {/* Botón de acción rápida */}
          {goal.estado === 'activa' && !isCompleted && (
            <Button 
              onClick={() => setAddAmountDialogOpen(true)}
              className="w-full"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar dinero
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <EditGoalDialog
        goal={goal}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onGoalUpdated={onUpdate}
      />

      <AddAmountDialog
        goal={goal}
        open={addAmountDialogOpen}
        onOpenChange={setAddAmountDialogOpen}
        onGoalUpdated={onUpdate}
      />

      <DeleteGoalDialog
        goal={goal}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onGoalDeleted={onDelete}
      />
    </>
  );
}