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
  Filler,
} from 'chart.js'
import { Line, Bar, Scatter } from 'react-chartjs-2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Calendar, Target, BarChart3 } from 'lucide-react'

// Registrar componentes adicionales
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
)

// Paleta de colores mejorada
const advancedColors = {
  primary: {
    main: '#3b82f6',
    light: '#93c5fd',
    dark: '#1d4ed8',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
  },
  success: {
    main: '#10b981',
    light: '#6ee7b7',
    dark: '#047857',
    gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)'
  },
  danger: {
    main: '#ef4444',
    light: '#fca5a5',
    dark: '#dc2626',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
  },
  warning: {
    main: '#f59e0b',
    light: '#fcd34d',
    dark: '#d97706',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  }
}

// Gráfico de área con gradiente
interface AreaChartProps {
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

export function AreaChart({ title, description, data, className }: AreaChartProps) {
  const chartData = {
    ...data,
    datasets: data.datasets.map((dataset, index) => {
      const colors = Object.values(advancedColors)
      const color = colors[index % colors.length]
      
      return {
        ...dataset,
        borderColor: dataset.borderColor || color.main,
        backgroundColor: dataset.backgroundColor || `${color.main}20`,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: color.main,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    })
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9',
          drawBorder: false,
        },
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString()
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 8,
        }
      },
    },
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          {title}
        </CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}

// Gráfico de barras comparativo mejorado
interface ComparisonBarChartProps {
  title: string
  description?: string
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor?: string
    }[]
  }
  className?: string
  showComparison?: boolean
}

export function ComparisonBarChart({ title, description, data, className, showComparison = true }: ComparisonBarChartProps) {
  const chartData = {
    ...data,
    datasets: data.datasets.map((dataset, index) => {
      const colors = [advancedColors.primary.main, advancedColors.success.main, advancedColors.warning.main]
      
      return {
        ...dataset,
        backgroundColor: dataset.backgroundColor || colors[index % colors.length],
        borderRadius: 6,
        borderSkipped: false,
      }
    })
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9',
          drawBorder: false,
        },
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString()
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-green-500" />
          {title}
        </CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}

// Tarjeta de métricas avanzada con tendencias
interface AdvancedMetricCardProps {
  title: string
  value: number
  previousValue?: number
  format?: 'currency' | 'number' | 'percentage'
  trend?: 'up' | 'down' | 'neutral'
  target?: number
  period: string
  className?: string
}

export function AdvancedMetricCard({
  title,
  value,
  previousValue,
  format = 'currency',
  trend,
  target,
  period,
  className
}: AdvancedMetricCardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return `$${val.toLocaleString()}`
      case 'percentage':
        return `${val.toFixed(1)}%`
      default:
        return val.toLocaleString()
    }
  }

  const calculateChange = () => {
    if (!previousValue) return null
    const change = ((value - previousValue) / previousValue) * 100
    return {
      value: Math.abs(change),
      type: change >= 0 ? 'increase' : 'decrease'
    }
  }

  const change = calculateChange()
  const targetProgress = target ? (value / target) * 100 : null

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {trend && (
              <Badge variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'}>
                {trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                {trend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                {trend === 'neutral' && <DollarSign className="h-3 w-3 mr-1" />}
                {trend}
              </Badge>
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-3xl font-bold">{formatValue(value)}</p>
            
            {change && (
              <div className="flex items-center gap-2">
                <Badge 
                  variant={change.type === 'increase' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {change.type === 'increase' ? '+' : '-'}{change.value.toFixed(1)}%
                </Badge>
                <span className="text-xs text-muted-foreground">vs {period}</span>
              </div>
            )}
            
            {target && targetProgress && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Meta: {formatValue(target)}</span>
                  <span className={targetProgress >= 100 ? 'text-green-600' : 'text-orange-600'}>
                    {targetProgress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      targetProgress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(targetProgress, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Panel de resumen financiero
interface FinancialSummaryProps {
  totalIncome: number
  totalExpenses: number
  netIncome: number
  previousPeriodData?: {
    totalIncome: number
    totalExpenses: number
    netIncome: number
  }
  period: string
  className?: string
}

export function FinancialSummary({
  totalIncome,
  totalExpenses,
  netIncome,
  previousPeriodData,
  period,
  className
}: FinancialSummaryProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      <AdvancedMetricCard
        title="Ingresos Totales"
        value={totalIncome}
        previousValue={previousPeriodData?.totalIncome}
        format="currency"
        trend={totalIncome > (previousPeriodData?.totalIncome || 0) ? 'up' : 'down'}
        period={period}
      />
      
      <AdvancedMetricCard
        title="Gastos Totales"
        value={totalExpenses}
        previousValue={previousPeriodData?.totalExpenses}
        format="currency"
        trend={totalExpenses < (previousPeriodData?.totalExpenses || 0) ? 'up' : 'down'}
        period={period}
      />
      
      <AdvancedMetricCard
        title="Ingreso Neto"
        value={netIncome}
        previousValue={previousPeriodData?.netIncome}
        format="currency"
        trend={netIncome > (previousPeriodData?.netIncome || 0) ? 'up' : netIncome < (previousPeriodData?.netIncome || 0) ? 'down' : 'neutral'}
        period={period}
      />
    </div>
  )
}