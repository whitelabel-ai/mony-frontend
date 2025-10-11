'use client'

import { useEffect, useRef } from 'react'
import { useUserProfile } from '@/hooks/use-auth'
import { isValidWhatsApp } from '@/lib/utils'

// Persist simple cache for 365 days
const DAYS_365_MS = 365 * 24 * 60 * 60 * 1000
const LS_KEY = 'chatwoot_autofill_cache_v1'

type CachedData = {
  id: string
  name: string
  whatsapp: string
  email?: string
  expiresAt: number
}

function normalizeWhatsapp(input?: string): string | null {
  if (!input) return null
  const cleaned = input.replace(/[\s-().]/g, '')
  // Mantener '+' si existe, de lo contrario dejar tal cual
  const normalized = cleaned
  // Validar luego con isValidWhatsApp
  return normalized || null
}

function readCache(): CachedData | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as CachedData
    if (!data?.expiresAt || Date.now() > data.expiresAt) return null
    return data
  } catch {
    return null
  }
}

// Lee el cache independientemente del vencimiento para comparar el número previo
function readCacheAny(): CachedData | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as CachedData
    if (!data?.whatsapp) return null
    return data
  } catch {
    return null
  }
}

function writeCache(data: Omit<CachedData, 'expiresAt'>) {
  try {
    const payload: CachedData = { ...data, expiresAt: Date.now() + DAYS_365_MS }
    localStorage.setItem(LS_KEY, JSON.stringify(payload))
  } catch {}
}

function clearAllChatwootData() {
  try {
    // Limpiar nuestro cache
    localStorage.removeItem(LS_KEY)
    // Intentar limpiar posibles claves usadas por el widget
    const prefixes = ['cw_', 'chatwoot', '__cw']
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k) continue
      if (prefixes.some((p) => k.startsWith(p))) keys.push(k)
    }
    keys.forEach((k) => {
      try { localStorage.removeItem(k) } catch {}
    })
  } catch {}
}

/**
 * Componente cliente que intenta auto-completar el pre-chat de Chatwoot
 * usando datos de sesión. No renderiza UI.
 */
export default function ChatwootAutofill() {
  const { profile } = useUserProfile()
  const shouldResetRef = useRef(false)

  useEffect(() => {
    const cached = readCache()
    const cachedAny = readCacheAny()
    // Tomar datos actuales del perfil
    const name = profile?.nombreCompleto?.trim()
    const whatsappRaw = profile?.numeroWhatsapp?.trim()
    const whatsapp = normalizeWhatsapp(whatsappRaw)
    const email = profile?.email?.trim()
    const id = profile?.id?.toString()

    if (!id || !name || !whatsapp) return
    if (!isValidWhatsApp(whatsapp)) return

    // Si el número cambió respecto al que tengamos guardado (aún vencido), borrar nuestro cache
    if (cachedAny && normalizeWhatsapp(cachedAny.whatsapp) !== whatsapp) {
      try { localStorage.removeItem(LS_KEY) } catch {}
      // Reset para evitar que el widget asocie con conversación anterior
      shouldResetRef.current = true
    }

    const onReady = () => {
      try {
        const cw = (window as any).$chatwoot
        if (!cw || typeof cw.setUser !== 'function') return

        // Si marcamos reset por cambio de número, reiniciar el widget
        if (shouldResetRef.current && typeof cw.reset === 'function') {
          try { cw.reset() } catch {}
          shouldResetRef.current = false
        }

        // setUser: id único y datos estándar (usando número actualizado)
        cw.setUser(id, {
          name,
          email,
          phone_number: whatsapp,
        })

        // Persistir cache para futuras visitas
        writeCache({ id, name, whatsapp, email })

        // Intentar prefijar un mensaje inicial si el widget muestra pre-chat message
        // Nota: Chatwoot no expone API pública para setear "Message" del pre-chat.
        // Como fallback, podemos abrir el widget para que el usuario vea los campos ya rellenados.
        if (typeof cw.toggle === 'function') {
          cw.toggle('open')
        }
      } catch (e) {
        // Silencio errores para no romper la app
      }
    }

    if (typeof window !== 'undefined') {
      // Si ya está listo, ejecutar; de lo contrario, escuchar el evento y quitarlo después
      if ((window as any).$chatwoot) {
        onReady()
      } else {
        const handler = () => {
          onReady()
          window.removeEventListener('chatwoot:ready', handler)
        }
        window.addEventListener('chatwoot:ready', handler)
      }
    }
  }, [profile])

  return null
}