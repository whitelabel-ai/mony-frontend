'use client'

import React, { useState, useEffect } from 'react'
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Filter,
  Download,
  Plus,
  Search,
  ChevronDown
} from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LineChart, BarChart, PieChart, MetricCard } from '@/components/charts'
import { TransactionModal } from '@/components/transactions/transaction-modal'
import { transactionsApi } from '@/lib/transactions-api'
import type { TransactionAnalytics, FilterTransactionsDto } from '@/types'
import { toast } from 'react-hot-toast'

export default function TransactionsDashboard() {
  const [analytics, setAnalytics] = useState<TransactionAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [filters, setFilters] = useState<FilterTransactionsDto>({
    fechaInicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    fechaFin: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  })

  // Cargar datos de análisis
  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const data = await transactionsApi.getAnalytics({
        fechaInicio: filters.fechaInicio,
        fechaFin: filters.fechaFin,
        agrupacion: 'dia'
      })
      setAnalytics(data)
    } catch (error) {
      console.error('Error al cargar análisis:', error)
      toast.error('Error al cargar los datos de análisis')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [filters.fechaInicio, filters.fechaFin])

  // Preparar datos para gráficos
  const prepareTimeSeriesData = () => {
    if (!analytics?.serieTemporal) return { labels: [], datasets: [] }

    const labels = analytics.serieTemporal.map(item => {
      // El backend devuelve periodo en formato 'yyyy-MM' para agrupación mensual
      // Intentamos parsearlo como fecha, si falla usamos el valor tal como viene
      try {
        if (item.periodo.includes('-') && item.periodo.length <= 7) {
          // Formato yyyy-MM, agregamos día 01 para crear fecha válida
          const date = new Date(item.periodo + '-01')
          return format(date, 'MMM yy', { locale: es })
        } else {
          return item.periodo
        }
      } catch {
        return item.periodo
      }
    })

    return {
      labels,
      datasets: [
        {
          label: 'Ingresos',
          data: analytics.serieTemporal.map(item => item.ingresos),
          borderColor: '#10b981',
          backgroundColor: '#10b98120'
        },
        {
          label: 'Gastos',
          data: analytics.serieTemporal.map(item => item.gastos),
          borderColor: '#ef4444',
          backgroundColor: '#ef444420'
        },
        {
          label: 'Balance',
          data: analytics.serieTemporal.map(item => item.balance),
          borderColor: '#3b82f6',
          backgroundColor: '#3b82f620'
        }
      ]
    }
  }

  const prepareCategoryData = () => {
    if (!analytics?.categorias) return { labels: [], datasets: [] }

    const ingresos = analytics.categorias.filter(cat => cat.tipo === 'Ingreso')
    const gastos = analytics.categorias.filter(cat => cat.tipo === 'Gasto')

    return {
      ingresos: {
        labels: ingresos.map(cat => cat.nombre),
        datasets: [{
          data: ingresos.map(cat => cat.montoTotal),
          backgroundColor: ['#10b981', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b']
        }]
      },
      gastos: {
        labels: gastos.map(cat => cat.nombre),
        datasets: [{
          data: gastos.map(cat => cat.montoTotal),
          backgroundColor: ['#ef4444', '#f97316', '#84cc16', '#6366f1', '#f43f5e']
        }]
      }
    }
  }

  const handleDateRangeChange = (range: string) => {
    const today = new Date()
    let fechaInicio: string
    let fechaFin: string

    switch (range) {
      case '7d':
        fechaInicio = format(subDays(today, 7), 'yyyy-MM-dd')
        fechaFin = format(today, 'yyyy-MM-dd')
        break
      case '30d':
        fechaInicio = format(subDays(today, 30), 'yyyy-MM-dd')
        fechaFin = format(today, 'yyyy-MM-dd')
        break
      case 'month':
        fechaInicio = format(startOfMonth(today), 'yyyy-MM-dd')
        fechaFin = format(endOfMonth(today), 'yyyy-MM-dd')
        break
      default:
        return
    }

    setFilters(prev => ({ ...prev, fechaInicio, fechaFin }))
  }

  const handleDownloadReport = async (formato: 'pdf' | 'excel') => {
    try {
      const blob = await transactionsApi.generatePdfReport({
        fechaInicio: filters.fechaInicio,
        fechaFin: filters.fechaFin,
        incluirGraficos: true,
        incluirDetalles: true,
        formato: formato
      })
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const extension = formato === 'pdf' ? 'pdf' : 'xlsx'
      a.download = `reporte-transacciones-${format(new Date(), 'yyyy-MM-dd')}.${extension}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success(`Reporte ${formato.toUpperCase()} descargado exitosamente`)
    } catch (error) {
      console.error('Error al descargar reporte:', error)
      toast.error('Error al generar el reporte')
    }
  }

  const handleModalSuccess = () => {
    loadAnalytics()
    setModalOpen(false)
    toast.success('Transacción creada exitosamente')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const timeSeriesData = prepareTimeSeriesData()
  const categoryData = prepareCategoryData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transacciones</h1>
          <p className="text-muted-foreground">
            Análisis detallado de tus ingresos y gastos
          </p>
        </div>
        <div className="flex gap-2">
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button variant="outline">
                 <Download className="h-4 w-4 mr-2" />
                 Descargar Reporte
                 <ChevronDown className="h-4 w-4 ml-2" />
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end">
               <DropdownMenuItem onClick={() => handleDownloadReport('pdf')}>
                 <Download className="h-4 w-4 mr-2" />
                 Reporte PDF
               </DropdownMenuItem>
               <DropdownMenuItem onClick={() => handleDownloadReport('excel')}>
                 <Download className="h-4 w-4 mr-2" />
                 Reporte Excel
               </DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
           <Link href="/dashboard/transactions/list">
             <Button variant="outline">
               <CreditCard className="h-4 w-4 mr-2" />
               Ver Todas
             </Button>
           </Link>
           <Button onClick={() => setModalOpen(true)}>
             <Plus className="h-4 w-4 mr-2" />
             Nueva Transacción
           </Button>
         </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDateRangeChange('7d')}
              >
                Últimos 7 días
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDateRangeChange('30d')}
              >
                Últimos 30 días
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDateRangeChange('month')}
              >
                Este mes
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                type="date"
                value={filters.fechaInicio}
                onChange={(e) => setFilters(prev => ({ ...prev, fechaInicio: e.target.value }))}
                className="w-auto"
              />
              <Input
                type="date"
                value={filters.fechaFin}
                onChange={(e) => setFilters(prev => ({ ...prev, fechaFin: e.target.value }))}
                className="w-auto"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas principales */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Ingresos"
            value={`$${analytics.resumen.totalIngresos.toLocaleString()}`}
            icon={<TrendingUp className="h-6 w-6 text-green-600" />}
          />
          <MetricCard
            title="Total Gastos"
            value={`$${analytics.resumen.totalGastos.toLocaleString()}`}
            icon={<TrendingDown className="h-6 w-6 text-red-600" />}
          />
          <MetricCard
            title="Balance Neto"
            value={`$${analytics.resumen.balanceNeto.toLocaleString()}`}
            icon={<DollarSign className="h-6 w-6 text-blue-600" />}
          />
          <MetricCard
            title="Total Transacciones"
            value={analytics.resumen.totalTransacciones}
            icon={<CreditCard className="h-6 w-6 text-purple-600" />}
          />
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencias temporales */}
        <LineChart
          title="Tendencias Temporales"
          description="Evolución de ingresos, gastos y balance a lo largo del tiempo"
          data={timeSeriesData}
          className="lg:col-span-2"
        />

        {/* Distribución por categorías - Ingresos */}
        {categoryData.ingresos && categoryData.ingresos.labels.length > 0 && (
          <PieChart
            title="Distribución de Ingresos"
            description="Ingresos por categoría"
            data={categoryData.ingresos}
            variant="doughnut"
          />
        )}

        {/* Distribución por categorías - Gastos */}
        {categoryData.gastos && categoryData.gastos.labels.length > 0 && (
          <PieChart
            title="Distribución de Gastos"
            description="Gastos por categoría"
            data={categoryData.gastos}
            variant="doughnut"
          />
        )}
      </div>

      {/* Tabla de categorías */}
      {analytics?.categorias && analytics.categorias.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen por Categorías</CardTitle>
            <CardDescription>
              Detalle de transacciones agrupadas por categoría
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Categoría</th>
                    <th className="text-left p-2">Tipo</th>
                    <th className="text-right p-2">Monto Total</th>
                    <th className="text-right p-2">Transacciones</th>
                    <th className="text-right p-2">% del Total</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.categorias.map((categoria, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{categoria.nombre}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          categoria.tipo === 'Ingreso' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {categoria.tipo}
                        </span>
                      </td>
                      <td className="p-2 text-right font-mono">
                        ${categoria.montoTotal.toLocaleString()}
                      </td>
                      <td className="p-2 text-right">
                        {categoria.cantidadTransacciones}
                      </td>
                      <td className="p-2 text-right">
                        {categoria.porcentajeDelTotal.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de transacción */}
       <TransactionModal
         isOpen={modalOpen}
         onClose={() => setModalOpen(false)}
         onSuccess={handleModalSuccess}
       />
    </div>
  )
}