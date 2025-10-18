'use client'

import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { CategoryIcon } from '@/components/ui/category-icon'
import type { CategoryStats, TopCategory } from '@/types'

interface CategoryStatsProps {
  stats: CategoryStats[]
  topCategories: TopCategory[]
  loading?: boolean
}

export function CategoryStatsComponent({ stats, topCategories, loading = false }: CategoryStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const totalBudget = stats.reduce((sum, stat) => sum + (stat.presupuestoMensual || 0), 0)
  const totalSpent = stats.reduce((sum, stat) => sum + stat.gastosMes, 0)
  const totalIncome = stats.reduce((sum, stat) => sum + stat.ingresosMes, 0)
  const categoriesWithBudget = stats.filter(stat => stat.presupuestoMensual && stat.presupuestoMensual > 0)
  const overBudgetCategories = categoriesWithBudget.filter(stat => 
    stat.gastosMes > (stat.presupuestoMensual || 0)
  )

  const budgetUsagePercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presupuesto Total</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
            <p className="text-xs text-muted-foreground">
              {categoriesWithBudget.length} categoría{categoriesWithBudget.length !== 1 ? 's' : ''} con presupuesto
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastado</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalSpent)}</div>
            <p className="text-xs text-muted-foreground">
              {budgetUsagePercentage.toFixed(1)}% del presupuesto
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalIncome - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalIncome - totalSpent)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresos - Gastos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Uso del presupuesto */}
      {totalBudget > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Uso del Presupuesto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Progreso general</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
                </span>
              </div>
              <Progress 
                value={Math.min(budgetUsagePercentage, 100)} 
                className="h-3"
                indicatorClassName={budgetUsagePercentage > 100 ? 'bg-red-500' : budgetUsagePercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{budgetUsagePercentage.toFixed(1)}% utilizado</span>
                {budgetUsagePercentage > 100 && (
                  <span className="text-red-600">
                    Excedido por {formatCurrency(totalSpent - totalBudget)}
                  </span>
                )}
              </div>
            </div>

            {overBudgetCategories.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-red-600">
                  Categorías que exceden el presupuesto ({overBudgetCategories.length})
                </h4>
                <div className="space-y-1">
                  {overBudgetCategories.slice(0, 3).map((category) => (
                    <div key={category.id} className="flex justify-between items-center text-sm">
                      <span>{category.nombre}</span>
                      <Badge variant="destructive" className="text-xs">
                        +{formatCurrency(category.gastosMes - (category.presupuestoMensual || 0))}
                      </Badge>
                    </div>
                  ))}
                  {overBudgetCategories.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      Y {overBudgetCategories.length - 3} más...
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Top categorías */}
      {topCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Categorías con Mayor Gasto (Últimos 30 días)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCategories.map((category, index) => (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                      {index + 1}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span 
                        className="w-4 h-4 rounded-full flex items-center justify-center text-xs"
                        style={{ backgroundColor: category.color }}
                      >
                        <CategoryIcon iconName={category.icono} className="h-3 w-3 text-white" />
                      </span>
                      <span className="font-medium">{category.nombre}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(category.totalGastos)}</div>
                    <div className="text-xs text-muted-foreground">
                      {category.cantidadTransacciones} transacción{category.cantidadTransacciones !== 1 ? 'es' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}