import { apiService } from '../api'
import type {
  Categoria,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryStats,
  TopCategory,
  ApiResponse
} from '@/types'

/**
 * Servicio API para gestión de categorías
 */
class CategoriesApiService {
  private readonly baseUrl = '/categories'

  /**
   * Obtener todas las categorías del usuario
   */
  async getCategories(): Promise<Categoria[]> {
    const response = await apiService.get<Categoria[]>(this.baseUrl)
    return response
  }

  /**
   * Obtener una categoría específica por ID
   */
  async getCategory(id: number): Promise<Categoria> {
    const response = await apiService.get<Categoria>(`${this.baseUrl}/${id}`)
    return response
  }

  /**
   * Crear una nueva categoría
   */
  async createCategory(data: CreateCategoryDto): Promise<Categoria> {
    const response = await apiService.post<Categoria>(this.baseUrl, data)
    return response
  }

  /**
   * Actualizar una categoría existente
   */
  async updateCategory(id: number, data: UpdateCategoryDto): Promise<Categoria> {
    const response = await apiService.patch<Categoria>(`${this.baseUrl}/${id}`, data)
    return response
  }

  /**
   * Eliminar una categoría
   */
  async deleteCategory(id: number): Promise<{ message: string }> {
    const response = await apiService.delete<{ message: string }>(`${this.baseUrl}/${id}`)
    return response
  }

  /**
   * Obtener estadísticas de categorías
   */
  async getCategoryStats(): Promise<CategoryStats[]> {
    const response = await apiService.get<CategoryStats[]>(`${this.baseUrl}/stats`)
    return response
  }

  /**
   * Obtener las categorías con más gastos (top categorías)
   */
  async getTopCategories(limit: number = 5): Promise<TopCategory[]> {
    const response = await apiService.get<TopCategory[]>(`${this.baseUrl}/top?limit=${limit}`)
    return response
  }

  /**
   * Validar si una categoría puede ser eliminada
   */
  async canDeleteCategory(id: number): Promise<{ canDelete: boolean; transactionCount: number }> {
    try {
      const category = await this.getCategory(id)
      const canDelete = !category._count || category._count.transacciones === 0
      return {
        canDelete,
        transactionCount: category._count?.transacciones || 0
      }
    } catch (error) {
      return { canDelete: false, transactionCount: 0 }
    }
  }

  /**
   * Obtener categorías por tipo
   */
  async getCategoriesByType(tipo: 'Ingreso' | 'Gasto'): Promise<Categoria[]> {
    const categories = await this.getCategories()
    return categories.filter(category => category.tipo === tipo)
  }

  /**
   * Obtener categorías activas
   */
  async getActiveCategories(): Promise<Categoria[]> {
    const categories = await this.getCategories()
    return categories.filter(category => category.activa)
  }

  /**
   * Buscar categorías por nombre
   */
  async searchCategories(query: string): Promise<Categoria[]> {
    const categories = await this.getCategories()
    return categories.filter(category => 
      category.nombre.toLowerCase().includes(query.toLowerCase())
    )
  }

  /**
   * Activar/Desactivar una categoría
   */
  async toggleCategoryStatus(id: number): Promise<Categoria> {
    const category = await this.getCategory(id)
    return this.updateCategory(id, { activa: !category.activa })
  }

  /**
   * Duplicar una categoría
   */
  async duplicateCategory(id: number, newName?: string): Promise<Categoria> {
    const category = await this.getCategory(id)
    const duplicateData: CreateCategoryDto = {
      nombre: newName || `${category.nombre} (Copia)`,
      tipo: category.tipo,
      icono: category.icono,
      color: category.color,
      presupuestoMensual: category.presupuestoMensual || undefined,
      descripcion: category.descripcion || undefined,
      activa: true
    }
    return this.createCategory(duplicateData)
  }
}

export const categoriesApi = new CategoriesApiService()