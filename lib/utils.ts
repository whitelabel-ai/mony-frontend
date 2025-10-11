import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utilidad para combinar clases de Tailwind CSS
 * Evita conflictos y duplicados entre clases
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un número como moneda
 * @param amount - Cantidad a formatear
 * @param currency - Código de moneda (COP, USD, EUR)
 * @param locale - Configuración regional
 */
export function formatCurrency(
  amount: number,
  currency: string = 'COP',
  locale: string = 'es-CO'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formatea una fecha de manera legible
 * @param date - Fecha a formatear
 * @param options - Opciones de formato
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-ES', options).format(dateObj)
}

/**
 * Valida si un email tiene formato válido
 * @param email - Email a validar
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida si un número de WhatsApp tiene formato válido
 * @param phone - Número de teléfono a validar
 */
export function isValidWhatsApp(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone)
}

/**
 * Genera un saludo basado en la hora del día
 */
export function getGreeting(): string {
  const hour = new Date().getHours()
  
  if (hour < 12) {
    return 'Buenos días'
  } else if (hour < 18) {
    return 'Buenas tardes'
  } else {
    return 'Buenas noches'
  }
}

/**
 * Obtiene las iniciales del nombre de usuario
 * @param name - Nombre completo del usuario
 */
export function getUserInitials(name: string): string {
  if (!name) return 'U'
  
  const words = name.trim().split(' ')
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase()
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}

/**
 * Trunca un texto a una longitud específica
 * @param text - Texto a truncar
 * @param length - Longitud máxima
 */
export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

/**
 * Debounce function para optimizar búsquedas
 * @param func - Función a ejecutar
 * @param wait - Tiempo de espera en ms
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}