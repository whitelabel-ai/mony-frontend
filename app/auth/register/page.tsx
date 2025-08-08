'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Eye, EyeOff, Wallet, ArrowLeft, ArrowRight, Check, User, Globe, CreditCard } from 'lucide-react'
import { useGuestGuard } from '@/hooks'
import { 
  Button, 
  Input, 
  Label, 
  Card, 
  CardHeader, 
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  CountryPhoneInput,
  SubscriptionPlans
} from '@/components/ui'
import { apiService } from '@/lib/api'
import { CURRENCIES, COUNTRY_CODES, type RegisterStepData, type RegisterStep } from '@/types'
import { isValidEmail } from '@/lib/utils'

/**
 * Schema de validación para cada paso del registro
 */
const step1Schema = z.object({
  nombreCompleto: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  email: z
    .string()
    .email('Ingresa un email válido')
    .refine((email) => isValidEmail(email), 'Formato de email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

const step2Schema = z.object({
  countryCode: z.string().min(1, 'Selecciona un país'),
  phoneNumber: z
    .string()
    .min(7, 'El número debe tener al menos 7 dígitos')
    .max(15, 'El número no puede exceder 15 dígitos')
    .regex(/^\d+$/, 'Solo se permiten números'),
  moneda: z.string().min(1, 'Selecciona una moneda'),
})

const step3Schema = z.object({
  selectedPlan: z.string().min(1, 'Selecciona un plan'),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>
type Step3Data = z.infer<typeof step3Schema>

/**
 * Página de registro con flujo por pasos
 */
export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState<RegisterStep>(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<RegisterStepData>({
    countryCode: 'CO',
    moneda: 'COP',
    selectedPlan: 'free'
  })
  
  const { loading: authLoading } = useGuestGuard()

  // Formularios para cada paso
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      nombreCompleto: formData.nombreCompleto || '',
      email: formData.email || '',
      password: formData.password || '',
      confirmPassword: formData.confirmPassword || '',
    }
  })

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      countryCode: formData.countryCode || 'CO',
      phoneNumber: formData.phoneNumber || '',
      moneda: formData.moneda || 'COP',
    }
  })

  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      selectedPlan: formData.selectedPlan || 'free',
    }
  })

  /**
   * Avanzar al siguiente paso
   */
  const handleNextStep = async () => {
    let isValid = false
    
    if (currentStep === 1) {
      isValid = await step1Form.trigger()
      if (isValid) {
        const data = step1Form.getValues()
        setFormData(prev => ({ ...prev, ...data }))
      }
    } else if (currentStep === 2) {
      isValid = await step2Form.trigger()
      if (isValid) {
        const data = step2Form.getValues()
        setFormData(prev => ({ ...prev, ...data }))
      }
    }
    
    if (isValid && currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as RegisterStep)
    }
  }

  /**
   * Retroceder al paso anterior
   */
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as RegisterStep)
    }
  }

  /**
   * Enviar formulario final
   */
  const handleSubmit = async () => {
    const isStep3Valid = await step3Form.trigger()
    if (!isStep3Valid) return

    const step3Data = step3Form.getValues()
    const finalData = { ...formData, ...step3Data }

    try {
      setIsLoading(true)
      
      // Construir el número completo de WhatsApp
      const selectedCountry = COUNTRY_CODES.find(c => c.code === finalData.countryCode)
      const fullPhoneNumber = `${selectedCountry?.dialCode}${finalData.phoneNumber}`
      
      // Preparar datos para el API
      const registerData = {
        nombreCompleto: finalData.nombreCompleto!,
        email: finalData.email!,
        numeroWhatsapp: fullPhoneNumber,
        password: finalData.password!,
        confirmPassword: finalData.confirmPassword!,
        moneda: finalData.moneda!,
        planSeleccionado: finalData.selectedPlan!,
      }
      
      await apiService.register(registerData)
      // La redirección se maneja en el hook useAuth
    } catch (error) {
      // El error se maneja en el servicio de API
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const steps = [
    { number: 1, title: 'Información Personal', icon: User, completed: currentStep > 1 },
    { number: 2, title: 'Configuración Regional', icon: Globe, completed: currentStep > 2 },
    { number: 3, title: 'Plan de Suscripción', icon: CreditCard, completed: false },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver al inicio
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Wallet className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">Mony</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Crear tu cuenta</h1>
          <p className="text-muted-foreground mt-2">
            Configura tu perfil financiero en solo 3 pasos
          </p>
        </div>

        {/* Indicador de pasos */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.number
              const isCompleted = step.completed
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center space-x-2 ${
                    isActive ? 'text-primary' : isCompleted ? 'text-green-500' : 'text-muted-foreground'
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isActive 
                        ? 'border-primary bg-primary text-primary-foreground' 
                        : isCompleted 
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-muted-foreground'
                    }`}>
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="hidden sm:block">
                      <div className={`text-sm font-medium ${
                        isActive ? 'text-primary' : isCompleted ? 'text-green-500' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-muted-foreground/30'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Contenido del formulario */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <h2 className="text-xl font-semibold">
              {currentStep === 1 && 'Información Personal'}
              {currentStep === 2 && 'Configuración Regional'}
              {currentStep === 3 && 'Elige tu Plan'}
            </h2>
            <p className="text-muted-foreground text-sm">
              {currentStep === 1 && 'Ingresa tus datos básicos para crear tu cuenta'}
              {currentStep === 2 && 'Configura tu región y moneda preferida'}
              {currentStep === 3 && 'Selecciona el plan que mejor se adapte a tus necesidades'}
            </p>
          </CardHeader>
          <CardContent>
            {/* Paso 1: Información Personal */}
            {currentStep === 1 && (
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombreCompleto">Nombre completo</Label>
                  <Input
                    id="nombreCompleto"
                    type="text"
                    placeholder="Ingresa tu nombre completo"
                    {...step1Form.register('nombreCompleto')}
                    className={step1Form.formState.errors.nombreCompleto ? 'border-destructive' : ''}
                  />
                  {step1Form.formState.errors.nombreCompleto && (
                    <p className="text-sm text-destructive">
                      {step1Form.formState.errors.nombreCompleto.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    {...step1Form.register('email')}
                    className={step1Form.formState.errors.email ? 'border-destructive' : ''}
                  />
                  {step1Form.formState.errors.email && (
                    <p className="text-sm text-destructive">{step1Form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Crea una contraseña segura"
                      {...step1Form.register('password')}
                      className={step1Form.formState.errors.password ? 'border-destructive pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {step1Form.formState.errors.password && (
                    <p className="text-sm text-destructive">{step1Form.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirma tu contraseña"
                      {...step1Form.register('confirmPassword')}
                      className={step1Form.formState.errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {step1Form.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {step1Form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </form>
            )}

            {/* Paso 2: Configuración Regional */}
            {currentStep === 2 && (
              <form className="space-y-6">
                <CountryPhoneInput
                  countryCode={step2Form.watch('countryCode')}
                  phoneNumber={step2Form.watch('phoneNumber')}
                  onCountryChange={(code) => step2Form.setValue('countryCode', code)}
                  onPhoneChange={(phone) => step2Form.setValue('phoneNumber', phone)}
                  error={step2Form.formState.errors.phoneNumber?.message}
                />

                <div className="space-y-2">
                  <Label htmlFor="moneda">Moneda por defecto</Label>
                  <Select
                    value={step2Form.watch('moneda')}
                    onValueChange={(value) => step2Form.setValue('moneda', value)}
                  >
                    <SelectTrigger className={`bg-background ${step2Form.formState.errors.moneda ? 'border-destructive' : ''}`}>
                      <SelectValue placeholder="Selecciona tu moneda" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-lg">
                      {CURRENCIES.map((currency) => (
                        <SelectItem 
                          key={currency.code} 
                          value={currency.code} 
                          className="hover:bg-accent hover:text-accent-foreground bg-background cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{currency.symbol}</span>
                            <span>{currency.name}</span>
                            <span className="text-muted-foreground">({currency.code})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {step2Form.formState.errors.moneda && (
                    <p className="text-sm text-destructive">
                      {step2Form.formState.errors.moneda.message}
                    </p>
                  )}
                </div>
              </form>
            )}

            {/* Paso 3: Plan de Suscripción */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <SubscriptionPlans
                  selectedPlan={step3Form.watch('selectedPlan')}
                  onPlanSelect={(planId) => step3Form.setValue('selectedPlan', planId)}
                />
                {step3Form.formState.errors.selectedPlan && (
                  <p className="text-sm text-destructive text-center">
                    {step3Form.formState.errors.selectedPlan.message}
                  </p>
                )}
              </div>
            )}

            {/* Botones de navegación */}
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className={currentStep === 1 ? 'invisible' : ''}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

              {currentStep < 3 ? (
                <Button type="button" onClick={handleNextStep}>
                  Siguiente
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                </Button>
              )}
            </div>

            {/* Link a login */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                ¿Ya tienes una cuenta?{' '}
                <Link
                  href="/auth/login"
                  className="font-medium text-primary hover:underline"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}