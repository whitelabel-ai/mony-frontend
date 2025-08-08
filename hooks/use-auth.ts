import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { apiService } from '@/lib/api'
import type { User, LoginData, RegisterData, UserProfile } from '@/types'

/**
 * Hook personalizado para manejar la autenticación
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  /**
   * Verificar si el usuario está autenticado al cargar la página
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (apiService.isAuthenticated()) {
          const profile = await apiService.getUserProfile()
          // Convertir UserProfile a User para el estado
          const user: User = {
            id: profile.id,
            nombreCompleto: profile.nombreCompleto,
            email: profile.email,
            numeroWhatsapp: profile.numeroWhatsapp,
            moneda: profile.moneda,
            fechaRegistro: profile.fechaRegistro,
            activo: true
          }
          setUser(user)
          setIsAuthenticated(true)
        }
      } catch (error) {
        // Si hay error, limpiar el estado
        setUser(null)
        setIsAuthenticated(false)
        apiService.logout()
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  /**
   * Función para iniciar sesión
   */
  const login = useCallback(async (data: LoginData) => {
    try {
      setLoading(true)
      const response = await apiService.login(data)
      setUser(response.user)
      setIsAuthenticated(true)
      toast.success('¡Inicio de sesión exitoso!')
      router.push('/dashboard')
      return response
    } catch (error: any) {
      toast.error(error.message || 'Error al iniciar sesión')
      throw error
    } finally {
      setLoading(false)
    }
  }, [router])

  /**
   * Función para registrarse
   */
  const register = useCallback(async (data: RegisterData) => {
    try {
      setLoading(true)
      const response = await apiService.register(data)
      setUser(response.user)
      setIsAuthenticated(true)
      toast.success('¡Registro exitoso! Bienvenido a Mony')
      router.push('/dashboard')
      return response
    } catch (error: any) {
      toast.error(error.message || 'Error al registrarse')
      throw error
    } finally {
      setLoading(false)
    }
  }, [router])

  /**
   * Función para cerrar sesión
   */
  const logout = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
    apiService.logout()
    router.push('/auth/login')
  }, [router])

  /**
   * Función para actualizar el perfil del usuario
   */
  const refreshUser = useCallback(async () => {
    try {
      if (isAuthenticated) {
        const profile = await apiService.getUserProfile()
        // Convertir UserProfile a User para el estado
        const user: User = {
          id: profile.id,
          nombreCompleto: profile.nombreCompleto,
          email: profile.email,
          numeroWhatsapp: profile.numeroWhatsapp,
          moneda: profile.moneda,
          fechaRegistro: profile.fechaRegistro,
          activo: true
        }
        setUser(user)
      }
    } catch (error: any) {
      toast.error('Error al actualizar el perfil')
    }
  }, [isAuthenticated])

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  }
}

/**
 * Hook para obtener el perfil completo del usuario
 */
export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const userProfile = await apiService.getUserProfile()
      setProfile(userProfile)
    } catch (err: any) {
      setError(err.message || 'Error al cargar el perfil')
      toast.error('Error al cargar el perfil')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (apiService.isAuthenticated()) {
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [])

  const refreshProfile = useCallback(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    profile,
    loading,
    error,
    refreshProfile,
  }
}

/**
 * Hook para proteger rutas que requieren autenticación
 */
export function useAuthGuard() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, loading, router])

  return { isAuthenticated, loading }
}

/**
 * Hook para redirigir usuarios autenticados
 */
export function useGuestGuard() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, loading, router])

  return { isAuthenticated, loading }
}