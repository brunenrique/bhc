
"use client"; 

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/dashboard/ChartContainer";
import { TrendingUp, Users, CalendarCheck2, Percent, AlertTriangle, BarChart3 } from "lucide-react";
import { mockSessionsData } from '@/app/(app)/whatsapp-reminders/page'; // Using this as it has future sessions for mock
import { WorkloadDistributionChart } from "@/components/charts/WorkloadDistributionChart";
import { ChartPlaceholder } from "@/components/ui/dashboard/ChartPlaceholder";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Session } from "@/types";
import { cacheService } from "@/services/cacheService";


export default function PerformancePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadSessions = async () => {
      setIsLoading(true);
      try {
        const cachedSessions = await cacheService.sessions.getList();
        if (isMounted && cachedSessions && cachedSessions.length > 0) {
          setSessions(cachedSessions);
        } else if (isMounted) {
          // Fallback to mock data if cache is empty or fails
          setSessions(mockSessionsData);
          // Optionally, save mock data to cache if it wasn't there
          await cacheService.sessions.setList(mockSessionsData);
        }
      } catch (error) {
        // console.warn("Error loading sessions from cache:", error);
        if (isMounted) setSessions(mockSessionsData); // Fallback on error
      }
      if (isMounted) setIsLoading(false);
    };
    loadSessions();
    return () => { isMounted = false; };
  }, []);


  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const noShowRate = totalSessions > 0 ? ((sessions.filter(s => s.status === 'no-show').length / totalSessions) * 100).toFixed(1) + '%' : '0%';
  
  // Mock data for other KPIs
  const occupancyRate = `${Math.floor(Math.random() * 30) + 60}%`; // 60-90%
  const avgWaitTime = `${Math.floor(Math.random() * 10) + 5} dias`; // 5-15 dias

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-semibold">Desempenho da Clínica</h1>
      </div>
       <p className="text-muted-foreground font-body">
        Métricas e indicadores chave sobre o funcionamento da clínica. (Alguns dados são de exemplo)
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Sessões Concluídas (Total)</CardTitle>
            <CalendarCheck2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-3xl font-bold font-headline">{completedSessions}</div>}
            <p className="text-xs text-muted-foreground">Total de sessões finalizadas.</p>
          </CardContent>
        </Card>
         <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Taxa de Ocupação Média</CardTitle>
            <Users className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
             {/* Mocked value */}
            <div className="text-3xl font-bold font-headline">{occupancyRate}</div>
            <p className="text-xs text-muted-foreground">Média de horários preenchidos.</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Taxa de No-Show</CardTitle>
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
             {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-3xl font-bold font-headline">{noShowRate}</div>}
            <p className="text-xs text-muted-foreground">Percentual de faltas em sessões.</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Tempo Médio de Espera</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            {/* Mocked value */}
            <div className="text-3xl font-bold font-headline">{avgWaitTime}</div>
            <p className="text-xs text-muted-foreground">Da lista de espera para 1ª sessão.</p>
          </CardContent>
        </Card>
      </div>

      <ChartContainer 
        title="Distribuição de Carga de Trabalho (Sessões Concluídas)"
        description="Número de sessões concluídas por psicólogo(a) no período."
        className="shadow-lg"
      >
        {isLoading ? <Skeleton className="h-[350px] w-full" /> : <WorkloadDistributionChart sessions={sessions} />}
      </ChartContainer>

      <ChartContainer 
        title="Funil da Lista de Espera"
        description="Visualização das etapas da lista de espera até o agendamento."
        className="shadow-lg"
      >
        {/* Placeholder for WaitingListFunnelChart - to be implemented later */}
        <ChartPlaceholder message="Gráfico de Funil da Lista de Espera aparecerá aqui." icon="Filter" />
      </ChartContainer>
    </div>
  );
}
