import { 
  SavingGoal, 
  CreateSavingGoalData, 
  UpdateSavingGoalData, 
  SavingGoalStats,
  SavingGoalsResponse,
  ApiResponse 
} from '@/types';
import { apiService } from '@/lib/api';

// Obtener todas las metas de ahorro del usuario
export async function getSavingGoals(
  page: number = 1,
  limit: number = 10,
  estado?: string
): Promise<SavingGoalsResponse> {
  const params = new URLSearchParams({
    pagina: page.toString(),
    limite: limit.toString(),
  });
  
  if (estado) {
    params.append('estado', estado);
  }

  return apiService.get<SavingGoalsResponse>(`/saving-goals?${params}`);
}

// Obtener estadísticas de metas de ahorro
export async function getSavingGoalStats(): Promise<ApiResponse<SavingGoalStats>> {
  return apiService.get<ApiResponse<SavingGoalStats>>('/saving-goals/statistics');
}

// Obtener una meta de ahorro específica
export async function getSavingGoal(id: string): Promise<ApiResponse<SavingGoal>> {
  return apiService.get<ApiResponse<SavingGoal>>(`/saving-goals/${id}`);
}

// Crear una nueva meta de ahorro
export async function createSavingGoal(data: CreateSavingGoalData): Promise<ApiResponse<SavingGoal>> {
  try {
    const response = await apiService.post<SavingGoal>('/saving-goals', data);
    return {
      success: true,
      data: response,
      message: 'Meta de ahorro creada exitosamente'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear la meta de ahorro'
    };
  }
}

// Actualizar una meta de ahorro
export async function updateSavingGoal(id: string, data: UpdateSavingGoalData): Promise<ApiResponse<SavingGoal>> {
  try {
    const response = await apiService.patch<SavingGoal>(`/saving-goals/${id}`, data);
    return {
      success: true,
      data: response,
      message: 'Meta de ahorro actualizada exitosamente'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar la meta de ahorro'
    };
  }
}

// Actualizar el monto actual de una meta de ahorro
export async function updateSavingGoalAmount(id: string, amount: number): Promise<ApiResponse<SavingGoal>> {
  try {
    const response = await apiService.patch<SavingGoal>(`/saving-goals/${id}/amount`, { monto: amount });
    return {
      success: true,
      data: response,
      message: 'Monto de la meta actualizado exitosamente'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar el monto de la meta'
    };
  }
}

// Eliminar una meta de ahorro
export async function deleteSavingGoal(id: string): Promise<ApiResponse<void>> {
  try {
    await apiService.delete<void>(`/saving-goals/${id}`);
    return {
      success: true,
      message: 'Meta de ahorro eliminada exitosamente'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar la meta de ahorro'
    };
  }
}