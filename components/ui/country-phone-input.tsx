import * as React from 'react'
import { useState } from 'react'
import { ChevronDown, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'
import { Input } from './input'
import { Label } from './label'
import { COUNTRY } from '@/types'

export interface CountryPhoneInputProps {
  selectedCountry?: string
  phoneNumber?: string
  onCountryChange?: (countryCode: string) => void
  onPhoneChange?: (phoneNumber: string) => void
  onCurrencyChange?: (currency: string) => void
  className?: string
  error?: string
  disabled?: boolean
}

/**
 * Componente para selección de país y entrada de número telefónico
 * Incluye funcionalidad automática de moneda basada en el país
 */
export const CountryPhoneInput = React.forwardRef<
  HTMLDivElement,
  CountryPhoneInputProps
>(({ 
  selectedCountry = 'CO',
  phoneNumber = '',
  onCountryChange,
  onPhoneChange,
  onCurrencyChange,
  className,
  error,
  disabled = false,
  ...props 
}, ref) => {
  const [internalCountry, setInternalCountry] = useState(selectedCountry)
  const [internalPhone, setInternalPhone] = useState(phoneNumber)

  // Encontrar datos del país seleccionado
  const currentCountryData = COUNTRY.find(c => c.code === internalCountry) || COUNTRY[0]

  const handleCountryChange = (countryCode: string) => {
    setInternalCountry(countryCode)
    const countryData = COUNTRY.find(c => c.code === countryCode)
    
    if (countryData) {
      onCountryChange?.(countryCode)
      // Automáticamente actualizar la moneda cuando cambie el país
      onCurrencyChange?.(countryData.currency)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // Solo números
    setInternalPhone(value)
    onPhoneChange?.(value)
  }

  return (
    <div ref={ref} className={cn('space-y-2', className)} {...props}>
      <Label className="text-xs sm:text-sm font-medium">Número de WhatsApp</Label>
      
      <div className="flex gap-2">
        {/* Selector de país */}
        <div className="w-20 sm:w-48">
          <Select
            value={internalCountry}
            onValueChange={handleCountryChange}
            disabled={disabled}
          >
            <SelectTrigger className={cn(
              'h-10 w-full',
              error && 'border-destructive'
            )}>
              <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                <span className="text-sm sm:text-base flex-shrink-0">{currentCountryData.flag}</span>
                <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                  {currentCountryData.dialCode}
                </span>
                <span className="text-xs sm:text-sm truncate hidden sm:block">
                  {currentCountryData.name}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-60 w-80">
              {COUNTRY.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <div className="flex items-center gap-2 sm:gap-3 w-full">
                    <span className="text-lg flex-shrink-0">{country.flag}</span>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium truncate">{country.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {country.dialCode} • {country.currencySymbol} {country.currency}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Input del número de teléfono */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 sm:gap-2 text-muted-foreground">
              <span className="text-xs sm:text-sm font-medium">{currentCountryData.dialCode}</span>
              <div className="w-px h-3 sm:h-4 bg-border"></div>
            </div>
            <Input
              type="tel"
              value={internalPhone}
              onChange={handlePhoneChange}
              placeholder="Número de WhatsApp"
              className={cn(
                'pl-12 sm:pl-16 w-full',
                error && 'border-destructive'
              )}
              disabled={disabled}
              maxLength={15}
            />
          </div>
        </div>
      </div>

      {/* Información adicional 
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Phone className="h-3 w-3" />
        <span>
          Moneda automática: {currentCountryData.currencySymbol} {currentCountryData.currencyName}
        </span>
      </div>
*/}
      {/* Mensaje de error */}
      {error && (
        <p className="text-xs sm:text-sm text-destructive">{error}</p>
      )}
    </div>
  )
})

CountryPhoneInput.displayName = 'CountryPhoneInput'

export default CountryPhoneInput