'use client'

import { useState } from 'react'
import { Monitor, Moon, Sun, Palette, Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useThemeConfig } from '@/hooks/use-theme-config'
import { cn } from '@/lib/utils'

interface ThemeConfiguratorProps {
  className?: string
}

export function ThemeConfigurator({ className }: ThemeConfiguratorProps) {
  const { 
    theme, 
    currentTheme, 
    changeTheme, 
    toggleTheme, 
    isDark, 
    getAvailableThemes, 
    isThemeLoaded,
    getCurrentThemeName 
  } = useThemeConfig()
  
  const { toast } = useToast()
  const [copiedColors, setCopiedColors] = useState<string | null>(null)

  const themes = getAvailableThemes()
  const currentThemeName = getCurrentThemeName()

  const themeOptions = [
    {
      name: 'light',
      label: 'Claro',
      icon: Sun,
      description: 'Tema claro y limpio'
    },
    {
      name: 'dark',
      label: 'Oscuro',
      icon: Moon,
      description: 'Tema oscuro para mejor experiencia nocturna'
    },
    {
      name: 'system',
      label: 'Sistema',
      icon: Monitor,
      description: 'Sigue la configuración del sistema'
    }
  ]

  const handleThemeChange = (themeName: string) => {
    changeTheme(themeName)
    toast({
      title: 'Tema cambiado',
      description: `Se ha aplicado el tema ${themeOptions.find(t => t.name === themeName)?.label}`,
      duration: 2000
    })
  }

  const copyThemeColors = async () => {
    if (!currentTheme) return

    const colorsText = JSON.stringify(currentTheme.colors, null, 2)
    
    try {
      await navigator.clipboard.writeText(colorsText)
      setCopiedColors(currentTheme.name)
      toast({
        title: 'Colores copiados',
        description: 'Los colores del tema han sido copiados al portapapeles',
        duration: 2000
      })
      
      setTimeout(() => setCopiedColors(null), 2000)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron copiar los colores',
        variant: 'destructive',
        duration: 2000
      })
    }
  }

  if (!isThemeLoaded()) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Configuración de Temas
        </CardTitle>
        <CardDescription>
          Personaliza la apariencia de la aplicación según tus preferencias
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Selector de temas */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Seleccionar tema</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {themeOptions.map((option) => {
              const Icon = option.icon
              const isActive = theme === option.name
              
              return (
                <Button
                  key={option.name}
                  variant={isActive ? 'default' : 'outline'}
                  className={cn(
                    'h-auto p-4 flex flex-col items-center gap-2 text-center',
                    isActive && 'ring-2 ring-primary ring-offset-2'
                  )}
                  onClick={() => handleThemeChange(option.name)}
                >
                  <Icon className="h-5 w-5" />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                  {isActive && (
                    <Check className="h-4 w-4 absolute top-2 right-2" />
                  )}
                </Button>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* Información del tema actual */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Tema actual</h4>
            <Badge variant={isDark() ? 'secondary' : 'default'}>
              {currentTheme?.displayName || 'Desconocido'}
            </Badge>
          </div>
          
          {currentTheme && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Tema activo: <span className="font-medium">{currentTheme.displayName}</span>
              </div>
              
              {/* Vista previa de colores */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Colores principales</div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <div 
                      className="h-8 w-full rounded border"
                      style={{ backgroundColor: `hsl(${currentTheme.colors.primary})` }}
                    />
                    <div className="text-xs text-center">Primary</div>
                  </div>
                  <div className="space-y-1">
                    <div 
                      className="h-8 w-full rounded border"
                      style={{ backgroundColor: `hsl(${currentTheme.colors.secondary})` }}
                    />
                    <div className="text-xs text-center">Secondary</div>
                  </div>
                  <div className="space-y-1">
                    <div 
                      className="h-8 w-full rounded border"
                      style={{ backgroundColor: `hsl(${currentTheme.colors.accent})` }}
                    />
                    <div className="text-xs text-center">Accent</div>
                  </div>
                  <div className="space-y-1">
                    <div 
                      className="h-8 w-full rounded border"
                      style={{ backgroundColor: `hsl(${currentTheme.colors.muted})` }}
                    />
                    <div className="text-xs text-center">Muted</div>
                  </div>
                </div>
              </div>

              {/* Botón para copiar colores */}
              <Button
                variant="outline"
                size="sm"
                onClick={copyThemeColors}
                className="w-full"
                disabled={copiedColors === currentTheme.name}
              >
                {copiedColors === currentTheme.name ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar colores del tema
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {/* Acciones rápidas */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Acciones rápidas</h4>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="flex-1"
            >
              {isDark() ? (
                <>
                  <Sun className="h-4 w-4 mr-2" />
                  Cambiar a claro
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 mr-2" />
                  Cambiar a oscuro
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ThemeConfigurator