import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { themes, getTheme, applyTheme, type Theme } from '@/lib/themes'

/**
 * Hook personalizado para manejar la configuración de temas
 * Proporciona funcionalidades avanzadas para el manejo de temas
 */
export const useThemeConfig = () => {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null)

  // Asegurar que el componente esté montado para evitar hidration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Obtener el tema actual
  useEffect(() => {
    if (!mounted) return

    const activeTheme = theme === 'system' ? systemTheme : theme
    const themeConfig = getTheme(activeTheme || 'light')
    setCurrentTheme(themeConfig || null)
  }, [theme, systemTheme, mounted])

  // Función para cambiar tema con validación
  const changeTheme = (newTheme: string) => {
    const themeExists = themes.some(t => t.name === newTheme) || newTheme === 'system'
    if (themeExists) {
      setTheme(newTheme)
    } else {
      console.warn(`Tema "${newTheme}" no existe. Temas disponibles:`, themes.map(t => t.name))
    }
  }

  // Función para aplicar tema personalizado dinámicamente
  const applyCustomTheme = (themeName: string) => {
    if (mounted) {
      applyTheme(themeName)
    }
  }

  // Función para obtener el nombre del tema actual
  const getCurrentThemeName = (): string => {
    if (!mounted) return 'light'
    return theme === 'system' ? (systemTheme || 'light') : (theme || 'light')
  }

  // Función para verificar si es tema oscuro
  const isDark = (): boolean => {
    if (!mounted) return false
    const currentThemeName = getCurrentThemeName()
    return currentThemeName === 'dark'
  }

  // Función para alternar entre claro y oscuro
  const toggleTheme = () => {
    const currentThemeName = getCurrentThemeName()
    const newTheme = currentThemeName === 'dark' ? 'light' : 'dark'
    changeTheme(newTheme)
  }

  // Función para obtener colores del tema actual
  const getThemeColors = () => {
    return currentTheme?.colors || null
  }

  // Función para obtener todos los temas disponibles
  const getAvailableThemes = () => {
    return themes
  }

  // Función para verificar si el tema está cargado
  const isThemeLoaded = (): boolean => {
    return mounted && currentTheme !== null
  }

  return {
    // Estado
    theme,
    currentTheme,
    mounted,
    
    // Funciones de control
    changeTheme,
    setTheme,
    toggleTheme,
    applyCustomTheme,
    
    // Funciones de información
    getCurrentThemeName,
    isDark,
    getThemeColors,
    getAvailableThemes,
    isThemeLoaded,
    
    // Temas disponibles
    themes,
    
    // Utilidades
    systemTheme
  }
}

export default useThemeConfig