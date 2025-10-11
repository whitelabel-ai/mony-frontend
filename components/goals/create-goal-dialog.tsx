'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, ControllerRenderProps } from 'react-hook-form';
import * as z from 'zod';
import { Target } from 'lucide-react';
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
import { SavingGoal, CreateSavingGoalData } from '@/types';
import { createSavingGoal } from '@/lib/api/saving-goals';
import { toast } from 'react-hot-toast';

const formSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo'),
  montoObjetivo: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  fechaObjetivo: z.date({
    required_error: 'La fecha objetivo es requerida',
  }).refine((date) => date > new Date(), {
    message: 'La fecha objetivo debe ser futura',
  }),
});

type FormData = z.infer<typeof formSchema>;

interface CreateGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalCreated: (goal: SavingGoal) => void;
}

export function CreateGoalDialog({ open, onOpenChange, onGoalCreated }: CreateGoalDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: '',
      montoObjetivo: 0,
    },
  });

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
      
      const createData: CreateSavingGoalData = {
        nombre: data.nombre,
        montoObjetivo: data.montoObjetivo,
        fechaObjetivo: data.fechaObjetivo.toISOString().split('T')[0],
      };

      const response = await createSavingGoal(createData);
      
      if (response.success && response.data) {
        toast.success(response.message || 'Meta de ahorro creada exitosamente');
        onGoalCreated(response.data);
        form.reset();
        onOpenChange(false);
      } else {
        throw new Error(response.error || 'Error al crear la meta');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear la meta de ahorro');
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Nueva Meta de Ahorro
          </DialogTitle>
          <DialogDescription>
            Define tu objetivo financiero y comienza a ahorrar para alcanzarlo.
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
                  <FormDescription>
                    Dale un nombre descriptivo a tu meta de ahorro
                  </FormDescription>
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
                  <FormDescription>
                    ¿Cuánto dinero necesitas ahorrar?
                  </FormDescription>
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
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Selecciona una fecha"
                      disabled={false} // Simplificado por ahora
                    />
                  </FormControl>
                  <FormDescription>
                    ¿Cuándo quieres alcanzar esta meta?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creando...' : 'Crear Meta'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}