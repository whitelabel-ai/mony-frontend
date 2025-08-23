'use client'

import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

// Configuración base para todos los gráficos
const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
}

// Colores predefinidos
const colors = {
  primary: '#3b82f6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#06b6d4',
  secondary: '#6b7280',
}

const chartColors = [
  '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#06b6d4', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#6366f1', '#f43f5e'
]

interface ChartWrapperProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

function ChartWrapper({ title, description, children, className = '' }: ChartWrapperProps) {
  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

// Gráfico de líneas para tendencias temporales
interface LineChartProps {
  title: string
  description?: string
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      borderColor?: string
      backgroundColor?: string
    }[]
  }
  className?: string
}

export function LineChart({ title, description, data, className }: LineChartProps) {
  const chartData = {
    ...data,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      borderColor: dataset.borderColor || chartColors[index % chartColors.length],
      backgroundColor: dataset.backgroundColor || `${chartColors[index % chartColors.length]}20`,
      tension: 0.4,
      fill: false,
    }))
  }

  const options = {
    ...baseOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9',
        },
      },
      x: {
        grid: {
          color: '#f1f5f9',
        },
      },
    },
  }

  return (
    <ChartWrapper title={title} description={description} className={className}>
      <Line data={chartData} options={options} />
    </ChartWrapper>
  )
}

// Gráfico de barras para comparaciones
interface BarChartProps {
  title: string
  description?: string
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor?: string | string[]
      borderColor?: string | string[]
    }[]
  }
  className?: string
  horizontal?: boolean
}

export function BarChart({ title, description, data, className, horizontal = false }: BarChartProps) {
  const chartData = {
    ...data,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || chartColors.slice(0, data.labels.length),
      borderColor: dataset.borderColor || chartColors.slice(0, data.labels.length),
      borderWidth: 1,
    }))
  }

  const options = {
    ...baseOptions,
    indexAxis: horizontal ? 'y' as const : 'x' as const,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9',
        },
      },
      x: {
        grid: {
          color: '#f1f5f9',
        },
      },
    },
  }

  return (
    <ChartWrapper title={title} description={description} className={className}>
      <Bar data={chartData} options={options} />
    </ChartWrapper>
  )
}

// Gráfico de pastel para distribuciones
interface PieChartProps {
  title: string
  description?: string
  data: {
    labels: string[]
    datasets: {
      data: number[]
      backgroundColor?: string[]
      borderColor?: string[]
    }[]
  }
  className?: string
  variant?: 'pie' | 'doughnut'
}

export function PieChart({ title, description, data, className, variant = 'pie' }: PieChartProps) {
  const chartData = {
    ...data,
    datasets: data.datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || chartColors.slice(0, data.labels.length),
      borderColor: dataset.borderColor || chartColors.slice(0, data.labels.length),
      borderWidth: 2,
    }))
  }

  const options = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || ''
            const value = context.parsed
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${value.toLocaleString()} (${percentage}%)`
          }
        }
      }
    }
  }

  const ChartComponent = variant === 'doughnut' ? Doughnut : Pie

  return (
    <ChartWrapper title={title} description={description} className={className}>
      <ChartComponent data={chartData} options={options} />
    </ChartWrapper>
  )
}

// Componente de métricas rápidas
interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
    period: string
  }
  icon?: React.ReactNode
  className?: string
}

export function MetricCard({ title, value, change, icon, className }: MetricCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {change && (
              <p className={`text-xs ${
                change.type === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}% vs {change.period}
              </p>
            )}
          </div>
          {icon && (
            <div className="text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Exportar todos los componentes
export { ChartWrapper }

// Exportar componentes avanzados
export * from './advanced-charts'
export { default as AnalyticsDashboard } from './analytics-dashboard'