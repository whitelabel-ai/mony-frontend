/**
 * Configuración de temas para Mony
 * Este archivo permite editar fácilmente los colores y estilos de los temas
 */

export interface ThemeColors {
  background: string
  foreground: string
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  destructive: string
  destructiveForeground: string
  border: string
  input: string
  ring: string
}

export interface Theme {
  name: string
  displayName: string
  colors: ThemeColors
}

// Tema claro
export const lightTheme: Theme = {
  name: 'light',
  displayName: 'Claro',
  colors: {
    background: '0 0% 100%',
    foreground: '222.2 84% 4.9%',
    card: '0 0% 98%',
    cardForeground: '222.2 84% 4.9%',
    popover: '0 0% 99%',
    popoverForeground: '222.2 84% 4.9%',
    primary: '221.2 83.2% 53.3%',
    primaryForeground: '210 40% 98%',
    secondary: '210 40% 96%',
    secondaryForeground: '222.2 84% 4.9%',
    muted: '210 40% 94%',
    mutedForeground: '215.4 16.3% 46.9%',
    accent: '210 40% 96%',
    accentForeground: '222.2 84% 4.9%',
    destructive: '0 84.2% 60.2%',
    destructiveForeground: '210 40% 98%',
    border: '214.3 31.8% 91.4%',
    input: '214.3 31.8% 91.4%',
    ring: '221.2 83.2% 53.3%'
  }
}

// Tema oscuro
export const darkTheme: Theme = {
  name: 'dark',
  displayName: 'Oscuro',
  colors: {
    background: '222.2 84% 4.9%',
    foreground: '210 40% 98%',
    card: '222.2 84% 6.5%',
    cardForeground: '210 40% 98%',
    popover: '222.2 84% 7%',
    popoverForeground: '210 40% 98%',
    primary: '217.2 91.2% 59.8%',
    primaryForeground: '222.2 84% 4.9%',
    secondary: '217.2 32.6% 19%',
    secondaryForeground: '210 40% 98%',
    muted: '217.2 32.6% 19%',
    mutedForeground: '215 20.2% 65.1%',
    accent: '217.2 32.6% 19%',
    accentForeground: '210 40% 98%',
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '210 40% 98%',
    border: '217.2 32.6% 19%',
    input: '217.2 32.6% 19%',
    ring: '224.3 76.3% 94.1%'
  }
}

// Lista de todos los temas disponibles
export const themes: Theme[] = [lightTheme, darkTheme]

// Función para obtener un tema por nombre
export const getTheme = (themeName: string): Theme | undefined => {
  return themes.find(theme => theme.name === themeName)
}

// Función para generar CSS variables desde un tema
export const generateCSSVariables = (theme: Theme): string => {
  const { colors } = theme
  return `
    --background: ${colors.background};
    --foreground: ${colors.foreground};
    --card: ${colors.card};
    --card-foreground: ${colors.cardForeground};
    --popover: ${colors.popover};
    --popover-foreground: ${colors.popoverForeground};
    --primary: ${colors.primary};
    --primary-foreground: ${colors.primaryForeground};
    --secondary: ${colors.secondary};
    --secondary-foreground: ${colors.secondaryForeground};
    --muted: ${colors.muted};
    --muted-foreground: ${colors.mutedForeground};
    --accent: ${colors.accent};
    --accent-foreground: ${colors.accentForeground};
    --destructive: ${colors.destructive};
    --destructive-foreground: ${colors.destructiveForeground};
    --border: ${colors.border};
    --input: ${colors.input};
    --ring: ${colors.ring};
  `.trim()
}

// Función para aplicar un tema dinámicamente
export const applyTheme = (themeName: string): void => {
  const theme = getTheme(themeName)
  if (!theme) return

  const root = document.documentElement
  const cssVariables = generateCSSVariables(theme)
  
  // Aplicar las variables CSS al root
  cssVariables.split('\n').forEach(line => {
    const [property, value] = line.split(':').map(s => s.trim())
    if (property && value) {
      root.style.setProperty(property, value.replace(';', ''))
    }
  })
}

// Configuración adicional para personalización fácil
export const themeConfig = {
  // Radio de bordes por defecto
  defaultRadius: '0.5rem',
  
  // Configuración de sombras
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)'
  },
  
  // Configuración de animaciones
  animations: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms'
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
}