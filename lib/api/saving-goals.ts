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
  return apiService.post<ApiResponse<SavingGoal>>('/saving-goals', data);
}

// Actualizar una meta de ahorro
export async function updateSavingGoal(id: string, data: UpdateSavingGoalData): Promise<ApiResponse<SavingGoal>> {
  return apiService.put<ApiResponse<SavingGoal>>(`/saving-goals/${id}`, data);
}

// Actualizar el monto actual de una meta de ahorro
export async function updateSavingGoalAmount(id: string, amount: number): Promise<ApiResponse<SavingGoal>> {
  return apiService.patch<ApiResponse<SavingGoal>>(`/saving-goals/${id}/amount`, { montoActual: amount });
}

// Eliminar una meta de ahorro
export async function deleteSavingGoal(id: string): Promise<ApiResponse<void>> {
  return apiService.delete<ApiResponse<void>>(`/saving-goals/${id}`);
}