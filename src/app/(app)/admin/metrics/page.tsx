
"use client";
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarClock, BarChartHorizontalBig, PieChart as PieChartIcon, AreaChart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cacheService } from '@/services/cacheService';

// Corrected import paths for charts
const SessionsCreatedPerWeekChart = dynamic(() => import('@/components/admin/metrics/SessionsCreatedPerWeekChart').then(mod => mod.SessionsCreatedPerWeekChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[350px] w-full" />
});
const SessionsPerPsychologistChart = dynamic(() => import('@/components/admin/metrics/SessionsPerPsychologistChart').then(mod => mod.SessionsPerPsychologistChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[350px] w-full" />
});

interface PlatformMetricsData {
  totalPatients: number | null;
  avgTimeBetweenSessions: string | null;
}

const mockPlatformMetricsData: PlatformMetricsData = {
  totalPatients: Math.floor(Math.random() * 150) + 50, 
  avgTimeBetweenSessions: `${(Math.random() * 10 + 5).toFixed(1)} dias`, 
};

export default function AdminMetricsPage() { // Renamed component for clarity
  const [metricsData, setMetricsData] = useState<PlatformMetricsData>({
    totalPatients: null,
    avgTimeBetweenSessions: null,
  });
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadMetricsSummary = async () => {
      setIsLoadingSummary(true);
      try {
        const cachedSummary = await cacheService.adminMetrics.getSummary();
        if (isMounted && cachedSummary) {
          setMetricsData(cachedSummary);
        }
      } catch (error) {
        // console.warn("Error loading platform metrics summary from cache:", error);
      }

      await new Promise(resolve => setTimeout(resolve, 1000)); 
      
      if (isMounted) {
        if (!metricsData.totalPatients) { 
            setMetricsData(mockPlatformMetricsData);
        }
        try {
          await cacheService.adminMetrics.setSummary(metricsData.totalPatients ? metricsData : mockPlatformMetricsData);
        } catch (error) {
          // console.warn("Error saving platform metrics summary to cache:", error);
        }
        setIsLoadingSummary(false);
      }
    };

    loadMetricsSummary();
    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <AreaChart className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-semibold">Métricas da Plataforma (Admin)</h1>
      </div>
      <p className="text-muted-foreground font-body">
        Visão geral do uso e desempenho da clínica. (Dados de exemplo)
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Total de Pacientes</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <Skeleton className="h-8 w-1/2" /> : <div className="text-3xl font-bold font-headline">{metricsData.totalPatients}</div>}
            <p className="text-xs text-muted-foreground">Pacientes cadastrados na plataforma.</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Tempo Médio Entre Sessões</CardTitle>
            <CalendarClock className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <Skeleton className="h-8 w-1/2" /> : <div className="text-3xl font-bold font-headline">{metricsData.avgTimeBetweenSessions}</div>}
            <p className="text-xs text-muted-foreground">Média por paciente ativo.</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <BarChartHorizontalBig className="mr-2 h-5 w-5 text-primary" />
              Sessões Criadas por Semana
            </CardTitle>
            <CardDescription>Volume de novas sessões nas últimas semanas.</CardDescription>
          </CardHeader>
          <CardContent>
            <SessionsCreatedPerWeekChart />
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <PieChartIcon className="mr-2 h-5 w-5 text-accent" />
              Sessões por Psicólogo(a)
            </CardTitle>
            <CardDescription>Distribuição de sessões entre os profissionais.</CardDescription>
          </CardHeader>
          <CardContent>
            <SessionsPerPsychologistChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
