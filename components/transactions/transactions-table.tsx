'use client'

import React, { useState, useEffect } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  Eye
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { DatePicker } from '@/components/ui/date-picker'
import { TransactionModal } from './transaction-modal'
import { transactionsApi } from '@/lib/transactions-api'
import type {
  Transaction,
  FilterTransactionsDto,
  PaginatedTransactionsResponse,
  Categoria
} from '@/types'
import { toast } from 'react-hot-toast'

interface TransactionsTableProps {
  onEdit?: (transaction: Transaction) => void
  onView?: (transaction: Transaction) => void
  refreshTrigger?: number
}

export function TransactionsTable({ onEdit, onView, refreshTrigger }: TransactionsTableProps) {
  const [transactions, setTransactions] = useState<PaginatedTransactionsResponse | null>(null)
  const [categories, setCategories] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [filters, setFilters] = useState<FilterTransactionsDto>({
    pagina: 1,
    limite: 10,
    ordenarPor: 'fechaTransaccion',
    direccion: 'desc'
  })

  // Cargar transacciones
  const loadTransactions = async () => {
    try {
      setLoading(true)
      const data = await transactionsApi.getTransactions(filters)
      setTransactions(data)
    } catch (error) {
      console.error('Error al cargar transacciones:', error)
      toast.error('Error al cargar las transacciones')
    } finally {
      setLoading(false)
    }
  }

  // Cargar categorías
  const loadCategories = async () => {
    try {
      const data = await transactionsApi.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Error al cargar categorías:', error)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [filters, refreshTrigger])

  useEffect(() => {
    loadCategories()
  }, [])

  // Manejar cambios en filtros
  const handleFilterChange = (key: keyof FilterTransactionsDto, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      pagina: key !== 'pagina' ? 1 : value // Reset página cuando cambian otros filtros
    }))
  }

  // Manejar ordenamiento
  const handleSort = (column: string) => {
    const newDirection = filters.ordenarPor === column && filters.direccion === 'asc' ? 'desc' : 'asc'
    setFilters(prev => ({
      ...prev,
      ordenarPor: column as any,
      direccion: newDirection,
      pagina: 1
    }))
  }

  // Manejar selección de transacciones
  const handleSelectTransaction = (id: string) => {
    setSelectedTransactions(prev => 
      prev.includes(id) 
        ? prev.filter(t => t !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (!transactions?.transacciones) return
    
    const allIds = transactions.transacciones.map(t => t.id)
    setSelectedTransactions(
      selectedTransactions.length === allIds.length ? [] : allIds
    )
  }

  // Funciones de manejo
  const handleView = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setModalMode('view')
    setModalOpen(true)
    onView?.(transaction)
  }

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setModalMode('edit')
    setModalOpen(true)
    onEdit?.(transaction)
  }

  const handleCreate = () => {
    setSelectedTransaction(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const handleDeleteAction = (transaction: Transaction) => {
    setTransactionToDelete(transaction)
    setDeleteDialogOpen(true)
  }

  const handleModalSuccess = () => {
    loadTransactions()
    setModalOpen(false)
  }

  // Eliminar transacción
  const handleDelete = async (id: string) => {
    try {
      await transactionsApi.deleteTransaction(id)
      toast.success('Transacción eliminada exitosamente')
      loadTransactions()
      setDeleteDialogOpen(false)
      setTransactionToDelete(null)
    } catch (error) {
      console.error('Error al eliminar transacción:', error)
      toast.error('Error al eliminar la transacción')
    }
  }

  // Eliminar múltiples transacciones
  const handleBulkDelete = async () => {
    try {
      await transactionsApi.deleteMultipleTransactions(selectedTransactions)
      toast.success(`${selectedTransactions.length} transacciones eliminadas exitosamente`)
      setSelectedTransactions([])
      loadTransactions()
    } catch (error) {
      console.error('Error al eliminar transacciones:', error)
      toast.error('Error al eliminar las transacciones')
    }
  }

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      pagina: 1,
      limite: 10,
      ordenarPor: 'fechaTransaccion',
      direccion: 'desc'
    })
  }

  const getSortIcon = (column: string) => {
    if (filters.ordenarPor !== column) return null
    return filters.direccion === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  const getTypeColor = (tipo: string) => {
    return tipo === 'Ingreso' 
      ? 'bg-green-100 text-green-800 hover:bg-green-200'
      : 'bg-red-100 text-red-800 hover:bg-red-200'
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtros y acciones */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Transacciones</CardTitle>
              <CardDescription>
                {transactions?.paginacion.totalElementos || 0} transacciones encontradas
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {selectedTransactions.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar ({selectedTransactions.length})
                </Button>
              )}
              <Button size="sm" onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Transacción
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar transacciones..."
                value={filters.busqueda || ''}
                onChange={(e) => handleFilterChange('busqueda', e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por tipo */}
            <Select
              value={filters.tipo || 'all'}
              onValueChange={(value) => handleFilterChange('tipo', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="Ingreso">Ingresos</SelectItem>
                <SelectItem value="Gasto">Gastos</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por categoría */}
            <Select
              value={filters.idCategoria || 'all'}
              onValueChange={(value) => handleFilterChange('idCategoria', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Elementos por página */}
            <Select
              value={filters.limite?.toString() || '10'}
              onValueChange={(value) => handleFilterChange('limite', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 por página</SelectItem>
                <SelectItem value="10">10 por página</SelectItem>
                <SelectItem value="25">25 por página</SelectItem>
                <SelectItem value="50">50 por página</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtros de fecha */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <DatePicker
              date={filters.fechaInicio ? new Date(filters.fechaInicio) : undefined}
              onDateChange={(date) => handleFilterChange('fechaInicio', date ? format(date, 'yyyy-MM-dd') : '')}
              placeholder="Fecha inicio"
              variant="transaction"
            />
            <DatePicker
              date={filters.fechaFin ? new Date(filters.fechaFin) : undefined}
              onDateChange={(date) => handleFilterChange('fechaFin', date ? format(date, 'yyyy-MM-dd') : '')}
              placeholder="Fecha fin"
              variant="transaction"
            />
            <Button variant="outline" onClick={clearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="p-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.length === transactions?.transacciones.length && transactions?.transacciones.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th 
                    className="p-4 text-left cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort('fechaTransaccion')}
                  >
                    <div className="flex items-center gap-2">
                      Fecha
                      {getSortIcon('fechaTransaccion')}
                    </div>
                  </th>
                  <th 
                    className="p-4 text-left cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort('descripcion')}
                  >
                    <div className="flex items-center gap-2">
                      Descripción
                      {getSortIcon('descripcion')}
                    </div>
                  </th>
                  <th className="p-4 text-left">Categoría</th>
                  <th className="p-4 text-left">Tipo</th>
                  <th 
                    className="p-4 text-right cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort('monto')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Monto
                      {getSortIcon('monto')}
                    </div>
                  </th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {transactions?.transacciones.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-muted/25">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(transaction.id)}
                        onChange={() => handleSelectTransaction(transaction.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {format(new Date(transaction.fechaTransaccion), 'dd/MM/yyyy', { locale: es })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(transaction.fechaTransaccion), 'HH:mm', { locale: es })}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{transaction.descripcion}</div>
                      {transaction.fuenteRegistro && (
                        <div className="text-xs text-muted-foreground">
                          {transaction.fuenteRegistro.nombre}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {transaction.categoria && (
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{transaction.categoria.icono}</span>
                          <span className="text-sm">{transaction.categoria.nombre}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge className={getTypeColor(transaction.tipo)}>
                        {transaction.tipo}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-mono font-medium">
                        {transaction.tipo === 'Ingreso' ? '+' : '-'}
                        ${transaction.monto.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {transaction.moneda}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(transaction)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAction(transaction)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {transactions?.paginacion && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Mostrando {((transactions.paginacion.paginaActual - 1) * transactions.paginacion.elementosPorPagina) + 1} a{' '}
                {Math.min(transactions.paginacion.paginaActual * transactions.paginacion.elementosPorPagina, transactions.paginacion.totalElementos)} de{' '}
                {transactions.paginacion.totalElementos} transacciones
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!transactions.paginacion.tieneAnterior}
                  onClick={() => handleFilterChange('pagina', transactions.paginacion.paginaActual - 1)}
                >
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {transactions.paginacion.paginaActual} de {transactions.paginacion.totalPaginas}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!transactions.paginacion.tieneSiguiente}
                  onClick={() => handleFilterChange('pagina', transactions.paginacion.paginaActual + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => transactionToDelete && handleDelete(transactionToDelete.id)}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de transacción */}
       <TransactionModal
         isOpen={modalOpen}
         onClose={() => setModalOpen(false)}
         mode={modalMode}
         transaction={selectedTransaction}
         onSuccess={handleModalSuccess}
       />
    </div>
  )
}