import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { toast } from 'react-hot-toast'
import type {
  ApiResponse,
  AuthResponse,
  LoginData,
  RegisterData,
  UserProfile,
  UsersCountResponse,
} from '@/types'

/**
 * Configuración base de la API
 */
class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Interceptor para agregar el token de autorización
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Interceptor para manejar respuestas y errores
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error) => {
        // Manejar errores de autenticación
        if (error.response?.status === 401) {
          this.removeToken()
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login'
          }
        }

        // No mostrar toast automáticamente - dejar que cada componente maneje sus errores
        // const message = error.response?.data?.message || 'Error en la petición'
        // toast.error(message)

        return Promise.reject(error)
      }
    )
  }

  /**
   * Obtener token del localStorage
   */
  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }

  /**
   * Guardar token en localStorage
   */
  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
  }

  /**
   * Remover token del localStorage
   */
  private removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  public isAuthenticated(): boolean {
    return !!this.getToken()
  }

  /**
   * Registrar nuevo usuario
   */
  public async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/auth/register', data)
      const { token } = response.data
      this.setToken(token)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error en el registro')
    }
  }

  /**
   * Iniciar sesión
   */
  public async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/auth/login', data)
      const { token } = response.data
      this.setToken(token)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error en el inicio de sesión')
    }
  }

  /**
   * Cerrar sesión
   */
  public logout(): void {
    this.removeToken()
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login'
    }
    toast.success('Sesión cerrada correctamente')
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  public async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await this.api.get<UserProfile>('/users/profile')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener el perfil')
    }
  }

  /**
   * Obtener contador total de usuarios registrados
   */
  public async getUsersCount(): Promise<UsersCountResponse> {
    try {
      const response = await this.api.get<UsersCountResponse>('/auth/users-count')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener el contador de usuarios')
    }
  }

  /**
   * Actualizar perfil del usuario autenticado
   */
  public async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await this.api.patch<UserProfile>(`/users/${userId}`, data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar el perfil')
    }
  }

  /**
   * Cambiar contraseña del usuario
   */
  public async changePassword(userId: string, data: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }): Promise<{ message: string }> {
    try {
      const response = await this.api.post<{ message: string }>(`/users/${userId}/change-password`, data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al cambiar la contraseña')
    }
  }

  /**
   * Método genérico para peticiones GET
   */
  public async get<T>(url: string): Promise<T> {
    try {
      const response = await this.api.get<T>(url)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error en la petición')
    }
  }

  /**
   * Método genérico para peticiones POST
   */
  public async post<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.api.post<T>(url, data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error en la petición')
    }
  }

  /**
   * Método genérico para peticiones PUT
   */
  public async put<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.api.put<T>(url, data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error en la petición')
    }
  }

  /**
   * Método genérico para peticiones PATCH
   */
  public async patch<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.api.patch<T>(url, data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error en la petición')
    }
  }

  /**
   * Método genérico para peticiones DELETE
   */
  public async delete<T>(url: string): Promise<T> {
    try {
      const response = await this.api.delete<T>(url)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error en la petición')
    }
  }
}

// Instancia única del servicio de API
export const apiService = new ApiService()

// Exportar métodos específicos para facilitar el uso
export const {
  register,
  login,
  logout,
  getUserProfile,
  getUsersCount,
  updateUserProfile,
  changePassword,
  isAuthenticated,
  get,
  post,
  put,
  patch,
  delete: deleteRequest,
} = apiService