"use client";

import React, { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "./button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  mode?: "past" | "future";
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  className,
  disabled = false,
  mode = "past",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | "">(value?.getDate() || "");
  const [selectedMonth, setSelectedMonth] = useState<number | "">(value ? value.getMonth() + 1 : "");
  const [selectedYear, setSelectedYear] = useState<number | "">(value?.getFullYear() || "");

  // Actualizar estado interno cuando cambie el valor externo
  React.useEffect(() => {
    if (value) {
      setSelectedDay(value.getDate());
      setSelectedMonth(value.getMonth() + 1);
      setSelectedYear(value.getFullYear());
    } else {
      setSelectedDay("");
      setSelectedMonth("");
      setSelectedYear("");
    }
  }, [value]);

  const handleDayChange = (day: string) => {
    setSelectedDay(Number(day));
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(Number(month));
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(Number(year));
  };

  const handleApply = () => {
    if (selectedDay && selectedMonth && selectedYear) {
      const newDate = new Date(Number(selectedYear), Number(selectedMonth) - 1, Number(selectedDay));
      onChange?.(newDate);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    // Restaurar valores originales
    if (value) {
      setSelectedDay(value.getDate());
      setSelectedMonth(value.getMonth() + 1);
      setSelectedYear(value.getFullYear());
    } else {
      setSelectedDay("");
      setSelectedMonth("");
      setSelectedYear("");
    }
    setIsOpen(false);
  };

  const handleQuickSelect = (date: Date) => {
    onChange?.(date);
    setIsOpen(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getQuickSelectOptions = () => {
    const today = new Date();
    if (mode === "future") {
      const inOneMonth = new Date(today);
      inOneMonth.setMonth(today.getMonth() + 1);

      const inThreeMonths = new Date(today);
      inThreeMonths.setMonth(today.getMonth() + 3);

      const inSixMonths = new Date(today);
      inSixMonths.setMonth(today.getMonth() + 6);

      const endOfYear = new Date(today.getFullYear(), 11, 31);

      const inOneYear = new Date(today);
      inOneYear.setFullYear(today.getFullYear() + 1);

      return [
        { label: "En un mes", date: inOneMonth },
        { label: "En 3 meses", date: inThreeMonths },
        { label: "En 6 meses", date: inSixMonths },
        { label: "Fin de año", date: endOfYear },
        { label: "En 1 año", date: inOneYear },
      ];
    } else {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 7);
      
      const lastMonth = new Date(today);
      lastMonth.setMonth(today.getMonth() - 1);

      return [
        { label: "Hoy", date: today },
        { label: "Ayer", date: yesterday },
        { label: "Hace una semana", date: lastWeek },
        { label: "Hace un mes", date: lastMonth },
      ];
    }
  };

  // Generar opciones para días, meses y años
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: 1, label: "Enero" },
    { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" },
    { value: 6, label: "Junio" },
    { value: 7, label: "Julio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" },
    { value: 12, label: "Diciembre" },
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 16 }, (_, i) => currentYear - 5 + i);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? formatDate(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          {/* Selección manual de fecha */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Seleccionar fecha</h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Día</label>
                <Select value={selectedDay.toString()} onValueChange={handleDayChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Día" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Mes</label>
                <Select value={selectedMonth.toString()} onValueChange={handleMonthChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Mes" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Año</label>
                <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Año" />
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
          </div>

          {/* Opciones rápidas */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Selección rápida</h4>
            <div className="grid grid-cols-2 gap-2">
              {getQuickSelectOptions().map((option) => (
                <Button
                  key={option.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect(option.date)}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button 
              size="sm" 
              onClick={handleApply}
              disabled={!selectedDay || !selectedMonth || !selectedYear}
            >
              Aplicar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}