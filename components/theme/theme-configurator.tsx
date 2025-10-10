'use client'

import { useState } from 'react'
import { Monitor, Moon, Sun, Palette, Check, Copy, Droplets, Leaf } from 'lucide-react'
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
    currentTheme, 
    toggleLightDark, 
    changePalette,
    getCurrentPalette,
    isDark, 
    isThemeLoaded
  } = useThemeConfig()
  
  const { toast } = useToast()
  const [copiedColors, setCopiedColors] = useState<string | null>(null)

  const currentPalette = getCurrentPalette()

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

  const handlePaletteToggle = () => {
    const newPalette = currentPalette === 'blue' ? 'green' : 'blue'
    changePalette(newPalette)
    toast({
      title: 'Paleta cambiada',
      description: `Ahora usando la paleta ${newPalette === 'blue' ? 'azul' : 'verde'}`,
      duration: 2000
    })
  }

  const handleModeToggle = () => {
    toggleLightDark()
    toast({
      title: 'Modo cambiado',
      description: `Cambiado a modo ${isDark() ? 'oscuro' : 'claro'}`,
      duration: 2000
    })
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
          Apariencia
        </CardTitle>
        <CardDescription>
          Personaliza los colores y el modo de visualización
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Vista previa del tema actual */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Tema actual</h4>
            <div className="flex gap-2">
              <Badge variant={isDark() ? 'secondary' : 'default'} className="text-xs">
                {isDark() ? 'Oscuro' : 'Claro'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {currentPalette === 'blue' ? 'Azul' : 'Verde'}
              </Badge>
            </div>
          </div>
          
          {currentTheme && (
            <div className="space-y-3">
              {/* Vista previa de colores principales */}
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-2">
                  <div 
                    className="h-12 w-full rounded-lg border-2 border-border shadow-sm"
                    style={{ backgroundColor: `hsl(${currentTheme.colors.primary})` }}
                  />
                  <div className="text-xs text-center text-muted-foreground">Principal</div>
                </div>
                <div className="space-y-2">
                  <div 
                    className="h-12 w-full rounded-lg border-2 border-border shadow-sm"
                    style={{ backgroundColor: `hsl(${currentTheme.colors.secondary})` }}
                  />
                  <div className="text-xs text-center text-muted-foreground">Secundario</div>
                </div>
                <div className="space-y-2">
                  <div 
                    className="h-12 w-full rounded-lg border-2 border-border shadow-sm"
                    style={{ backgroundColor: `hsl(${currentTheme.colors.accent})` }}
                  />
                  <div className="text-xs text-center text-muted-foreground">Acento</div>
                </div>
                <div className="space-y-2">
                  <div 
                    className="h-12 w-full rounded-lg border-2 border-border shadow-sm"
                    style={{ backgroundColor: `hsl(${currentTheme.colors.muted})` }}
                  />
                  <div className="text-xs text-center text-muted-foreground">Silenciado</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Controles principales */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Personalización</h4>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Toggle de modo claro/oscuro */}
            <Button
              variant="outline"
              size="lg"
              onClick={handleModeToggle}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              {isDark() ? (
                <>
                  <Sun className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Modo oscuro</div>
                    <div className="text-xs text-muted-foreground">Cambiar a claro</div>
                  </div>
                </>
              ) : (
                <>
                  <Moon className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Modo claro</div>
                    <div className="text-xs text-muted-foreground">Cambiar a oscuro</div>
                  </div>
                </>
              )}
            </Button>

            {/* Toggle de paleta de colores */}
            <Button
              variant="outline"
              size="lg"
              onClick={handlePaletteToggle}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              {currentPalette === 'blue' ? (
                <>
                  <div className="flex items-center gap-2">
                    <Leaf className="h-6 w-6" />
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: 'hsl(142, 76%, 36%)' }}
                    />
                  </div>
                  <div className="text-center">
                    <div className="font-medium">Paleta azul</div>
                    <div className="text-xs text-muted-foreground">Cambiar a verde</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Droplets className="h-6 w-6" />
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: 'hsl(217, 91%, 60%)' }}
                    />
                  </div>
                  <div className="text-center">
                    <div className="font-medium">Paleta verde</div>
                    <div className="text-xs text-muted-foreground">Cambiar a azul</div>
                  </div>
                </>
              )}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Acción adicional */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Herramientas</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={copyThemeColors}
            className="w-full"
            disabled={copiedColors === currentTheme?.name}
          >
            {copiedColors === currentTheme?.name ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Colores copiados
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copiar colores del tema
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ThemeConfigurator