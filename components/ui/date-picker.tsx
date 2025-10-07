"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Selecciona una fecha",
  disabled,
  className,
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

  const handleApplyDate = () => {
    const newDate = new Date(selectedYear, selectedMonth, selectedDay)
    if (disabled && disabled(newDate)) {
      return
    }
    onDateChange?.(newDate)
    setIsOpen(false)
  }

  const handleCancel = () => {
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

  const handleQuickSelect = (type: 'in3months' | 'in6months' | 'in1year' | 'endofyear') => {
    const today = new Date()
    let newDate: Date

    switch (type) {
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

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: es }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
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
                <SelectContent>
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
                <SelectContent>
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect('in3months')}
                className="text-xs"
              >
                En 3 meses
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect('in6months')}
                className="text-xs"
              >
                En 6 meses
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect('in1year')}
                className="text-xs"
              >
                En 1 año
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect('endofyear')}
                className="text-xs"
              >
                Fin de año
              </Button>
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
      </PopoverContent>
    </Popover>
  )
}