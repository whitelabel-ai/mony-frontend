# Mony Frontend

## Descripción

Mony Frontend es una aplicación web moderna construida con Next.js 14 que proporciona una interfaz intuitiva y elegante para la gestión financiera personal. Incluye un sistema de registro por pasos, dashboard interactivo y gestión completa de suscripciones.

## Características Principales

### 🎨 Interfaz Moderna
- Diseño responsive y elegante
- Tema claro/oscuro con next-themes
- Componentes reutilizables con shadcn/ui
- Animaciones suaves y transiciones

### 📝 Registro Inteligente por Pasos
- **Paso 1**: Información personal (nombre, email, contraseña)
- **Paso 2**: Configuración regional (país, WhatsApp, moneda)
- **Paso 3**: Selección de plan de suscripción
- Validación en tiempo real con Zod
- Navegación fluida entre pasos

### 💳 Sistema de Suscripciones
- Visualización clara de planes disponibles
- Comparación de características
- Proceso de suscripción integrado
- Gestión de estado de suscripción

### 🌍 Soporte Internacional
- Selector de país con códigos de área
- Múltiples monedas soportadas
- Interfaz adaptable a diferentes regiones

## Tecnologías Utilizadas

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Componentes**: shadcn/ui + Radix UI
- **Formularios**: React Hook Form + Zod
- **Estado**: React Hooks
- **HTTP**: Axios
- **Iconos**: Lucide React
- **Notificaciones**: React Hot Toast

## Estructura del Proyecto

```
app/
├── auth/
│   ├── login/           # Página de inicio de sesión
│   └── register/        # Página de registro por pasos
├── dashboard/           # Dashboard principal
├── globals.css          # Estilos globales
├── layout.tsx           # Layout principal
└── page.tsx             # Página de inicio

components/
├── providers/           # Providers de contexto
└── ui/                  # Componentes de UI reutilizables
    ├── badge.tsx
    ├── button.tsx
    ├── card.tsx
    ├── command.tsx
    ├── country-phone-input.tsx
    ├── dialog.tsx
    ├── input.tsx
    ├── label.tsx
    ├── popover.tsx
    ├── select.tsx
    └── subscription-plans.tsx

hooks/
├── use-auth.ts          # Hook de autenticación
└── index.ts             # Exportaciones de hooks

lib/
├── api.ts               # Configuración de API
└── utils.ts             # Utilidades y helpers

types/
└── index.ts             # Definiciones de tipos TypeScript
```

## Instalación y Configuración

### Prerrequisitos

- Node.js (v18 o superior)
- npm o yarn
- Backend de Mony ejecutándose

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd mony/frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Editar el archivo `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_APP_NAME=Mony
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## Componentes Principales

### CountryPhoneInput
Componente para selección de país y entrada de número de teléfono.

```typescript
<CountryPhoneInput
  value={phoneNumber}
  onChange={setPhoneNumber}
  countryCode={countryCode}
  onCountryChange={setCountryCode}
/>
```

### SubscriptionPlans
Componente para mostrar y seleccionar planes de suscripción.

```typescript
<SubscriptionPlans
  selectedPlan={selectedPlan}
  onPlanSelect={setSelectedPlan}
/>
```

### Formularios con Validación
Todos los formularios utilizan React Hook Form con validación Zod.

```typescript
const form = useForm<RegisterFormData>({
  resolver: zodResolver(registerSchema),
  mode: 'onChange'
});
```

## Tipos y Interfaces

### Monedas Soportadas
```typescript
interface Currency {
  code: string;
  name: string;
  symbol: string;
}

// COP, USD, EUR, MXN, ARS, PEN, CLP, BRL, UYU, BOB
```

### Códigos de País
```typescript
interface CountryCode {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}
```

### Planes de Suscripción
```typescript
interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
  limitations: string[];
  popular?: boolean;
}
```

## Flujo de Registro

### Paso 1: Información Personal
- Nombre completo
- Email (con validación)
- Contraseña (con confirmación)
- Validación en tiempo real

### Paso 2: Configuración Regional
- Selección de país
- Número de WhatsApp con código de área
- Moneda por defecto
- Validación de formato de teléfono

### Paso 3: Plan de Suscripción
- Visualización de planes disponibles
- Comparación de características
- Selección de plan
- Confirmación final

## Gestión de Estado

### Autenticación
```typescript
const { user, login, logout, isLoading } = useAuth();
```

### Formularios Multi-Paso
```typescript
const [currentStep, setCurrentStep] = useState<RegisterStep>('personal');
const [formData, setFormData] = useState<RegisterStepData>({});
```

## API Integration

### Configuración Base
```typescript
// lib/api.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Endpoints Principales
```typescript
// Autenticación
POST /auth/register
POST /auth/login

// Suscripciones
GET /subscriptions/plans
POST /subscriptions
GET /subscriptions/active
```

## Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia el servidor de desarrollo
npm run build            # Construye la aplicación para producción
npm run start            # Inicia el servidor de producción
npm run lint             # Ejecuta ESLint
npm run type-check       # Verifica tipos TypeScript

# Utilidades
npm run analyze          # Analiza el bundle (si está configurado)
```

## Estilos y Temas

### Tailwind CSS
Configuración personalizada con variables CSS para temas.

```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... más variables */
}
```

### Tema Oscuro
Soporte completo para tema oscuro con next-themes.

```typescript
<ThemeProvider attribute="class" defaultTheme="system">
  {children}
</ThemeProvider>
```

## Responsive Design

- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: sm, md, lg, xl, 2xl
- **Componentes Adaptativos**: Se ajustan automáticamente
- **Touch Friendly**: Elementos táctiles optimizados

## Optimizaciones

### Performance
- ✅ Code splitting automático con Next.js
- ✅ Lazy loading de componentes
- ✅ Optimización de imágenes
- ✅ Prefetch de rutas

### SEO
- ✅ Metadata optimizada
- ✅ Open Graph tags
- ✅ Structured data
- ✅ Sitemap automático

### Accesibilidad
- ✅ Componentes accesibles con Radix UI
- ✅ Navegación por teclado
- ✅ Screen reader friendly
- ✅ Contraste de colores WCAG

## Validación de Formularios

### Esquemas Zod
```typescript
const personalInfoSchema = z.object({
  nombreCompleto: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});
```

### Validación en Tiempo Real
- Validación mientras el usuario escribe
- Mensajes de error contextuales
- Indicadores visuales de estado
- Prevención de envío con errores

## Testing

### Configuración Recomendada
```bash
# Instalar dependencias de testing
npm install -D @testing-library/react @testing-library/jest-dom jest
```

### Estructura de Tests
```
__tests__/
├── components/
├── pages/
└── utils/
```

## Deployment

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Variables de Entorno en Producción
```env
NEXT_PUBLIC_API_URL=https://api.mony.app
NEXT_PUBLIC_APP_NAME=Mony
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Build Optimizado
```bash
npm run build
npm run start
```

## Desarrollo

### Agregar un Nuevo Componente

1. **Crear el componente**
   ```bash
   # components/ui/nuevo-componente.tsx
   ```

2. **Exportar en el índice**
   ```typescript
   // components/ui/index.ts
   export * from './nuevo-componente';
   ```

3. **Agregar tipos si es necesario**
   ```typescript
   // types/index.ts
   export interface NuevoComponenteProps {
     // propiedades
   }
   ```

### Agregar una Nueva Página

1. **Crear el directorio y archivo**
   ```bash
   mkdir app/nueva-pagina
   touch app/nueva-pagina/page.tsx
   ```

2. **Implementar la página**
   ```typescript
   export default function NuevaPagina() {
     return <div>Nueva Página</div>;
   }
   ```

## Mejores Prácticas

### Componentes
- ✅ Usar TypeScript para todas las props
- ✅ Implementar forwardRef cuando sea necesario
- ✅ Usar memo para componentes pesados
- ✅ Separar lógica de presentación

### Estado
- ✅ Usar useState para estado local
- ✅ Usar useEffect con dependencias correctas
- ✅ Implementar cleanup en efectos
- ✅ Evitar prop drilling excesivo

### Estilos
- ✅ Usar clases de Tailwind
- ✅ Crear componentes reutilizables
- ✅ Mantener consistencia visual
- ✅ Optimizar para diferentes dispositivos

## Troubleshooting

### Problemas Comunes

**Error de hidratación**
```typescript
// Usar dynamic import para componentes que dependen del cliente
import dynamic from 'next/dynamic';

const ComponenteCliente = dynamic(() => import('./ComponenteCliente'), {
  ssr: false
});
```

**Problemas de CORS**
```typescript
// Verificar configuración del backend
// Asegurar que NEXT_PUBLIC_API_URL sea correcta
```

**Errores de TypeScript**
```bash
# Verificar tipos
npm run type-check

# Limpiar cache
rm -rf .next
npm run dev
```

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -am 'Agrega nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

### Convenciones de Código

- Usar TypeScript para todo el código
- Seguir las reglas de ESLint configuradas
- Usar Prettier para formateo automático
- Escribir tests para componentes críticos
- Documentar componentes complejos

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Para soporte técnico o preguntas:
- 📧 Email: soporte@mony.app
- 📱 WhatsApp: +57 XXX XXX XXXX
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/mony/issues)
- 📖 Documentación: [Docs](https://docs.mony.app)

---

**Mony Frontend** - Desarrollado con ❤️ usando Next.js 14