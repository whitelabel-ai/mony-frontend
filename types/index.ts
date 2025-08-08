/**
 * Tipos de datos para la aplicación Mony
 */

// Tipos de autenticación
export interface User {
  id: string
  nombreCompleto: string
  email: string
  numeroWhatsapp: string
  monedaDefecto: string
  fechaRegistro: string
  activo: boolean
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  nombreCompleto: string
  email: string
  numeroWhatsapp: string
  password: string
  confirmPassword: string
  monedaDefecto: string
}

// Tipos de categorías
export interface Categoria {
  id: string
  nombre: string
  icono: string
  color: string
  tipo: 'INGRESO' | 'GASTO'
  esGlobal: boolean
  usuarioId?: string
  fechaCreacion: string
  activo: boolean
}

// Tipos de transacciones
export interface Transaccion {
  id: string
  descripcion: string
  monto: number
  fecha: string
  tipo: 'INGRESO' | 'GASTO'
  categoriaId: string
  categoria: Categoria
  usuarioId: string
  fechaCreacion: string
}

// Tipos de metas de ahorro
export interface MetaAhorro {
  id: string
  nombre: string
  descripcion?: string
  montoObjetivo: number
  montoActual: number
  fechaInicio: string
  fechaObjetivo: string
  completada: boolean
  usuarioId: string
  fechaCreacion: string
}

// Tipos de suscripciones
export interface Suscripcion {
  id: string
  nombre: string
  descripcion?: string
  monto: number
  frecuencia: 'DIARIA' | 'SEMANAL' | 'MENSUAL' | 'ANUAL'
  proximoPago: string
  activa: boolean
  categoriaId: string
  categoria: Categoria
  usuarioId: string
  fechaCreacion: string
}

// Tipos de perfil de usuario
export interface UserProfile {
  user: User
  categorias: Categoria[]
  suscripciones: Suscripcion[]
  metasAhorro: MetaAhorro[]
  estadisticas: {
    ingresosMes: number
    gastosMes: number
    balanceMes: number
    totalTransacciones: number
    metasActivas: number
    suscripcionesActivas: number
  }
}

// Tipos de respuesta de API
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Tipos de formularios
export interface FormErrors {
  [key: string]: string | undefined
}

// Tipos de tema
export type Theme = 'light' | 'dark' | 'system'

// Tipos de monedas
export interface Currency {
  code: string
  name: string
  symbol: string
}

export const CURRENCIES: Currency[] = [
  { code: 'COP', name: 'Peso Colombiano', symbol: '$' },
  { code: 'USD', name: 'Dólar Estadounidense', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'MXN', name: 'Peso Mexicano', symbol: '$' },
  { code: 'ARS', name: 'Peso Argentino', symbol: '$' },
]

// Tipos de iconos para categorías
export const CATEGORY_ICONS = [
  'Wallet',
  'ShoppingCart',
  'Car',
  'Home',
  'Utensils',
  'Coffee',
  'Gamepad2',
  'Shirt',
  'Stethoscope',
  'GraduationCap',
  'Plane',
  'Gift',
  'CreditCard',
  'Smartphone',
  'Fuel',
  'Building',
  'Heart',
  'Music',
  'Camera',
  'Book',
] as const

export type CategoryIcon = typeof CATEGORY_ICONS[number]

// Tipos de colores para categorías
export const CATEGORY_COLORS = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#22c55e', // green-500
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#64748b', // slate-500
  '#78716c', // stone-500
] as const

export type CategoryColor = typeof CATEGORY_COLORS[number]