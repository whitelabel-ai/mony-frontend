'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Target,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { AreaChart, ComparisonBarChart, AdvancedMetricCard, FinancialSummary } from './advanced-charts'
import { PieChart, LineChart } from './index'
import { Transaction } from '@/types'

interface AnalyticsDashboardProps {
  transactions: Transaction[]
  period: string
  className?: string
}

interface CategoryAnalysis {
  name: string
  amount: number
  count: number
  percentage: number
  trend: 'up' | 'down' | 'neutral'
}

interface MonthlyData {
  month: string
  income: number
  expenses: number
  net: number
}

export function AnalyticsDashboard({ transactions, period, className }: AnalyticsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('6m')
  const [activeTab, setActiveTab] = useState('overview')

  // Procesar datos de transacciones
  const analytics = useMemo(() => {
    const now = new Date()
    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.fechaTransaccion)
      const monthsBack = selectedPeriod === '1m' ? 1 : selectedPeriod === '3m' ? 3 : selectedPeriod === '6m' ? 6 : 12
      const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1)
      return transactionDate >= cutoffDate
    })

    // Calcular totales
    const totalIncome = filteredTransactions
      .filter(t => t.tipo === 'INGRESO')
      .reduce((sum, t) => sum + t.monto, 0)
    
    const totalExpenses = filteredTransactions
      .filter(t => t.tipo === 'GASTO')
      .reduce((sum, t) => sum + t.monto, 0)
    
    const netIncome = totalIncome - totalExpenses

    // Análisis por categorías
    const categoryMap = new Map<string, CategoryAnalysis>()
    
    filteredTransactions.forEach(transaction => {
      const categoryName = transaction.categoria?.nombre || 'Sin categoría'
      const existing = categoryMap.get(categoryName) || {
        name: categoryName,
        amount: 0,
        count: 0,
        percentage: 0,
        trend: 'neutral' as const
      }
      
      existing.amount += transaction.monto
      existing.count += 1
      categoryMap.set(categoryName, existing)
    })

    const categories = Array.from(categoryMap.values())
      .map(cat => ({
        ...cat,
        percentage: totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)

    // Datos mensuales para gráficos de tendencia
    const monthlyData: MonthlyData[] = []
    const monthsToShow = selectedPeriod === '1m' ? 1 : selectedPeriod === '3m' ? 3 : selectedPeriod === '6m' ? 6 : 12
    
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthTransactions = filteredTransactions.filter(t => {
        const tDate = new Date(t.fechaTransaccion)
        return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear()
      })
      
      const monthIncome = monthTransactions
        .filter(t => t.tipo === 'INGRESO')
        .reduce((sum, t) => sum + t.monto, 0)
      
      const monthExpenses = monthTransactions
        .filter(t => t.tipo === 'GASTO')
        .reduce((sum, t) => sum + t.monto, 0)
      
      monthlyData.push({
        month: date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
        income: monthIncome,
        expenses: monthExpenses,
        net: monthIncome - monthExpenses
      })
    }

    return {
      totalIncome,
      totalExpenses,
      netIncome,
      categories,
      monthlyData,
      transactionCount: filteredTransactions.length,
      avgTransactionAmount: filteredTransactions.length > 0 ? 
        filteredTransactions.reduce((sum, t) => sum + t.monto, 0) / filteredTransactions.length : 0
    }
  }, [transactions, selectedPeriod])

  // Datos para gráficos
  const trendData = {
    labels: analytics.monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Ingresos',
        data: analytics.monthlyData.map(d => d.income),
        borderColor: '#10b981',
        backgroundColor: '#10b98120'
      },
      {
        label: 'Gastos',
        data: analytics.monthlyData.map(d => d.expenses),
        borderColor: '#ef4444',
        backgroundColor: '#ef444420'
      }
    ]
  }

  const categoryData = {
    labels: analytics.categories.slice(0, 8).map(c => c.name),
    datasets: [{
      data: analytics.categories.slice(0, 8).map(c => c.amount),
      backgroundColor: [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
        '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
      ]
    }]
  }

  const comparisonData = {
    labels: analytics.monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Ingresos',
        data: analytics.monthlyData.map(d => d.income),
        backgroundColor: '#10b981'
      },
      {
        label: 'Gastos',
        data: analytics.monthlyData.map(d => d.expenses),
        backgroundColor: '#ef4444'
      }
    ]
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Panel de Análisis</h2>
          <p className="text-muted-foreground">Análisis detallado de tus finanzas</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 mes</SelectItem>
              <SelectItem value="3m">3 meses</SelectItem>
              <SelectItem value="6m">6 meses</SelectItem>
              <SelectItem value="12m">1 año</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resumen financiero */}
      <FinancialSummary
        totalIncome={analytics.totalIncome}
        totalExpenses={analytics.totalExpenses}
        netIncome={analytics.netIncome}
        period={selectedPeriod}
      />

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdvancedMetricCard
          title="Transacciones"
          value={analytics.transactionCount}
          format="number"
          period={selectedPeriod}
        />
        
        <AdvancedMetricCard
          title="Promedio por Transacción"
          value={analytics.avgTransactionAmount}
          format="currency"
          period={selectedPeriod}
        />
        
        <AdvancedMetricCard
          title="Tasa de Ahorro"
          value={analytics.totalIncome > 0 ? (analytics.netIncome / analytics.totalIncome) * 100 : 0}
          format="percentage"
          trend={analytics.netIncome > 0 ? 'up' : 'down'}
          target={20}
          period={selectedPeriod}
        />
        
        <AdvancedMetricCard
          title="Categorías Activas"
          value={analytics.categories.length}
          format="number"
          period={selectedPeriod}
        />
      </div>

      {/* Tabs para diferentes vistas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AreaChart
              title="Tendencia de Ingresos vs Gastos"
              description="Evolución mensual de tus finanzas"
              data={trendData}
            />
            
            <PieChart
              title="Distribución por Categorías"
              description="Gastos principales por categoría"
              data={categoryData}
              variant="doughnut"
            />
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            <ComparisonBarChart
              title="Comparación Mensual"
              description="Ingresos vs gastos por mes"
              data={comparisonData}
            />
            
            <LineChart
              title="Flujo de Efectivo Neto"
              description="Ingreso neto mensual (ingresos - gastos)"
              data={{
                labels: analytics.monthlyData.map(d => d.month),
                datasets: [{
                  label: 'Flujo Neto',
                  data: analytics.monthlyData.map(d => d.net),
                  borderColor: analytics.netIncome >= 0 ? '#10b981' : '#ef4444'
                }]
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Análisis por Categorías
              </CardTitle>
              <CardDescription>
                Desglose detallado de gastos por categoría
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.categories.slice(0, 10).map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: categoryData.datasets[0].backgroundColor[index] }}
                      />
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {category.count} transacciones
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold">${category.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {category.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  Logros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.netIncome > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Flujo de efectivo positivo</span>
                  </div>
                )}
                
                {analytics.categories.length >= 5 && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Buena diversificación de gastos</span>
                  </div>
                )}
                
                {analytics.transactionCount >= 20 && (
                  <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Usuario activo</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Recomendaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.netIncome < 0 && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Considera reducir gastos</span>
                  </div>
                )}
                
                {analytics.categories.length < 3 && (
                  <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Categoriza mejor tus gastos</span>
                  </div>
                )}
                
                {analytics.totalIncome > 0 && (analytics.netIncome / analytics.totalIncome) < 0.1 && (
                  <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                    <Target className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Mejora tu tasa de ahorro</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AnalyticsDashboard