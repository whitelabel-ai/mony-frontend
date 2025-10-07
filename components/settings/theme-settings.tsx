'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun, Bell, Globe, Check, Loader2, AlertCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'react-hot-toast'

interface ThemeSettingsProps {
  onSettingsUpdate?: () => void
}

interface NotificationSettings {
  desktop: boolean
  email: boolean
  push: boolean
}

interface SettingState {
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
}

export function ThemeSettings({ onSettingsUpdate }: ThemeSettingsProps) {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState({
    notifications: {
      desktop: true,
      email: true,
      push: false,
    } as NotificationSettings,
    language: 'es',
  })

  const [settingStates, setSettingStates] = useState<Record<string, SettingState>>({
    theme: { isLoading: false, isSuccess: false, isError: false },
    desktop: { isLoading: false, isSuccess: false, isError: false },
    email: { isLoading: false, isSuccess: false, isError: false },
    push: { isLoading: false, isSuccess: false, isError: false },
    language: { isLoading: false, isSuccess: false, isError: false },
  })

  const updateSettingState = (settingName: string, state: Partial<SettingState>) => {
    setSettingStates(prev => ({
      ...prev,
      [settingName]: { ...prev[settingName], ...state }
    }))
  }

  const clearSettingState = (settingName: string) => {
    setTimeout(() => {
      updateSettingState(settingName, { isSuccess: false, isError: false })
    }, 2000)
  }

  const saveSettingToBackend = async (settingName: string, value: any) => {
    updateSettingState(settingName, { isLoading: true, isError: false, isSuccess: false })
    
    try {
      // Simular llamada al backend - aquí iría la lógica real
      await new Promise(resolve => setTimeout(resolve, 500))
      
      updateSettingState(settingName, { isLoading: false, isSuccess: true })
      clearSettingState(settingName)
      
      const settingLabels: Record<string, string> = {
        theme: 'Tema',
        desktop: 'Notificaciones de escritorio',
        email: 'Notificaciones por email',
        push: 'Notificaciones push',
        language: 'Idioma'
      }
      
      toast.success(`${settingLabels[settingName]} actualizado`, {
        duration: 2000,
        style: { fontSize: '14px' }
      })
      
      onSettingsUpdate?.()
    } catch (error) {
      updateSettingState(settingName, { isLoading: false, isError: true })
      clearSettingState(settingName)
      toast.error(`Error al actualizar configuración`)
    }
  }

  const getSettingIcon = (settingName: string) => {
    const state = settingStates[settingName]
    if (state.isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
    }
    if (state.isSuccess) {
      return <Check className="h-4 w-4 text-green-500" />
    }
    if (state.isError) {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    return null
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    saveSettingToBackend('theme', newTheme)
  }

  const handleNotificationChange = (type: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value
      }
    }))
    saveSettingToBackend(type, value)
  }

  const handleLanguageChange = (language: string) => {
    setSettings(prev => ({
      ...prev,
      language
    }))
    saveSettingToBackend('language', language)
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground mb-4">
        💡 Los cambios se guardan automáticamente
      </div>

      {/* Tema */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Apariencia</h3>
          {getSettingIcon('theme')}
        </div>
        <div className="space-y-3">
          <Label>Tema de la aplicación</Label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleThemeChange('light')}
              disabled={settingStates.theme.isLoading}
              className={`flex flex-col items-center gap-2 h-auto py-3 px-4 rounded-md border transition-colors ${
                theme === 'light' 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-background hover:bg-accent border-border'
              } ${settingStates.theme.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Sun className="h-4 w-4" />
              <span className="text-sm">Claro</span>
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              disabled={settingStates.theme.isLoading}
              className={`flex flex-col items-center gap-2 h-auto py-3 px-4 rounded-md border transition-colors ${
                theme === 'dark' 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-background hover:bg-accent border-border'
              } ${settingStates.theme.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Moon className="h-4 w-4" />
              <span className="text-sm">Oscuro</span>
            </button>
            <button
              onClick={() => handleThemeChange('system')}
              disabled={settingStates.theme.isLoading}
              className={`flex flex-col items-center gap-2 h-auto py-3 px-4 rounded-md border transition-colors ${
                theme === 'system' 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-background hover:bg-accent border-border'
              } ${settingStates.theme.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Monitor className="h-4 w-4" />
              <span className="text-sm">Sistema</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notificaciones */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notificaciones</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center gap-2">
                <Label>Notificaciones de escritorio</Label>
                {getSettingIcon('desktop')}
              </div>
              <p className="text-sm text-muted-foreground">
                Recibe notificaciones en tu escritorio
              </p>
            </div>
            <Switch
              checked={settings.notifications.desktop}
              onCheckedChange={(checked) => handleNotificationChange('desktop', checked)}
              disabled={settingStates.desktop.isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center gap-2">
                <Label>Notificaciones por email</Label>
                {getSettingIcon('email')}
              </div>
              <p className="text-sm text-muted-foreground">
                Recibe resúmenes y alertas por correo
              </p>
            </div>
            <Switch
              checked={settings.notifications.email}
              onCheckedChange={(checked) => handleNotificationChange('email', checked)}
              disabled={settingStates.email.isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center gap-2">
                <Label>Notificaciones push</Label>
                {getSettingIcon('push')}
              </div>
              <p className="text-sm text-muted-foreground">
                Notificaciones en tiempo real en tu dispositivo
              </p>
            </div>
            <Switch
              checked={settings.notifications.push}
              onCheckedChange={(checked) => handleNotificationChange('push', checked)}
              disabled={settingStates.push.isLoading}
            />
          </div>
        </div>
      </div>

      {/* Idioma */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Idioma</h3>
          {getSettingIcon('language')}
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Idioma de la aplicación</Label>
          <Select 
            value={settings.language} 
            onValueChange={handleLanguageChange}
            disabled={settingStates.language.isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona un idioma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">
                <div className="flex items-center gap-2">
                  <span>🇪🇸</span>
                  <span>Español</span>
                </div>
              </SelectItem>
              <SelectItem value="en">
                <div className="flex items-center gap-2">
                  <span>🇺🇸</span>
                  <span>English</span>
                </div>
              </SelectItem>
              <SelectItem value="pt">
                <div className="flex items-center gap-2">
                  <span>🇧🇷</span>
                  <span>Português</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}