'use client';

import { Target, TrendingUp, CheckCircle, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SavingGoalStats } from '@/types';

interface GoalStatsProps {
  stats: SavingGoalStats;
}

export function GoalStats({ stats }: GoalStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalSaved = stats.totalAhorrado;
  const totalTarget = stats.totalObjetivo;

  const progressPercentage = totalTarget > 0 
    ? (totalSaved / totalTarget) * 100 
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total de Metas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Metas</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activas} activas, {stats.completadas} completadas
          </p>
        </CardContent>
      </Card>

      {/* Progreso General */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Progreso General</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{progressPercentage.toFixed(1)}%</div>
          <Progress value={progressPercentage} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Promedio de todas las metas
          </p>
        </CardContent>
      </Card>

      {/* Total Ahorrado */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Ahorrado</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalAhorrado)}</div>
          <p className="text-xs text-muted-foreground">
            De {formatCurrency(stats.totalObjetivo)} objetivo
          </p>
        </CardContent>
      </Card>

      {/* Metas Completadas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Metas Completadas</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completadas}</div>
          <p className="text-xs text-muted-foreground">
            {stats.total > 0 
              ? `${((stats.completadas / stats.total) * 100).toFixed(1)}% del total`
              : 'Sin metas aún'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
}