'use client'

import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from './command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover'
import { COUNTRY_CODES, type CountryCode } from '@/types'

interface CountryPhoneInputProps {
  countryCode?: string
  phoneNumber?: string
  onCountryChange: (countryCode: string) => void
  onPhoneChange: (phoneNumber: string) => void
  error?: string
  className?: string
}

/**
 * Componente para seleccionar país y número de teléfono
 */
export function CountryPhoneInput({
  countryCode = 'CO',
  phoneNumber = '',
  onCountryChange,
  onPhoneChange,
  error,
  className
}: CountryPhoneInputProps) {
  const [open, setOpen] = useState(false)
  
  const selectedCountry = COUNTRY_CODES.find(country => country.code === countryCode) || COUNTRY_CODES[0]

  const handleCountrySelect = (country: CountryCode) => {
    onCountryChange(country.code)
    setOpen(false)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir números
    const value = e.target.value.replace(/\D/g, '')
    onPhoneChange(value)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="phone">Número de WhatsApp</Label>
      <div className="flex gap-2">
        {/* Selector de país */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[140px] justify-between px-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedCountry.flag}</span>
                <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
              </div>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0 bg-background border border-border shadow-lg" align="start">
            <Command className="bg-background">
              <CommandInput placeholder="Buscar país..." className="h-9 bg-background" />
              <CommandEmpty className="bg-background">No se encontró el país.</CommandEmpty>
              <CommandGroup className="max-h-[200px] overflow-auto bg-background">
                {COUNTRY_CODES.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={`${country.name} ${country.dialCode}`}
                    onSelect={() => handleCountrySelect(country)}
                    className="flex items-center gap-2 cursor-pointer hover:bg-accent hover:text-accent-foreground bg-background"
                  >
                    <span className="text-lg">{country.flag}</span>
                    <div className="flex-1">
                      <div className="font-medium">{country.name}</div>
                      <div className="text-sm text-muted-foreground">{country.dialCode}</div>
                    </div>
                    <Check
                      className={`ml-auto h-4 w-4 ${
                        country.code === countryCode ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Input del número */}
        <div className="flex-1 relative">
          <Input
            id="phone"
            type="tel"
            placeholder="300 123 4567"
            value={phoneNumber}
            onChange={handlePhoneChange}
            className={`pl-3 ${error ? 'border-destructive' : ''}`}
            maxLength={15}
          />
        </div>
      </div>
      
      {/* Número completo preview */}
      {phoneNumber && (
        <div className="text-sm text-muted-foreground">
          Número completo: <span className="font-medium">{selectedCountry.dialCode} {phoneNumber}</span>
        </div>
      )}
      
      {/* Error */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

export default CountryPhoneInput