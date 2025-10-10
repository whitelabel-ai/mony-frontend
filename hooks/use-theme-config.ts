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
    // Si el tema es 'light' o 'dark', usar los nuevos temas azules por defecto
    let themeName = activeTheme || 'blue-light'
    if (activeTheme === 'light') themeName = 'blue-light'
    if (activeTheme === 'dark') themeName = 'blue-dark'
    
    const themeConfig = getTheme(themeName)
    setCurrentTheme(themeConfig || null)
    
    // Aplicar el tema
    if (themeConfig) {
      applyTheme(themeName)
    }
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
    if (!mounted) return 'blue-light'
    const activeTheme = theme === 'system' ? systemTheme : theme
    // Si el tema es 'light' o 'dark', usar los nuevos temas azules por defecto
    let themeName = activeTheme || 'blue-light'
    if (activeTheme === 'light') themeName = 'blue-light'
    if (activeTheme === 'dark') themeName = 'blue-dark'
    return themeName
  }

  // Función para verificar si es tema oscuro
  const isDark = (): boolean => {
    if (!mounted) return false
    const currentThemeName = getCurrentThemeName()
    return currentThemeName.includes('dark')
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

  // Función para obtener la paleta actual (blue o green)
  const getCurrentPalette = (): 'blue' | 'green' => {
    const themeName = getCurrentThemeName()
    return themeName.includes('green') ? 'green' : 'blue'
  }

  // Función para cambiar entre paletas manteniendo el modo (light/dark)
  const changePalette = (palette: 'blue' | 'green') => {
    const currentThemeName = getCurrentThemeName()
    const isCurrentlyDark = currentThemeName.includes('dark')
    const newTheme = `${palette}-${isCurrentlyDark ? 'dark' : 'light'}`
    changeTheme(newTheme)
  }

  // Función para alternar entre light y dark manteniendo la paleta
  const toggleLightDark = () => {
    const currentPalette = getCurrentPalette()
    const currentThemeName = getCurrentThemeName()
    const isCurrentlyDark = currentThemeName.includes('dark')
    const newTheme = `${currentPalette}-${isCurrentlyDark ? 'light' : 'dark'}`
    changeTheme(newTheme)
  }

  // Función para obtener todos los temas agrupados por paleta
  const getThemesByPalette = () => {
    return {
      blue: themes.filter(t => t.name.includes('blue')),
      green: themes.filter(t => t.name.includes('green'))
    }
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
    changePalette,
    toggleLightDark,
    
    // Funciones de información
    getCurrentThemeName,
    getCurrentPalette,
    isDark,
    getThemeColors,
    getAvailableThemes,
    getThemesByPalette,
    isThemeLoaded,
    
    // Temas disponibles
    themes,
    
    // Utilidades
    systemTheme
  }
}

export default useThemeConfig