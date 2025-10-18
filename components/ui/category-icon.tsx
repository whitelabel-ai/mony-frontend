'use client'

import {
  Wallet,
  ShoppingCart,
  Car,
  Home,
  Utensils,
  Coffee,
  Gamepad2,
  Shirt,
  Stethoscope,
  GraduationCap,
  Plane,
  Gift,
  CreditCard,
  Smartphone,
  Fuel,
  Building,
  Heart,
  Music,
  Camera,
  Book,
  HelpCircle
} from 'lucide-react'

// Mapeo de nombres de iconos a componentes de Lucide React
const iconMap = {
  Wallet,
  ShoppingCart,
  Car,
  Home,
  Utensils,
  Coffee,
  Gamepad2,
  Shirt,
  Stethoscope,
  GraduationCap,
  Plane,
  Gift,
  CreditCard,
  Smartphone,
  Fuel,
  Building,
  Heart,
  Music,
  Camera,
  Book,
} as const

interface CategoryIconProps {
  iconName: string
  className?: string
  size?: number
}

export function CategoryIcon({ iconName, className = "h-4 w-4", size }: CategoryIconProps) {
  // Obtener el componente del icono del mapeo
  const IconComponent = iconMap[iconName as keyof typeof iconMap] || HelpCircle
  
  return <IconComponent className={className} size={size} />
}