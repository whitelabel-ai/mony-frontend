'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, ControllerRenderProps } from 'react-hook-form';
import * as z from 'zod';
import { Plus, DollarSign, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { SavingGoal } from '@/types';
import { updateSavingGoalAmount } from '@/lib/api/saving-goals';
import toast from 'react-hot-toast';

const formSchema = z.object({
  monto: z.number().min(0.01, 'El monto debe ser mayor a 0'),
});

type FormData = z.infer<typeof formSchema>;

interface AddAmountDialogProps {
  goal: SavingGoal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalUpdated: (goal: SavingGoal) => void;
}

export function AddAmountDialog({ goal, open, onOpenChange, onGoalUpdated }: AddAmountDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monto: 0,
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyInput = (value: string) => {
    const number = parseFloat(value.replace(/[^0-9]/g, ''));
    if (isNaN(number)) return '';
    return new Intl.NumberFormat('es-CO').format(number);
  };

  const parseCurrency = (value: string) => {
    return parseFloat(value.replace(/[^0-9]/g, '')) || 0;
  };

  const currentProgress = goal.montoObjetivo > 0 ? (goal.montoActual) / (goal.montoObjetivo) * 100 : 0;
  const watchedAmount = form.watch('monto');
  const newTotal = (goal.montoActual) + (watchedAmount || 0);
  const newProgress = goal.montoObjetivo > 0 ? (newTotal / (goal.montoObjetivo)) * 100 : 0;

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      // Calcular el monto total (actual + nuevo monto a agregar)
      const montoTotal = goal.montoActual + data.monto;
      const response = await updateSavingGoalAmount(goal.id, montoTotal);
      
      if (response.success && response.data) {
        onGoalUpdated(response.data);
        form.reset();
        onOpenChange(false);
        
        const isCompleted = (response.data.montoActual) >= (response.data.montoObjetivo);
        
        if (isCompleted) {
          toast.success('¡Meta completada! ¡Felicitaciones! Has alcanzado tu meta de ahorro.');
        } else {
          toast.success(`Se agregaron ${formatCurrency(data.monto)} a tu meta`);
        }
      } else {
        throw new Error(response.error || 'Error al agregar el monto');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al agregar dinero a la meta');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  const remainingAmount = Math.max(0, goal.montoObjetivo - goal.montoActual);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Agregar Dinero
          </DialogTitle>
          <DialogDescription>
            Agrega dinero a tu meta "{goal.nombre}"
          </DialogDescription>
        </DialogHeader>

        {/* Estado actual de la meta */}
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progreso actual</span>
              <span className="font-medium">{currentProgress.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(currentProgress, 100)} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Ahorrado</p>
              <p className="font-semibold">{formatCurrency(goal.montoActual)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Objetivo</p>
              <p className="font-semibold">{formatCurrency(goal.montoObjetivo)}</p>
            </div>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Te faltan</p>
            <p className="text-lg font-bold text-orange-600">
              {formatCurrency(remainingAmount)}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Monto a agregar */}
            <FormField
              control={form.control}
              name="monto"
              render={({ field }: { field: ControllerRenderProps<FormData, 'monto'> }) => (
                <FormItem>
                  <FormLabel>Monto a agregar</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="text"
                        placeholder="0"
                        className="pl-8"
                        value={field.value ? formatCurrencyInput(field.value.toString()) : ''}
                        onChange={(e) => {
                          const value = parseCurrency(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    ¿Cuánto dinero quieres agregar a esta meta?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botones de monto rápido */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Montos rápidos</p>
              <div className="grid grid-cols-3 gap-2">
                {[10000, 50000, 100000].map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => form.setValue('monto', amount)}
                    className="text-xs"
                  >
                    {formatCurrency(amount)}
                  </Button>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => form.setValue('monto', remainingAmount)}
                className="w-full text-xs"
                disabled={remainingAmount <= 0}
              >
                Completar meta ({formatCurrency(remainingAmount)})
              </Button>
            </div>

            {/* Preview del nuevo progreso */}
            {watchedAmount > 0 && (
              <div className="space-y-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800">Nuevo progreso</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">Progreso</span>
                    <span className="font-medium text-green-800">{newProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(newProgress, 100)} className="h-2" />
                  <p className="text-sm text-green-700">
                    Total: {formatCurrency(newTotal)}
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || !watchedAmount}>
                {loading ? 'Agregando...' : 'Agregar Dinero'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}