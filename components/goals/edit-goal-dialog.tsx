'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, ControllerRenderProps } from 'react-hook-form';
import * as z from 'zod';
import { Edit } from 'lucide-react';
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
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SavingGoal, UpdateSavingGoalData } from '@/types';
import { updateSavingGoal } from '@/lib/api/saving-goals';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo'),
  montoObjetivo: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  fechaObjetivo: z.date({
    required_error: 'La fecha objetivo es requerida',
  }),
  estado: z.enum(['activa', 'inactiva', 'completada', 'cancelada']),
});

type FormData = z.infer<typeof formSchema>;

interface EditGoalDialogProps {
  goal: SavingGoal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalUpdated: (goal: SavingGoal) => void;
}

export function EditGoalDialog({ goal, open, onOpenChange, onGoalUpdated }: EditGoalDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: goal.nombre,
      montoObjetivo: goal.montoObjetivo,
      fechaObjetivo: new Date(goal.fechaObjetivo),
      estado: goal.estado,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        nombre: goal.nombre,
        montoObjetivo: goal.montoObjetivo,
        fechaObjetivo: new Date(goal.fechaObjetivo),
        estado: goal.estado,
      });
    }
  }, [goal, open, form]);

  const formatCurrency = (value: string) => {
    const number = parseFloat(value.replace(/[^0-9]/g, ''));
    if (isNaN(number)) return '';
    return new Intl.NumberFormat('es-CO').format(number);
  };

  const parseCurrency = (value: string) => {
    return parseFloat(value.replace(/[^0-9]/g, '')) || 0;
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      
      const updateData: UpdateSavingGoalData = {
        nombre: data.nombre,
        montoObjetivo: data.montoObjetivo,
        fechaObjetivo: data.fechaObjetivo.toISOString().split('T')[0],
        estado: data.estado,
      };

      const response = await updateSavingGoal(goal.id, updateData);
      
      if (response.success && response.data) {
        onGoalUpdated(response.data);
        onOpenChange(false);
        toast({
          title: 'Meta actualizada',
          description: 'Los cambios han sido guardados exitosamente',
        });
      } else {
        throw new Error(response.error || 'Error al actualizar la meta');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al actualizar la meta de ahorro',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'activa':
        return 'Activa';
      case 'inactiva':
        return 'Inactiva';
      case 'completada':
        return 'Completada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return estado;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Meta de Ahorro
          </DialogTitle>
          <DialogDescription>
            Modifica los detalles de tu meta de ahorro.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nombre de la meta */}
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }: { field: ControllerRenderProps<FormData, 'nombre'> }) => (
                <FormItem>
                  <FormLabel>Nombre de la meta</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: Vacaciones en Europa, Auto nuevo..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Monto objetivo */}
            <FormField
              control={form.control}
              name="montoObjetivo"
              render={({ field }: { field: ControllerRenderProps<FormData, 'montoObjetivo'> }) => (
                <FormItem>
                  <FormLabel>Monto objetivo</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="text"
                        placeholder="0"
                        className="pl-8"
                        value={field.value ? formatCurrency(field.value.toString()) : ''}
                        onChange={(e) => {
                          const value = parseCurrency(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fecha objetivo */}
            <FormField
              control={form.control}
              name="fechaObjetivo"
              render={({ field }: { field: ControllerRenderProps<FormData, 'fechaObjetivo'> }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha objetivo</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value}
                      onDateChange={field.onChange}
                      placeholder="Selecciona una fecha"
                      variant="goal"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Estado */}
            <FormField
              control={form.control}
              name="estado"
              render={({ field }: { field: ControllerRenderProps<FormData, 'estado'> }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="activa">Activa</SelectItem>
                      <SelectItem value="inactiva">Inactiva</SelectItem>
                      <SelectItem value="completada">Completada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Cambia el estado de tu meta según tu situación actual
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}