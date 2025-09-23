'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Wallet, ArrowLeft, ArrowRight, Check, User, Globe, CreditCard, Bell } from 'lucide-react'
import { useGuestGuard, useAuth } from '@/hooks'
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
import { WelcomeModal } from '@/components/ui/welcome-modal'
import { apiService } from '@/lib/api'
import { COUNTRY, CURRENCIES, RegisterStepData, RegisterStep } from '@/types'
import { useForm } from 'react-hook-form'
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
  pais: z.string().min(1, 'Selecciona un país'),
  countryCode: z.string().min(1, 'Selecciona un país'),
  phoneNumber: z
    .string()
    .min(7, 'El número debe tener al menos 7 dígitos')
    .max(15, 'El número no puede exceder 15 dígitos')
    .regex(/^\d+$/, 'Solo se permiten números'),
  moneda: z.string().min(1, 'Selecciona una moneda'),
})
const step3Schema = z.object({
  frecuenciaRecordatorios: z.enum(['nunca', 'diario', 'semanal', 'mensual']),
  frecuenciaInformes: z.enum(['nunca', 'diario', 'semanal', 'mensual']),
})

const step4Schema = z.object({
  selectedPlan: z.string().min(1, 'Selecciona un plan'),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>
type Step3Data = z.infer<typeof step3Schema>
type Step4Data = z.infer<typeof step4Schema>

/**
 * Página de registro con flujo por pasos
 */
export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState<RegisterStep>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [registeredUserName, setRegisteredUserName] = useState('')
  const [formData, setFormData] = useState<RegisterStepData>({
    pais: 'CO',
    countryCode: 'CO',
    moneda: 'COP',
    selectedPlan: 'free',
    frecuenciaRecordatorios: 'nunca',
    frecuenciaInformes: 'nunca'
  })
  
  const { loading: authLoading } = useGuestGuard()
  const { register } = useAuth()

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
      pais: formData.pais || 'CO',
      countryCode: formData.countryCode || 'CO',
      phoneNumber: formData.phoneNumber || '',
      moneda: formData.moneda || 'COP',
    }
  })
    const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      frecuenciaRecordatorios: formData.frecuenciaRecordatorios || 'nunca',
      frecuenciaInformes: formData.frecuenciaInformes || 'nunca',
    }
  })

  const step4Form = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
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
    } else if (currentStep === 3) {
      isValid = await step3Form.trigger()
      if (isValid) {
        const data = step3Form.getValues()
        setFormData(prev => ({ ...prev, ...data }))
      }
    }
    
    if (isValid && currentStep < 4) {
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
   * Manejar cierre del modal de bienvenida
   */
  const handleWelcomeModalClose = () => {
    setShowWelcomeModal(false)
    // Redirigir al dashboard después de cerrar el modal
    //window.location.href = '/dashboard'
    // Redirigir al whatsapp después de cerrar el modal
    window.location.href = "https://wa.me/573143400476?text=✅%20Hola,%20ya%20active%20mi%20cuenta";
  }

  /**
   * Enviar formulario final
   */
  const handleSubmit = async () => {
    const isStep4Valid = await step4Form.trigger()
    if (!isStep4Valid) return

    const step4Data = step4Form.getValues()
    const finalData = { ...formData, ...step4Data }

    try {
      setIsLoading(true)
      
      // Construir el número completo de WhatsApp
      const selectedCountry = COUNTRY.find(c => c.code === finalData.countryCode)
      const fullPhoneNumber = `${selectedCountry?.dialCode}${finalData.phoneNumber}`
      
      // Preparar datos para el API
      const registerData = {
        nombreCompleto: finalData.nombreCompleto!,
        email: finalData.email!,
        numeroWhatsapp: fullPhoneNumber,
        password: finalData.password!,
        confirmPassword: finalData.confirmPassword!,
        pais: finalData.pais!,
        moneda: finalData.moneda!,
        planSeleccionado: finalData.selectedPlan!,
        frecuenciaRecordatorios: finalData.frecuenciaRecordatorios!,
        frecuenciaInformes: finalData.frecuenciaInformes!,
      }
      
      await register(registerData)
      // Mostrar modal de bienvenida en lugar de redirigir inmediatamente
      setRegisteredUserName(finalData.nombreCompleto!)
      setShowWelcomeModal(true)
    } catch (error) {
      // El error se maneja en el hook useAuth
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
    { number: 3, title: 'Preferencias de Notificación', icon: Bell, completed: currentStep > 3 },
    { number: 4, title: 'Plan de Suscripción', icon: CreditCard, completed: false },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 px-2">
          <Link
            href="/"
            className="inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-primary mb-3 sm:mb-4"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Volver al inicio
          </Link>
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <Image
              src="/logo-mony.png"
              alt="Mony Logo"
              width={120}
              height={40}
              className="h-8 sm:h-10 w-auto"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">Crear tu cuenta</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed">
            Configura tu perfil financiero en solo 4 pasos
          </p>
        </div>

        {/* Indicador de pasos */}
        <div className="flex justify-center mb-6 md:mb-8 px-2">
          <div className="flex items-center justify-center space-x-1 sm:space-x-2 md:space-x-4 w-full max-w-3xl">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.number
              const isCompleted = step.completed
              
              return (
                <div key={step.number} className="flex items-center flex-1 min-w-0">
                  <div className={`flex flex-col items-center space-y-1 sm:space-y-2 flex-1 ${
                    isActive ? 'text-primary' : isCompleted ? 'text-green-500' : 'text-muted-foreground'
                  }`}>
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isActive 
                        ? 'border-primary bg-primary text-primary-foreground' 
                        : isCompleted 
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-muted-foreground'
                    }`}>
                      {isCompleted ? (
                        <Check className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                      ) : (
                        <Icon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                      )}
                    </div>
                    <div className="text-center">
                      <div className={`text-xs sm:text-sm font-medium leading-tight ${
                        isActive ? 'text-primary' : isCompleted ? 'text-green-500' : 'text-muted-foreground'
                      }`}>
                        <span className="hidden sm:inline">{step.title}</span>
                        <span className="sm:hidden">Paso {step.number}</span>
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 sm:mx-2 ${
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
          <CardHeader className="text-center px-4 sm:px-6">
            <h2 className="text-lg sm:text-xl font-semibold">
              {currentStep === 1 && 'Información Personal'}
              {currentStep === 2 && 'Configuración Regional'}
              {currentStep === 3 && 'Preferencias de Notificación'}
              {currentStep === 4 && 'Plan de Suscripción'}
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              {currentStep === 1 && 'Ingresa tus datos básicos para crear tu cuenta'}
              {currentStep === 2 && 'Selecciona tu país para configurar automáticamente tu moneda y código telefónico'}
              {currentStep === 3 && 'Aquí puedes elegir cada cuánto tiempo Mony te enviará recordatorios para registrar tus gastos y la frecuencia con la que recibirás informes de análisis financiero y reportes personalizados.'}
              {currentStep === 4 && 'Selecciona el plan que mejor se adapte a tus necesidades'}
            </p>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
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
                    className={`w-full ${step1Form.formState.errors.nombreCompleto ? 'border-destructive' : ''}`}
                  />
                  {step1Form.formState.errors.nombreCompleto && (
                    <p className="text-xs sm:text-sm text-destructive">
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
                    className={`w-full ${step1Form.formState.errors.email ? 'border-destructive' : ''}`}
                  />
                  {step1Form.formState.errors.email && (
                    <p className="text-xs sm:text-sm text-destructive">{step1Form.formState.errors.email.message}</p>
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
                      className={`w-full pr-10 ${step1Form.formState.errors.password ? 'border-destructive' : ''}`}
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
                    <p className="text-xs sm:text-sm text-destructive">{step1Form.formState.errors.password.message}</p>
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
                      className={`w-full pr-10 ${step1Form.formState.errors.confirmPassword ? 'border-destructive' : ''}`}
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
                    <p className="text-xs sm:text-sm text-destructive">
                      {step1Form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </form>
            )}

            {/* Paso 2: Configuración Regional */}
            {currentStep === 2 && (
              <form className="space-y-6">


                <div className="space-y-4">
                  {/* Selector de país y teléfono */}
                  <CountryPhoneInput
                    selectedCountry={step2Form.watch('countryCode')}
                    phoneNumber={step2Form.watch('phoneNumber')}
                    onCountryChange={(countryCode) => {
                      step2Form.setValue('countryCode', countryCode)
                      step2Form.setValue('pais', countryCode)
                      // Buscar el país y actualizar la moneda automáticamente
                      const country = COUNTRY.find(c => c.code === countryCode)
                      if (country) {
                        step2Form.setValue('moneda', country.currency)
                      }
                    }}
                    onPhoneChange={(phoneNumber) => {
                      step2Form.setValue('phoneNumber', phoneNumber)
                    }}
                    error={step2Form.formState.errors.phoneNumber?.message || step2Form.formState.errors.countryCode?.message}
                  />

                  {/* Selector de moneda */}
                  <div className="space-y-2">
                    <Label htmlFor="moneda">Moneda preferida</Label>
                    <Select
                      value={step2Form.watch('moneda')}
                      onValueChange={(value) => step2Form.setValue('moneda', value)}
                    >
                      <SelectTrigger className={`w-full ${step2Form.formState.errors.moneda ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder="Selecciona tu moneda" />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{currency.symbol}</span>
                              <span className="text-xs sm:text-sm">{currency.name}</span>
                              <span className="text-muted-foreground text-xs">({currency.code})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {step2Form.formState.errors.moneda && (
                      <p className="text-xs sm:text-sm text-destructive">
                        {step2Form.formState.errors.moneda.message}
                      </p>
                    )}
                    
                    {/* Información adicional sobre la moneda */}
                    {step2Form.watch('moneda') && (
                      <div className="mt-2 p-2 sm:p-3 bg-muted/50 rounded-md">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          💡 <strong>Tip:</strong> Todas tus transacciones se registrarán en {CURRENCIES.find(c => c.code === step2Form.watch('moneda'))?.name}.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            )}


            {/* Paso 3: Preferencias de Notificación */}
            {currentStep === 3 && (
              <form className="space-y-6">


                <div className="space-y-4">
                  <div>
                    <Label htmlFor="frecuenciaRecordatorios">Recordatorios de gastos</Label>
                    <Select
                      value={step3Form.watch('frecuenciaRecordatorios')}
                      onValueChange={(value) => step3Form.setValue('frecuenciaRecordatorios', value as any)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona la frecuencia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nunca">Nunca</SelectItem>
                        <SelectItem value="diario">Diario</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="mensual">Mensual</SelectItem>
                      </SelectContent>
                    </Select>
                    {step3Form.formState.errors.frecuenciaRecordatorios && (
                      <p className="text-xs sm:text-sm text-destructive">
                        {step3Form.formState.errors.frecuenciaRecordatorios.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="frecuenciaInformes">Informes financieros</Label>
                    <Select
                      value={step3Form.watch('frecuenciaInformes')}
                      onValueChange={(value) => step3Form.setValue('frecuenciaInformes', value as any)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona la frecuencia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nunca">Nunca</SelectItem>
                        <SelectItem value="diario">Diario</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="mensual">Mensual</SelectItem>
                      </SelectContent>
                    </Select>
                    {step3Form.formState.errors.frecuenciaInformes && (
                      <p className="text-xs sm:text-sm text-destructive">
                        {step3Form.formState.errors.frecuenciaInformes.message}
                      </p>
                    )}
                  </div>
                </div>
              </form>
            )}
            {/* Paso 4: Plan de Suscripción */}
            {currentStep === 4 && (
              <div className="space-y-6">

                <SubscriptionPlans
                  selectedPlan={step4Form.watch('selectedPlan')}
                  onPlanSelect={(planId) => step4Form.setValue('selectedPlan', planId)}
                />
                {step4Form.formState.errors.selectedPlan && (
                  <p className="text-xs sm:text-sm text-destructive text-center">
                    {step4Form.formState.errors.selectedPlan.message}
                  </p>
                )}
              </div>
            )}

            {/* Botones de navegación */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className={`w-full sm:w-auto order-2 sm:order-1 ${currentStep === 1 ? 'invisible' : ''}`}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

              {currentStep < 4 ? (
                <Button type="button" onClick={handleNextStep} className="w-full sm:w-auto order-1 sm:order-2">
                  Siguiente
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit} disabled={isLoading} className="w-full sm:w-auto order-1 sm:order-2">
                  {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                </Button>
              )}
            </div>

            {/* Link a login */}
            <div className="text-center mt-6 sm:mt-8 px-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                ¿Ya tienes una cuenta?{' '}
                <Link href="/auth/login" className="text-primary hover:underline font-medium">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de bienvenida */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleWelcomeModalClose}
        userName={registeredUserName}
      />
    </div>
  )
}