'use client'

import { useEffect, useRef } from 'react'
import { useUserProfile } from '@/hooks/use-auth'
import { isValidWhatsApp } from '@/lib/utils'
import { COUNTRY } from '@/types'

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

function getCountryInfo(code?: string): { code: string; name: string } | null {
  if (!code) return null
  const up = code.toUpperCase()
  const found = COUNTRY.find((c) => c.code === up)
  if (found) return { code: found.code, name: found.name }
  try {
    const dn = new (Intl as any).DisplayNames(['es'], { type: 'region' })
    const name = dn?.of(up) || up
    return { code: up, name }
  } catch {
    return { code: up, name: up }
  }
}

const PERSONAL_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'icloud.com',
  'proton.me',
  'protonmail.com',
  'gmx.com',
  'yandex.com',
  'zoho.com',
  'aol.com',
  'mail.com',
])

function titleCase(input: string) {
  return input
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

function detectCompanyFromEmail(email?: string): string | null {
  if (!email) return null
  const parts = email.split('@')
  if (parts.length !== 2) return null
  const domain = parts[1].toLowerCase()
  if (PERSONAL_EMAIL_DOMAINS.has(domain)) return 'Persona'
  const labels = domain.split('.')
  if (labels.length < 2) return titleCase(domain)
  const secondLevel = labels[labels.length - 2]
  return titleCase(secondLevel)
}

function filterUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: Record<string, any> = {}
  Object.keys(obj).forEach((k) => {
    const v = (obj as any)[k]
    if (v !== undefined && v !== null && v !== '') out[k] = v
  })
  return out as Partial<T>
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
    const countryInfo = getCountryInfo(profile?.pais)
    const companyName = detectCompanyFromEmail(email)
    const moneda = profile?.moneda?.toUpperCase()
    const estadoSuscripcion = profile?.estadoSuscripcion
    const fechaRegistro = profile?.fechaRegistro

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

        // Construir atributos personalizados a enviar
        const customAttrs = filterUndefined({
          moneda,
          subscription_status: estadoSuscripcion,
          signup_date: fechaRegistro,
        })

        // setUser: id único y datos estándar + atributos personalizados
        cw.setUser(id, {
          name,
          email,
          phone_number: whatsapp,
          country_code: countryInfo?.code,
          country: countryInfo?.name,
          company_name: companyName,
          custom_attributes: customAttrs,
        })

        // Refuerza atributos en contacto
        if (typeof cw.setCustomAttributes === 'function') {
          try {
            cw.setCustomAttributes(customAttrs)
          } catch {}
        }

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