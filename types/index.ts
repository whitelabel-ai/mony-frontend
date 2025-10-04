/**
 * Tipos de datos para la aplicación Mony
 */

// Tipos de autenticación
export interface User {
  id: string
  nombreCompleto: string
  email: string
  numeroWhatsapp: string
  moneda: string
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
  moneda: string
  planSeleccionado: string
  frecuenciaRecordatorios?: 'nunca' | 'diario' | 'semanal' | 'mensual'
  frecuenciaInformes?: 'nunca' | 'diario' | 'semanal' | 'mensual'
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

// Tipos para el backend de transacciones
export interface Transaction {
  id: string
  descripcion: string
  monto: number
  moneda: string
  tipo: 'INGRESO' | 'GASTO'
  fechaTransaccion: string
  fechaCreacion: string
  notas?: string
  createdAt: string
  updatedAt: string
  categoria?: {
    id: string
    nombre: string
    icono: string
    color: string
    tipo: 'INGRESO' | 'GASTO'
  }
  fuenteRegistro?: {
    id: string
    nombre: string
    descripcion?: string
  }
}

export interface CreateTransactionDto {
  descripcion: string
  monto: number
  moneda: string
  tipo: 'INGRESO' | 'GASTO'
  fechaTransaccion?: string
  idCategoria: string
  idFuente?: string
  notas?: string
}

export interface UpdateTransactionDto {
  descripcion?: string
  monto?: number
  moneda?: string
  tipo?: 'INGRESO' | 'GASTO'
  fechaTransaccion?: string
  idCategoria?: string
  idFuente?: string
  notas?: string
}

export interface FilterTransactionsDto {
  fechaInicio?: string
  fechaFin?: string
  tipo?: 'INGRESO' | 'GASTO'
  idCategoria?: string
  busqueda?: string
  pagina?: number
  limite?: number
  ordenarPor?: 'fechaTransaccion' | 'monto' | 'descripcion'
  direccion?: 'asc' | 'desc'
}

export interface PaginatedTransactionsResponse {
  transacciones: Transaction[]
  paginacion: {
    paginaActual: number
    totalPaginas: number
    totalElementos: number
    elementosPorPagina: number
    tieneAnterior: boolean
    tieneSiguiente: boolean
  }
}

export interface TransactionAnalytics {
  resumen: {
    totalIngresos: number
    totalGastos: number
    balanceNeto: number
    transaccionesTotales: number
    promedioIngresos: number
    promedioGastos: number
  }
  desglosePorCategorias: {
    categoria: string
    totalMonto: number
    cantidadTransacciones: number
    porcentajeDelTotal: number
    tipo: 'INGRESO' | 'GASTO'
  }[]
  seriesTiempo: {
    fecha: string
    ingresos: number
    gastos: number
    balance: number
  }[]
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
  id: string
  nombreCompleto: string
  email: string
  numeroWhatsapp: string
  moneda: string
  estadoSuscripcion: string
  fechaRegistro: string
  categorias: any[]
  suscripcionMony: any[]
  metasDeAhorro: any[]
  suscripciones: any[]
  estadisticas: {
    ingresosMes: number
    gastosMes: number
    balanceMes: number
    totalTransaccionesMes: number
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
  { code: 'PEN', name: 'Sol Peruano', symbol: 'S/' },
  { code: 'CLP', name: 'Peso Chileno', symbol: '$' },
  { code: 'BRL', name: 'Real Brasileño', symbol: 'R$' },
  { code: 'UYU', name: 'Peso Uruguayo', symbol: '$' },
  { code: 'BOB', name: 'Boliviano', symbol: 'Bs' },
]

// Tipos y constantes para códigos de países
export interface CountryData {
  code: string
  name: string
  dialCode: string
  flag: string
  currency: string
  currencyName: string
  currencySymbol: string
}

export const COUNTRY: CountryData[] = [
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴', currency: 'COP', currencyName: 'Peso Colombiano', currencySymbol: '$' },
  { code: 'US', name: 'Estados Unidos', dialCode: '+1', flag: '🇺🇸', currency: 'USD', currencyName: 'Dólar Estadounidense', currencySymbol: '$' },
  { code: 'MX', name: 'México', dialCode: '+52', flag: '🇲🇽', currency: 'MXN', currencyName: 'Peso Mexicano', currencySymbol: '$' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷', currency: 'ARS', currencyName: 'Peso Argentino', currencySymbol: '$' },
  { code: 'PE', name: 'Perú', dialCode: '+51', flag: '🇵🇪', currency: 'PEN', currencyName: 'Sol Peruano', currencySymbol: 'S/' },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱', currency: 'CLP', currencyName: 'Peso Chileno', currencySymbol: '$' },
  { code: 'BR', name: 'Brasil', dialCode: '+55', flag: '🇧🇷', currency: 'BRL', currencyName: 'Real Brasileño', currencySymbol: 'R$' },
  { code: 'UY', name: 'Uruguay', dialCode: '+598', flag: '🇺🇾', currency: 'UYU', currencyName: 'Peso Uruguayo', currencySymbol: '$' },
  { code: 'BO', name: 'Bolivia', dialCode: '+591', flag: '🇧🇴', currency: 'BOB', currencyName: 'Boliviano', currencySymbol: 'Bs' },
  { code: 'EC', name: 'Ecuador', dialCode: '+593', flag: '🇪🇨', currency: 'USD', currencyName: 'Dólar Estadounidense', currencySymbol: '$' },
  { code: 'VE', name: 'Venezuela', dialCode: '+58', flag: '🇻🇪', currency: 'USD', currencyName: 'Dólar Estadounidense', currencySymbol: '$' },
  { code: 'PY', name: 'Paraguay', dialCode: '+595', flag: '🇵🇾', currency: 'USD', currencyName: 'Dólar Estadounidense', currencySymbol: '$' },
  { code: 'ES', name: 'España', dialCode: '+34', flag: '🇪🇸', currency: 'EUR', currencyName: 'Euro', currencySymbol: '€' },
]

// Tipos para planes de suscripción
export interface SubscriptionPlan {
  id: string
  tipo: string
  nombre: string
  precio: number
  moneda: string
  lema: string
  dirigidoA: string
  descripcion: string
  caracteristicas: string[]
  limitaciones: string[]
  registrosMensuales: number
  metasDeAhorro: number
  presupuestos: number
  perfilesFinancieros: number
  publicidad: boolean
  popular?: boolean
  color?: string
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    tipo: 'free',
    nombre: 'Mony Free',
    precio: 0,
    moneda: 'USD',
    lema: 'La puerta de entrada a la claridad financiera',
    dirigidoA: 'El Explorador Financiero',
    descripcion: 'La experiencia de Mony en su forma más esencial. Diseñado para que construyas el hábito de registrar tus movimientos y veas el valor inmediato sin ningún costo.',
    caracteristicas: [
      '📊 Limitado a 20 registros al mes',
      '✅ Registro por Texto',
      '🗂️ Categorización Estándar (no personalizable)',
      '📊 Dashboard Básico con resumen de gastos del mes',
      '💬 Soporte comunitario'
    ],
    limitaciones: [
      'Limitado a 20 registros mensuales',
      'Solo registro por texto',
      'Sin categorías personalizadas',
      'Sin metas de ahorro',
      'Sin presupuestos',
      'Sin gestión de suscripciones',
      'Sin acceso al Mony Coach (IA)',
      'Sin reportes avanzados',
      'Sin exportación PDF/Excel',
      'Incluye mensajes promocionales ocasionales'
    ],
    registrosMensuales: 20,
    metasDeAhorro: 0,
    presupuestos: 0,
    perfilesFinancieros: 1,
    publicidad: true
  },
  {
    id: 'premium',
    tipo: 'premium',
    nombre: 'Mony Premium',
    precio: 6.99,
    moneda: 'USD',
    lema: 'El control total de tus finanzas en tu bolsillo',
    dirigidoA: 'El Gestor Comprometido',
    descripcion: 'La solución completa para la gestión financiera personal. Desbloquea todo el poder de la IA de Mony para analizar, planificar y automatizar.',
    caracteristicas: [
      '♾️ Registros mensuales ilimitados',
      '✅ Registro por Texto, Foto (OCR) y Audio',
      '🧠 Acceso completo al Asistente Financiero 24/7 y al Mony Coach',
      '🎯 Creación y seguimiento de Metas de Ahorro',
      '💰 Creación de Presupuestos por categoría',
      '🗓️ Gestión de Suscripciones y recordatorios de pago',
      '✨ Categorías personalizadas para adaptar Mony a tu vida',
      '📈 Dashboard Avanzado con reportes detallados y gráficos interactivos',
      '✅ Sin publicidad',
      '✉️ Soporte por email'
    ],
    limitaciones: [
      'Solo un perfil financiero',
      'Sin exportación avanzada PDF/Excel',
      'Sin múltiples perfiles financieros',
      'Sin soporte prioritario'
    ],
    registrosMensuales: -1,
    metasDeAhorro: -1,
    presupuestos: -1,
    perfilesFinancieros: 1,
    publicidad: false
  },
  {
    id: 'pro',
    tipo: 'pro',
    nombre: 'Mony Pro',
    precio: 14.99,
    moneda: 'USD',
    lema: 'La herramienta definitiva para tus finanzas personales y profesionales',
    dirigidoA: 'El Profesional o Emprendedor',
    descripcion: 'Todo lo del plan Premium, más herramientas avanzadas diseñadas para quienes necesitan una gestión financiera de nivel superior, separando proyectos o negocios.',
    caracteristicas: [
      '✅ Incluye todas las características del Plan Premium',
      '📁 Gestión de múltiples perfiles (hasta 3) - Separa finanzas personales, emprendimiento y proyectos',
      '📤 Exportación avanzada de reportes en PDF y Excel',
      '🔍 Filtros y búsqueda avanzada en el Dashboard',
      '✉️ Envío directo de reportes a tu contador (próximamente)',
      '⭐ Soporte Prioritario por WhatsApp'
    ],
    limitaciones: [],
    registrosMensuales: -1,
    metasDeAhorro: -1,
    presupuestos: -1,
    perfilesFinancieros: 3,
    publicidad: false
  }
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

// Tipos para el flujo de registro
export interface RegisterStepData {
  // Paso 1: Información personal
  nombreCompleto?: string
  email?: string
  password?: string
  confirmPassword?: string
  
  // Paso 2: Configuración regional
  pais?: string
  countryCode?: string
  phoneNumber?: string
  moneda?: string
  
  // Paso 3: Plan de suscripción
  selectedPlan?: string
  
  // Paso 4: Preferencias de notificación
  frecuenciaRecordatorios?: 'nunca' | 'diario' | 'semanal' | 'mensual'
  frecuenciaInformes?: 'nunca' | 'diario' | 'semanal' | 'mensual'
}

export type RegisterStep = 1 | 2 | 3 | 4

// Tipos para las preferencias de notificación
export type FrecuenciaNotificacion = 'nunca' | 'diario' | 'semanal' | 'mensual'

export interface NotificationPreferences {
  frecuenciaRecordatorios: FrecuenciaNotificacion
  frecuenciaInformes: FrecuenciaNotificacion
}

// Tipo para la respuesta del contador de usuarios
export interface UsersCountResponse {
  totalUsers: number
  message: string
}