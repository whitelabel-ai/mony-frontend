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
  moneda?: string
  country_code?: string
  country?: string
  company_name?: string
  expiresAt: number
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

function writeCache(data: Omit<CachedData, 'expiresAt'>) {
  try {
    const payload: CachedData = { ...data, expiresAt: Date.now() + DAYS_365_MS }
    localStorage.setItem(LS_KEY, JSON.stringify(payload))
  } catch {}
}

// Detección básica de empresa según dominio del email
const PERSONAL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'icloud.com',
  'proton.me', 'protonmail.com', 'zoho.com', 'gmx.com'
])

function toTitleCase(s: string) {
  return s.replace(/[-_.]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

function deriveCompanyNameFromEmail(email?: string): string | undefined {
  if (!email) return undefined
  const parts = email.split('@')
  if (parts.length !== 2) return undefined
  const domain = parts[1].toLowerCase()
  if (PERSONAL_DOMAINS.has(domain)) return 'Persona'
  const labels = domain.split('.')
  if (labels.length < 2) return toTitleCase(domain)
  // Tomar el segundo nivel del dominio, p.ej. acme.com -> acme, foo.bar.co -> bar
  const sld = labels[labels.length - 2]
  return toTitleCase(sld)
}

// Mapeo básico de nombre de país desde código ISO
const COUNTRY_MAP: Record<string, string> = {
  CO: 'Colombia', MX: 'México', PE: 'Perú', CL: 'Chile', AR: 'Argentina', VE: 'Venezuela',
  US: 'Estados Unidos', ES: 'España', BR: 'Brasil', UY: 'Uruguay', PA: 'Panamá', EC: 'Ecuador',
}

function resolveCountryName(code?: string): string | undefined {
  if (!code) return undefined
  const c = code.toUpperCase()
  return COUNTRY_MAP[c] || c
}

/**
 * Componente cliente que intenta auto-completar el pre-chat de Chatwoot
 * usando datos de sesión. No renderiza UI.
 */
export default function ChatwootAutofill() {
  const { profile } = useUserProfile()
  const initializedRef = useRef(false)

  useEffect(() => {
    // Leer cache para comparar y decidir si actualizar
    const cached = readCache()

    // Solo continuar si tenemos perfil válido
    const name = profile?.nombreCompleto?.trim()
    const whatsapp = profile?.numeroWhatsapp?.trim()
    const email = profile?.email?.trim()
    const currency = profile?.moneda?.trim()
    const countryCode = profile?.pais?.trim()?.toUpperCase()
    const countryName = resolveCountryName(countryCode)
    const companyName = deriveCompanyNameFromEmail(email)
    const id = profile?.id?.toString()

    if (!id || !name || !whatsapp) return
    if (!isValidWhatsApp(whatsapp)) return

    const onReady = () => {
      try {
        const cw = (window as any).$chatwoot
        if (!cw || typeof cw.setUser !== 'function') return

        const applyUser = () => {
          cw.setUser(id, {
            name,
            email,
            phone_number: whatsapp,
          })

          if (typeof cw.setCustomAttributes === 'function') {
            const attrs: Record<string, any> = {}
            if (currency) attrs.moneda = currency
            if (countryCode) attrs.country_code = countryCode
            if (countryName) attrs.country = countryName
            if (companyName) attrs.company_name = companyName
            if (Object.keys(attrs).length) cw.setCustomAttributes(attrs)
          }

          writeCache({ id, name, whatsapp, email, moneda: currency, country_code: countryCode, country: countryName, company_name: companyName })

          // Abrir widget para que vea campos pre-rellenados
          if (typeof cw.toggle === 'function') {
            cw.toggle('open')
          }
        }

        // Decidir si resetear o solo actualizar según diferencias
        const idChanged = cached && cached.id !== id
        const phoneChanged = cached && cached.whatsapp !== whatsapp
        const nameChanged = cached && cached.name !== name
        const emailChanged = cached && cached.email !== email
        const countryChanged = cached && cached.country_code !== countryCode
        const companyChanged = cached && cached.company_name !== companyName

        if (idChanged) {
          // Nuevo identificador → mejor reset para evitar mezclar contactos
          if (typeof cw.reset === 'function') {
            cw.reset()
          }
          applyUser()
          return
        }

        if (!cached || phoneChanged || nameChanged || emailChanged || countryChanged || companyChanged) {
          // No hay cache o hay cambios relevantes → actualizar datos del contacto
          applyUser()
          return
        }

        // Cache coincide → no hacer nada
      } catch (e) {
        // Silencio errores para no romper la app
      }
    }

    // Evitar múltiples binds
    if (!initializedRef.current) {
      initializedRef.current = true
      if (typeof window !== 'undefined') {
        // Si ya está listo, ejecutar; de lo contrario, escuchar el evento
        if ((window as any).$chatwoot) {
          onReady()
        } else {
          window.addEventListener('chatwoot:ready', onReady, { once: true })
        }
      }
    }
  }, [profile])

  return null
}