"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: (date: Date) => boolean
  className?: string
  variant?: 'default' | 'transaction' | 'goal'
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Selecciona una fecha",
  disabled,
  className,
  variant = 'default',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedDay, setSelectedDay] = React.useState(date?.getDate() || 1)
  const [selectedMonth, setSelectedMonth] = React.useState(date?.getMonth() || new Date().getMonth())
  const [selectedYear, setSelectedYear] = React.useState(date?.getFullYear() || new Date().getFullYear())

  // Sincronizar con la fecha externa cuando cambie
  React.useEffect(() => {
    if (date) {
      setSelectedDay(date.getDate())
      setSelectedMonth(date.getMonth())
      setSelectedYear(date.getFullYear())
    }
  }, [date])

  const years = React.useMemo(() => {
    const startYear = new Date().getFullYear()
    const endYear = startYear + 10
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
  }, [])

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  // Obtener el número de días en el mes seleccionado
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const daysInSelectedMonth = getDaysInMonth(selectedMonth, selectedYear)

  // Actualizar el día si es mayor al máximo del mes
  React.useEffect(() => {
    if (selectedDay > daysInSelectedMonth) {
      setSelectedDay(daysInSelectedMonth)
    }
  }, [selectedMonth, selectedYear, selectedDay, daysInSelectedMonth])

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const day = parseInt(e.target.value)
    if (!isNaN(day) && day >= 1 && day <= daysInSelectedMonth) {
      setSelectedDay(day)
    } else if (e.target.value === '') {
      setSelectedDay(1)
    }
  }

  const handleMonthChange = (value: string) => {
    const month = parseInt(value)
    setSelectedMonth(month)
  }

  const handleYearChange = (value: string) => {
    const year = parseInt(value)
    setSelectedYear(year)
  }

  const handleApplyDate = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    const newDate = new Date(selectedYear, selectedMonth, selectedDay)
    if (disabled && disabled(newDate)) {
      return
    }
    onDateChange?.(newDate)
    setIsOpen(false)
  }

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    // Restaurar valores originales
    if (date) {
      setSelectedDay(date.getDate())
      setSelectedMonth(date.getMonth())
      setSelectedYear(date.getFullYear())
    } else {
      const today = new Date()
      setSelectedDay(today.getDate())
      setSelectedMonth(today.getMonth())
      setSelectedYear(today.getFullYear())
    }
    setIsOpen(false)
  }

  const handleQuickSelect = (type: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    const today = new Date()
    let newDate: Date

    switch (type) {
      // Opciones para transacciones
      case 'today':
        newDate = new Date()
        break
      case 'yesterday':
        newDate = new Date(today.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'week_ago':
        newDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month_start':
        newDate = new Date(today.getFullYear(), today.getMonth(), 1)
        break
      // Opciones para metas
      case 'in3months':
        newDate = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate())
        break
      case 'in6months':
        newDate = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate())
        break
      case 'in1year':
        newDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
        break
      case 'endofyear':
        newDate = new Date(today.getFullYear(), 11, 31) // 31 de diciembre
        break
      default:
        newDate = today
    }

    setSelectedDay(newDate.getDate())
    setSelectedMonth(newDate.getMonth())
    setSelectedYear(newDate.getFullYear())
  }

  const getQuickSelectOptions = () => {
    if (variant === 'transaction') {
      return [
        { key: 'today', label: 'Hoy' },
        { key: 'yesterday', label: 'Ayer' },
        { key: 'week_ago', label: 'Hace 1 semana' },
        { key: 'month_start', label: 'Inicio del mes' },
      ]
    } else if (variant === 'goal') {
      return [
        { key: 'in3months', label: 'En 3 meses' },
        { key: 'in6months', label: 'En 6 meses' },
        { key: 'in1year', label: 'En 1 año' },
        { key: 'endofyear', label: 'Fin de año' },
      ]
    } else {
      return [
        { key: 'today', label: 'Hoy' },
        { key: 'in1year', label: 'En 1 año' },
        { key: 'in6months', label: 'En 6 meses' },
        { key: 'endofyear', label: 'Fin de año' },
      ]
    }
  }

  const [buttonRef, setButtonRef] = React.useState<HTMLButtonElement | null>(null)
  const [overlayPosition, setOverlayPosition] = React.useState({ top: 0, left: 0 })

  // Calcular posición del overlay
  React.useEffect(() => {
    if (isOpen && buttonRef) {
      const rect = buttonRef.getBoundingClientRect()
      setOverlayPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX
      })
    }
  }, [isOpen, buttonRef])

  // Cerrar al hacer click fuera
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && buttonRef && !buttonRef.contains(event.target as Node)) {
        const overlay = document.getElementById('date-picker-overlay')
        if (overlay && !overlay.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, buttonRef])

  let overlayContent = null
  
  if (isOpen && typeof window !== 'undefined') {
    overlayContent = createPortal(
      <div
        id="date-picker-overlay"
        className="fixed bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80"
        style={{
          top: overlayPosition.top,
          left: overlayPosition.left,
          zIndex: 99999,
          pointerEvents: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Día</label>
              <Input
                type="number"
                min="1"
                max={daysInSelectedMonth}
                value={selectedDay}
                onChange={handleDayChange}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Mes</label>
              <Select value={selectedMonth.toString()} onValueChange={handleMonthChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar mes">
                    {months[selectedMonth]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="z-[10000] pointer-events-auto">
                  {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Año</label>
              <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar año">
                    {selectedYear}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="z-[10000] pointer-events-auto">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Selección rápida:</div>
            <div className="grid grid-cols-2 gap-2">
              {getQuickSelectOptions().map((option) => (
                <Button
                  key={option.key}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleQuickSelect(option.key, e)}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Fecha seleccionada: {selectedDay} de {months[selectedMonth]} de {selectedYear}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleApplyDate}
              className="flex-1"
            >
              Aplicar
            </Button>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  return (
    <div className="relative">
      <Button
        ref={setButtonRef}
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          !date && "text-muted-foreground",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? format(date, "PPP", { locale: es }) : placeholder}
      </Button>
      {overlayContent}
    </div>
  )
}