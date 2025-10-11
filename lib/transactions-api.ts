import { apiService } from './api'
import type {
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
  FilterTransactionsDto,
  PaginatedTransactionsResponse,
  TransactionAnalytics,
  Categoria
} from '@/types'

/**
 * Servicio de API para transacciones
 */
export class TransactionsApiService {
  private readonly baseUrl = '/transactions'

  /**
   * Obtener todas las transacciones con filtros y paginación
   */
  async getTransactions(filters?: FilterTransactionsDto): Promise<PaginatedTransactionsResponse> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })
    }
    
    const queryString = params.toString()
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl
    
    return apiService.get<PaginatedTransactionsResponse>(url)
  }

  /**
   * Obtener una transacción por ID
   */
  async getTransactionById(id: string): Promise<Transaction> {
    return apiService.get<Transaction>(`${this.baseUrl}/${id}`)
  }

  /**
   * Crear una nueva transacción
   */
  async createTransaction(data: CreateTransactionDto): Promise<Transaction> {
    return apiService.post<Transaction>(this.baseUrl, data)
  }

  /**
   * Actualizar una transacción existente
   */
  async updateTransaction(id: string, data: UpdateTransactionDto): Promise<Transaction> {
    return apiService.patch<Transaction>(`${this.baseUrl}/${id}`, data)
  }

  /**
   * Eliminar una transacción
   */
  async deleteTransaction(id: string): Promise<void> {
    return apiService.delete<void>(`${this.baseUrl}/${id}`)
  }

  /**
   * Eliminar múltiples transacciones
   */
  async deleteMultipleTransactions(ids: string[]): Promise<void> {
    return apiService.post<void>(`${this.baseUrl}/bulk-delete`, { ids })
  }

  /**
   * Obtener análisis de transacciones
   */
  async getAnalytics(filters?: {
    fechaInicio?: string
    fechaFin?: string
    agrupacion?: 'dia' | 'semana' | 'mes' | 'año'
  }): Promise<TransactionAnalytics> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })
    }
    
    const queryString = params.toString()
    const url = queryString ? `${this.baseUrl}/analytics?${queryString}` : `${this.baseUrl}/analytics`
    
    return apiService.get<TransactionAnalytics>(url)
  }

  /**
   * Obtener estadísticas por categorías
   */
  async getCategoryStats(filters?: {
    fechaInicio?: string
    fechaFin?: string
    tipo?: 'Ingreso' | 'Gasto'
  }): Promise<{
    categoria: string
    totalMonto: number
    cantidadTransacciones: number
    porcentajeDelTotal: number
    tipo: 'Ingreso' | 'Gasto'
  }[]> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })
    }
    
    const queryString = params.toString()
    const url = queryString ? `${this.baseUrl}/stats/categories?${queryString}` : `${this.baseUrl}/stats/categories`
    
    return apiService.get(url)
  }

  /**
   * Obtener tendencias mensuales
   */
  async getMonthlyTrends(year?: number): Promise<{
    mes: string
    ingresos: number
    gastos: number
    balance: number
  }[]> {
    const params = new URLSearchParams()
    
    if (year) {
      params.append('año', year.toString())
    }
    
    const queryString = params.toString()
    const url = queryString ? `${this.baseUrl}/stats/monthly-trends?${queryString}` : `${this.baseUrl}/stats/monthly-trends`
    
    return apiService.get(url)
  }

  /**
   * Genera un reporte PDF de las transacciones
   */
  async generatePdfReport(filters?: {
    fechaInicio?: string
    fechaFin?: string
    tipo?: 'Ingreso' | 'Gasto'
    idCategoria?: string
    incluirGraficos?: boolean
    incluirDetalles?: boolean
    agrupacion?: 'dia' | 'semana' | 'mes'
    titulo?: string
  }): Promise<Blob> {
    const params = new URLSearchParams()
    
    // Siempre establecer formato como PDF
    params.append('formato', 'pdf')
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })
    }
    
    const queryString = params.toString()
    const url = queryString ? `/pdf-reports/generate-pdf?${queryString}` : '/pdf-reports/generate-pdf'
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}${url}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Error al generar el reporte PDF')
    }
    
    return response.blob()
  }

  /**
   * Obtener categorías disponibles
   */
  async getCategories(): Promise<Categoria[]> {
    return apiService.get<Categoria[]>('/categories')
  }
}

// Instancia única del servicio
export const transactionsApi = new TransactionsApiService()

// Exportar métodos específicos para facilitar el uso
export const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  deleteMultipleTransactions,
  getAnalytics,
  getCategoryStats,
  getMonthlyTrends,
  generatePdfReport,
  getCategories,
} = transactionsApi