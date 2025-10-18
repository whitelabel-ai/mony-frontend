'use client'

import { useState } from 'react'
import { MoreHorizontal, Edit, Trash2, Copy, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency } from '@/lib/utils'
import { CategoryIcon } from '@/components/ui/category-icon'
import type { Categoria } from '@/types'

interface CategoryCardProps {
  category: Categoria
  spent?: number
  onEdit?: (category: Categoria) => void
  onDelete?: (category: Categoria) => void
  onDuplicate?: (category: Categoria) => void
  onToggleStatus?: (category: Categoria) => void
  className?: string
}

export function CategoryCard({
  category,
  spent = 0,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus,
  className
}: CategoryCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const budgetAmount = Number(category.presupuestoMensual) || 0
  const budgetUsagePercentage = budgetAmount 
    ? Math.min((spent / budgetAmount) * 100, 100)
    : 0

  const isOverBudget = budgetAmount && spent > budgetAmount

  const getBudgetColor = () => {
    if (!budgetAmount) return 'bg-gray-200'
    if (isOverBudget) return 'bg-red-500'
    if (budgetUsagePercentage > 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <Card className={`transition-all hover:shadow-md ${!category.activa ? 'opacity-60' : ''} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-medium text-white"
              style={{ backgroundColor: category.color }}
            >
              <CategoryIcon iconName={category.icono} className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{category.nombre}</h3>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={category.tipo === 'Ingreso' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {category.tipo}
                </Badge>
                {!category.activa && (
                  <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                    Inactiva
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(category)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate?.(category)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleStatus?.(category)}>
              {category.activa ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Desactivar
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Activar
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete?.(category)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-3">
        {category.descripcion && (
          <p className="text-sm text-muted-foreground">{category.descripcion}</p>
        )}

        {/* Solo mostrar presupuesto para categorías de gastos */}
        {category.tipo === 'Gasto' && budgetAmount > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Presupuesto mensual</span>
              <span className="font-medium">
                {formatCurrency(budgetAmount)}
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span>Gastado: {formatCurrency(spent)}</span>
                <span className={isOverBudget ? 'text-red-600' : 'text-muted-foreground'}>
                  {budgetUsagePercentage.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={budgetUsagePercentage} 
                className="h-2"
                indicatorClassName={getBudgetColor()}
              />
              {isOverBudget && (
                <p className="text-xs text-red-600">
                  Excedido por {formatCurrency(spent - budgetAmount)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Para categorías de ingreso, mostrar información diferente */}
        {category.tipo === 'Ingreso' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Categoría de ingresos</span>
              <span className="text-green-600 font-medium">
                +{formatCurrency(0)} {/* Aquí se podría mostrar el total de ingresos del mes */}
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Creada: {new Date(category.createdAt).toLocaleDateString()}</span>
          {category.updatedAt !== category.createdAt && (
            <span>Actualizada: {new Date(category.updatedAt).toLocaleDateString()}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}