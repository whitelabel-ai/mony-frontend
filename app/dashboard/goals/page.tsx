'use client';

import { useState, useEffect } from 'react';
import { Plus, Target, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SavingGoal, SavingGoalStats } from '@/types';
import { getSavingGoals, getSavingGoalStats } from '@/lib/api/saving-goals';
import { CreateGoalDialog } from '@/components/goals/create-goal-dialog';
import { GoalCard } from '@/components/goals/goal-card';
import { GoalStats } from '@/components/goals/goal-stats';
import { useToast } from '@/hooks/use-toast';

export default function GoalsPage() {
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [stats, setStats] = useState<SavingGoalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [goalsResponse, statsResponse] = await Promise.all([
        getSavingGoals(1, 50),
        getSavingGoalStats()
      ]);

      setGoals(goalsResponse.metas || []);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las metas de ahorro',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoalCreated = (newGoal: SavingGoal) => {
    setGoals(prev => [newGoal, ...prev]);
    setCreateDialogOpen(false);
    loadData(); // Recargar estadísticas
    toast({
      title: 'Meta creada',
      description: 'Tu nueva meta de ahorro ha sido creada exitosamente',
    });
  };

  const handleGoalUpdated = (updatedGoal: SavingGoal) => {
    setGoals(prev => prev.map(goal => 
      goal.id === updatedGoal.id ? updatedGoal : goal
    ));
    loadData(); // Recargar estadísticas
  };

  const handleGoalDeleted = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
    loadData(); // Recargar estadísticas
    toast({
      title: 'Meta eliminada',
      description: 'La meta de ahorro ha sido eliminada',
    });
  };

  const filteredGoals = goals.filter(goal => {
    switch (activeTab) {
      case 'active':
        return goal.estado === 'activa';
      case 'completed':
        return goal.estado === 'completada';
      case 'inactive':
        return goal.estado === 'inactiva';
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metas de Ahorro</h1>
          <p className="text-muted-foreground">
            Gestiona tus objetivos financieros y alcanza tus sueños
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Meta
        </Button>
      </div>

      {/* Estadísticas */}
      {stats && <GoalStats stats={stats} />}

      {/* Contenido principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            Todas ({goals.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            <Clock className="mr-2 h-4 w-4" />
            Activas ({goals.filter(g => g.estado === 'activa').length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle className="mr-2 h-4 w-4" />
            Completadas ({goals.filter(g => g.estado === 'completada').length})
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Inactivas ({goals.filter(g => g.estado === 'inactiva').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredGoals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {activeTab === 'all' 
                    ? 'No tienes metas de ahorro' 
                    : `No tienes metas ${activeTab === 'active' ? 'activas' : activeTab === 'completed' ? 'completadas' : 'inactivas'}`
                  }
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  {activeTab === 'all' 
                    ? 'Crea tu primera meta de ahorro para comenzar a alcanzar tus objetivos financieros'
                    : 'Cambia de pestaña para ver otras metas o crea una nueva'
                  }
                </p>
                {activeTab === 'all' && (
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Primera Meta
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onUpdate={handleGoalUpdated}
                  onDelete={handleGoalDeleted}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog para crear meta */}
      <CreateGoalDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onGoalCreated={handleGoalCreated}
      />
    </div>
  );
}