
"use client"; 

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/dashboard/ChartContainer";
import { TrendingUp, Users, CalendarCheck2, Percent, AlertTriangle, BarChart3, Filter as FunnelIcon } from "lucide-react"; // Renamed Filter to FunnelIcon for clarity
import { mockSessionsData } from '@/app/(app)/whatsapp-reminders/page'; 
import { WorkloadDistributionChart } from "@/components/charts/WorkloadDistributionChart";
import { WaitingListFunnel, type WaitingListFunnelData } from "@/components/charts/WaitingListFunnel"; // Import the funnel chart
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Session } from "@/types";
import { cacheService } from "@/services/cacheService";


export default function PerformancePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for WaitingListFunnel
  const mockWaitingListData: WaitingListFunnelData = {
    waiting: Math.floor(Math.random() * 20) + 10,    // e.g., 10-30
    contacted: Math.floor(Math.random() * 15) + 5,  // e.g., 5-20 (should be <= waiting)
    scheduled: Math.floor(Math.random() * 10) + 3,  // e.g., 3-13 (should be <= contacted)
    archived: Math.floor(Math.random() * 5) + 1,     // e.g., 1-6
  };
  // Ensure contacted <= waiting and scheduled <= contacted for mock data logic
  mockWaitingListData.contacted = Math.min(mockWaitingListData.contacted, mockWaitingListData.waiting);
  mockWaitingListData.scheduled = Math.min(mockWaitingListData.scheduled, mockWaitingListData.contacted);


  useEffect(() => {
    let isMounted = true;
    const loadSessions = async () => {
      setIsLoading(true);
      try {
        const cachedSessions = await cacheService.sessions.getList();
        if (isMounted && cachedSessions && cachedSessions.length > 0) {
          setSessions(cachedSessions);
        } else if (isMounted) {
          setSessions(mockSessionsData);
          await cacheService.sessions.setList(mockSessionsData);
        }
      } catch (error) {
        if (isMounted) setSessions(mockSessionsData); 
      }
      if (isMounted) setIsLoading(false);
    };
    loadSessions();
    return () => { isMounted = false; };
  }, []);


  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const noShowRate = totalSessions > 0 ? ((sessions.filter(s => s.status === 'no-show').length / totalSessions) * 100).toFixed(1) + '%' : '0%';
  
  const occupancyRate = `${Math.floor(Math.random() * 30) + 60}%`; 
  const avgWaitTime = `${Math.floor(Math.random() * 10) + 5} dias`; 

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
        <WaitingListFunnel data={mockWaitingListData} />
      </ChartContainer>
    </div>
  );
}
    