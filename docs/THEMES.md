# Sistema de Temas de Mony

Este documento describe el sistema de temas mejorado de Mony, diseñado para ser fácilmente editable y extensible.

## 🎨 Características

- **Temas sólidos**: Sin transparencias no deseadas
- **Fácil edición**: Configuración centralizada en archivos TypeScript
- **Extensible**: Fácil agregar nuevos temas
- **Type-safe**: Completamente tipado con TypeScript
- **Hook personalizado**: `useThemeConfig` para manejo avanzado
- **Componente configurador**: UI intuitiva para cambiar temas

## 📁 Estructura de archivos

```
frontend/
├── lib/
│   └── themes.ts                    # Configuración de temas
├── hooks/
│   └── use-theme-config.ts         # Hook personalizado
├── components/
│   └── theme/
│       └── theme-configurator.tsx  # Componente configurador
└── docs/
    └── THEMES.md                   # Esta documentación
```

## 🛠️ Cómo editar temas

### 1. Modificar colores existentes

Edita el archivo `lib/themes.ts`:

```typescript
export const lightTheme: Theme = {
  name: 'light',
  displayName: 'Claro',
  colors: {
    primary: '221.2 83.2% 53.3%',     // Cambia este valor
    secondary: '210 40% 96%',          // O este
    // ... otros colores
  }
}
```

### 2. Agregar un nuevo tema

```typescript
// En lib/themes.ts
export const customTheme: Theme = {
  name: 'custom',
  displayName: 'Mi Tema Personalizado',
  colors: {
    background: '240 10% 3.9%',
    foreground: '0 0% 98%',
    // ... define todos los colores requeridos
  }
}

// Agregar a la lista de temas
export const themes: Theme[] = [lightTheme, darkTheme, customTheme]
```

### 3. Usar el hook en componentes

```typescript
import { useThemeConfig } from '@/hooks/use-theme-config'

function MyComponent() {
  const { 
    theme, 
    changeTheme, 
    isDark, 
    getThemeColors 
  } = useThemeConfig()

  return {
    <div>
      <p>Tema actual: {theme}</p>
      <button onClick={() => changeTheme('dark')}>
        Cambiar a oscuro
      </button>
    </div>
}
```

## 🎯 Colores del tema

Cada tema debe definir estos colores:

| Color | Descripción |
|-------|-------------|
| `background` | Fondo principal de la aplicación |
| `foreground` | Texto principal |
| `card` | Fondo de tarjetas y componentes |
| `cardForeground` | Texto en tarjetas |
| `popover` | Fondo de popovers y dropdowns |
| `popoverForeground` | Texto en popovers |
| `primary` | Color primario de la marca |
| `primaryForeground` | Texto en elementos primarios |
| `secondary` | Color secundario |
| `secondaryForeground` | Texto en elementos secundarios |
| `muted` | Color apagado para fondos sutiles |
| `mutedForeground` | Texto apagado |
| `accent` | Color de acento |
| `accentForeground` | Texto en elementos de acento |
| `destructive` | Color para acciones destructivas |
| `destructiveForeground` | Texto en elementos destructivos |
| `border` | Color de bordes |
| `input` | Fondo de inputs |
| `ring` | Color de focus ring |

## 🔧 Formato de colores

Los colores se definen en formato HSL sin la función `hsl()`:

```typescript
// ✅ Correcto
primary: '221.2 83.2% 53.3%'

// ❌ Incorrecto
primary: 'hsl(221.2, 83.2%, 53.3%)'
primary: '#3b82f6'
```

## 🚀 Uso del componente configurador

```typescript
import { ThemeConfigurator } from '@/components/theme/theme-configurator'

function SettingsPage() {
  return (
    <div>
      <h1>Configuración</h1>
      <ThemeConfigurator />
    </div>
  )
}
```

## 📱 Características del sistema

### Prevención de transparencias

- Fondos sólidos para todos los componentes
- Overlays con opacidad controlada
- Variables CSS optimizadas para mejor contraste

### Responsive y accesible

- Funciona en todos los tamaños de pantalla
- Cumple con estándares de accesibilidad
- Contraste adecuado en todos los temas

### Performance

- Cambios de tema instantáneos
- Sin re-renders innecesarios
- Carga lazy de configuraciones

## 🐛 Solución de problemas

### El tema no se aplica correctamente

1. Verifica que el tema esté en la lista `themes`
2. Asegúrate de que todos los colores estén definidos
3. Revisa que el formato HSL sea correcto

### Transparencias no deseadas

1. Usa `bg-card` en lugar de `bg-background` para fondos sólidos
2. Verifica que las variables CSS estén bien definidas
3. Evita usar `backdrop-blur` sin fondos sólidos

### Problemas de hidratación

El hook `useThemeConfig` maneja automáticamente la hidratación:

```typescript
const { mounted, isThemeLoaded } = useThemeConfig()

if (!isThemeLoaded()) {
  return <LoadingSpinner />
}
```

## 🎨 Mejores prácticas

1. **Consistencia**: Usa siempre las variables CSS definidas
2. **Contraste**: Asegúrate de que el contraste sea adecuado
3. **Testing**: Prueba todos los temas en diferentes componentes
4. **Documentación**: Documenta cualquier tema personalizado

## 🔄 Migración desde el sistema anterior

Si tienes componentes usando el sistema anterior:

```typescript
// Antes
import { useTheme } from 'next-themes'

// Después
import { useThemeConfig } from '@/hooks/use-theme-config'

// El hook incluye todas las funcionalidades de next-themes y más
```

## 📞 Soporte

Para problemas o preguntas sobre el sistema de temas:

1. Revisa esta documentación
2. Verifica los ejemplos en `components/theme/`
3. Consulta el código en `lib/themes.ts`

---

**Nota**: Este sistema está diseñado para ser fácilmente extensible. Si necesitas funcionalidades adicionales, puedes extender los tipos e interfaces en `lib/themes.ts`.