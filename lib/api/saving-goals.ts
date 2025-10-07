import { 
  SavingGoal, 
  CreateSavingGoalData, 
  UpdateSavingGoalData, 
  UpdateSavingGoalAmountData,
  SavingGoalStats,
  ApiResponse 
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Obtener todas las metas de ahorro del usuario
export async function getSavingGoals(
  page: number = 1,
  limit: number = 10,
  estado?: string
): Promise<ApiResponse<{ goals: SavingGoal[]; total: number; totalPages: number }>> {
  const token = localStorage.getItem('token');
  
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (estado) {
    params.append('estado', estado);
  }

  const response = await fetch(`${API_BASE_URL}/saving-goals?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener las metas de ahorro');
  }

  return response.json();
}

// Obtener estadísticas de metas de ahorro
export async function getSavingGoalStats(): Promise<ApiResponse<SavingGoalStats>> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/saving-goals/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener las estadísticas');
  }

  return response.json();
}

// Obtener una meta de ahorro específica
export async function getSavingGoal(id: string): Promise<ApiResponse<SavingGoal>> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/saving-goals/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener la meta de ahorro');
  }

  return response.json();
}

// Crear una nueva meta de ahorro
export async function createSavingGoal(data: CreateSavingGoalData): Promise<ApiResponse<SavingGoal>> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/saving-goals`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Error al crear la meta de ahorro');
  }

  return response.json();
}

// Actualizar una meta de ahorro
export async function updateSavingGoal(
  id: string, 
  data: UpdateSavingGoalData
): Promise<ApiResponse<SavingGoal>> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/saving-goals/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Error al actualizar la meta de ahorro');
  }

  return response.json();
}

// Actualizar el monto actual de una meta de ahorro
export async function updateSavingGoalAmount(
  id: string, 
  data: UpdateSavingGoalAmountData
): Promise<ApiResponse<SavingGoal>> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/saving-goals/${id}/amount`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Error al actualizar el monto de la meta');
  }

  return response.json();
}

// Eliminar una meta de ahorro
export async function deleteSavingGoal(id: string): Promise<ApiResponse<void>> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/saving-goals/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al eliminar la meta de ahorro');
  }

  return response.json();
}