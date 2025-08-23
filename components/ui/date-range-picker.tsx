'use client'

import React, { useState } from 'react'
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react'
import { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DateRangePickerProps {
  date?: DateRange
  onDateChange?: (date: DateRange | undefined) => void
  className?: string
  placeholder?: string
}

const presetRanges = [
  {
    label: 'Últimos 7 días',
    value: 'last7days',
    range: () => ({
      from: subDays(new Date(), 6),
      to: new Date()
    })
  },
  {
    label: 'Últimos 30 días',
    value: 'last30days',
    range: () => ({
      from: subDays(new Date(), 29),
      to: new Date()
    })
  },
  {
    label: 'Este mes',
    value: 'thisMonth',
    range: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date())
    })
  },
  {
    label: 'Mes anterior',
    value: 'lastMonth',
    range: () => {
      const lastMonth = subMonths(new Date(), 1)
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth)
      }
    }
  },
  {
    label: 'Últimos 3 meses',
    value: 'last3months',
    range: () => ({
      from: subMonths(new Date(), 3),
      to: new Date()
    })
  },
  {
    label: 'Este año',
    value: 'thisYear',
    range: () => ({
      from: startOfYear(new Date()),
      to: endOfYear(new Date())
    })
  }
]

export function DateRangePicker({
  date,
  onDateChange,
  className,
  placeholder = 'Seleccionar rango de fechas'
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string>('')

  const handlePresetSelect = (presetValue: string) => {
    const preset = presetRanges.find(p => p.value === presetValue)
    if (preset) {
      const range = preset.range()
      onDateChange?.(range)
      setSelectedPreset(presetValue)
      setIsOpen(false)
    }
  }

  const handleDateSelect = (selectedDate: DateRange | undefined) => {
    onDateChange?.(selectedDate)
    setSelectedPreset('') // Clear preset when manually selecting dates
  }

  const formatDateRange = (dateRange: DateRange | undefined) => {
    if (!dateRange?.from) {
      return placeholder
    }

    if (dateRange.to) {
      return `${format(dateRange.from, 'dd MMM yyyy', { locale: es })} - ${format(dateRange.to, 'dd MMM yyyy', { locale: es })}`
    }

    return format(dateRange.from, 'dd MMM yyyy', { locale: es })
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(date)}
            <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Presets sidebar */}
            <div className="border-r p-3 space-y-1 min-w-[200px]">
              <div className="text-sm font-medium mb-2">Rangos rápidos</div>
              {presetRanges.map((preset) => (
                <Button
                  key={preset.value}
                  variant={selectedPreset === preset.value ? 'default' : 'ghost'}
                  className="w-full justify-start text-sm h-8"
                  onClick={() => handlePresetSelect(preset.value)}
                >
                  {preset.label}
                </Button>
              ))}
              
              <div className="pt-2 border-t">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-8"
                  onClick={() => {
                    onDateChange?.(undefined)
                    setSelectedPreset('')
                    setIsOpen(false)
                  }}
                >
                  Limpiar selección
                </Button>
              </div>
            </div>
            
            {/* Calendar */}
            <div className="p-3">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleDateSelect}
                numberOfMonths={2}
                locale={es}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default DateRangePicker