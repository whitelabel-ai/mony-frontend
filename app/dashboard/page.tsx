'use client'

import { useEffect, useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  Calendar,
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { useUserProfile } from '@/hooks'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
} from '@/components/ui'
import { formatCurrency, formatDate, getGreeting } from '@/lib/utils'
import type { UserProfile } from '@/types'

/**
 * Página principal del dashboard
 */
export default function DashboardPage() {
  const { profile, loading, error, refreshProfile } = useUserProfile()
  const greeting = getGreeting()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground">Error al cargar el dashboard</h2>
          <p className="text-muted-foreground">{error || 'No se pudo cargar la información'}</p>
        </div>
        <Button onClick={refreshProfile}>Reintentar</Button>
      </div>
    )
  }

  const user = {
    id: profile.id,
    nombreCompleto: profile.nombreCompleto,
    email: profile.email,
    numeroWhatsapp: profile.numeroWhatsapp,
    moneda: profile.moneda,
    estadoSuscripcion: profile.estadoSuscripcion,
    fechaRegistro: profile.fechaRegistro
  }
  const estadisticas = profile.estadisticas
  const currency = profile.moneda

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          {greeting}, {user.nombreCompleto.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground">
          Aquí tienes un resumen de tus finanzas personales
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Balance del mes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance del Mes</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(estadisticas.balanceMes, currency)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {estadisticas.balanceMes >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500" />
              )}
              <span>
                {estadisticas.balanceMes >= 0 ? 'Superávit' : 'Déficit'} este mes
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Ingresos del mes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(estadisticas.ingresosMes, currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de ingresos en {new Date().toLocaleDateString('es-ES', { month: 'long' })}
            </p>
          </CardContent>
        </Card>

        {/* Gastos del mes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos del Mes</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(estadisticas.gastosMes, currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de gastos en {new Date().toLocaleDateString('es-ES', { month: 'long' })}
            </p>
          </CardContent>
        </Card>

        {/* Transacciones totales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.totalTransacciones}</div>
            <p className="text-xs text-muted-foreground">
              Transacciones registradas este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sección de acciones rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Agregar transacción */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-primary" />
              <span>Nueva Transacción</span>
            </CardTitle>
            <CardDescription>
              Registra un nuevo ingreso o gasto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              Agregar Transacción
            </Button>
          </CardContent>
        </Card>

        {/* Metas de ahorro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <span>Metas de Ahorro</span>
            </CardTitle>
            <CardDescription>
              {estadisticas.metasActivas} metas activas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Ver Metas
            </Button>
          </CardContent>
        </Card>

        {/* Suscripciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Suscripciones</span>
            </CardTitle>
            <CardDescription>
              {estadisticas.suscripcionesActivas} suscripciones activas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Gestionar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Resumen de metas y suscripciones */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Metas de ahorro recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Metas de Ahorro</CardTitle>
            <CardDescription>
              Progreso de tus objetivos financieros
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile.metasDeAhorro.length > 0 ? (
              <div className="space-y-4">
                {profile.metasDeAhorro.slice(0, 3).map((meta) => {
                  const progreso = (meta.montoActual / meta.montoObjetivo) * 100
                  return (
                    <div key={meta.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">{meta.nombre}</h4>
                        <span className="text-sm text-muted-foreground">
                          {progreso.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(progreso, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatCurrency(meta.montoActual, currency)}</span>
                        <span>{formatCurrency(meta.montoObjetivo, currency)}</span>
                      </div>
                    </div>
                  )
                })}
                {profile.metasDeAhorro.length > 3 && (
                  <Button variant="ghost" className="w-full mt-4">
                    Ver todas las metas
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No tienes metas de ahorro aún
                </p>
                <Button>Crear primera meta</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próximas suscripciones */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Pagos</CardTitle>
            <CardDescription>
              Suscripciones que vencen pronto
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile.suscripciones.length > 0 ? (
              <div className="space-y-4">
                {profile.suscripciones
                  .filter((sub) => sub.activa)
                  .slice(0, 3)
                  .map((suscripcion) => (
                    <div key={suscripcion.id} className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">{suscripcion.nombre}</h4>
                        <p className="text-xs text-muted-foreground">
                          Próximo pago: {formatDate(suscripcion.proximoPago)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(suscripcion.monto, currency)}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {suscripcion.frecuencia.toLowerCase()}
                        </p>
                      </div>
                    </div>
                  ))}
                {profile.suscripciones.filter((sub) => sub.activa).length > 3 && (
                  <Button variant="ghost" className="w-full mt-4">
                    Ver todas las suscripciones
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No tienes suscripciones registradas
                </p>
                <Button>Agregar suscripción</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}