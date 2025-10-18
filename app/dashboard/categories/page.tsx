'use client'

import { useState, useMemo, useEffect } from 'react'
import { Plus, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import {
  CategoryCard,
  CategoryStatsComponent,
  CategoryFormDialog,
  DeleteCategoryDialog,
  DuplicateCategoryDialog
} from '@/components/categories'
import { useCategories, useCategoryStats } from '@/hooks'
import type { Categoria, CreateCategoryDto, UpdateCategoryDto } from '@/types'

export default function CategoriesPage() {
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    duplicateCategory
  } = useCategories()

  const {
    stats,
    topCategories,
    loading: statsLoading
  } = useCategoryStats()

  // Estado para búsqueda
  const [searchTerm, setSearchTerm] = useState('')

  // Función para filtrar y ordenar categorías
  const getFilteredCategories = (tipo: 'Ingreso' | 'Gasto') => {
    return categories
      .filter(category => {
        const matchesType = category.tipo === tipo
        const matchesSearch = searchTerm === '' || 
          category.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesType && matchesSearch
      })
      .sort((a, b) => {
        // Primero las activas, luego las inactivas
        if (a.activa !== b.activa) {
          return a.activa ? -1 : 1
        }
        // Luego por nombre
        return a.nombre.localeCompare(b.nombre)
      })
  }

  // Categorías filtradas por tipo
  const incomeCategories = useMemo(() => getFilteredCategories('Ingreso'), [categories, searchTerm])
  const expenseCategories = useMemo(() => getFilteredCategories('Gasto'), [categories, searchTerm])

  // Estados para diálogos
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Categoria | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Limpiar estado cuando se cierran los modales
  useEffect(() => {
    if (!formDialogOpen) {
      // Usar setTimeout para asegurar que el modal se cierre completamente antes de limpiar el estado
      const timer = setTimeout(() => {
        setSelectedCategory(undefined)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [formDialogOpen])

  useEffect(() => {
    if (!deleteDialogOpen) {
      const timer = setTimeout(() => {
        setSelectedCategory(undefined)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [deleteDialogOpen])

  useEffect(() => {
    if (!duplicateDialogOpen) {
      const timer = setTimeout(() => {
        setSelectedCategory(undefined)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [duplicateDialogOpen])

  // Handlers para el formulario
  const handleCreateCategory = () => {
    setSelectedCategory(undefined)
    setFormDialogOpen(true)
  }

  const handleEditCategory = (category: Categoria) => {
    setSelectedCategory(category)
    setFormDialogOpen(true)
  }

  const handleFormSubmit = async (data: CreateCategoryDto | UpdateCategoryDto) => {
    setIsSubmitting(true)
    try {
      if (selectedCategory) {
        await updateCategory(selectedCategory.id, data as UpdateCategoryDto)
      } else {
        await createCategory(data as CreateCategoryDto)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handlers para eliminar
  const handleDeleteCategory = (category: Categoria) => {
    setSelectedCategory(category)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (selectedCategory) {
      setIsSubmitting(true)
      try {
        await deleteCategory(selectedCategory.id)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // Handlers para duplicar
  const handleDuplicateCategory = (category: Categoria) => {
    setSelectedCategory(category)
    setDuplicateDialogOpen(true)
  }

  const handleConfirmDuplicate = async (newName: string) => {
    if (selectedCategory) {
      setIsSubmitting(true)
      try {
        await duplicateCategory(selectedCategory.id, newName)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // Handler para cambiar estado
  const handleToggleStatus = async (category: Categoria) => {
    await toggleCategoryStatus(category.id)
  }

  // Obtener gastos por categoría para mostrar en las tarjetas
  const getCategorySpent = (categoryId: number) => {
    const stat = stats.find(s => s.id === categoryId)
    return stat?.gastosMes || 0
  }

  if (categoriesError) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error al cargar categorías</h1>
          <p className="text-muted-foreground">{categoriesError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Categorías</h1>
          <p className="text-muted-foreground">
            Organiza y controla tus ingresos y gastos por categorías
          </p>
        </div>
        <Button onClick={handleCreateCategory} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar categorías..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="gastos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gastos" className="gap-2">
            <TrendingDown className="h-4 w-4" />
            Gastos
          </TabsTrigger>
          <TabsTrigger value="ingresos" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Ingresos
          </TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="gastos" className="space-y-6">
          {/* Lista de categorías de gastos */}
          {categoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : expenseCategories.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? 'No se encontraron categorías de gastos' : 'No tienes categorías de gastos'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Intenta ajustar la búsqueda para encontrar lo que buscas.'
                  : 'Crea tu primera categoría de gastos para empezar a organizar tus transacciones.'
                }
              </p>
              {!searchTerm && (
                <Button onClick={handleCreateCategory} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Crear Categoría de Gastos
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {expenseCategories.length} categoría{expenseCategories.length !== 1 ? 's' : ''} de gastos
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expenseCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    spent={getCategorySpent(category.id)}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategory}
                    onDuplicate={handleDuplicateCategory}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ingresos" className="space-y-6">
          {/* Lista de categorías de ingresos */}
          {categoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : incomeCategories.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? 'No se encontraron categorías de ingresos' : 'No tienes categorías de ingresos'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Intenta ajustar la búsqueda para encontrar lo que buscas.'
                  : 'Crea tu primera categoría de ingresos para empezar a organizar tus transacciones.'
                }
              </p>
              {!searchTerm && (
                <Button onClick={handleCreateCategory} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Crear Categoría de Ingresos
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {incomeCategories.length} categoría{incomeCategories.length !== 1 ? 's' : ''} de ingresos
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {incomeCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    spent={0} // Los ingresos no tienen "gastado"
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategory}
                    onDuplicate={handleDuplicateCategory}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <CategoryStatsComponent
            stats={stats}
            topCategories={topCategories}
            loading={statsLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Diálogos */}
      <CategoryFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        category={selectedCategory}
        onSubmit={handleFormSubmit}
        isLoading={isSubmitting}
      />

      <DeleteCategoryDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        category={selectedCategory}
        onConfirm={handleConfirmDelete}
        isLoading={isSubmitting}
      />

      <DuplicateCategoryDialog
        open={duplicateDialogOpen}
        onOpenChange={setDuplicateDialogOpen}
        category={selectedCategory}
        onConfirm={handleConfirmDuplicate}
        isLoading={isSubmitting}
      />
    </div>
  )
}